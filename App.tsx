import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TimelineView } from './components/TimelineView';
import { DashboardStats } from './components/DashboardStats';
import { EditDeliveryModal } from './components/EditDeliveryModal';
import { SystemSettingsModal } from './components/SystemSettingsModal';
import { StatisticsModal } from './components/StatisticsModal';
import { DeliveryItem } from './types';
import { fetchDeliveries, simulateLiveUpdate, resolveTimeOverlaps, saveDeliveriesLocal, getHistoryStats, DayStats } from './services/sharepointService';
import { analyzeSchedule } from './services/geminiService';

const REFRESH_INTERVAL_SECONDS = 30;

const App: React.FC = () => {
  // Set default date to 24/11/2025 as per user requirements for the demo
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 24)); 
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [historyStats, setHistoryStats] = useState<DayStats[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [secondsToRefresh, setSecondsToRefresh] = useState(REFRESH_INTERVAL_SECONDS);
  const [showStatsWidget, setShowStatsWidget] = useState(true);
  
  // Edit State
  const [editingDelivery, setEditingDelivery] = useState<DeliveryItem | null>(null);

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({ duration: 90, blockedGates: [] as string[] });
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);

  // Statistics Modal State
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    
    try {
      const data = await fetchDeliveries(currentDate, systemSettings.duration);
      setDeliveries(data);
      
      // Update history stats (Now Async)
      const stats = await getHistoryStats(currentDate);
      setHistoryStats(stats);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd.");
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [currentDate, systemSettings.duration]);

  // Initial Load & Date Change
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // 30 Seconds Auto-Refresh Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToRefresh(prev => {
        if (prev <= 1) {
          loadData(false); // Trigger refresh
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loadData]);

  // Polling for local simulation logic (like 12h timeout)
  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveries(current => simulateLiveUpdate(current));
    }, 10000); // 10 seconds refresh for internal status updates
    return () => clearInterval(interval);
  }, []);

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
      // Persist changes to memory so they stick if we navigate away and back
      saveDeliveriesLocal(currentDate, resolved);
      return resolved;
    });
    
    // Refresh history stats logic
    getHistoryStats(currentDate).then(stats => setHistoryStats(stats));
  };

  const handleEditClick = (item: DeliveryItem) => {
    setEditingDelivery(item);
  };

  const handleSaveDelivery = (updatedItem: DeliveryItem) => {
    handleDeliveryUpdate(updatedItem);
    setEditingDelivery(null);
  };

  // Date Navigation Handlers
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
    setCurrentDate(new Date()); // Sets to actual today
  };

  const handleSystemSave = (duration: number, blockedGates: string[]) => {
      setSystemSettings({ duration, blockedGates });
  };

  return (
    <div className="h-screen bg-white flex flex-col font-sans text-slate-900 overflow-hidden">
      <Header 
        onAiClick={handleAiAnalysis}
        onSystemClick={() => setIsSystemModalOpen(true)} 
        isAnalyzing={isAnalyzing} 
        secondsToRefresh={secondsToRefresh}
        currentDate={currentDate}
        viewMode={viewMode}
        onNextDay={handleNextDay}
        onPrevDay={handlePrevDay}
        onViewChange={setViewMode}
        onSetToday={handleSetToday}
        showStats={showStatsWidget}
        onToggleStats={() => setIsStatsModalOpen(true)} // Open Modal
      />

      <main className="flex-grow p-4 bg-gray-200 flex flex-col overflow-hidden relative gap-4">
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
            <div className="text-sm text-gray-500 font-medium">Pobieranie danych z SharePoint...</div>
          </div>
        ) : (
          <>
            {showStatsWidget && <DashboardStats deliveries={deliveries} historyData={historyStats} />}
            
            <div className="flex-grow min-h-0 shadow-lg rounded overflow-hidden">
               <TimelineView 
                 deliveries={deliveries} 
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
            currentDeliveries={deliveries}
        />

        {/* AI Modal Overlay */}
        {showAiModal && (
          <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-indigo-100 z-30 animate-fade-in-up">
            <div className="bg-indigo-600 text-white p-3 rounded-t-lg flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Asystent Logistyczny
              </h3>
              <button onClick={() => setShowAiModal(false)} className="text-white hover:text-indigo-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4">
              {isAnalyzing && !aiResult ? (
                 <div className="flex flex-col items-center py-4">
                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mb-2"></div>
                   <span className="text-xs text-gray-500">Analizuję harmonogram...</span>
                 </div>
              ) : (
                 <div className="text-sm text-gray-700 leading-relaxed">
                   {aiResult}
                 </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Footer Status Bar */}
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