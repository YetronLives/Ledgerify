import React, { useState, useId } from 'react';
import LoginScreen from './components/LoginScreen';
import RegistrationRequestScreen from './components/RegistrationRequestScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import PlaceholderScreen from './components/PlaceholderScreen';
import { IconLogo, IconLoading } from './components/Icons';
// eslint-disable-next-line
import Modal from './components/Modal'; // Import the Modal component

// --- MOCK DATA ---
const mockUsers = {
    'meriam': { password: 'ledger1!', email: 'meriam@ledgerify.com', fullName: 'Meriam', role: 'Administrator', status: 'Active', passwordExpires: '2025-12-25', securityQuestion: 'What was your first pet\'s name?', securityQuestion2: 'In what city were you born?', securityAnswer: 'Leo', securityAnswer2: 'Atlanta' },
    'shams': { password: 'ledger1!', email: 'shams@ledgerify.com', fullName: 'Shams', role: 'Manager', status: 'Active', passwordExpires: '2026-09-18', securityQuestion: 'What was the model of your first car?', securityQuestion2: 'What is your mother\'s maiden name?', securityAnswer: 'Civic', securityAnswer2: 'Jones' },
    'constant': { password: 'ledger1!', email: 'constant@ledgerify.com', fullName: 'Constant', role: 'Accountant', status: 'Inactive', passwordExpires: '2025-01-10', securityQuestion: 'What is your mother\'s maiden name?', securityQuestion2: 'In what city were you born?', securityAnswer: 'Jones', securityAnswer2: 'Atlanta' },
    'dj': { password: 'ledger1!', email: 'dj@example.com', fullName: 'DJ', role: 'Accountant', status: 'Suspended', suspendUntil: '2025-10-01', passwordExpires: '2025-11-11', securityQuestion: 'What was the model of your first car?', securityQuestion2: 'What is your mother\'s maiden name?', securityAnswer: 'Civic', securityAnswer2: 'Jones'},
    'alix': { password: 'ledger1!', email: 'alix@example.com', fullName: 'Alix', role: 'Accountant', status: 'Active', passwordExpires: '2026-08-01', securityQuestion: 'In what city were you born?', securityQuestion2: 'What was the model of your first car?', securityAnswer: 'Atlanta', securityAnswer2: 'G-Wagon'},
};


