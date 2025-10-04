import React, { useState, useEffect } from 'react';

// Minimal component placeholders (Assuming Icons and Modal are imported or defined elsewhere in the actual project structure)
const IconMail = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const IconCheckCircle = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IconLoading = ({ className }) => <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

// Mock Modal implementation for Dashboard to use (Needed here because Dashboard is independent)
function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
}

// --- Request Inbox Component ---
function RequestInbox({ requests, handleRequest }) {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const openDetails = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleAction = async (request, action) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing delay
        handleRequest(request.id, action);
        setIsLoading(false);
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    if (requests.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-dashed border-gray-300 text-center mb-6">
                <p className="text-gray-500 font-semibold">No pending registration requests.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-bold text-gray-700 flex items-center space-x-2 mb-4">
                <IconMail className="w-6 h-6 text-yellow-500" />
                <span>Pending Registration Requests ({requests.length})</span>
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">Full Name</th>
                            <th className="p-3">Requested Role</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((request) => (
                            <tr key={request.id} className="border-b hover:bg-yellow-50/50 cursor-pointer" onClick={() => openDetails(request)}>
                                <td className="p-3 font-medium">{request.firstName} {request.lastName}</td>
                                <td className="p-3">{request.role}</td>
                                <td className="p-3 text-sm text-gray-500">{request.email}</td>
                                <td className="p-3">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); openDetails(request); }} 
                                        className="text-blue-600 hover:underline text-sm font-semibold"
                                    >
                                        Review
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedRequest && (
                <Modal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    title="Review Registration Request"
                >
                    <div className="space-y-3">
                        <p><strong>Name:</strong> {selectedRequest.firstName} {selectedRequest.lastName}</p>
                        <p><strong>Email:</strong> {selectedRequest.email}</p>
                        <p><strong>Requested Role:</strong> <span className="font-semibold text-blue-600">{selectedRequest.role}</span></p>
                        <p><strong>Date of Birth:</strong> {selectedRequest.dateOfBirth}</p>
                        <hr className="mt-4 mb-4"/>
                        <p className="text-sm text-gray-500">
                            Note: Upon approval, an email will be sent to the new user with a link to login to the system and a temporary password. The account status will be set to 'Active'.
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button 
                            onClick={() => handleAction(selectedRequest, 'deny')}
                            disabled={isLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isLoading && <IconLoading className="w-4 h-4 mr-2" />}
                            <span>Deny</span>
                        </button>
                        <button 
                            onClick={() => handleAction(selectedRequest, 'approve')}
                            disabled={isLoading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isLoading && <IconLoading className="w-4 h-4 mr-2" />}
                            <span>Approve</span>
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// --- Dashboard Component ---
function Dashboard({ user, mockUsers, pendingRequests, handleRequest, setPage }) { // <-- ACCEPT setPage
    if (!user) {
        return null;
    }
    
    const usersData = mockUsers || {}; 

    const userStats = Object.values(usersData);
    const totalUsers = userStats.length;
    const activeUsers = userStats.filter(u => u.status === 'Active').length;
    const inactiveUsers = userStats.filter(u => u.status === 'Inactive').length;
    const expiredPasswords = userStats.filter(u => new Date(u.passwordExpires) < new Date()).length;

    const isAdmin = user.role === 'Administrator';


    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user.firstName || user.fullName}!</h2>
            
            {/* 1. Request Inbox (Visible to Admin only) */}
            {isAdmin && (
                <RequestInbox 
                    requests={pendingRequests} 
                    handleRequest={handleRequest} 
                />
            )}

            {/* 2. Content Block: Admin Stats or Role-Specific Overview */}
            {isAdmin ? (
                // ADMIN VIEW
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-lg font-semibold text-gray-700">Total Users</h3><p className="text-3xl font-bold text-blue-500 mt-2">{totalUsers}</p></div>
                    <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-lg font-semibold text-gray-700">Active Users</h3><p className="text-3xl font-bold text-green-500 mt-2">{activeUsers}</p></div>
                    <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-lg font-semibold text-gray-700">Inactive Users</h3><p className="text-3xl font-bold text-gray-500 mt-2">{inactiveUsers}</p></div>
                    <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-lg font-semibold text-gray-700">Expired Passwords</h3><p className="text-3xl font-bold text-red-500 mt-2">{expiredPasswords}</p></div>
                </div>
            ) : (
                // MANAGER/ACCOUNTANT VIEW
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">System Overview</h3>
                    <p className="text-gray-600">
                        {user.role === 'Manager'
                            ? "As a Manager, your dashboard provides links to review financial reports and approve transactions."
                            : "Welcome to the Accounting Dashboard. Get started by navigating to the Chart of Accounts or Journal Entries to begin your work."
                        }
                    </p>
                    
                    {/* MODIFIED: Quick action buttons now call setPage */}
                    <div className="mt-4 flex flex-wrap gap-3">
                         {user.role === 'Manager' && (
                             <>
                                 <button onClick={() => setPage('reports')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150">Review Reports</button>
                                 <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-150">Approve Transactions</button>
                             </>
                         )}
                         {user.role === 'Accountant' && (
                             <>
                                 <button onClick={() => setPage('journal')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition duration-150">Start New Journal Entry</button>
                                 <button onClick={() => setPage('accounts')} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-150">View Chart of Accounts</button>
                             </>
                         )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;