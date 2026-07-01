import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qqkijnzadjxttchxjsff.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_BL6UcZBvrxD6h4RVKoi8tQ_S9CcOGnu';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
