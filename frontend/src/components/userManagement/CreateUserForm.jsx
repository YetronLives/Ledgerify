import React, { useState } from 'react';
import { IconLoading } from '../ui/Icons';
import { useRef } from 'react';


function CreateUserForm({ close, addUserToApp }) {
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        const formData = new FormData(formRef.current);
        const newUser = Object.fromEntries(formData.entries());
        
        // Split fullName into first_name and last_name
        const nameParts = newUser.fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || nameParts[0]; // Use first name as last if only one name provided
        
        try {
            // Make API call to backend to create user in Supabase
            const response = await fetch('http://localhost:5000/CreateUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: newUser.email,
                    address: newUser.address,
                    date_of_birth: newUser.dob,
                    question1: '1. What was your first pet\'s name?',
                    q1_answer: 'DefaultPet',
                    question2: '2. In what city were you born?',
                    q2_answer: 'DefaultCity',
                    role: newUser.role
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create user');
            }

            console.log('User created successfully in database:', data);

            // Also update the local state
            const finalNewUser = {
                username: newUser.username,
                fullName: newUser.fullName,
                firstName: firstName,
                lastName: lastName,
                email: newUser.email,
                address: newUser.address,
                dateOfBirth: newUser.dob,
                role: newUser.role,
                status: 'Active',
                passwordExpires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                securityQuestion: '1. What was your first pet\'s name?',
                securityAnswer: 'DefaultPet',
                securityQuestion2: '2. In what city were you born?',
                securityAnswer2: 'DefaultCity'
            };

            addUserToApp(finalNewUser);
            alert('User created successfully!');
            close();
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Failed to create user: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
          <div><label className="block text-gray-600 mb-2">Username</label><input name="username" type="text" required className="w-full px-4 py-2 border rounded-lg"/></div>
          <div><label className="block text-gray-600 mb-2">Full Name</label><input name="fullName" type="text" required className="w-full px-4 py-2 border rounded-lg"/></div>
          <div><label className="block text-gray-600 mb-2">Email</label><input name="email" type="email" required className="w-full px-4 py-2 border rounded-lg"/></div>
          <div><label className="block text-gray-600 mb-2">Address</label><input name="address" type="text" required className="w-full px-4 py-2 border rounded-lg"/></div>
          <div><label className="block text-gray-600 mb-2">Date of Birth</label><input name="dob" type="date" required className="w-full px-4 py-2 border rounded-lg"/></div>
          <div>
            <label className="block text-gray-600 mb-2">Role</label>
            <select name="role" required className="w-full px-4 py-2 border rounded-lg bg-white">
              <option value="Accountant">Accountant</option><option value="Manager">Manager</option><option value="Administrator">Administrator</option>
            </select>
          </div>
          <div><label className="block text-gray-600 mb-2">Temporary Password</label><input name="password" type="password" required className="w-full px-4 py-2 border rounded-lg"/></div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={close} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-teal-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center space-x-2">
              {isLoading && <IconLoading className="w-5 h-5" />}<span>Create User</span>
            </button>
          </div>
        </form>
    );
}

export default CreateUserForm;
