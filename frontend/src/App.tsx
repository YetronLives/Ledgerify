import React, { useState } from 'react';

// --- TYPE DEFINITIONS ---
interface User {
    username: string;
    email: string;
    fullName: string;
    role: 'Administrator' | 'Manager' | 'Accountant';
    status: 'Active' | 'Inactive' | 'Suspended';
    passwordExpires: string;
    securityQuestion: string;
    securityAnswer: string;
    suspendUntil?: string;
}

// --- ICON PROPS TYPE ---
interface IconProps {
    className?: string;
}

// --- ICONS (updated to accept className) ---
const IconLogo: React.FC<IconProps> = ({ className }) => (
  <svg
    className={className || "w-10 h-10"}
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />   {/* teal */}
        <stop offset="100%" stopColor="#9333ea" /> {/* purple */}
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" stroke="url(#gradient)" strokeWidth="2" fill="none" />
    <path d="M12 7v10" stroke="#166534" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 10c0-1.5-1.5-2-3-2s-3 .5-3 2c0 1.5 1.5 2 3 2s3 .5 3 2c0 1.5-1.5 2-3 2s-3-.5-3-2" stroke="#166534" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconUsers: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconDashboard: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20V16"/></svg>;
const IconChartOfAccounts: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconJournal: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>;
const IconReports: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8l6 6Z"/><path d="M11 12h-1"/><path d="M16 12h-1"/><path d="M11 17h4"/></svg>;
const IconHelp: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>;
const IconLogout: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
const IconCheckCircle: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IconPlusCircle: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
const IconMail: React.FC<IconProps> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;

// --- MOCK DATA ---
const mockUsers: { [key: string]: Omit<User, 'username'> } = {
    'meriam': { email: 'admin@ledgerify.com', fullName: 'Meriam', role: 'Administrator', status: 'Active', passwordExpires: '2025-12-25', securityQuestion: 'What was your first pet\'s name?', securityAnswer: 'Leo' },
    'shams': { email: 'manager@ledgerify.com', fullName: 'Shams', role: 'Manager', status: 'Active', passwordExpires: '2026-09-18', securityQuestion: 'In what city were you born?', securityAnswer: 'Atlanta' },
    'constant': { email: 'accountant@ledgerify.com', fullName: 'Constant', role: 'Accountant', status: 'Inactive', passwordExpires: '2026-01-10', securityQuestion: 'What is your mother\'s maiden name?', securityAnswer: 'Jones' },
    'dj': { email: 'dj@example.com', fullName: 'DJ', role: 'Accountant', status: 'Suspended', suspendUntil: '2025-10-01', passwordExpires: '2025-11-11', securityQuestion: 'What was the model of your first car?', securityAnswer: 'Civic'},
    'alix': { email: 'alix@example.com', fullName: 'Alix', role: 'Accountant', status: 'Active', passwordExpires: '2026-08-01', securityQuestion: 'What was the model of your first car?', securityAnswer: 'G-Wagon'},
};

type LoginView = 'login' | 'register' | 'forgot';

// --- MAIN APP COMPONENT ---
export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [page, setPage] = useState<string>('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const [loginView, setLoginView] = useState<LoginView>('login');

    const login = (username: string): string | undefined => {
        const userData = mockUsers[username.toLowerCase()];
        if (userData && (userData.status === 'Active' || (userData.status === 'Suspended' && userData.suspendUntil && new Date() > new Date(userData.suspendUntil)))) {
            setUser({ username, ...userData });
            setLoginView('login');
            return undefined;
        } else {
           return userData?.status || 'Invalid';
        }
    };

    const logout = (): void => {
        setUser(null);
        setPage('dashboard');
    };

    if (!user) {
        if (loginView === 'register') {
            return <RegistrationRequestScreen setLoginView={setLoginView} />;
        }
        if (loginView === 'forgot') {
            return <ForgotPasswordScreen setLoginView={setLoginView} />;
        }
        return <LoginScreen onLogin={login} setLoginView={setLoginView} />;
    }
    
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <IconDashboard />, roles: ['Administrator', 'Manager', 'Accountant'] },
        { id: 'accounts', label: 'Chart of Accounts', icon: <IconChartOfAccounts />, roles: ['Administrator', 'Manager', 'Accountant'] },
        { id: 'journal', label: 'Journal Entries', icon: <IconJournal />, roles: ['Administrator', 'Manager', 'Accountant'] },
        { id: 'reports', label: 'Financial Reports', icon: <IconReports />, roles: ['Administrator', 'Manager', 'Accountant'] },
        { id: 'users', label: 'User Management', icon: <IconUsers />, roles: ['Administrator'] },
        { id: 'help', label: 'Help', icon: <IconHelp />, roles: ['Administrator', 'Manager', 'Accountant'] },
    ];

    const allowedNavItems = navItems.filter(item => item.roles.includes(user.role));

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <aside className={`bg-emerald-500 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-20`}>
                <div className="flex items-center space-x-2 px-4">
                    <IconLogo />
                </div>
                <nav>
                    {allowedNavItems.map(item => (
                        <a key={item.id} href="#" onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); setPage(item.id); setIsMobileMenuOpen(false); }}
                            className={`flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 ${page === item.id ? 'bg-gray-900' : ''}`}>
                            {item.icon}<span>{item.label}</span>
                        </a>
                    ))}
                </nav>
                <div className="absolute bottom-0 w-full p-4 left-0">
                    <a href="#" onClick={logout} className="flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
                        <IconLogout /><span>Logout</span>
                    </a>
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
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user.fullName.charAt(0)}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
                    {page === 'dashboard' && <Dashboard user={user} />}
                    {page === 'accounts' && <ChartOfAccounts />}
                    {page === 'journal' && <JournalEntries />}
                    {page === 'reports' && <FinancialReports />}
                    {page === 'users' && <UserManagement />}
                    {page === 'help' && <Help />}
                </main>
            </div>
        </div>
    );
}

