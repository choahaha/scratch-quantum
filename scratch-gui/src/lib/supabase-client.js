import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://tzyprsfsxagwepaqhvvm.supabase.co';
const supabaseAnonKey = 'sb_publishable_7JmUN-ZHW9tHrM9fpzebwQ_6ZLP2uUE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
