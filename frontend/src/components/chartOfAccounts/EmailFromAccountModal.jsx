// src/components/chartOfAccounts/EmailFromAccountModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import EmailForm from '../userManagement/EmailForm'; // 👈 Reuse your existing form

const EmailFromAccountModal = ({ account, isOpen, onClose }) => {
  const [toRole, setToRole] = useState('manager');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');

  // Fetch users by role when modal opens or role changes
  useEffect(() => {
    if (!isOpen) return;

    const fetchUsersByRole = async () => {
      setLoadingUsers(true);
      setError('');
      try {
        // 👇 Adjust this endpoint to match your backend
        const response = await fetch(`http://localhost:5000/users?role=${toRole}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to load ${toRole}s`);
        }

        // Ensure users have .email and .fullName
        const validUsers = (data.users || []).filter(
          u => u.email && (u.fullName || u.first_name)
        ).map(u => ({
          ...u,
          fullName: u.fullName || `${u.first_name} ${u.last_name}`.trim()
        }));

        setUsers(validUsers);
        setSelectedUser(validUsers.length > 0 ? validUsers[0] : null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
        setUsers([]);
        setSelectedUser(null);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsersByRole();
  }, [isOpen, toRole]);

  if (!isOpen) return null;

  const handleRoleChange = (e) => {
    setToRole(e.target.value);
    setSelectedUser(null); // Reset selection when role changes
  };

  const handleClose = () => {
    onClose();
    setSelectedUser(null);
    setUsers([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Send Email">
      {!selectedUser ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Send to:
            </label>
            <select
              value={toRole}
              onChange={handleRoleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="manager">Manager</option>
              <option value="accountant">Accountant</option>
            </select>
          </div>

          {loadingUsers ? (
            <p className="text-gray-500">Loading users...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
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
                    key={user.id || user.email}
                    onClick={() => setSelectedUser(user)}
                    className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                  >
                    <div className="font-medium">{user.fullName}</div>
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
            close={handleClose}
            // Optional: prefill subject
            // You can enhance EmailForm to accept initialSubject if needed
          />
        </div>
      )}
    </Modal>
  );
};

export default EmailFromAccountModal;