
import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => void;
}

export const AdminLoginModal: React.FC<Props> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple check - in production use env vars or backend auth
    if (password === 'admin123' || password === 'steripack') {
        onLogin(password);
        setPassword('');
        setError(false);
        onClose();
    } else {
        setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 w-80 animate-fade-in-up border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Logowanie Admina
        </h3>
        <form onSubmit={handleSubmit}>
            <input 
                type="password" 
                placeholder="Hasło administratora"
                className={`w-full border rounded px-3 py-2 mb-3 text-sm dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 dark:border-slate-600 focus:ring-sky-200'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
            />
            {error && <p className="text-xs text-red-500 mb-3">Nieprawidłowe hasło.</p>}
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-1">Anuluj</button>
                <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold px-4 py-2 rounded transition-colors">Zaloguj</button>
            </div>
        </form>
      </div>
    </div>
  );
};
