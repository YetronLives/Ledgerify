import React, { useState } from 'react';
import { IconLoading } from './Icons';
import { useRef } from 'react';


const CreateUserForm = ({ close, addUserToApp }) => {
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const formData = new FormData(formRef.current);
        const newUser = Object.fromEntries(formData.entries());
        
        const finalNewUser = {
            ...newUser,
            status: 'Active',
            passwordExpires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            securityQuestion: '1. What was your first pet\'s name?',
            securityAnswer: 'DefaultPet',
            securityQuestion2: '2. In what city were you born?',
            securityAnswer2: 'DefaultCity'
        };

        addUserToApp(finalNewUser);
        setIsLoading(false);
        close();
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-gray-600 mb-2">Username</label><input name="username" type="text" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
          <div><label className="block text-gray-600 mb-2">Full Name</label><input name="fullName" type="text" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
          <div><label className="block text-gray-600 mb-2">Email</label><input name="email" type="email" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
          <div><label className="block text-gray-600 mb-2">Address</label><input name="address" type="text" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="123 Main St, City, State"/></div>
          <div>
            <label className="block text-gray-600 mb-2">Role</label>
            <select name="role" required className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Accountant">Accountant</option>
              <option value="Manager">Manager</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>
          <div><label className="block text-gray-600 mb-2">Temporary Password</label><input name="password" type="password" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={close} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-teal-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
              {isLoading && <IconLoading className="w-5 h-5" />}
              <span>Create User</span>
            </button>
          </div>
        </form>
    );
};

export default CreateUserForm;
