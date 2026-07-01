import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();
    if (!domain || typeof domain !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing domain' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const clean = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
    const tld = clean.split('.').pop() || '';

    // Query pricing from DB
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);
    const { data: pricing } = await sb.from('domain_pricing').select('tld, price').eq('tld', tld).maybeSingle();
    const price = pricing?.price || 15;

    // Query RDAP
    const rdapUrl = `https://rdap.org/domain/${clean}`;
    const resp = await fetch(rdapUrl, { method: 'GET', signal: AbortSignal.timeout(10000) });

    let available = false;
    let registrar = '';
    let creationDate = '';

    if (resp.status === 404) {
      available = true;
    } else if (resp.ok) {
      available = false;
      try {
        const data = await resp.json();
        creationDate = data?.events?.find((e: any) => e.eventAction === 'registration')?.eventDate?.slice(0, 10) || '';
        const entities = data?.entities || [];
        for (const e of entities) {
          if (e.roles?.includes('registrar')) {
            registrar = e.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[1] || registrar;
          }
        }
      } catch {}
    } else {
      return new Response(JSON.stringify({ domain: clean, tld, available: 'unknown', price, error: 'Lookup failed. Try again.' }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    return new Response(JSON.stringify({ domain: clean, available, registrar, creationDate, price, tld }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
