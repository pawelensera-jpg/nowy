import { DeliveryItem, DeliveryStatus } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// Valid Gates/Ramps
const GATES = ['Brama W3', 'Brama W4', 'Brama W5', 'Brama W6', 'Brama W7', 'Brama W8'];

// LOCAL STORAGE KEY
const LS_KEY = 'awizacje_monitor_db';

// Helper to load from LocalStorage
const loadFromLocalStorage = (): Map<string, DeliveryItem[]> => {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            const map = new Map<string, DeliveryItem[]>();
            Object.keys(parsed).forEach(key => {
                // Revive dates
                const items = parsed[key].map((item: any) => ({
                    ...item,
                    datetime: new Date(item.datetime)
                }));
                map.set(key, items);
            });
            return map;
        }
    } catch (e) {
        console.error("Failed to load local storage", e);
    }
    return new Map<string, DeliveryItem[]>();
};

// Simple in-memory storage backed by LocalStorage
const MEMORY_DB = loadFromLocalStorage();

// --- SHAREPOINT / POWER AUTOMATE CONFIGURATION ---
// Exact Power Automate URL provided by user
const API_URL = "https://defaultd7fceb3c82d14c3e9005dd73b1169c.aa.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/3a37582136de46128c92f5092092d837/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=193BMkAlv6AXctM72rFkCKaB_Sct38JJuMwkmb6XFmk";

// DEBUG STORE
let lastDebugInfo: {
    success: boolean;
    timestamp: Date | null;
    rawCount: number;
    rawResponseSnippet: string;
    error?: string;
} = {
    success: false,
    timestamp: null,
    rawCount: 0,
    rawResponseSnippet: "Oczekiwanie na pierwsze połączenie...",
};

export const getDebugInfo = () => lastDebugInfo;

const formatDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseSharePointDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  try {
    const cleanStr = dateStr.replace(/,/g, '').replace(/\s+/g, ' ').trim();
    if (cleanStr.includes('T')) {
        const d = new Date(cleanStr);
        if (isNaN(d.getTime())) throw new Error("Invalid ISO Date");
        return d;
    }
    const [datePart, timePart] = cleanStr.split(' ');
    if (!datePart || !timePart) throw new Error("Invalid Format");
    
    // Handle separators . / -
    const dateNodes = datePart.split(/[\/\.-]/).map(Number);
    const timeNodes = timePart.split(':').map(Number);

    if (dateNodes.length === 3 && timeNodes.length >= 2) {
         // Assuming DD/MM/YYYY
         const day = dateNodes[0];
         const month = dateNodes[1] - 1; 
         const year = dateNodes[2];
         const hour = timeNodes[0];
         const minute = timeNodes[1];
         const d = new Date(year, month, day, hour, minute);
         if (!isNaN(d.getTime())) return d;
    }
    return new Date(cleanStr);
  } catch (e) {
    console.warn("Date parsing error for:", dateStr, e);
    return new Date(); 
  }
};

const formatTime = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// --- DATA SNAPSHOT (CLEARED - NO DATA) ---
const SNAPSHOT_DATA: any[] = [];

// --- RETRY HELPER ---
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryFetch = async (url: string, options: RequestInit, retries = 2, backoff = 500): Promise<Response> => {
    try {
        const response = await fetch(url, options);
        // Treat 502/500 as retryable errors
        if (!response.ok && (response.status >= 500 || response.status === 429) && retries > 0) {
            console.warn(`API Error ${response.status}. Retrying... (${retries} left)`);
            throw new Error(response.statusText);
        }
        return response;
    } catch (err) {
        if (retries > 0) {
            await wait(backoff);
            return retryFetch(url, options, retries - 1, backoff * 2);
        }
        throw err;
    }
};

// --- HELPER: Revive Dates from JSON ---
const reviveDate = (item: any): DeliveryItem => {
    return {
        ...item,
        datetime: new Date(item.datetime)
    };
}

