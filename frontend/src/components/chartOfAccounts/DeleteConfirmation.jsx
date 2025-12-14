import React from 'react';

function DeleteConfirmation({ accountName, onConfirm, onCancel }) {
                return (
                    <div>
                        <p className="text-center mb-4">Are you sure you want to delete account <strong className="font-bold">{accountName}</strong>? This action cannot be undone.</p>
                        <div className="flex justify-center space-x-4"><button onClick={onCancel} title="Cancel deletion and return to account details" className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button><button onClick={onConfirm} title="Permanently delete this account" className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirm Delete</button></div>
                    </div>
                );
            }
export default DeleteConfirmation;
