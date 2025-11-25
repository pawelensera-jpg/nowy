import React from 'react';
import { DeliveryItem, DeliveryStatus } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface HistoryData {
    date: string;
    total: number;
    arrived: number;
    pending: number;
}

interface Props {
  deliveries: DeliveryItem[];
  historyData: HistoryData[];
}

export const DashboardStats: React.FC<Props> = ({ deliveries, historyData }) => {
  const loadingDeliveries = deliveries.filter(d => d.type === 'Załadunek');
  const unloadingDeliveries = deliveries.filter(d => d.type === 'Rozładunek' || d.type === 'Kurier');

  const calculateStats = (items: DeliveryItem[]) => {
      return {
          total: items.length,
          pending: items.filter(d => !d.isArrived && d.status !== DeliveryStatus.COMPLETED).length,
          onSite: items.filter(d => d.isArrived && d.status !== DeliveryStatus.COMPLETED).length,
          completed: items.filter(d => d.status === DeliveryStatus.COMPLETED).length
      };
  };

  const loadStats = calculateStats(loadingDeliveries);
  const unloadStats = calculateStats(unloadingDeliveries);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden shrink-0 font-sans flex h-28 transition-colors">
      {/* LEFT PANEL */}
      <div className="w-1/2 lg:w-3/5 flex flex-col border-r border-gray-200 dark:border-slate-700">
          <div className="flex-1">
            <StatRow label="ZAŁADUNKI" subLabel="(W3, W4)" stats={loadStats} colorTheme="blue" />
          </div>
          <div className="h-px bg-gray-100 dark:bg-slate-700 mx-0"></div>
          <div className="flex-1">
            <StatRow label="ROZŁADUNKI" subLabel="(W1, W5-W8)" stats={unloadStats} colorTheme="emerald" />
          </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/2 lg:w-2/5 p-2 bg-gray-50 dark:bg-slate-900 flex flex-col justify-center relative">
         <span className="absolute top-1 left-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest z-10">Ostatnie 7 dni</span>
         <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="stroke-gray-200 dark:stroke-slate-700" />
               <XAxis dataKey="date" tick={{fontSize: 9, fill: '#9ca3af'}} axisLine={false} tickLine={false} interval="preserveStartEnd" />
               <YAxis tick={{fontSize: 9, fill: '#9ca3af'}} axisLine={false} tickLine={false} allowDecimals={false} />
               <Tooltip 
                    contentStyle={{ borderRadius: '4px', fontSize: '11px', padding: '4px', backgroundColor: '#fff', border: 'none' }}
                    itemStyle={{ padding: 0 }}
               />
               <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{r: 2}} name="Wszystkie" />
               <Line type="monotone" dataKey="arrived" stroke="#10b981" strokeWidth={2} dot={{r: 2}} name="Przybyło" />
               <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} dot={{r: 2}} name="Oczekuje" />
            </LineChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
};

interface StatRowProps {
    label: string;
    subLabel: string;
    stats: { total: number; pending: number; onSite: number; completed: number };
    colorTheme: 'blue' | 'emerald';
}

const StatRow: React.FC<StatRowProps> = ({ label, subLabel, stats, colorTheme }) => {
    const themeClasses = colorTheme === 'blue' 
        ? { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50/50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-900', icon: 'text-blue-500' }
        : { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-900', icon: 'text-emerald-500' };

    return (
        <div className="flex items-stretch h-full">
            <div className={`w-36 shrink-0 flex flex-col justify-center items-center ${themeClasses.bg} border-r border-gray-100 dark:border-slate-700`}>
                <span className={`font-bold text-xs ${themeClasses.text} uppercase tracking-wider`}>{label}</span>
                <span className="text-[9px] text-gray-400 font-medium">{subLabel}</span>
            </div>
            <div className="flex-grow flex items-center justify-between px-4 lg:px-8">
                <StatItem value={stats.pending} label="OCZEKUJE" icon={<svg className="w-3 h-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatItem value={stats.onSite} label="NA PLACU" isLive={stats.onSite > 0} icon={<svg className={`w-3 h-3 ${themeClasses.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
                <StatItem value={stats.completed} label="ZAKOŃCZONE" icon={<svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} />
                <StatItem value={stats.total} label="WSZYSTKIE" icon={<svg className="w-3 h-3 text-gray-500 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} />
            </div>
        </div>
    );
};

const StatItem = ({ value, label, icon, isLive }: { value: number, label: string, icon: React.ReactNode, isLive?: boolean }) => (
    <div className="flex flex-col items-center justify-center w-16 lg:w-20">
        <div className="flex items-center gap-1.5 mb-0.5">
             <span className={`text-sm lg:text-base font-bold ${value === 0 ? 'text-gray-300 dark:text-slate-600' : 'text-slate-700 dark:text-slate-200'}`}>{value}</span>
             <div className={`${isLive ? 'animate-pulse' : ''}`}>{icon}</div>
        </div>
        <span className="text-[8px] lg:text-[9px] uppercase font-bold text-gray-400 tracking-wide text-center leading-none">{label}</span>
    </div>
);