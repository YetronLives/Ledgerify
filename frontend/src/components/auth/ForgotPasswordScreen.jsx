import React, { useState } from 'react';
import { IconCheckCircle, IconLoading } from '../ui/Icons';

const ForgotPasswordScreen = ({ setLoginView }) => {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [answer1, setAnswer1] = useState('');
    const [answer2, setAnswer2] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [user, setUser] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const response = await fetch('http://localhost:5000/forgot-password/verify-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username.toLowerCase(),
                    email: email.toLowerCase()
                })
            });

            const data = await response.json();
            setIsLoading(false);

            if (response.ok) {
                setUser({ 
                    username: username.toLowerCase(), 
                    ...data.user,
                    securityQuestion: data.user.question1,
                    securityQuestion2: data.user.question2
                });
                setStep(2);
            } else {
                setError(data.error || 'Invalid username or email.');
            }
        } catch (err) {
            setIsLoading(false);
            setError('Network error. Please try again.');
        }
    };

    const handleAnswerSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const response = await fetch('http://localhost:5000/forgot-password/verify-answers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: user.username,
                    answer1: answer1,
                    answer2: answer2
                })
            });

            const data = await response.json();
            setIsLoading(false);

            if (response.ok) {
                setStep(3);
            } else {
                setError(data.error || 'One or more answers are incorrect. Please try again.');
            }
        } catch (err) {
            setIsLoading(false);
            setError('Network error. Please try again.');
        }
    };
    
    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!validatePassword(newPassword)) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await fetch('http://localhost:5000/forgot-password/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: user.username,
                    newPassword: newPassword
                })
            });

            const data = await response.json();
            setIsLoading(false);

            if (response.ok) {
                setSubmitted(true);
            } else {
                setError(data.error || 'Failed to reset password. Please try again.');
            }
        } catch (err) {
            setIsLoading(false);
            setError('Network error. Please try again.');
        }
    };
    
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
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Reset Password</h2>
                        {step === 1 && (
                            <form onSubmit={handleUserSubmit}>
                                <p className="text-center text-gray-500 mb-6">Enter your username and email to begin.</p>
                                <div className="mb-4"><label className="block text-gray-600 mb-2">Username</label><input value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-4 py-2 border rounded-lg"/></div>
                                <div className="mb-4"><label className="block text-gray-600 mb-2">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-lg"/></div>
                                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                                <button type="submit" disabled={isLoading} className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">{isLoading && <IconLoading className="w-5 h-5" />}<span>Continue</span></button>
                                <button type="button" onClick={() => setLoginView('login')} className="w-full mt-2 text-center text-gray-500 hover:underline">Back to Login</button>
                            </form>
                        )}
                        {step === 2 && user && (
                            <form onSubmit={handleAnswerSubmit}>
                                <p className="text-center text-gray-500 mb-6">Answer your security questions to proceed.</p>
                                <div className="mb-4"><label className="block text-gray-600 mb-2 font-semibold">{user.securityQuestion}</label><input type="text" value={answer1} onChange={e => setAnswer1(e.target.value)} required className="w-full px-4 py-2 border rounded-lg"/></div>
                                <div className="mb-6"><label className="block text-gray-600 mb-2 font-semibold">{user.securityQuestion2}</label><input type="text" value={answer2} onChange={e => setAnswer2(e.target.value)} required className="w-full px-4 py-2 border rounded-lg"/></div>
                                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                                <button type="submit" disabled={isLoading} className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">{isLoading && <IconLoading className="w-5 h-5" />}<span>Continue</span></button>
                                <button type="button" onClick={() => setLoginView('login')} className="w-full mt-2 text-center text-gray-500 hover:underline">Back to Login</button>
                            </form>
                        )}
                        {step === 3 && user && (
                            <form onSubmit={handleFinalSubmit}>
                                <p className="text-center text-gray-500 mb-6">Please enter your new password.</p>
                                <div className="mb-4"><label className="block text-gray-600 mb-2">New Password</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="********" className="w-full px-4 py-2 border rounded-lg"/><p className="text-xs text-gray-500 mt-1">Minimum 6 characters.</p></div>
                                <div className="mb-6"><label className="block text-gray-600 mb-2">Confirm New Password</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="********" className="w-full px-4 py-2 border rounded-lg"/></div>
                                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                                <button type="submit" disabled={isLoading} className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">{isLoading && <IconLoading className="w-5 h-5" />}<span>Reset Password</span></button>
                                <button type="button" onClick={() => setLoginView('login')} className="w-full mt-2 text-center text-gray-500 hover:underline">Back to Login</button>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordScreen;
