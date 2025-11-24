import React, { useState, useEffect, useRef } from 'react';
import { DeliveryItem, DeliveryStatus } from '../types';

interface Props {
  deliveries: DeliveryItem[];
  onDeliveryUpdate?: (item: DeliveryItem) => void;
  onDeliveryClick?: (item: DeliveryItem) => void;
  viewMode: 'day' | 'week';
  currentDate: Date;
  blockedGates?: string[];
}

// --- ICONS ---
const RampIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 15h6" />
  </svg>
);

const DrivewayIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const CourierIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const TruckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
     <path d="M19 17H22V15H19M22 13V11H20V6H9V17H4V15H3C1.89 15 1 14.1 1 13V6C1 4.89 1.89 4 3 4H17L22 9V13Z" />
  </svg>
);

// --- CONFIGURATION ---
const GATES_CONFIG = [
  { id: 'Brama W1', type: 'Kurier', isRamp: false, section: 'Kurierzy', icon: CourierIcon, colorBg: 'bg-indigo-50/50', colorHeader: 'bg-indigo-500', colorEvent: 'bg-indigo-500' },
  { id: 'Brama W3', type: 'Załadunek', isRamp: true, section: 'Załadunki', icon: RampIcon, colorBg: 'bg-blue-50', colorHeader: 'bg-blue-600', colorEvent: 'bg-blue-600' },
  { id: 'Brama W4', type: 'Załadunek', isRamp: false, section: null, icon: DrivewayIcon, colorBg: 'bg-gray-50', colorHeader: 'bg-slate-400', colorEvent: 'bg-blue-500' },
  { id: 'Brama W5', type: 'Rozładunek', isRamp: true, section: 'Rozładunki', icon: RampIcon, colorBg: 'bg-emerald-50', colorHeader: 'bg-emerald-600', colorEvent: 'bg-emerald-600' },
  { id: 'Brama W6', type: 'Rozładunek', isRamp: false, section: null, icon: DrivewayIcon, colorBg: 'bg-gray-50', colorHeader: 'bg-slate-400', colorEvent: 'bg-emerald-500' },
  { id: 'Brama W7', type: 'Rozładunek', isRamp: false, section: null, icon: DrivewayIcon, colorBg: 'bg-gray-50', colorHeader: 'bg-slate-400', colorEvent: 'bg-emerald-500' },
  { id: 'Brama W8', type: 'Rozładunek', isRamp: true, section: null, icon: RampIcon, colorBg: 'bg-emerald-50', colorHeader: 'bg-emerald-600', colorEvent: 'bg-emerald-600' }, 
];

const START_HOUR = 6;
const END_HOUR = 22; 
const TOTAL_HOURS = END_HOUR - START_HOUR + 1;

