import React from 'react';

function AccountLedger({ account, onBack }) {
            if (!account) return null;

            // Format date for display
            const formatDate = (dateString) => {
                if (!dateString) return 'N/A';
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            };

            // Build transaction history from account data
            const transactions = [];
            
            // Add initial balance as first transaction if it exists
            if (account.initialBalance && account.initialBalance !== 0) {
                transactions.push({
                    date: account.addedDate,
                    description: account.description,
                    postRef: 'OB',
                    debit: account.normalSide === 'Debit' ? account.initialBalance : 0,
                    credit: account.normalSide === 'Credit' ? account.initialBalance : 0,
                    balance: account.initialBalance
                });
            }

            return (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                             <h2 className="text-2xl font-bold text-gray-800">Account Ledger</h2>
                             <p className="text-gray-500 text-sm mt-1">View all transactions for this account</p>
                        </div>
                        <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                            ← Back to Chart of Accounts
                        </button>
                    </div>

                    {/* Account Details Section */}
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-lg mb-6 border border-teal-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Account Name & Number */}
                            <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                <h3 className="text-2xl font-bold text-gray-800">{account.name}</h3>
                                <p className="text-gray-600 font-mono text-sm mt-1">Account #{account.number}</p>
                            </div>

                            {/* Description */}
                            {account.description && (
                                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                    <p className="text-gray-700 italic">{account.description}</p>
                                </div>
                            )}

                            {/* Category & Subcategory */}
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Category</p>
                                <p className="text-sm font-semibold text-gray-800">{account.category}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Subcategory</p>
                                <p className="text-sm font-semibold text-gray-800">{account.subcategory || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Normal Side</p>
                                <p className="text-sm font-semibold text-gray-800">{account.normalSide}</p>
                            </div>

                            {/* Balances */}
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Initial Balance</p>
                                <p className="text-lg font-bold text-gray-800">${(account.initialBalance || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Current Balance</p>
                                <p className={`text-lg font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${account.balance.toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Date Added</p>
                                <p className="text-sm font-semibold text-gray-800">{formatDate(account.addedDate)}</p>
                            </div>

                            {/* Debit & Credit Totals */}
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Total Debits</p>
                                <p className="text-lg font-bold text-blue-600">${(account.debit || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Total Credits</p>
                                <p className="text-lg font-bold text-purple-600">${(account.credit || 0).toFixed(2)}</p>
                            </div>

                            {/* Statement */}
                            {account.statement && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Statement</p>
                                    <p className="text-sm font-semibold text-gray-800">{account.statement}</p>
                                </div>
                            )}

                            {/* Comment */}
                            {account.comment && (
                                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Comment</p>
                                    <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">{account.comment}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transaction Ledger Section */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Transaction History</h3>
                        <div className="overflow-x-auto border rounded-lg">
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
                                    {transactions.length > 0 ? (
                                        transactions.map((txn, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="p-3">{formatDate(txn.date)}</td>
                                                <td className="p-3">{txn.description}</td>
                                                <td className="p-3 font-mono text-sm">{txn.postRef}</td>
                                                <td className="p-3 text-right font-mono">
                                                    {txn.debit > 0 ? `$${txn.debit.toFixed(2)}` : 0.00.toFixed(2)}
                                                </td>
                                                <td className="p-3 text-right font-mono">
                                                    {txn.credit > 0 ? `$${txn.credit.toFixed(2)}` : 0.00.toFixed(2)}
                                                </td>
                                                <td className="p-3 text-right font-mono font-bold">
                                                    ${txn.balance.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center p-8 text-gray-500">
                                                No transactions recorded for this account yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        }
export default AccountLedger;