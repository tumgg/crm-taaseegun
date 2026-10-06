// Multi-Admin Real-time Cloud Synchronization for OmniSocial & Lead Hub
// Backed by Supabase PostgreSQL and Realtime Replication

import { supabase } from './supabaseClient.js';

export const CLIENT_SESSION_ID = 'client_' + Math.random().toString(36).slice(2, 9) + '_' + Date.now().toString(36);

/**
 * Maps a Supabase crm_leads database row (snake_case) to a frontend Lead object (camelCase)
 */
export function mapDbToLead(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    name: row.name || 'ลูกค้า',
    avatar: row.avatar || null,
    platform: row.platform || 'facebook',
    channel: row.channel || '',
    channelName: row.channel_name || row.channelName || '',
    sourceType: row.source_type || row.sourceType || 'inbox',
    sourceTitle: row.source_title || row.sourceTitle || '',
    sourceLink: row.source_link || row.sourceLink || '',
    contact: row.contact || '',
    inquiry: row.inquiry || '',
    dealValue: Number(row.deal_value ?? row.dealValue ?? 0),
    status: row.status || 'ทักใหม่ (New)',
    date: row.date || '',
    timestamp: Number(row.timestamp || Date.now()),
    lastActivity: Number(row.last_activity ?? row.lastActivity ?? row.timestamp ?? Date.now()),
    updatedTime: row.updated_time || row.updatedTime || new Date().toISOString(),
    followUpDate: row.follow_up_date ?? row.followUpDate ?? null,
    admin: row.admin || 'แอดมินเพจ',
    notes: row.notes || '',
    tag: row.tag || '',
    unreadCount: Number(row.unread_count ?? row.unreadCount ?? 0),
    customerPsid: row.customer_psid || row.customerPsid || null,
    commentId: row.comment_id || row.commentId || null,
    postId: row.post_id || row.postId || null,
    isLiveFacebookLead: Boolean(row.is_live_facebook_lead ?? row.isLiveFacebookLead),
    messages: Array.isArray(row.messages) ? row.messages : []
  };
}

/**
 * Maps a frontend Lead object (camelCase) to a Supabase crm_leads database row (snake_case)
 */
export function mapLeadToDb(lead) {
  if (!lead || !lead.id) return null;
  return {
    id: String(lead.id),
    name: lead.name || 'ลูกค้า',
    avatar: lead.avatar || null,
    platform: lead.platform || 'facebook',
    channel: lead.channel || '',
    channel_name: lead.channelName || '',
    source_type: lead.sourceType || 'inbox',
    source_title: lead.sourceTitle || '',
    source_link: lead.sourceLink || '',
    contact: lead.contact || '',
    inquiry: lead.inquiry || '',
    deal_value: Number(lead.dealValue || 0),
    status: lead.status || 'ทักใหม่ (New)',
    date: lead.date || '',
    timestamp: Number(lead.timestamp || Date.now()),
    last_activity: Number(lead.lastActivity || lead.timestamp || Date.now()),
    updated_time: lead.updatedTime || new Date().toISOString(),
    follow_up_date: lead.followUpDate || null,
    admin: lead.admin || 'แอดมินเพจ',
    notes: lead.notes || '',
    tag: lead.tag || '',
    unread_count: Number(lead.unreadCount || 0),
    customer_psid: lead.customerPsid || null,
    comment_id: lead.commentId || null,
    post_id: lead.postId || null,
    is_live_facebook_lead: Boolean(lead.isLiveFacebookLead),
    messages: Array.isArray(lead.messages) ? lead.messages : [],
    updated_at: new Date().toISOString()
  };
}

/**
 * Fetches all leads from Supabase cloud database
 */
export async function fetchLeadsFromCloud() {
  try {
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .order('last_activity', { ascending: false });

    if (error) throw error;
    if (!data) return [];
    return data.map(mapDbToLead);
  } catch (err) {
    console.warn('⚠️ [CloudSync] Error fetching leads from Supabase:', err);
    return null;
  }
}

/**
 * Upserts a single lead to Supabase cloud database
 */
export async function saveLeadToCloud(lead) {
  if (!lead || !lead.id) return false;
  try {
    const row = mapLeadToDb(lead);
    const { error } = await supabase
      .from('crm_leads')
      .upsert(row, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn(`⚠️ [CloudSync] Error saving lead ${lead.id} to Supabase:`, err);
    return false;
  }
}

/**
 * Batch upserts multiple leads to Supabase in chunks
 */
export async function saveMultipleLeadsToCloud(leads) {
  if (!Array.isArray(leads) || leads.length === 0) return true;
  try {
    const rows = leads.map(mapLeadToDb).filter(Boolean);
    const CHUNK_SIZE = 50;
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      const { error } = await supabase
        .from('crm_leads')
        .upsert(chunk, { onConflict: 'id' });
      if (error) throw error;
    }
    return true;
  } catch (err) {
    console.warn('⚠️ [CloudSync] Error bulk saving leads to Supabase:', err);
    return false;
  }
}

/**
 * Deletes a lead from Supabase cloud database
 */
export async function deleteLeadFromCloud(leadId) {
  if (!leadId) return false;
  try {
    const { error } = await supabase
      .from('crm_leads')
      .delete()
      .eq('id', String(leadId));

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn(`⚠️ [CloudSync] Error deleting lead ${leadId} from Supabase:`, err);
    return false;
  }
}

/**
 * Subscribes to real-time changes on crm_leads table
 */
export function subscribeToLeadsRealtime({ onInsert, onUpdate, onDelete, onStatusChange }) {
  const channel = supabase
    .channel('public:crm_leads_sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'crm_leads' },
      (payload) => {
        try {
          if (payload.eventType === 'INSERT' && payload.new) {
            const lead = mapDbToLead(payload.new);
            if (onInsert) onInsert(lead);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const lead = mapDbToLead(payload.new);
            if (onUpdate) onUpdate(lead);
          } else if (payload.eventType === 'DELETE' && payload.old) {
            if (onDelete) onDelete(payload.old.id);
          }
        } catch (err) {
          console.error('⚠️ [CloudSync] Error handling realtime event:', err);
        }
      }
    )
    .subscribe((status) => {
      if (onStatusChange) onStatusChange(status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
