const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const cors = require('cors');
const EventLogger = require('./eventLogger');

const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

app.use(cors());

const argon2 = require('argon2');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

app.get('/', (req, res) => {
  res.send('API is running!');
});

app.get('/ping', (req, res) => {
  res.json({ message: 'Server works' });
});

app.get('/users', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Connected to Supabase!', users: data });
});

app.post('/CreateUser', async (req, res) => {
  const { first_name, last_name, question1, q1_answer, question2, q2_answer, email, address, date_of_birth, role } = req.body;
  const password = "TempPass123!";
  let username = first_name[0] + last_name + date_of_birth.slice(5, 7) + date_of_birth.slice(2, 4);
  username = username.toLowerCase();
  const password_expires = new Date();
  password_expires.setDate(password_expires.getDate() + 3);

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  const password_hash = await argon2.hash(password, { type: argon2.argon2id });
  const { data, error } = await supabase.from('users').insert([{
    first_name,
    last_name,
    username,
    question1,
    q1_answer,
    question2,
    q2_answer,
    email,
    address,
    role: role || 'user',
    password_hash,
    date_of_birth,
    password_expires: password_expires.toISOString(),
    account_status: role === 'admin' ? true : false
  }]).select();

  if (error) return res.status(400).json({ error: error.message });

  console.log('Attempting to log user creation event...');
  const logResult = await EventLogger.logUserCreation(data[0].id, data[0], data[0].id);
  console.log('Log result:', logResult);
  if (!logResult.success) {
    console.error('Failed to log user creation event:', logResult.error);
  }

  res.status(201).json({ message: 'User created successfully', user: data[0] });
});

app.post('/Login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/email and password are required.' });
  }

  const { data: users, error: fetchErr } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, role, password_hash, account_status, login_attempts, date_of_birth, address, username, q1_answer, q2_answer, password_expires')
    .or(`username.eq.${username.toLowerCase()},email.eq.${username.toLowerCase()}`);

  if (fetchErr) {
    console.log('User fetch error:', fetchErr);
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const user = users && users.length > 0 ? users[0] : null;

  if (!user) {
    console.log('User not found for username/email:', username);
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const max_attempts = 3;
  if ((user.login_attempts || 0) >= max_attempts) {
    return res.status(403).json({ error: 'Maximum login attempts exceeded. Your account is temporarily locked.' });
  }

  if (!user.password_hash || typeof user.password_hash !== 'string') {
    return res.status(500).json({ error: 'Server error: password not set.' });
  }

  const valid = await argon2.verify(user.password_hash, password);
  if (!valid) {
    await supabase
      .from('users')
      .update({ login_attempts: (user.login_attempts || 0) + 1 })
      .eq('id', user.id);
    console.log('Invalid password attempt for user:', username);
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  if (user.account_status === false) {
    return res.status(403).json({ error: 'Account inactive or suspended.' });
  }

  await supabase.from('users').update({ login_attempts: 0 }).eq('id', user.id);

  const { password_hash, login_attempts, ...safeUser } = user;
  return res.json({ message: 'Login successful', user: safeUser });
});

// Forgot Password - Step 1: Verify username and email
app.post('/forgot-password/verify-user', async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required.' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, first_name, last_name, question1, q1_answer, question2, q2_answer, account_status')
      .eq('username', username.toLowerCase())
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Database error occurred.' });
    }

    if (!user) {
      console.log('User not found for username/email:', username, email);
      return res.status(404).json({ error: 'Invalid username or email.' });
    }

    if (user.account_status === false) {
      return res.status(403).json({ error: 'Account is inactive or suspended.' });
    }

    const { id, ...userData } = user;
    return res.json({
      message: 'User verified successfully',
      user: userData
    });

  } catch (err) {
    return res.status(500).json({ error: 'Server error occurred.' });
  }
});

