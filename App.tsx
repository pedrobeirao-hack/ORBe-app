
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TrendsChart from './components/TrendsChart';
import { Transaction, Category, Goal } from './types';
import { INITIAL_TRANSACTIONS, DEFAULT_CATEGORIES, INITIAL_GOALS } from './constants';
import { Search, Trash2, ChevronRight, Tag, Target, X, Users, CloudUpload, CloudDownload, Smartphone, Share2, QrCode, Copy, Check, Shield, LogIn, Moon, Sun, Calendar, Edit3, MoreVertical, Wallet, Plus, Coins, LayoutGrid, Orbit, Smile } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem('finanza_last_sync'));
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualVaultId, setManualVaultId] = useState('');
  
  // Tooltip State
  const [tooltip, setTooltip] = useState<{ text: string, x: number, y: number, position: 'top' | 'bottom' } | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('finanza_theme') as 'light' | 'dark') || 'light');
  
  const [coupleNames, setCoupleNames] = useState<string[]>(() => {
    const saved = localStorage.getItem('finanza_couple');
    return saved ? JSON.parse(saved) : ['Tu', 'Parceiro'];
  });
  
  const [vaultId, setVaultId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlVault = params.get('vault');
    const localVault = localStorage.getItem('finanza_vault_id');
    return urlVault || localVault || 'COFRE-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finanza_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('finanza_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('finanza_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [isManagingGoals, setIsManagingGoals] = useState(false);
  const [isManagingBudgets, setIsManagingBudgets] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [isManagingCouple, setIsManagingCouple] = useState(false);
  const [showPairingModal, setShowPairingModal] = useState(false);
  
  const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', currentAmount: '', icon: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', id: '', icon: '' });
  const [contributionInputs, setContributionInputs] = useState<Record<string, string>>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const catScrollRef = useRef<HTMLDivElement>(null);
  const [isDraggingCat, setIsDraggingCat] = useState(false);
  const [startXCat, setStartXCat] = useState(0);
  const [scrollLeftCat, setScrollLeftCat] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlVault = params.get('vault');
    const localVault = localStorage.getItem('finanza_vault_id');
    if (urlVault && urlVault !== localVault) {
      setShowPairingModal(true);
    }
  }, []);

  // Consolidado Global Tooltip Logic
  useEffect(() => {
    const handleShowTooltip = (e: MouseEvent | TouchEvent) => {
      const target = (e.target as HTMLElement).closest('[data-tooltip]');
      if (target) {
        const text = target.getAttribute('data-tooltip');
        if (text) {
          const rect = target.getBoundingClientRect();
          const tooltipWidth = 180;
          
          // Eixo X: Centro do elemento com clamping
          let x = rect.left + rect.width / 2;
          x = Math.max(tooltipWidth / 2 + 15, Math.min(window.innerWidth - tooltipWidth / 2 - 15, x));
          
          // Eixo Y: Topo por defeito, muda para baixo se muito perto do topo do ecrã
          let y = rect.top;
          let position: 'top' | 'bottom' = 'top';
          
          if (y < 80) {
            y = rect.bottom;
            position = 'bottom';
          }
          
          setTooltip({ text, x, y, position });
        }
      } else {
        setTooltip(null);
      }
    };

    const handleHideTooltip = () => setTooltip(null);

    window.addEventListener('mouseover', handleShowTooltip);
    window.addEventListener('touchstart', handleShowTooltip, { passive: true });
    window.addEventListener('scroll', handleHideTooltip, true);
    window.addEventListener('resize', handleHideTooltip);
    window.addEventListener('click', handleHideTooltip);

    return () => {
      window.removeEventListener('mouseover', handleShowTooltip);
      window.removeEventListener('touchstart', handleShowTooltip);
      window.removeEventListener('scroll', handleHideTooltip, true);
      window.removeEventListener('resize', handleHideTooltip);
      window.removeEventListener('click', handleHideTooltip);
    };
  }, []);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  useEffect(() => {
    localStorage.setItem('finanza_transactions', JSON.stringify(transactions));
    localStorage.setItem('finanza_categories', JSON.stringify(categories));
    localStorage.setItem('finanza_goals', JSON.stringify(goals));
    localStorage.setItem('finanza_couple', JSON.stringify(coupleNames));
    localStorage.setItem('finanza_vault_id', vaultId);
  }, [transactions, categories, goals, coupleNames, vaultId]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('finanza_theme', theme);
  }, [theme]);

  const getCurrentAppUrl = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('vault', vaultId);
      if (url.origin === 'null' || url.protocol === 'about:') return `ID: ${vaultId}`;
      return url.toString();
    } catch (e) {
      return `ID: ${vaultId}`;
    }
  };

  const handleCopyLink = () => {
    const url = getCurrentAppUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareVault = async () => {
    const shareUrl = getCurrentAppUrl();
    const shareText = `Vem gerir as finanças comigo no ORBe! Cofre: ${vaultId}.`;
    if (navigator.share && !shareUrl.startsWith('ID:')) {
      try { await navigator.share({ title: 'ORBe', text: shareText, url: shareUrl }); } 
      catch (e) { window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, '_blank'); }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, '_blank');
    }
  };

  const handleJoinManualVault = () => {
    if (manualVaultId.trim().length < 5) return alert("ID inválido.");
    if (confirm(`Mudar para o cofre ${manualVaultId}?`)) {
      setVaultId(manualVaultId.trim().toUpperCase());
      setManualVaultId('');
      alert("Cofre alterado!");
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setGoals(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), ...goalForm, targetAmount: parseFloat(goalForm.targetAmount), currentAmount: parseFloat(goalForm.currentAmount) || 0, color: 'bg-emerald-500' }]);
    setGoalForm({ name: '', targetAmount: '', currentAmount: '', icon: '' });
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name) return;

    if (categoryForm.id) {
      // Edit
      setCategories(prev => prev.map(c => c.id === categoryForm.id ? { ...c, name: categoryForm.name, icon: categoryForm.icon } : c));
    } else {
      // Create
      const newCat: Category = {
        id: Math.random().toString(36).substr(2, 9),
        name: categoryForm.name,
        icon: categoryForm.icon,
        color: 'bg-slate-100 text-slate-600',
        hex: '#475569'
      };
      setCategories(prev => [...prev, newCat]);
    }
    setCategoryForm({ name: '', id: '', icon: '' });
  };

  const handleAddContribution = (goalId: string) => {
    const amountStr = contributionInputs[goalId];
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return { ...g, currentAmount: g.currentAmount + amount };
      }
      return g;
    }));

    setContributionInputs(prev => ({ ...prev, [goalId]: '' }));
  };

  const handleUpdateCategoryBudget = (catId: string, budget: string) => {
    const numericBudget = budget === '' ? undefined : parseFloat(budget);
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, budget: numericBudget } : c));
  };

  const handleCatMouseDown = (e: React.MouseEvent) => {
    if (!catScrollRef.current) return;
    setIsDraggingCat(true);
    setStartXCat(e.pageX - catScrollRef.current.offsetLeft);
    setScrollLeftCat(catScrollRef.current.scrollLeft);
  };

  const handleCatMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCat || !catScrollRef.current) return;
    e.preventDefault();
    const walk = (e.pageX - catScrollRef.current.offsetLeft - startXCat) * 2;
    catScrollRef.current.scrollLeft = scrollLeftCat - walk;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onAddClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}>
      {activeTab === 'home' && (
        <>
          <div className="flex justify-center mb-4">
            <div 
              data-tooltip={`Cofre atual: ${vaultId}`}
              className="bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-2 cursor-help"
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
              <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
                {isSyncing ? 'Sincronizando...' : lastSync ? `Sincronizado: ${lastSync}` : 'Cofre Local'}
              </span>
            </div>
          </div>
          <Dashboard 
            transactions={transactions} 
            categories={categories} 
            goals={goals} 
            coupleNames={coupleNames} 
            onManageGoals={() => setIsManagingGoals(true)} 
            onManageBudgets={() => setIsManagingBudgets(true)}
            onEditTransaction={handleEdit}
          />
        </>
      )}

      {activeTab === 'list' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20">
          <div className="px-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Histórico</h1>
            <div className="relative mb-6">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
              <input type="text" placeholder="Procurar transação..." className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[1.8rem] pl-14 pr-6 py-4 text-sm font-bold shadow-sm outline-none dark:text-white focus:ring-2 focus:ring-emerald-500/10 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="mb-8 overflow-hidden">
              <div 
                ref={catScrollRef} 
                onMouseDown={handleCatMouseDown} 
                onMouseLeave={() => setIsDraggingCat(false)} 
                onMouseUp={() => setIsDraggingCat(false)} 
                onMouseMove={handleCatMouseMove} 
                className={`flex items-center gap-3 overflow-x-auto no-scrollbar py-2 snap-x ${isDraggingCat ? 'cursor-grabbing' : 'cursor-grab'}`}
              >
                <button 
                  onClick={() => setFilterCategory('All')} 
                  data-tooltip="Ver tudo"
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 snap-center border-2 ${filterCategory === 'All' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-50 dark:border-slate-700'}`}
                >
                  Todos
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => setFilterCategory(cat.name)} 
                    data-tooltip={`Filtrar por ${cat.name}`}
                    className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 snap-center border-2 flex items-center gap-2 whitespace-nowrap ${filterCategory === cat.name ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-50 dark:border-slate-700'}`}
                  >
                    {cat.icon ? <span className="mr-1">{cat.icon}</span> : <Orbit size={14} className="mr-1" />}
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {transactions
              .filter(t => (filterCategory === 'All' || t.category === filterCategory) && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
              .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(t => {
                const cat = categories.find(c => c.name === t.category);
                return (
                  <div key={t.id} onClick={() => handleEdit(t)} data-tooltip="Clique para editar" className="bg-white dark:bg-slate-800 p-5 rounded-[2.2rem] shadow-sm border border-slate-50 dark:border-slate-700 flex items-center justify-between group transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-50 dark:bg-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        {cat?.icon ? <span className="text-xl">{cat.icon}</span> : <Orbit size={20} strokeWidth={2.5} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{t.description}</p>
                          <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase flex items-center gap-1">
                            <Calendar size={8} /> {formatDate(t.date)}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">{t.category} • {t.createdBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={`text-base font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>{t.amount.toLocaleString()}€</p>
                      <Edit3 size={14} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
          <div className="px-2"><h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-8">Análise Mensal</h1></div>
          <TrendsChart 
            transactions={transactions} 
            categories={categories}
            goals={goals}
          />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-8 animate-in fade-in pb-20">
          <div className="px-2"><h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Ajustes</h1></div>
          
          <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
             <div className="absolute -right-6 -top-6 opacity-10 rotate-12"><Users size={120} /></div>
             <div className="relative z-10">
               <h2 className="text-xl font-black mb-2">Convidar Parceiro</h2>
               <p className="text-xs opacity-90 mb-6 leading-relaxed">Partilhe o link mágico ou peça ao parceiro para ler o código QR abaixo.</p>
               <div className="flex gap-3 mb-6">
                 <button onClick={handleShareVault} data-tooltip="Partilhar link direto" className="flex-1 bg-white text-emerald-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-50 transition-colors"><Share2 size={16} /> Partilhar</button>
                 <button onClick={() => setShowQr(!showQr)} data-tooltip={showQr ? "Esconder QR" : "Mostrar código QR"} className={`p-4 rounded-2xl border-2 transition-all ${showQr ? 'bg-emerald-500 border-white' : 'border-emerald-400 bg-transparent hover:border-white'}`}><QrCode size={20} /></button>
               </div>
               <div className="bg-emerald-700/50 p-4 rounded-2xl flex items-center justify-between border border-emerald-400/30">
                 <div className="flex flex-col"><span className="text-[8px] font-black uppercase opacity-60">ID do Vosso Cofre</span><span className="text-lg font-black tracking-widest">{vaultId}</span></div>
                 <button onClick={handleCopyLink} data-tooltip={copied ? "Copiado!" : "Copiar ID para a área de transferência"} className={`p-3 rounded-xl transition-colors ${copied ? 'bg-emerald-400' : 'bg-emerald-500/50 hover:bg-emerald-400'}`}>{copied ? <Check size={18}/> : <Copy size={18}/>}</button>
               </div>
               {showQr && <div className="mt-6 bg-white p-6 rounded-[2rem] flex flex-col items-center animate-in zoom-in duration-300"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getCurrentAppUrl())}&color=10b981&bgcolor=ffffff`} alt="Join QR" className="w-40 h-40 mb-3" /></div>}
             </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Conectar a outro cofre</h3>
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700">
               <div className="flex gap-2">
                 <input type="text" placeholder="ID do parceiro..." value={manualVaultId} onChange={(e) => setManualVaultId(e.target.value.toUpperCase())} className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                 <button onClick={handleJoinManualVault} data-tooltip="Confirmar ligação" className="bg-slate-900 dark:bg-emerald-600 text-white p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all"><LogIn size={20} /></button>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Geral</h3>
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-4 shadow-sm border border-slate-100 dark:border-slate-700">
               <SettingsItem icon={<Users size={18}/>} label="Perfil do Casal" onClick={() => setIsManagingCouple(true)} value={coupleNames.join(' & ')} />
               <SettingsItem icon={<Target size={18}/>} label="Metas" onClick={() => setIsManagingGoals(true)} />
               <SettingsItem icon={<Wallet size={18}/>} label="Orçamentos" onClick={() => setIsManagingBudgets(true)} />
               <SettingsItem icon={<LayoutGrid size={18}/>} label="Categorias" onClick={() => setIsManagingCategories(true)} />
               <SettingsItem icon={theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>} label="Modo Escuro" toggle active={theme === 'dark'} onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
            </div>
          </div>

          {/* Tutorial de Instalação Mobile (PWA) */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-2 flex items-center gap-2">
              <Smartphone size={12} className="text-emerald-500" /> Como instalar no telemóvel
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-5">
              <div className="flex gap-4 items-start">
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-slate-400">
                  <Smartphone size={18} />
                </div>
                <div className="space-y-4 w-full">
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">No iPhone ou iPad (Safari)</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      Toque no ícone de <Share2 size={12} className="inline mx-0.5 text-slate-400" /> Partilhar e selecione <span className="font-bold text-slate-900 dark:text-white">"Ecrã Principal"</span>.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-50 dark:border-slate-700/50">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">No Android (Chrome)</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      Toque nos <MoreVertical size={12} className="inline mx-0.5 text-slate-400" /> três pontos no topo e escolha <span className="font-bold text-slate-900 dark:text-white">"Instalar Aplicação"</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {deferredPrompt && (
            <div className="bg-slate-900 dark:bg-white dark:text-slate-900 rounded-[2rem] p-6 text-white flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-4"><Smartphone size={24} /><div className="space-y-0.5"><p className="text-sm font-black uppercase tracking-widest">Adicionar ao Ecrã</p><p className="text-[10px] opacity-60">Instalar como aplicação no telemóvel.</p></div></div>
              <button onClick={handleInstallClick} data-tooltip="Instalar ORBe no telemóvel" className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors">Instalar</button>
            </div>
          )}
        </div>
      )}

      {showPairingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-center animate-in zoom-in">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 w-20 h-20 rounded-[2rem] flex items-center justify-center text-emerald-600 mx-auto mb-6"><Users size={40} /></div>
              <h3 className="text-2xl font-black mb-3 dark:text-white">Novo Cofre!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">Recebeu um convite para um cofre partilhado. Deseja sincronizar e unir as contas?</p>
              <div className="space-y-3">
                <button onClick={() => { const p = new URLSearchParams(window.location.search); const v = p.get('vault'); if (v) setVaultId(v); setShowPairingModal(false); }} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-emerald-500/20">Sim, Entrar</button>
                <button onClick={() => setShowPairingModal(false)} className="w-full bg-slate-50 dark:bg-slate-800 text-slate-400 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest">Não, Manter Local</button>
              </div>
           </div>
        </div>
      )}

      {isManagingGoals && (
        <div className="fixed inset-0 bg-white dark:bg-slate-900 z-[100] p-8 animate-in slide-in-from-right overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center mb-10"><button onClick={() => setIsManagingGoals(false)} data-tooltip="Voltar" className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ChevronRight size={24} className="rotate-180" /></button><h2 className="text-2xl font-black dark:text-white tracking-tight">Metas de Poupança</h2><div className="w-12"></div></div>
          
          <div className="mb-10">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 px-2 tracking-widest">Criar Novo Objetivo</h3>
            <form onSubmit={handleSaveGoal} className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[3rem] space-y-4">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  maxLength={2} 
                  placeholder="Emoji" 
                  value={goalForm.icon} 
                  onChange={e => setGoalForm({...goalForm, icon: e.target.value})} 
                  className="w-20 bg-white dark:bg-slate-800 p-5 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 text-center text-xl" 
                />
                <input type="text" required placeholder="Ex: Viagem ao Japão" value={goalForm.name} onChange={e => setGoalForm({...goalForm, name: e.target.value})} className="flex-1 bg-white dark:bg-slate-800 p-5 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <input type="number" required placeholder="Valor Alvo (€)" value={goalForm.targetAmount} onChange={e => setGoalForm({...goalForm, targetAmount: e.target.value})} className="w-full bg-white dark:bg-slate-800 p-5 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20" />
              <button type="submit" className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">Criar Meta</button>
            </form>
          </div>

          <div className="space-y-6 pb-20">
            <h3 className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Objetivos Ativos</h3>
            {goals.map(g => (
              <div key={g.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 flex flex-col gap-5 group animate-in slide-in-from-bottom">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-600 bg-slate-50 dark:bg-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm">
                      {g.icon ? <span className="text-2xl">{g.icon}</span> : <Orbit size={28} strokeWidth={2.5} />}
                    </span>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white leading-tight">{g.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {g.currentAmount.toLocaleString()}€ <span className="text-slate-300">/ {g.targetAmount.toLocaleString()}€</span>
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setGoals(prev => prev.filter(x => x.id !== g.id))} data-tooltip="Eliminar meta definitivamente" className="text-rose-400 p-3 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-2xl transition-colors"><Trash2 size={20} /></button>
                </div>

                {/* Progress Bar Mini */}
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full ${g.color} transition-all duration-1000`} style={{ width: `${Math.min((g.currentAmount / g.targetAmount) * 100, 100)}%` }}></div>
                </div>

                {/* Contribution Input Inline */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-50 dark:border-slate-700/50 mt-1">
                  <div className="relative flex-1">
                    <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input 
                      type="number" 
                      placeholder="Somar valor..." 
                      value={contributionInputs[g.id] || ''}
                      onChange={(e) => setContributionInputs(prev => ({ ...prev, [g.id]: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                  <button 
                    onClick={() => handleAddContribution(g.id)}
                    data-tooltip="Adicionar poupança a esta meta"
                    className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-90 transition-all"
                  >
                    <Plus size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isManagingBudgets && (
        <div className="fixed inset-0 bg-white dark:bg-slate-900 z-[100] p-8 animate-in slide-in-from-right overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center mb-10">
            <button onClick={() => setIsManagingBudgets(false)} data-tooltip="Voltar" className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <h2 className="text-2xl font-black dark:text-white tracking-tight">Orçamentos Mensais</h2>
            <div className="w-12"></div>
          </div>
          <div className="space-y-4 pb-10">
            <p className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-[0.1em] mb-6">Define os teus limites mensais por categoria</p>
            {categories.map(cat => (
              <div key={cat.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-emerald-600">
                      {cat.icon ? <span className="text-2xl">{cat.icon}</span> : <Orbit size={24} strokeWidth={2.5} />}
                    </div>
                    <p className="font-bold text-slate-800 dark:text-white">{cat.name}</p>
                  </div>
                  {cat.budget && (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full uppercase tracking-tighter">Ativo</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold">€</span>
                    <input 
                      type="number" 
                      placeholder="Sem orçamento" 
                      value={cat.budget === undefined ? '' : cat.budget} 
                      onChange={e => handleUpdateCategoryBudget(cat.id, e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl pl-10 pr-5 py-4 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isManagingCategories && (
        <div className="fixed inset-0 bg-white dark:bg-slate-900 z-[100] p-8 animate-in slide-in-from-right overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center mb-10">
            <button onClick={() => setIsManagingCategories(false)} data-tooltip="Voltar" className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <h2 className="text-2xl font-black dark:text-white tracking-tight">Categorias</h2>
            <div className="w-12"></div>
          </div>

          <div className="mb-10">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 px-2 tracking-widest">
              {categoryForm.id ? 'Editar Categoria' : 'Criar Nova Categoria'}
            </h3>
            <form onSubmit={handleSaveCategory} className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[3rem] space-y-4">
              <div className="flex gap-4">
                <input 
                  type="text" 
                  maxLength={2}
                  placeholder="Emoji" 
                  value={categoryForm.icon} 
                  onChange={e => setCategoryForm({...categoryForm, icon: e.target.value})} 
                  className="w-20 bg-white dark:bg-slate-800 p-5 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 text-center text-xl shadow-sm border border-slate-100 dark:border-slate-700" 
                />
                <input 
                  type="text" 
                  required 
                  placeholder="Nome da categoria" 
                  value={categoryForm.name} 
                  onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} 
                  className="flex-1 bg-white dark:bg-slate-800 p-5 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20" 
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">
                  {categoryForm.id ? 'Guardar Alterações' : 'Adicionar'}
                </button>
                {categoryForm.id && (
                  <button type="button" onClick={() => setCategoryForm({ name: '', id: '', icon: '' })} className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-6 px-8 rounded-[2rem] font-black uppercase text-[10px] tracking-widest">Cancelar</button>
                )}
              </div>
            </form>
          </div>

          <div className="space-y-4 pb-20">
            <h3 className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Categorias Existentes</h3>
            {categories.map(cat => (
              <div key={cat.id} className="bg-white dark:bg-slate-800 p-5 rounded-[2.2rem] border border-slate-100 dark:border-slate-700 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className="text-emerald-600 bg-slate-50 dark:bg-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center">
                    {cat.icon ? <span className="text-xl">{cat.icon}</span> : <Orbit size={22} strokeWidth={2.5} />}
                  </span>
                  <p className="font-bold text-slate-800 dark:text-white">{cat.name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setCategoryForm({ name: cat.name, id: cat.id, icon: cat.icon })} 
                    data-tooltip="Editar categoria"
                    className="p-3 text-slate-300 hover:text-emerald-500 transition-colors"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm(`Eliminar categoria "${cat.name}"? As transações existentes não serão apagadas.`)) {
                        setCategories(prev => prev.filter(c => c.id !== cat.id));
                      }
                    }} 
                    data-tooltip="Eliminar categoria"
                    className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isManagingCouple && (
        <div className="fixed inset-0 bg-white dark:bg-slate-900 z-[100] p-8 animate-in slide-in-from-right">
          <div className="flex justify-between items-center mb-10"><button onClick={() => setIsManagingCouple(false)} data-tooltip="Voltar" className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl dark:text-white hover:bg-slate-200 transition-colors"><ChevronRight size={24} className="rotate-180" /></button><h2 className="text-2xl font-black dark:text-white tracking-tight">Nomes do Casal</h2><div className="w-12"></div></div>
          <div className="space-y-8"><div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[3rem] space-y-6">
              <div><label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">O teu nome</label><input type="text" className="w-full bg-white dark:bg-slate-800 p-5 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20" value={coupleNames[0]} onChange={e => setCoupleNames([e.target.value, coupleNames[1]])} /></div>
              <div><label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Nome do parceiro</label><input type="text" className="w-full bg-white dark:bg-slate-800 p-5 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20" value={coupleNames[1]} onChange={e => setCoupleNames([coupleNames[0], e.target.value])} /></div>
            </div></div>
        </div>
      )}

      {isFormOpen && (
        <TransactionForm 
          initialData={editingTransaction || undefined}
          onSave={(data) => { 
            if (editingTransaction) {
              setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...data, id: t.id } as Transaction : t));
            } else {
              setTransactions(prev => [{...data, id: Math.random().toString(36).substr(2, 9)}, ...prev]);
            }
            setIsFormOpen(false); 
            setEditingTransaction(null);
          }} 
          categories={categories} 
          coupleNames={coupleNames} 
          onClose={() => {
            setIsFormOpen(false);
            setEditingTransaction(null);
          }} 
        />
      )}
      
      {/* Sistema Consolidado de Portal Tooltip */}
      {tooltip && createPortal(
        <div 
          className="portal-tooltip animate-in fade-in zoom-in duration-200"
          style={{ 
            left: tooltip.x, 
            top: tooltip.y,
            transform: tooltip.position === 'top' ? 'translate(-50%, -100%) translateY(-15px)' : 'translate(-50%, 0%) translateY(15px)'
          }}
        >
          {tooltip.text}
          {/* Seta Indicativa */}
          <div 
            className={`absolute left-1/2 -translate-x-1/2 border-[6px] border-transparent ${
              tooltip.position === 'top' 
                ? 'top-full border-t-slate-900/96' 
                : 'bottom-full border-b-slate-900/96'
            }`} 
          />
        </div>,
        document.body
      )}
    </Layout>
  );
};

const SettingsItem = ({ icon, label, onClick, value, toggle, active, onToggle }: any) => (
  <div onClick={onClick || onToggle} data-tooltip={`Configurar ${label}`} className="flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl cursor-pointer transition-colors group">
    <div className="flex items-center gap-4"><div className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl group-hover:scale-110 transition-transform">{icon}</div><span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{label}</span></div>
    <div className="flex items-center gap-2">{value && <span className="text-xs font-black text-slate-300 dark:text-slate-600 uppercase tracking-tighter truncate max-w-[100px]">{value}</span>}{toggle ? <div className={`w-10 h-6 rounded-full relative transition-colors ${active ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`}></div></div> : <ChevronRight size={16} className="text-slate-200 dark:text-slate-700 group-hover:translate-x-1 transition-transform" />}</div>
  </div>
);

export default App;
