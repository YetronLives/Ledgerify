import React, { useState } from 'react';
import { IconMail, IconPlusCircle, IconLoading } from './Icons';
import Modal from './Modal';
import CreateUserForm from './CreateUserForm';
import EditUserForm from './EditUserForm';

function UserManagement({ mockUsers }) {
    // eslint-disable-next-line
  const [users, setUsers] = useState(mockUsers);
  const [filter, setFilter] = useState('all');
  const [modalContent, setModalContent] = useState(null);

  const openModal = (type, userData) => {
    setModalContent({ type, userData });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const filteredUsers = Object.entries(users).filter(([, user]) => {
    if (filter === 'expired') {
      return new Date(user.passwordExpires) < new Date();
    }
    return true;
  });

  const SuspendUserForm = ({ user, close }) => {
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(`User ${user.fullName} suspended.`);
      setIsLoading(false);
      close();
    };

    return (
      <form onSubmit={handleSubmit}>
        <p className="mb-4">Suspend user: <strong>{user.fullName}</strong></p>
        <label className="block text-gray-600 mb-2">Suspend Until</label>
        <input type="date" className="w-full px-4 py-2 border rounded-lg" />
        <div className="flex justify-end space-x-2 mt-4">
          <button type="button" onClick={close} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
            {isLoading && <IconLoading className="w-5 h-5" />}
            <span>Suspend</span>
          </button>
        </div>
      </form>
    );
  };

  const EmailForm = ({ user, close }) => {
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(`Email sent to ${user.fullName}.`);
      setIsLoading(false);
      close();
    };

    return (
      <form onSubmit={handleSubmit}>
        <p className="mb-4">Email user: <strong>{user.fullName}</strong></p>
        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Subject</label>
          <input type="text" className="w-full px-4 py-2 border rounded-lg" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-600 mb-2">Body</label>
          <textarea className="w-full px-4 py-2 border rounded-lg" rows={4} required></textarea>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button type="button" onClick={close} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
            {isLoading && <IconLoading className="w-5 h-5" />}
            <span>Send Email</span>
          </button>
        </div>
      </form>
    );
  };

  const getModalTitle = () => {
    if (!modalContent) return '';
    switch (modalContent.type) {
      case 'suspend': return 'Suspend User';
      case 'email': return `Email ${modalContent.userData?.fullName}`;
      case 'create': return 'Create New User';
      case 'edit': return `Edit User: ${modalContent.userData?.fullName}`;
      default: return '';
    }
  }

  const renderModalContent = () => {
    if (!modalContent) return null;
    switch (modalContent.type) {
      case 'suspend': return <SuspendUserForm user={modalContent.userData} close={closeModal} />;
      case 'email': return <EmailForm user={modalContent.userData} close={closeModal} />;
      case 'create': return <CreateUserForm close={closeModal} />;
      case 'edit': return <EditUserForm user={modalContent.userData} close={closeModal} />;
      default: return null;
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {modalContent && (
        <Modal isOpen={!!modalContent} onClose={closeModal} title={getModalTitle()}>
          {renderModalContent()}
        </Modal>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-4 md:mb-0">User Management</h2>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-600">Filter:</span>
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>All</button>
          <button onClick={() => setFilter('expired')} className={`px-4 py-2 rounded-lg ${filter === 'expired' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Expired Passwords</button>
          <button onClick={() => openModal('create')} className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 flex items-center space-x-2"><IconPlusCircle /><span>Create User</span></button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Username</th>
              <th className="p-3">Full Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Password Expires</th>
              <th className="p-3">Email</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(([username, user]) => (
              <tr key={username} className="border-b">
                <td className="p-3">{username}</td>
                <td className="p-3 font-medium">{user.fullName}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">
                  <span className={`px-3 py-1 text-sm rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : user.status === 'Inactive' ? 'bg-gray-200 text-gray-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span>
                </td>
                <td className="p-3">{user.passwordExpires}</td>
                <td className="p-3">
                  <button onClick={() => openModal('email', { ...user, username })} className="text-gray-600 hover:text-black"><IconMail className="w-5 h-5"/></button>
                </td>
                <td className="p-3 flex space-x-2 items-center">
                  <button onClick={() => openModal('edit', { ...user, username })} className="text-blue-600 hover:underline text-sm">Edit</button>
                  <button onClick={() => openModal('suspend', { ...user, username })} className="text-red-600 hover:underline text-sm">Suspend</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
