import React, { useState } from 'react';
import { IconUser } from './Icons';

const Profile = ({ user, updateUserInApp }) => {
    const [profileImage, setProfileImage] = useState(user.profileImage || null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || ''
    });

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                setProfileImage(imageUrl);
                // Update user data with new profile image
                if (updateUserInApp) {
                    updateUserInApp(user.username || user.email, { profileImage: imageUrl });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        if (updateUserInApp) {
            updateUserInApp(user.username || user.email, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                fullName: `${formData.firstName} ${formData.lastName}`,
                address: formData.address,
                dateOfBirth: formData.dateOfBirth
            });
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            address: user.address || '',
            dateOfBirth: user.dateOfBirth || ''
        });
        setIsEditing(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header Section */}
                <div className="bg-emerald-500 px-6 py-8 text-white">
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                                {profileImage ? (
                                    <img 
                                        src={profileImage} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <IconUser className="w-12 h-12 text-white" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-emerald-700 rounded-full p-2 cursor-pointer hover:bg-emerald-800 transition-colors">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{user.fullName || `${user.firstName} ${user.lastName}`}</h1>
                            <p className="text-emerald-100 text-lg">{user.role}</p>
                            <p className="text-emerald-200">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Profile Information</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <div className="space-x-2">
                                <button
                                    onClick={handleSave}
                                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">Personal Information</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">{user.firstName || 'Not provided'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">{user.lastName || 'Not provided'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">{user.email}</p>
                                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">
                                        {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">Account Information</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                                <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">{user.username || 'Not provided'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                                <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">{user.role}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Account Status</label>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        user.status === 'Active' 
                                            ? 'bg-green-100 text-green-800' 
                                            : user.status === 'Suspended'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {user.status}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                                {isEditing ? (
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        rows="3"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="Enter your address"
                                    />
                                ) : (
                                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg min-h-[80px]">
                                        {user.address || 'Not provided'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Password Expiration</label>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    {user.passwordExpires ? (
                                        <div>
                                            <p className={`text-sm ${new Date(user.passwordExpires) < new Date() ? 'text-red-600 font-semibold' : new Date(user.passwordExpires) < new Date(Date.now() + 24*60*60*1000) ? 'text-orange-600 font-semibold' : 'text-gray-800'}`}>
                                                {new Date(user.passwordExpires).toLocaleDateString()}
                                            </p>
                                            {new Date(user.passwordExpires) < new Date() && (
                                                <span className="text-xs text-red-500 font-bold">EXPIRED - Please contact administrator</span>
                                            )}
                                            {new Date(user.passwordExpires) >= new Date() && new Date(user.passwordExpires) < new Date(Date.now() + 24*60*60*1000) && (
                                                <span className="text-xs text-orange-500 font-bold">EXPIRES SOON - Consider changing password</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-sm">Not set</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Information (Read-only) */}
                    {(user.securityAnswer || user.securityAnswer2) && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Security Questions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {user.securityAnswer && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Security Answer 1</label>
                                        <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">{user.securityAnswer}</p>
                                    </div>
                                )}
                                {user.securityAnswer2 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Security Answer 2</label>
                                        <p className="text-gray-800 p-3 bg-gray-50 rounded-lg">{user.securityAnswer2}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
