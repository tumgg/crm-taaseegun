import { 
  REAL_GOOD_VIBES_PAGE_ID, 
  REAL_GOOD_VIBES_TOKEN,
  REAL_TAASEEGUN_PAGE_ID,
  REAL_TAASEEGUN_TOKEN,
  REAL_ROOMS_PAINTING_PAGE_ID,
  REAL_ROOMS_PAINTING_TOKEN
} from '../data/mockData';

const LEADS_STORAGE_KEY = 'omnisocial_leads_v2';
const PAGES_STORAGE_KEY = 'omnisocial_pages_v2';

export function loadStoredLeads(fallbackLeads) {
  try {
    const data = localStorage.getItem(LEADS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Keep ONLY real customer leads from live Facebook sync (remove old mock test leads)
        const realOnly = parsed.filter(l => 
          l.isLiveFacebookLead || 
          (typeof l.id === 'string' && l.id.startsWith('fb-live-'))
        );
        if (realOnly.length > 0) {
          if (realOnly.length !== parsed.length) {
            localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(realOnly));
          }
          return realOnly;
        }
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
        // Keep ONLY real active pages (Good Vibes, Taaseegun, RoomsPainting, or custom pages with valid tokens)
        let activeOnly = parsed.filter(p => 
          p.id === REAL_GOOD_VIBES_PAGE_ID || 
          p.id === REAL_TAASEEGUN_PAGE_ID ||
          p.id === REAL_ROOMS_PAINTING_PAGE_ID ||
          (p.activePageToken && p.activePageToken.length > 50 && !p.activePageToken.includes('...'))
        );

        // Ensure Good Vibes page is present with the verified real token
        let goodVibes = activeOnly.find(p => p.id === REAL_GOOD_VIBES_PAGE_ID);
        if (!goodVibes) {
          goodVibes = fallbackPages.find(p => p.id === REAL_GOOD_VIBES_PAGE_ID) || fallbackPages[0];
          activeOnly.unshift(goodVibes);
        } else {
          goodVibes.activePageToken = REAL_GOOD_VIBES_TOKEN;
        }

        // Ensure Taaseegun page is present with the verified real token
        let taaseegun = activeOnly.find(p => p.id === REAL_TAASEEGUN_PAGE_ID);
        if (!taaseegun) {
          taaseegun = fallbackPages.find(p => p.id === REAL_TAASEEGUN_PAGE_ID) || fallbackPages[1];
          if (taaseegun) activeOnly.push(taaseegun);
        } else {
          taaseegun.activePageToken = REAL_TAASEEGUN_TOKEN;
        }

        // Ensure RoomsPainting page is present with the verified real token
        let roomsPainting = activeOnly.find(p => p.id === REAL_ROOMS_PAINTING_PAGE_ID);
        if (!roomsPainting) {
          roomsPainting = fallbackPages.find(p => p.id === REAL_ROOMS_PAINTING_PAGE_ID) || fallbackPages[2];
          if (roomsPainting) activeOnly.push(roomsPainting);
        } else {
          roomsPainting.activePageToken = REAL_ROOMS_PAINTING_TOKEN;
        }

        localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(activeOnly));
        return activeOnly;
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
