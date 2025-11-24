import React from 'react';
import { DeliveryItem, DeliveryStatus } from '../types';

interface Props {
  delivery: DeliveryItem;
}

export const DeliveryCard: React.FC<Props> = ({ delivery }) => {
  const isOut = delivery.status === DeliveryStatus.COMPLETED;
  
  // Ensure isArrived is false if status is OUT, even if the boolean flag is true
  const isArrived = !isOut && (delivery.status === DeliveryStatus.ARRIVED || delivery.isArrived);
  
  // Format arrival time if available
  const arrivalTime = delivery.arrivalTimestamp 
    ? new Date(delivery.arrivalTimestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    : null;

  // Determine styles and labels based on status
  // Default: Pending (Blue gradient as requested)
  let statusLabel = 'OCZEKUJE';
  let statusClass = 'bg-white/80 text-sky-700 border-sky-200 backdrop-blur-sm';
  let cardClass = 'bg-gradient-to-br from-white to-sky-100 border-sky-200 shadow-sm hover:shadow-md';
  let borderClass = 'bg-sky-500';
  let textClass = 'text-slate-700';
  let iconClass = 'text-sky-600';

  if (isOut) {
    statusLabel = 'OUT';
    statusClass = 'bg-white/50 text-gray-600 border-gray-300';
    cardClass = 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 shadow-sm opacity-75 grayscale-[0.3]';
    borderClass = 'bg-gray-500';
    textClass = 'text-gray-600';
    iconClass = 'text-gray-500';
  } else if (isArrived) {
    statusLabel = 'NA PLACU';
    statusClass = 'bg-white/80 text-emerald-700 border-emerald-200 backdrop-blur-sm';
    cardClass = 'bg-gradient-to-br from-white to-emerald-200 border-emerald-300 shadow-md ring-1 ring-emerald-400/20';
    borderClass = 'bg-emerald-600';
    textClass = 'text-emerald-900';
    iconClass = 'text-emerald-700';
  }

  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl border transition-all duration-300 transform hover:-translate-y-1
        ${cardClass}
      `}
    >
      {/* Pasek statusu po lewej */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${borderClass}`}></div>

      <div className="p-5 pl-7">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="bg-white/90 text-gray-700 text-xs font-mono font-bold px-2 py-1 rounded border border-gray-200 shadow-sm">
                {delivery.time}
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full border shadow-sm ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
            
            {/* Added Arrival Time Display */}
            {isArrived && arrivalTime && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 ml-1 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Wejście: {arrivalTime}</span>
              </div>
            )}
            
            {isOut && arrivalTime && (
              <div className="flex items-center gap-1 text-[11px] text-gray-500 ml-1">
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
            <span className="font-mono font-semibold bg-white/60 px-2 py-0.5 rounded text-sm border border-black/5 shadow-sm">
              {delivery.plateNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Tło ikona (ozdobnik) */}
      <div className="absolute -bottom-4 -right-4 opacity-[0.07]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="currentColor" viewBox="0 0 24 24">
           <path d="M19 17H22V15H19M22 13V11H20V6H9V17H4V15H3C1.89 15 1 14.1 1 13V6C1 4.89 1.89 4 3 4H17L22 9V13Z" />
        </svg>
      </div>
    </div>
  );
};