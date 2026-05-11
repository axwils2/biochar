/**
 * Supabase Edge Function: update-currency-rates
 *
 * Called by the admin panel. Fetches live USD exchange rates from a free API
 * and upserts them into the lookup_data table.
 *
 * Deploy with:
 *   supabase functions deploy update-currency-rates
 *
 * Required environment variable (set in Supabase Dashboard → Settings → Edge Functions):
 *   SUPABASE_SERVICE_ROLE_KEY  (auto-available in Edge Functions as Deno.env)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

// Currencies relevant to the Latin American coffee/cacao supply chain context
const TARGET_CURRENCIES = ['COP', 'MXN', 'GTQ', 'HNL', 'NIO', 'CRC', 'BRL', 'PEN', 'BOB', 'PYG', 'EUR'];

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Authenticate the caller using their JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl      = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const userJwt          = authHeader.replace('Bearer ', '');

  // Create a user-scoped client to validate the caller's identity
  const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Verify the caller is an admin using the service role client (bypasses RLS)
  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden: admin role required' }), {
      status: 403,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Fetch live exchange rates (USD base, free API — no key required)
  let rates: Record<string, number>;
  try {
    const apiUrl = `https://open.er-api.com/v6/latest/USD`;
    const apiRes = await fetch(apiUrl);
    if (!apiRes.ok) throw new Error(`API responded with ${apiRes.status}`);
    const apiData = await apiRes.json();
    if (apiData.result !== 'success') throw new Error('API returned non-success result');
    rates = apiData.rates;
  } catch (e) {
    return new Response(JSON.stringify({ error: `Failed to fetch rates: ${e.message}` }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Upsert only the currencies we care about
  const rows = TARGET_CURRENCIES
    .filter(code => code in rates)
    .map(code => ({
      category:   'currency_rates',
      key:        `USD_to_${code}`,
      value:      { rate: rates[code], base: 'USD', target: code },
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    }));

  const { error: upsertError } = await adminClient
    .from('lookup_data')
    .upsert(rows, { onConflict: 'category,key' });

  if (upsertError) {
    return new Response(JSON.stringify({ error: upsertError.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ updated: rows.length, timestamp: new Date().toISOString() }), {
    status: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
});
