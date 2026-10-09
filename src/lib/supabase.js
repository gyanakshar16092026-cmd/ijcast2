import { createClient } from '@supabase/supabase-js';

const viteEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
const supabaseUrl = viteEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = viteEnv.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-supabase-url.supabase.co');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const STORAGE_KEYS = {
  SETTINGS: 'IJRT_settings_v5',
  VOLUMES: 'IJRT_volumes_v2',
  ISSUES: 'IJRT_issues_v2',
  ARTICLES: 'IJRT_articles_v2',
  EDITORIAL: 'IJRT_editorial_v2',
  RESEARCH_AREAS: 'IJRT_research_areas_v2',
  PAGE_CONTENT: 'IJRT_page_content_v2',
  MEDIA: 'IJRT_media_v2',
  ADMIN_SESSION: 'IJRT_admin_session',
  THESES: 'IJRT_theses_v2',
  ANNOUNCEMENTS: 'IJRT_announcements',
  CONFERENCES: 'IJRT_conferences',
  PENDING_SUBMISSIONS: 'IJRT_pending_submissions'
};

// Helper for LocalStorage Persistence
export const getLocalStore = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    if (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(fallback) && fallback.length > 0) {
      return fallback;
    }
    return parsed;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
};

export const setLocalStore = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
};

export const getPendingLocalSubmissions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENDING_SUBMISSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(Boolean)
      .map((submission) => ({
        ...submission,
        id: submission.id || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        status: submission.status || 'SUBMITTED',
        submitted_date: submission.submitted_date || submission.saved_locally_at || new Date().toISOString(),
        coAuthors: Array.isArray(submission.coAuthors) ? submission.coAuthors : [],
      }))
      .sort((a, b) => new Date(b.submitted_date || 0) - new Date(a.submitted_date || 0));
  } catch (error) {
    console.warn('Failed to read pending local submissions:', error);
    return [];
  }
};

export const updatePendingLocalSubmissionStatus = (submissionId, newStatus) => {
  try {
    if (!submissionId) return false;
    const entries = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SUBMISSIONS) || '[]');
    if (!Array.isArray(entries)) return false;

    let updated = false;
    const nextEntries = entries.map((entry) => {
      const matches = String(entry.id) === String(submissionId) || String(entry.submission_id) === String(submissionId);
      if (!matches) return entry;

      updated = true;
      return {
        ...entry,
        status: newStatus,
        updated_locally_at: new Date().toISOString(),
      };
    });

    if (updated) {
      localStorage.setItem(STORAGE_KEYS.PENDING_SUBMISSIONS, JSON.stringify(nextEntries));
      return true;
    }

    return false;
  } catch (error) {
    console.warn('Failed to update pending local submission status:', error);
    return false;
  }
};

export { STORAGE_KEYS };


