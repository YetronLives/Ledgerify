const { createClient } = require('@supabase/supabase-js');
const EventLogger = require('./eventLogger');
const multer = require('multer');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure multer for memory storage (files stored in RAM temporarily)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'image/jpeg',
      'image/png'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, Excel, CSV, and image files are allowed.'));
    }
  }
});

class JournalEntriesEndpoint {
  // Helper function to update account debit/credit totals in chart_of_accounts table
  static async updateAccountTotals(journalEntryId, shouldAdd = true) {
    try {
      // Get all journal lines for this entry
      const { data: journalLines, error: linesError } = await supabase
        .from('journal_lines')
        .select('account_id, debit, credit')
        .eq('journal_entry_id', journalEntryId);

      if (linesError) {
        console.error('Error fetching journal lines:', linesError);
        return { success: false, error: linesError.message };
      }

      if (!journalLines || journalLines.length === 0) {
        return { success: true, message: 'No journal lines found' };
      }

      // Group by account_id and sum debits/credits
      const accountUpdates = {};
      journalLines.forEach(line => {
        if (!accountUpdates[line.account_id]) {
          accountUpdates[line.account_id] = { debit: 0, credit: 0 };
        }
        accountUpdates[line.account_id].debit += parseFloat(line.debit || 0);
        accountUpdates[line.account_id].credit += parseFloat(line.credit || 0);
      });

      // Update each account's debit/credit totals and balance
      for (const [accountId, totals] of Object.entries(accountUpdates)) {
        // Get current account values including current balance and normal_side
        const { data: account, error: accountError } = await supabase
          .from('chart_of_accounts')
          .select('debit, credit, balance, normal_side')
          .eq('account_id', accountId)
          .single();

        if (accountError) {
          console.error(`Error fetching account ${accountId}:`, accountError);
          continue; // Skip this account but continue with others
        }

        // Calculate new debit/credit totals
        const currentDebit = parseFloat(account.debit || 0);
        const currentCredit = parseFloat(account.credit || 0);
        const currentBalance = parseFloat(account.balance || 0);
        const newDebit = shouldAdd 
          ? currentDebit + totals.debit 
          : Math.max(0, currentDebit - totals.debit);
        const newCredit = shouldAdd 
          ? currentCredit + totals.credit 
          : Math.max(0, currentCredit - totals.credit);

        // Calculate balance change based on normal side
        // For each debit/credit in this transaction, apply its effect to balance
        const normalSide = account.normal_side?.toLowerCase();
        let balanceChange = 0;

        if (shouldAdd) {
          // Adding transaction: apply debits and credits
          if (normalSide === 'debit') {
            // For Debit accounts: debits add to balance, credits subtract from balance
            balanceChange = totals.debit - totals.credit;
          } else if (normalSide === 'credit') {
            // For Credit accounts: credits add to balance, debits subtract from balance
            balanceChange = totals.credit - totals.debit;
          }
        } else {
          // Removing transaction (rejection): reverse the effect
          if (normalSide === 'debit') {
            // Reverse: subtract what was added, add what was subtracted
            balanceChange = -(totals.debit - totals.credit);
          } else if (normalSide === 'credit') {
            // Reverse: subtract what was added, add what was subtracted
            balanceChange = -(totals.credit - totals.debit);
          }
        }

        // Calculate new balance by applying the change to current balance
        const newBalance = currentBalance + balanceChange;

        // Update the account with debit, credit, and balance
        const { error: updateError } = await supabase
          .from('chart_of_accounts')
          .update({ 
            debit: newDebit,
            credit: newCredit,
            balance: newBalance
          })
          .eq('account_id', accountId);

        if (updateError) {
          console.error(`Error updating account ${accountId}:`, updateError);
        }
      }

      return { success: true, message: 'Account totals updated successfully' };
    } catch (err) {
      console.error('Error updating account totals:', err);
      return { success: false, error: err.message };
    }
  }

  // Create journal entry with journal lines
  static async createJournalEntry(req, res) {
    const { user_id, description, debits, credits, attachments } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    if (!debits || !credits || debits.length === 0 || credits.length === 0) {
      return res.status(400).json({ error: 'At least one debit and one credit line is required.' });
    }

    // Validate that debits equal credits
    const totalDebits = debits.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
    const totalCredits = credits.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);

    if (totalDebits !== totalCredits) {
      return res.status(400).json({ error: 'Total debits must equal total credits.' });
    }

    try {
      const created_at = new Date().toISOString();

      // Get the user's role to determine if auto-approval is needed
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user_id)
        .single();

      if (userError) {
        console.error('Error fetching user role:', userError);
        return res.status(500).json({ error: 'Failed to fetch user information.' });
      }

      // Auto-approve for Managers, Pending Review for others
      const status = userData.role === 'Manager' ? 'Approved' : 'Pending Review';