// Forgot Password - Step 2: Verify security answers
app.post('/forgot-password/verify-answers', async (req, res) => {
  const { username, answer1, answer2 } = req.body;

  if (!username || !answer1 || !answer2) {
    return res.status(400).json({ error: 'Username and both security answers are required.' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, q1_answer, q2_answer, account_status')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Database error occurred.' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.account_status === false) {
      return res.status(403).json({ error: 'Account is inactive or suspended.' });
    }

    const answer1Match = user.q1_answer && answer1.toLowerCase().trim() === user.q1_answer.toLowerCase().trim();
    const answer2Match = user.q2_answer && answer2.toLowerCase().trim() === user.q2_answer.toLowerCase().trim();

    if (!answer1Match || !answer2Match) {
      return res.status(401).json({ error: 'One or more security answers are incorrect.' });
    }

    return res.json({
      message: 'Security answers verified successfully',
      verified: true
    });

  } catch (err) {
    return res.status(500).json({ error: 'Server error occurred.' });
  }
});

app.post('/forgot-password/reset', async (req, res) => {
  const { username, newPassword } = req.body;

  if (!username || !newPassword) {
    return res.status(400).json({ error: 'Username and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      error: 'Password must be at least 6 characters long.'
    });
  }

  try {
    const password_hash = await argon2.hash(newPassword, { type: argon2.argon2id });
    const password_expires = new Date();
    password_expires.setDate(password_expires.getDate() + 3);

    const { data: beforeData, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase())
      .single();

    if (fetchError) {
      return res.status(500).json({ error: 'Failed to fetch user data.' });
    }
    const { data, error } = await supabase
      .from('users')
      .update({
        password_hash: password_hash,
        password_expires: password_expires.toISOString(),
        login_attempts: 0
      })
      .eq('username', username.toLowerCase())
      .select('*');

    if (error) {
      return res.status(500).json({ error: 'Failed to update password.' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const logResult = await EventLogger.logUserUpdate(
      data[0].id,
      beforeData,
      data[0],
      data[0].id
    );
    if (!logResult.success) {
      console.error('Failed to log password reset event:', logResult.error);
    }

    return res.json({
      message: 'Password reset successfully',
      success: true
    });

  } catch (err) {
    return res.status(500).json({ error: 'Server error occurred while resetting password.' });
  }
});

// Update User endpoint
app.put('/users/:identifier', async (req, res) => {
  const { identifier } = req.params;
  const { first_name, last_name, email, role, account_status, address, date_of_birth } = req.body;

  if (!identifier) {
    return res.status(400).json({ error: 'User identifier is required.' });
  }

  try {
    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (account_status !== undefined) updateData.account_status = account_status;
    if (address !== undefined) updateData.address = address;
    if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth;

    let { data: user, error: findError } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('username', identifier.toLowerCase())
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Database error while finding user.' });
    }

    if (!user) {
      const { data: userByEmail, error: findEmailError } = await supabase
        .from('users')
        .select('id, username, email')
        .eq('email', identifier)
        .maybeSingle();

      if (findEmailError && findEmailError.code !== 'PGRST116') {
        return res.status(500).json({ error: 'Database error while finding user.' });
      }

      user = userByEmail;
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { data: beforeData, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      return res.status(500).json({ error: 'Failed to fetch user data before update.' });
    }
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select('*')
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update user: ' + updateError.message });
    }

    const logResult = await EventLogger.logUserUpdate(
      updatedUser.id,
      beforeData,
      updatedUser,
      updatedUser.id
    );
    if (!logResult.success) {
      console.error('Failed to log user update event:', logResult.error);
    }
    const { password_hash, ...safeUser } = updatedUser;

    return res.json({
      message: 'User updated successfully',
      user: safeUser
    });

  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json({ error: 'Server error occurred while updating user.' });
  }
});

// Delete User endpoint
app.delete('/users/:identifier', async (req, res) => {
  const { identifier } = req.params;

  if (!identifier) {
    return res.status(400).json({ error: 'User identifier is required.' });
  }

  try {
    let { data: user, error: findError } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('username', identifier.toLowerCase())
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Database error while finding user.' });
    }

    if (!user) {
      const { data: userByEmail, error: findEmailError } = await supabase
        .from('users')
        .select('id, username, email')
        .eq('email', identifier)
        .maybeSingle();

      if (findEmailError && findEmailError.code !== 'PGRST116') {
        return res.status(500).json({ error: 'Database error while finding user.' });
      }

      user = userByEmail;
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { data: beforeData, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      return res.status(500).json({ error: 'Failed to fetch user data before deletion.' });
    }
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (deleteError) {
      return res.status(500).json({ error: 'Failed to delete user: ' + deleteError.message });
    }

    const logResult = await EventLogger.logUserDeletion(
      user.id,
      beforeData,
      user.id
    );
    if (!logResult.success) {
      console.error('Failed to log user deletion event:', logResult.error);
    }

    return res.json({
      message: 'User deleted successfully',
      username: user.username
    });

  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ error: 'Server error occurred while deleting user.' });
  }
});

// Endpoint to update existing users with password expiration dates
app.post('/update-password-expires', async (req, res) => {
  try {
    const { data: usersWithoutExpires, error: fetchError } = await supabase
      .from('users')
      .select('id, created_at, password_expires')
      .is('password_expires', null);

    if (fetchError) {
      return res.status(500).json({ error: 'Failed to fetch users: ' + fetchError.message });
    }

    if (!usersWithoutExpires || usersWithoutExpires.length === 0) {
      return res.json({ message: 'All users already have password expiration dates set.', updated: 0 });
    }

    let updatedCount = 0;

    for (const user of usersWithoutExpires) {
      const createdAt = new Date(user.created_at);
      const passwordExpires = new Date(createdAt);
      passwordExpires.setDate(passwordExpires.getDate() + 3);

      const { error: updateError } = await supabase
        .from('users')
        .update({ password_expires: passwordExpires.toISOString() })
        .eq('id', user.id);

      if (!updateError) {
        updatedCount++;
      } else {
        console.error(`Failed to update user ${user.id}:`, updateError);
      }
    }

    return res.json({
      message: `Successfully updated ${updatedCount} users with password expiration dates.`,
      updated: updatedCount,
      total: usersWithoutExpires.length
    });

  } catch (err) {
    console.error('Update password expires error:', err);
    return res.status(500).json({ error: 'Server error occurred while updating password expiration dates.' });
  }
});

// Send Email endpoint
app.post('/send-email', async (req, res) => {
  const { to, subject, body, senderName } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Recipient email, subject, and body are required.' });
  }

  try {
    const mailOptions = {
      from: `"${senderName || 'Ledgerify'}" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: body,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
               <p style="white-space: pre-wrap;">${body.replace(/\n/g, '<br>')}</p>
             </div>`
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);
    return res.json({
      message: 'Email sent successfully',
      messageId: info.messageId
    });

  } catch (err) {
    console.error('Error sending email:', err);
    return res.status(500).json({
      error: 'Failed to send email: ' + err.message
    });
  }
});

