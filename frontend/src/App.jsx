import React, { useState, useId, useEffect } from 'react';
import LoginScreen from './components/auth/LoginScreen';
import RegistrationRequestScreen from './components/auth/RegistrationRequestScreen';
import ForgotPasswordScreen from './components/auth/ForgotPasswordScreen';
import Dashboard from './components/ui/Dashboard';
import UserManagement from './components/userManagement/UserManagement';
import PlaceholderScreen from './components/ui/PlaceholderScreen';
import ChartOfAccounts from './components/chartOfAccounts/ChartOfAccounts';
import AccountLedger from './components/chartOfAccounts/AccountLedger';
import JournalEntriesPage from './components/journalEntries/JournalEntries';
import { IconLogo, IconUser } from './components/ui/Icons';
import UserHome from './components/UserHome';
import Profile from './components/Profile';

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

// --- Function to generate a temporary, secure password ---
const generateTemporaryPassword = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

const mapAccountData = (acc) => ({
    id: acc.account_id, number: acc.account_number, name: acc.account_name, description: acc.account_description, normalSide: acc.normal_side.charAt(0).toUpperCase() + acc.normal_side.slice(1), category: acc.category, subcategory: acc.subcategory, initialBalance: acc.initial_balance, balance: acc.balance, debit: acc.debit, credit: acc.credit, order: acc.order_number, statement: acc.statement, comment: acc.comment, addedDate: acc.created_at, userId: acc.user_id, isActive: acc.is_active
});

