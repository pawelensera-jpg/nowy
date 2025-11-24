
import { DeliveryItem, DeliveryStatus } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// Valid Gates/Ramps
const GATES = ['Brama W3', 'Brama W4', 'Brama W5', 'Brama W6', 'Brama W7', 'Brama W8'];

// Simple in-memory storage to persist changes between date navigation during the session
const MEMORY_DB = new Map<string, DeliveryItem[]>();

// --- REAL SHAREPOINT CONFIGURATION ---
const SITE_URL = "https://steripackgroup.sharepoint.com/sites/PolandDeliveries";
const LIST_NAME = "Ochrona";
// REST API Endpoint for the specific list
const API_URL = `${SITE_URL}/_api/web/lists/getbytitle('${LIST_NAME}')/items`;

const formatDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseSharePointDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  try {
    // Try standard ISO first (SharePoint API often returns ISO)
    if (dateStr.includes('T')) {
        return new Date(dateStr);
    }
    // Fallback to "DD/MM/YYYY HH:MM" format from View
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    const date = new Date(year, month - 1, day, hour, minute);
    if (isNaN(date.getTime())) throw new Error("Invalid Date");
    return date;
  } catch (e) {
    console.warn("Date parsing fallback used for:", dateStr);
    return new Date();
  }
};

const formatTime = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// --- DATA SNAPSHOT (CLEARED AS REQUESTED) ---
const SNAPSHOT_DATA: any[] = [];

