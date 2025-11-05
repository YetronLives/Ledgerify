import React from 'react';

// An icon for the notification
const IconBell = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);


function UserHome({ user, setPage, pendingEntriesCount }) {
    const isManager = user.role === 'Manager';
    const hasPendingEntries = pendingEntriesCount > 0;

    const handleViewPending = () => {
        if (setPage) {
            setPage('journal');
        }
    };

    return (
        <div>
            {/* Pending Entries Notification for Manager */}
            {isManager && hasPendingEntries && (
                <div 
                    className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md cursor-pointer hover:bg-yellow-200 transition-colors"
                    onClick={handleViewPending}
                    role="alert"
                >
                    <div className="flex items-center">
                        <IconBell className="w-6 h-6 mr-3" />
                        <div>
                            <p className="font-bold">Pending Actions Required</p>
                            <p>
                                You have {pendingEntriesCount} journal {pendingEntriesCount === 1 ? 'entry' : 'entries'} pending your review.
                                <span className="font-semibold underline ml-2">View now &rarr;</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

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
