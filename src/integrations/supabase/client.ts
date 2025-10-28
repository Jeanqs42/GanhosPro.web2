import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yqwxjkkpmakzqrqsrzqi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxd3hqa2twbWFrenFycXNyenFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTE4MzUsImV4cCI6MjA3NzE4NzgzNX0.VkBVdUIz9TR0OdnSFMi_YFTAPkGkex3kp_FJmCOJuEk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);