const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class JEErrorLogger {
  /**
   * Log a journal entry error to the database
   * @param {Object} errorData - Error information
   * @param {string} errorData.journal_entry_id - ID of the journal entry (if created)
   * @param {number} errorData.user_id - ID of the user who attempted the entry
   * @param {string} errorData.error_type - Type of error (e.g., 'UNBALANCED', 'EMPTY_ACCOUNT', etc.)
   * @param {string} errorData.error_message - Human-readable error message
   * @param {Object} errorData.entry_data - The journal entry data that caused the error
   * @param {string} errorData.resolution_suggestion - Suggestion for how to fix the error
   * @returns {Promise<Object>} - { success: boolean, data?: object, error?: string }
   */
  static async logError({
    journal_entry_id = null,
    user_id,
    error_type,
    error_message,
    entry_data = null,
    resolution_suggestion = null
  }) {
    try {
      if (!user_id || !error_type || !error_message) {
        throw new Error('Missing required parameters: user_id, error_type, error_message');
      }

      const errorLogEntry = {
        error_id: Math.floor(Date.now() / 1000),
        journal_entry_id,
        user_id,
        error_type,
        error_message,
        entry_data: entry_data ? JSON.stringify(entry_data) : null,
        resolution_suggestion,
        error_timestamp: new Date().toISOString()
      };

      console.log('Inserting JE error log entry:', errorLogEntry);
      
      const { data, error } = await supabase
        .from('je_error_logs')
        .insert([errorLogEntry])
        .select();

      if (error) {
        console.error('Error logging JE error:', error);
        throw new Error(`Failed to log JE error: ${error.message}`);
      }

      console.log('JE error logged successfully:', data[0]);
      return { success: true, data: data[0] };

    } catch (error) {
      console.error('JEErrorLogger.logError error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get error logs for a specific user
   * @param {number} userId - User ID
   * @param {number} limit - Maximum number of logs to return
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Object>} - { success: boolean, data?: array, error?: string }
   */
  static async getUserErrorLogs(userId, limit = 100, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('je_error_logs')
        .select('*')
        .eq('user_id', userId)
        .order('error_timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch error logs: ${error.message}`);
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('JEErrorLogger.getUserErrorLogs error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all error logs
   * @param {number} limit - Maximum number of logs to return
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Object>} - { success: boolean, data?: array, error?: string }
   */
  static async getAllErrorLogs(limit = 100, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('je_error_logs')
        .select('*')
        .order('error_timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch all error logs: ${error.message}`);
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('JEErrorLogger.getAllErrorLogs error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = JEErrorLogger;