// --- MAIN FETCH FUNCTION ---
export const fetchDeliveries = async (targetDate: Date = new Date(), defaultDuration: number = 90): Promise<DeliveryItem[]> => {
  const dateKey = formatDateKey(targetDate);
  
  if (!navigator.onLine) {
      throw new Error("Brak połączenia z internetem. Sprawdź swoje połączenie sieciowe.");
  }

  let rawItems: any[] = [];
  let isFromApi = false;

  try {
      // Extensive selection of possible column names to catch the real data
      const fields = [
          "Id", "Title", "Created", "Awizacja", "OData__x0032_025_Awizacja",
          "Kierunek_x002f_Nazwa_x0020_Dostawcy", 
          "Numery_x0020_rejestracyjne", "Rejestracja", "OData__x004e_umery_x0020_rejestracyjne", 
          "NumeryRejestracyjne", "NrRejestracyjny", "Nr_x0020_rejestracyjny",
          "Tak_x002f_Nie", "Status"
      ];
      
      const selectFields = `$select=${fields.join(',')}`;
      
      const response = await fetch(`${API_URL}?${selectFields}&$top=5000`, {
          method: 'GET',
          headers: {
              'Accept': 'application/json;odata=verbose',
              'Content-Type': 'application/json;odata=verbose'
          },
          credentials: 'include' 
      });

      if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
              throw new Error(`Brak dostępu do SharePoint (Błąd ${response.status}). Aplikacja nie ma uprawnień do prywatnej listy 'Ochrona'. Uruchom aplikację wewnątrz sieci firmowej.`);
          }
          if (response.status === 404) {
              throw new Error(`Nie znaleziono listy 'Ochrona' na SharePoint (Błąd 404). Sprawdź czy nazwa listy w URL jest poprawna.`);
          }
          throw new Error(`Błąd serwera SharePoint: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      if (json && json.d && json.d.results) {
         rawItems = json.d.results;
         isFromApi = true;
      } else {
         throw new Error("Nieprawidłowa struktura danych z SharePoint (brak d.results).");
      }

  } catch (e: any) {
      const isNetworkError = e instanceof TypeError && e.message === 'Failed to fetch';
      
      if (isNetworkError) {
          // EXPLANATION OF FAILURE
          throw new Error("Nie można połączyć się z https://steripackgroup.sharepoint.com. \nPOWÓD: Blokada CORS lub brak sesji. Ta aplikacja działa w izolowanym środowisku i nie ma dostępu do Twojej prywatnej sieci firmowej. Aby pobrać dane, aplikacja musi być uruchomiona w tej samej domenie co SharePoint.");
      } else {
          throw e;
      }
  }

  // Filter API data for the requested date
  const filteredItems = rawItems.filter(item => {
      const dateStr = item.Awizacja || item.OData__x0032_025_Awizacja;
      if (!dateStr) return false;
      const itemDate = parseSharePointDate(dateStr);
      return formatDateKey(itemDate) === dateKey;
  });

  // 3. MAP RAW DATA TO APP MODEL
  const parsedItems = filteredItems.map(item => {
      const id = item.Id;
      const awizacja = item.Awizacja || item.OData__x0032_025_Awizacja;
      const nazwa = item.Kierunek_x002f_Nazwa_x0020_Dostawcy || item.Title;
      
      // Robust Plate Number Finder
      const rejestracja = item.Numery_x0020_rejestracyjne 
                     || item.Rejestracja 
                     || item.OData__x004e_umery_x0020_rejestracyjne
                     || item.NumeryRejestracyjne
                     || item.NrRejestracyjny
                     || item.Nr_x0020_rejestracyjny
                     || "";
      
      const takNie = item.Tak_x002f_Nie || item.Status;
      const created = item.Created;

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

  // 4. LOAD PERSISTED DATA FROM SUPABASE
  let supabaseItems: DeliveryItem[] = [];
  if (isSupabaseConfigured()) {
      try {
          const { data, error } = await supabase.from('deliveries').select('json_data').eq('date_key', dateKey);
          if (data) {
              supabaseItems = data.map((row: any) => row.json_data);
          }
      } catch(err) {
          console.warn("Could not load from Supabase:", err);
      }
  }

  // 5. MERGE LOGIC
  const supabaseMap = new Map(supabaseItems.map(i => [i.id, i]));
  const memoryItems = MEMORY_DB.get(dateKey) || [];
  const memoryMap = new Map(memoryItems.map(i => [i.id, i]));

  const finalItems: DeliveryItem[] = [];

  // Iterate over parsed items from SharePoint (The "Live" List)
  parsedItems.forEach(spItem => {
      // Priority 1: In-Memory Edit (Session)
      if (memoryMap.has(spItem.id)) {
          finalItems.push(memoryMap.get(spItem.id)!);
          supabaseMap.delete(spItem.id);
          return;
      }

      // Priority 2: Supabase Persisted Edit
      if (supabaseMap.has(spItem.id)) {
          finalItems.push(supabaseMap.get(spItem.id)!);
          supabaseMap.delete(spItem.id);
          return;
      }

      // Priority 3: Fresh from SharePoint
      finalItems.push(spItem);
  });

  // Add remaining items from Supabase/Memory
  supabaseMap.forEach(item => finalItems.push(item));
  
  // 6. RESOLVE OVERLAPS
  const resolvedItems = resolveTimeOverlaps(finalItems);
  
  // Cache result
  MEMORY_DB.set(dateKey, resolvedItems);
  
  // Sync confirmed state back to Supabase
  if (isSupabaseConfigured()) {
      syncToSupabase(dateKey, resolvedItems);
  }

  return resolvedItems;
};


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
      
      // LOGIC: IDs >= 2800 are ALWAYS Loading
      const isLoading = !isNaN(idNum) && idNum >= 2800;
      const type = isLoading ? 'Załadunek' : 'Rozładunek';

      // Safe access to registration string logic
      const rawPlate = row.rejestracja;
      const plateNumber = (rawPlate === null || rawPlate === undefined) ? '' : String(rawPlate);

      let assignedGate = 'Brama W5'; // Default
      const lowerName = (row.nazwa || '').toLowerCase();
      const lowerReg = plateNumber.toLowerCase();

      // GATE RULES
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


// --- OTHER EXISTING HELPERS ---
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
            const current = groupItems[i];
            if (i > 0) {
                const prev = groupItems[i - 1];
                const prevTime = new Date(prev.datetime).getTime();
                const prevEnd = prevTime + (prev.duration * 60000); 
                const currTime = new Date(current.datetime).getTime();
                if (currTime < prevEnd) {
                    const newTime = new Date(prevEnd);
                    current.datetime = newTime;
                    current.time = formatTime(newTime);
                }
            }
            resolvedItems.push(current);
        }
    });
    return resolvedItems.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
};

export const saveDeliveriesLocal = (date: Date, items: DeliveryItem[]) => {
    const dateKey = formatDateKey(date);
    MEMORY_DB.set(dateKey, items);
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

const syncToSupabase = async (dateKey: string, items: DeliveryItem[]) => {
    if (items.length === 0) return;
    try {
        const rowsToUpsert = items.map(item => ({ id: item.id, date_key: dateKey, json_data: item }));
        const { error } = await supabase.from('deliveries').upsert(rowsToUpsert, { onConflict: 'id' });
        if (error) {
            if (error.code === '42501' || error.message.includes('row-level security')) {
                 console.warn("Supabase Access Denied: RLS Policy prevents write. Please enable standard 'Enable all for anon' policy on 'deliveries' table.");
            } else {
                 console.error("Supabase Sync Error:", error.message, error.details || "");
            }
        }
    } catch (e) { console.error("Supabase Connection Failed:", e); }
};

export interface DayStats { date: string; total: number; arrived: number; pending: number; }

export const getHistoryStats = async (baseDate: Date): Promise<DayStats[]> => {
    const stats: DayStats[] = [];
    const cutoffDate = new Date(2025, 10, 14); 
    for (let i = 6; i >= 0; i--) {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() - i);
        const dCheck = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const cutoffCheck = new Date(cutoffDate.getFullYear(), cutoffDate.getMonth(), cutoffDate.getDate());
        const dateLabel = d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
        if (dCheck < cutoffCheck) { stats.push({ date: dateLabel, total: 0, arrived: 0, pending: 0 }); continue; }

        const dateKey = formatDateKey(d);
        let items: DeliveryItem[] = [];
        if (isSupabaseConfigured()) {
            try {
                const { data, error } = await supabase.from('deliveries').select('json_data').eq('date_key', dateKey);
                if (error || !data) {
                    items = MEMORY_DB.get(dateKey) || [];
                } else {
                    items = data.map((row: any) => row.json_data);
                }
            } catch {
                items = MEMORY_DB.get(dateKey) || [];
            }
        } else {
            items = MEMORY_DB.get(dateKey) || [];
        }
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
