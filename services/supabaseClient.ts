import { createClient } from '@supabase/supabase-js';

// Credenciales proporcionadas
const supabaseUrl = 'https://ueynoilnmmbayrztagcx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVleW5vaWxubW1iYXlyenRhZ2N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTQ1MjIsImV4cCI6MjA4MTEzMDUyMn0.42b2MDQwgXhO7cVB4cnUx-1PKKYOlasAEtQMwMpOynI';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * IMPORTANTE:
 * Para que la aplicación funcione, ejecuta el siguiente SQL en el Editor SQL de Supabase:
 * 
 * create table user_progress (
 *   user_id uuid references auth.users not null primary key,
 *   state jsonb,
 *   updated_at timestamp with time zone default timezone('utc'::text, now())
 * );
 * 
 * alter table user_progress enable row level security;
 * 
 * create policy "Users can manage their own progress" 
 * on user_progress for all 
 * using (auth.uid() = user_id) 
 * with check (auth.uid() = user_id);
 */
