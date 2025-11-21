import React from 'react';
import { IconDashboard, IconJournal, IconReports, IconUsers, IconChartOfAccounts, IconPlusCircle } from './ui/Icons';

// An icon for the notification
const IconBell = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

function UserHome({ user, setPage, pendingEntriesCount }) {
    const isManager = user.role === 'Manager';
    const isAccountant = user.role === 'Accountant';
    const isAdmin = user.role === 'Administrator' || user.role === 'Admin';
    const hasPendingEntries = pendingEntriesCount > 0;

    const handleViewPending = () => {
        if (setPage) {
            setPage('journal');
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome back, {user.firstName || user.fullName}!</h2>

            {/* --- NOTIFICATION SECTION --- */}
            <div className="mb-8 space-y-4">
                {/* Manager: Pending Actions */}
                {isManager && hasPendingEntries && (
                    <div 
                        className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-yellow-200 transition-colors flex items-center"
                        onClick={handleViewPending}
                        role="alert"
                    >
                        <IconBell className="w-6 h-6 mr-3 text-yellow-600" />
                        <div>
                            <p className="font-bold">Action Required</p>
                            <p>
                                You have {pendingEntriesCount} journal {pendingEntriesCount === 1 ? 'entry' : 'entries'} pending review.
                                <span className="font-semibold underline ml-2 text-yellow-900">Review now &rarr;</span>
                            </p>
                        </div>
                    </div>
                )}
                
                 {/* Admin Welcome/Status */}
                {isAdmin && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg shadow-sm flex items-center">
                         <IconUsers className="w-6 h-6 mr-3" />
                        <div>
                            <p className="font-bold">System Status</p>
                            <p>User management and system logs are active. Check the Dashboard for user statistics.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* --- QUICK ACCESS MENU (Role Based) --- */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Access</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Admin Actions */}
                    {isAdmin && (
                        <>
                            <MenuCard 
                                icon={<IconUsers className="w-8 h-8 text-blue-500" />}
                                title="User Management"
                                desc="Manage accounts, roles, and statuses."
                                onClick={() => setPage('users')}
                            />
                             <MenuCard 
                                icon={<IconDashboard className="w-8 h-8 text-purple-500" />}
                                title="Admin Dashboard"
                                desc="View system stats and user activity."
                                onClick={() => setPage('dashboard')}
                            />
                        </>
                    )}

                    {/* Manager/Accountant Actions */}
                    {(isManager || isAccountant || isAdmin) && (
                        <MenuCard 
                            icon={<IconChartOfAccounts className="w-8 h-8 text-teal-500" />}
                            title="Chart of Accounts"
                            desc="View and manage financial accounts."
                            onClick={() => setPage('accounts')}
                        />
                    )}

                    {(isManager || isAccountant || isAdmin) && (
                         <MenuCard 
                            icon={<IconJournal className="w-8 h-8 text-emerald-500" />}
                            title="Journal Entries"
                            desc={isManager ? "Approve pending transactions." : "Record new transactions."}
                            onClick={() => setPage('journal')}
                        />
                    )}

                    {(isManager || isAccountant || isAdmin) && (
                         <MenuCard 
                            icon={<IconReports className="w-8 h-8 text-orange-500" />}
                            title="Financial Reports"
                            desc="Generate Balance Sheet, Income Statement..."
                            onClick={() => setPage('reports')}
                        />
                    )}
                    
                    {/* Generic Help */}
                     <MenuCard 
                        icon={<IconPlusCircle className="w-8 h-8 text-gray-500" />}
                        title="Help & Support"
                        desc="View guides and documentation."
                        onClick={() => setPage('help')}
                    />
                </div>
            </div>

             <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Account Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500 block">Full Name</span>
                        <span className="font-medium">{user.fullName}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Role</span>
                        <span className="font-medium">{user.role}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Email</span>
                        <span className="font-medium">{user.email}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Component for Menu Cards
function MenuCard({ icon, title, desc, onClick }) {
    return (
        <button 
            onClick={onClick}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-left flex items-start space-x-4 group"
        >
            <div className="p-3 bg-gray-50 rounded-full group-hover:bg-gray-100 transition-colors">
                {icon}
            </div>
            <div>
                <h4 className="text-lg font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">{title}</h4>
                <p className="text-gray-600 text-sm mt-1">{desc}</p>
            </div>
        </button>
    );
}

export default UserHome;
