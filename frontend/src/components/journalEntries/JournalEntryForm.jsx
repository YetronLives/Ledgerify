// src/components/JournalEntryForm.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { IconPaperclip, IconX } from '../ui/Icons';
import { computeAccountBalances } from '../../utils/accountUtils'; // adjust path as needed

const AccountSearchInput = ({ value, onChange, accounts, balances = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const selectedAccount = accounts.find(acc => acc.id === value);
  const filteredAccounts = accounts.filter(acc =>
    acc.name.toLowerCase().includes(inputValue.toLowerCase()) ||
    acc.number.toString().includes(inputValue)
  );

  const handleSelect = (acc) => {
    onChange(acc.id);
    setInputValue(acc.name);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (!val) {
      onChange('');
    }
    setIsOpen(true);
  };

  useEffect(() => {
    if (selectedAccount) {
      setInputValue(selectedAccount.name);
    } else if (!value) {
      setInputValue('');
    }
  }, [value, selectedAccount]);

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder="Search account..."
        className="w-full px-3 py-2 border rounded-lg bg-white"
      />
      {isOpen && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto mt-1">
          {filteredAccounts.length > 0 ? (
            filteredAccounts.map(acc => {
              const currentBalance = balances[acc.id] || 0;
              return (
                <div
                  key={acc.id}
                  onClick={() => handleSelect(acc)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  <div className="font-medium">{acc.name}</div>
                  <div className="text-xs text-gray-500">#{acc.number} • Balance: ${currentBalance.toFixed(2)}</div>
                </div>
              );
            })
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">No accounts found</div>
          )}
        </div>
      )}
    </div>
  );
};

