import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal.jsx';
import { IconPlusCircle } from '../ui/Icons.jsx';
import AddAccountForm from './AddAccountForm.jsx';
import EditAccountForm from './EditAccountForm.jsx';
import AccountDetails from './AccountDetails.jsx';
import DeleteConfirmation from './DeleteConfirmation.jsx';

 function ChartOfAccounts({ currentUser, setPage, setSelectedLedgerAccount }) {
            const [accounts, setAccounts] = useState([]);
            const [isAddModalOpen, setIsAddModalOpen] = useState(false);
            const [searchTerm, setSearchTerm] = useState("");
            const [selectedAccount, setSelectedAccount] = useState(null);
            const [modalView, setModalView] = useState('view');
            const [formError, setFormError] = useState(''); // State for form errors
            const [isLoading, setIsLoading] = useState(true);
            
            const isAdmin = currentUser.role === 'Administrator';

            // Fetch accounts from database on component mount
            useEffect(() => {
                const fetchAccounts = async () => {
                    if (!currentUser?.id) {
                        setIsLoading(false);
                        return;
                    }

                    try {
                        const response = await fetch(`http://localhost:5000/chart-of-accounts/${currentUser.id}`);
                        const data = await response.json();
                        
                        if (response.ok && data.accounts) {
                            // Map database fields to frontend format
                            const mappedAccounts = data.accounts.map(acc => ({
                                number: acc.account_number,
                                name: acc.account_name,
                                description: acc.account_description,
                                normalSide: acc.normal_side.charAt(0).toUpperCase() + acc.normal_side.slice(1), // Capitalize first letter
                                category: acc.category,
                                subcategory: acc.subcategory,
                                initialBalance: acc.initial_balance,
                                balance: acc.balance,
                                debit: acc.debit,
                                credit: acc.credit,
                                order: acc.order_number,
                                statement: acc.statement,
                                comment: acc.comment,
                                addedDate: acc.created_at,
                                userId: acc.user_id
                            }));
                            setAccounts(mappedAccounts);
                        } else {
                            console.error('Failed to fetch accounts:', data.error);
                            setAccounts([]);
                        }
                    } catch (error) {
                        console.error('Error fetching accounts:', error);
                        setAccounts([]);
                    } finally {
                        setIsLoading(false);
                    }
                };

                fetchAccounts();
            }, [currentUser.id]);

            // --- State for filters ---
            const [categoryFilter, setCategoryFilter] = useState('all');
            const [normalSideFilter, setNormalSideFilter] = useState('all');
            const [balanceFilter, setBalanceFilter] = useState('all');

            const handleViewLedger = (account) => {
                setSelectedLedgerAccount(account);
                setPage('ledger');
            };

            const categoryNumberRanges = {
                'Assets': { min: 1000, max: 1999 },
                'Liabilities': { min: 2000, max: 2999 },
                'Equity': { min: 3000, max: 3999 },
                'Revenue': { min: 4000, max: 4999 },
                'Expenses': { min: 5000, max: 5999 }
            };

            const handleAddAccount = async (newAccountData) => {
                setFormError(''); 

                if (!newAccountData.name || !newAccountData.number) {
                    setFormError("Account Name and Number are required.");
                    return;
                }
                if (!/^\d+$/.test(newAccountData.number)) {
                    setFormError("Account Number must only contain numbers.");
                    return;
                }

                const range = categoryNumberRanges[newAccountData.category];
                const number = parseInt(newAccountData.number, 10);
                if (!range || number < range.min || number > range.max) {
                    setFormError(`For category "${newAccountData.category}", account number must be between ${range.min} and ${range.max}.`);
                    return;
                }

                const nameExists = accounts.some(acc => acc.name.toLowerCase() === newAccountData.name.toLowerCase());
                if (nameExists) {
                    setFormError('An account with this name already exists.');
                    return;
                }
                const numberExists = accounts.some(acc => acc.number === newAccountData.number);
                if (numberExists) {
                    setFormError('An account with this number already exists.');
                    return;
                }

                // Close modal and refresh accounts from database
                setIsAddModalOpen(false);
                
                // Refetch accounts from database to get the newly added one
                try {
                    const response = await fetch(`http://localhost:5000/chart-of-accounts/${currentUser.id}`);
                    const data = await response.json();
                    
                    if (response.ok && data.accounts) {
                        const mappedAccounts = data.accounts.map(acc => ({
                            number: acc.account_number,
                            name: acc.account_name,
                            description: acc.account_description,
                            normalSide: acc.normal_side.charAt(0).toUpperCase() + acc.normal_side.slice(1),
                            category: acc.category,
                            subcategory: acc.subcategory,
                            initialBalance: acc.initial_balance,
                            balance: acc.balance,
                            debit: acc.debit,
                            credit: acc.credit,
                            order: acc.order_number,
                            statement: acc.statement,
                            comment: acc.comment,
                            addedDate: acc.created_at,
                            userId: acc.user_id
                        }));
                        setAccounts(mappedAccounts);
                    }
                } catch (error) {
                    console.error('Error refreshing accounts:', error);
                }
            };

             const handleUpdateAccount = (updatedData) => {
                setFormError('');
                const originalAccount = accounts.find(acc => acc.number === selectedAccount.number);
                if (!originalAccount) return;

                const nameExists = accounts.some(acc => acc.name.toLowerCase() === updatedData.name.toLowerCase() && acc.number !== selectedAccount.number);
                if (nameExists) {
                    setFormError('An account with this name already exists.');
                    return;
                }
                 
                const oldInitialBalance = originalAccount.initialBalance;
                const newInitialBalance = parseFloat(updatedData.initialBalance) || 0;
                const balanceAdjustment = newInitialBalance - oldInitialBalance;

                setAccounts(prev => prev.map(acc => 
                    acc.number === selectedAccount.number 
                        ? { ...acc, ...updatedData, initialBalance: newInitialBalance, balance: acc.balance + balanceAdjustment } 
                        : acc
                ));
                closeAccountModal();
            };
            
            const handleAttemptDelete = () => {
                if (selectedAccount && selectedAccount.balance !== 0) {
                    setFormError("Cannot delete an account with a non-zero balance.");
                } else {
                    setFormError('');
                    setModalView('delete');
                }
            };

            const handleDeleteAccount = (accountNumber) => {
                setAccounts(prev => prev.filter(acc => acc.number !== accountNumber));
                closeAccountModal();
            };

            const openAccountModal = (account) => { setSelectedAccount(account); setModalView('view'); };
            const closeAccountModal = () => {
                setSelectedAccount(null);
                setFormError(''); // Clear errors on close
            };

            const filteredAccounts = accounts.filter(acc => {
                const searchMatch = acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || acc.number.toString().includes(searchTerm);
                const categoryMatch = categoryFilter === 'all' || acc.category === categoryFilter;
                const normalSideMatch = normalSideFilter === 'all' || acc.normalSide === normalSideFilter;
                
                const balanceMatch = (() => {
                    if (balanceFilter === 'all') return true;
                    if (balanceFilter === '0') return acc.balance === 0;
                    if (balanceFilter === '100000+') return acc.balance >= 100000;
                    
                    const [min, max] = balanceFilter.split('-').map(Number);
                    if (min === 0) return acc.balance > min && acc.balance <= max;
                    return acc.balance >= min && acc.balance < max;
                })();

                return searchMatch && categoryMatch && normalSideMatch && balanceMatch;
            });

            const resetFilters = () => {
                setSearchTerm('');
                setCategoryFilter('all');
                setNormalSideFilter('all');
                setBalanceFilter('all');
            };

            const balanceRanges = [
                { value: 'all', label: 'All Balances' }, { value: '0', label: '$0' }, { value: '0-10000', label: '$0 - $10,000' },
                { value: '10000-20000', label: '$10,000 - $20,000' }, { value: '20000-30000', label: '$20,000 - $30,000' },
                { value: '30000-40000', label: '$30,000 - $40,000' }, { value: '40000-50000', label: '$40,000 - $50,000' },
                { value: '50000-60000', label: '$50,000 - $60,000' }, { value: '60000-70000', label: '$60,000 - $70,000' },
                { value: '70000-80000', label: '$70,000 - $80,000' }, { value: '80000-90000', label: '$80,000 - $90,000' },
                { value: '90000-100000', label: '$90,000 - $100,000' }, { value: '100000+', label: '$100,000+' }
            ];


            return (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Account">
                        <AddAccountForm onSubmit={handleAddAccount} onCancel={() => setIsAddModalOpen(false)} error={formError} currentUser={currentUser} />
                    </Modal>
                    <Modal isOpen={!!selectedAccount} onClose={closeAccountModal} title={modalView === 'edit' ? `Edit Account: ${selectedAccount?.name}` : modalView === 'delete' ? 'Confirm Deletion' : `Account Details`}>
                        {selectedAccount && modalView === 'view' && <AccountDetails account={selectedAccount} onEdit={() => setModalView('edit')} onAttemptDelete={handleAttemptDelete} onViewLedger={handleViewLedger} error={formError} isAdmin={isAdmin} />}
                        {selectedAccount && modalView === 'edit' && <EditAccountForm account={selectedAccount} onUpdate={handleUpdateAccount} onCancel={() => setModalView('view')} error={formError} />}
                        {selectedAccount && modalView === 'delete' && <DeleteConfirmation accountName={selectedAccount.name} onConfirm={() => handleDeleteAccount(selectedAccount.number)} onCancel={() => setModalView('view')} />}
                    </Modal>

                    <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold mb-4 md:mb-0 text-gray-800">Chart of Accounts</h2>
                        <div className="flex items-center space-x-2">
                             <input type="text" placeholder="Search by name or number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-2 border rounded-lg"/>
                            {isAdmin && <button onClick={() => setIsAddModalOpen(true)} title="Add a new account to the chart" className="bg-teal-600 text-white py-2 px-4 rounded-lg hover-bg-teal-700 flex items-center space-x-2"><IconPlusCircle /><span>Add New Account</span></button>}
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2 mb-4 p-3 bg-gray-50 rounded-lg border">
                        <span className="font-semibold text-gray-600 text-sm">Filters:</span>
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full md:w-auto px-3 py-2 border rounded-lg bg-white text-sm">
                            <option value="all">All Categories</option>
                            <option value="Assets">Assets</option>
                            <option value="Liabilities">Liabilities</option>
                            <option value="Equity">Equity</option>
                            <option value="Revenue">Revenue</option>
                            <option value="Expenses">Expenses</option>
                        </select>
                         <select value={normalSideFilter} onChange={(e) => setNormalSideFilter(e.target.value)} className="w-full md:w-auto px-3 py-2 border rounded-lg bg-white text-sm">
                            <option value="all">Any Normal Side</option>
                            <option value="Debit">Debit</option>
                            <option value="Credit">Credit</option>
                        </select>
                        <select value={balanceFilter} onChange={(e) => setBalanceFilter(e.target.value)} className="w-full md:w-auto px-3 py-2 border rounded-lg bg-white text-sm">
                            {balanceRanges.map(range => (
                                <option key={range.value} value={range.value}>{range.label}</option>
                            ))}
                        </select>
                        <button onClick={resetFilters} title="Clear all search and filter criteria" className="w-full md:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold">
                            Reset Filters
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                <p className="mt-2 text-gray-500">Loading accounts...</p>
                            </div>
                        ) : (
                            <>
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3">Number</th><th className="p-3">Name</th><th className="p-3">Description</th><th className="p-3">Normal Side</th><th className="p-3">Category</th><th className="p-3">Subcategory</th>
                                            <th className="p-3 text-right">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAccounts.map((acc) => (
                                            <tr key={acc.number} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => openAccountModal(acc)}>
                                                <td className="p-3 font-mono">{acc.number}</td><td className="p-3 font-semibold">{acc.name}</td><td className="p-3 text-gray-500 max-w-xs truncate">{acc.description}</td>
                                                <td className="p-3">{acc.normalSide}</td><td className="p-3">{acc.category}</td><td className="p-3">{acc.subcategory}</td>
                                                <td className="p-3 text-right font-mono font-bold">${acc.balance.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredAccounts.length === 0 && <div className="text-center py-8 text-gray-500">No accounts found.</div>}
                            </>
                        )}
                    </div>
                </div>
            );
        }

export default ChartOfAccounts;