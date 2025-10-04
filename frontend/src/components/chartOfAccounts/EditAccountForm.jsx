import React, { useRef } from 'react';

function EditAccountForm({ account, onUpdate, onCancel, error }) {
     const formRef = useRef(null);
     const handleSubmit = (e) => {
         e.preventDefault();
         const formData = new FormData(formRef.current);
         const updatedAccountData = Object.fromEntries(formData.entries());
         onUpdate(updatedAccountData);
     };
     return (
         <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-gray-600 mb-1 text-sm">Account Name</label><input name="name" defaultValue={account.name} required className="w-full px-3 py-2 border rounded-lg"/></div>
                <div><label className="block text-gray-600 mb-1 text-sm">Account Number</label><input name="number" type="text" defaultValue={account.number} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-100"/></div>
            </div>
            <div><label className="block text-gray-600 mb-1 text-sm">Description</label><textarea name="description" defaultValue={account.description} required className="w-full px-3 py-2 border rounded-lg h-20"></textarea></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><label className="block text-gray-600 mb-1 text-sm">Category</label><select name="category" defaultValue={account.category} required className="w-full px-3 py-2 border rounded-lg bg-white"><option>Assets</option><option>Liabilities</option><option>Equity</option><option>Revenue</option><option>Expenses</option></select></div>
                 <div><label className="block text-gray-600 mb-1 text-sm">Subcategory</label><input name="subcategory" defaultValue={account.subcategory} required className="w-full px-3 py-2 border rounded-lg"/></div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><label className="block text-gray-600 mb-1 text-sm">Normal Side</label><select name="normalSide" defaultValue={account.normalSide} required className="w-full px-3 py-2 border rounded-lg bg-white"><option>Debit</option><option>Credit</option></select></div>
               <div><label className="block text-gray-600 mb-1 text-sm">Initial Balance</label><input name="initialBalance" type="number" step="0.01" defaultValue={account.initialBalance} required className="w-full px-3 py-2 border rounded-lg"/></div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-gray-600 mb-1 text-sm">Order</label><input name="order" type="number" defaultValue={account.order} placeholder="e.g., 1" required className="w-full px-3 py-2 border rounded-lg"/></div>
                 <div><label className="block text-gray-600 mb-1 text-sm">Statement</label><select name="statement" defaultValue={account.statement} required className="w-full px-3 py-2 border rounded-lg bg-white"><option value="BS">Balance Sheet (BS)</option><option value="IS">Income Statement (IS)</option><option value="RE">Retained Earnings (RE)</option></select></div>
            </div>
            <div><label className="block text-gray-600 mb-1 text-sm">Comment</label><input name="comment" defaultValue={account.comment} className="w-full px-3 py-2 border rounded-lg"/></div>
             {error && <div className="text-red-600 text-sm text-center mt-2">{error}</div>}
             <div className="flex justify-end space-x-2 pt-4"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Changes</button></div>
         </form>
     );
}

export default EditAccountForm;