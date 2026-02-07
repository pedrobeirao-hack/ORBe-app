
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, Category, Goal } from '../types';
import { Lightbulb, Zap, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TrendsChartProps {
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
}

const TrendsChart: React.FC<TrendsChartProps> = ({ transactions, categories, goals }) => {
  const data = React.useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    
    const monthlyData: Record<string, { month: string, income: number, expense: number }> = {};
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = months[d.getMonth()];
      monthlyData[m] = { month: m, income: 0, expense: 0 };
    }

    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getFullYear() === currentYear) {
        const m = months[d.getMonth()];
        if (monthlyData[m]) {
          if (t.type === 'income') monthlyData[m].income += t.amount;
          else monthlyData[m].expense += t.amount;
        }
      }
    });

    return Object.values(monthlyData);
  }, [transactions]);

  const insights = React.useMemo(() => {
    const tips: Array<{ icon: any, color: string, title: string, description: string }> = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const income = thisMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = thisMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    // 1. Savings Rate Tip
    if (savingsRate > 20) {
      tips.push({
        icon: TrendingUp,
        color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
        title: 'Excelente Poupança!',
        description: `Estão a poupar ${Math.round(savingsRate)}% do rendimento. Isso é ${Math.round(savings)}€ este mês!`
      });
    } else if (savingsRate > 0) {
      tips.push({
        icon: Zap,
        color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
        title: 'Oportunidade de Poupança',
        description: 'Tentar atingir os 20% de poupança mensal aceleraria as vossas metas em meses.'
      });
    }

    // 2. Budget Tips
    categories.forEach(cat => {
      if (cat.budget) {
        const spent = thisMonthTransactions.filter(t => t.category === cat.name && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        if (spent > cat.budget) {
          tips.push({
            icon: AlertCircle,
            color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30',
            title: `Atenção: ${cat.name}`,
            description: `Excederam o orçamento de ${cat.name} por ${Math.round(spent - cat.budget)}€. Tentar compensar noutra categoria.`
          });
        } else if (spent > cat.budget * 0.8) {
          tips.push({
            icon: Lightbulb,
            color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
            title: `Limite Próximo: ${cat.name}`,
            description: `Estão a 80% do teto definido para ${cat.name}. Faltam apenas ${Math.round(cat.budget - spent)}€.`
          });
        }
      }
    });

    // 3. Goal Tips
    goals.forEach(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      if (progress > 90) {
        tips.push({
          icon: CheckCircle2,
          color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
          title: `Meta Quase Lá: ${goal.name}`,
          description: `Faltam apenas ${Math.round(goal.targetAmount - goal.currentAmount)}€! Um pequeno esforço extra resolve esta meta.`
        });
      }
    });

    // Top categories
    const categoryTotals = categories.map(cat => ({
      name: cat.name,
      total: thisMonthTransactions.filter(t => t.category === cat.name && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
    })).sort((a, b) => b.total - a.total);

    if (categoryTotals.length > 0 && categoryTotals[0].total > 0) {
      tips.push({
        icon: Lightbulb,
        color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
        title: 'Análise de Top Gastos',
        description: `${categoryTotals[0].name} é a vossa maior despesa (${Math.round(categoryTotals[0].total)}€). É uma área onde podem otimizar?`
      });
    }

    return tips.slice(0, 3); // Max 3 tips
  }, [transactions, categories, goals]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { month, income, expense } = payload[0].payload;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl px-5 py-4 rounded-[1.8rem] shadow-2xl border border-white/10 animate-in zoom-in duration-200">
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 border-b border-white/5 pb-2">
            Relatório de {month}
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-8">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Entradas</span>
              <span className="text-sm font-black text-emerald-400">
                {income.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Saídas</span>
              <span className="text-sm font-black text-rose-400">
                {expense.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5">
             <div className="flex items-center justify-between gap-8">
              <span className="text-[9px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest">Saldo</span>
              <span className={`text-xs font-black ${income - expense >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {(income - expense).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="h-80 w-full bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-700 shadow-sm animate-in fade-in zoom-in duration-500 group">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip 
              cursor={{ fill: 'rgba(241, 245, 249, 0.4)', radius: 12 }}
              content={<CustomTooltip />}
              allowEscapeViewBox={{ x: false, y: true }}
            />
            <Bar 
              dataKey="income" 
              fill="#10b981" 
              radius={[6, 6, 0, 0]} 
              barSize={10} 
              animationDuration={1500}
              animationBegin={0}
            />
            <Bar 
              dataKey="expense" 
              fill="#f43f5e" 
              radius={[6, 6, 0, 0]} 
              barSize={10} 
              animationDuration={1500}
              animationBegin={200}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 px-2 flex items-center gap-2">
          <Lightbulb size={12} className="text-emerald-500" /> Dicas do ORBe
        </h3>
        <div className="space-y-3">
          {insights.length > 0 ? insights.map((insight, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-4 animate-in slide-in-from-right" style={{ animationDelay: `${idx * 150}ms` }}>
              <div className={`p-3 rounded-2xl ${insight.color}`}>
                <insight.icon size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">{insight.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{insight.description}</p>
              </div>
            </div>
          )) : (
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700 text-center">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sem dicas para este período</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendsChart;