// Get Chart of Accounts by User ID
app.get('/chart-of-accounts/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('account_id, account_number, account_name, account_description, normal_side, category, subcategory, initial_balance, debit, credit, balance, order_number, statement, comment, created_at, user_id, is_active')
      .eq('user_id', userId)
      .order('account_number', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({
      message: 'Accounts fetched successfully',
      accounts: data || [],
      count: data ? data.length : 0
    });
  } catch (err) {
    console.error('Error fetching accounts:', err);
    return res.status(500).json({ error: 'Server error occurred while fetching accounts.' });
  }
});

// No ID required
app.get('/chart-of-accounts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('account_id, account_number, account_name, account_description, normal_side, category, subcategory, initial_balance, debit, credit, balance, order_number, statement, comment, created_at, user_id, is_active')
      .order('account_number', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({
      message: 'Accounts fetched successfully',
      accounts: data || [],
      count: data ? data.length : 0
    });
  } catch (err) {
    console.error('Error fetching accounts:', err);
    return res.status(500).json({ error: 'Server error occurred while fetching accounts.' });
  }
});

// Create Chart of Account
app.post('/CreateChartOfAccount', async (req, res) => {
  const { user_id, account_name, account_number, account_description, normal_side, category, subcategory, initial_balance, order_number, statement, comment, is_active } = req.body;

  if (!account_name || !account_number || !category || !normal_side) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const { data: existingAccounts, error: checkError } = await supabase
    .from('chart_of_accounts')
    .select('account_number, account_name')
    .eq('user_id', user_id)
    .or(`account_number.eq.${account_number},account_name.eq.${account_name}`);

  if (checkError) {
    return res.status(500).json({ error: 'Error checking for duplicates: ' + checkError.message });
  }

  if (existingAccounts && existingAccounts.length > 0) {
    const duplicateNumber = existingAccounts.find(acc => acc.account_number === account_number);
    const duplicateName = existingAccounts.find(acc => acc.account_name === account_name);

    if (duplicateNumber && duplicateName) {
      return res.status(409).json({ error: `Account number ${account_number} and account name "${account_name}" already exist. Please use different values.` });
    } else if (duplicateNumber) {
      return res.status(409).json({ error: `Account number ${account_number} already exists. Please use a different account number.` });
    } else if (duplicateName) {
      return res.status(409).json({ error: `Account name "${account_name}" already exists. Please use a different account name.` });
    }
  }

  let debit = 0;
  let credit = 0;
  let balance = 0;

  if (normal_side === "debit") {
    debit = initial_balance || 0;
    credit = 0;
    balance = initial_balance || 0;
  } else if (normal_side === "credit") {
    credit = initial_balance || 0;
    debit = 0;
    balance = -(initial_balance || 0);
  } else {
    return res.status(400).json({ error: 'Invalid normal_side value. Must be "debit" or "credit".' });
  }

  const { data, error } = await supabase.from('chart_of_accounts').insert([{
    user_id,
    account_name,
    account_number,
    account_description,
    normal_side,
    category,
    subcategory,
    initial_balance: initial_balance || 0,
    debit,
    credit,
    balance,
    order_number,
    statement,
    comment,
    is_active: is_active !== undefined ? is_active : true,
  }]).select();

  if (error) return res.status(400).json({ error: error.message });

  // ✅ FIXED: Use account_id for logging
  const logResult = await EventLogger.logAccountCreation(data[0].account_id, data[0], user_id);
  if (!logResult.success) {
    console.error('Failed to log account creation event:', logResult.error);
  }

  res.status(201).json({ message: 'Chart of Account created successfully', account: data[0] });
});

