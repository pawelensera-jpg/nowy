
import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'rules' | 'permissions' | 'process' | 'faq';

export const KnowledgeBaseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('rules');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-gray-50 w-full max-w-5xl h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden animate-fade-in-up ring-1 ring-slate-900/5">
        
        {/* HEADER - Dark Blue Theme */}
        <div className="bg-[#0f172a] px-6 py-5 text-white flex justify-between items-center shrink-0 shadow-md relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-70"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner border border-blue-500">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
                <h2 className="text-xl font-bold tracking-tight leading-none">Centrum Wiedzy Ensera</h2>
                <p className="text-[10px] text-slate-400 font-mono mt-1 tracking-wider uppercase">Instrukcja i Zasady Systemowe V2.0</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* TABS NAVIGATION */}
        <div className="bg-white border-b border-gray-200 flex px-4 shadow-sm shrink-0 overflow-x-auto">
            <TabButton 
                active={activeTab === 'rules'} 
                onClick={() => setActiveTab('rules')} 
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                label="Zasady i Infrastruktura" 
            />
            <TabButton 
                active={activeTab === 'permissions'} 
                onClick={() => setActiveTab('permissions')} 
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                label="Uprawnienia" 
            />
            <TabButton 
                active={activeTab === 'process'} 
                onClick={() => setActiveTab('process')} 
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                label="Proces Obsługi" 
            />
            <TabButton 
                active={activeTab === 'faq'} 
                onClick={() => setActiveTab('faq')} 
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                label="Pomoc / FAQ" 
            />
        </div>

        {/* CONTENT AREA */}
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar bg-[#f8fafc]">
            
            {activeTab === 'faq' && (
                <div className="space-y-4 max-w-3xl mx-auto">
                    <FaqItem 
                        question="Co zrobić, gdy system blokuje dodanie awizacji?" 
                        isOpen={openFaqIndex === 0} 
                        onClick={() => toggleFaq(0)}
                    >
                        <p>System blokuje dodanie awizacji najczęściej, gdy na wybranej bramie w danym czasie istnieje już inna rezerwacja. Spróbuj wybrać inną bramę (np. W6 lub W7 dla rozładunków) lub przesuń godzinę awizacji o min. 90 minut. Możesz również skorzystać z funkcji "Drag & Drop", aby system sam znalazł najbliższy wolny slot.</p>
                    </FaqItem>
                    
                    <FaqItem 
                        question="Jak edytować błędny numer rejestracyjny po wjeździe auta?" 
                        isOpen={openFaqIndex === 1} 
                        onClick={() => toggleFaq(1)}
                    >
                        <p>Nawet jeśli auto ma status "Na Placu", możesz edytować jego dane. Kliknij dwukrotnie na kafelek awizacji, popraw numer w polu "Rejestracja" i kliknij "Zapisz Zmiany". Historia zmian zostanie odnotowana w systemie.</p>
                    </FaqItem>

                    <FaqItem 
                        question="Dlaczego nie widzę przycisku 'Usuń'?" 
                        isOpen={openFaqIndex === 2} 
                        onClick={() => toggleFaq(2)}
                    >
                        <p>Przycisk usuwania jest dostępny tylko dla użytkowników z uprawnieniami Administratora. Jeśli jesteś zalogowany jako "Gość" lub standardowy użytkownik, możesz jedynie zmieniać statusy. Musisz zalogować się jako Admin, aby usunąć wpis.</p>
                    </FaqItem>

                    <FaqItem 
                        question="Jak działa automatyczne przesuwanie (Kolejkowanie)?" 
                        isOpen={openFaqIndex === 3} 
                        onClick={() => toggleFaq(3)}
                    >
                        <p>System dba o to, aby bramy nie były przepełnione. Jeśli przesuniesz awizację na godzinę zajętą przez inne auto, system automatycznie przesunie to drugie auto o 90 minut do przodu. Działa to kaskadowo, więc upewnij się, że nie tworzysz zatoru na koniec dnia.</p>
                    </FaqItem>
                </div>
            )}

            {activeTab === 'rules' && (
                <div className="max-w-4xl mx-auto space-y-8 text-slate-700">
                    
                    {/* 1. Infrastruktura */}
                    <section className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                            1. Infrastruktura i Godziny
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <span className="font-bold text-blue-600 min-w-[100px]">06:00 - 22:00</span>
                                    <span>Godziny pracy magazynu.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-blue-600 min-w-[100px]">06:30 - 20:30</span>
                                    <span>Dostępne okna awizacji.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-blue-600 min-w-[100px]">90 minut</span>
                                    <span>Standardowy czas slotu.</span>
                                </li>
                            </ul>
                            <div className="bg-slate-50 p-3 rounded text-xs border border-slate-100">
                                <strong>Zasada Opóźnień:</strong> Jeśli auto o statusie "Oczekuje" nie pojawi się w wyznaczonym czasie, system oznaczy je pulsującym wskaźnikiem opóźnienia po 15 minutach.
                            </div>
                        </div>
                    </section>

                    {/* 2. Logika Bram */}
                    <section className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                            <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                            2. Automatyzacja Przypisywania Bram
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">System analizuje dane przychodzące z SharePoint i automatycznie kieruje auta do odpowiednich stref:</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="border p-3 rounded-lg bg-indigo-50 border-indigo-100">
                                <div className="text-xs font-bold text-indigo-400 uppercase mb-1">Kurierzy</div>
                                <div className="font-bold text-indigo-800 text-lg">Brama W1</div>
                                <div className="text-[10px] text-indigo-600 mt-1">Słowo klucz: "Kurier"</div>
                            </div>
                            <div className="border p-3 rounded-lg bg-blue-50 border-blue-100">
                                <div className="text-xs font-bold text-blue-400 uppercase mb-1">Załadunki</div>
                                <div className="font-bold text-blue-800 text-lg">Brama W3</div>
                                <div className="text-[10px] text-blue-600 mt-1">ID Awizacji &ge; 2800</div>
                            </div>
                            <div className="border p-3 rounded-lg bg-emerald-50 border-emerald-100">
                                <div className="text-xs font-bold text-emerald-400 uppercase mb-1">Rozładunki</div>
                                <div className="font-bold text-emerald-800 text-lg">Brama W5</div>
                                <div className="text-[10px] text-emerald-600 mt-1">ID Awizacji &lt; 2800</div>
                            </div>
                            <div className="border p-3 rounded-lg bg-amber-50 border-amber-100">
                                <div className="text-xs font-bold text-amber-400 uppercase mb-1">Specjalne</div>
                                <div className="font-bold text-amber-800 text-lg">Brama W8</div>
                                <div className="text-[10px] text-amber-600 mt-1">Celltrion / Alvotech</div>
                            </div>
                        </div>
                    </section>

                    {/* 3. Konflikty */}
                    <section className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                            <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                            3. Zarządzanie Konfliktami
                        </h3>
                        <div className="flex gap-4 items-start bg-amber-50 p-4 rounded-lg border border-amber-100">
                            <div className="shrink-0 mt-1">
                                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900 text-sm">Automatyczne Przesuwanie (90 min)</h4>
                                <p className="text-sm text-amber-800 mt-1">
                                    System nie pozwala na nałożenie się dwóch awizacji na tej samej bramie. Jeśli dodasz awizację w zajętym terminie, system automatycznie przesunie <strong>kolejne auta</strong> o 90 minut do przodu.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 4. Statusy */}
                    <section className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                            <span className="w-1 h-6 bg-slate-800 rounded-full"></span>
                            4. Cykl Życia Awizacji
                        </h3>
                        <div className="relative flex justify-between items-center text-center px-8">
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10"></div>
                            
                            <div className="bg-white p-2">
                                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-xs border border-sky-200 mx-auto mb-2">1</div>
                                <div className="text-xs font-bold text-slate-700">OCZEKUJE</div>
                                <div className="text-[10px] text-slate-400">Planowanie</div>
                            </div>
                            <div className="bg-white p-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-200 mx-auto mb-2">2</div>
                                <div className="text-xs font-bold text-slate-700">NA PLACU</div>
                                <div className="text-[10px] text-slate-400">Realizacja</div>
                            </div>
                            <div className="bg-white p-2">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-300 mx-auto mb-2">3</div>
                                <div className="text-xs font-bold text-slate-700">OUT</div>
                                <div className="text-[10px] text-slate-400">Po 12h</div>
                            </div>
                        </div>
                    </section>

                    {/* 5. Optymalizacja (ADDED) */}
                    <section className="bg-white p-6 rounded-lg shadow-sm border border-green-100 ring-1 ring-green-500/20">
                        <div className="flex items-center gap-3 mb-4 border-b border-green-100 pb-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold border border-green-200">5</div>
                            <h3 className="font-bold text-lg text-slate-800">Optymalizacja i Priorytety Wjazdów</h3>
                        </div>
                        <div className="text-sm text-gray-700 leading-relaxed space-y-3">
                            <p>System wspiera optymalizację czasu pracy magazynu poprzez analizę statusu przybycia:</p>
                            <div className="flex gap-4 items-start bg-green-50/50 p-3 rounded-md">
                                <svg className="w-6 h-6 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <div>
                                    <strong className="block text-green-800 mb-1">Priorytet "Na Placu"</strong>
                                    Jeśli awizacja zaplanowana na późniejszą godzinę (np. 14:00) otrzyma status <strong>Na Placu</strong> (auto przyjechało wcześniej, np. o 12:00), należy podjąć próbę wciśnięcia jej na wcześniejszy wolny termin.
                                    System umożliwia przesunięcie takiego auta przed awizacje o statusie "Oczekuje", aby nie blokować placu i wykorzystać wolne moce przerobowe.
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            )}

            {activeTab === 'permissions' && (
                <div className="max-w-4xl mx-auto space-y-8 text-slate-700">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-slate-800">Poziomy Dostępu</h3>
                        <p className="text-slate-500 mt-2">System rozróżnia dwa poziomy uprawnień użytkowników.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* User Role */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-500">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Użytkownik (Gość)</h4>
                                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">Domyślny</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-3 text-sm text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Podgląd harmonogramu i statystyk
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Wyszukiwanie i filtrowanie
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Zmiana statusu ("Na placu", "Oczekuje")
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Przesuwanie awizacji (Drag & Drop)
                                    </li>
                                    <li className="flex items-start gap-2 opacity-50">
                                        <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        Usuwanie awizacji
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Admin Role */}
                        <div className="bg-white rounded-xl shadow-md border border-blue-200 overflow-hidden ring-2 ring-blue-500/10">
                            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm text-white">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-900">Administrator</h4>
                                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-bold">Pełny dostęp</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-3 text-sm text-slate-700">
                                    <li className="flex items-start gap-2 font-bold text-blue-700">
                                        <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Wszystkie uprawnienia Użytkownika
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Usuwanie błędnych awizacji
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Edycja globalnych ustawień systemu
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Zarządzanie blokadami bram
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Dostęp do diagnostyki API
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'process' && (
                <div className="max-w-3xl mx-auto space-y-6 text-slate-700">
                     <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Proces Obsługi Awizacji</h3>
                        <div className="relative border-l-2 border-slate-200 ml-3 pl-8 py-2 space-y-8">
                            <div className="relative">
                                <span className="absolute -left-[41px] w-6 h-6 rounded-full bg-white border-2 border-slate-300 text-[10px] flex items-center justify-center font-bold text-slate-500">1</span>
                                <h4 className="font-bold text-sm">Rejestracja (SharePoint)</h4>
                                <p className="text-xs text-slate-500 mt-1">Dostawca lub logistyka wprowadza awizację do systemu SharePoint. Dane trafiają do Monitora co 30 sekund.</p>
                            </div>
                            <div className="relative">
                                <span className="absolute -left-[41px] w-6 h-6 rounded-full bg-white border-2 border-blue-500 text-[10px] flex items-center justify-center font-bold text-blue-600">2</span>
                                <h4 className="font-bold text-sm text-blue-700">Przyjazd (Brama)</h4>
                                <p className="text-xs text-slate-500 mt-1">Ochrona weryfikuje nr rejestracyjny. Zmienia status na "Na Placu". Auto kierowane jest pod właściwą bramę (W1-W8).</p>
                            </div>
                            <div className="relative">
                                <span className="absolute -left-[41px] w-6 h-6 rounded-full bg-white border-2 border-green-500 text-[10px] flex items-center justify-center font-bold text-green-600">3</span>
                                <h4 className="font-bold text-sm text-green-700">Wyjazd (Koniec)</h4>
                                <p className="text-xs text-slate-500 mt-1">Po załadunku/rozładunku auto opuszcza teren. Status zmienia się na "OUT" automatycznie lub ręcznie.</p>
                            </div>
                        </div>
                     </div>
                </div>
            )}

        </div>

        {/* FOOTER BANNER */}
        <div className="bg-[#0f172a] p-6 shrink-0 text-white">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h4 className="font-bold text-sm mb-1">Masz problem techniczny?</h4>
                    <p className="text-xs text-slate-400">Skontaktuj się z administratorem systemu lub zgłoś błąd bezpośrednio.</p>
                </div>
                <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors shadow-lg flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Napisz Wiadomość
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 ${active ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
    >
        {icon}
        {label}
    </button>
);

const FaqItem = ({ question, isOpen, onClick, children }: any) => (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden transition-shadow hover:shadow-sm">
        <button 
            onClick={onClick}
            className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-slate-50 text-left transition-colors"
        >
            <span className="font-bold text-sm text-slate-800">{question}</span>
            <svg 
                className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        {isOpen && (
            <div className="px-6 pb-4 text-sm text-slate-600 border-t border-slate-100 bg-slate-50/50">
                <div className="pt-3 leading-relaxed">
                    {children}
                </div>
            </div>
        )}
    </div>
);