      // Step 1: Insert into journal_entries table
      const { data: journalEntry, error: journalError } = await supabase
        .from('journal_entries')
        .insert([{
          user_id,
          description: description || '',
          status: status,
          created_at
        }])
        .select()
        .single();

      if (journalError) {
        console.error('Error creating journal entry:', journalError);
        return res.status(500).json({ error: 'Failed to create journal entry: ' + journalError.message });
      }

      // Step 2: Insert into journal_lines table for each debit and credit
      const journalLines = [];

      // Process debits
      debits.forEach(debit => {
        if (debit.accountId && debit.amount) {
          journalLines.push({
            journal_entry_id: journalEntry.journal_entry_id,
            account_id: debit.accountId,
            debit: parseFloat(debit.amount),
            credit: 0,
            file_name: null,
            file_url: null,
            file_type: null,
            created_at
          });
        }
      });

      // Process credits
      credits.forEach(credit => {
        if (credit.accountId && credit.amount) {
          journalLines.push({
            journal_entry_id: journalEntry.journal_entry_id,
            account_id: credit.accountId,
            debit: 0,
            credit: parseFloat(credit.amount),
            file_name: null,
            file_url: null,
            file_type: null,
            created_at
          });
        }
      });

      // Handle attachments - distribute across journal lines or attach to first line
      if (attachments && attachments.length > 0 && journalLines.length > 0) {
        // Attach each file to a journal line (cycling through lines if more files than lines)
        attachments.forEach((attachment, index) => {
          const lineIndex = index % journalLines.length;
          if (!journalLines[lineIndex].file_name) {
            journalLines[lineIndex].file_name = attachment.name;
            journalLines[lineIndex].file_url = attachment.url;
            journalLines[lineIndex].file_type = attachment.type;
          }
        });
      }

      const { data: lines, error: linesError } = await supabase
        .from('journal_lines')
        .insert(journalLines)
        .select();

      if (linesError) {
        console.error('Error creating journal lines:', linesError);
        // Rollback: delete the journal entry if lines fail
        await supabase
          .from('journal_entries')
          .delete()
          .eq('journal_entry_id', journalEntry.journal_entry_id);
        
        return res.status(500).json({ error: 'Failed to create journal lines: ' + linesError.message });
      }

      // Log the journal entry creation
      const logResult = await EventLogger.logJournalEntryCreation(
        journalEntry.journal_entry_id,
        journalEntry,
        user_id
      );
      if (!logResult.success) {
        console.error('Failed to log journal entry creation:', logResult.error);
      }

      // Update account debit/credit totals if entry is auto-approved
      if (status === 'Approved') {
        const updateResult = await this.updateAccountTotals(journalEntry.journal_entry_id, true);
        if (!updateResult.success) {
          console.error('Failed to update account totals:', updateResult.error);
          // Don't fail the request, just log the error
        }
      }

      // Transform to frontend format
      const debitsFormatted = debits.map(d => ({
        accountId: d.accountId,
        amount: parseFloat(d.amount)
      }));
      
      const creditsFormatted = credits.map(c => ({
        accountId: c.accountId,
        amount: parseFloat(c.amount)
      }));
      
      const attachmentsFormatted = (attachments || []).map(a => ({
        name: a.name,
        type: a.type,
        url: a.url || null
      }));

