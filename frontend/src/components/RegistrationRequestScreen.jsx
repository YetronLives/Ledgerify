import React, { useState } from 'react';
import { IconCheckCircle, IconLoading } from './Icons';

const RegistrationRequestScreen = ({ setLoginView, securityQuestions = [] }) => {
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedQ1, setSelectedQ1] = useState('');
    const [selectedQ2, setSelectedQ2] = useState('');


    const availableQ2 = securityQuestions.filter(q => q !== selectedQ1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target);
        const user_data = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            address: formData.get('address'),
            q1_answer: formData.get('q1_answer'),
            q2_answer: formData.get('q2_answer'),
            date_of_birth: formData.get('date_of_birth'),
    
        };
        try {
            const response = await fetch('http://localhost:5000/CreateUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user_data),
            });
            const result = await response.json();
            if (response.ok) {
                setSubmitted(true);
            } else {
                    alert(result.error);
            }
        } catch (error) {
            alert('Network error. Please try again later.');
        }
        setIsLoading(false);
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
                                <div><label className="block text-gray-600 mb-2">First Name</label><input required name = "first_name" className="w-full px-4 py-2 border rounded-lg"/></div>
                                <div><label className="block text-gray-600 mb-2">Last Name</label><input required name = "last_name" className="w-full px-4 py-2 border rounded-lg"/></div>
                            </div>
                            <div className="mt-4"><label className="block text-gray-600 mb-2">Email</label><input required name="email" type="email" className="w-full px-4 py-2 border rounded-lg"/></div>
                            <div className="mt-4"><label className="block text-gray-600 mb-2">Address</label><textarea required name= "address" className="w-full px-4 py-2 border rounded-lg h-20"></textarea></div>
                            <div className="mt-4"><label className="block text-gray-600 mb-2">Date of Birth</label><input required name="date_of_birth" type="date" className="w-full px-4 py-2 border rounded-lg"/></div>
                            
                            <div className="mt-4"><label className="block text-gray-600 mb-2">Security Question 1</label>
                                <select required value={selectedQ1} onChange={e => setSelectedQ1(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white">
                                    <option value="" disabled>Select a question</option>
                                    {securityQuestions.map((q, i) => <option key={`q1-${i}`} value={q}>{q}</option>)}
                                </select>
                            </div>
                            <div className="mt-4"><label className="block text-gray-600 mb-2">Answer 1</label><input name="q1_answer" required type="text" className="w-full px-4 py-2 border rounded-lg"/></div>
                            
                            <div className="mt-4"><label className="block text-gray-600 mb-2">Security Question 2</label>
                                <select required value={selectedQ2} onChange={e => setSelectedQ2(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white" disabled={!selectedQ1}>
                                    <option value="" disabled>Select a question</option>
                                    {availableQ2.map((q, i) => <option key={`q2-${i}`} value={q}>{q}</option>)}
                                </select>
                            </div>
                            <div className="mt-4"><label className="block text-gray-600 mb-2">Answer 2</label><input  name="q2_answer"  required type="text" className="w-full px-4 py-2 border rounded-lg"/></div>

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
