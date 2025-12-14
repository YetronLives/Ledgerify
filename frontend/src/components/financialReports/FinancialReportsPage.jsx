// src/components/financialReports/FinancialReportsPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { generateFinancialReport } from '../../utils/reportUtils';
import DateInput from '../ui/DateInput';
import Modal from '../ui/Modal';

const REPORT_TYPES = [
  'Trial Balance',
  'Income Statement',
  'Balance Sheet',
  'Retained Earnings Statement'
];

const FinancialReportsPage = ({ accounts, journalEntries, currentUser, onBack }) => {
  // Default end date to today (as Date object for DateInput component)
  const getTodayDate = () => {
    const today = new Date();
    // Normalize to midnight UTC to match date-only comparisons
    return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0));
  };

  const [reportType, setReportType] = useState('Trial Balance');
  const [date, setDate] = useState(null); // For Balance Sheet
  const [startDate, setStartDate] = useState(null); // For others
  const [endDate, setEndDate] = useState(getTodayDate());
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const isBalanceSheet = reportType === 'Balance Sheet';

  // Add fade-in animation globally
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleGenerate = () => {
    if (isBalanceSheet && !date) {
      alert('Please select a date for the Balance Sheet.');
      return;
    }
    if (!isBalanceSheet && !endDate) {
      alert('Please select an end date for the report period.');
      return;
    }

    setIsGenerating(true);
    try {
      // Convert dates to ISO strings (YYYY-MM-DD) for consistent handling in report generation
      const formatDateForReport = (dateValue) => {
        if (!dateValue) return null;
        if (typeof dateValue === 'string') return dateValue;
        if (dateValue instanceof Date) {
          // Convert to YYYY-MM-DD format
          const year = dateValue.getFullYear();
          const month = String(dateValue.getMonth() + 1).padStart(2, '0');
          const day = String(dateValue.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
        return dateValue;
      };

      const report = generateFinancialReport(
        reportType,
        accounts,
        journalEntries,
        isBalanceSheet ? formatDateForReport(date) : null,
        isBalanceSheet ? null : { 
          start: formatDateForReport(startDate) || '1970-01-01', 
          end: formatDateForReport(endDate) 
        }
      );
      setGeneratedReport(report);
    } catch (err) {
      console.error('Report generation error:', err);
      alert('Failed to generate report: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    if (!generatedReport) return;
    setEmailModalOpen(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Financial Reports</h2>
        <button 
          onClick={onBack} 
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Report Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {REPORT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {isBalanceSheet ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">As of Date</label>
            <DateInput value={date} onChange={setDate} />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (optional)</label>
              <DateInput value={startDate} onChange={setStartDate} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <DateInput value={endDate} onChange={setEndDate} />
            </div>
          </>
        )}

        <div className="flex items-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-2 px-4 rounded-lg font-semibold ${
              isGenerating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Report Display */}
      {generatedReport && (
        <div id="report-content" className="mt-6 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{generatedReport.title}</h3>
              <p className="text-gray-600">
                As of {generatedReport.date.toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button onClick={handlePrint} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                Print / Save
              </button>
              <button onClick={handleEmail} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                Email
              </button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            {generatedReport.title === 'Trial Balance' && (
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Account #</th>
                    <th className="p-2 text-left">Account Name</th>
                    <th className="p-2 text-right">Debit</th>
                    <th className="p-2 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedReport.rows.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono">{row.accountNumber}</td>
                      <td className="p-2">{row.accountName}</td>
                      <td className="p-2 text-right font-mono">{row.debit > 0 ? `$${row.debit.toFixed(2)}` : ''}</td>
                      <td className="p-2 text-right font-mono">{row.credit > 0 ? `$${row.credit.toFixed(2)}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-bold">
                  <tr>
                    <td colSpan="2" className="p-2 text-right">Totals:</td>
                    <td className="p-2 text-right font-mono">${generatedReport.meta.totalDebit.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono">${generatedReport.meta.totalCredit.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            )}

            {generatedReport.title === 'Income Statement' && (
              <div className="p-4">
                {generatedReport.rows.map((row, i) => {
                  if (row.type === 'spacer') return <div key={i} className="my-2 border-t"></div>;
                  return (
                    <div key={i} className={`flex justify-between py-1 ${row.type === 'header' ? 'font-bold bg-gray-100 px-2 -mx-4' : ''} ${row.type === 'net' ? 'font-bold text-lg mt-2 pt-2 border-t' : ''}`}>
                      <span>{row.label}</span>
                      <span className="font-mono">{row.amount !== null ? `$${row.amount.toFixed(2)}` : ''}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {generatedReport.title === 'Balance Sheet' && (
              <div className="p-4">
                <div className="mb-6">
                  <h4 className="font-bold text-lg mb-2">Assets</h4>
                  {generatedReport.rows.find(s => s.section === 'Assets')?.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-1">
                      <span>{item.name}</span>
                      <span className="font-mono">${item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 font-bold border-t mt-2">
                    <span>Total Assets</span>
                    <span className="font-mono">${generatedReport.meta.totalAssets.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2">Liabilities and Equity</h4>
                  <div className="ml-4 mb-4">
                    <h5 className="font-semibold mb-1">Liabilities</h5>
                    {generatedReport.rows.find(s => s.section === 'Liabilities')?.items.map((item, i) => (
                      <div key={i} className="flex justify-between py-1">
                        <span>{item.name}</span>
                        <span className="font-mono">${item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 font-bold border-t mt-2">
                      <span>Total Liabilities</span>
                      <span className="font-mono">${generatedReport.meta.totalLiabilities.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="ml-4">
                    <h5 className="font-semibold mb-1">Equity</h5>
                    {generatedReport.rows.find(s => s.section === 'Equity')?.items.map((item, i) => (
                      <div key={i} className="flex justify-between py-1">
                        <span>{item.name}</span>
                        <span className="font-mono">${item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 font-bold border-t mt-2">
                      <span>Total Equity</span>
                      <span className="font-mono">${generatedReport.meta.totalEquity.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between py-3 font-bold text-lg border-t mt-4">
                    <span>Total Liabilities and Equity</span>
                    <span className="font-mono">${(generatedReport.meta.totalLiabilities + generatedReport.meta.totalEquity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {generatedReport.title === 'Retained Earnings Statement' && (
              <div className="p-4">
                {generatedReport.rows.map((row, i) => (
                  <div key={i} className={`flex justify-between py-2 ${row.isTotal ? 'font-bold text-lg border-t pt-2 mt-2' : ''}`}>
                    <span>{row.label}</span>
                    <span className="font-mono">${row.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email Modal */}
      <Modal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} title="Send Report by Email">
        <div className="space-y-4">
          <p>Report: <strong>{generatedReport?.title}</strong></p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input 
              type="email" 
              placeholder="manager@company.com" 
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
            <textarea 
              className="w-full px-3 py-2 border rounded-lg" 
              rows="3"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button 
              onClick={() => setEmailModalOpen(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                alert('Email sent! (Integration pending)');
                setEmailModalOpen(false);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Send Email
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FinancialReportsPage;