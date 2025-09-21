import React, { useState, useRef } from 'react';
import { IconLoading } from './Icons';

function EditUserForm({ user, close, updateUser }) {
    const [isLoading, setIsLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const formRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(formRef.current);
        const updatedUserData = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            role: formData.get('role'),
            status: formData.get('status'),
        };

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        updateUser(user.username, updatedUserData);

        setIsLoading(false);
        setShowNotification(true);

        setTimeout(() => {
            close();
        }, 2000);
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