// --- REUSABLE MODAL COMPONENT ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
}


// --- AUTH & USER SCREENS ---
interface AuthScreenProps {
    setLoginView: (view: LoginView) => void;
}

interface LoginScreenProps extends AuthScreenProps {
    onLogin: (username: string) => string | undefined;
}

function LoginScreen({ onLogin, setLoginView }: LoginScreenProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (attempts >= 2) {
            setError('Maximum login attempts exceeded. Your account is temporarily locked.');
            return;
        }

        const loginResult = onLogin(username);
        if (loginResult) {
             switch (loginResult) {
                case 'Inactive':
                    setError('This account is inactive. Please contact an administrator.');
                    break;
                case 'Suspended':
                    setError('This account is suspended. Please contact an administrator.');
                    break;
                default:
                    setError('Invalid username or password.');
                    setAttempts(attempts + 1);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
                <div className="flex justify-center mb-6">
                     <div className="flex flex-col items-center space-y-2">
                        <IconLogo />
                        <span className="text-3xl font-extrabold text-gray-800">Ledgerify</span>
                        <p className="text-lg text-gray-600">
                            Your Smart Accounting Companion
                        </p>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Welcome Back</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-600 mb-2" htmlFor="username">Username</label>
                        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., meriam"/>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-600 mb-2" htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="********"/>
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300">Login</button>
                    <div className="flex justify-between items-center mt-4 text-sm">
                        <button type="button" onClick={() => setLoginView('forgot')} className="text-blue-600 hover:underline">Forgot Password?</button>
                        <button type="button" onClick={() => setLoginView('register')} className="text-teal-600 hover:underline">Create New User</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function RegistrationRequestScreen({ setLoginView }: AuthScreenProps) {
    const [submitted, setSubmitted] = useState(false);
    
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
             <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
                {submitted ? (
                    <div className="text-center">
                        <IconCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">Request Submitted!</h2>
                        <p className="text-gray-600 mb-6">An administrator will review your request and you will receive an email upon approval.</p>
                        <button type="button" onClick={() => setLoginView('login')} className="w-full mt-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Back to Login</button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Request Access</h2>
                        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-gray-600 mb-2">First Name</label><input required className="w-full px-4 py-2 border rounded-lg"/></div>
                                <div><label className="block text-gray-600 mb-2">Last Name</label><input required className="w-full px-4 py-2 border rounded-lg"/></div>
                             </div>
                             <div className="mt-4"><label className="block text-gray-600 mb-2">Email</label><input required type="email" className="w-full px-4 py-2 border rounded-lg"/></div>
                             <div className="mt-4"><label className="block text-gray-600 mb-2">Address</label><textarea required className="w-full px-4 py-2 border rounded-lg h-20"></textarea></div>
                             <div className="mt-4"><label className="block text-gray-600 mb-2">Date of Birth</label><input required type="date" className="w-full px-4 py-2 border rounded-lg"/></div>
                            <button type="submit" className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Submit Request</button>
                            <button type="button" onClick={() => setLoginView('login')} className="w-full mt-2 text-center text-gray-500 hover:underline">Back to Login</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

function ForgotPasswordScreen({ setLoginView }: AuthScreenProps) {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [user, setUser] = useState<Omit<User, 'username'> | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleUserSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const foundUser = mockUsers[username];
        if (foundUser) {
            setUser(foundUser);
            setStep(2);
        } else {
            alert('User not found.');
        }
    }
    
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
             <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
                {submitted ? (
                    <div className="text-center">
                        <IconCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">Password Reset!</h2>
                        <p className="text-gray-600 mb-6">Your password has been successfully reset.</p>
                        <button type="button" onClick={() => setLoginView('login')} className="w-full mt-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Back to Login</button>
                    </div>
                ) : step === 2 && user ? (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">Reset Password</h2>
                        <p className="text-center text-gray-500 mb-6">Answer your security question to proceed.</p>
                        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                            <div className="mb-4">
                                <label className="block text-gray-600 mb-2 font-semibold">{user.securityQuestion}</label>
                                <input type="text" required className="w-full px-4 py-2 border rounded-lg"/>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-600 mb-2">New Password</label>
                                <input type="password" required placeholder="********" className="w-full px-4 py-2 border rounded-lg"/>
                                <p className="text-xs text-gray-500 mt-1">Min. 8 characters, with a letter, a number, and a special character.</p>
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-600 mb-2">Confirm New Password</label>
                                <input type="password" required placeholder="********" className="w-full px-4 py-2 border rounded-lg"/>
                            </div>
                            <button type="submit" className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Reset Password</button>
                            <button type="button" onClick={() => setLoginView('login')} className="w-full mt-2 text-center text-gray-500 hover:underline">Back to Login</button>
                        </form>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Reset Password</h2>
                        <p className="text-center text-gray-500 mb-6">Enter your email and username to begin the recovery process.</p>
                        <form onSubmit={handleUserSubmit}>
                             <div className="mb-4"><label className="block text-gray-600 mb-2">Email</label><input type="email" required className="w-full px-4 py-2 border rounded-lg"/></div>
                             <div className="mb-4"><label className="block text-gray-600 mb-2">Username</label><input value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-4 py-2 border rounded-lg"/></div>
                            <button type="submit" className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Continue</button>
                            <button type="button" onClick={() => setLoginView('login')} className="w-full mt-2 text-center text-gray-500 hover:underline">Back to Login</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

// --- SPRINT 1 FEATURE SCREENS ---

function Dashboard({ user }: { user: User }) {
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

function CreateUserForm({ close }: { close: () => void }) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newUser = Object.fromEntries(formData.entries());
        console.log("New user data (prototype):", newUser);
        // This is a prototype, so we just log the data.
        // In a real app, you would add the user to your state/database here.
        close();
    };

return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50" onClick={close}>
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Create New User
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-2">Username</label>
            <input
              name="username"
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-2">Full Name</label>
            <input
              name="fullName"
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-2">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-2">Address</label>
            <input
              name="address"
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123 Main St, City, State"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-2">Role</label>
            <select
              name="role"
              required
              className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Accountant">Accountant</option>
              <option value="Manager">Manager</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-2">Temporary Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
              className="px-4 py-2 bg-teal-600 text-white rounded-lg"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserForm({ user, close }: { user: Omit<User, 'username'> & { username: string }, close: () => void }) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const updatedUserData = Object.fromEntries(formData.entries());
        console.log("Updated user data (prototype):", { username: user.username, ...updatedUserData });
        close();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50" onClick={close}>
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                    Edit User: {user.fullName}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function UserManagement() {
    const [users, setUsers] = useState<{ [key: string]: Omit<User, 'username'> }>(mockUsers);
    const [filter, setFilter] = useState<'all' | 'expired'>('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<{type: 'suspend' | 'email' | 'create' | 'edit', userData?: Omit<User, 'username'> & {username?: string}} | null>(null);

    const openModal = (type: 'suspend' | 'email' | 'create' | 'edit', userData?: Omit<User, 'username'> & {username?: string}) => {
        setModalContent({ type, userData });
        if (type === 'suspend' || type === 'email') {
            setModalOpen(true);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalContent(null);
    }

    const filteredUsers = Object.entries(users).filter(([, user]) => {
        if (filter === 'expired') {
            return new Date(user.passwordExpires) < new Date();
        }
        return true;
    });

    const SuspendUserForm = ({ user, close }: { user: Omit<User, 'username'>, close: () => void }) => (
        <div>
            <p className="mb-4">Suspend user: <strong>{user.fullName}</strong></p>
            <label className="block text-gray-600 mb-2">Suspend Until</label>
            <input type="date" className="w-full px-4 py-2 border rounded-lg" />
            <div className="flex justify-end space-x-2 mt-4">
                <button onClick={close} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                <button onClick={() => { console.log(`User ${user.fullName} suspended.`); close(); }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Suspend</button>
            </div>
        </div>
    );

    const getModalTitle = () => {
        if (!modalContent) return '';
        switch (modalContent.type) {
            case 'suspend': return 'Suspend User';
            case 'email': return `Email ${modalContent.userData?.fullName}`;
            default: return '';
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <Modal isOpen={modalOpen} onClose={closeModal} title={getModalTitle()}>
                {modalContent?.type === 'suspend' && <SuspendUserForm user={modalContent.userData!} close={closeModal} />}
                {modalContent?.type === 'email' && <div className="text-center p-4">Email functionality placeholder for {modalContent.userData!.fullName}.<button onClick={closeModal} className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg">Close</button></div>}
            </Modal>

            {modalContent?.type === 'create' && <CreateUserForm close={closeModal} />}
            {modalContent?.type === 'edit' && <EditUserForm user={modalContent.userData as Omit<User, 'username'> & { username: string }} close={closeModal} />}

            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold mb-4 md:mb-0">User Management</h2>
                 <div className="flex items-center space-x-2">
                     <span className="font-semibold text-gray-600">Filter:</span>
                     <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>All</button>
                     <button onClick={() => setFilter('expired')} className={`px-4 py-2 rounded-lg ${filter === 'expired' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Expired Passwords</button>
                     <button onClick={() => openModal('create')} className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 flex items-center space-x-2"><IconPlusCircle /><span>Create User</span></button>
                 </div>
            </div>
            <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">Username</th>
                            <th className="p-3">Full Name</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Password Expires</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(([username, user]) => (
                            <tr key={username} className="border-b">
                                <td className="p-3">{username}</td>
                                <td className="p-3 font-medium">{user.fullName}</td>
                                <td className="p-3">{user.role}</td>
                                <td className="p-3">
                                     <span className={`px-3 py-1 text-sm rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : user.status === 'Inactive' ? 'bg-gray-200 text-gray-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span>
                                </td>
                                <td className="p-3">{user.passwordExpires}</td>
                                <td className="p-3 flex space-x-2 items-center">
                                    <button onClick={() => openModal('edit', { ...user, username })} className="text-blue-600 hover:underline text-sm">Edit</button>
                                    <button onClick={() => openModal('suspend', user)} className="text-red-600 hover:underline text-sm">Suspend</button>
                                    <button onClick={() => openModal('email', user)} className="text-gray-600 hover:text-black"><IconMail className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}



// --- SPRINT 1 PLACEHOLDER SCREENS ---

function PlaceholderScreen({ title, message }: { title: string, message: string }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <p className="text-gray-600">{message}</p>
        </div>
    );
}

function ChartOfAccounts() {
    return <PlaceholderScreen title="Chart of Accounts" message="Chart of Accounts module under construction for Sprint 1." />;
}

function JournalEntries() {
    return <PlaceholderScreen title="Journal Entries" message="Journal Entries module under construction for Sprint 1." />;
}

function FinancialReports() {
    return <PlaceholderScreen title="Financial Reports" message="Financial Reports module under construction for Sprint 1." />;
}

function Help() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Help Center</h2>
            <p className="text-gray-600">Welcome to the Help Center. Instructions on using the app will appear here.</p>
        </div>
    );
}