export const TimelineView: React.FC<Props> = ({ deliveries, onDeliveryUpdate, onDeliveryClick, viewMode, currentDate, blockedGates = [] }) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute for the red line
    return () => clearInterval(timer);
  }, []);

  // Filter gates
  const activeGateIds = new Set(deliveries.map(d => d.rampId));
  const visibleGates = GATES_CONFIG.filter(g => {
      if (blockedGates.includes(g.id)) return false;
      if (!activeGateIds.has(g.id)) return false;
      return true;
  });

  // --- DAY VIEW HELPERS ---
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  // Return style in Percentages to fill screen
  const getPositionStyle = (timeStr: string, duration: number) => {
    const [h, m] = timeStr.split(':').map(Number);
    let effectiveH = h;
    if (h < START_HOUR) effectiveH = START_HOUR;
    
    // Percentage from start of day (06:00)
    const minutesFromStart = (effectiveH - START_HOUR) * 60 + m;
    const totalMinutesAvailable = TOTAL_HOURS * 60;
    
    const leftPercent = (minutesFromStart / totalMinutesAvailable) * 100;
    const widthPercent = (duration / totalMinutesAvailable) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`
    };
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, gateId: string) => {
    e.preventDefault();
    if (!draggedId || !onDeliveryUpdate) return;

    // Calculate time based on percentage of container width
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    
    // Map percentage to hours
    const rawHour = START_HOUR + (percentage * TOTAL_HOURS);
    
    // Snap to nearest 15 mins (0.25 hour)
    const snappedTime = Math.round(rawHour * 4) / 4;
    
    const h = Math.floor(snappedTime);
    const m = Math.round((snappedTime - h) * 60);

    // Boundary Check
    if (h < START_HOUR || h > END_HOUR) return;

    const formattedTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    const originalItem = deliveries.find(d => d.id === draggedId);
    if (!originalItem) return;

    const updatedItem = { ...originalItem };
    updatedItem.rampId = gateId;
    updatedItem.time = formattedTime;
    
    const newDate = new Date(updatedItem.datetime);
    newDate.setHours(h);
    newDate.setMinutes(m);
    updatedItem.datetime = newDate;

    // Enforce ID Rules
    const cleanId = updatedItem.originalId.replace(/[^0-9]/g, '');
    const idNum = parseInt(cleanId);
    if (!isNaN(idNum)) {
        if (idNum >= 2800) {
            updatedItem.type = 'Załadunek';
        } else {
            updatedItem.type = 'Rozładunek';
        }
    }

    onDeliveryUpdate(updatedItem);
    setDraggedId(null);
  };

  // --- WEEK VIEW HELPERS ---
  const getWeekDays = (baseDate: Date) => {
    const days = [];
    const currentDay = baseDate.getDay(); 
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + distanceToMonday);

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  const handleClick = (e: React.MouseEvent, delivery: DeliveryItem) => {
    e.stopPropagation();
    if (onDeliveryClick) {
        onDeliveryClick(delivery);
    }
  };

  // --- CURRENT TIME LINE ---
  const isToday = currentDate.toDateString() === new Date().toDateString();
  const currentHourDecimal = currentTime.getHours() + (currentTime.getMinutes() / 60);
  const showTimeLine = isToday && viewMode === 'day' && currentHourDecimal >= START_HOUR && currentHourDecimal <= END_HOUR + 1;
  const timeLineLeftPercent = showTimeLine ? ((currentHourDecimal - START_HOUR) / TOTAL_HOURS) * 100 : 0;


  // --- RENDER ---
  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden shadow-sm border border-gray-300 rounded">
      
      {/* HEADER */}
      <div className="flex border-b border-gray-300 bg-gray-100 sticky top-0 z-10">
        <div className="w-32 flex-shrink-0 bg-gray-200 border-r border-gray-300 flex items-center justify-center text-xs font-bold text-gray-500 py-2">
           Brama / {viewMode === 'day' ? 'Godziny' : 'Dni'}
        </div> 
        <div className="flex-grow flex">
          {viewMode === 'day' ? (
             // DAY VIEW HOURS - FLEX-1 to fill space
             hours.map((hour) => (
                <div 
                  key={hour} 
                  className="flex-1 border-r border-gray-300 flex items-center justify-center text-xs font-semibold text-gray-500 last:border-r-0"
                >
                  {hour}:00
                </div>
              ))
          ) : (
             // WEEK VIEW DAYS
             weekDays.map((day) => {
                const isSelected = day.getDate() === currentDate.getDate();
                return (
                 <div key={day.toISOString()} className={`flex-1 border-r border-gray-300 flex flex-col items-center justify-center py-1 text-xs font-semibold ${isSelected ? 'bg-sky-50 text-sky-700' : 'text-gray-500'}`}>
                    <span>{day.toLocaleDateString('pl-PL', { weekday: 'short' })}</span>
                    <span className="text-[10px] opacity-75">{day.getDate()}</span>
                 </div>
                );
             })
          )}
        </div>
      </div>

      {/* ROWS */}
      {/* Added key={viewMode} to trigger fade animation on view switch */}
      <div key={viewMode} className="flex-grow overflow-y-auto relative custom-scrollbar animate-fade-in">
        {/* DAY VIEW BACKGROUND GRID */}
        {viewMode === 'day' && (
             <div className="absolute inset-0 z-0 pointer-events-none flex pl-32">
                {hours.map((hour) => (
                    <div 
                    key={`grid-${hour}`} 
                    className="flex-1 h-full border-r border-gray-200 border-dashed last:border-r-0"
                    ></div>
                ))}
            </div>
        )}

        {/* CURRENT TIME LINE (RED) */}
        {showTimeLine && (
            <div 
                className="absolute top-0 bottom-0 z-20 border-l-2 border-red-500 pointer-events-none ml-32"
                style={{ left: `${timeLineLeftPercent}%` }}
            >
                <div className="bg-red-500 text-white text-[9px] font-bold px-1 rounded-sm absolute -top-1 -left-1/2 transform -translate-x-[2px]">
                    {currentTime.toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>
        )}


        {visibleGates.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
                Brak awizacji przypisanych do bram na ten dzień. <br/>
                (Puste bramy są ukryte)
            </div>
        )}

        {visibleGates.map((gate, index) => {
          const gateDeliveries = deliveries.filter(d => d.rampId === gate.id);
          
          return (
            <React.Fragment key={gate.id}>
              {/* Section Header Separator */}
              {gate.section && (
                <div className={`sticky left-0 right-0 bg-gray-50 border-y border-gray-200 py-1 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest z-10 shadow-sm ${index > 0 ? 'mt-4' : ''}`}>
                  {gate.section}
                </div>
              )}

              <div className="relative z-0 flex border-b border-gray-200 min-h-[90px]">
                {/* Gate Header Column */}
                <div className={`w-32 flex-shrink-0 border-r border-gray-200 flex flex-col items-center justify-center p-2 ${gate.isRamp ? 'bg-white' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-center gap-2 mb-1 w-full">
                    <div className="text-gray-400 flex-shrink-0">
                      <gate.icon className="w-5 h-5" />
                    </div>
                    <div className={`px-2 py-1 rounded text-white text-xs font-bold shadow-sm text-center ${gate.colorHeader}`}>
                      {gate.id}
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium uppercase flex flex-col items-center">
                     <span>{gate.type}</span>
                     <span className={`text-[9px] px-1.5 rounded mt-0.5 border ${gate.isRamp ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-200 text-gray-600 border-gray-300'}`}>
                        {gate.isRamp ? 'RAMPA' : 'PODJAZD'}
                     </span>
                  </div>
                </div>
                
                {/* CONTENT TRACK */}
                <div 
                    className={`flex-grow relative flex ${gate.colorBg} overflow-hidden`}
                    onDragOver={viewMode === 'day' ? handleDragOver : undefined}
                    onDrop={viewMode === 'day' ? (e) => handleDrop(e, gate.id) : undefined}
                >
                   {viewMode === 'day' ? (
                       // --- DAY VIEW ITEMS ---
                       gateDeliveries.map(delivery => {
                          const isOut = delivery.status === DeliveryStatus.COMPLETED;
                          // Should be Arrived status AND not completed/Out
                          const isArrived = delivery.status === DeliveryStatus.ARRIVED || (delivery.isArrived && !isOut); 
                          const isPending = delivery.status === DeliveryStatus.PENDING || (!delivery.isArrived && !isOut);

                          const arrivalTime = delivery.arrivalTimestamp 
                            ? new Date(delivery.arrivalTimestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
                            : null;

                          return (
                            <div
                              key={delivery.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, delivery.id)}
                              onClick={(e) => handleClick(e, delivery)}
                              className={`
                                absolute top-2 h-[74px] rounded shadow-sm border border-white/20 p-2 overflow-hidden hover:shadow-md transition-all cursor-pointer 
                                text-white group ring-1 ring-black/5 hover:scale-[1.01] z-10
                                ${isOut ? 'bg-gray-400 opacity-70 grayscale' : gate.colorEvent}
                                ${draggedId === delivery.id ? 'opacity-50' : ''}
                              `}
                              style={getPositionStyle(delivery.time, delivery.duration)}
                              title={`Kliknij aby edytować: ${delivery.companyName}`}
                            >
                                <div className="flex justify-between items-start mb-0.5">
                                  <span className="text-[10px] bg-black/20 px-1.5 rounded font-mono font-bold tracking-tight">
                                    {delivery.time}
                                  </span>
                                  {/* STATUS CIRCLE INDICATOR */}
                                  <div className={`w-3 h-3 rounded-full border border-black/10 shadow-sm ml-1 shrink-0 ${
                                      isOut ? 'bg-neutral-900' : 
                                      isArrived ? 'bg-emerald-400' : 
                                      'bg-white'
                                  }`} title={isOut ? "OUT" : isArrived ? "NA PLACU" : "OCZEKUJE"}></div>
                                </div>
                                {/* ID removed from display here */}
                                <div className="font-bold text-sm leading-tight mb-1 mt-1 truncate" title={delivery.companyName}>
                                    {delivery.companyName}
                                </div>
                                <div className="flex items-center gap-1 bg-black/10 rounded px-1 py-0.5 w-fit max-w-full">
                                   <TruckIcon className="w-3 h-3 shrink-0 opacity-80" />
                                   <span className="text-[10px] font-mono truncate">{delivery.plateNumber}</span>
                                </div>
                                {isArrived && (
                                  <div className="absolute bottom-1 right-1 flex flex-col items-end">
                                    {arrivalTime && (
                                      <div className="bg-black/30 text-white text-[8px] px-1 rounded backdrop-blur-sm">
                                         Wejście: {arrivalTime}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {isOut && (
                                  <div className="absolute bottom-1 right-1 bg-gray-600 text-white text-[9px] px-2 py-0.5 rounded font-bold shadow-sm">
                                     OUT
                                  </div>
                                )}
                            </div>
                          );
                       })
                   ) : (
                       // --- WEEK VIEW ITEMS (Simplified Columns) ---
                       weekDays.map((day) => {
                         const isSameDay = day.getDate() === currentDate.getDate() && day.getMonth() === currentDate.getMonth();
                         const dayDeliveries = isSameDay ? gateDeliveries : []; 
                         
                         return (
                             <div key={day.toISOString()} className="flex-1 border-r border-gray-200 flex flex-col p-1 gap-1">
                                 {dayDeliveries.map(d => (
                                     <div key={d.id} className={`text-[9px] p-1 rounded text-white truncate ${gate.colorEvent}`}>
                                         {d.time} {d.companyName}
                                     </div>
                                 ))}
                                 {!isSameDay && <div className="text-[9px] text-gray-300 text-center mt-2">-</div>}
                             </div>
                         )
                       })
                   )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      
      {/* LEGEND */}
      <div className="bg-white border-t border-gray-300 p-2 flex flex-wrap gap-4 text-xs shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20">
         <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
             <span className="font-bold text-gray-700">Legenda Stref:</span>
             <div className="flex items-center gap-1">
                 <div className="w-3 h-3 bg-indigo-600 rounded-sm"></div>
                 <span>Kurier (W1)</span>
             </div>
             <div className="flex items-center gap-1">
                 <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                 <span>Załadunek (W3, W4)</span>
             </div>
             <div className="flex items-center gap-1">
                 <div className="w-3 h-3 bg-emerald-600 rounded-sm"></div>
                 <span>Rozładunek (W5-W8)</span>
             </div>
             <div className="flex items-center gap-1">
                 <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
                 <span>Wyjechał (OUT)</span>
             </div>
         </div>
         <div className="flex items-center gap-2">
             <span className="font-bold text-gray-700">Typy Stanowisk:</span>
             <div className="flex items-center gap-1 text-gray-500">
               <RampIcon className="w-4 h-4" />
               <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 rounded text-[10px]">RAMPA</span>
             </div>
             <div className="flex items-center gap-1 text-gray-500">
               <DrivewayIcon className="w-4 h-4" />
               <span className="bg-gray-200 text-gray-600 border border-gray-300 px-1.5 rounded text-[10px]">PODJAZD</span>
             </div>
         </div>
      </div>
    </div>
  );
};