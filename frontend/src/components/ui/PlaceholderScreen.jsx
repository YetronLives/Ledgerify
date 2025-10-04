import React from 'react';

function PlaceholderScreen({ title, message }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <p className="text-gray-600">{message}</p>
        </div>
    );
}

export default PlaceholderScreen;
