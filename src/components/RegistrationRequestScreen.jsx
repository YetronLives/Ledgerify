import React, { useState } from 'react';
import { IconCheckCircle, IconLoading } from './Icons';

function RegistrationRequestScreen({ setLoginView }) {
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        setIsLoading(false);
        setSubmitted(true);
    };

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
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-gray-600 mb-2">First Name</label><input required className="w-full px-4 py-2 border rounded-lg"/></div>
                                <div><label className="block text-gray-600 mb-2">Last Name</label><input required className="w-full px-4 py-2 border rounded-lg"/></div>
                            </div>
                            <div className="mt-4"><label className="block text-gray-600 mb-2">Email</label><input required type="email" className="w-full px-4 py-2 border rounded-lg"/></div>
                            <div className="mt-4"><label className="block text-gray-600 mb-2">Address</label><textarea required className="w-full px-4 py-2 border rounded-lg h-20"></textarea></div>
                            <div className="mt-4"><label className="block text-gray-600 mb-2">Date of Birth</label><input required type="date" className="w-full px-4 py-2 border rounded-lg"/></div>
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
}

export default RegistrationRequestScreen;
