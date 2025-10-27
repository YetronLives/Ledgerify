// src/ui/DateInput.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

// --- Icons ---
const IconCalendar = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconChevron = ({ direction, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {direction === 'left' ? (
      <polyline points="15 18 9 12 15 6" />
    ) : (
      <polyline points="9 18 15 12 9 6" />
    )}
  </svg>
);

const IconClear = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// --- Helper: Format date as MM/DD/YYYY ---
const formatDateDisplay = (date) => {
  if (!date) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

// --- Calendar Popup ---
function CalendarPopup({ selectedDate, onSelect, onClose, width = 256 }) {
  const fixedToday = new Date();
  
  // ✅ Use a ref to track if it's the initial render
  const initialRender = useRef(true);
  
  // ✅ Derive currentMonth from selectedDate
  const getInitialMonth = () => {
    if (selectedDate) {
      return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }
    return new Date(fixedToday.getFullYear(), fixedToday.getMonth(), 1);
  };

  const [currentMonth, setCurrentMonth] = useState(getInitialMonth);

  // ✅ Update currentMonth when selectedDate changes
  useEffect(() => {
    if (!initialRender.current) {
      setCurrentMonth(getInitialMonth());
    }
    initialRender.current = false;
  }, [selectedDate]);

  const goToPrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
   const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelect(newDate);
    onClose();
  };
  // Generate calendar grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  const startDay = startOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = endOfMonth.getDate();

  const rows = [];
  let day = 1;

  for (let week = 0; week < 6; week++) {
    const cells = [];
    for (let weekday = 0; weekday < 7; weekday++) {
      if (week === 0 && weekday < startDay) {
        cells.push(<td key={`empty-${weekday}`} className="p-1"></td>);
      } else if (day > daysInMonth) {
        cells.push(<td key={`empty-end-${week}-${weekday}`} className="p-1"></td>);
      } else {
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === fixedToday.toDateString();
        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

        cells.push(
          <td key={day} className="p-1 text-center">
            <button
              type="button"
              onClick={() => handleSelect(day)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition
                ${isSelected ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
                  isToday ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                  'text-gray-700 hover:bg-gray-100'}`}
            >
              {day}
            </button>
          </td>
        );
        day++;
      }
    }
    rows.push(<tr key={week}>{cells}</tr>);
    if (day > daysInMonth) break;
  }

  return (
    <div 
      className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
      style={{ width: `${width}px` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={goToPrevMonth} className="p-1 rounded hover:bg-gray-100">
          <IconChevron direction="left" className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-800">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={goToNextMonth} className="p-1 rounded hover:bg-gray-100">
          <IconChevron direction="right" className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Weekdays */}
      <table className="w-full text-center text-xs text-gray-500">
        <thead>
          <tr>{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <th key={d} className="p-1">{d}</th>)}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

// --- Main DateInput Component ---
export default function DateInput({ label, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const handleSelect = (date) => {
    onChange(date);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setIsOpen(false);
  };

  const handleClickOutside = useCallback((e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClickOutside]);

  return (
    <div ref={containerRef} className="relative w-full">
      {label && <label className="block text-sm text-gray-600 mb-1">{label}</label>}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={value ? formatDateDisplay(value) : ''}
          placeholder="MM/DD/YYYY"
          onClick={() => setIsOpen(true)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
          {value && (
            <button type="button" onClick={handleClear} className="text-gray-400 hover:text-red-500">
              <IconClear className="w-4 h-4" />
            </button>
          )}
          <IconCalendar className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {isOpen && inputRef.current && (
        <CalendarPopup
          selectedDate={value}
          onSelect={handleSelect}
          onClose={() => setIsOpen(false)}
          width={inputRef.current.offsetWidth}
        />
      )}
    </div>
  );
}