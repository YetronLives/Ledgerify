import React, { useState, useRef } from 'react';
import { IconLoading } from '../ui/Icons';

function EditUserForm({ user, close, updateUser }) {
    const [isLoading, setIsLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [error, setError] = useState('');
    const formRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(''); // Clear any previous errors

        const formData = new FormData(formRef.current);
        const fullName = formData.get('fullName');
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const updatedUserData = {
            first_name: firstName,
            last_name: lastName,
            email: formData.get('email'),
            role: formData.get('role'),
            account_status: formData.get('status') === 'Active',
            address: formData.get('address'),
            date_of_birth: formData.get('dob')
        };

        try {
            // Call backend API to update user
            const identifier = user.username || user.email;
            const url = `http://localhost:5000/users/${encodeURIComponent(identifier)}`;
            
            console.log('Updating user:', { identifier, url, updatedUserData });
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUserData),
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                throw new Error(`Server returned invalid JSON. Status: ${response.status}. This usually means the backend server is not running or there's a network issue.`);
            }

            if (!response.ok) {
                throw new Error(data.error || `Failed to update user (Status: ${response.status})`);
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
            setShowNotification(true);

            setTimeout(() => {
                close();
            }, 2000);

        } catch (error) {
            console.error('Error updating user:', error);
            setError(error.message || 'Failed to update user');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                    Edit User: {user.fullName}
                </h2>
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-600 mb-2">Username</label>
                        <input
                            name="username"
                            type="text"
                            defaultValue={user.username}
                            disabled
                            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 mb-2">Full Name</label>
                        <input
                            name="fullName"
                            type="text"
                            defaultValue={user.fullName}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 mb-2">Email</label>
                        <input
                            name="email"
                            type="email"
                            defaultValue={user.email}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 mb-2">Address</label>
                        <input
                            name="address"
                            type="text"
                            defaultValue={user.address}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 mb-2">Date of Birth</label>
                        <input
                            name="dob"
                            type="date"
                            defaultValue={user.dateOfBirth}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 mb-2">Role</label>
                        <select
                            name="role"
                            defaultValue={user.role}
                            required
                            className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Accountant">Accountant</option>
                            <option value="Manager">Manager</option>
                            <option value="Administrator">Administrator</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-600 mb-2">Status</label>
                        <select
                            name="status"
                            defaultValue={user.status}
                            required
                            className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </div>
                    {showNotification && (
                        <div className="text-center text-green-600 font-semibold mt-4">Changes saved successfully!</div>
                    )}
                    {error && (
                        <div className="text-center text-red-600 font-semibold mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}
                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={close}
                            className="px-4 py-2 bg-gray-200 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isLoading && <IconLoading className="w-5 h-5" />}
                            <span>Save Changes</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditUserForm;
