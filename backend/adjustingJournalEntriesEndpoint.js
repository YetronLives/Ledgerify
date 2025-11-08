const { createClient } = require('@supabase/supabase-js');
const EventLogger = require('./eventLogger');
const { multer } = require('multer');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class AdjustingJournalEntriesEndpoint {
  // Create adjusting journal entries with journal lines
  static async createAdjustingJournalEntry(req, res) {
    const { user_id, adjustment_type, description, debits, credits, attachments} = req.body;

    if (!user_id) {
        return res.status(400).json({error: 'User ID is required.'});
    }
    if (!description){
        return res.status(400).json({error: 'Description is required.'});
    }
    if (!debits || !credits || debits.length === 0 || credits.length === 0) {
        return res.status(400).json({error: 'At least one debit and one credit line is required.'});
    }
    if (debits.some(debit => !debit.amount || debit.amount <= 0) || credits.some(credit => !credit.amount || credit.amount <= 0)) {
        return res.status(400).json({error: 'Debits and credits must have positive amounts.'});
    }

    // Validate that debits equal credits
    const totalDebits = debits.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
    const totalCredits = credits.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);

    if (totalDebits !== totalCredits) {
      return res.status(400).json({ error: 'Total debits must equal total credits.' });
    }

    try{
        const created_at = new Date().toISOString();

        const {data: userData, error: userError} = await supabase
        .from('users')
        .select('role')
        .eq('id', user_id)
        .single();

        if (userError) {
            console.error('Error fetching user role:', userError);
            return res.status(500).json({ error: 'Failed to fetch user information.' });
        }
        
        const status = userData.role === 'Manager' ? 'Approved' : 'Pending Review';

        const {data: journalEntry, error: journalError} = await supabase
        .from('adjusting_journal_entries')
        .insert([{
            user_id: user_id,
            adjustment_type: adjustment_type,
            description: description,
            status: status,
            created_at
        }])
        .select()
        .single();

        if (journalError) {
            console.error('Error creating adjusting journal entry:', journalError);
            return res.status(500).json({ error: 'Failed to create adjusting journal entry.' });
        }
        
        const adjustingJournalLines = [];

        debits.forEach(debit => {
            if (debit.accountId && debit.amount) {
                adjustingJournalLines.push({
                    adjusting_journal_entry_id: journalEntry.adjusting_journal_entry_id,
                    account_id: debit.accountId,
                    debit: parseFloat(debit.amount),
                });
            }
        });

        credits.forEach(credit => {
            if (credit.accountId && credit.amount) {
                adjustingJournalLines.push({
                    adjusting_journal_entry_id: journalEntry.adjusting_journal_entry_id,
                    account_id: credit.accountId,
                    credit: parseFloat(credit.amount),
                });
            }
        });

        // Attach files to journal lines - distribute one file per line
        if (attachments && attachments.length > 0) {
          attachments.forEach((attachment, index) => {
            if (index < adjustingJournalLines.length) {
              // Attach to existing line
              adjustingJournalLines[index].file_name = attachment.name;
              adjustingJournalLines[index].file_url = attachment.url;
              adjustingJournalLines[index].file_type = attachment.type;
            }
          });
        }

        if (adjustingJournalLines.length === 0) {
            console.error('No adjusting journal lines created.');
            return res.status(500).json({ error: 'No adjusting journal lines created.' });
        }

        const {data: adjustingJournalLinesData, error: adjustingJournalLinesError} = await supabase
        .from('adjusting_journal_lines')
        .insert(adjustingJournalLines)
        .select();

        if (adjustingJournalLinesError) {
            console.error('Error creating adjusting journal lines:', adjustingJournalLinesError);
            return res.status(500).json({ error: 'Failed to create adjusting journal lines.' });
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

        const logResult = await EventLogger.logAdjustingJournalEntryCreation(
            journalEntry.adjusting_journal_entry_id,
            journalEntry,
            user_id
        );
        if (!logResult.success) {
            console.error('Failed to log adjusting journal entry creation:', logResult.error);
        }

        return res.status(201).json({
            message: 'Adjusting journal entry created successfully',
            adjustingJournalEntry: {
                id: journalEntry.adjusting_journal_entry_id,
                date: journalEntry.created_at,
                description: journalEntry.description || '',
                status: journalEntry.status,
                debits: debitsFormatted,
                credits: creditsFormatted,
                attachments: attachmentsFormatted,
                rejectionReason: null
            },
            adjustingJournalLines: adjustingJournalLinesData,
            count: adjustingJournalLinesData.length
        });

    } catch (err) {
        console.error('Error creating adjusting journal entry:', err);
        return res.status(500).json({ error: 'Server error occurred while creating adjusting journal entry.' });
    }
  }

  // Get all adjusting journal entries
  static async getAdjustingJournalEntries(req, res) {
    try {
      const { data: entries, error } = await supabase
        .from('adjusting_journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching adjusting journal entries:', error);
        return res.status(500).json({ error: 'Failed to fetch adjusting journal entries.' });
      }

      // For each entry, fetch its lines
      const entriesWithLines = await Promise.all(entries.map(async (entry) => {
        const { data: lines, error: linesError } = await supabase
          .from('adjusting_journal_lines')
          .select('*')
          .eq('adjusting_journal_entry_id', entry.adjusting_journal_entry_id);

        if (linesError) {
          console.error('Error fetching adjusting journal lines:', linesError);
          return null;
        }

        // Organize lines into debits and credits
        const debits = [];
        const credits = [];
        const attachments = [];

        lines.forEach(line => {
          if (line.debit && line.debit > 0) {
            debits.push({
              accountId: line.account_id,
              amount: parseFloat(line.debit)
            });
          }
          if (line.credit && line.credit > 0) {
            credits.push({
              accountId: line.account_id,
              amount: parseFloat(line.credit)
            });
          }
          // Collect attachments from lines
          if (line.file_name && line.file_url) {
            attachments.push({
              name: line.file_name,
              url: line.file_url,
              type: line.file_type
            });
          }
        });

        return {
          id: entry.adjusting_journal_entry_id,
          date: entry.created_at,
          description: entry.description || '',
          adjustment_type: entry.adjustment_type || null,
          status: entry.status,
          debits,
          credits,
          attachments,
          rejectionReason: entry.rejection_reason || null
        };
      }));

      // Filter out any null entries (in case of errors)
      const validEntries = entriesWithLines.filter(entry => entry !== null);

      return res.json({
        message: 'Adjusting journal entries fetched successfully',
        entries: validEntries,
        count: validEntries.length
      });

    } catch (err) {
      console.error('Error fetching adjusting journal entries:', err);
      return res.status(500).json({ error: 'Server error occurred while fetching adjusting journal entries.' });
    }
  }

  // Update adjusting journal entry status (approve/reject)
  static async updateAdjustingJournalEntryStatus(req, res) {
    const { entryId } = req.params;
    const { status, rejection_reason } = req.body;

    if (!entryId) {
      return res.status(400).json({ error: 'Entry ID is required.' });
    }

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Valid status (Approved or Rejected) is required.' });
    }

    if (status === 'Rejected' && !rejection_reason) {
      return res.status(400).json({ error: 'Rejection reason is required when rejecting an entry.' });
    }

    try {
      const updateData = {
        status,
        rejection_reason: status === 'Rejected' ? rejection_reason : null
      };

      const { data, error } = await supabase
        .from('adjusting_journal_entries')
        .update(updateData)
        .eq('adjusting_journal_entry_id', entryId)
        .select()
        .single();

      if (error) {
        console.error('Error updating adjusting journal entry status:', error);
        return res.status(500).json({ error: 'Failed to update adjusting journal entry status.' });
      }

      // Log the status update
      const logResult = await EventLogger.logAdjustingJournalEntryUpdate(
        entryId,
        { status: 'Pending Review' },
        data,
        req.body.user_id || null
      );

      if (!logResult.success) {
        console.error('Failed to log status update:', logResult.error);
      }

      return res.json({
        message: 'Adjusting journal entry status updated successfully',
        entry: data
      });

    } catch (err) {
      console.error('Error updating adjusting journal entry status:', err);
      return res.status(500).json({ error: 'Server error occurred while updating adjusting journal entry status.' });
    }
  }
}

module.exports = AdjustingJournalEntriesEndpoint;

