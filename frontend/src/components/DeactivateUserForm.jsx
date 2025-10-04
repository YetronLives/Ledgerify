import React, { useState } from 'react';
import { IconLoading } from './ui/Icons';

function DeactivateUserForm({ user, close, updateUser }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isActive = user.status === 'Active';
    const newStatus = isActive ? 'Inactive' : 'Active';
    const actionText = isActive ? 'deactivate' : 'activate';
    const actionTextCap = isActive ? 'Deactivate' : 'Activate';

    const handleConfirm = async () => {
        setIsLoading(true);
        setError('');

        try {
            // Call backend API to toggle user status
            const identifier = user.username || user.email;
            const response = await fetch(`http://localhost:5000/users/${encodeURIComponent(identifier)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    account_status: !isActive
                }),
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                throw new Error(`Server returned invalid JSON. Status: ${response.status}. This usually means the backend server is not running or there's a network issue.`);
            }

            if (!response.ok) {
                throw new Error(data.error || `Failed to ${actionText} user (Status: ${response.status})`);
            }

            // Update local state with the response data
            const frontendUserData = {
                firstName: data.user.first_name,
                lastName: data.user.last_name,
                fullName: `${data.user.first_name} ${data.user.last_name}`,
                email: data.user.email,
                role: data.user.role,
                status: data.user.account_status ? 'Active' : 'Inactive',
                username: data.user.username,
                address: data.user.address,
                dateOfBirth: data.user.date_of_birth,
                passwordExpires: data.user.password_expires,
            };

            updateUser(user.username || user.email, frontendUserData);
            close();

        } catch (error) {
            console.error(`Error ${actionText}ing user:`, error);
            setError(error.message || `Failed to ${actionText} user`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="text-center mb-6">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    isActive ? 'bg-red-100' : 'bg-green-100'
                }`}>
                    {isActive ? (
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                        </svg>
                    ) : (
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {actionTextCap} User Account
                </h3>
                <p className="text-gray-600">
                    Are you sure you want to {actionText} <strong>{user.fullName}</strong>'s account?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    {isActive 
                        ? "This will prevent the user from logging into the system." 
                        : "This will allow the user to log into the system again."
                    }
                </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Current Status:</span>
                    <span className={`px-3 py-1 rounded-full font-medium ${
                        isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-200 text-gray-800'
                    }`}>
                        {user.status}
                    </span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-600">New Status:</span>
                    <span className={`px-3 py-1 rounded-full font-medium ${
                        !isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-200 text-gray-800'
                    }`}>
                        {newStatus}
                    </span>
                </div>
            </div>

            {error && (
                <div className="text-center text-red-600 font-semibold mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            <div className="flex justify-end space-x-3">
                <button
                    onClick={close}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 flex items-center space-x-2 ${
                        isActive 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    {isLoading && <IconLoading className="w-4 h-4" />}
                    <span>{actionTextCap}</span>
                </button>
            </div>
        </div>
    );
}

export default DeactivateUserForm;
