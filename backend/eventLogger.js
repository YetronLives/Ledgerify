const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class EventLogger {
  static async logEvent({ tableName, recordId, userId, actionType, beforeImage = null, afterImage = null }) {
    try {
      console.log('EventLogger.logEvent called with:', { tableName, recordId, userId, actionType });
      if (!tableName || !recordId || !userId || !actionType) {
        throw new Error('Missing required parameters: tableName, recordId, userId, actionType');
      }

      const validActions = ['INSERT', 'UPDATE', 'DELETE'];
      if (!validActions.includes(actionType)) {
        throw new Error(`Invalid action type: ${actionType}. Must be one of: ${validActions.join(', ')}`);
      }
      const eventLogEntry = {
        event_id: Math.floor(Date.now() / 1000), // Use seconds since epoch (smaller number)
        table_name: tableName,
        record_id: recordId,
        user_id: userId,
        action_type: actionType,
        before_image: beforeImage ? JSON.stringify(beforeImage) : null,
        after_image: afterImage ? JSON.stringify(afterImage) : null,
        event_time: new Date().toISOString()
      };

      console.log('Inserting event log entry:', eventLogEntry);
      const { data, error } = await supabase
        .from('event_log')
        .insert([eventLogEntry])
        .select();

      if (error) {
        console.error('Error logging event:', error);
        throw new Error(`Failed to log event: ${error.message}`);
      }

      console.log('Event logged successfully, data:', data);

      console.log(`Event logged successfully: ${actionType} on ${tableName} record ${recordId} by user ${userId}`);
      return { success: true, data: data[0] };

    } catch (error) {
      console.error('EventLogger.logEvent error:', error);
      return { success: false, error: error.message };
    }
  }

  static async logUserCreation(userId, userData, createdByUserId) {
    return await this.logEvent({
      tableName: 'users',
      recordId: userId,
      userId: createdByUserId,
      actionType: 'INSERT',
      beforeImage: null,
      afterImage: userData
    });
  }

  static async logUserUpdate(userId, beforeData, afterData, updatedByUserId) {
    return await this.logEvent({
      tableName: 'users',
      recordId: userId,
      userId: updatedByUserId,
      actionType: 'UPDATE',
      beforeImage: beforeData,
      afterImage: afterData
    });
  }

  static async logUserDeletion(userId, userData, deletedByUserId) {
    return await this.logEvent({
      tableName: 'users',
      recordId: userId,
      userId: deletedByUserId,
      actionType: 'DELETE',
      beforeImage: userData,
      afterImage: null
    });
  }

  static async logAccountCreation(accountId, accountData, createdByUserId) {
    return await this.logEvent({
      tableName: 'chart_of_accounts',
      recordId: accountId,
      userId: createdByUserId,
      actionType: 'INSERT',
      beforeImage: null,
      afterImage: accountData
    });
  }

  static async logAccountUpdate(accountId, beforeData, afterData, updatedByUserId) {
    return await this.logEvent({
      tableName: 'chart_of_accounts',
      recordId: accountId,
      userId: updatedByUserId,
      actionType: 'UPDATE',
      beforeImage: beforeData,
      afterImage: afterData
    });
  }

  static async logAccountDeletion(accountId, accountData, deletedByUserId) {
    return await this.logEvent({
      tableName: 'chart_of_accounts',
      recordId: accountId,
      userId: deletedByUserId,
      actionType: 'DELETE',
      beforeImage: accountData,
      afterImage: null
    });
  }

  static async getUserEventLogs(userId, limit = 100, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('event_log')
        .select('*')
        .eq('user_id', userId)
        .order('event_time', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch event logs: ${error.message}`);
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('EventLogger.getUserEventLogs error:', error);
      return { success: false, error: error.message };
    }
  }

  static async getTableEventLogs(tableName, limit = 100, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('event_log')
        .select('*')
        .eq('table_name', tableName)
        .order('event_time', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch event logs: ${error.message}`);
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('EventLogger.getTableEventLogs error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EventLogger;
