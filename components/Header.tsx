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
  onToggleStats
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
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
      {/* Top Brand Bar */}
      <div className="bg-sky-700 text-white px-4 h-8 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
           <span className="font-bold">StudioSystem.NET</span>
           <span className="opacity-75">| SteriPack Deliveries</span>
        </div>
        <div className="flex items-center gap-4">
           <div className={`flex items-center gap-1 font-mono transition-colors ${secondsToRefresh < 5 ? 'text-amber-300' : 'text-sky-200'}`}>
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Odświeżenie za: {secondsToRefresh}s</span>
           </div>
           <span>Użytkownik: demo_maw</span>
        </div>
      </div>

      {/* Main Toolbar */}
      <div className="px-2 py-2 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-1">
          {/* Logo / Home */}
          <button 
            onClick={onSystemClick}
            className="bg-sky-600 text-white p-2 px-3 rounded shadow-sm mr-2 flex flex-col items-center justify-center cursor-pointer hover:bg-sky-700 transition"
          >
             <span className="font-bold text-sm">System</span>
          </button>

          <ToolbarButton icon={<SearchIcon />} label="Szukaj" active />
          {/* Removed Inactive "Okna czasowe" button */}
          <ToolbarButton icon={<ListIcon />} label="Awizacja ramp" active />
          
          <div className="h-8 w-px bg-gray-300 mx-2"></div>
          
          <button
             onClick={onToggleStats}
             className={`flex flex-col items-center justify-center px-3 py-1 rounded hover:bg-gray-100 min-w-[70px] transition-colors`}
          >
            <div className={`text-gray-600 mb-1`}>
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <span className={`text-[10px] font-medium leading-none text-gray-600`}>Statystyki</span>
          </button>

          <button 
            onClick={onAiClick}
            disabled={isAnalyzing}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded hover:bg-indigo-50 min-w-[70px] transition-colors group ${isAnalyzing ? 'opacity-50' : ''}`}
          >
            <div className={`p-1.5 rounded-lg mb-1 ${isAnalyzing ? 'bg-indigo-100' : 'bg-indigo-600 text-white group-hover:bg-indigo-700'}`}>
               <SparklesIcon className={isAnalyzing ? 'animate-spin text-indigo-600' : ''} />
            </div>
            <span className="text-[10px] text-indigo-700 font-medium leading-none">AI Analiza</span>
          </button>
        </div>

        {/* Right Info */}
        <div className="hidden lg:block text-right px-4">
          <div className="text-sm font-bold text-gray-700">
            {currentTime.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xs text-gray-500">
             {currentTime.toLocaleDateString('pl-PL')}
          </div>
        </div>
      </div>

      {/* Sub-toolbar / Filter Bar */}
      <div className="bg-gray-100 border-t border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 select-none">
            <button onClick={onPrevDay} className="text-gray-500 hover:text-sky-600 p-1 hover:bg-gray-200 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-sm font-bold text-gray-800 min-w-[140px] text-center cursor-pointer hover:underline" onClick={onSetToday}>
              {formatDate(currentDate)}
            </span>
            <button onClick={onNextDay} className="text-gray-500 hover:text-sky-600 p-1 hover:bg-gray-200 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Szukaj..." 
              className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-sky-500 w-64"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="flex bg-white border border-gray-300 rounded overflow-hidden">
          <ViewButton label="Dzień" active={viewMode === 'day'} onClick={() => onViewChange('day')} />
          <ViewButton label="Tydzień" active={viewMode === 'week'} onClick={() => onViewChange('week')} />
        </div>
      </div>
    </header>
  );
};

const ToolbarButton = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button className={`flex flex-col items-center justify-center px-3 py-1 rounded hover:bg-gray-100 min-w-[70px] transition-colors ${active ? 'bg-gray-100' : ''}`}>
    <div className={`text-gray-600 mb-1 ${active ? 'text-sky-600' : ''}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-medium leading-none ${active ? 'text-sky-700' : 'text-gray-600'}`}>{label}</span>
  </button>
);

const ViewButton = ({ label, active, onClick }: { label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-3 py-1 text-xs font-medium border-r border-gray-200 last:border-0 transition-colors ${active ? 'bg-gray-200 text-gray-900 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
  >
    {label}
  </button>
);

// Icons
const SearchIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ListIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const SparklesIcon = ({ className }: { className?: string }) => <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L13 21l-2.286-6.857L5 12l5.714-3.214z" /></svg>;