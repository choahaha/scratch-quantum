import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://tzyprsfsxagwepaqhvvm.supabase.co';
const supabaseAnonKey = 'sb_publishable_7JmUN-ZHW9tHrM9fpzebwQ_6ZLP2uUE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,      // localStorage에 세션 저장
        autoRefreshToken: true,    // 토큰 자동 갱신
        detectSessionInUrl: true   // URL에서 세션 감지
    }
});
