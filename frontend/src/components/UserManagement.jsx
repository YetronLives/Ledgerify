import React, { useState } from 'react';
import { IconPlusCircle, IconMail } from './Icons';
import CreateUserForm from './CreateUserForm';
import EditUserForm from './EditUserForm';
import SuspendUserForm from './SuspendUserForm';
import EmailForm from './EmailForm';
import Modal from './Modal';

const UserManagement = ({ mockUsers, updateUserInApp, addUserToApp }) => {
    const [users, setUsers] = useState(mockUsers);
    const [filter, setFilter] = useState('all');
    const [modalContent, setModalContent] = useState(null);

    const openModal = (type, userData) => setModalContent({ type, userData });
    const closeModal = () => setModalContent(null);

    const updateUser = (username, updatedData) => {
        const updatedUsers = { ...users, [username]: { ...users[username], ...updatedData } };
        setUsers(updatedUsers);
        updateUserInApp(username, updatedData);
    };
    
    const addUser = (newUser) => {
        const username = newUser.username.toLowerCase();
        const updatedUsers = { ...users, [username]: newUser };
        setUsers(updatedUsers);
        addUserToApp(newUser);
    };

    const filteredUsers = Object.entries(users).filter(([, user]) => {
        if (filter === 'expired') {
            return new Date(user.passwordExpires) < new Date();
        }
        return true;
    });

    const getModalTitle = () => {
        if (!modalContent) return '';
        switch (modalContent.type) {
            case 'suspend': return 'Suspend User';
            case 'email': return `Email ${modalContent.userData.fullName}`;
            case 'create': return 'Create New User';
            case 'edit': return `Edit User: ${modalContent.userData.fullName}`;
            default: return '';
        }
    };

    const renderModalContent = () => {
        if (!modalContent) return null;
        switch (modalContent.type) {
            case 'suspend': return <SuspendUserForm user={modalContent.userData} close={closeModal} updateUser={updateUser} />;
            case 'email': return <EmailForm user={modalContent.userData} close={closeModal} />;
            case 'create': return <CreateUserForm close={closeModal} addUserToApp={addUser} />;
            case 'edit': return <EditUserForm user={modalContent.userData} close={closeModal} updateUser={updateUser} />;
            default: return null;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <Modal isOpen={!!modalContent} onClose={closeModal} title={getModalTitle()}>
                {renderModalContent()}
            </Modal>
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
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(([username, user]) => (
                            <tr key={username} className="border-b">
                                <td className="p-3">{username}</td>
                                <td className="p-3 font-medium">{user.fullName}</td>
                                <td className="p-3">{user.role}</td>
                                <td className="p-3"><span className={`px-3 py-1 text-sm rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : user.status === 'Inactive' ? 'bg-gray-200 text-gray-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span></td>
                                <td className="p-3">
                                    {user.passwordExpires ? (
                                        <div>
                                            <div className={`text-sm ${new Date(user.passwordExpires) < new Date() ? 'text-red-600 font-semibold' : new Date(user.passwordExpires) < new Date(Date.now() + 24*60*60*1000) ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                                                {new Date(user.passwordExpires).toLocaleDateString()}
                                            </div>
                                            {new Date(user.passwordExpires) < new Date() && (
                                                <span className="text-xs text-red-500 font-bold">EXPIRED</span>
                                            )}
                                            {new Date(user.passwordExpires) >= new Date() && new Date(user.passwordExpires) < new Date(Date.now() + 24*60*60*1000) && (
                                                <span className="text-xs text-orange-500 font-bold">EXPIRES SOON</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-sm">Not set</span>
                                    )}
                                </td>
                                <td className="p-3 flex space-x-2 items-center">
                                    <button onClick={() => openModal('edit', { ...user, username })} className="text-blue-600 hover:underline text-sm">Edit</button>
                                    <button onClick={() => openModal('suspend', { ...user, username })} className="text-red-600 hover:underline text-sm">Suspend</button>
                                    <button onClick={() => openModal('email', { ...user, username })} className="text-gray-600 hover:text-black"><IconMail className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
