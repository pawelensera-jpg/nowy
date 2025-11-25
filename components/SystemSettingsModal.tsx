
import React, { useState, useEffect } from 'react';
import { getDebugInfo } from '../services/sharepointService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentDuration: number;
  blockedGates: string[];
  onSave: (duration: number, blockedGates: string[]) => void;
}

const GATES = [
  { id: 'Brama W1', label: 'Brama W1 (Kurier)' },
  { id: 'Brama W3', label: 'Brama W3 (Załadunek)' },
  { id: 'Brama W4', label: 'Brama W4 (Załadunek)' },
  { id: 'Brama W5', label: 'Brama W5 (Rozładunek)' },
  { id: 'Brama W6', label: 'Brama W6 (Rozładunek)' },
  { id: 'Brama W7', label: 'Brama W7 (Rozładunek)' },
  { id: 'Brama W8', label: 'Brama W8 (Rozładunek)' },
];

export const SystemSettingsModal: React.FC<Props> = ({ isOpen, onClose, currentDuration, blockedGates, onSave }) => {
  const [duration, setDuration] = useState(currentDuration);
  const [blocked, setBlocked] = useState<string[]>(blockedGates);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
        setDuration(currentDuration);
        setBlocked(blockedGates);
        setDebugInfo(getDebugInfo());
    }
  }, [isOpen, currentDuration, blockedGates]);

  if (!isOpen) return null;

  const toggleGate = (gateId: string) => {
    setBlocked(prev => 
      prev.includes(gateId) 
        ? prev.filter(id => id !== gateId) 
        : [...prev, gateId]
    );
  };

  const handleSave = () => {
    onSave(duration, blocked);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        <div className="bg-sky-800 px-4 py-3 flex justify-between items-center text-white shrink-0">
          <h3 className="font-bold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Ustawienia Systemu
          </h3>
          <button onClick={onClose} className="hover:bg-sky-700 rounded p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-4 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration Setting */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Domyślne Okno Czasowe (min)</label>
              <div className="flex items-center gap-4">
                  <input 
                      type="range" 
                      min="15" 
                      max="180" 
                      step="15" 
                      value={duration} 
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded border border-sky-100 min-w-[3rem] text-center">
                      {duration}m
                  </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Czas trwania przypisywany nowym awizacjom.</p>
            </div>

            {/* Gate Blocking */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Widoczność Bram (Blokowanie)</label>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto custom-scrollbar border border-gray-100 rounded p-2 bg-gray-50">
                  {GATES.map(gate => (
                      <label key={gate.id} className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 cursor-pointer transition-colors">
                          <input 
                              type="checkbox" 
                              checked={!blocked.includes(gate.id)} 
                              onChange={() => toggleGate(gate.id)}
                              className="w-4 h-4 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
                          />
                          <span className={`text-sm ${blocked.includes(gate.id) ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                              {gate.label}
                          </span>
                          {blocked.includes(gate.id) && <span className="text-[10px] text-red-500 font-bold ml-auto">BLOKADA</span>}
                      </label>
                  ))}
              </div>
            </div>
          </div>
          
          {/* DEBUG SECTION */}
          <div className="border-t border-gray-200 pt-4 mt-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                Diagnostyka API Power Automate
            </h4>
            <div className="bg-slate-900 rounded-md p-3 text-xs font-mono text-green-400 overflow-hidden">
                <div className="flex justify-between mb-2 border-b border-gray-700 pb-2">
                    <span>Ostatnia Próba: {debugInfo?.timestamp?.toLocaleTimeString() || "Brak"}</span>
                    <span className={debugInfo?.success ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                        {debugInfo?.success ? "POŁĄCZONO" : "BŁĄD"}
                    </span>
                </div>
                {debugInfo?.error && (
                    <div className="text-red-400 mb-2 font-bold">Error: {debugInfo.error}</div>
                )}
                <div className="mb-1 text-gray-400">Pobrano elementów: <span className="text-white">{debugInfo?.rawCount || 0}</span></div>
                <div className="text-gray-500 mb-1">Surowa Odpowiedź (pierwsze 2000 znaków):</div>
                <div className="bg-black/50 p-2 rounded max-h-40 overflow-auto whitespace-pre-wrap break-all text-[10px] text-gray-300">
                    {debugInfo?.rawResponseSnippet || "Brak danych z API."}
                </div>
            </div>
          </div>

        </div>

        <div className="bg-gray-50 px-4 py-3 flex justify-end gap-2 border-t border-gray-200 shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded">Anuluj</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-sky-600 text-white hover:bg-sky-700 rounded font-bold shadow-sm">Zapisz Ustawienia</button>
        </div>
      </div>
    </div>
  );
};
