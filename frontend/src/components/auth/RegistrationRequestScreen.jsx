import React, { useState } from 'react';
import { IconCheckCircle, IconLoading } from '../ui/Icons';

const RegistrationRequestScreen = ({ setLoginView, onSubmitRequest }) => { // Added onSubmitRequest prop
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // State for security questions
    const [selectedQ1, setSelectedQ1] = useState(''); 
    const [selectedQ2, setSelectedQ2] = useState('');

    // Mock security questions for this standalone component
    const securityQuestions = [
        'What was your first pet\'s name?',
        'In what city were you born?',
        'What is your mother\'s maiden name?',
        'What was the model of your first car?',
        'What is the name of your favorite fictional character?'
    ];
    
    // Filters the second set of questions to exclude the first selection
    const availableQ2 = securityQuestions.filter(q => q !== selectedQ1);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        const formData = new FormData(e.currentTarget);
        
        const user_data = {
            first_name: formData.get('firstName'),
            last_name: formData.get('lastName'),
            email: formData.get('email'),
            address: formData.get('address'),
            date_of_birth: formData.get('dateOfBirth'),
            question1: formData.get('securityQuestion1'),
            q1_answer: formData.get('securityAnswer1'),
            question2: formData.get('securityQuestion2'),
            q2_answer: formData.get('securityAnswer2'),
            role: formData.get('role')
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
                setError(result.error || 'Failed to create user.');
                alert(result.error || 'Failed to create user.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError('Network error. Please try again later.');
            alert('Network error. Please try again later.');
        }
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 font-sans">
            <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
                {submitted ? (
                    <div className="text-center">
                        <IconCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">Request Submitted!</h2>
                        <p className="text-gray-600 mb-6">An administrator will review your request and you will receive an email upon approval.</p>
                        <button type="button" onClick={() => setLoginView('login')} title="Return to the login screen" className="w-full mt-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Back to Login</button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Request Access</h2>
                        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                        <form onSubmit={handleSubmit}>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-gray-600 mb-2">First Name</label><input name="firstName" required className="w-full px-4 py-2 border rounded-lg"/></div>
                                <div><label className="block text-gray-600 mb-2">Last Name</label><input name="lastName" required className="w-full px-4 py-2 border rounded-lg"/></div>
                             </div>
                             <div className="mt-4"><label className="block text-gray-600 mb-2">Email</label><input name="email" required type="email" className="w-full px-4 py-2 border rounded-lg"/></div>
                             <div className="mt-4"><label className="block text-gray-600 mb-2">Address</label><textarea name="address" required className="w-full px-4 py-2 border rounded-lg h-20"></textarea></div>
                             <div className="mt-4"><label className="block text-gray-600 mb-2">Date of Birth</label><input name="dateOfBirth" required type="date" className="w-full px-4 py-2 border rounded-lg"/></div>
                             
                             {/* --- Security Question 1 --- */}
                             <div className="mt-4">
                                <label className="block text-gray-600 mb-2">Security Question 1</label>
                                <select 
                                    name="securityQuestion1" 
                                    required 
                                    value={selectedQ1} 
                                    onChange={e => setSelectedQ1(e.target.value)} 
                                    className="w-full px-4 py-2 border rounded-lg bg-white"
                                >
                                    <option value="" disabled>Select a question</option>
                                    {securityQuestions.map((q, i) => <option key={`q1-${i}`} value={q}>{q}</option>)}
                                </select>
                            </div>
                            <div className="mt-4"><label className="block text-gray-600 mb-2">Answer 1</label><input name="securityAnswer1" required type="text" className="w-full px-4 py-2 border rounded-lg"/></div>
                            
                            {/* --- Security Question 2 --- */}
                            <div className="mt-4">
                                <label className="block text-gray-600 mb-2">Security Question 2</label>
                                <select 
                                    name="securityQuestion2" 
                                    required 
                                    value={selectedQ2} 
                                    onChange={e => setSelectedQ2(e.target.value)} 
                                    className="w-full px-4 py-2 border rounded-lg bg-white" 
                                    disabled={!selectedQ1}
                                >
                                    <option value="" disabled>Select a question</option>
                                    {availableQ2.map((q, i) => <option key={`q2-${i}`} value={q}>{q}</option>)}
                                </select>
                            </div>
                            <div className="mt-4"><label className="block text-gray-600 mb-2">Answer 2</label><input name="securityAnswer2" required type="text" className="w-full px-4 py-2 border rounded-lg"/></div>


                             <div className="mt-4">
                                <label className="block text-gray-600 mb-2">Requested Role</label>
                                <select name="role" required className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="Accountant">Accountant</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Administrator">Administrator</option>
                                </select>
                            </div>
                                

                            <button type="submit" disabled={isLoading} title="Submit your registration request for admin review" className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                                {isLoading && <IconLoading className="w-5 h-5" />}
                                <span>Submit Request</span>
                            </button>
                            <button type="button" onClick={() => setLoginView('login')} title="Cancel and return to the login screen" className="w-full mt-2 text-center text-gray-500 hover:underline">Back to Login</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default RegistrationRequestScreen;
