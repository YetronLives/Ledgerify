const { createClient } = require('@supabase/supabase-js');
const argon2 = require('argon2');
const EventLogger = require('./eventLogger');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class UserEndpoint {
  static async getUser(id) {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    return data;
  }

  // Get users with optional role filtering
  static async getUsers(req, res) {
    const { role, roles } = req.query;

    let query = supabase.from('users').select('*');

    if (role) {
      query = query.eq('role', role);
    }
    else if (roles) {
      const roleList = roles.split(',').map(r => r.trim().toLowerCase());
      query = query.in('role', roleList);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Connected to Supabase!', users: data });
  }

  // Create new user
  static async createUser(req, res) {
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

    const logResult = await EventLogger.logUserCreation(data[0].id, data[0], data[0].id);
    if (!logResult.success) {
      console.error('Failed to log user creation event:', logResult.error);
    }

    res.status(201).json({ message: 'User created successfully', user: data[0] });
  }

  // User login
  static async login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username/email and password are required.' });
    }

    const { data: users, error: fetchErr } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, password_hash, account_status, login_attempts, date_of_birth, address, username, q1_answer, q2_answer, password_expires')
      .or(`username.eq.${username.toLowerCase()},email.eq.${username.toLowerCase()}`);

    if (fetchErr) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const user = users && users.length > 0 ? users[0] : null;

    if (!user) {
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
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    if (user.account_status === false) {
      return res.status(403).json({ error: 'Account inactive or suspended.' });
    }

    await supabase.from('users').update({ login_attempts: 0 }).eq('id', user.id);

    const { password_hash, login_attempts, ...safeUser } = user;
    return res.json({ message: 'Login successful', user: safeUser });
  }

  // Forgot Password - Step 1: Verify username and email
  static async forgotPasswordVerifyUser(req, res) {
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
  }

  // Forgot Password - Step 2: Verify security answers
  static async forgotPasswordVerifyAnswers(req, res) {
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
  }

  // Forgot Password - Step 3: Reset password
  static async forgotPasswordReset(req, res) {
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
  }

  // Update user
  static async updateUser(req, res) {
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
  }

  // Delete user
  static async deleteUser(req, res) {
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
  }

  // Update password expiration dates for existing users
  static async updatePasswordExpires(req, res) {
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
  }
}

module.exports = UserEndpoint;