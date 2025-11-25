
import React, { useEffect, useState } from 'react';

interface Props {
  onAiClick: () => void;
  onSystemClick: () => void;
  isAnalyzing: boolean;
  secondsToRefresh: number;
  currentDate: Date;
  viewMode: 'day' | 'week';
  onNextDay: () => void;
  onPrevDay: () => void;
  onViewChange: (mode: 'day' | 'week') => void;
  onSetToday: () => void;
  showStats: boolean;
  onToggleStats: () => void;
  onManualRefresh: () => void;
  onSearch: (query: string) => void;
  onKnowledgeClick: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  filterType: string;
  onFilterChange: (type: string) => void;
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export const Header: React.FC<Props> = ({ 
  onAiClick, 
  onSystemClick,
  isAnalyzing, 
  secondsToRefresh, 
  currentDate, 
  viewMode,
  onNextDay, 
  onPrevDay, 
  onViewChange,
  onSetToday,
  showStats,
  onToggleStats,
  onManualRefresh,
  onSearch,
  onKnowledgeClick,
  darkMode,
  onToggleDarkMode,
  filterType,
  onFilterChange,
  isAdmin,
  onLoginClick,
  onLogoutClick
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-20 print:hidden transition-colors">
      {/* Top Brand Bar */}
      <div className="bg-[#0f172a] text-white px-4 h-8 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
           <span className="font-bold tracking-wide">StudioSystem.NET</span>
           <span className="opacity-50">|</span>
           <span className="text-slate-300">SteriPack Deliveries</span>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={onManualRefresh}
             className={`flex items-center gap-1.5 font-mono transition-colors hover:text-white cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded ${secondsToRefresh < 5 ? 'text-amber-400' : 'text-slate-400'}`}
             title="Kliknij, aby odświeżyć dane natychmiast"
           >
              <svg className={`w-3 h-3 ${secondsToRefresh < 30 ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Odświeżenie za: {secondsToRefresh}s</span>
           </button>
           
           {/* Login Button */}
           <button 
             onClick={isAdmin ? onLogoutClick : onLoginClick}
             className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${isAdmin ? 'bg-red-600 text-white hover:bg-red-500' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
           >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isAdmin ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  )}
              </svg>
              <span>{isAdmin ? 'Wyloguj (Admin)' : 'Zaloguj'}</span>
           </button>

           <button 
             onClick={onToggleDarkMode} 
             className="hover:bg-white/10 p-1 rounded text-slate-400 hover:text-white transition-colors" 
             title={darkMode ? "Przełącz na jasny motyw" : "Przełącz na ciemny motyw"}
           >
             {darkMode ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
             ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
             )}
           </button>
        </div>
      </div>

      {/* Main Toolbar */}
      <div className="px-3 py-2 flex items-center justify-between overflow-x-auto bg-white dark:bg-slate-800">
        <div className="flex items-center gap-2">
          
          {/* System Button - Highlighted */}
          <button 
            onClick={onSystemClick}
            className="bg-sky-600 text-white rounded flex flex-col items-center justify-center w-[72px] h-[52px] hover:bg-sky-700 transition shadow-sm mr-2 shrink-0 group"
          >
             <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             <span className="font-bold text-[10px] leading-none">System</span>
          </button>

          {/* Standard Toolbar Buttons */}
          <div className="flex bg-gray-50 dark:bg-slate-900 p-1 rounded border border-gray-200 dark:border-slate-700 gap-1">
              <ToolbarButton 
                label="Szukaj" 
                active={true} 
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} 
              />
              <ToolbarButton 
                label="Awizacje" 
                active={true} 
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} 
              />
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-slate-700 mx-1"></div>

          <div className="flex bg-gray-50 dark:bg-slate-900 p-1 rounded border border-gray-200 dark:border-slate-700 gap-1">
              <ToolbarButton 
                label="Statystyki" 
                active={false} 
                onClick={onToggleStats}
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} 
              />
              <ToolbarButton 
                label="Centrum Wiedzy" 
                active={false} 
                onClick={onKnowledgeClick}
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} 
              />
          </div>

          <div className="w-px h-8 bg-gray-200 dark:bg-slate-700 mx-1"></div>

          {/* AI Button */}
          <button 
            onClick={onAiClick}
            disabled={isAnalyzing}
            className={`flex flex-col items-center justify-center w-[72px] h-[52px] rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors group ${isAnalyzing ? 'opacity-50' : ''}`}
          >
            <div className={`p-1 rounded mb-0.5 ${isAnalyzing ? 'text-indigo-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
               <svg className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L13 21l-2.286-6.857L5 12l5.714-3.214z" /></svg>
            </div>
            <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-medium leading-none">AI Analiza</span>
          </button>
        </div>

        <div className="hidden lg:block text-right px-4">
          <div className="text-sm font-bold text-gray-700 dark:text-slate-300 font-mono">
            {currentTime.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-[10px] text-gray-400 dark:text-slate-600 uppercase tracking-wider">
             {currentTime.toLocaleDateString('pl-PL')}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-gray-100 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 select-none bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 p-0.5">
            <button onClick={onPrevDay} className="text-gray-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-sm font-bold text-gray-800 dark:text-slate-200 min-w-[140px] text-center cursor-pointer hover:text-sky-600 transition-colors" onClick={onSetToday}>
              {formatDate(currentDate)}
            </span>
            <button onClick={onNextDay} className="text-gray-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Szukaj..." 
              onChange={(e) => onSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 w-56 bg-white dark:bg-slate-800 dark:text-white transition-all"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          {/* QUICK FILTERS */}
          <div className="flex gap-1.5">
             <FilterChip label="Wszystkie" active={filterType === 'ALL'} onClick={() => onFilterChange('ALL')} />
             <FilterChip label="Załadunki" active={filterType === 'LOAD'} onClick={() => onFilterChange('LOAD')} color="blue" />
             <FilterChip label="Rozładunki" active={filterType === 'UNLOAD'} onClick={() => onFilterChange('UNLOAD')} color="emerald" />
             <FilterChip label="Kurierzy" active={filterType === 'COURIER'} onClick={() => onFilterChange('COURIER')} color="indigo" />
             <FilterChip label="Na Placu" active={filterType === 'ONSITE'} onClick={() => onFilterChange('ONSITE')} color="green" />
          </div>
        </div>

        <div className="flex bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded overflow-hidden p-0.5 gap-0.5">
          <ViewButton label="Dzień" active={viewMode === 'day'} onClick={() => onViewChange('day')} />
          <ViewButton label="Tydzień" active={viewMode === 'week'} onClick={() => onViewChange('week')} />
        </div>
      </div>
    </header>
  );
};

const ToolbarButton = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-[72px] h-[44px] rounded transition-all group ${active ? 'bg-white dark:bg-slate-800 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
  >
    <div className={`mb-0.5 transition-colors ${active ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-medium leading-none ${active ? 'text-sky-700 dark:text-sky-300 font-bold' : 'text-slate-500 dark:text-slate-500'}`}>{label}</span>
  </button>
);

const ViewButton = ({ label, active, onClick }: { label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${active ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400'}`}
  >
    {label}
  </button>
);

const FilterChip = ({ label, active, onClick, color = 'gray' }: any) => {
    let activeClass = 'bg-slate-700 text-white border-slate-700 shadow-sm';
    if (color === 'blue') activeClass = 'bg-blue-600 text-white border-blue-600 shadow-sm';
    if (color === 'emerald') activeClass = 'bg-emerald-600 text-white border-emerald-600 shadow-sm';
    if (color === 'indigo') activeClass = 'bg-indigo-600 text-white border-indigo-600 shadow-sm';
    if (color === 'green') activeClass = 'bg-green-600 text-white border-green-600 shadow-sm';

    return (
        <button 
            onClick={onClick}
            className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${active ? activeClass : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-gray-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400'}`}
        >
            {label}
        </button>
    )
}
