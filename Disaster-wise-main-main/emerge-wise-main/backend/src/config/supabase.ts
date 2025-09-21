import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://cndlusrkgijxukfpnssb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZGx1c3JrZ2lqeHVrZnBuc3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NzA5MzQsImV4cCI6MjA3MzM0NjkzNH0.FTagJ8QMhD3cSnIbm5K-uYrniY__j1leV59nKPs0a1I';

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
