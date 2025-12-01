import React, { useState } from 'react';
import { IconLogo, IconLoading } from '../ui/Icons';

function LoginScreen({ onLogin, setLoginView, mockUsers }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  const payload = { username, password };

  fetch('http://localhost:5000/Login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(async (resp) => {
      const raw = await resp.text();

      let data = null;
      if (raw && (raw.trim().startsWith('{') || raw.trim().startsWith('['))) {
        data = JSON.parse(raw);
      }

      if (!resp.ok) {
        setError((data && data.error) || `Login failed (${resp.status}).`);
        return;
      }
      if (!data || !data.user) {
        setError('Login failed. Invalid server response.');
        return;
      }

      if (typeof onLogin === 'function') {
        // Pass the complete user data object
        onLogin(data.user);
      } else {
        console.warn('onLogin prop is not a function. Showing success message instead.');
        setError('Logged in successfully (no onLogin handler wired).');
      }
    })
    .catch((err) => {
      console.error('Fetch failed:', err);
      setError('Network error. Check CORS/URL and backend logs.');
    })
    .finally(() => setIsLoading(false));
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
                        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., username or username@ledgerify.com"/>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-600 mb-2" htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="********"/>
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                    <button type="submit" disabled={isLoading} title="Log in to your account" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                        {isLoading && <IconLoading className="w-5 h-5" />}
                        <span>Login</span>
                    </button>
                    <div className="flex justify-between items-center mt-4 text-sm">
                        <button type="button" onClick={() => setLoginView('forgot')} title="Reset your password" className="text-blue-600 hover:underline">Forgot Password?</button>
                        <button type="button" onClick={() => setLoginView('register')} title="Request a new user account" className="text-teal-600 hover:underline">Create New User</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginScreen;
