import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://tzyprsfsxagwepaqhvvm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6eXByc2ZzeGFnd2VwYXFodnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODc2NTYsImV4cCI6MjA4MDE2MzY1Nn0.lL0F88_UrqUDWn4Cer0Y40HpAqtEWou6iBX4mq0FpVE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
