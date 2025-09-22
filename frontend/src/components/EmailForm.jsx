import React, { useState } from 'react';
import { IconLoading } from './Icons';

function EmailForm({ user, close }) {
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log(`Sending email to ${user.fullName} (${user.email}) with subject: ${subject}`);
        console.log(`Body: ${body}`);

        setIsLoading(false);
        setSent(true);
        
        setTimeout(() => {
            close();
        }, 3000);
    };

    return (
        <form onSubmit={handleSubmit}>
            {sent ? (
                <div className="text-center text-green-600 font-semibold my-4">Email sent successfully!</div>
            ) : (
                <>
                    <p className="mb-4">Email user: <strong>{user.fullName}</strong></p>
                    <div className="mb-4">
                        <label className="block text-gray-600 mb-2">Subject</label>
                        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-600 mb-2">Body</label>
                        <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={4} required></textarea>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                        <button type="button" onClick={close} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                            {isLoading && <IconLoading className="w-5 h-5" />}
                            <span>Send Email</span>
                        </button>
                    </div>
                </>
            )}
        </form>
    );
}

export default EmailForm;
