import React from 'react';

function AccountLedger({ account, onBack }) {
            if (!account) return null;

            return (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                             <h2 className="text-2xl font-bold text-gray-800">Ledger for: {account.name}</h2>
                             <p className="text-gray-500 font-mono">Account #{account.number}</p>
                        </div>
                        <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Back to Chart of Accounts</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Post Ref.</th>
                                    <th className="p-3 text-right">Debit</th>
                                    <th className="p-3 text-right">Credit</th>
                                    <th className="p-3 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Placeholder for ledger entries */}
                                <tr>
                                    <td colSpan="6" className="text-center p-8 text-gray-500">
                                        No transactions recorded for this account yet.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
export default AccountLedger;