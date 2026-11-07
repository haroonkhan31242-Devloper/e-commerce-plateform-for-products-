// Every amount in the store is whole Pakistani rupees
export const formatMoney = (amount: number): string =>
  `Rs ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