function JournalEntryForm({ accounts, journalEntries, onSubmit, onCancel, currentUser }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [description, setDescription] = useState('');
  const [debits, setDebits] = useState([{ id: Date.now(), accountId: '', amount: '' }]);
  const [credits, setCredits] = useState([{ id: Date.now() + 1, accountId: '', amount: '' }]);
  const [error, setError] = useState('');
  
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

  const currentBalances = useMemo(() => {
    return computeAccountBalances(accounts, journalEntries);
  }, [accounts, journalEntries]);

  const previewBalances = useMemo(() => {
    const preview = { ...currentBalances };
    debits.forEach(d => {
      if (d.accountId && d.amount) {
        const amt = parseFloat(d.amount);
        if (!isNaN(amt)) {
          preview[d.accountId] = (preview[d.accountId] || 0) + amt;
        }
      }
    });
    credits.forEach(c => {
      if (c.accountId && c.amount) {
        const amt = parseFloat(c.amount);
        if (!isNaN(amt)) {
          preview[c.accountId] = (preview[c.accountId] || 0) - amt;
        }
      }
    });
    return preview;
  }, [currentBalances, debits, credits]);

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

  const validateJournalEntry = async () => {
    const errors = [];
    
    // 1. Check for empty debits or credits
    const emptyDebits = debits.filter(d => !d.accountId || !d.amount || parseFloat(d.amount) <= 0);
    const emptyCredits = credits.filter(c => !c.accountId || !c.amount || parseFloat(c.amount) <= 0);
    
    if (emptyDebits.length > 0) {
      errors.push({
        type: 'EMPTY_DEBIT_LINES',
        message: `Line ${debits.indexOf(emptyDebits[0]) + 1} in Debits: Please select an account and enter an amount greater than zero.`,
        resolution: 'Select a valid account and enter an amount greater than $0.00 for all debit lines.'
      });
    }
    
    if (emptyCredits.length > 0) {
      errors.push({
        type: 'EMPTY_CREDIT_LINES',
        message: `Line ${credits.indexOf(emptyCredits[0]) + 1} in Credits: Please select an account and enter an amount greater than zero.`,
        resolution: 'Select a valid account and enter an amount greater than $0.00 for all credit lines.'
      });
    }
    
    // 2. Check for zero totals
    if (totalDebits === 0 && totalCredits === 0) {
      errors.push({
        type: 'ZERO_TOTALS',
        message: 'Both Debits and Credits totals are zero. A journal entry must have at least one transaction with an amount greater than zero.',
        resolution: 'Add at least one debit and one credit entry with amounts greater than zero.'
      });
    }
    
    // 3. Check for unbalanced entry (debits must equal credits)
    if (totalDebits !== totalCredits) {
      const difference = Math.abs(totalDebits - totalCredits);
      errors.push({
        type: 'UNBALANCED_ENTRY',
        message: `The journal entry is out of balance! Total Debits: $${totalDebits.toFixed(2)} | Total Credits: $${totalCredits.toFixed(2)} | Difference: $${difference.toFixed(2)}`,
        resolution: totalDebits > totalCredits 
          ? `Increase credits by $${difference.toFixed(2)} or decrease debits by $${difference.toFixed(2)} to balance the entry.`
          : `Increase debits by $${difference.toFixed(2)} or decrease credits by $${difference.toFixed(2)} to balance the entry.`
      });
    }
    
    // 4. Check for invalid amounts (negative, zero, or NaN)
    const invalidDebits = debits.filter(d => {
      const amt = parseFloat(d.amount);
      return !isNaN(amt) && (amt <= 0 || isNaN(amt));
    });
    const invalidCredits = credits.filter(c => {
      const amt = parseFloat(c.amount);
      return !isNaN(amt) && (amt <= 0 || isNaN(amt));
    });
    
    if (invalidDebits.length > 0 || invalidCredits.length > 0) {
      errors.push({
        type: 'INVALID_AMOUNTS',
        message: 'One or more entries contain invalid amounts. All amounts must be positive numbers greater than zero.',
        resolution: 'Ensure all amounts are valid positive numbers greater than $0.00.'
      });
    }
    
    // 5. Check for duplicate account usage (optional business rule)
    const allDebitAccounts = debits.map(d => d.accountId).filter(id => id);
    const allCreditAccounts = credits.map(c => c.accountId).filter(id => id);
    const duplicateDebits = allDebitAccounts.filter((id, index) => allDebitAccounts.indexOf(id) !== index);
    const duplicateCredits = allCreditAccounts.filter((id, index) => allCreditAccounts.indexOf(id) !== index);
    
    // Note: This is informational, not an error in standard accounting
    // Adding as a warning that can be logged
    
    // 6. Check account selection
    const missingDebitAccounts = debits.filter(d => !d.accountId);
    const missingCreditAccounts = credits.filter(c => !c.accountId);
    
    if (missingDebitAccounts.length > 0) {
      errors.push({
        type: 'MISSING_DEBIT_ACCOUNTS',
        message: `${missingDebitAccounts.length} debit line(s) have no account selected.`,
        resolution: 'Select a valid account for each debit line from the account dropdown.'
      });
    }
    
    if (missingCreditAccounts.length > 0) {
      errors.push({
        type: 'MISSING_CREDIT_ACCOUNTS',
        message: `${missingCreditAccounts.length} credit line(s) have no account selected.`,
        resolution: 'Select a valid account for each credit line from the account dropdown.'
      });
    }
    
    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const entryData = {
      description,
      debits: debits.map(d => ({ accountId: d.accountId, accountName: accounts.find(a => a.id === d.accountId)?.name, amount: parseFloat(d.amount) })),
      credits: credits.map(c => ({ accountId: c.accountId, accountName: accounts.find(a => a.id === c.accountId)?.name, amount: parseFloat(c.amount) })),
      attachments: attachments.map(f => ({ name: f.name, size: f.size, type: f.type }))
    };

    // Validate the journal entry
    const validationErrors = await validateJournalEntry();
    
    if (validationErrors.length > 0) {
      // Log errors to database
      try {
        for (const error of validationErrors) {
          await fetch('http://localhost:5000/api/journal-entries/log-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: currentUser.id,
              error_type: error.type,
              error_message: error.message,
              entry_data: entryData,
              resolution_suggestion: error.resolution
            })
          });
        }
      } catch (err) {
        console.error('Failed to log errors to database:', err);
      }
      
      // Display first error to user
      const primaryError = validationErrors[0];
      setError(`${primaryError.message} ${primaryError.resolution ? `\n\nHow to fix: ${primaryError.resolution}` : ''}`);
      return;
    }

    const entry = {
      id: `JE-${Date.now()}`,
      date: new Date().toISOString(),
      description,
      debits: debits.map(d => ({ accountId: d.accountId, amount: parseFloat(d.amount) })),
      credits: credits.map(c => ({ accountId: c.accountId, amount: parseFloat(c.amount) })),
      attachments: attachments.map(f => ({ name: f.name, size: f.size, type: f.type }))
    };
    onSubmit(entry);

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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Debits</h3>
            {debits.map((debit) => {
              const acc = accounts.find(a => a.id === debit.accountId);
              const currentBal = currentBalances[debit.accountId] || 0;
              const newBal = previewBalances[debit.accountId] || currentBal;
              return (
                <div key={debit.id} className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <AccountSearchInput
                      value={debit.accountId}
                      onChange={(id) => handleRowChange(debit.id, 'accountId', id, 'debit')}
                      accounts={sortedAccounts}
                      balances={currentBalances}
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={debit.amount}
                      onChange={(e) => handleRowChange(debit.id, 'amount', e.target.value, 'debit')}
                      className="w-48 px-3 py-2 border rounded-lg"
                      placeholder="Amount"
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(debit.id, 'debit')}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      disabled={debits.length === 1}
                    >
                      &times;
                    </button>
                  </div>
                  {acc && (
                    <div className="text-xs text-gray-600 ml-2">
                      Current: ${currentBal.toFixed(2)} → New: ${newBal.toFixed(2)}
                    </div>
                  )}
                </div>
              );
            })}
            <button type="button" onClick={() => addRow('debit')} className="text-sm text-blue-600 hover:underline">+ Add Debit</button>
            <div className="text-right font-bold pt-2">Total Debits: ${totalDebits.toFixed(2)}</div>
          </div>

          {/* Credits Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Credits</h3>
            {credits.map((credit) => {
              const acc = accounts.find(a => a.id === credit.accountId);
              const currentBal = currentBalances[credit.accountId] || 0;
              const newBal = previewBalances[credit.accountId] || currentBal;
              return (
                <div key={credit.id} className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <AccountSearchInput
                      value={credit.accountId}
                      onChange={(id) => handleRowChange(credit.id, 'accountId', id, 'credit')}
                      accounts={sortedAccounts}
                      balances={currentBalances}
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={credit.amount}
                      onChange={(e) => handleRowChange(credit.id, 'amount', e.target.value, 'credit')}
                      className="w-48 px-3 py-2 border rounded-lg"
                      placeholder="Amount"
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(credit.id, 'credit')}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      disabled={credits.length === 1}
                    >
                      &times;
                    </button>
                  </div>
                  {acc && (
                    <div className="text-xs text-gray-600 ml-2">
                      Current: ${currentBal.toFixed(2)} → New: ${newBal.toFixed(2)}
                    </div>
                  )}
                </div>
              );
            })}
            <button type="button" onClick={() => addRow('credit')} className="text-sm text-blue-600 hover:underline">+ Add Credit</button>
            <div className="text-right font-bold pt-2">Total Credits: ${totalCredits.toFixed(2)}</div>
          </div>
        </div>

        {/* Attachments */}
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
