// src/utils/accountUtils.js (or wherever you keep utilities)

export const computeAccountBalances = (accounts, journalEntries) => {
  const balances = {};
  accounts.forEach(acc => {
    balances[acc.id] = acc.balance || 0; // support initial balance
  });

  journalEntries.forEach(entry => {
    if (entry.status !== 'Approved') return; // only approved entries affect balance
    entry.debits?.forEach(d => {
      if (d.accountId && d.amount != null) {
        balances[d.accountId] = (balances[d.accountId] || 0) + d.amount;
      }
    });
    entry.credits?.forEach(c => {
      if (c.accountId && c.amount != null) {
        balances[c.accountId] = (balances[c.accountId] || 0) - c.amount;
      }
    });
  });

  return balances;
}