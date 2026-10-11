// Supabase Cloud Data Service for OmniSocial Backend

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rnnkqegziycvkggrdivp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubmtxZWd6aXljdmtnZ3JkaXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMjIyMDAsImV4cCI6MjA5NzU5ODIwMH0.N1U6vY2v9STI8p-PsnGTadiJl_MNLFZeFvS5Bw4D7Cc';

/**
 * Fetches leads stored in Supabase crm_leads table
 */
export async function fetchCrmLeadsFromDb(options = {}) {
  try {
    const { status, pageId, updatedSince, limit = 50, cursor } = options;
    const url = new URL(`${SUPABASE_URL}/rest/v1/crm_leads`);
    url.searchParams.set('select', '*');
    url.searchParams.set('order', 'last_activity.desc.nullslast,timestamp.desc');
    url.searchParams.set('limit', String(Math.min(limit, 100)));

    if (status && status !== 'all') {
      url.searchParams.set('status', `eq.${status}`);
    }
    if (pageId) {
      url.searchParams.set('channel', `eq.${pageId}`);
    }
    if (updatedSince) {
      const sinceIso = new Date(updatedSince).toISOString();
      url.searchParams.set('updated_time', `gte.${sinceIso}`);
    }

    const res = await fetch(url.toString(), {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Could not fetch crm_leads from Supabase:', err.message);
    return [];
  }
}

/**
 * Fetches a map of leads indexed by conversation ID and customer PSID
 * for merging CRM metadata (status, tags, notes, admin) into conversations
 */
export async function getCrmLeadsLookupMap() {
  try {
    const leads = await fetchCrmLeadsFromDb({ limit: 100 });
    const lookup = new Map();
    leads.forEach(lead => {
      if (lead.conv_id) lookup.set(lead.conv_id, lead);
      if (lead.id) lookup.set(lead.id, lead);
      if (lead.customer_psid) lookup.set(lead.customer_psid, lead);
    });
    return lookup;
  } catch {
    return new Map();
  }
}
