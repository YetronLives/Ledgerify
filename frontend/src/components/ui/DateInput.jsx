import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// --- Icons ---
const IconCalendar = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconChevron = ({ direction, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {direction === 'left' ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    )}
  </svg>
);

const IconClear = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- Helper: Format date as MM/DD/YYYY ---
const formatDateDisplay = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC', // Use UTC to prevent timezone shifts
  });
};

// --- Calendar Popup ---
function CalendarPopup({ selectedDate, onSelect, onClose, width = 280, position }) {
  const getTodayUTC = () => {
    const today = new Date();
    return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  };
  
  const fixedToday = getTodayUTC();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const initialDate = selectedDate || fixedToday;
    return new Date(Date.UTC(initialDate.getUTCFullYear(), initialDate.getUTCMonth(), 1));
  });

  const popupRef = useRef(null);

  const goToPrevMonth = () => {
    setCurrentMonth(prev => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() - 1, 1)));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + 1, 1)));
  };


  const handleSelect = (day) => {
    const newDate = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), day, 12, 0, 0));
    onSelect(newDate); 
    onClose();
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const startOfMonth = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1));
  const endOfMonth = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 0));
  const startDay = startOfMonth.getUTCDay();
  const daysInMonth = endOfMonth.getUTCDate();

  const rows = [];
  let day = 1;

  for (let week = 0; week < 6; week++) {
    const cells = [];
    for (let weekday = 0; weekday < 7; weekday++) {
      if ((week === 0 && weekday < startDay) || day > daysInMonth) {
        cells.push(<td key={`empty-${week}-${weekday}`} className="p-1"></td>);
      } else {
        const isToday = 
            fixedToday.getUTCFullYear() === currentMonth.getUTCFullYear() &&
            fixedToday.getUTCMonth() === currentMonth.getUTCMonth() &&
            fixedToday.getUTCDate() === day;
        
        const isSelected = selectedDate &&
          selectedDate.getUTCFullYear() === currentMonth.getUTCFullYear() &&
          selectedDate.getUTCMonth() === currentMonth.getUTCMonth() &&
          selectedDate.getUTCDate() === day;
        
        const currentDay = day; 
        cells.push(
          <td key={day} className="p-1 text-center"> 
            <button
              type="button"
              onClick={() => handleSelect(currentDay)}
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
      ref={popupRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4"
      style={{
        width: `${width}px`,
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={goToPrevMonth} className="p-1 rounded-full hover:bg-gray-100">
          <IconChevron direction="left" className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-800">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
        </span>
        <button type="button" onClick={goToNextMonth} className="p-1 rounded-full hover:bg-gray-100">
          <IconChevron direction="right" className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <table className="w-full text-center text-xs text-gray-500">
        <thead>
          <tr>{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <th key={d} className="p-1 font-medium">{d}</th>)}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}


export default function DateInput({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });

const handleOpen = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const calendarHeight = 330;
        const calendarWidth = 280;
        const margin = 10; 
        const spaceBelow = window.innerHeight - rect.bottom;
        let top = rect.bottom + 5;
        if (spaceBelow < (calendarHeight + margin) && rect.top > (calendarHeight + margin)) {
            top = rect.top - calendarHeight - 5;
        }
        top = Math.max(margin, top);
        top = Math.min(top, window.innerHeight - calendarHeight - margin);
        let left = rect.left;
        if (left + calendarWidth + margin > window.innerWidth) {
            left = rect.right - calendarWidth;
        }
        left = Math.max(margin, left);
        left = Math.min(left, window.innerWidth - calendarWidth - (margin * 1.5)); 

        setCalendarPosition({ top, left });
      }
      setIsOpen(true);
  };

  const handleSelect = (date) => {
    onChange(date);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={value ? formatDateDisplay(value) : ''}
          placeholder="MM/DD/YYYY"
          onClick={handleOpen}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
          {value && (
            <button type="button" onClick={handleClear} title="Clear date" className="text-gray-400 hover:text-red-500">
              <IconClear className="w-4 h-4" />
            </button>
          )}
          <IconCalendar className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {isOpen && inputRef.current && createPortal(
        <CalendarPopup
          selectedDate={value}
          onSelect={handleSelect} 
          onClose={() => setIsOpen(false)}
          width={inputRef.current.offsetWidth < 280 ? 280 : inputRef.current.offsetWidth}
          position={calendarPosition}
        />,
        document.body
      )}
    </div>
  );
}