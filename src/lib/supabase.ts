import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fgndnmgfcsceuxeuishf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbmRubWdmY3NjZXV4ZXVpc2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNjU5MzEsImV4cCI6MjEwMzY0MTkzMX0.9FW7A9fTEBRRohyCjT9bNU4dyNxvsFpk-XEW6t-ioPA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
