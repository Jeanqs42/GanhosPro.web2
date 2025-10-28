import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente são acessadas via import.meta.env no Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is not defined in environment variables.');
  // Em um ambiente de produção, você pode querer lançar um erro ou ter um fallback mais robusto.
  // Para desenvolvimento, um console.error é suficiente.
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);