const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey);

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
  const {first_name,last_name,q1_answer,q2_answer, email, address,date_of_birth} = req.body;
  password = "TempPass123!"
  username = first_name[0] + last_name + date_of_birth.slice(5,7) + date_of_birth.slice(2, 4)
  username = username.toLowerCase()
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  const argon2 = require('argon2');
  const password_hash = await argon2.hash(password, { type: argon2.argon2id });
  const { data, error } = await supabase.from('users').insert([{
    first_name,
    last_name,
    username,
    q1_answer,
    q2_answer,
    email,
    address,
    role : 'user',
    password_hash,
    date_of_birth,
    account_status: false, 

  }]).select();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'User created successfully', user: data[0] });
});


const argon2 = require('argon2');

app.post('/Login', async (req, res) => {
  const { username, password } = req.body; // "username" holds the email exactly as typed
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/email and password are required.' });
  }

  const { data: user, error: fetchErr } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, role, password_hash, account_status, login_attempts')
    .eq('email', username)              // ← direct match, no normalization
    .maybeSingle();

  if (fetchErr || !user) {
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
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
