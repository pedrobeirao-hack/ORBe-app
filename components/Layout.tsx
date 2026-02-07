
import React from 'react';
import { Home, List, PieChart, Settings, Plus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onAddClick }) => {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 dark:bg-slate-900 relative overflow-hidden shadow-2xl transition-colors duration-300">
      {/* Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-4 px-6">
        {children}
      </main>

      {/* Floating Action Button - Upgrade para um design mais circular e "premium" */}
      <button
        onClick={onAddClick}
        data-tooltip="Registar nova entrada"
        className="fixed bottom-28 right-6 bg-emerald-600 text-white p-4.5 rounded-full shadow-[0_15px_40px_-8px_rgba(16,185,129,0.5)] hover:bg-emerald-500 hover:scale-110 active:scale-90 z-20 border-4 border-white dark:border-slate-800 flex items-center justify-center group transition-all duration-500 ease-out"
      >
        <Plus size={24} strokeWidth={3} className="group-hover:rotate-180 transition-transform duration-700" />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border-t border-slate-100 dark:border-slate-700 px-2 py-5 flex justify-around items-center z-10 rounded-t-[2.5rem] shadow-[0_-15px_30px_-10px_rgba(0,0,0,0.05)] transition-colors">
        <NavButton 
          icon={<Home />} 
          label="Início" 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
          tooltip="Visão geral do cofre"
        />
        <NavButton 
          icon={<List />} 
          label="Lista" 
          active={activeTab === 'list'} 
          onClick={() => setActiveTab('list')} 
          tooltip="Histórico detalhado"
        />
        <NavButton 
          icon={<PieChart />} 
          label="Análise" 
          active={activeTab === 'charts'} 
          onClick={() => setActiveTab('charts')} 
          tooltip="Gráficos e tendências"
        />
        <NavButton 
          icon={<Settings />} 
          label="Ajustes" 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')} 
          tooltip="Definições e cofre"
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  icon: React.ReactElement<any>;
  label: string;
  active: boolean;
  onClick: () => void;
  tooltip: string;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick, tooltip }) => (
  <button
    onClick={onClick}
    data-tooltip={tooltip}
    className={`flex flex-col items-center justify-center flex-1 outline-none transition-all duration-300 group ${
      active ? 'text-emerald-600' : 'text-slate-400 dark:text-slate-600 opacity-60 hover:opacity-100'
    }`}
  >
    <div className="flex items-center justify-center transition-all duration-300">
      {React.cloneElement(icon, { 
        size: active ? 24 : 20,
        strokeWidth: active ? 3 : 2,
        className: "transition-all duration-300"
      } as any)}
    </div>
    
    <span className={`mt-1 whitespace-nowrap overflow-hidden transition-all duration-300 text-[9px] font-black uppercase tracking-tighter ${
      active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 max-h-0'
    }`}>
      {label}
    </span>
  </button>
);

export default Layout;
