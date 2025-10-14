import React, { useState } from 'react';
import { IconLoading } from '../ui/Icons';

function EmailForm({ user, close }) {
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: user.email,
                    subject: subject,
                    body: body,
                    senderName: 'Ledgerify Support'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send email');
            }

            console.log('Email sent successfully:', data);
            setSent(true);
            
            setTimeout(() => {
                close();
            }, 3000);
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email: ' + error.message);
        } finally {
            setIsLoading(false);
        }
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
                        <button type="button" onClick={close} title="Cancel and close this dialog" className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                        <button type="submit" disabled={isLoading} title={`Send this email to ${user.fullName}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
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
