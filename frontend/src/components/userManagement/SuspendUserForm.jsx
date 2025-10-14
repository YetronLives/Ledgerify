import React, { useState } from 'react';
import { IconLoading } from '../ui/Icons';

function SuspendUserForm({ user, close, updateUser }) {
    const [isLoading, setIsLoading] = useState(false);
    const [suspendUntil, setSuspendUntil] = useState('');
    const [notification, setNotification] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const updatedData = {
            status: 'Suspended',
            suspendUntil: suspendUntil,
        };

        updateUser(user.username, updatedData);
        setIsLoading(false);
        setNotification(`User ${user.fullName} suspended until ${suspendUntil}`);
        
        setTimeout(() => {
            close();
        }, 3000);
    };

    return (
        <form onSubmit={handleSubmit}>
            {notification ? (
                <div className="text-center text-green-600 font-semibold my-4">{notification}</div>
            ) : (
                <>
                    <p className="mb-4">Suspend user: <strong>{user.fullName}</strong></p>
                    <label className="block text-gray-600 mb-2">Suspend Until</label>
                    <input 
                        type="date" 
                        value={suspendUntil}
                        onChange={(e) => setSuspendUntil(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                    />
                    <div className="flex justify-end space-x-2 mt-4">
                        <button type="button" onClick={close} title="Cancel and close this dialog" className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                        <button type="submit" disabled={isLoading} title="Confirm suspension of this user" className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                            {isLoading && <IconLoading className="w-5 h-5" />}
                            <span>Suspend</span>
                        </button>
                    </div>
                </>
            )}
        </form>
    );
}

export default SuspendUserForm;
