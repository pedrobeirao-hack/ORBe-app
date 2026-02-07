
import { Category, Transaction, Goal } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Alimentação', icon: '🍕', color: 'bg-orange-100 text-orange-600', hex: '#ea580c', budget: 400 },
  { id: '2', name: 'Transporte', icon: '🚗', color: 'bg-blue-100 text-blue-600', hex: '#2563eb', budget: 100 },
  { id: '3', name: 'Moradia', icon: '🏠', color: 'bg-purple-100 text-purple-600', hex: '#9333ea', budget: 800 },
  { id: '4', name: 'Lazer', icon: '🎉', color: 'bg-pink-100 text-pink-600', hex: '#db2777', budget: 150 },
  { id: '5', name: 'Saúde', icon: '💊', color: 'bg-red-100 text-red-600', hex: '#dc2626', budget: 50 },
  { id: '6', name: 'Educação', icon: '📚', color: 'bg-indigo-100 text-indigo-600', hex: '#4f46e5' },
  { id: '7', name: 'Compras', icon: '🛍️', color: 'bg-emerald-100 text-emerald-600', hex: '#059669', budget: 200 },
  { id: '8', name: 'Salário', icon: '💰', color: 'bg-green-100 text-green-600', hex: '#16a34a' },
  { id: '9', name: 'Outros', icon: '✨', color: 'bg-slate-100 text-slate-600', hex: '#475569' },
];

export const INITIAL_GOALS: Goal[] = [
  { id: 'g1', name: 'Reserva de Emergência', targetAmount: 5000, currentAmount: 1250, icon: '🛡️', color: 'bg-emerald-500' },
  { id: 'g2', name: 'Viagem Japão', targetAmount: 3000, currentAmount: 450, icon: '🗾', color: 'bg-blue-500' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    amount: 2100,
    description: 'Salário Mensal',
    category: 'Salário',
    date: new Date().toISOString().split('T')[0],
    type: 'income',
  },
  {
    id: '2',
    amount: 45.50,
    description: 'Supermercado Continente',
    category: 'Alimentação',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
  },
  {
    id: '3',
    amount: 12.80,
    description: 'Uber para o Trabalho',
    category: 'Transporte',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
  },
];