// --- HELPER: MAPPER ---
const mapRawToDelivery = (row: any, dateKey: string, defaultDuration: number): DeliveryItem | null => {
      if (!row.identyfikator) return null; 

      let datetime = new Date();
      let timeStr = "00:00";
      
      if (row.awizacja) {
          datetime = parseSharePointDate(row.awizacja);
          timeStr = formatTime(datetime);
      }
      
      const cleanId = row.identyfikator.toString().replace(/[^0-9]/g, '');
      const idNum = parseInt(cleanId);
      
      const isLoading = !isNaN(idNum) && idNum >= 2800;
      const type = isLoading ? 'Załadunek' : 'Rozładunek';

      let plateNumber = '';
      if (row.rejestracja !== null && row.rejestracja !== undefined) {
          plateNumber = String(row.rejestracja).trim();
      }

      let assignedGate = 'Brama W5'; // Default
      const lowerName = (row.nazwa || '').toLowerCase();
      const lowerReg = plateNumber.toLowerCase();

      if (lowerName.includes('kurier') || lowerReg.includes('kurier')) {
          assignedGate = 'Brama W1';
      } else if (isLoading) {
          assignedGate = 'Brama W3'; 
      } else if (lowerName.includes('celltrion') || lowerName.includes('alvotech')) {
          assignedGate = 'Brama W8'; 
      }

      const isArrived = (row.takNie || '').toLowerCase() === 'tak';

      return {
        id: `del-${row.identyfikator}-${dateKey}`, 
        originalId: row.identyfikator,
        datetime: datetime,
        time: timeStr,
        duration: defaultDuration, 
        companyName: row.nazwa || 'Nieznana Firma',
        plateNumber: plateNumber, 
        isArrived: isArrived,
        arrivalTimestamp: isArrived ? new Date().getTime() : undefined,
        createdLocal: row.created,
        type: row.nazwa?.toLowerCase().includes('kurier') ? 'Kurier' : type,
        rampId: assignedGate,
        status: isArrived ? DeliveryStatus.ARRIVED : DeliveryStatus.PENDING
      } as DeliveryItem;
}

export const resolveTimeOverlaps = (items: DeliveryItem[]): DeliveryItem[] => {
    const gateGroups = new Map<string, DeliveryItem[]>();
    items.forEach(item => {
        if (!gateGroups.has(item.rampId)) gateGroups.set(item.rampId, []);
        gateGroups.get(item.rampId)!.push(item);
    });

    const resolvedItems: DeliveryItem[] = [];
    gateGroups.forEach((groupItems) => {
        groupItems.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
        for (let i = 0; i < groupItems.length; i++) {
            // Clone item to avoid mutating original state references
            const current = { ...groupItems[i] };
            if (i > 0) {
                const prev = resolvedItems[resolvedItems.length - 1]; 
                if (prev.rampId === current.rampId) { 
                    const prevTime = new Date(prev.datetime).getTime();
                    const prevEnd = prevTime + (prev.duration * 60000); 
                    const currTime = new Date(current.datetime).getTime();
                    if (currTime < prevEnd) {
                        const newTime = new Date(prevEnd);
                        current.datetime = newTime;
                        current.time = formatTime(newTime);
                    }
                }
            }
            resolvedItems.push(current);
        }
    });
    return resolvedItems.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
};

const syncToSupabase = async (dateKey: string, items: DeliveryItem[]) => {
    // Save to localStorage as backup first
    try {
        MEMORY_DB.set(dateKey, items);
        const obj = Object.fromEntries(MEMORY_DB);
        localStorage.setItem(LS_KEY, JSON.stringify(obj));
    } catch (e) {
        console.error("Failed to save to localStorage", e);
    }

    if (items.length === 0) return;
    try {
        const rowsToUpsert = items.map(item => ({ id: item.id, date_key: dateKey, json_data: item }));
        const { error } = await supabase.from('deliveries').upsert(rowsToUpsert, { onConflict: 'id' });
        if (error && error.code !== '42501') {
             console.error("Supabase Sync Error:", error.message);
        }
    } catch (e) { console.error("Supabase Connection Failed:", e); }
};

