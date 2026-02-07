
import React, { useMemo, useRef, useState } from 'react';
import { Transaction, Category, Goal } from '../types';
import { ChevronRight, Users, Download, Calendar, Edit3, Settings2, Orbit } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  coupleNames: string[];
  onManageGoals: () => void;
  onManageBudgets: () => void;
  onEditTransaction: (transaction: Transaction) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, categories, goals, coupleNames, onManageGoals, onManageBudgets, onEditTransaction }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const goalScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    if (!goalScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = goalScrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
      return;
    }
    setScrollProgress((scrollLeft / maxScroll) * 100);
  };

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentMonth, currentYear]);

  const totalIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const coupleStats = useMemo(() => {
    const stats: Record<string, number> = {};
    coupleNames.forEach(name => stats[name] = 0);
    monthlyTransactions.filter(t => t.type === 'expense').forEach(t => {
      const creator = t.createdBy || coupleNames[0];
      if (stats[creator] !== undefined) stats[creator] += t.amount;
    });
    return stats;
  }, [monthlyTransactions, coupleNames]);

  const categorySpending = useMemo(() => {
    return categories.map(cat => {
      const value = monthlyTransactions.filter(t => t.category === cat.name && t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
      return { ...cat, value };
    }).sort((a, b) => b.value - a.value);
  }, [monthlyTransactions, categories]);

  const activeBudgets = useMemo(() => {
    return categorySpending.filter(cat => cat.budget && cat.budget > 0);
  }, [categorySpending]);

  const recentTransactions = useMemo(() => {
    return monthlyTransactions.slice(0, 5);
  }, [monthlyTransactions]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!goalScrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - goalScrollRef.current.offsetLeft);
    setScrollLeft(goalScrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !goalScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - goalScrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    goalScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleExportCSV = () => {
    const headers = ['Data', 'Descricao', 'Categoria', 'Tipo', 'Valor', 'Pago Por'];
    const rows = monthlyTransactions.map(t => [
      t.date,
      t.description,
      t.category,
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.amount.toString().replace('.', ','),
      t.createdBy || coupleNames[0]
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(r => r.join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const monthName = new Intl.DateTimeFormat('pt-PT', { month: 'long' }).format(new Date());
    link.setAttribute('href', url);
    link.setAttribute('download', `ORBe_Transacoes_${monthName}_${currentYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' }).format(d);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      <div className="px-2 flex justify-between items-center -mt-4 mb-1">
        <div className="relative inline-block">
          <h1 
            className="text-4xl font-black text-slate-900 dark:text-white tracking-tight cursor-help transition-all duration-300 hover:scale-110 inline-block drop-shadow-[0_0_15px_rgba(16,185,129,0.6)] dark:drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
            data-tooltip="Orçamento Refrigério do Beirão"
          >
            ORBe
          </h1>
        </div>
        <button 
          onClick={handleExportCSV}
          data-tooltip="Exportar transações do mês para CSV"
          className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-emerald-600 hover:scale-110 active:scale-95 transition-all outline-none"
        >
          <Download size={16} />
        </button>
      </div>

      {/* Saldo de Casal Card */}
      <div 
        data-tooltip={`Entradas: ${totalIncome.toLocaleString()}€ | Saídas: ${totalExpense.toLocaleString()}€`}
        className="bg-white dark:bg-slate-800 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group cursor-help"
      >
        <div className="flex justify-between items-start mb-0.5">
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Saldo Partilhado</p>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
        <h2 className={`text-3xl font-black tracking-tighter mb-4 ${balance >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
          {balance.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
        </h2>
        
        <div className="space-y-2.5 pt-2.5 border-t border-slate-50 dark:border-slate-700/50">
          <div className="flex justify-between items-center mb-0">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Users size={10} /> Divisão de Gastos
            </span>
          </div>
          <div 
            className="flex h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden cursor-help"
            data-tooltip={`${coupleNames[0]}: ${Math.round((coupleStats[coupleNames[0]] / (totalExpense || 1)) * 100)}% | ${coupleNames[1]}: ${Math.round((coupleStats[coupleNames[1]] / (totalExpense || 1)) * 100)}%`}
          >
            <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${(coupleStats[coupleNames[0]] / (totalExpense || 1)) * 100}%` }}></div>
            <div className="bg-blue-400 h-full transition-all duration-1000" style={{ width: `${(coupleStats[coupleNames[1]] / (totalExpense || 1)) * 100}%` }}></div>
          </div>
          <div className="flex justify-between text-[9px] font-black uppercase tracking-tight">
            <span className="text-emerald-600">{coupleNames[0]}: {coupleStats[coupleNames[0]].toLocaleString()}€</span>
            <span className="text-blue-500">{coupleNames[1]}: {coupleStats[coupleNames[1]].toLocaleString()}€</span>
          </div>
        </div>
      </div>

      {/* Slider de Metas */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Metas</h3>
          <button 
            onClick={onManageGoals} 
            data-tooltip="Gerir objetivos de poupança" 
            className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 transition-transform active:scale-95 outline-none"
          >
            Gerir <ChevronRight size={12} />
          </button>
        </div>
        
        <div className="relative group">
          <div 
            ref={goalScrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={() => setIsDragging(false)}
            onMouseUp={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            onScroll={handleScroll}
            className={`flex gap-3.5 overflow-x-auto no-scrollbar px-1 py-1 snap-x ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            {goals.map(goal => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div 
                  key={goal.id} 
                  data-tooltip={`Faltam ${(goal.targetAmount - goal.currentAmount).toLocaleString()}€`}
                  className="min-w-[210px] bg-white dark:bg-slate-800 p-4.5 rounded-[1.8rem] shadow-sm border border-slate-100 dark:border-slate-700 flex-shrink-0 snap-center select-none transition-transform hover:scale-[1.02] cursor-help"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-emerald-600">
                      {goal.icon ? <span className="text-xl">{goal.icon}</span> : <Orbit size={24} strokeWidth={2.5} />}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">{goal.name}</p>
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">{Math.round(progress)}% Concluído</p>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden mb-2.5">
                    <div className={`h-full ${goal.color} transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase">Progresso</span>
                    <p className="text-[11px] font-black text-slate-900 dark:text-white">
                      {goal.currentAmount.toLocaleString()}€ <span className="text-slate-300 dark:text-slate-600">/ {goal.targetAmount.toLocaleString()}€</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {goals.length > 1 && (
            <div className="mt-6 px-28">
              <div 
                className="h-[2px] w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden relative cursor-help"
                data-tooltip="Deslize para ver mais metas"
              >
                <div className="absolute top-0 bottom-0 bg-emerald-500 rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: '25%', left: `${(scrollProgress * 0.75)}%` }}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Orçamentos Mensais */}
      <div className="space-y-5">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Orçamento Mensal por Categoria</h3>
          <button 
            onClick={onManageBudgets} 
            data-tooltip="Ajustar orçamentos mensais" 
            className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 transition-transform active:scale-95 outline-none"
          >
            Gerir <ChevronRight size={12} />
          </button>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-7 shadow-sm border border-slate-100 dark:border-slate-700 space-y-5">
          {activeBudgets.length > 0 ? activeBudgets.map(cat => {
            const spent = cat.value;
            const budget = cat.budget || 0;
            const percentage = Math.min((spent / budget) * 100, 100);
            return (
              <div 
                key={cat.id} 
                className="space-y-2 cursor-help"
                data-tooltip={`Restam ${(budget - spent).toLocaleString()}€ em ${cat.name}`}
              >
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <div className="text-emerald-600">
                      {cat.icon ? <span className="text-lg">{cat.icon}</span> : <Orbit size={18} strokeWidth={2.5} />}
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{cat.name}</span>
                  </div>
                  <p className="text-xs font-black text-slate-900 dark:text-white">{spent.toLocaleString()}€ / {budget.toLocaleString()}€</p>
                </div>
                <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${spent > budget ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-4">
              <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Nenhum orçamento definido</p>
            </div>
          )}
        </div>
      </div>

      {/* Atividade Recente */}
      <div className="space-y-5">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 px-2">Transações Recentes</h3>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => {
            const cat = categories.find(c => c.name === transaction.category) || { icon: '', color: 'bg-emerald-50 text-emerald-600', name: 'Outros' };
            return (
              <div 
                key={transaction.id} 
                onClick={() => onEditTransaction(transaction)} 
                data-tooltip="Clique para editar transação"
                className="bg-white dark:bg-slate-800 p-4.5 rounded-[1.8rem] shadow-sm border border-slate-50 dark:border-slate-700 flex items-center justify-between group transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`${cat.color} w-11 h-11 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm transition-transform group-hover:scale-110`}>
                    {cat.icon ? <span className="text-xl">{cat.icon}</span> : <Orbit size={20} strokeWidth={2.5} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">{transaction.description}</p>
                      <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase flex items-center gap-1">
                        <Calendar size={8} /> {formatDate(transaction.date)}
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-600/60 font-black uppercase tracking-tighter">{cat.name} • {transaction.createdBy || coupleNames[0]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-sm font-black ${transaction.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                    {transaction.type === 'income' ? '+' : ''}{transaction.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                  </p>
                  <Edit3 size={12} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
