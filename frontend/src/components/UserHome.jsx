import React from 'react';

function UserHome({ user }) {
    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user.firstName || user.fullName}!</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Account</h3>
                    <p className="text-gray-600">Manage your personal information and settings</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Recent Activity</h3>
                    <p className="text-gray-600">View your recent transactions and activities</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Quick Actions</h3>
                    <p className="text-gray-600">Access frequently used features</p>
                </div>
            </div>
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium">{user.email}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Role:</span>
                        <p className="font-medium">{user.role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserHome;
