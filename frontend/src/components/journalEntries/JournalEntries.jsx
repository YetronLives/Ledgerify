// src/components/JournalEntriesPage.jsx

import React, { useState, useMemo } from 'react';
import { IconPlusCircle, IconPaperclip } from '../ui/Icons'; 
import JournalEntryForm from './JournalEntryForm';
import DateInput from '../ui/DateInput';
import Modal from '../ui/Modal'; 

function JournalEntriesPage({ currentUser, allAccounts, journalEntries, addJournalEntry, setPage, setSelectedLedgerAccountId, selectedJournalEntryId, setSelectedJournalEntryId, updateJournalEntryStatus }) {
    const [isCreating, setIsCreating] = useState(false);
    const [viewStatus, setViewStatus] = useState(currentUser.role === 'Manager' ? 'Pending' : 'Approved');
    const [searchTerm, setSearchTerm] = useState('');
    const [amountFilter, setAmountFilter] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [entryToReject, setEntryToReject] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showAccountSuggestions, setShowAccountSuggestions] = useState(false);

    const canCreate = currentUser.role === 'Manager' || currentUser.role === 'Accountant';
    const isManager = currentUser.role === 'Manager';

    const handleSubmit = (newEntry) => {
        addJournalEntry(newEntry);
        setIsCreating(false);
    };

    const handleAccountClick = (accountId) => {
        if (!setPage || !setSelectedLedgerAccountId) {
            console.error("Navigation functions not provided to JournalEntriesPage");
            return;
        }
        setSelectedLedgerAccountId(accountId);
        setPage('ledger');
    };

    const sortedAndFilteredEntries = useMemo(() => {
        if (selectedJournalEntryId) {
            const selectedEntry = journalEntries.find(entry => entry.id === selectedJournalEntryId);
            return selectedEntry ? [selectedEntry] : [];
        }

        return journalEntries
            .filter(entry => {
                if (entry.status !== viewStatus) return false;

                if (startDate && !endDate) {
                    const entryDate = new Date(entry.date);
                    if (entryDate.getUTCFullYear() !== startDate.getUTCFullYear() ||
                        entryDate.getUTCMonth() !== startDate.getUTCMonth() ||
                        entryDate.getUTCDate() !== startDate.getUTCDate()) {
                        return false;
                    }
                } else if (startDate && endDate) {
                    const entryDate = new Date(entry.date);
                    const inclusiveEndDate = new Date(endDate);
                    inclusiveEndDate.setUTCHours(23, 59, 59, 999);
                    if (entryDate < startDate || entryDate > inclusiveEndDate) {
                        return false;
                    }
                }

                if (amountFilter) {
                    const amount = parseFloat(amountFilter);
                    const hasMatchingAmount = entry.debits.some(d => d.amount === amount) || entry.credits.some(c => c.amount === amount);
                    if (!hasMatchingAmount) return false;
                }

                if (searchTerm) {
                    const lowerSearchTerm = searchTerm.toLowerCase();
                    const inDescription = entry.description?.toLowerCase().includes(lowerSearchTerm);
                    const inAccountName = 
                        entry.debits.some(d => allAccounts.find(a => a.id == d.accountId)?.name.toLowerCase().includes(lowerSearchTerm)) ||
                        entry.credits.some(c => allAccounts.find(a => a.id == c.accountId)?.name.toLowerCase().includes(lowerSearchTerm));
                    if (!inDescription && !inAccountName) return false;
                }
                
                return true;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [journalEntries, searchTerm, amountFilter, startDate, endDate, allAccounts, selectedJournalEntryId, viewStatus]);

    const resetFilters = () => {
        setSearchTerm('');
        setAmountFilter('');
        setStartDate(null);
        setEndDate(null);
        if (setSelectedJournalEntryId) {
            setSelectedJournalEntryId(null);
        }
    };

    const getViewButtonClass = (status) => {
        return viewStatus === status
            ? 'px-4 py-2 font-semibold text-white bg-emerald-600 rounded-lg'
            : 'px-4 py-2 font-semibold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300';
    };

    const handleConfirmReject = () => {
        if (!entryToReject || !rejectionReason) return;
        updateJournalEntryStatus(entryToReject.id, 'Rejected', rejectionReason);
        setEntryToReject(null);
        setRejectionReason('');
    };

    const closeRejectModal = () => {
        setEntryToReject(null);
        setRejectionReason('');
    };

    const filteredAccountsForSearch = useMemo(() => {
        if (!searchTerm) return [];
        return allAccounts.filter(acc =>
            acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (acc.description && acc.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, allAccounts]);

    return (
        <div>
            {isCreating ? (
                <JournalEntryForm
                    accounts={allAccounts}
                    journalEntries={journalEntries}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsCreating(false)}
                    currentUser={currentUser}
                />
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Journal Entries</h2>
                        {canCreate && (
                            <button onClick={() => setIsCreating(true)} className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 flex items-center space-x-2">
                                <IconPlusCircle /><span>Create New Entry</span>
                            </button>
                        )}
                    </div>

                    {selectedJournalEntryId ? (
                        <div className="p-3 mb-4 bg-blue-100 border border-blue-300 rounded-lg flex justify-between items-center">
                            <span className="font-semibold text-blue-700">
                                Showing specific Journal Entry: {selectedJournalEntryId} (from Ledger)
                            </span>
                            <button
                                onClick={resetFilters}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                            >
                                Clear Filter
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex space-x-2 mb-4">
                                {canCreate && ( 
                                    <button onClick={() => setViewStatus('Pending')} className={getViewButtonClass('Pending')}>
                                        Pending Review
                                    </button>
                                )}
                                <button onClick={() => setViewStatus('Approved')} className={getViewButtonClass('Approved')}>
                                    Approved
                                </button>
                                <button onClick={() => setViewStatus('Rejected')} className={getViewButtonClass('Rejected')}>
                                    Rejected
                                </button>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg border mb-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Search by Account Name or Description</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Office Supplies"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onFocus={() => setShowAccountSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowAccountSuggestions(false), 200)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                        {showAccountSuggestions && filteredAccountsForSearch.length > 0 && (
                                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-auto">
                                                {filteredAccountsForSearch.map(acc => (
                                                    <div
                                                        key={acc.id}
                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                        onClick={() => {
                                                            setSearchTerm(acc.name);
                                                            setShowAccountSuggestions(false);
                                                        }}
                                                    >
                                                        {acc.name} {acc.description && `– ${acc.description}`}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Search by Amount</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 150.00"
                                            value={amountFilter}
                                            onChange={(e) => setAmountFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <DateInput value={startDate} onChange={setStartDate} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <DateInput value={endDate} onChange={setEndDate} />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={resetFilters} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold">
                                        Reset Filters
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Debits</th>
                                    <th className="p-3">Credits</th>
                                    <th className="p-3">Attachments</th>
                                    {isManager && viewStatus === 'Pending' && !selectedJournalEntryId && (
                                        <th className="p-3">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAndFilteredEntries.length > 0 ? (
                                    sortedAndFilteredEntries.map(entry => (
                                        <tr key={entry.id} className="border-b">
                                            <td className="p-3 align-top">{new Date(entry.date).toLocaleDateString()}</td>
                                            <td className="p-3 align-top">
                                                {entry.description || <span className="text-gray-400">N/A</span>}
                                                {viewStatus === 'Rejected' && entry.rejectionReason && (
                                                    <div className="mt-2 text-xs text-red-700 p-2 bg-red-50 border-l-4 border-red-300">
                                                        <strong>Reason:</strong> {entry.rejectionReason}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 align-top">
                                                {entry.debits.map(d => {
                                                    const acc = allAccounts.find(a => a.id == d.accountId);
                                                    return <div key={`${entry.id}-${d.accountId}-debit`} className="flex justify-between text-green-600">
                                                        {acc ? (
                                                            <button
                                                                onClick={() => handleAccountClick(acc.id)}
                                                                className="text-left hover:underline focus:outline-none"
                                                                title={`View ledger for ${acc.name}`}
                                                            >
                                                                {acc.name}
                                                            </button>
                                                        ) : (
                                                            <span>Unknown</span>
                                                        )}
                                                        <span>${d.amount.toFixed(2)}</span>
                                                    </div>
                                                })}
                                            </td>
                                            <td className="p-3 align-top">
                                                 {entry.credits.map(c => {
                                                    const acc = allAccounts.find(a => a.id == c.accountId);
                                                    return <div key={`${entry.id}-${c.accountId}-credit`} className="flex justify-between text-red-600">
                                                        {acc ? (
                                                            <button
                                                                onClick={() => handleAccountClick(acc.id)}
                                                                className="text-left hover:underline focus:outline-none"
                                                                title={`View ledger for ${acc.name}`}
                                                            >
                                                                {acc.name}
                                                            </button>
                                                        ) : (
                                                            <span>Unknown</span>
                                                        )}
                                                        <span>${c.amount.toFixed(2)}</span>
                                                    </div>
                                                })}
                                            </td>
                                            <td className="p-3 align-top">
                                                {entry.attachments && entry.attachments.length > 0 ? (
                                                    <div className="flex flex-col space-y-1">
                                                        {entry.attachments.map((file, index) => (
                                                            <a 
                                                                key={index} 
                                                                href="#" 
                                                                onClick={(e) => e.preventDefault()} 
                                                                className="text-xs text-blue-600 hover:underline flex items-center space-x-1"
                                                                title={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                                                            >
                                                                <IconPaperclip className="w-3 h-3 flex-shrink-0" />
                                                                <span className="truncate max-w-xs">{file.name}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">None</span>
                                                )}
                                            </td>
                                            {isManager && viewStatus === 'Pending' && !selectedJournalEntryId && (
                                                <td className="p-3 align-top">
                                                    <div className="flex space-x-2">
                                                        <button 
                                                            onClick={() => updateJournalEntryStatus(entry.id, 'Approved')}
                                                            className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                                            title="Approve this entry"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => setEntryToReject(entry)}
                                                            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                                            title="Reject this entry"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={isManager && viewStatus === 'Pending' && !selectedJournalEntryId ? 6 : 5} className="text-center p-8 text-gray-500">
                                            No journal entries match your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal isOpen={!!entryToReject} onClose={closeRejectModal} title="Reject Journal Entry">
                <div className="space-y-4">
                    <p>
                        You must provide a reason for rejecting this journal entry.
                        This reason will be visible to the accountant.
                    </p>
                    <label className="block text-sm font-medium text-gray-700">
                        Rejection Reason
                    </label>
                    <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="e.g., Incorrect account used for debit..."
                    />
                    <div className="flex justify-end space-x-2 pt-2">
                        <button
                            type="button"
                            onClick={closeRejectModal}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmReject}
                            disabled={!rejectionReason} 
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Confirm Reject
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default JournalEntriesPage;
