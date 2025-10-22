import React, { useState, useMemo, useEffect } from 'react';
import { IconPaperclip, IconX } from '../ui/Icons'; 

function JournalEntryForm({ accounts, onSubmit, onCancel, currentUser }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [description, setDescription] = useState('');
    const [debits, setDebits] = useState([{ id: Date.now(), accountId: '', amount: '' }]);
    const [credits, setCredits] = useState([{ id: Date.now() + 1, accountId: '', amount: '' }]);
    const [error, setError] = useState('');
    
    // --- State for attachments ---
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = React.useRef(null);
    const ACCEPTED_FILES = "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,image/jpeg,image/png";

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleRowChange = (id, field, value, type) => {
        const list = type === 'debit' ? debits : credits;
        const setList = type === 'debit' ? setDebits : setCredits;
        const newList = list.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        setList(newList);
    };

    const addRow = (type) => {
        const setList = type === 'debit' ? setDebits : setCredits;
        setList(prev => [...prev, { id: Date.now(), accountId: '', amount: '' }]);
    };

    const removeRow = (id, type) => {
        const list = type === 'debit' ? debits : credits;
        const setList = type === 'debit' ? setDebits : setCredits;
        if (list.length > 1) {
            setList(list.filter(item => item.id !== id));
        }
    };

    const totalDebits = useMemo(() => debits.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0), [debits]);
    const totalCredits = useMemo(() => credits.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0), [credits]);

    // --- File attachment handlers ---
    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const validFiles = [];
        for (const file of newFiles) {
            if (!attachments.find(f => f.name === file.name && f.size === file.size)) {
                validFiles.push(file);
            }
        }
        setAttachments(prev => [...prev, ...validFiles]);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    const removeAttachment = (fileName) => {
        setAttachments(prev => prev.filter(file => file.name !== fileName));
    };


    // This will need updating with backend integration later
    const handleFormSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (totalDebits === 0 || totalCredits === 0) {
            setError('Debits and Credits must be greater than zero.');
            return;
        }
        if (totalDebits !== totalCredits) {
            setError('Total debits must equal total credits.');
            return;
        }

        const isAnyFieldEmpty = [...debits, ...credits].some(item => !item.accountId || !item.amount);
        if (isAnyFieldEmpty) {
            setError('Please select an account and enter an amount for each line.');
            return;
        }

        const entry = {
            id: `JE-${Date.now()}`,
            date: new Date().toISOString(),
            description,
            debits: debits.map(d => ({ ...d, amount: parseFloat(d.amount) })),
            credits: credits.map(c => ({ ...c, amount: parseFloat(c.amount) })),
            // ---Add attachment metadata (name, size, type) ---
            attachments: attachments.map(f => ({ name: f.name, size: f.size, type: f.type }))
        };
        onSubmit(entry);

        // --- Notify accountant of pending review ---
        if (currentUser && currentUser.role === 'Accountant') {
            alert('Your journal entry has been submitted for manager review.');
        }
    };

    const sortedAccounts = useMemo(() => [...accounts].sort((a, b) => a.name.localeCompare(b.name)), [accounts]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">New Journal Entry</h2>
            <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-600 mb-1 text-sm">Entry Date & Time</label>
                        <div className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                            {currentTime.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">The current date and time will be automatically recorded upon submission.</p>
                    </div>
                    <div>
                        <label className="block text-gray-600 mb-1 text-sm">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="(Optional)"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Debits Section */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Debits</h3>
                        {debits.map((debit, index) => (
                            <div key={debit.id} className="flex items-center space-x-2">
                                <select value={debit.accountId} onChange={(e) => handleRowChange(debit.id, 'accountId', e.target.value, 'debit')} className="w-full px-3 py-2 border rounded-lg bg-white">
                                    <option value="" disabled>Select Account</option>
                                    {sortedAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (#{acc.number})</option>)}
                                </select>
                                <input type="number" step="0.01" min="0.01" value={debit.amount} onChange={(e) => handleRowChange(debit.id, 'amount', e.target.value, 'debit')} className="w-48 px-3 py-2 border rounded-lg" placeholder="Amount" />
                                <button type="button" onClick={() => removeRow(debit.id, 'debit')} className="text-red-500 hover:text-red-700 disabled:opacity-50" disabled={debits.length === 1}>&times;</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addRow('debit')} className="text-sm text-blue-600 hover:underline">+ Add Debit</button>
                        <div className="text-right font-bold pt-2">Total Debits: ${totalDebits.toFixed(2)}</div>
                    </div>

                    {/* Credits Section */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Credits</h3>
                        {credits.map((credit, index) => (
                            <div key={credit.id} className="flex items-center space-x-2">
                                <select value={credit.accountId} onChange={(e) => handleRowChange(credit.id, 'accountId', e.target.value, 'credit')} className="w-full px-3 py-2 border rounded-lg bg-white">
                                    <option value="" disabled>Select Account</option>
                                    {sortedAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (#{acc.number})</option>)}
                                </select>
                                <input type="number" step="0.01" min="0.01" value={credit.amount} onChange={(e) => handleRowChange(credit.id, 'amount', e.target.value, 'credit')} className="w-48 px-3 py-2 border rounded-lg" placeholder="Amount" />
                                <button type="button" onClick={() => removeRow(credit.id, 'credit')} className="text-red-500 hover:text-red-700 disabled:opacity-50" disabled={credits.length === 1}>&times;</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addRow('credit')} className="text-sm text-blue-600 hover:underline">+ Add Credit</button>
                        <div className="text-right font-bold pt-2">Total Credits: ${totalCredits.toFixed(2)}</div>
                    </div>
                </div>

                {/* --- Attachments Section --- */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">Attachments</h3>
                    <label 
                        className="w-full flex justify-center px-4 py-6 bg-white text-blue-600 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-gray-50 cursor-pointer"
                        title="Allowed types: pdf, word, excel, csv, jpg, png"
                    >
                        <span className="flex items-center space-x-2">
                            <IconPaperclip className="w-5 h-5" />
                            <span>Click to add source documents</span>
                        </span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={ACCEPTED_FILES}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                    {attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium text-gray-600">Attached files:</p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                {attachments.map(file => (
                                    <li key={file.name} className="text-sm text-gray-700 flex items-center justify-between">
                                        <span>
                                            {file.name} 
                                            <span className="text-gray-500 text-xs ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                                        </span>
                                        <button 
                                            type="button" 
                                            onClick={() => removeAttachment(file.name)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Remove attachment"
                                        >
                                            <IconX className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>


                {error && <div className="text-red-600 text-sm text-center font-semibold p-2 bg-red-50 rounded-lg">{error}</div>}
                <div className={`text-center font-bold text-lg p-2 rounded-lg ${totalDebits !== totalCredits || totalDebits === 0 ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'}`}>
                    {totalDebits !== totalCredits ? 'Out of Balance' : 'Balanced'}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Submit Journal Entry</button>
                </div>
            </form>
        </div>
    );
}

export default JournalEntryForm;