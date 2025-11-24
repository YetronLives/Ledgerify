/**
 * Utility functions to generate financial reports for Ledgerify (Sprint 4)
 * All reports are based ONLY on APPROVED journal entries.
 */

/**
 * Filters journal entries that are Approved and occurred on or before a given date.
 */
const getApprovedEntriesThroughDate = (journalEntries, date) => {
  const cutoff = new Date(date);
  return journalEntries.filter(je =>
    je.status === 'Approved' && new Date(je.date) <= cutoff
  );
};

/**
 * Computes the balance of a single account as of a given date,
 * using only approved journal entries through that date.
 */
export const computeAccountBalanceAsOf = (account, approvedEntriesThroughDate) => {
  let balance = account.initialBalance || 0;

  for (const entry of approvedEntriesThroughDate) {
    const debit = entry.debits?.find(d => d.accountId == account.id);
    const credit = entry.credits?.find(c => c.accountId == account.id);

    if (debit) {
      const amount = parseFloat(debit.amount) || 0;
      balance += (account.normalSide === 'Debit' ? amount : -amount);
    }
    if (credit) {
      const amount = parseFloat(credit.amount) || 0;
      balance += (account.normalSide === 'Credit' ? amount : -amount);
    }
  }

  return balance;
};

/**
 * Generates a financial report based on type, accounts, journal entries, and date(s).
 * 
 * Supported report types:
 * - 'Trial Balance'
 * - 'Income Statement'
 * - 'Balance Sheet'
 * - 'Retained Earnings Statement'
 */
export const generateFinancialReport = (reportType, accounts, journalEntries, date, dateRange = null) => {
  // Determine the report date(s)
  let reportDate, reportEndDate;
  if (reportType === 'Balance Sheet') {
    if (!date) throw new Error('Balance Sheet requires a date');
    reportDate = new Date(date);
  } else {
    // For period-based reports (Income Stmt, Trial Balance, Retained Earnings)
    if (dateRange?.start && dateRange?.end) {
      reportDate = new Date(dateRange.start);
      reportEndDate = new Date(dateRange.end);
    } else if (date) {
      // If only one date is given, treat as "through this date"
      reportDate = new Date('1970-01-01');
      reportEndDate = new Date(date);
    } else {
      throw new Error(`${reportType} requires a date range or end date`);
    }
  }

  // Get relevant journal entries (approved only, up to cutoff)
  const cutoffDate = reportEndDate || reportDate;
  const approvedEntries = getApprovedEntriesThroughDate(journalEntries, cutoffDate);

  // Compute all account balances as of cutoff
  const accountBalances = {};
  const enrichedAccounts = accounts.map(acc => {
    const balance = computeAccountBalanceAsOf(acc, approvedEntries);
    accountBalances[acc.id] = balance;
    return { ...acc, balance };
  });

  // Helper: safe balance lookup
  const getBalance = (id) => accountBalances[id] || 0;

  // Classify accounts
  const assets = enrichedAccounts.filter(a => a.category === 'Assets');
  const liabilities = enrichedAccounts.filter(a => a.category === 'Liabilities');
  const equity = enrichedAccounts.filter(a => a.category === 'Equity');
  const revenue = enrichedAccounts.filter(a => a.category === 'Revenue');
  const expenses = enrichedAccounts.filter(a => a.category === 'Expenses');

  let reportData = { title: '', date: cutoffDate, rows: [], meta: {} };

  switch (reportType) {
    case 'Trial Balance':
      reportData.title = 'Trial Balance';
      reportData.rows = enrichedAccounts
        .sort((a, b) => a.number - b.number)
        .map(acc => {
          const balance = acc.balance;
          return {
            accountNumber: acc.number,
            accountName: acc.name,
            debit: (acc.normalSide === 'Debit' && balance > 0) || (acc.normalSide === 'Credit' && balance < 0) 
              ? Math.abs(balance) 
              : 0,
            credit: (acc.normalSide === 'Credit' && balance > 0) || (acc.normalSide === 'Debit' && balance < 0) 
              ? Math.abs(balance) 
              : 0,
          };
        });
      const totalDebit = reportData.rows.reduce((sum, r) => sum + r.debit, 0);
      const totalCredit = reportData.rows.reduce((sum, r) => sum + r.credit, 0);
      reportData.meta = { totalDebit, totalCredit };
      break;

    case 'Income Statement':
      reportData.title = 'Income Statement';
      const totalRevenue = revenue.reduce((sum, a) => sum + a.balance, 0);
      const totalExpenses = expenses.reduce((sum, a) => sum + a.balance, 0);
      const netIncome = totalRevenue - totalExpenses;

      reportData.rows = [
        { type: 'header', label: 'Revenue', amount: null },
        ...revenue.map(a => ({ type: 'detail', label: a.name, amount: a.balance })),
        { type: 'total', label: 'Total Revenue', amount: totalRevenue },
        { type: 'spacer' },
        { type: 'header', label: 'Expenses', amount: null },
        ...expenses.map(a => ({ type: 'detail', label: a.name, amount: a.balance })),
        { type: 'total', label: 'Total Expenses', amount: totalExpenses },
        { type: 'spacer' },
        { type: 'net', label: 'Net Income', amount: netIncome },
      ];
      reportData.meta = { netIncome, totalRevenue, totalExpenses };
      break;

    case 'Balance Sheet':
      reportData.title = 'Balance Sheet';
      const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
      const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
      const totalEquity = equity.reduce((sum, a) => sum + a.balance, 0);

      reportData.rows = [
        { section: 'Assets', items: assets.map(a => ({ name: a.name, amount: a.balance })) },
        { section: 'Liabilities', items: liabilities.map(a => ({ name: a.name, amount: a.balance })) },
        { section: 'Equity', items: equity.map(a => ({ name: a.name, amount: a.balance })) },
      ];
      reportData.meta = { 
        totalAssets, 
        totalLiabilities, 
        totalEquity,
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 
      };
      break;

    case 'Retained Earnings Statement':
      reportData.title = 'Statement of Retained Earnings';
      // For this sprint, assume beginning retained earnings = 0
      const beginningRetained = 0;
      const netIncomeForPeriod = reportData.meta?.netIncome || 
        (revenue.reduce((s,a)=>s+a.balance,0) - expenses.reduce((s,a)=>s+a.balance,0));
      const dividends = 0; // Not implemented in scope
      const endingRetained = beginningRetained + netIncomeForPeriod - dividends;

      reportData.rows = [
        { label: 'Retained Earnings, Beginning', amount: beginningRetained },
        { label: 'Add: Net Income', amount: netIncomeForPeriod },
        { label: 'Less: Dividends', amount: -dividends },
        { label: 'Retained Earnings, Ending', amount: endingRetained, isTotal: true },
      ];
      reportData.meta = { endingRetained, netIncome: netIncomeForPeriod };
      break;

    default:
      throw new Error(`Unsupported report type: ${reportType}`);
  }

  return reportData;
};

