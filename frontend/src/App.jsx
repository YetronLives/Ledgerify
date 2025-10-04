import React, { useState, useId, useEffect } from 'react';
import LoginScreen from './components/auth/LoginScreen';
import RegistrationRequestScreen from './components/auth/RegistrationRequestScreen';
import ForgotPasswordScreen from './components/auth/ForgotPasswordScreen';
import Dashboard from './components/ui/Dashboard';
import UserManagement from './components/userManagement/UserManagement';
import PlaceholderScreen from './components/ui/PlaceholderScreen';
import ChartOfAccounts from './components/chartOfAccounts/ChartOfAccounts';
import AccountLedger from './components/chartOfAccounts/AccountLedger'; 
import { IconLogo, IconLoading, UserAvatar } from './components/ui/Icons'; 
// eslint-disable-next-line
import Modal from './components/ui/Modal'; 

// --- MOCK DATA ---
const mockUsers = {
    'meriam': { password: 'ledger1!', email: 'meriam@ledgerify.com', fullName: 'Meriam', role: 'Administrator', status: 'Active', passwordExpires: '2025-10-02', securityQuestion: 'What was your first pet\'s name?', securityQuestion2: 'In what city were you born?', securityAnswer: 'Leo', securityAnswer2: 'Atlanta' }, 
    'shams': { password: 'ledger1!', email: 'shams@ledgerify.com', fullName: 'Shams', role: 'Manager', status: 'Active', passwordExpires: '2026-09-18', securityQuestion: 'What was the model of your first car?', securityQuestion2: 'What is your mother\'s maiden name?', securityAnswer: 'Civic', securityAnswer2: 'Jones' },
    'constant': { password: 'ledger1!', email: 'constant@ledgerify.com', fullName: 'Constant', role: 'Accountant', status: 'Active', passwordExpires: '2025-01-10', securityQuestion: 'What is your mother\'s maiden name?', securityQuestion2: 'In what city were you born?', securityAnswer: 'Jones', securityAnswer2: 'Atlanta' },
    'dj': { password: 'ledger1!', email: 'dj@example.com', fullName: 'DJ', role: 'Accountant', status: 'Active', passwordExpires: '2025-11-11', securityQuestion: 'What was the model of your first car?', securityQuestion2: 'What is your mother\'s maiden name?', securityAnswer: 'Civic', securityAnswer2: 'Jones'},
    'alix': { password: 'ledger1!', email: 'alix@example.com', fullName: 'Alix', role: 'Accountant', status: 'Active', passwordExpires: '2026-08-01', securityQuestion: 'In what city were you born?', securityQuestion2: 'What was the model of your first car?', securityAnswer: 'Atlanta', securityAnswer2: 'G-Wagon'},
};

const initialAccounts = [
    // Assets (1000-1999)
    {number: '1010', name: 'Cash', description: 'Cash in checking and savings accounts.', normalSide: 'Debit', category: 'Assets', subcategory: 'Current Assets', initialBalance: 25000.00, debit: 5000, credit: 2000, balance: 28000.00, addedDate: '2025-01-15T10:00:00Z', userId: 'meriam',  order: '01', statement: 'BS', comment: 'Main operating account.'},
    // Liabilities (2000-2999)
    {number: '2010', name: 'Accounts Payable', description: 'Money the company owes to suppliers.', normalSide: 'Credit', category: 'Liabilities', subcategory: 'Current Liabilities', initialBalance: 8000.00, debit: 3000, credit: 10000, balance: 15000.00, addedDate: '2025-02-01T14:00:00Z', userId: 'meriam', order: '10', statement: 'BS', comment: 'Vendor invoices.'},
    // Equity (3000-3999)
    {number: '3010', name: 'Common Stock', description: 'Capital invested by shareholders.', normalSide: 'Credit', category: 'Equity', subcategory: 'Contributed Capital', initialBalance: 50000.00, debit: 0, credit: 0, balance: 50000.00, addedDate: '2025-01-10T09:00:00Z', userId: 'meriam', order: '20', statement: 'BS', comment: ''},
     // Revenue (4000-4999)
    {number: '4010', name: 'Service Revenue', description: 'Revenue from primary business operations.', normalSide: 'Credit', category: 'Revenue', subcategory: 'Operating Revenue', initialBalance: 0, debit: 0, credit: 85000, balance: 85000.00, addedDate: '2025-03-01T12:00:00Z', userId: 'meriam', order: '30', statement: 'IS', comment: 'YTD through Q3'},
    // Expenses (5000-5999)
    {number: '5010', name: 'Salaries Expense', description: 'Wages and salaries paid to employees.', normalSide: 'Debit', category: 'Expenses', subcategory: 'Operating Expenses', initialBalance: 0, debit: 45000, credit: 0, balance: 45000.00, addedDate: '2025-03-01T12:05:00Z', userId: 'meriam', order: '40', statement: 'IS', comment: ''},
];

