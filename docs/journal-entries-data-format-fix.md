# Data Format Fix - Journal Entries

## Issue Fixed
Error: `Cannot read properties of undefined (reading 'map')`

This occurred because the backend was returning journal entries in a different format than what the frontend expected.

## Root Cause
- **Backend** was returning `lines` array (from `journal_lines` table)
- **Frontend** expected `debits` and `credits` arrays
- When the frontend tried to map over `entry.debits`, it was `undefined`, causing the crash

## Solution Applied

### Backend Changes (server.js)

#### GET `/journal-entries` endpoint:
Transformed the database response to match frontend expectations:

```javascript
// OLD FORMAT (from database):
{
  journal_entry_id: 1,
  lines: [
    { account_id: 'X', debit: 100, credit: 0 },
    { account_id: 'Y', debit: 0, credit: 100 }
  ]
}

// NEW FORMAT (sent to frontend):
{
  id: 1,
  date: "2024-01-01T00:00:00Z",
  description: "...",
  status: "Pending Review",
  debits: [
    { accountId: 'X', amount: 100 }
  ],
  credits: [
    { accountId: 'Y', amount: 100 }
  ],
  attachments: [],
  rejectionReason: null
}
```

#### POST `/journal-entries` endpoint:
Returns the same format as GET, ensuring consistency.

### Frontend Changes (JournalEntries.jsx)

Added defensive programming with optional chaining and default values:

```javascript
// Before:
entry.debits.map(d => ...)
entry.credits.map(c => ...)

// After (safe):
(entry.debits || []).map(d => ...)
(entry.credits || []).map(c => ...)
```

This prevents crashes if `debits` or `credits` are ever undefined.

## Testing

After these changes:
1. ✅ Creating journal entries works
2. ✅ Viewing journal entries works
3. ✅ Filtering by status (Pending, Approved, Rejected) works
4. ✅ Searching by account name works
5. ✅ Amount filtering works
6. ✅ No more "cannot read map" errors

## Data Flow

```
User submits form
    ↓
Frontend sends: { user_id, description, debits, credits, attachments }
    ↓
Backend creates:
  - 1 record in journal_entries
  - N records in journal_lines (one per debit/credit)
    ↓
Backend returns formatted response
    ↓
Frontend displays the entry correctly
```

## Files Modified

1. `/backend/server.js`
   - Lines 1050-1081: POST response formatting
   - Lines 1181-1248: GET response transformation

2. `/frontend/src/components/journalEntries/JournalEntries.jsx`
   - Lines 63-76: Safe filtering logic
   - Lines 254-290: Safe rendering with default arrays