function App() {

    const allSecurityQuestions = Object.values(mockUsers).flatMap(u => [u.securityQuestion, u.securityQuestion2]);
    const uniqueSecurityQuestions = [...new Set(allSecurityQuestions)];
    const uniqueId = useId();

    // State
    const [users, setUsers] = useState([]);
    const [allAccounts, setAllAccounts] = useState([]);
    const [journalEntries, setJournalEntries] = useState([]);
    const [adjustingJournalEntries, setAdjustingJournalEntries] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/users')
            .then(response => response.json())
            .then(data => {
                const mappedUsers = data.users.reduce((acc, user) => {
                    acc[user.username || user.email] = {
                         email: user.email,
                        fullName: `${user.first_name} ${user.last_name}`,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        role: user.role === 'Admin' ? 'Administrator' : user.role,
                        status: user.account_status ? 'Active' : 'Inactive',
                        username: user.username,
                        securityAnswer: user.q1_answer,
                        securityAnswer2: user.q2_answer,
                        address: user.address,
                        dateOfBirth: user.date_of_birth,
                        loginAttempts: user.login_attempts || 0,
                        passwordExpires: user.password_expires
                    };
                    return acc;
                }, {});
                setUsers(mappedUsers);
            })
            .catch(err => console.error(err));

        fetch(`http://localhost:5000/chart-of-accounts`)
            .then(response => response.json())
            .then(data => {
                if (data.accounts) {
                    setAllAccounts(data.accounts.map(mapAccountData));
                }
            })
            .catch(err => console.error("Failed to fetch accounts:", err));

        fetch('http://localhost:5000/journal-entries')
            .then(response => response.json())
            .then(data => {
                if (data.entries) {
                    setJournalEntries(data.entries);
                }
            })
            .catch(err => console.error("Failed to fetch journal entries:", err));

        fetch('http://localhost:5000/adjusting-journal-entries')
            .then(response => response.json())
            .then(data => {
                if (data.entries) {
                    setAdjustingJournalEntries(data.entries);
                }
            })
            .catch(err => console.error("Failed to fetch adjusting journal entries:", err));

    }, []);

    const [user, setUser] = useState(null);
    const [page, setPage] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loginView, setLoginView] = useState('login');
    const [pendingRequests, setPendingRequests] = useState([]);
    const [notification, setNotification] = useState(null);
    const [selectedLedgerAccountId, setSelectedLedgerAccountId] = useState(null);
    const [selectedJournalEntryId, setSelectedJournalEntryId] = useState(null);

    // ✅ Reusable function to update account balances based on a journal entry
    const updateAccountBalances = (journalEntry) => {
        setAllAccounts(prevAccounts => {
            const changes = new Map();

            journalEntry.debits.forEach(debit => {
                const change = changes.get(debit.accountId) || { debit: 0, credit: 0 };
                change.debit += debit.amount;
                changes.set(debit.accountId, change);
            });

            journalEntry.credits.forEach(credit => {
                const change = changes.get(credit.accountId) || { debit: 0, credit: 0 };
                change.credit += credit.amount;
                changes.set(credit.accountId, change);
            });

            return prevAccounts.map(acc => {
                if (!changes.has(acc.id)) return acc;

                const change = changes.get(acc.id);
                let balanceDelta = 0;

                if (change.debit > 0) {
                    balanceDelta += (acc.normalSide === 'Debit' ? change.debit : -change.debit);
                }
                if (change.credit > 0) {
                    balanceDelta += (acc.normalSide === 'Credit' ? change.credit : -change.credit);
                }

                return {
                    ...acc,
                    debit: (acc.debit || 0) + change.debit,
                    credit: (acc.credit || 0) + change.credit,
                    balance: (acc.balance || 0) + balanceDelta
                };
            });
        });
    };

     // Functions
    const onLogin = (userData) => {
        const mappedUserData = {
           id: userData.id,
           id: userData.id, // Store the user ID for API calls
            email: userData.email,
            role: userData.role === 'Admin' ? 'Administrator' : userData.role,
            fullName: `${userData.first_name} ${userData.last_name}`,
            firstName: userData.first_name,
            lastName: userData.last_name,
            status: userData.account_status ? 'Active' : 'Inactive',
            username: userData.username,
            address: userData.address,
            dateOfBirth: userData.date_of_birth,
            securityAnswer: userData.q1_answer,
            securityAnswer2: userData.q2_answer,
            passwordExpires: userData.password_expires,
            loginAttempts: userData.login_attempts || 0
        };
        setUser(mappedUserData);
        setLoginView('login');
         if (userData.role === 'Admin' || userData.role === 'Administrator') {
            setPage('users');
            setPage('users'); // Admin goes to user management
        } else {
            setPage('userhome');
        }

        return undefined;
    };

    const updateUserInApp = (username, updatedData) => {
        setUsers(prevUsers => ({ ...prevUsers, [username]: { ...prevUsers[username], ...updatedData } }));

        if (user && (user.username === username || user.email === username)) {
            setUser(prevUser => ({ ...prevUser, ...updatedData }));
        }
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

    const removeUserFromApp = (username) => {
        setUsers(prevUsers => {
            const newUsers = { ...prevUsers };
            delete newUsers[username];
            return newUsers;
        });
        console.log(`[App] User Removed. Username: ${username}`);
    };
    
    const addRegistrationRequest = (requestData) => {
        const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        setPendingRequests(prev => [...prev, { id: requestId, ...requestData }]);
        console.log("[App] New Registration Request Added:", requestId);
    };
    
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
    };

    const addJournalEntry = (newEntry) => {
        // Use the status from the backend (already set correctly)
        // Backend sets: "Pending Review" for Accountants, could be "Approved" for Managers
        setJournalEntries(prev => [...prev, newEntry]);

        // --- Only update account balances if the entry is approved ---
        if (newEntry.status !== 'Approved') {
            // If pending review, just add to list and return.
            // Balances will be updated upon approval.
            return;
        }
        
        setAllAccounts(prevAccounts => {
            const changes = new Map();

            newEntry.debits.forEach(debit => {
                const change = changes.get(debit.accountId) || { debit: 0, credit: 0 };
                change.debit += debit.amount;
                changes.set(debit.accountId, change);
            });

            newEntry.credits.forEach(credit => {
                const change = changes.get(credit.accountId) || { debit: 0, credit: 0 };
                change.credit += credit.amount;
                changes.set(credit.accountId, change);
            });

            return prevAccounts.map(acc => {
                if (!changes.has(acc.id)) {
                    return acc;
                }

                const change = changes.get(acc.id);
                
                let balanceDelta = 0;
                if (change.debit > 0) {
                    balanceDelta += (acc.normalSide === 'Debit' ? change.debit : -change.debit);
                }
                if (change.credit > 0) {
                    balanceDelta += (acc.normalSide === 'Credit' ? change.credit : -change.credit);
                }

                return {
                    ...acc,
                    debit: acc.debit + change.debit,
                    credit: acc.credit + change.credit,
                    balance: acc.balance + balanceDelta
                };
            });
        });
    };

    // --- Function to approve/reject entries ---
    const updateJournalEntryStatus = async (entryId, newStatus, reason = null) => {
        try {
            // Call backend API to update status
            const response = await fetch(`http://localhost:5000/journal-entries/${entryId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                    rejectionReason: reason,
                    updated_by_user_id: user.id
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update journal entry status');
            }

            // Update local state after successful backend update
            let entryToUpdate = null;

            setJournalEntries(prevEntries => 
                prevEntries.map(entry => {
                    if (entry.id === entryId) {
                        entryToUpdate = { ...entry, status: newStatus };
                        if (newStatus === 'Rejected' && reason) {
                            entryToUpdate.rejectionReason = reason;
                        }
                        return entryToUpdate;
                    }
                    return entry;
                })
            );

            // ---  Update account balances ONLY on approval ---
            if (newStatus === 'Approved' && entryToUpdate) {
                setAllAccounts(prevAccounts => {
                    const changes = new Map();

                    entryToUpdate.debits.forEach(debit => {
                        const change = changes.get(debit.accountId) || { debit: 0, credit: 0 };
                        change.debit += debit.amount;
                        changes.set(debit.accountId, change);
                    });

                    entryToUpdate.credits.forEach(credit => {
                        const change = changes.get(credit.accountId) || { debit: 0, credit: 0 };
                        change.credit += credit.amount;
                        changes.set(credit.accountId, change);
                    });

                    return prevAccounts.map(acc => {
                        if (!changes.has(acc.id)) {
                            return acc;
                        }

                        const change = changes.get(acc.id);
                        
                        let balanceDelta = 0;
                        if (change.debit > 0) {
                            balanceDelta += (acc.normalSide === 'Debit' ? change.debit : -change.debit);
                        }
                        if (change.credit > 0) {
                            balanceDelta += (acc.normalSide === 'Credit' ? change.credit : -change.credit);
                        }

                        return {
                            ...acc,
                            debit: acc.debit + change.debit,
                            credit: acc.credit + change.credit,
                            balance: acc.balance + balanceDelta
                        };
                    });
                });
            }
        } catch (err) {
            console.error('Error updating journal entry status:', err);
            alert(`Failed to ${newStatus.toLowerCase()} journal entry: ${err.message}`);
        }
    };

    const addAdjustingJournalEntry = async (newEntryData) => {
        const entryWithStatus = { ...newEntryData };
        if (user.role === 'Manager') {
            entryWithStatus.status = 'Approved';
        } else {
            entryWithStatus.status = 'Pending Review'; 
        }

        try {
            const response = await fetch('http://localhost:5000/adjusting-journal-entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entryWithStatus)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create adjusting entry');
            }

            const createdEntry = await response.json(); 

            setAdjustingJournalEntries(prev => [...prev, createdEntry]);

            if (createdEntry.status === 'Approved') {
                updateAccountBalances(createdEntry);
                alert('Adjusting journal entry created and approved successfully!');
            } else {
                alert('Your adjusting journal entry has been submitted for manager review.');
            }

        } catch (err) {
            console.error('Error creating adjusting journal entry:', err);
            alert(`Failed to create entry: ${err.message}`);
        }
    };

    const updateAdjustingJournalEntryStatus = async (entryId, newStatus, reason = null) => {
        try {
            const response = await fetch(`http://localhost:5000/adjusting-journal-entries/${entryId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                    rejectionReason: reason,
                    updated_by_user_id: user.id
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update adjusting journal entry status');
            }

            let entryToUpdate = null;
            setAdjustingJournalEntries(prevEntries => 
                prevEntries.map(entry => {
                    if (entry.id === entryId) {
                        entryToUpdate = { ...entry, status: newStatus };
                        if (newStatus === 'Rejected' && reason) {
                            entryToUpdate.rejectionReason = reason;
                        }
                        return entryToUpdate;
                    }
                    return entry;
                })
            );

            if (newStatus === 'Approved' && entryToUpdate) {
                updateAccountBalances(entryToUpdate);
            }
        } catch (err) {
            console.error('Error updating adjusting journal entry status:', err);
            alert(`Failed to ${newStatus.toLowerCase()} adjusting journal entry: ${err.message}`);
        }
    };


    const logout = () => {
        setUser(null);
        setPage('dashboard');
        setNotification(null);
        setIsMobileMenuOpen(false);
    };

    if (!user) {
        if (loginView === 'register') return <RegistrationRequestScreen setLoginView={setLoginView} securityQuestions={uniqueSecurityQuestions} />;
        if (loginView === 'forgot') return <ForgotPasswordScreen setLoginView={setLoginView} />;
        return <LoginScreen onLogin={onLogin} setLoginView={setLoginView} mockUsers={users} />;
    }

    const navItems = [
        { id: 'userhome', label: 'Home', roles: ['user', 'Admin', 'Administrator', 'Manager', 'Accountant'] },
        { id: 'dashboard', label: 'Dashboard', roles: ['Admin', 'Administrator', 'Manager', 'Accountant'] },
        { id: 'accounts', label: 'Chart of Accounts', roles: ['Admin', 'Administrator', 'Manager', 'Accountant'] },
        { id: 'journal', label: 'Journal Entries', roles: ['Admin', 'Administrator', 'Manager', 'Accountant'] },
        { id: 'reports', label: 'Financial Reports', roles: ['Admin', 'Administrator', 'Manager', 'Accountant'] },
        { id: 'users', label: 'User Management', roles: ['Admin', 'Administrator'] },
        { id: 'profile', label: 'Profile', roles: ['user', 'Admin', 'Administrator', 'Manager', 'Accountant'] },
        { id: 'help', label: 'Help', roles: ['user', 'Admin', 'Administrator', 'Manager', 'Accountant'] },
    ];
    const allowedNavItems = navItems.filter(item => user.role && item.roles.includes(user.role));
    const selectedLedgerAccount = allAccounts.find(acc => acc.id === selectedLedgerAccountId);

    return (
        <div className="flex flex-col h-screen bg-gray-100 font-sans">
             {/* Navigation Layout Change */}
            <header className="bg-emerald-500 text-white shadow-md z-30">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center py-3">
                        <div className="flex items-center space-x-2">
                            <IconLogo className="w-8 h-8" />
                            <span className="text-xl font-bold">Ledgerify</span>
                            </div>
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {allowedNavItems.filter(item => item.id !== 'profile').map(item => (
                                <button key={item.id} onClick={() => setPage(item.id)}
                                    title={`Go to ${item.label}`}
                                    className={`px-3 py-2 rounded transition duration-200 text-sm font-medium hover:bg-emerald-700 ${page === item.id ? 'bg-emerald-900' : ''}`}>
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                         {/* User Info & Actions - Desktop */}
                        <div className="hidden md:flex items-center space-x-4">
                             <button
                                onClick={() => setPage('profile')}
                                className="flex items-center space-x-2 p-1 rounded-full hover:bg-emerald-700 transition-colors duration-200"
                                title="View your profile"
                            >
                                <div className="text-right">
                                    <span className="font-semibold text-sm">{user.firstName || user.fullName}</span>
                                    <span className="text-xs block opacity-80">{user.role}</span>
                                </div>
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-emerald-300"/>
                                ) : (
                                    <IconUser className="w-7 h-7" />
                                )}
                            </button>
                            <button onClick={logout} title="Log out of your account" className="px-3 py-2 rounded transition duration-200 text-sm font-medium hover:bg-emerald-700 border border-emerald-400 hover:border-emerald-300">
                                Logout
                            </button>
                        </div>
                        
                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} title={isMobileMenuOpen ? "Close menu" : "Open menu"} className="text-white focus:outline-none p-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                            </button>

                        </div>

                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <nav className="md:hidden bg-emerald-600 border-t border-emerald-700">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                              {allowedNavItems.map(item => (
                                <button key={item.id} onClick={() => { setPage(item.id); setIsMobileMenuOpen(false); }}
                                    title={`Go to ${item.label}`}
                                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-emerald-700 ${page === item.id ? 'bg-emerald-900' : ''}`}>
                                    {item.label}
                                </button>
                            ))}
                            <div className="border-t border-emerald-500 pt-2 mt-2">
                                <button onClick={logout} title="Log out of your account" className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-emerald-700">
                                    Logout
                                </button>
                            </div>
                        </div>
                    </nav>
                )}
            </header>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-4 bg-white border-b-2 border-gray-200">
                    <h1 className="text-2xl font-semibold text-gray-800 capitalize">{page.replace(/([A-Z])/g, ' $1').trim()}</h1>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
                    {notification && (
                        <div className={`p-4 mb-4 rounded-lg text-white font-semibold flex justify-between items-center ${notification.type === 'error' ? 'bg-red-600' : 'bg-yellow-600'}`}>
                            <span>{notification.message}</span>
                            <button onClick={() => setNotification(null)} title="Dismiss notification" className="text-white hover:text-gray-200 font-bold ml-4">
                                &times;
                            </button>
                        </div>
                    )}
                    {page === 'userhome' && <UserHome user={user} />}
                    {page === 'dashboard' && <Dashboard user={user} mockUsers={users} pendingRequests={pendingRequests} handleRequest={handleRequest} setPage={setPage} updateUserInApp={updateUserInApp} removeUserFromApp={removeUserFromApp} />} 
                    {page === 'accounts' && <ChartOfAccounts currentUser={user} setPage={setPage} setSelectedLedgerAccountId={setSelectedLedgerAccountId} allAccounts={allAccounts} setAllAccounts={setAllAccounts} />}
                    {page === 'ledger' && <AccountLedger account={selectedLedgerAccount} onBack={() => { setPage('accounts'); setSelectedLedgerAccountId(null); }} journalEntries={[...journalEntries, ...adjustingJournalEntries]} setPage={setPage} setSelectedJournalEntryId={setSelectedJournalEntryId} />}
                    {page === 'journal' && <JournalEntriesPage currentUser={user} allAccounts={allAccounts} journalEntries={journalEntries} addJournalEntry={addJournalEntry} setPage={setPage} setSelectedLedgerAccountId={setSelectedLedgerAccountId} selectedJournalEntryId={selectedJournalEntryId} setSelectedJournalEntryId={setSelectedJournalEntryId} updateJournalEntryStatus={updateJournalEntryStatus} adjustingJournalEntries={adjustingJournalEntries} addAdjustingJournalEntry={addAdjustingJournalEntry} updateAdjustingJournalEntryStatus={updateAdjustingJournalEntryStatus} />}
                    {page === 'reports' && <PlaceholderScreen title="Financial Reports" message="Financial Reports module under construction." />}
                    {page === 'users' && <UserManagement mockUsers={users} updateUserInApp={updateUserInApp} addUserToApp={addUserToApp} />}
                    {page === 'profile' && <Profile user={user} updateUserInApp={updateUserInApp} />}
                     {page === 'help' && (
                        <div className="help-content" style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', lineHeight: 1.6, color: '#333', fontSize: '16px' }}>
                            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '20px', color: '#2c3e50' }}>📘 Welcome to Ledgerify</h1>
                            <p>
                                You’re logged in as <strong>
                                    {user?.firstName && user?.lastName
                                        ? `${user.fullName}`
                                        : user?.username || 'User'}
                                </strong>. This guide walks you through Ledgerify’s core features—tailored to your role as an <strong>Administrator</strong>, <strong>Manager</strong>, or <strong>Accountant</strong>.
                            </p>
                            <h2 style={{ fontSize: '22px', fontWeight: '600', marginTop: '32px', marginBottom: '16px', color: '#2c3e50' }}>👥 Your Role & What You Can Do</h2>
                            <p>
                                What you see and can do in Ledgerify depends on your assigned role:
                                <br />
                                – <strong>Administrators</strong> can manage the Chart of Accounts, create or suspend users, view audit logs, and run system reports.
                                <br />
                                – <strong>Managers</strong> and <strong>Accountants</strong> can view accounts, explore ledgers, and use tools like journalizing—but cannot add, edit, or deactivate accounts.
                            </p>
                            <h2 style={{ fontSize: '22px', fontWeight: '600', marginTop: '28px', marginBottom: '16px', color: '#2c3e50' }}>📊 Working with the Chart of Accounts</h2>
                            <p>
                                The Chart of Accounts is your central list of all financial accounts. Each entry includes:
                                <br />
                                – Account name and number (numbers only, with valid prefixes like 1000 for assets)
                                <br />
                                – Category (e.g., Asset, Liability) and subcategory (e.g., Current Assets)
                                <br />
                                – Normal side (Debit or Credit), statement type (Balance Sheet, Income Statement, etc.)
                                <br />
                                – Current and initial balances, plus optional comments
                            </p>
                            <p>
                                All monetary values show two decimal places and use commas for thousands (e.g., $12,500.00). Note: accounts with a balance above zero cannot be deactivated—this protects your financial data integrity.
                            </p>
                            <h2 style={{ fontSize: '22px', fontWeight: '600', marginTop: '28px', marginBottom: '16px', color: '#2c3e50' }}>🔍 Finding an Account</h2>
                            <p>
                                Use the search bar to look up accounts by name or number. You can also filter by category, subcategory, or statement type. Click any account to open its full ledger and see all related transactions.
                            </p>
                            <h2 style={{ fontSize: '22px', fontWeight: '600', marginTop: '28px', marginBottom: '16px', color: '#2c3e50' }}>🗓️ Picking Dates</h2>
                            <p>
                                Need to enter a date? Click any date field to open the calendar—it appears in the top-left corner of your screen. Just click your date, and it’ll fill in automatically.
                            </p>
                            {user?.role === 'Administrator' && (
                                <>
                                    <h2 style={{ fontSize: '22px', fontWeight: '600', marginTop: '28px', marginBottom: '16px', color: '#2c3e50' }}>🛠️ Admin-Only Tools</h2>
                                    <p>
                                        As an Administrator, you can:
                                        <br />
                                        – Approve or reject new user registration requests
                                        <br />
                                        – Suspend users for a specific date range (like during extended leave)
                                        <br />
                                        – View user reports showing status, last login, and password expiry
                                        <br />
                                        – Send messages directly to any user from within the app
                                        <br />
                                        – Review the full audit log, which tracks every change—who made it, when, and what changed
                                    </p>
                                </>
                            )}
                            <h2 style={{ fontSize: '22px', fontWeight: '600', marginTop: '28px', marginBottom: '16px', color: '#2c3e50' }}>💡 Quick Tips</h2>
                            <p>
                                – Hover over any button to see a tooltip explaining what it does
                                <br />
                                – Watch for loading spinners—they mean your action is being processed
                                <br />
                                – The Ledgerify logo appears on every page, and key actions (like journalizing) are always in the top menu
                                <br />
                                – Click the Help button anytime to come back here
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;