const { createClient } = require('@supabase/supabase-js');
const EventLogger = require('./eventLogger');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class ChartOfAccountsEndpoint {
  // Get chart of accounts for a specific user
  static async getAccountsByUserId(req, res) {
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
  }

  // Get all chart of accounts (no user filter)
  static async getAllAccounts(req, res) {
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
  }

  // Create new chart of account
  static async createAccount(req, res) {
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

    const logResult = await EventLogger.logAccountCreation(data[0].account_id, data[0], user_id);
    if (!logResult.success) {
      console.error('Failed to log account creation event:', logResult.error);
    }

    res.status(201).json({ message: 'Chart of Account created successfully', account: data[0] });
  }

  // Update chart of account
  static async updateAccount(req, res) {
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
      is_active
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

      if (normal_side !== undefined || initial_balance !== undefined) {
        const newNormalSide = normal_side !== undefined ? normal_side : beforeData.normal_side;
        const newInitialBalance = initial_balance !== undefined ? initial_balance : beforeData.initial_balance;

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
        return res.status(500).json({ error: 'Failed to update account: ' + updateError.message });
      }

      const logResult = await EventLogger.logAccountUpdate(
        accountId,
        beforeData,
        updatedAccount,
        beforeData.user_id
      );
      if (!logResult.success) {
        console.error('Failed to log account update event:', logResult.error);
      }

      return res.json({
        message: 'Account updated successfully',
        account: updatedAccount
      });

    } catch (err) {
      console.error('Update account error:', err);
      return res.status(500).json({ error: 'Server error occurred while updating account.' });
    }
  }

  // Delete chart of account
  static async deleteAccount(req, res) {
    const { accountId } = req.params;

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
  }
}

module.exports = ChartOfAccountsEndpoint;

