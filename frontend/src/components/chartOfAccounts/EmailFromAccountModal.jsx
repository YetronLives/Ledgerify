// src/components/chartOfAccounts/EmailFromAccountModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import EmailForm from '../userManagement/EmailForm';

const EmailFromAccountModal = ({ isOpen, onClose, currentUser }) => {
  const [toRole, setToRole] = useState('');
  const [availableRoles, setAvailableRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [view, setView] = useState('select'); // 'select' or 'compose'

  useEffect(() => {
    if (!currentUser || !currentUser.role) {
      setAvailableRoles([]);
      setToRole('');
      return;
    }

    const role = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1).toLowerCase();

    if (role === 'Admin') {
      setAvailableRoles(['Manager', 'Accountant']);
      setToRole('Manager'); // must match DB casing
    } else if (role === 'Accountant') {
      setAvailableRoles(['Manager', 'Admin']);
      setToRole('Manager');
    } else if (role === 'Manager') {
      setAvailableRoles(['Admin']);
      setToRole('Admin');
    } else {
      setAvailableRoles([]);
      setToRole('');
    }
  }, [currentUser]);

  useEffect(() => {
    if (!isOpen) {
      setView('select');
      setSelectedUser(null);
      return;
    }

    if (view === 'select') {
      if (!toRole) {
        setLoadingUsers(false);
        setUsers([]);
        return;
      }

      const fetchUsersByRole = async () => {
        setLoadingUsers(true);
        try {
          const response = await fetch(`http://localhost:5000/users?role=${encodeURIComponent(toRole)}`);
          if (!response.ok) {
            throw new Error(`Failed to load users: ${response.status} ${response.statusText}`);
          }
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
    }
  }, [isOpen, toRole, view]);

  const handleSelectRecipient = (user) => {
    setSelectedUser(user);
    setView('compose');
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setView('select');
        setSelectedUser(null);
      }}
      title={view === 'select' ? 'Select Recipient' : 'Send Email to Team'}
    >
      {view === 'select' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Send to:
            </label>
            {availableRoles.length === 0 ? (
              <p className="text-sm text-gray-500">Loading recipient options...</p>
            ) : (
              <select
                value={toRole}
                onChange={(e) => setToRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {loadingUsers ? (
            <p className="text-gray-500">Loading users...</p>
          ) : !toRole ? (
            <p className="text-gray-500">Select a role to load users.</p>
          ) : users.length === 0 ? (
            <p className="text-gray-500">No {toRole}s found.</p>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select recipient:
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectRecipient(user)}
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
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-700">Recipient</p>
                <p className="text-sm">
                  {selectedUser?.first_name} {selectedUser?.last_name}
                </p>
                <p className="text-xs text-gray-500">{selectedUser?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setView('select')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Change recipient
              </button>
            </div>
          </div>

          <EmailForm user={selectedUser} close={onClose} />
        </div>
      )}
    </Modal>
  );
};

export default EmailFromAccountModal;