// --- MAIN FETCH FUNCTION ---
export const fetchDeliveries = async (targetDate: Date = new Date(), defaultDuration: number = 90): Promise<DeliveryItem[]> => {
  const dateKey = formatDateKey(targetDate);
  
  let rawItems: any[] = [];

  try {
      const url = API_URL;
      console.log(`[API] Próba połączenia z Power Automate (POST): ${url}`);
      
      const response = await retryFetch(url, {
          method: 'POST', 
          credentials: 'omit', 
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({}) 
      });

      if (!response.ok) {
           console.warn(`[API] Błąd HTTP: ${response.status} ${response.statusText}`);
           throw new Error(`Błąd połączenia z Power Automate: ${response.status} ${response.statusText}`);
      }

      const textRaw = await response.text();
      
      lastDebugInfo = {
          success: true,
          timestamp: new Date(),
          rawCount: 0,
          rawResponseSnippet: textRaw.substring(0, 2000)
      };

      const text = textRaw.trim(); 
      let json: any;
      
      try {
          json = JSON.parse(text);
      } catch (parseError: any) {
          console.warn("[API] Ostrzeżenie parsowania JSON:", parseError.message);
          try { 
              const lastArr = text.lastIndexOf(']');
              const lastObj = text.lastIndexOf('}');
              const end = Math.max(lastArr, lastObj);
              if (end > 0) {
                  const cleaned = text.substring(0, end + 1);
                  json = JSON.parse(cleaned);
              } else {
                  throw parseError;
              }
          } 
          catch (retryError: any) { throw new Error(`Krytyczny błąd formatu danych: ${retryError.message}`); }
      }
      
      if (json.d && json.d.results && Array.isArray(json.d.results)) {
          rawItems = json.d.results;
      } else if (json.value && Array.isArray(json.value)) {
          rawItems = json.value;
      } else if (Array.isArray(json)) {
          rawItems = json;
      } else {
          rawItems = json ? [json] : [];
      }

      lastDebugInfo.rawCount = rawItems.length;
      console.log(`🚀 SUKCES! Pobranno ${rawItems.length} elementów.`);

  } catch (e: any) {
      console.warn("API Fetch Failed:", e.message);
      lastDebugInfo = {
          success: false,
          timestamp: new Date(),
          rawCount: 0,
          rawResponseSnippet: "",
          error: e.message
      };
      rawItems = [];
  }

  // Filter for the requested date
  const filteredItems = rawItems.filter(item => {
      const dateStr = item.Awizacja || item.OData__x0032_025_Awizacja || item.awizacja; 
      if (!dateStr) return false;
      const itemDate = parseSharePointDate(dateStr);
      const itemKey = formatDateKey(itemDate);
      return itemKey === dateKey;
  });

  // MAP RAW DATA TO APP MODEL
  const parsedItems = filteredItems.map(item => {
      const id = item.Id || item.identyfikator || item.ID;
      const awizacja = item.Awizacja || item.OData__x0032_025_Awizacja || item.awizacja;
      const nazwa = item.Kierunek_x002f_Nazwa_x0020_Dostawcy || item.Title || item.nazwa;
      
      const rejestracja = item.Numery_x0020_rejestracyjne 
                     || item.Rejestracja 
                     || item.OData__x004e_umery_x0020_rejestracyjne
                     || item.NumeryRejestracyjne
                     || item.NrRejestracyjny
                     || item.Nr_x0020_rejestracyjny
                     || item.rejestracja
                     || "";
      
      const takNie = item.Tak_x002f_Nie || item.Status || item.takNie;
      const created = item.Created || item.created;

      const normalizedRow = {
          identyfikator: id,
          awizacja: awizacja,
          nazwa: nazwa,
          rejestracja: rejestracja,
          takNie: takNie,
          created: created
      };

      return mapRawToDelivery(normalizedRow, dateKey, defaultDuration);
  }).filter((item): item is DeliveryItem => item !== null);

  // LOAD PERSISTED DATA FROM SUPABASE OR LOCALSTORAGE
  let supabaseItems: DeliveryItem[] = [];
  if (isSupabaseConfigured()) {
      try {
          const { data, error } = await supabase.from('deliveries').select('json_data').eq('date_key', dateKey);
          if (data) {
              supabaseItems = data.map((row: any) => row.json_data).map(reviveDate);
          }
      } catch(err) {
          console.warn("Supabase fetch error:", err);
      }
  }

  // Fallback to LocalStorage if Supabase empty or failed, or just merge it in
  const localItems = MEMORY_DB.get(dateKey) || [];

  // MERGE LOGIC: API IS MASTER, BUT LOCAL/SUPABASE EDITS PRESERVED IF ID MATCHES
  // We use a map to hold the best version of each delivery
  const mergedMap = new Map<string, DeliveryItem>();

  // 1. Add LocalStorage items (lowest priority)
  localItems.forEach(i => mergedMap.set(i.id, i));

  // 2. Add Supabase items (medium priority - overwrite local)
  supabaseItems.forEach(i => mergedMap.set(i.id, i));

  // 3. Add API Items (highest priority for fresh structure, but check status/timestamps)
  parsedItems.forEach(apiItem => {
      if (mergedMap.has(apiItem.id)) {
          // If we have a local version, we might want to keep the status if it was manually changed.
          // However, usually API is Source of Truth. 
          // Logic: If API status is different from default, trust API.
          // For now, simple overwrite or overwrite only specific fields.
          // Let's assume user edits (LocalStorage) override API for things like 'isArrived' if user clicked it locally but API isn't updated yet.
          // BUT here, requirement is "API Master".
          mergedMap.set(apiItem.id, apiItem);
      } else {
          mergedMap.set(apiItem.id, apiItem);
      }
  });

  const finalItems = Array.from(mergedMap.values());

  // Resolve Overlaps
  const resolvedItems = resolveTimeOverlaps(finalItems);
  
  // Update Cache
  saveDeliveriesLocal(targetDate, resolvedItems); // This saves to MEMORY_DB and LocalStorage

  return resolvedItems;
};

