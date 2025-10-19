// src/components/chartOfAccounts/AccountEventLogModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

const formatAccount = (account) => {
  if (!account) return null;
  return {
    'Account Name': account.account_name,
    'Account Number': account.account_number,
    'Description': account.account_description,
    'Normal Side': account.normal_side,
    'Category': account.category,
    'Subcategory': account.subcategory,
    'Initial Balance': account.initial_balance,
    'Debit': account.debit,
    'Credit': account.credit,
    'Balance': account.balance,
    'Order': account.order_number,
    'Statement': account.statement,
    'Comment': account.comment,
    'Active': account.is_active
  };
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

      // Sort chronologically: oldest first (creation at top)
      const sortedLogs = (result.eventLogs || []).reverse();
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
          <div>
            <p className="text-gray-500 mb-3">No event logs found for this account.</p>
            {/* Show creation info if no logs */}
            <div className="border border-gray-200 rounded-lg p-3 bg-blue-50">
              <p className="text-sm font-medium text-gray-700">Account Creation Info:</p>
              <pre className="bg-white p-2 rounded text-xs mt-2 border">
                {JSON.stringify(formatAccount(account), null, 2)}
              </pre>
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ This account was created before event logging was enabled.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {eventLogs.map((log) => (
              <div key={log.event_id} className="border-l-4 border-gray-300 pl-3 py-2">
                {/* ✅ FIXED: Use user_id and event_time */}
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">
                    {new Date(log.event_time).toLocaleString()}  {/* ✅ event_time */}
                  </span>
                  {' — '}
                  <span>User ID: {log.user_id}</span>  {/* ✅ user_id */}
                  {' — '}
                  <span className="capitalize font-semibold">{log.action_type}</span>
                </div>

                {log.action_type === 'INSERT' ? (
                  <div>
                    <p className="font-semibold text-gray-700 text-sm mb-1">Created:</p>
                    <pre className="bg-blue-50 p-2 rounded text-gray-800 whitespace-pre-wrap border border-blue-200 text-xs">
                      {JSON.stringify(formatAccount(log.after_image), null, 2)}
                    </pre>
                  </div>
                ) : log.before_image ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Before:</p>
                      <pre className="bg-gray-100 p-2 rounded text-gray-800 whitespace-pre-wrap">
                        {JSON.stringify(formatAccount(log.before_image), null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">After:</p>
                      <pre className="bg-gray-100 p-2 rounded text-gray-800 whitespace-pre-wrap">
                        {JSON.stringify(formatAccount(log.after_image), null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">After:</p>
                    <pre className="bg-gray-100 p-2 rounded text-gray-800 whitespace-pre-wrap text-xs">
                      {JSON.stringify(formatAccount(log.after_image), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AccountEventLogModal;