import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dfxjrhsfkiphofotlkti.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmeGpyaHNma2lwaG9mb3Rsa3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NTg4NjcsImV4cCI6MjEwMDIzNDg2N30.Q-ECTTUCZuHa1UDl1GI7YvOJoPEjBy3PJt-83ah1bsM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
