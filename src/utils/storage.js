// LocalStorage Persistence & Cloud Database sync helper

const LEADS_STORAGE_KEY = 'omnisocial_leads_v2';
const PAGES_STORAGE_KEY = 'omnisocial_pages_v2';

export function loadStoredLeads(fallbackLeads) {
  try {
    const data = localStorage.getItem(LEADS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load leads from localStorage', err);
  }
  return fallbackLeads;
}

export function saveStoredLeads(leads) {
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  } catch (err) {
    console.warn('Failed to save leads to localStorage', err);
  }
}

export function loadStoredPages(fallbackPages) {
  try {
    const data = localStorage.getItem(PAGES_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load pages from localStorage', err);
  }
  return fallbackPages;
}

export function saveStoredPages(pages) {
  try {
    localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(pages));
  } catch (err) {
    console.warn('Failed to save pages to localStorage', err);
  }
}

export function exportBackupJson(leads, pages) {
  const backup = {
    exportedAt: new Date().toISOString(),
    version: '2.0',
    leads,
    facebookPages: pages
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `omnisocial_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function resetToDefaults(defaultLeads, defaultPages) {
  localStorage.removeItem(LEADS_STORAGE_KEY);
  localStorage.removeItem(PAGES_STORAGE_KEY);
  return { leads: defaultLeads, pages: defaultPages };
}
