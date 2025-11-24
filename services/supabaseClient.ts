
import { createClient } from '@supabase/supabase-js';

// Skonfigurowane klucze podane przez użytkownika
const SUPABASE_URL = 'https://dcbzkdjefcudjkxdumyk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjYnprZGplZmN1ZGpreGR1bXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MzY4OTUsImV4cCI6MjA3OTUxMjg5NX0.w06qllKP0YNl5JSLnPAehtFjOAyDuMijT9ckLhwFTNU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isSupabaseConfigured = () => {
    return SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 20;
};
