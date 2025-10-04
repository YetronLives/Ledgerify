import React from 'react';

function AccountDetails({ account, onEdit, onAttemptDelete, onViewLedger, error, isAdmin }) {
    const canDelete = account.balance === 0;
    return (
        <div className="space-y-3 text-sm max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="font-semibold text-gray-500">Account Number</div><div className="text-right font-mono">{account.number}</div>
                <div className="font-semibold text-gray-500">Name</div><div className="text-right font-bold">{account.name}</div>
                <div className="font-semibold text-gray-500">Category</div><div className="text-right">{account.category}</div>
                <div className="font-semibold text-gray-500">Subcategory</div><div className="text-right">{account.subcategory}</div>
                <div className="font-semibold text-gray-500">Normal Side</div><div className="text-right">{account.normalSide}</div>
                <div className="font-semibold text-gray-500">Statement</div><div className="text-right">{account.statement}</div>
                <div className="font-semibold text-gray-500">Order</div><div className="text-right">{account.order}</div>
                <div className="font-semibold text-gray-500">Added By</div><div className="text-right">{account.userId}</div>
                <div className="font-semibold text-gray-500">Date Added</div><div className="text-right">{new Date(account.addedDate).toLocaleDateString()}</div>
            </div>
            <hr className="my-3"/>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="font-semibold text-gray-500">Initial Balance</div><div className="text-right font-mono">${account.initialBalance.toFixed(2)}</div>
                <div className="font-semibold text-gray-500 text-green-700">Total Debits</div><div className="text-right font-mono text-green-700">${account.debit.toFixed(2)}</div>
                <div className="font-semibold text-gray-500 text-red-700">Total Credits</div><div className="text-right font-mono text-red-700">${account.credit.toFixed(2)}</div>
                <div className="font-semibold text-gray-500 text-lg">Current Balance</div><div className="text-right font-mono font-bold text-lg">${account.balance.toFixed(2)}</div>
            </div>
            <hr className="my-3"/>
            <div><div className="font-semibold text-gray-500 mb-1">Description</div><p className="text-gray-700 bg-gray-50 p-2 rounded-md">{account.description}</p></div>
            {account.comment && <div><div className="font-semibold text-gray-500 mb-1">Comment</div><p className="text-gray-700 bg-gray-50 p-2 rounded-md">{account.comment}</p></div>}
            {error && <div className="text-red-600 text-sm text-center mt-2">{error}</div>}
            <div className="flex justify-end space-x-2 pt-4">
                <button onClick={() => onViewLedger(account)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">View Ledger</button>
                {isAdmin && (
                    <>
                        <div className="relative">
                            <button
                                onClick={onAttemptDelete}
                                disabled={!canDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed peer"
                            >
                                Delete
                            </button>
                            {!canDelete && (
                                <div className="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-gray-700 text-white text-xs rounded-md opacity-0 peer-hover:opacity-100 transition-opacity pointer-events-none">
                                    Cannot delete account with a non-zero balance.
                                </div>
                            )}
                        </div>
                        <button onClick={onEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Edit</button>
                    </>
                )}
            </div>
        </div>
    );
}

export default AccountDetails;