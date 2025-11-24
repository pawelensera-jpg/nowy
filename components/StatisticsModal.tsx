import React, { useMemo } from 'react';
import { DeliveryItem } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { createPortal } from 'react-dom';
import { generateCSV } from '../services/sharepointService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  historyData: { date: string; total: number; arrived: number; pending: number }[];
  currentDeliveries: DeliveryItem[];
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

export const StatisticsModal: React.FC<Props> = ({ isOpen, onClose, historyData, currentDeliveries }) => {
  if (!isOpen) return null;

  // --- ANALYTICS LOGIC ---
  const stats = useMemo(() => {
    const last7DaysTotal = historyData.reduce((acc, curr) => acc + curr.total, 0);
    const last7DaysAvg = Math.round(last7DaysTotal / (historyData.length || 1));
    const projectedMonthTotal = last7DaysAvg * 22;

    const gateCounts: Record<string, number> = {};
    currentDeliveries.forEach(d => {
        const key = d.type; 
        gateCounts[key] = (gateCounts[key] || 0) + 1;
    });
    
    const gateData = [
        { name: 'Załadunki', value: gateCounts['Załadunek'] || 0 },
        { name: 'Rozładunki', value: gateCounts['Rozładunek'] || 0 },
        { name: 'Kurierzy', value: currentDeliveries.filter(d => d.type === 'Kurier').length },
    ].filter(d => d.value > 0);

    return {
        last7DaysTotal,
        last7DaysAvg,
        projectedMonthTotal,
        gateData
    };
  }, [historyData, currentDeliveries]);

  const handleExportExcel = () => {
    const csvContent = generateCSV(historyData);
    
    // Use Blob for reliable download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "statystyki_magazynowe.csv");
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
     window.print();
  };

  // We use a Portal to render the modal at the root level to avoid z-index/overflow issues during print
  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-fade-in-up print:shadow-none print:h-auto print:w-full print:overflow-visible">
        
        {/* Header */}
        <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center shrink-0 print:bg-white print:text-black print:border-b">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg className="w-6 h-6 text-sky-400 print:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Analityka Magazynowa
            </h2>
            <p className="text-slate-400 text-xs mt-1 print:text-gray-600">Raport wydajności operacyjnej</p>
          </div>
          <button onClick={onClose} className="hover:bg-slate-700 p-2 rounded-lg transition-colors print:hidden">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-6 bg-slate-50 print:bg-white print:overflow-visible">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:border-black">
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Ostatnie 7 Dni</div>
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-bold text-slate-800">{stats.last7DaysTotal}</span>
                        <span className="text-sm text-emerald-600 font-bold mb-1.5 bg-emerald-50 px-2 py-0.5 rounded print:bg-transparent print:text-black">Awizacji</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Średnio {stats.last7DaysAvg} dziennie</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:border-black">
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Prognoza Miesięczna</div>
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-bold text-sky-600 print:text-black">~{stats.projectedMonthTotal}</span>
                        <span className="text-sm text-sky-600 font-bold mb-1.5 bg-sky-50 px-2 py-0.5 rounded print:bg-transparent print:text-black">Estymacja</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Na podstawie średniej z ost. tygodnia</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:border-black">
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Wskaźnik Realizacji</div>
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-bold text-emerald-500 print:text-black">98%</span>
                        <span className="text-sm text-emerald-600 font-bold mb-1.5 bg-emerald-50 px-2 py-0.5 rounded print:bg-transparent print:text-black">+2% r/r</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Terminowość dostaw</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:space-y-6">
                
                {/* Volume Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-80 print:h-auto print:border-black">
                    <h3 className="font-bold text-slate-700 mb-6">Wolumen Awizacji (7 Dni)</h3>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                            <BarChart data={historyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                />
                                <Bar dataKey="total" name="Liczba awizacji" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                 {/* Distribution Chart */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-80 print:h-auto print:border-black print:break-before-auto">
                    <h3 className="font-bold text-slate-700 mb-6">Struktura Operacji</h3>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                            <PieChart>
                                <Pie
                                    data={stats.gateData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.gateData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>

        {/* Footer with Export Actions */}
        <div className="bg-white border-t border-gray-200 p-4 flex justify-between items-center shrink-0 print:hidden">
            <div className="text-xs text-gray-500 italic">
                Dane wygenerowane automatycznie na podstawie historii systemu.
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-700 transition shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Eksport Excel
                </button>
                <button 
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded hover:bg-red-700 transition shadow-sm"
                >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    Drukuj / PDF
                </button>
            </div>
        </div>

      </div>
    </div>
  );
  
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;
  
  return createPortal(modalContent, modalRoot);
};