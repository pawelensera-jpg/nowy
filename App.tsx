
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { TimelineView } from './components/TimelineView';
import { DashboardStats } from './components/DashboardStats';
import { EditDeliveryModal } from './components/EditDeliveryModal';
import { SystemSettingsModal } from './components/SystemSettingsModal';
import { StatisticsModal } from './components/StatisticsModal';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { DeliveryItem } from './types';
import { fetchDeliveries, simulateLiveUpdate, resolveTimeOverlaps, saveDeliveriesLocal, getHistoryStats, DayStats } from './services/sharepointService';
import { analyzeSchedule } from './services/geminiService';

const REFRESH_INTERVAL_SECONDS = 30;

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  
  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
      return localStorage.getItem('theme') === 'dark';
  });

  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [historyStats, setHistoryStats] = useState<DayStats[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [secondsToRefresh, setSecondsToRefresh] = useState(REFRESH_INTERVAL_SECONDS);
  const [showStatsWidget, setShowStatsWidget] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL'); // ALL, LOAD, UNLOAD, COURIER, ONSITE

  const [editingDelivery, setEditingDelivery] = useState<DeliveryItem | null>(null);
  const [systemSettings, setSystemSettings] = useState({ duration: 90, blockedGates: [] as string[] });
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isKnowledgeBaseModalOpen, setIsKnowledgeBaseModalOpen] = useState(false);

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    
    try {
      const data = await fetchDeliveries(currentDate, systemSettings.duration);
      setDeliveries(data);
      const stats = await getHistoryStats(currentDate);
      setHistoryStats(stats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd.");
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [currentDate, systemSettings.duration]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToRefresh(prev => {
        if (prev <= 1) {
          loadData(false);
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveries(current => simulateLiveUpdate(current));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setSecondsToRefresh(REFRESH_INTERVAL_SECONDS);
    loadData(false);
  };

  const handleAiAnalysis = async () => {
    if (deliveries.length === 0) return;
    setIsAnalyzing(true);
    setShowAiModal(true);
    const result = await analyzeSchedule(deliveries);
    setAiResult(result);
    setIsAnalyzing(false);
  };

  const handleDeliveryUpdate = (updatedDelivery: DeliveryItem) => {
    setDeliveries(prev => {
      const updatedList = prev.map(item => item.id === updatedDelivery.id ? updatedDelivery : item);
      const resolved = resolveTimeOverlaps(updatedList);
      saveDeliveriesLocal(currentDate, resolved);
      return resolved;
    });
    getHistoryStats(currentDate).then(stats => setHistoryStats(stats));
  };

  const handleDeleteDelivery = (id: string) => {
      setDeliveries(prev => {
          const updatedList = prev.filter(item => item.id !== id);
          saveDeliveriesLocal(currentDate, updatedList);
          return updatedList;
      });
      getHistoryStats(currentDate).then(stats => setHistoryStats(stats));
  };

  const handleEditClick = (item: DeliveryItem) => {
    setEditingDelivery(item);
  };

  const handleSaveDelivery = (updatedItem: DeliveryItem) => {
    handleDeliveryUpdate(updatedItem);
    setEditingDelivery(null);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleSetToday = () => {
    setCurrentDate(new Date());
  };

  const handleSystemSave = (duration: number, blockedGates: string[]) => {
      setSystemSettings({ duration, blockedGates });
  };

  const handleLogin = () => {
      setIsAdmin(true);
  };

  const handleLogout = () => {
      setIsAdmin(false);
  };

  // Filter Deliveries
  const filteredDeliveries = useMemo(() => {
      let filtered = deliveries;

      // 1. Search Filter
      if (searchQuery.trim()) {
          const lowerQuery = searchQuery.toLowerCase();
          filtered = filtered.filter(d => 
              d.companyName.toLowerCase().includes(lowerQuery) || 
              d.plateNumber.toLowerCase().includes(lowerQuery) ||
              d.originalId.toString().includes(lowerQuery)
          );
      }

      // 2. Quick Chips Filter
      if (filterType === 'LOAD') filtered = filtered.filter(d => d.type === 'Załadunek');
      if (filterType === 'UNLOAD') filtered = filtered.filter(d => d.type === 'Rozładunek');
      if (filterType === 'COURIER') filtered = filtered.filter(d => d.type === 'Kurier');
      if (filterType === 'ONSITE') filtered = filtered.filter(d => d.isArrived);

      return filtered;
  }, [deliveries, searchQuery, filterType]);

  return (
    <div className={`h-screen flex flex-col font-sans overflow-hidden ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}>
      <Header 
        onAiClick={handleAiAnalysis}
        onSystemClick={() => setIsSystemModalOpen(true)} 
        onKnowledgeClick={() => setIsKnowledgeBaseModalOpen(true)}
        isAnalyzing={isAnalyzing} 
        secondsToRefresh={secondsToRefresh}
        currentDate={currentDate}
        viewMode={viewMode}
        onNextDay={handleNextDay}
        onPrevDay={handlePrevDay}
        onViewChange={setViewMode}
        onSetToday={handleSetToday}
        showStats={showStatsWidget}
        onToggleStats={() => setIsStatsModalOpen(true)}
        onManualRefresh={handleManualRefresh}
        onSearch={setSearchQuery}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        filterType={filterType}
        onFilterChange={setFilterType}
        isAdmin={isAdmin}
        onLoginClick={() => setShowLoginModal(true)}
        onLogoutClick={handleLogout}
      />

      <main className={`flex-grow p-4 flex flex-col overflow-hidden relative gap-4 ${darkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-2 shadow-sm relative" role="alert">
                <p className="font-bold">Błąd Systemu</p>
                <p>{error}</p>
                <button className="absolute top-0 right-0 p-4" onClick={() => setError(null)}>
                   <span className="text-2xl">&times;</span>
                </button>
            </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center h-full gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            <div className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Pobieranie danych z SharePoint...</div>
          </div>
        ) : (
          <>
            {showStatsWidget && <DashboardStats deliveries={filteredDeliveries} historyData={historyStats} />}
            
            <div className="flex-grow min-h-0 shadow-lg rounded overflow-hidden">
               <TimelineView 
                 deliveries={filteredDeliveries} 
                 onDeliveryUpdate={handleDeliveryUpdate}
                 onDeliveryClick={handleEditClick}
                 viewMode={viewMode}
                 currentDate={currentDate}
                 blockedGates={systemSettings.blockedGates}
               />
            </div>
          </>
        )}

        {/* Modals */}
        {editingDelivery && (
            <EditDeliveryModal 
                delivery={editingDelivery}
                isOpen={!!editingDelivery}
                onClose={() => setEditingDelivery(null)}
                onSave={handleSaveDelivery}
                onDelete={handleDeleteDelivery}
                isAdmin={isAdmin}
            />
        )}

        <SystemSettingsModal 
            isOpen={isSystemModalOpen}
            onClose={() => setIsSystemModalOpen(false)}
            currentDuration={systemSettings.duration}
            blockedGates={systemSettings.blockedGates}
            onSave={handleSystemSave}
        />

        <StatisticsModal 
            isOpen={isStatsModalOpen}
            onClose={() => setIsStatsModalOpen(false)}
            historyData={historyStats}
            currentDeliveries={filteredDeliveries} 
        />

        <KnowledgeBaseModal 
            isOpen={isKnowledgeBaseModalOpen}
            onClose={() => setIsKnowledgeBaseModalOpen(false)}
        />

        <AdminLoginModal 
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onLogin={handleLogin}
        />

        {/* AI Modal Overlay */}
        {showAiModal && (
          <div className="absolute top-4 right-4 w-80 bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-indigo-100 dark:border-indigo-900 z-30 animate-fade-in-up">
            <div className="bg-indigo-600 text-white p-3 rounded-t-lg flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Asystent Logistyczny
              </h3>
              <button onClick={() => setShowAiModal(false)} className="text-white hover:text-indigo-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 dark:text-slate-200">
              {isAnalyzing && !aiResult ? (
                 <div className="flex flex-col items-center py-4">
                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mb-2"></div>
                   <span className="text-xs text-gray-500 dark:text-gray-400">Analizuję harmonogram...</span>
                 </div>
              ) : (
                 <div className="text-sm leading-relaxed">
                   {aiResult}
                 </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-sky-700 text-white text-[10px] py-1 px-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <span>StudioSystem © SoftwareStudio Sp. z o.o.</span>
          <span className="opacity-50">|</span>
          <span className="text-emerald-300 flex items-center gap-1">
             <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
             Live Data
          </span>
        </div>
        <div className="flex gap-4">
           <span>Komórka: 00006</span>
           <span>Magazyn: 00003</span>
           <span>Oddział: 00003</span>
           <span>Firma: 01</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
