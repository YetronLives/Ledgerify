// src/components/chartOfAccounts/EmailFromAccountModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import EmailForm from '../userManagement/EmailForm';

const EmailFromAccountModal = ({ isOpen, onClose, currentUser }) => {
  const [toRole, setToRole] = useState('manager');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsersByRole = async () => {
      setLoadingUsers(true);
      try {
        const response = await fetch(`http://localhost:5000/users?role=${toRole}`);
        const data = await response.json();
        const validUsers = (data.users || []).filter(u => u.email);
        setUsers(validUsers);
        setSelectedUser(validUsers.length > 0 ? validUsers[0] : null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsersByRole();
  }, [isOpen, toRole]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Email to Team">
      {!selectedUser ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Send to:
            </label>
            <select
              value={toRole}
              onChange={(e) => setToRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="manager">Manager</option>
              <option value="accountant">Accountant</option>
            </select>
          </div>

          {loadingUsers ? (
            <p className="text-gray-500">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-500">No {toRole}s found.</p>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select recipient:
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                  >
                    <div className="font-medium">{user.first_name} {user.last_name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-3 text-sm text-gray-600">
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="text-blue-600 hover:underline"
            >
              ← Change recipient
            </button>
          </div>
          <EmailForm
            user={selectedUser}
            close={onClose}
          />
        </div>
      )}
    </Modal>
  );
};

export default EmailFromAccountModal;