# Journal Entries API Testing Guide

## Prerequisites
1. Backend server running on `http://localhost:5000`
2. Supabase tables created:
   - `journal_entries` (columns: id, user_id, description, status, created_at, updated_at, rejection_reason)
   - `journal_lines` (columns: id, journal_entry_id, account_id, debit, credit, file_name, file_url, file_type, created_at)

## Test 1: Create Journal Entry

**Endpoint:** `POST http://localhost:5000/journal-entries`

**Request Body:**
```json
{
  "user_id": 1,
  "description": "Test journal entry",
  "debits": [
    { "accountId": "account-123", "amount": 100.00 }
  ],
  "credits": [
    { "accountId": "account-456", "amount": 100.00 }
  ],
  "attachments": [
    { "name": "invoice.pdf", "type": "application/pdf" }
  ]
}
```

**Expected Response:**
```json
{
  "message": "Journal entry created successfully",
  "journalEntry": { ... },
  "journalLines": [ ... ],
  "count": 2
}
```

## Test 2: Get All Journal Entries

**Endpoint:** `GET http://localhost:5000/journal-entries`

Optional query param: `?userId=1`

**Expected Response:**
```json
{
  "message": "Journal entries fetched successfully",
  "entries": [ ... ],
  "count": 1
}
```

## Test 3: Update Journal Entry Status

**Endpoint:** `PUT http://localhost:5000/journal-entries/:entryId/status`

**Request Body (Approve):**
```json
{
  "status": "Approved",
  "updated_by_user_id": 1
}
```

**Request Body (Reject):**
```json
{
  "status": "Rejected",
  "rejectionReason": "Incorrect account used",
  "updated_by_user_id": 1
}
```

## Common Issues

### Issue 1: "Table does not exist"
**Solution:** Create the Supabase tables:

```sql
-- Create journal_entries table
CREATE TABLE journal_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  description TEXT,
  status VARCHAR(50) DEFAULT 'Pending Review',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  rejection_reason TEXT
);

-- Create journal_lines table
CREATE TABLE journal_lines (
  id SERIAL PRIMARY KEY,
  journal_entry_id INTEGER REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id VARCHAR(255),
  debit DECIMAL(10, 2) DEFAULT 0,
  credit DECIMAL(10, 2) DEFAULT 0,
  file_name VARCHAR(255),
  file_url TEXT,
  file_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Issue 2: "CORS error"
**Solution:** Backend already has CORS enabled with `app.use(cors())`

### Issue 3: "Account ID not found"
**Solution:** Make sure the account IDs in your request match actual account records in `chart_of_accounts`

### Issue 4: Frontend not updating after submission
**Solution:** Make sure your parent component refetches journal entries after successful submission

## Testing with Postman/Thunder Client

1. Start your backend: `cd backend && node server.js`
2. Use Postman/Thunder Client to send requests
3. Check browser console for any network errors
4. Check backend terminal for error logs