function App() {

    const allSecurityQuestions = Object.values(mockUsers).flatMap(u => [u.securityQuestion, u.securityQuestion2]);
    const uniqueSecurityQuestions = [...new Set(allSecurityQuestions)];
    const uniqueId = useId(); 

    // State
    const [users, setUsers] = useState(mockUsers);
    const [user, setUser] = useState(null);
    const [page, setPage] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loginView, setLoginView] = useState('login');
    const [pendingRequests, setPendingRequests] = useState([]); 

    // Functions
    const onLogin = (username, password) => {
        const lowercasedUsername = username.toLowerCase();
        const userData = users[lowercasedUsername];
    
        if (!userData || userData.password !== password) return 'Invalid';
        
        if (userData.status === 'Active' || (userData.status === 'Suspended' && userData.suspendUntil && new Date() > new Date(userData.suspendUntil))) {
            setUser({ username: lowercasedUsername, ...userData });
            setLoginView('login');
            return undefined;
        } else {
            return userData.status;
        }
    };

    const updateUserInApp = (username, updatedData) => {
        setUsers(prevUsers => ({ ...prevUsers, [username]: { ...prevUsers[username], ...updatedData } }));
    };

    const addUserToApp = (newUser) => {
        // --- FIX: Add robust check for username before processing ---
        if (!newUser || typeof newUser.username !== 'string' || newUser.username.trim() === '') {
            console.error("CRITICAL ERROR: Attempted to add user without a valid username.", newUser);
            return;
        }

        const username = newUser.username.toLowerCase(); // Safe now
        // --- END FIX ---
        
        // When adding an approved user (from request) we use firstName/lastName
        // When adding a user directly (from CreateUserForm), we use fullName
        const fullName = newUser.fullName || `${newUser.firstName} ${newUser.lastName}`;


        const newUserData = {
            password: newUser.password, 
            email: newUser.email,
            fullName: fullName,
            role: newUser.role,
            status: newUser.status || 'Active', // Status will be provided by CreateUserForm, defaults to Active if from request
            passwordExpires: newUser.passwordExpires || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            securityQuestion: newUser.securityQuestion1 || newUser.securityQuestion,
            securityQuestion2: newUser.securityQuestion2 || newUser.securityQuestion2,
            securityAnswer: newUser.securityAnswer1 || newUser.securityAnswer,
            securityAnswer2: newUser.securityAnswer2 || newUser.securityAnswer2,
        };

        setUsers(prevUsers => ({ ...prevUsers, [username]: newUserData }));
        console.log(`[App] User Added/Approved. Username: ${username}`, newUserData);
    };
    
    // Handler for new registration requests coming from the login screen
    const addRegistrationRequest = (requestData) => {
        const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        setPendingRequests(prev => [...prev, { id: requestId, ...requestData }]);
        console.log("[App] New Registration Request Added:", requestId);
    }
    
    // Handler for approving or denying a request from the Dashboard
    const handleRequest = (requestId, action) => {
        setPendingRequests(prevRequests => {
            const requestIndex = prevRequests.findIndex(req => req.id === requestId);
            if (requestIndex === -1) return prevRequests;

            const request = prevRequests[requestIndex];

            if (action === 'approve') {
                // APPROVE: Generate a temporary username based on first/last name and add to the main users list
                const baseUsername = request.firstName.toLowerCase().substring(0, 3) + request.lastName.toLowerCase().substring(0, 3);
                let username = baseUsername;
                let counter = 10;
                while (users[username] && counter < 100) {
                    username = baseUsername + counter;
                    counter++;
                }

                // Append the generated username to the request data before adding
                const userToApprove = { ...request, username };
                addUserToApp(userToApprove); 
            } else {
                // DENY: Log denial
                console.log(`[App] Request ${requestId} denied.`);
            }

            // Remove the request from the pending list
            return prevRequests.filter(req => req.id !== requestId);
        });
    }

    const logout = () => {
        setUser(null);
        setPage('dashboard');
    };

    // Render Logic
    if (!user) {
        if (loginView === 'register') return <RegistrationRequestScreen setLoginView={setLoginView} securityQuestions={uniqueSecurityQuestions} onSubmitRequest={addRegistrationRequest} />; 
        if (loginView === 'forgot') return <ForgotPasswordScreen setLoginView={setLoginView} mockUsers={users} updateUserInApp={updateUserInApp} />;
        return <LoginScreen onLogin={onLogin} setLoginView={setLoginView} mockUsers={users} />;
    }
    
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', roles: ['Administrator', 'Manager', 'Accountant'] },
        { id: 'accounts', label: 'Chart of Accounts', roles: ['Administrator', 'Manager', 'Accountant'] },
        { id: 'journal', label: 'Journal Entries', roles: ['Administrator', 'Manager', 'Accountant'] },
        { id: 'reports', label: 'Financial Reports', roles: ['Administrator', 'Manager', 'Accountant'] },
        { id: 'users', label: 'User Management', roles: ['Administrator'] },
        { id: 'help', label: 'Help', roles: ['Administrator', 'Manager', 'Accountant'] },
    ];

    const allowedNavItems = navItems.filter(item => user.role && item.roles.includes(user.role));

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <aside className={`bg-emerald-500 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-20`}>
                <div className="flex items-center space-x-2 px-4">
                    <IconLogo className="w-8 h-8"/>
                    <span className="text-xl font-bold">Ledgerify</span>
                </div>
                <nav>
                    {allowedNavItems.map(item => (
                        <button key={item.id} onClick={() => { setPage(item.id); setIsMobileMenuOpen(false); }}
                            className={`w-full text-left flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 hover:bg-emerald-700 ${page === item.id ? 'bg-emerald-900' : ''}`}>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="absolute bottom-0 w-full p-4 left-0">
                    <button onClick={logout} className="w-full text-left flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 hover:bg-emerald-700">
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-4 bg-white border-b-2 border-gray-200">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-500 focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <h1 className="text-2xl font-semibold text-gray-800 capitalize">{page.replace('_', ' ')}</h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                           <span className="text-gray-600 font-semibold">{user.fullName}</span>
                           <span className="text-gray-400 text-sm block">{user.role}</span>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
                    {page === 'dashboard' && <Dashboard user={user} mockUsers={users} pendingRequests={pendingRequests} handleRequest={handleRequest} />} 
                    {page === 'accounts' && <PlaceholderScreen title="Chart of Accounts" message="Chart of Accounts module under construction." />}
                    {page === 'journal' && <PlaceholderScreen title="Journal Entries" message="Journal Entries module under construction." />}
                    {page === 'reports' && <PlaceholderScreen title="Financial Reports" message="Financial Reports module under construction." />}
                    {page === 'users' && <UserManagement mockUsers={users} updateUserInApp={updateUserInApp} addUserToApp={addUserToApp} />}
                    {page === 'help' && <PlaceholderScreen title="Help" message="Welcome to the Help Center. Instructions on using the app will appear here." />}
                </main>
            </div>
        </div>
    );
}

export default App;
