
export enum DeliveryStatus {
  PENDING = 'Oczekuje',
  ARRIVED = 'Na placu',
  COMPLETED = 'Zakończono', // This will represent "OUT"
  DELAYED = 'Opóźniony'
}

export interface DeliveryItem {
  id: string;        // "Identyfikator"
  originalId: string; // To keep the original ID visible if needed
  time: string;      // Extracted time from "Awizacja" HH:MM
  datetime: Date;    // Parsed full date from "Awizacja"
  duration: number;  // Calculated or Default (since not in source)
  companyName: string; // "Kierunek/Nazwa Dostawcy"
  plateNumber: string; // "Numery rejestracyjne"
  isArrived: boolean; // "Tak / Nie" - requires 10s refresh
  arrivalTimestamp?: number; // Added field
  createdLocal: string; // "Created - Local"
  type: 'Dostawa' | 'Odbiór' | 'Załadunek' | 'Rozładunek' | 'Kurier'; // Expanded types
  rampId: string;    // Assigned for visualization
  status?: DeliveryStatus; // Added field
}

export interface DashboardStats {
  total: number;
  arrived: number;
  pending: number;
}