// ✅ FIXED: Use account_id in WHERE clause
app.put('/chart-of-accounts/:accountId', async (req, res) => {
  const { accountId } = req.params;
  const { 
    account_name, 
    account_number, 
    account_description, 
    normal_side, 
    category, 
    subcategory, 
    initial_balance, 
    order_number, 
    statement, 
    comment, 
    is_active,
    addedDate  // ✅ FIXED: addedDate now defined
  } = req.body;

  if (!accountId) {
    return res.status(400).json({ error: 'Account ID is required.' });
  }

  try {
    const { data: beforeData, error: fetchError } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('account_id', accountId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const updateData = {};
    if (account_name !== undefined) updateData.account_name = account_name;
    if (account_number !== undefined) updateData.account_number = account_number;
    if (account_description !== undefined) updateData.account_description = account_description;
    if (normal_side !== undefined) updateData.normal_side = normal_side;
    if (category !== undefined) updateData.category = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (initial_balance !== undefined) updateData.initial_balance = initial_balance;
    if (order_number !== undefined) updateData.order_number = order_number;
    if (statement !== undefined) updateData.statement = statement;
    if (comment !== undefined) updateData.comment = comment;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    // ✅ Handle addedDate
    if (addedDate !== undefined) {
      updateData.created_at = addedDate;
    }

    // ✅ Safety checks for beforeData
    if (normal_side !== undefined || initial_balance !== undefined) {
      const newNormalSide = normal_side !== undefined ? normal_side : (beforeData?.normal_side || 'debit');
      const newInitialBalance = initial_balance !== undefined ? initial_balance : (beforeData?.initial_balance || 0);

      if (newNormalSide === "debit") {
        updateData.debit = newInitialBalance;
        updateData.credit = 0;
        updateData.balance = newInitialBalance;
      } else if (newNormalSide === "credit") {
        updateData.credit = newInitialBalance;
        updateData.debit = 0;
        updateData.balance = -newInitialBalance;
      }
    }

    const { data: updatedAccount, error: updateError } = await supabase
      .from('chart_of_accounts')
      .update(updateData)
      .eq('account_id', accountId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError); // 🔍 DEBUG
      return res.status(500).json({ error: 'Failed to update account: ' + updateError.message });
    }

    const logResult = await EventLogger.logAccountUpdate(
      accountId,
      beforeData,
      updatedAccount,
      beforeData.user_id
    );
    if (!logResult.success) {
      console.error('Log update failed:', logResult.error);
    }

    return res.json({
      message: 'Account updated successfully',
      account: updatedAccount
    });

  } catch (err) {
    console.error('Update account error:', err); // 🔍 THIS IS YOUR CLUE
    return res.status(500).json({ error: 'Server error occurred while updating account.' });
  }
});

