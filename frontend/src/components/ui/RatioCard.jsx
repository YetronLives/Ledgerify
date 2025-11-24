// src/components/ui/RatioCard.jsx
import React from 'react';

const RatioCard = ({ ratio }) => {
  const { name, value, status } = ratio;

  const statusConfig = {
    green: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', label: 'Good' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', label: 'Caution' },
    red: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', label: 'Review' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500', label: 'N/A' },
  };

  const config = statusConfig[status] || statusConfig.gray;

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
      <div>
        <h4 className="font-semibold text-gray-800">{name}</h4>
        <p className="text-2xl font-bold mt-1 text-gray-900">
          {value !== null && value !== undefined && !isNaN(value) ? value.toFixed(2) : '—'}
        </p>
      </div>
      <div className="flex flex-col items-end">
        <span className={`inline-block w-3 h-3 rounded-full ${config.dot} mb-1`} aria-label={config.label}></span>
        <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
      </div>
    </div>
  );
};

export default RatioCard;