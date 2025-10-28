const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const cors = require('cors');
const EventLogger = require('./eventLogger');
const UserEndpoint = require('./userEndpoint');
const ChartOfAccountsEndpoint = require('./chartOfAccountsEndpoint');
const JournalEntriesEndpoint = require('./journalEntriesEndpoint');

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

// User-related endpoints
app.get('/users', UserEndpoint.getUsers);
app.post('/CreateUser', UserEndpoint.createUser);
app.post('/Login', UserEndpoint.login);
app.post('/forgot-password/verify-user', UserEndpoint.forgotPasswordVerifyUser);
app.post('/forgot-password/verify-answers', UserEndpoint.forgotPasswordVerifyAnswers);
app.post('/forgot-password/reset', UserEndpoint.forgotPasswordReset);
app.put('/users/:identifier', UserEndpoint.updateUser);
app.delete('/users/:identifier', UserEndpoint.deleteUser);
app.post('/update-password-expires', UserEndpoint.updatePasswordExpires);

// Chart of Accounts endpoints
app.get('/chart-of-accounts/:userId', ChartOfAccountsEndpoint.getAccountsByUserId);
app.get('/chart-of-accounts', ChartOfAccountsEndpoint.getAllAccounts);
app.post('/CreateChartOfAccount', ChartOfAccountsEndpoint.createAccount);
app.put('/chart-of-accounts/:accountId', ChartOfAccountsEndpoint.updateAccount);
app.delete('/chart-of-accounts/:accountId', ChartOfAccountsEndpoint.deleteAccount);

// Journal Entries endpoints
app.post('/journal-entries', JournalEntriesEndpoint.createJournalEntry);
app.put('/journal-entries/:entryId/status', JournalEntriesEndpoint.updateJournalEntryStatus);
app.get('/journal-entries', JournalEntriesEndpoint.getJournalEntries);

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
    const { data, error } = await supabase
      .from('event_log')
      .select('*')
      .eq('table_name', 'chart_of_accounts')
      .eq('record_id', accountId) // record_id = account_id
      .order('event_time', { ascending: false });

    if (error) {
      console.error('Supabase error fetching event logs:', error);
      return res.status(500).json({ error: 'Failed to fetch event logs.' });
    }

    const parsedLogs = data.map(log => ({
      ...log,
      before_image: log.before_image ? JSON.parse(log.before_image) : null,
      after_image: log.after_image ? JSON.parse(log.after_image) : null
    }));

    return res.json({
      success: true,
      eventLogs: parsedLogs
    });

  } catch (err) {
    console.error('Unexpected error in /api/accounts/:accountId/event-logs:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

