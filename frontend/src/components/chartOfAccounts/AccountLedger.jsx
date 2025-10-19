import React from 'react';
import { useMemo } from 'react';

function AccountLedger({ account, onBack, journalEntries, setPage, setSelectedJournalEntryId }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };


    const ledgerData = useMemo(() => {
        if (!account) return { transactions: [], totalDebits: 0, totalCredits: 0, currentBalance: 0 };

        const txs = [];
        let runningBalance = account.initialBalance || 0;
        let totalDebits = 0;
        let totalCredits = 0;

        if (account.initialBalance && account.initialBalance !== 0) {
            const initialDebit = account.normalSide === 'Debit' ? account.initialBalance : 0;
            const initialCredit = account.normalSide === 'Credit' ? account.initialBalance : 0;
            
            totalDebits += initialDebit;
            totalCredits += initialCredit;

            txs.push({
                id: 'initial',
                date: account.addedDate,
                description: 'Opening Balance',
                postRef: 'OB',
                debit: initialDebit,
                credit: initialCredit,
                balance: runningBalance
            });
        }
        
        const relatedJournalEntries = journalEntries.filter(je => 
            je.debits.some(d => d.accountId == account.id) || je.credits.some(c => c.accountId == account.id)
        );

        relatedJournalEntries.sort((a,b) => new Date(a.date) - new Date(b.date));

        for (const entry of relatedJournalEntries) {
            const debitEntry = entry.debits.find(d => d.accountId == account.id);
            const creditEntry = entry.credits.find(c => c.accountId == account.id);

            if (debitEntry) {
                const amount = debitEntry.amount;
                runningBalance += (account.normalSide === 'Debit' ? amount : -amount);
                totalDebits += amount; 
                txs.push({
                    id: `${entry.id}-d`,
                    date: entry.date,
                    description: entry.description || 'Journal Entry',
                    postRef: entry.id,
                    debit: amount,
                    credit: 0,
                    balance: runningBalance
                });
            }
            if (creditEntry) {
                const amount = creditEntry.amount;
                runningBalance += (account.normalSide === 'Credit' ? amount : -amount);
                totalCredits += amount;
                 txs.push({
                    id: `${entry.id}-c`,
                    date: entry.date,
                    description: entry.description || 'Journal Entry',
                    postRef: entry.id,
                    debit: 0,
                    credit: amount,
                    balance: runningBalance
                });
            }
        }

        return {
            transactions: txs,
            totalDebits: totalDebits,
            totalCredits: totalCredits,
            currentBalance: runningBalance 
        };
    }, [account, journalEntries]);

    const { transactions, totalDebits, totalCredits, currentBalance } = ledgerData;

    const handlePostRefClick = (journalId) => {
      if (!journalId || journalId === 'OB' || !setPage || !setSelectedJournalEntryId) return;
       setSelectedJournalEntryId(journalId);
       setPage('journal');
   };

    if (!account) return null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <div>
                     <h2 className="text-2xl font-bold text-gray-800">Account Ledger</h2>
                     <p className="text-gray-500 text-sm mt-1">View all transactions for this account</p>
                </div>
                <button onClick={onBack} title="Return to the Chart of Accounts list" className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                    ← Back to Chart of Accounts
                </button>
            </div>
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-lg mb-6 border border-teal-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <h3 className="text-2xl font-bold text-gray-800">{account.name}</h3>
                        <p className="text-gray-600 font-mono text-sm mt-1">Account #{account.number}</p>
                    </div>
                    {account.description && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                            <p className="text-gray-700 italic">{account.description}</p>
                        </div>
                    )}
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
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Initial Balance</p>
                        <p className="text-lg font-bold text-gray-800">${(account.initialBalance || 0).toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Current Balance</p>
                        <p className={`text-lg font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${currentBalance.toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Date Added</p>
                        <p className="text-sm font-semibold text-gray-800">{formatDate(account.addedDate)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Total Debits</p>
                        <p className="text-lg font-bold text-blue-600">${(totalDebits || 0).toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Total Credits</p>
                        <p className="text-lg font-bold text-purple-600">${(totalCredits || 0).toFixed(2)}</p>
                    </div>
                    {account.statement && (
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Statement</p>
                            <p className="text-sm font-semibold text-gray-800">{account.statement}</p>
                        </div>
                    )}
                    {account.comment && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Comment</p>
                            <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">{account.comment}</p>
                        </div>
                    )}
                </div>
            </div>
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
                                transactions.map((txn) => (
                                    <tr key={txn.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{formatDate(txn.date)}</td>
                                        <td className="p-3">{txn.description}</td>
                                        <td className="p-3 font-mono text-xs">
                                            {txn.postRef === 'OB' ? (
                                               <span>{txn.postRef}</span>
                                           ) : (
                                               <button
                                                   onClick={() => handlePostRefClick(txn.postRef)}
                                                   className="text-blue-600 hover:underline hover:font-bold"
                                                   title={`View Journal Entry ${txn.postRef}`}
                                               >
                                                   {txn.postRef}
                                               </button>
                                          )}
                                        </td>
                                        <td className="p-3 text-right font-mono">
                                            {txn.debit > 0 ? `$${txn.debit.toFixed(2)}` : ''}
                                        </td>
                                        <td className="p-3 text-right font-mono">
                                            {txn.credit > 0 ? `$${txn.credit.toFixed(2)}` : ''}
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