// --- Function to generate a temporary, secure password ---
const generateTemporaryPassword = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
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
    const [notification, setNotification] = useState(null); 
    const [selectedLedgerAccount, setSelectedLedgerAccount] = useState(null); // State for ledger

    // Functions
    const onLogin = (username, password) => {
        const lowercasedUsername = username.toLowerCase();
        const userData = users[lowercasedUsername];
        
        if (!userData || userData.password !== password) return 'Invalid';
        
        if (userData.status === 'Active' || (userData.status === 'Suspended' && userData.suspendUntil && new Date() > new Date(userData.suspendUntil))) {
            
            // --- MODIFIED: PASSWORD EXPIRATION CHECK ---
            const passwordExpiryDate = new Date(userData.passwordExpires);
            const today = new Date();
            today.setHours(0, 0, 0, 0); 
            passwordExpiryDate.setHours(0, 0, 0, 0);

            const oneDay = 24 * 60 * 60 * 1000;
            const diffTime = passwordExpiryDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / oneDay);
            
            if (diffDays <= 3) {
                let message;
                let type;
                if (diffDays <= 0) {
                     message = "ERROR: Your password has EXPIRED! Please use the 'Forgot Password' link to reset it immediately.";
                     type = 'error';
                } else {
                     message = `WARNING: Your password will expire in ${diffDays} day${diffDays !== 1 ? 's' : ''} on ${userData.passwordExpires}! Please change it now.`;
                     type = 'warning';
                }
                setNotification({ type, message });
            } else {
                setNotification(null);
            }
            // --- END MODIFIED PASSWORD EXPIRATION CHECK ---

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
        if (!newUser || typeof newUser.username !== 'string' || newUser.username.trim() === '') {
            console.error("CRITICAL ERROR: Attempted to add user without a valid username.", newUser);
            return;
        }

        const username = newUser.username.toLowerCase();
        const fullName = newUser.fullName || `${newUser.firstName} ${newUser.lastName}`;


        const newUserData = {
            password: newUser.tempPassword || newUser.password || 'ledger1!', 
            email: newUser.email,
            fullName: fullName,
            role: newUser.role,
            status: newUser.status || 'Active', 
            passwordExpires: newUser.passwordExpires || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            securityQuestion: newUser.securityQuestion1 || newUser.securityQuestion,
            securityQuestion2: newUser.securityQuestion2 || newUser.securityQuestion2,
            securityAnswer: newUser.securityAnswer1 || newUser.securityAnswer,
            securityAnswer2: newUser.securityAnswer2 || newUser.securityAnswer2,
        };

        setUsers(prevUsers => ({ ...prevUsers, [username]: newUserData }));
        console.log(`[App] User Added/Approved. Username: ${username}`, newUserData);
    };
    
    const addRegistrationRequest = (requestData) => {
        const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        setPendingRequests(prev => [...prev, { id: requestId, ...requestData }]);
        console.log("[App] New Registration Request Added:", requestId);
    }
    
    const handleRequest = (requestId, action) => {
        setPendingRequests(prevRequests => {
            const requestIndex = prevRequests.findIndex(req => req.id === requestId);
            if (requestIndex === -1) return prevRequests;

            const request = prevRequests[requestIndex];

            if (action === 'approve') {
                const now = new Date();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const year = String(now.getFullYear()).slice(-2);

                const firstNameInitial = request.firstName.charAt(0).toLowerCase();
                const fullLastName = request.lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
                const dateSuffix = month + year;

                const initialBaseUsername = firstNameInitial + fullLastName + dateSuffix;

                let username = initialBaseUsername;
                let counter = 1;
                while (users[username]) {
                    username = initialBaseUsername + counter; 
                    counter++;
                }
                
                const tempPassword = generateTemporaryPassword();
                
                const userToApprove = { 
                    ...request, 
                    username, 
                    tempPassword, 
                    status: 'Active' 
                };
                addUserToApp(userToApprove); 
                
                const loginLink = window.location.origin;
                
                console.log(`[App] Approval Email SIMULATED SENT to ${request.email}`);
                console.log(`[App] New User Credentials: Username: ${username}, Password: ${tempPassword}`);
                
                alert(
                    `SUCCESS! User Approved.\n\n` +
                    `An email with the following details has been 'sent' to ${request.email}:\n\n` +
                    `LOGIN LINK: ${loginLink}\n` +
                    `TEMPORARY USERNAME: ${username}\n` +
                    `TEMPORARY PASSWORD: ${tempPassword}\n\n` +
                    `The user should use these credentials to log in for the first time.`
                );
            } else {
                console.log(`[App] Denial Email SIMULATED SENT to ${request.email}`);
            }

            return prevRequests.filter(req => req.id !== requestId);
        });
    }

    const logout = () => {
        setUser(null);
        setPage('dashboard');
        setNotification(null); 
    };
    
    // Notification clear effect removed to keep banner visible until dismissed/logout

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
                        <UserAvatar className="w-10 h-10" /> 
                        <div className="text-right">
                           <span className="text-gray-600 font-semibold">{user.fullName}</span>
                           <span className="text-gray-400 text-sm block">{user.role}</span>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
                    {notification && (
                        <div className={`p-4 mb-4 rounded-lg text-white font-semibold flex justify-between items-center ${notification.type === 'error' ? 'bg-red-600' : 'bg-yellow-600'}`}>
                            <span>{notification.message}</span>
                            <button onClick={() => setNotification(null)} className="text-white hover:text-gray-200 font-bold ml-4">
                                &times;
                            </button>
                        </div>
                    )}

                    {page === 'dashboard' && <Dashboard user={user} mockUsers={users} pendingRequests={pendingRequests} handleRequest={handleRequest} setPage={setPage} />} 
                    {page === 'accounts' && <ChartOfAccounts initialAccounts={initialAccounts} currentUser={user} setPage={setPage} setSelectedLedgerAccount={setSelectedLedgerAccount} />}
                    {page === 'ledger' && <AccountLedger account={selectedLedgerAccount} onBack={() => setPage('accounts')} />}
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