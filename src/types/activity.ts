export interface Activity {
  id: number;
  type: string; // matches backend ActivityType enum string
  actor: string;
  target: string;
  timestamp: string; // ISO datetime from backend
  description?: string | null;
}
