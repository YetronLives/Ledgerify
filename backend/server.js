const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

const argon2 = require('argon2');

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey);

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use 'gmail', 'outlook', or configure custom SMTP
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD // Your email password or app-specific password
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
  const {first_name, last_name, question1, q1_answer, question2, q2_answer, email, address, date_of_birth, role} = req.body;
  const password = "TempPass123!"
  let username = first_name[0] + last_name + date_of_birth.slice(5,7) + date_of_birth.slice(2, 4)
  username = username.toLowerCase()
  const password_expires = new Date();
  console.log("Default Date: ", password_expires.toISOString())
  password_expires.setDate(password_expires.getDate() + 3);
  
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  const argon2 = require('argon2');
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
    account_status: true,

  }]).select();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'User created successfully', user: data[0] });
});

app.post('/Login', async (req, res) => {
  const { username, password } = req.body; // "username" holds the email exactly as typed
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/email and password are required.' });
  }

  const { data: user, error: fetchErr } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, role, password_hash, account_status, login_attempts, date_of_birth, address, username, q1_answer, q2_answer, password_expires')
    .eq('email', username)              // ← direct match, no normalization
    .maybeSingle();

  if (fetchErr || !user) {
    console.log('User fetch error or not found:', fetchErr);
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

    // Return user data for security questions (without sensitive info)
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

  // Basic password validation - just check minimum length
  if (newPassword.length < 6) {
    return res.status(400).json({ 
      error: 'Password must be at least 6 characters long.' 
    });
  }

  try {
    // Hash the new password
    const password_hash = await argon2.hash(newPassword, { type: argon2.argon2id });

    // Calculate new password expiration date (3 days from now)
    const password_expires = new Date();
    password_expires.setDate(password_expires.getDate() + 3);

    // Update the password in the database
    const { data, error } = await supabase
      .from('users')
      .update({ 
        password_hash: password_hash,
        password_expires: password_expires.toISOString(),
        login_attempts: 0  // Reset login attempts on password change
      })
      .eq('username', username.toLowerCase())
      .select('id, username, email');

    if (error) {
      return res.status(500).json({ error: 'Failed to update password.' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
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
  const { identifier } = req.params; // Can be username or email
  const { first_name, last_name, email, role, account_status, address, date_of_birth } = req.body;

  if (!identifier) {
    return res.status(400).json({ error: 'User identifier is required.' });
  }

  try {
    // Build the update object with only provided fields
    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (account_status !== undefined) updateData.account_status = account_status;
    if (address !== undefined) updateData.address = address;
    if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth;

    // First, try to find the user by username, then by email
    let { data: user, error: findError } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('username', identifier.toLowerCase())
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 is "not found"
      return res.status(500).json({ error: 'Database error while finding user.' });
    }

    // If not found by username, try by email
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

    // Update the user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select('id, username, email, first_name, last_name, role, account_status, address, date_of_birth, created_at, password_expires')
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update user: ' + updateError.message });
    }

    return res.json({ 
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json({ error: 'Server error occurred while updating user.' });
  }
});

// Delete User endpoint
app.delete('/users/:identifier', async (req, res) => {
  const { identifier } = req.params; // Can be username or email

  if (!identifier) {
    return res.status(400).json({ error: 'User identifier is required.' });
  }

  try {
    // First, try to find the user by username, then by email
    let { data: user, error: findError } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('username', identifier.toLowerCase())
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 is "not found"
      return res.status(500).json({ error: 'Database error while finding user.' });
    }

    // If not found by username, try by email
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

    // Delete the user
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (deleteError) {
      return res.status(500).json({ error: 'Failed to delete user: ' + deleteError.message });
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
    // Get all users who don't have password_expires set
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

    // Update each user with password_expires = created_at + 3 days
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
      .select('*')
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

// Create Chart of Account
app.post('/CreateChartOfAccount', async (req, res) => {
  const {user_id, account_name, account_number, account_description, normal_side, category, subcategory, initial_balance, order_number, statement, comment, is_active} = req.body;
  
  if (!account_name || !account_number || !category || !normal_side) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Calculate debit, credit, and balance based on normal_side
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
  res.status(201).json({ message: 'Chart of Account created successfully', account: data[0] });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
