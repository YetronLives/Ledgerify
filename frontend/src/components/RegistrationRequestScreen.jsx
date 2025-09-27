import React, { useState } from 'react';
import { IconCheckCircle, IconLoading } from './Icons';

const RegistrationRequestScreen = ({ setLoginView }) => {
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const formData = new FormData(e.currentTarget);
        
        // Safely extract password values
        const newPassword = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        // Ensure values are treated as strings
        const newPasswordStr = typeof newPassword === 'string' ? newPassword : '';
        const confirmPasswordStr = typeof confirmPassword === 'string' ? confirmPassword : '';

        // Validation checks
        if (newPasswordStr !== confirmPasswordStr) {
            setError('Passwords do not match.');
            return;
        }

        if (newPasswordStr.length < 8) {
             setError('Password must be at least 8 characters long.');
            return;
        }

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        
        const registrationData = Object.fromEntries(formData.entries());
        console.log("Registration Request Data:", registrationData);

        setIsLoading(false);
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 font-sans">
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
                        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                        <form onSubmit={handleSubmit}>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-gray-600 mb-2">First Name</label><input required className="w-full px-4 py-2 border rounded-lg"/></div>
                                <div><label className="block text-gray-600 mb-2">Last Name</label><input required className="w-full px-4 py-2 border rounded-lg"/></div>
                             </div>
                             <div className="mt-4"><label className="block text-gray-600 mb-2">Email</label><input required type="email" className="w-full px-4 py-2 border rounded-lg"/></div>
                             <div className="mt-4"><label className="block text-gray-600 mb-2">Address</label><textarea required className="w-full px-4 py-2 border rounded-lg h-20"></textarea></div>
                             <div className="mt-4"><label className="block text-gray-600 mb-2">Date of Birth</label><input required type="date" className="w-full px-4 py-2 border rounded-lg"/></div>
                             
                             <div className="mt-4">
                                <label className="block text-gray-600 mb-2">Requested Role</label>
                                <select name="role" required className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="Accountant">Accountant</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Administrator">Administrator</option>
                                </select>
                            </div>

                            <div className="mt-4">
                                <label className="block text-gray-600 mb-2">Password (Min 8 Chars)</label>
                                <input name="password" type="password" required placeholder="********" className="w-full px-4 py-2 border rounded-lg"/>
                            </div>
                             <div className="mt-4 mb-6">
                                <label className="block text-gray-600 mb-2">Confirm Password</label>
                                <input name="confirmPassword" type="password" required placeholder="********" className="w-full px-4 py-2 border rounded-lg"/>
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                                {isLoading && <IconLoading className="w-5 h-5" />}
                                <span>Submit Request</span>
                            </button>
                            <button type="button" onClick={() => setLoginView('login')} className="w-full mt-2 text-center text-gray-500 hover:underline">Back to Login</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default RegistrationRequestScreen;