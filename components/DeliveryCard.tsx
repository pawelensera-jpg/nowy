import React from 'react';
import { DeliveryItem, DeliveryStatus } from '../types';

interface Props {
  delivery: DeliveryItem;
}

export const DeliveryCard: React.FC<Props> = ({ delivery }) => {
  const isOut = delivery.status === DeliveryStatus.COMPLETED;
  const isArrived = !isOut && (delivery.status === DeliveryStatus.ARRIVED || delivery.isArrived);
  
  // Check for Delay
  // A delivery is delayed if status is PENDING and current time > delivery time
  // Simple check against current hour/minute
  const now = new Date();
  const isToday = new Date(delivery.datetime).toDateString() === now.toDateString();
  
  let isDelayed = false;
  if (isToday && !isArrived && !isOut) {
      const [h, m] = delivery.time.split(':').map(Number);
      const deliveryTime = new Date();
      deliveryTime.setHours(h, m, 0, 0);
      // Give 15 min buffer
      if (now.getTime() > deliveryTime.getTime() + 15 * 60000) {
          isDelayed = true;
      }
  }

  const arrivalTime = delivery.arrivalTimestamp 
    ? new Date(delivery.arrivalTimestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    : null;

  let statusLabel = 'OCZEKUJE';
  let statusClass = 'bg-white/80 text-sky-700 border-sky-200 dark:bg-slate-700 dark:text-sky-300 dark:border-slate-600 backdrop-blur-sm';
  let cardClass = 'bg-gradient-to-br from-white to-sky-100 dark:from-slate-800 dark:to-slate-700 border-sky-200 dark:border-slate-600 shadow-sm hover:shadow-md';
  let borderClass = 'bg-sky-500';
  let textClass = 'text-slate-700 dark:text-slate-200';
  let iconClass = 'text-sky-600 dark:text-sky-400';

  if (isOut) {
    statusLabel = 'OUT';
    statusClass = 'bg-white/50 text-gray-600 border-gray-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    cardClass = 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-900 dark:to-slate-800 border-gray-300 dark:border-slate-700 shadow-sm opacity-75 grayscale-[0.3]';
    borderClass = 'bg-gray-500';
    textClass = 'text-gray-600 dark:text-slate-500';
    iconClass = 'text-gray-500 dark:text-slate-600';
  } else if (isArrived) {
    statusLabel = 'NA PLACU';
    statusClass = 'bg-white/80 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800 backdrop-blur-sm';
    cardClass = 'bg-gradient-to-br from-white to-emerald-100 dark:from-slate-800 dark:to-emerald-900/20 border-emerald-300 dark:border-emerald-800 shadow-md ring-1 ring-emerald-400/20';
    borderClass = 'bg-emerald-600';
    textClass = 'text-emerald-900 dark:text-emerald-100';
    iconClass = 'text-emerald-700 dark:text-emerald-400';
  } else if (isDelayed) {
      // Delayed override
      statusLabel = 'OPÓŹNIONY';
      statusClass = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800 animate-pulse';
      borderClass = 'bg-red-500';
      cardClass += ' ring-2 ring-red-400 border-red-400';
  }

  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl border transition-all duration-300 transform hover:-translate-y-1
        ${cardClass}
      `}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${borderClass}`}></div>

      <div className="p-5 pl-7">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="bg-white/90 dark:bg-slate-800/90 text-gray-700 dark:text-slate-300 text-xs font-mono font-bold px-2 py-1 rounded border border-gray-200 dark:border-slate-600 shadow-sm">
                {delivery.time}
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full border shadow-sm ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
            
            {isArrived && arrivalTime && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-400 ml-1 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Wejście: {arrivalTime}</span>
              </div>
            )}
            
            {isOut && arrivalTime && (
              <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-500 ml-1">
                <span>Był: {arrivalTime}</span>
              </div>
            )}
          </div>
          
          <span className={`text-xs font-bold uppercase tracking-wider opacity-70 ${textClass}`}>
            {delivery.type}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className={`text-lg font-extrabold truncate ${textClass}`} title={delivery.companyName}>
            {delivery.companyName}
          </h3>
          <div className={`flex items-center gap-2 ${textClass} opacity-90`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a1 1 0 00-1 1v3a1 1 0 001 1h2a1 1 0 001-1V6a3 3 0 10-6 0z" />
            </svg>
            <span className="font-mono font-semibold bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded text-sm border border-black/5 shadow-sm">
              {delivery.plateNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Background Icon */}
      <div className="absolute -bottom-4 -right-4 opacity-[0.07] dark:opacity-[0.05] pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="currentColor" viewBox="0 0 24 24">
           <path d="M19 17H22V15H19M22 13V11H20V6H9V17H4V15H3C1.89 15 1 14.1 1 13V6C1 4.89 1.89 4 3 4H17L22 9V13Z" />
        </svg>
      </div>
      
      {isDelayed && (
          <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
      )}
    </div>
  );
};