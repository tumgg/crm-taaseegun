// LocalStorage Persistence & Cloud Database sync helper
import { REAL_GOOD_VIBES_PAGE_ID, REAL_GOOD_VIBES_TOKEN } from '../data/mockData';

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
      let parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let hasChanges = false;

        // 1. If old mock IDs (e.g. fb-page-1) exist, replace completely with fallbackPages (7 real pages)
        if (parsed.some(p => typeof p.id === 'string' && p.id.startsWith('fb-page-'))) {
          localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(fallbackPages));
          return fallbackPages;
        }

        // 2. Ensure Good Vibes texture page has the real active token
        parsed = parsed.map(page => {
          if (page.id === REAL_GOOD_VIBES_PAGE_ID) {
            if (!page.activePageToken || page.activePageToken.includes('...') || page.activePageToken.length < 50) {
              hasChanges = true;
              return { ...page, activePageToken: REAL_GOOD_VIBES_TOKEN };
            }
          } else {
            // Remove dummy tokens with ellipsis from other pages
            if (page.activePageToken && (page.activePageToken.includes('...') || page.activePageToken.length < 50)) {
              hasChanges = true;
              return { ...page, activePageToken: '' };
            }
          }
          return page;
        });

        // 3. If Good Vibes page isn't present in parsed, prepend it
        if (!parsed.some(p => p.id === REAL_GOOD_VIBES_PAGE_ID)) {
          const fallbackGoodVibes = fallbackPages.find(p => p.id === REAL_GOOD_VIBES_PAGE_ID);
          if (fallbackGoodVibes) {
            parsed = [fallbackGoodVibes, ...parsed];
            hasChanges = true;
          }
        }

        if (hasChanges) {
          localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(parsed));
        }
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
