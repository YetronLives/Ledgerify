
export const computeAccountBalances = (accounts, journalEntries) => {
  const balances = {};
  const debits = {};
  const credits = {};
  
  const accountMap = new Map();
  accounts.forEach(acc => {
    balances[acc.id] = acc.initialBalance || 0;
    debits[acc.id] = 0;
    credits[acc.id] = 0;
    accountMap.set(acc.id, acc);
  });

  journalEntries.forEach(entry => {
    if (entry.status !== 'Approved') return; 
    
    entry.debits?.forEach(d => {
      if (d.accountId && d.amount != null) {
        const acc = accountMap.get(d.accountId);
        if (acc) {
          const amount = parseFloat(d.amount) || 0;
          debits[d.accountId] = (debits[d.accountId] || 0) + amount;
          balances[d.accountId] += (acc.normalSide === 'Debit' ? amount : -amount);
        }
      }
    });
    
    entry.credits?.forEach(c => {
      if (c.accountId && c.amount != null) {
        const acc = accountMap.get(c.accountId);
        if (acc) {
          const amount = parseFloat(c.amount) || 0;
          credits[c.accountId] = (credits[c.accountId] || 0) + amount;
          balances[c.accountId] += (acc.normalSide === 'Credit' ? amount : -amount);
        }
      }
    });
  });

  return { balances, debits, credits };
}