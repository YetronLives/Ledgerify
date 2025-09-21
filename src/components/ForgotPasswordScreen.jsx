import React, { useState } from 'react';
import { IconCheckCircle, IconLoading } from './Icons';

function ForgotPasswordScreen({ setLoginView, mockUsers }) {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [user, setUser] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        const foundUser = mockUsers[username.toLowerCase()];
        setIsLoading(false);

        if (foundUser) {
            setUser(foundUser);
            setStep(2);
        } else {
            setError('User not found. Please check your username and email.');
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
                        <form onSubmit={async (e) => { e.preventDefault(); setIsLoading(true); await new Promise(resolve => setTimeout(resolve, 1500)); setIsLoading(false); setSubmitted(true); }}>
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
                            <button type="submit" disabled={isLoading} className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                                {isLoading && <IconLoading className="w-5 h-5" />}
                                <span>Reset Password</span>
                            </button>
                            <button type="button" onClick={() => setLoginView('login')} className="w-full mt-2 text-center text-gray-500 hover:underline">Back to Login</button>
                        </form>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Reset Password</h2>
                        <p className="text-center text-gray-500 mb-6">Enter your username to begin the recovery process.</p>
                        <form onSubmit={handleUserSubmit}>
                            <div className="mb-4"><label className="block text-gray-600 mb-2">Username</label><input value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" /></div>
                            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                            <button type="submit" disabled={isLoading} className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                                {isLoading && <IconLoading className="w-5 h-5" />}
                                <span>Continue</span>
                            </button>
                            <button type="button" onClick={() => setLoginView('login')} className="w-full mt-2 text-center text-gray-500 hover:underline">Back to Login</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default ForgotPasswordScreen;