/**
 * Calculates key financial ratios as of a given date using only approved journal entries.
 */
export const calculateFinancialRatios = (accounts, journalEntries, asOfDate) => {
  if (!asOfDate) return [];

  try {
    const incomeStmt = generateFinancialReport('Income Statement', accounts, journalEntries, asOfDate);
    const balanceSheet = generateFinancialReport('Balance Sheet', accounts, journalEntries, asOfDate);

    const { netIncome, totalRevenue } = incomeStmt.meta;
    const { totalAssets, totalLiabilities, totalEquity } = balanceSheet.meta;

    // Helper to find balance by account name (case-insensitive)
    const findBalanceByName = (name) => {
      const account = accounts.find(acc => 
        acc.name.toLowerCase().includes(name.toLowerCase())
      );
      if (!account) return 0;
      return computeAccountBalanceAsOf(
        account, 
        getApprovedEntriesThroughDate(journalEntries, asOfDate)
      );
    };

    // Estimate current assets/liabilities using common account names
    const cash = findBalanceByName('Cash') || 0;
    const receivables = findBalanceByName('Receivable') || 0;
    const inventory = findBalanceByName('Inventory') || 0;
    const payables = findBalanceByName('Payable') || 0;
    const shortTermDebt = findBalanceByName('Short') || findBalanceByName('Current Liabilities') || 0;

    const currentAssets = cash + receivables + inventory;
    const currentLiabilities = payables + shortTermDebt;

    // Calculate ratios (avoid division by zero)
    const safeDivide = (num, den) => (den !== 0 ? num / den : null);

    const currentRatio = safeDivide(currentAssets, currentLiabilities);
    const quickRatio = safeDivide(cash + receivables, currentLiabilities);
    const debtToEquity = safeDivide(totalLiabilities, totalEquity);
    const netProfitMargin = safeDivide(netIncome, totalRevenue);
    const returnOnAssets = safeDivide(netIncome, totalAssets);

    // Status logic
    const getStatus = (name, value) => {
      if (value == null || isNaN(value)) return 'gray';
      const ranges = {
        currentRatio: { g: [1.5, 3.0], y: [1.0, 3.5] },
        quickRatio: { g: [1.0, 2.0], y: [0.8, 2.5] },
        debtToEquity: { g: [0, 1.0], y: [1.0, 2.0] },
        netProfitMargin: { g: [0.1, 1.0], y: [0.05, 0.1] },
        returnOnAssets: { g: [0.05, 1.0], y: [0.02, 0.05] },
      };
      const r = ranges[name];
      if (!r) return 'gray';
      if (value >= r.g[0] && value <= r.g[1]) return 'green';
      if (value >= r.y[0] && value <= r.y[1]) return 'yellow';
      return 'red';
    };

    const ratios = [];
    if (currentRatio !== null) ratios.push({ name: 'Current Ratio', value: currentRatio, status: getStatus('currentRatio', currentRatio) });
    if (quickRatio !== null) ratios.push({ name: 'Quick Ratio', value: quickRatio, status: getStatus('quickRatio', quickRatio) });
    if (debtToEquity !== null) ratios.push({ name: 'Debt-to-Equity', value: debtToEquity, status: getStatus('debtToEquity', debtToEquity) });
    if (netProfitMargin !== null) ratios.push({ name: 'Net Profit Margin', value: netProfitMargin, status: getStatus('netProfitMargin', netProfitMargin) });
    if (returnOnAssets !== null) ratios.push({ name: 'Return on Assets', value: returnOnAssets, status: getStatus('returnOnAssets', returnOnAssets) });

    return ratios;
  } catch (err) {
    console.error('Ratio calculation error:', err);
    return [];
  }
};