      return res.status(201).json({
        message: 'Journal entry created successfully',
        journalEntry: {
          id: journalEntry.journal_entry_id,
          date: journalEntry.created_at,
          description: journalEntry.description || '',
          status: journalEntry.status,
          debits: debitsFormatted,
          credits: creditsFormatted,
          attachments: attachmentsFormatted,
          rejectionReason: null
        },
        journalLines: lines,
        count: lines.length
      });

    } catch (err) {
      console.error('Create journal entry error:', err);
      return res.status(500).json({ error: 'Server error occurred while creating journal entry.' });
    }
  }

  // Update journal entry status (Approve/Reject)
  static async updateJournalEntryStatus(req, res) {
    const { entryId } = req.params;
    const { status, rejectionReason, updated_by_user_id } = req.body;

    if (!entryId) {
      return res.status(400).json({ error: 'Journal Entry ID is required.' });
    }

    if (!status || !['Approved', 'Rejected', 'Pending Review'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required (Approved, Rejected, or Pending Review).' });
    }

    if (status === 'Rejected' && !rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required when rejecting an entry.' });
    }

    try {
      // Get the entry before update
      const { data: beforeData, error: fetchError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('journal_entry_id', entryId)
        .single();

      if (fetchError) {
        return res.status(404).json({ error: 'Journal entry not found.' });
      }

      const updateData = {
        status
      };

      if (status === 'Rejected' && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const { data: updatedEntry, error: updateError } = await supabase
        .from('journal_entries')
        .update(updateData)
        .eq('journal_entry_id', entryId)
        .select()
        .single();

      if (updateError) {
        return res.status(500).json({ error: 'Failed to update journal entry status: ' + updateError.message });
      }

      // Log the update
      const logResult = await EventLogger.logJournalEntryUpdate(
        entryId,
        beforeData,
        updatedEntry,
        updated_by_user_id || beforeData.user_id
      );
      if (!logResult.success) {
        console.error('Failed to log journal entry status update:', logResult.error);
      }

      // Update account debit/credit totals based on status change
      if (beforeData.status !== 'Approved' && status === 'Approved') {
        // Entry is being approved - add to account totals
        const updateResult = await this.updateAccountTotals(entryId, true);
        if (!updateResult.success) {
          console.error('Failed to update account totals on approval:', updateResult.error);
        }
      } else if (beforeData.status === 'Approved' && status !== 'Approved') {
        // Entry was approved but is now being rejected/pending - subtract from account totals
        const updateResult = await this.updateAccountTotals(entryId, false);
        if (!updateResult.success) {
          console.error('Failed to update account totals on rejection:', updateResult.error);
        }
      }

      return res.json({
        message: `Journal entry ${status.toLowerCase()} successfully`,
        journalEntry: {
          ...updatedEntry,
          id: updatedEntry.journal_entry_id
        }
      });

    } catch (err) {
      console.error('Update journal entry status error:', err);
      return res.status(500).json({ error: 'Server error occurred while updating journal entry status.' });
    }
  }

  // Get all journal entries or filter by user
  static async getJournalEntries(req, res) {
    const { userId } = req.query;

    try {
      let query = supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: entries, error: entriesError } = await query;

      if (entriesError) {
        return res.status(500).json({ error: entriesError.message });
      }

      if (entries.length === 0) {
        return res.json({
          message: 'No journal entries found',
          entries: [],
          count: 0
        });
      }

      // Get all journal lines for these entries
      const entryIds = entries.map(e => e.journal_entry_id);

      const { data: lines, error: linesError } = await supabase
        .from('journal_lines')
        .select('*')
        .in('journal_entry_id', entryIds)
        .order('created_at', { ascending: true });

      if (linesError) {
        return res.status(500).json({ error: linesError.message });
      }

      // Ensure lines is an array
      const linesArray = lines || [];

      // Combine entries with their lines and transform to frontend format
      const entriesWithLines = entries.map(entry => {
        const entryLines = linesArray.filter(line => line.journal_entry_id == entry.journal_entry_id);
        
        // Separate debits and credits
        const debits = entryLines
          .filter(line => line.debit > 0)
          .map(line => ({
            accountId: line.account_id,
            amount: parseFloat(line.debit)
          }));
        
        const credits = entryLines
          .filter(line => line.credit > 0)
          .map(line => ({
            accountId: line.account_id,
            amount: parseFloat(line.credit)
          }));
        
        // Get attachments from lines (if any)
        const attachments = entryLines
          .filter(line => line.file_name)
          .map(line => ({
            name: line.file_name,
            type: line.file_type,
            url: line.file_url
          }));
        
        return {
          id: entry.journal_entry_id,
          date: entry.created_at,
          description: entry.description || '',
          status: entry.status,
          debits: debits,
          credits: credits,
          attachments: attachments,
          rejectionReason: entry.rejection_reason || null
        };
      });

      return res.json({
        message: 'Journal entries fetched successfully',
        entries: entriesWithLines,
        count: entries.length
      });

    } catch (err) {
      console.error('Error fetching journal entries:', err);
      return res.status(500).json({ error: 'Server error occurred while fetching journal entries.' });
    }
  }

  // Upload files to Supabase Storage
  static async uploadFiles(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
      }

      const uploadedFiles = [];
      const timestamp = Date.now();

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        
        // Create unique filename: timestamp_originalname
        const fileName = `${timestamp}_${i}_${file.originalname}`;
        const filePath = `journal-attachments/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('ledgerify-files') // Make sure this bucket exists in Supabase
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });

        if (error) {
          console.error('Error uploading file to Supabase Storage:', error);
          return res.status(500).json({ 
            error: `Failed to upload file ${file.originalname}: ${error.message}` 
          });
        }

        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from('ledgerify-files')
          .getPublicUrl(filePath);

        uploadedFiles.push({
          name: file.originalname,
          url: urlData.publicUrl,
          type: file.mimetype,
          size: file.size
        });
      }

      return res.json({
        message: 'Files uploaded successfully',
        files: uploadedFiles
      });

    } catch (err) {
      console.error('File upload error:', err);
      return res.status(500).json({ 
        error: 'Server error occurred while uploading files.' 
      });
    }
  }

  // Get the multer upload middleware
  static getUploadMiddleware() {
    return upload.array('files', 10); // Allow up to 10 files
  }
}

module.exports = JournalEntriesEndpoint;

