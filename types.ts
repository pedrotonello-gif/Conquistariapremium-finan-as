export type TransactionType = 'entrada' | 'saida';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO YYYY-MM-DD
  createdAt: number;
}

export type CategoryOption = {
  name: string;
  iconName: string;
  color: string;
  type: TransactionType | 'both';
};

export interface MonthPeriod {
  year: number;
  month: number; // 0-11
  key: string; // "YYYY-MM"
  label: string; // "Outubro de 2026"
}

export interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number; // percentage
  incomeCount: number;
  expenseCount: number;
}
