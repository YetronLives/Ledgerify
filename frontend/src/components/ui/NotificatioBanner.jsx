// src/components/ui/NotificationBanner.jsx
import React from 'react';
import { IconBell } from './Icons';

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