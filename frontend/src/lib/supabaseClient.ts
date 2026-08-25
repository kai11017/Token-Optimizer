import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const hasSupabase = Boolean(
  supabaseUrl && 
  supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' && 
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE'
)

const validUrl = hasSupabase ? supabaseUrl : 'http://localhost'
export const supabase = createClient(validUrl, supabaseAnonKey || 'dummy')
