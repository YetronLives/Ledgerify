// src/components/ui/NotificationBanner.jsx
import React from 'react';

// Define IconBell locally (since it's not in Icons.jsx)
const IconBell = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const NotificationBanner = ({ messages = [] }) => {
  if (messages.length === 0) return null;

  return (
    <div className="mb-4 space-y-3">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg shadow-sm flex items-start ${
            msg.type === 'warning'
              ? 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800'
              : msg.type === 'error'
              ? 'bg-red-100 border-l-4 border-red-500 text-red-800'
              : msg.type === 'info'
              ? 'bg-blue-100 border-l-4 border-blue-500 text-blue-800'
              : 'bg-gray-100 border-l-4 border-gray-500 text-gray-800'
          }`}
          role="alert"
        >
          <IconBell className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            {msg.title && <p className="font-bold">{msg.title}</p>}
            <p>{msg.text}</p>
            {msg.action && (
              <button
                onClick={msg.onClick}
                className={`mt-2 text-sm font-semibold underline ${
                  msg.type === 'warning'
                    ? 'text-yellow-900 hover:text-yellow-700'
                    : msg.type === 'error'
                    ? 'text-red-900 hover:text-red-700'
                    : 'text-blue-900 hover:text-blue-700'
                }`}
              >
                {msg.action}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationBanner;