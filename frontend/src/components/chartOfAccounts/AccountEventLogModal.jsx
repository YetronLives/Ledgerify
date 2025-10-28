// src/components/chartOfAccounts/AccountEventLogModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

// Format field name: "account_name" → "Account Name"
const formatFieldName = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1') // accountName → account Name
    .replace(/_/g, ' ')         // account_name → account name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get changed fields between before and after
const getChangedFields = (before, after) => {
  if (!before) {
    // INSERT: show all fields as new
    return Object.entries(after).map(([key, value]) => ({
      field: key,
      oldValue: null,
      newValue: value
    }));
  }

  // UPDATE: show only changed fields
  const changes = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  
  allKeys.forEach(key => {
    const oldValue = before[key];
    const newValue = after[key];
    if (oldValue !== newValue) {
      changes.push({ field: key, oldValue, newValue });
    }
  });
  return changes;
};

const AccountEventLogModal = ({ account, isOpen, onClose, currentUser }) => {
  const [eventLogs, setEventLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && account?.id) {
      fetchEventLogs(account.id);
    }
  }, [isOpen, account]);

  const fetchEventLogs = async (accountId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/accounts/${accountId}/event-logs?userId=${currentUser?.id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load event logs');
      }

      // Filter out logs with no actual changes and sort newest first
      const logsWithChanges = (result.eventLogs || []).filter(log => {
        const changes = getChangedFields(log.before_image, log.after_image);
        return changes.length > 0;
      });

      const sortedLogs = [...logsWithChanges].sort((a, b) => 
        new Date(b.event_time) - new Date(a.event_time)
      );
      setEventLogs(sortedLogs);
    } catch (err) {
      console.error('Error fetching event logs:', err);
      setError(err.message || 'Unable to load event logs');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Event Logs: ${account?.name || 'Account'}`}>
      <div className="max-h-96 overflow-y-auto pr-2">
        {loading ? (
          <p className="text-gray-500">Loading event logs...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : eventLogs.length === 0 ? (
          <p className="text-gray-500">
            No event logs found for this account. This may occur if logs have no changes or if logging was recently enabled.
          </p>
        ) : (
          <div className="space-y-5">
            {eventLogs.map((log) => {
              const changes = getChangedFields(log.before_image, log.after_image);
              // Treat as creation if action_type is INSERT or if there's no before_image
              const isCreation = log.action_type === 'INSERT' || !log.before_image;
              const actionText = 
                isCreation ? 'Account created' :
                log.action_type === 'UPDATE' ? 'Account updated' :
                'Account deleted';

              return (
                <div key={log.event_id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {/* Header: Timestamp and User Role */}
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-semibold">
                      {new Date(log.event_time).toLocaleString()}
                    </span>
                    {' — '}
                    <span>User: {log.user_id || 'Unknown'}</span>
                  </div>

                  {/* Action */}
                  <p className="font-semibold text-gray-800 mb-3">{actionText}</p>

                  {/* Changes */}
                  {changes.length > 0 ? (
                    <div className="text-sm space-y-1">
                      {changes.map(({ field, oldValue, newValue }) => {
                        const fieldName = formatFieldName(field);
                        const oldValueStr = oldValue == null ? '(none)' : String(oldValue);
                        const newValueStr = newValue == null ? '(none)' : String(newValue);

                        return (
                          <div key={field} className="flex">
                            <span className="font-medium w-36 flex-shrink-0">{fieldName}:</span>
                            {isCreation ? (
                              <span className="text-gray-700">{newValueStr}</span>
                            ) : (
                              <span className="text-gray-700">
                                <span className="text-red-600 line-through">{oldValueStr}</span>
                                {' → '}
                                <span className="text-green-600">{newValueStr}</span>
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No changes to display.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AccountEventLogModal;