// ✅ FIXED: Delete by account_id
app.delete('/chart-of-accounts/:accountId', async (req, res) => {
  const { accountId } = req.params;

  if (!accountId) {
    return res.status(400).json({ error: 'Account ID is required.' });
  }

  try {
    // ✅ Query by account_id
    const { data: beforeData, error: fetchError } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('account_id', accountId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    // ✅ Delete by account_id
    const { error: deleteError } = await supabase
      .from('chart_of_accounts')
      .delete()
      .eq('account_id', accountId);

    if (deleteError) {
      return res.status(500).json({ error: 'Failed to delete account: ' + deleteError.message });
    }

    const logResult = await EventLogger.logAccountDeletion(
      accountId,
      beforeData,
      beforeData.user_id
    );
    if (!logResult.success) {
      console.error('Failed to log account deletion event:', logResult.error);
    }

    return res.json({
      message: 'Account deleted successfully',
      account_name: beforeData.account_name
    });

  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ error: 'Server error occurred while deleting account.' });
  }
});

// Get Event Logs for a specific user
app.get('/event-logs/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { limit = 100, offset = 0 } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const result = await EventLogger.getUserEventLogs(parseInt(userId), parseInt(limit), parseInt(offset));

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    return res.json({
      message: 'Event logs fetched successfully',
      logs: result.data,
      count: result.data.length
    });

  } catch (err) {
    console.error('Get event logs error:', err);
    return res.status(500).json({ error: 'Server error occurred while fetching event logs.' });
  }
});

// Get Event Logs for a specific table
app.get('/event-logs/table/:tableName', async (req, res) => {
  const { tableName } = req.params;
  const { limit = 100, offset = 0 } = req.query;

  if (!tableName) {
    return res.status(400).json({ error: 'Table name is required.' });
  }

  try {
    const result = await EventLogger.getTableEventLogs(tableName, parseInt(limit), parseInt(offset));

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    return res.json({
      message: 'Event logs fetched successfully',
      logs: result.data,
      count: result.data.length
    });

  } catch (err) {
    console.error('Get event logs error:', err);
    return res.status(500).json({ error: 'Server error occurred while fetching event logs.' });
  }
});

// Get All Event Logs
app.get('/event-logs/all', async (req, res) => {
  const { limit = 100, offset = 0 } = req.query;

  try {
    const result = await EventLogger.getAllEventLogs(parseInt(limit), parseInt(offset));

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    return res.json({
      message: 'All event logs fetched successfully',
      logs: result.data,
      count: result.data.length,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (err) {
    console.error('Get all event logs error:', err);
    return res.status(500).json({ error: 'Server error occurred while fetching all event logs.' });
  }
});

// Get Event Logs for a specific Chart of Accounts record (by account_id)
app.get('/api/accounts/:accountId/event-logs', async (req, res) => {
  const { accountId } = req.params;

  if (!accountId) {
    return res.status(400).json({ error: 'Account ID is required.' });
  }

  try {
    // Fetch logs
    const { data: logs, error } = await supabase
      .from('event_log')
      .select('*')
      .eq('table_name', 'chart_of_accounts')
      .eq('record_id', accountId)
      .order('event_time', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch event logs.' });
    }

    // Extract unique user IDs
    const userIds = [...new Set(logs.map(log => log.user_id))];

    // Fetch user roles
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .in('id', userIds);

    if (userError) {
      console.error('Error fetching user roles:', userError);
    }

    // Create user role map
    const userRoleMap = {};
    (users || []).forEach(user => {
      userRoleMap[user.id] = user.role;
    });

    // Enrich logs with user roles and parsed images
    const enrichedLogs = logs.map(log => ({
      ...log,
      before_image: log.before_image ? JSON.parse(log.before_image) : null,
      after_image: log.after_image ? JSON.parse(log.after_image) : null,
      user_role: userRoleMap[log.user_id] || 'Unknown'
    }));

    return res.json({
      success: true,
      eventLogs: enrichedLogs
    });

  } catch (err) {
    console.error('Error in event logs route:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});