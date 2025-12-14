# Quick Fix for "Permission Denied" Error

## Error You're Seeing
```
Failed to create journal entry: permission denied for sequence journal_entries_journal_entry_id_seq
```

## Solution (3 Steps)

### Step 1: Run the SQL Script in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to the **SQL Editor** (left sidebar)
3. Copy and paste the entire contents of `fix-journal-entries-permissions.sql`
4. Click **Run** (or press Ctrl+Enter)

### Step 2: Restart Your Backend Server

```bash
# Stop the server if it's running (Ctrl+C)
cd /Users/connyn/Documents/GitHub/Ledgerify/backend
node server.js
```

### Step 3: Test the Form

1. Open your frontend application
2. Log in as a user (Manager or Accountant)
3. Navigate to Journal Entries
4. Click "Create New Entry"
5. Fill out the form with:
   - At least one debit line
   - At least one credit line
   - Make sure debits = credits
6. Submit

## What Was Fixed

### Backend Changes:
- ✅ Updated all endpoints to use `journal_entry_id` (primary key)
- ✅ POST `/journal-entries` - Creates entry + lines
- ✅ PUT `/journal-entries/:entryId/status` - Updates status
- ✅ GET `/journal-entries` - Fetches all entries

### Database Changes:
- ✅ Granted USAGE and SELECT permissions on sequences
- ✅ Granted ALL permissions on tables
- ✅ Set up Row Level Security policies
- ✅ Created proper foreign key relationships

### Frontend Changes:
- ✅ JournalEntryForm now calls the backend API
- ✅ Proper error handling and user feedback

## Verify It Works

You should see in the backend console:
```
Journal entry created successfully
```

And in your browser:
- Success alert message
- Form closes and returns to journal entries list
- New entry appears in the list

## Still Not Working?

Check these:

1. **Backend console errors** - Look for database connection issues
2. **Browser console errors** - Look for network errors (CORS, fetch failures)
3. **Supabase logs** - Check for policy violations or permission errors
4. **Account IDs** - Make sure the accounts you're selecting actually exist in `chart_of_accounts`

## Database Schema Reference

```sql
-- journal_entries table
journal_entry_id (SERIAL, PRIMARY KEY)
user_id (INTEGER, NOT NULL)
description (TEXT)
status (VARCHAR(50), default 'Pending Review')
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
rejection_reason (TEXT)

-- journal_lines table
id (SERIAL, PRIMARY KEY)
journal_entry_id (INTEGER, FOREIGN KEY)
account_id (VARCHAR(255), NOT NULL)
debit (DECIMAL(12,2), default 0)
credit (DECIMAL(12,2), default 0)
file_name (VARCHAR(255))
file_url (TEXT)
file_type (VARCHAR(100))
created_at (TIMESTAMP)
```