export const saveDeliveriesLocal = (date: Date, items: DeliveryItem[]) => {
    const dateKey = formatDateKey(date);
    MEMORY_DB.set(dateKey, items);
    // Persist to localStorage
    try {
        const obj = Object.fromEntries(MEMORY_DB);
        localStorage.setItem(LS_KEY, JSON.stringify(obj));
    } catch(e) { console.error("Storage Save Error", e); }

    if (isSupabaseConfigured()) syncToSupabase(dateKey, items);
};

export const simulateLiveUpdate = (currentItems: DeliveryItem[]): DeliveryItem[] => {
  const now = new Date().getTime();
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
  return currentItems.map(item => {
    if (item.isArrived && item.arrivalTimestamp) {
        if (now - item.arrivalTimestamp > TWELVE_HOURS_MS) {
             return { ...item, status: DeliveryStatus.COMPLETED, isArrived: false }; 
        }
    }
    return item;
  });
};

export interface DayStats { date: string; total: number; arrived: number; pending: number; }

export const getHistoryStats = async (baseDate: Date): Promise<DayStats[]> => {
    const stats: DayStats[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() - i);
        const dateKey = formatDateKey(d);
        const dateLabel = d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });

        // Try Local Memory first (fastest)
        let items = MEMORY_DB.get(dateKey) || [];
        
        stats.push({
            date: dateLabel,
            total: items.length,
            arrived: items.filter(item => item.isArrived || item.status === DeliveryStatus.ARRIVED || item.status === DeliveryStatus.COMPLETED).length,
            pending: items.filter(item => !item.isArrived && item.status === DeliveryStatus.PENDING).length
        });
    }
    return stats;
};

export const generateCSV = (historyData: DayStats[]): string => {
    const headers = ['Data', 'Wszystkie', 'Przybyło', 'Oczekuje'];
    const rows = historyData.map(d => [d.date, d.total, d.arrived, d.pending].join(','));
    return [headers.join(','), ...rows].join('\n');
};

export const generateDetailedCSV = (items: DeliveryItem[]): string => {
    const headers = ['Data', 'Godzina', 'Firma', 'Rejestracja', 'Brama', 'Status', 'Typ'];
    const rows = items.map(d => {
        const dateStr = d.datetime instanceof Date ? d.datetime.toLocaleDateString('pl-PL') : '';
        const statusStr = d.status || (d.isArrived ? 'Na placu' : 'Oczekuje');
        return [dateStr, d.time, `"${d.companyName}"`, `"${d.plateNumber}"`, d.rampId, statusStr, d.type].join(',');
    });
    return '\uFEFF' + [headers.join(','), ...rows].join('\n');
};