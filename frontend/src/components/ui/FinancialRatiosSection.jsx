// src/components/ui/FinancialRatiosSection.jsx
import React from 'react';
import RatioCard from './RatioCard';

const FinancialRatiosSection = ({ ratios }) => {
  if (!ratios || ratios.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Financial Health Dashboard</h3>
        <span className="text-sm text-gray-500">Based on latest approved financials</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ratios.map((ratio, index) => (
          <RatioCard key={index} ratio={ratio} />
        ))}
      </div>
    </div>
  );
};

export default FinancialRatiosSection;