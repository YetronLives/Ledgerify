
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
      const beginningRetained = 0; // Simplified for scope
      const netIncomeForPeriod = reportData.meta?.netIncome || 
        (revenue.reduce((s,a)=>s+a.balance,0) - expenses.reduce((s,a)=>s+a.balance,0));
      const dividends = 0; 
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
    const { totalAssets, totalLiabilities } = balanceSheet.meta;
    const derivedEquity = totalAssets - totalLiabilities;
    const approvedEntries = getApprovedEntriesThroughDate(journalEntries, asOfDate);

    const getSumBySubcategory = (category, subString) => {
        return accounts
            .filter(acc => 
                acc.category === category && 
                acc.subcategory && 
                acc.subcategory.toLowerCase().includes(subString.toLowerCase())
            )
            .reduce((sum, acc) => sum + computeAccountBalanceAsOf(acc, approvedEntries), 0);
    };

    const getSumByName = (keywords) => {
      const matchingAccounts = accounts.filter(acc => 
        keywords.some(k => acc.name.toLowerCase().includes(k.toLowerCase()))
      );
      return matchingAccounts.reduce((sum, acc) => {
        return sum + computeAccountBalanceAsOf(acc, approvedEntries);
      }, 0);
    };

    // --- Data Gathering ---
    
    // Current Assets
    let currentAssets = getSumBySubcategory('Assets', 'current');
    if (currentAssets === 0) {
        currentAssets = getSumByName(['Cash', 'Bank', 'Receivable', 'Inventory', 'Stock', 'Prepaid']);
    }

    // Current Liabilities
    let currentLiabilities = getSumBySubcategory('Liabilities', 'current');
    if (currentLiabilities === 0) {
        currentLiabilities = getSumByName(['Payable', 'Card', 'Short', 'Accrued', 'Tax', 'Due', 'Current']);
    }

    // Quick Assets: Cash + Bank + Receivables (Exclude Inventory/Prepaid)
    let quickAssets = getSumBySubcategory('Assets', 'Cash') + 
                      getSumBySubcategory('Assets', 'Receivable');

    // If that returns 0, fallback to searching by Name with more keywords
    if (quickAssets === 0) {
        quickAssets = getSumByName(['Cash', 'Bank', 'Receivable', 'Checking', 'Savings', 'Deposit']);
    }

    // --- Calculations ---
    const safeDivide = (num, den) => (den !== 0 ? num / den : null);

    const currentRatio = safeDivide(currentAssets, currentLiabilities);
    const quickRatio = safeDivide(quickAssets, currentLiabilities);
    const debtToEquity = safeDivide(totalLiabilities, derivedEquity);
    const netProfitMargin = safeDivide(netIncome, totalRevenue);
    const returnOnAssets = safeDivide(netIncome, totalAssets);

    // --- Status Logic ---
    const getStatus = (name, value) => {
      if (value == null || isNaN(value)) return 'gray';
      
      switch (name) {
        case 'currentRatio':
          // Good: > 1.5 | Warning: 1.0 - 1.5 | Bad: < 1.0
          if (value >= 1.5) return 'green';
          if (value >= 1.0) return 'yellow';
          return 'red';
          
        case 'quickRatio':
          // Good: > 1.0 | Warning: 0.8 - 1.0 | Bad: < 0.8
          if (value >= 1.0) return 'green';
          if (value >= 0.8) return 'yellow';
          return 'red';
          
        case 'debtToEquity':
          // Good: < 1.0 | Warning: 1.0 - 2.0 | Bad: > 2.0
          if (value <= 1.0) return 'green';
          if (value <= 2.0) return 'yellow';
          return 'red';
          
        case 'netProfitMargin':
          // Good: > 10% | Warning: 5% - 10% | Bad: < 5%
          if (value >= 0.10) return 'green';
          if (value >= 0.05) return 'yellow';
          return 'red';
          
        case 'returnOnAssets':
          // Good: > 5% | Warning: 1% - 5% | Bad: < 1%
          if (value >= 0.05) return 'green';
          if (value >= 0.01) return 'yellow';
          return 'red';
          
        default:
          return 'gray';
      }
    };

    const ratios = [];
    
    ratios.push({ 
      name: 'Current Ratio', 
      value: currentRatio, 
      status: getStatus('currentRatio', currentRatio),
      isPercentage: false 
    });
    
    ratios.push({ 
      name: 'Quick Ratio', 
      value: quickRatio, 
      status: getStatus('quickRatio', quickRatio),
      isPercentage: false 
    });
    
    ratios.push({ 
      name: 'Debt-to-Equity', 
      value: debtToEquity, 
      status: getStatus('debtToEquity', debtToEquity),
      isPercentage: false 
    });
    
    ratios.push({ 
      name: 'Net Profit Margin', 
      value: netProfitMargin, 
      status: getStatus('netProfitMargin', netProfitMargin),
      isPercentage: true 
    });
    
    ratios.push({ 
      name: 'Return on Assets', 
      value: returnOnAssets, 
      status: getStatus('returnOnAssets', returnOnAssets),
      isPercentage: true 
    });

    return ratios;
  } catch (err) {
    console.error('Ratio calculation error:', err);
    return [];
  }
};