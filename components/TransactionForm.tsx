
import React, { useState } from 'react';
import { X, User, Orbit } from 'lucide-react';
import { Transaction, TransactionType, Category } from '../types';

interface TransactionFormProps {
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
  categories: Category[];
  coupleNames: string[];
  initialData?: Transaction;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSave, onClose, categories, coupleNames, initialData }) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || (categories.length > 0 ? categories[0].name : ''));
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [createdBy, setCreatedBy] = useState(initialData?.createdBy || coupleNames[0]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    onSave({
      amount: parseFloat(amount),
      description,
      category,
      date,
      type,
      createdBy
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 ease-out border border-slate-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-0.5">Gestão de Casal</p>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {initialData ? 'Editar Entrada' : 'Nova Entrada'}
            </h2>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Quem pagou? Seletor de Casal */}
        <div className="mb-6">
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1">Quem pagou?</label>
          <div className="flex gap-3">
            {coupleNames.map(name => (
              <button
                key={name}
                type="button"
                onClick={() => setCreatedBy(name)}
                className={`flex-1 py-4 px-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${
                  createdBy === name 
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-emerald-950/20' 
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                }`}
              >
                <User size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">{name}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex p-1 bg-slate-100/50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}>Despesa</button>
            <button type="button" onClick={() => setType('income')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${type === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}>Receita</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Valor (€)</label>
              <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] px-6 py-4 text-xl font-extrabold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Data</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Descrição</label>
            <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" placeholder="Ex: Renda Casa" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1">Categoria</label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button key={cat.id} type="button" onClick={() => setCategory(cat.name)} className={`flex flex-col items-center justify-center p-3 rounded-[1.5rem] transition-all border-2 ${category === cat.name ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-100/60 dark:border-slate-700/60'}`}>
                  <div className="text-emerald-600 mb-1.5">
                    {cat.icon ? <span className="text-xl leading-none">{cat.icon}</span> : <Orbit size={20} strokeWidth={2.5} />}
                  </div>
                  <span className={`text-[8px] font-bold uppercase tracking-tight text-center leading-none ${category === cat.name ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-emerald-500 text-white font-black py-5 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] hover:bg-emerald-600 transition-all active:scale-95 uppercase tracking-[0.2em] text-[11px]">Confirmar Entrada</button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
