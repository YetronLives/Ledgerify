import React, { useState } from 'react';
import { IconLogo, IconLoading } from './Icons';

function LoginScreen({ onLogin, setLoginView, mockUsers }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (attempts >= 2) {
            setError('Maximum login attempts exceeded. Your account is temporarily locked.');
            return;
        }
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

        let loginUsername = username.toLowerCase();
        let userData = mockUsers[loginUsername];

        // Check if the input is an email
        if (username.includes('@')) {
            const foundUserEntry = Object.entries(mockUsers).find(([, user]) => user.email.toLowerCase() === username.toLowerCase());
            if (foundUserEntry) {
                loginUsername = foundUserEntry[0];
                userData = foundUserEntry[1];
            } else {
                // eslint-disable-next-line 
                userData = undefined; // User not found
            }
        }

        const loginResult = onLogin(loginUsername);
        setIsLoading(false);

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
                        <label className="block text-gray-600 mb-2" htmlFor="username">Username or Email</label>
                        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., meriam or meriam@ledgerify.com"/>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-600 mb-2" htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="********"/>
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                        {isLoading && <IconLoading className="w-5 h-5" />}
                        <span>Login</span>
                    </button>
                    <div className="flex justify-between items-center mt-4 text-sm">
                        <button type="button" onClick={() => setLoginView('forgot')} className="text-blue-600 hover:underline">Forgot Password?</button>
                        <button type="button" onClick={() => setLoginView('register')} className="text-teal-600 hover:underline">Create New User</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginScreen;
