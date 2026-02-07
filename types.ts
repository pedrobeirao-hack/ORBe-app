
export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  hex: string;
  budget?: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: TransactionType;
  createdBy?: string; // Nome do membro do casal
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
}
