import React from 'react';

function Dashboard({ user, mockUsers }) {
    const userStats = Object.values(mockUsers);
    const totalUsers = userStats.length;
    const activeUsers = userStats.filter(u => u.status === 'Active').length;
    const inactiveUsers = userStats.filter(u => u.status === 'Inactive').length;
    const expiredPasswords = userStats.filter(u => new Date(u.passwordExpires) < new Date()).length;

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user.fullName}!</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-lg font-semibold text-gray-700">Total Users</h3><p className="text-3xl font-bold text-blue-500 mt-2">{totalUsers}</p></div>
                <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-lg font-semibold text-gray-700">Active Users</h3><p className="text-3xl font-bold text-green-500 mt-2">{activeUsers}</p></div>
                <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-lg font-semibold text-gray-700">Inactive Users</h3><p className="text-3xl font-bold text-gray-500 mt-2">{inactiveUsers}</p></div>
                <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-lg font-semibold text-gray-700">Expired Passwords</h3><p className="text-3xl font-bold text-red-500 mt-2">{expiredPasswords}</p></div>
            </div>
        </div>
    );
}

export default Dashboard;
