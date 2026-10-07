import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, getLocalStore, setLocalStore, STORAGE_KEYS, getPendingLocalSubmissions, updatePendingLocalSubmissionStatus } from '../lib/supabase';
import { uploadSubmissionFile } from '../lib/submissionUpload';
import { emailService } from '../services/emailService';
import {
  initialJournalSettings,
  initialResearchAreas,
  initialVolumes,
  initialIssues,
  initialArticles,
  initialEditorialMembers,
  initialPageContent,
  initialMedia,
  initialTheses,
  initialAnnouncements,
  initialConferences
} from '../lib/mockData';

const JournalContext = createContext(null);

// Supabase may return JSON fields as strings — ensure arrays are always arrays
const normalizeResearchAreas = (areas) =>
  (areas || []).map((area) => ({
    ...area,
    subcategories: Array.isArray(area.subcategories)
      ? area.subcategories
      : typeof area.subcategories === 'string'
      ? (() => { try { return JSON.parse(area.subcategories); } catch { return []; } })()
      : [],
  }));

const parseJsonField = (field) => {
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try { return JSON.parse(field); } catch { return []; }
  }
  return [];
};

const normalizeArticles = (arts) =>
  (arts || []).map((art) => ({
    ...art,
    authors: parseJsonField(art.authors),
    keywords: parseJsonField(art.keywords),
    orcids: parseJsonField(art.orcids),
  }));

export const JournalProvider = ({ children }) => {
  // State initialization with localStorage fallbacks
  const [settings, setSettings] = useState(() => getLocalStore(STORAGE_KEYS.SETTINGS, initialJournalSettings));
  const [volumes, setVolumes] = useState(() => getLocalStore(STORAGE_KEYS.VOLUMES, []));
  const [issues, setIssues] = useState(() => getLocalStore(STORAGE_KEYS.ISSUES, []));
  const [articles, setArticles] = useState(() => getLocalStore(STORAGE_KEYS.ARTICLES, []));
  const [editorialMembers, setEditorialMembers] = useState(() => getLocalStore(STORAGE_KEYS.EDITORIAL, []));
  const [researchAreas, setResearchAreas] = useState(() => getLocalStore(STORAGE_KEYS.RESEARCH_AREAS, initialResearchAreas));
  const [pageContents, setPageContents] = useState(() => getLocalStore(STORAGE_KEYS.PAGE_CONTENT, initialPageContent));
  const [mediaItems, setMediaItems] = useState(() => getLocalStore(STORAGE_KEYS.MEDIA, []));
  const [adminSession, setAdminSession] = useState(() => getLocalStore(STORAGE_KEYS.ADMIN_SESSION, null));
  const [theses, setTheses] = useState(() => getLocalStore(STORAGE_KEYS.THESES, []));
  const [announcements, setAnnouncements] = useState(() => getLocalStore(STORAGE_KEYS.ANNOUNCEMENTS, initialAnnouncements));
  const [conferences, setConferences] = useState(() => getLocalStore(STORAGE_KEYS.CONFERENCES, initialConferences));
  const [isLoading, setIsLoading] = useState(true);

  // Global Modal States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [pdfModalData, setPdfModalData] = useState(null); // { url, title }

  // Sync only small/critical data to LocalStorage — NOT articles/media/theses (too large, causes QuotaExceededError)
  useEffect(() => { setLocalStore(STORAGE_KEYS.SETTINGS, settings); }, [settings]);
  useEffect(() => { setLocalStore(STORAGE_KEYS.ADMIN_SESSION, adminSession); }, [adminSession]);
  useEffect(() => { setLocalStore(STORAGE_KEYS.RESEARCH_AREAS, researchAreas); }, [researchAreas]);
  useEffect(() => { setLocalStore(STORAGE_KEYS.ANNOUNCEMENTS, announcements); }, [announcements]);
  useEffect(() => { setLocalStore(STORAGE_KEYS.CONFERENCES, conferences); }, [conferences]);

  // Load from Supabase if configured
  useEffect(() => {
    // Clear stale large localStorage keys that caused QuotaExceededError
    ['ijcast_articles', 'ijcast_articles_v2', 'ijcast_volumes', 'ijcast_volumes_v2',
     'ijcast_issues', 'ijcast_issues_v2', 'ijcast_editorial', 'ijcast_editorial_v2',
     'ijcast_media', 'ijcast_media_v2', 'ijcast_theses', 'ijcast_theses_v2',
     'ijcast_page_content', 'ijcast_page_content_v2'].forEach(key => {
      try { localStorage.removeItem(key); } catch {}
    });

  // Fetch editorial members immediately and independently for fast load
  if (isSupabaseConfigured && supabase) {
    supabase.from('editorial_members').select('*').order('sort_order', { ascending: true })
      .then(({ data: eds }) => {
        if (eds && eds.length > 0) setEditorialMembers(eds);
      })
      .catch(() => {});
  }
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    const fetchSupabaseData = async () => {
      try {
        // Fire ALL fetches in parallel simultaneously
        const [
          { data: set },
          { data: vols },
          { data: iss },
          { data: arts, error: artsErr },
          { data: eds },
          { data: ras },
          { data: pgs },
          { data: med },
          { data: ths },
          { data: anns },
          { data: confs }
        ] = await Promise.all([
          supabase.from('journal_settings').select('*').maybeSingle(),
          supabase.from('volumes').select('*').order('year', { ascending: false }),
          supabase.from('issues').select('*').order('sort_order', { ascending: true }),
          supabase.from('articles').select('*').order('sort_order', { ascending: true }),
          supabase.from('editorial_members').select('*').order('sort_order', { ascending: true }),
          supabase.from('research_areas').select('*').order('sort_order', { ascending: true }),
          supabase.from('page_content').select('*'),
          supabase.from('media').select('*').order('uploaded_at', { ascending: false }),
          supabase.from('theses').select('*').order('created_at', { ascending: false }),
          supabase.from('announcements').select('*').order('created_at', { ascending: false }),
          supabase.from('conferences').select('*').order('conference_date', { ascending: false })
        ]);

        // Settings
        if (set) {
          const corrected = {
            ...set,
            short_name: set.short_name || 'IJCAST',
            issn: (!set.issn || set.issn === 'ISSN XXXX-XXXX' || set.issn.includes('2349')) ? '2394-9007' : set.issn,
            eissn: (!set.eissn || set.eissn.includes('2349') || set.eissn === 'e-ISSN XXXX-XXXX') ? '2394-9007' : set.eissn,
            contact_email: (!set.contact_email || set.contact_email === 'editor@ijcast.org' || set.contact_email === 'editor.ijcast@gmail.com' || set.contact_email === 'editor@ijcast.in') ? 'editor.ijcast.in@gmail.com' : set.contact_email,
            alternate_email: '',
            publisher: (set.publisher === 'IJCAST Academic Research Publications Group' || !set.publisher)
              ? 'Gyan Akshar Sanskriti Foundation'
              : set.publisher,
            publication_frequency: (set.publication_frequency === 'Quarterly (4 Issues Per Year) — Issue 1: Jan–Mar | Issue 2: Apr–Jun | Issue 3: Jul–Sep | Issue 4: Oct–Dec' || set.publication_frequency === 'Bimonthly (6 Issues Per Year)' || !set.publication_frequency)
              ? 'Quarterly (4 Issues Per Year)'
              : set.publication_frequency,
          };
          setSettings(corrected);
          if (corrected.publisher !== set.publisher || corrected.publication_frequency !== set.publication_frequency || corrected.eissn !== set.eissn || corrected.issn !== set.issn || corrected.contact_email !== set.contact_email) {
            supabase.from('journal_settings').update({
              issn: corrected.issn, eissn: corrected.eissn, publisher: corrected.publisher,
              publication_frequency: corrected.publication_frequency,
              contact_email: 'editor.ijcast.in@gmail.com', alternate_email: '',
            }).eq('id', set.id);
          }
        }

        // Volumes
        if (vols && vols.length > 0) setVolumes(vols);
        else { setVolumes(initialVolumes); supabase.from('volumes').insert(initialVolumes.map(({ id, ...r }) => r)); }

        // Issues
        if (iss && iss.length > 0) setIssues(iss);
        else setIssues(initialIssues);

        // Articles
        if (artsErr) {
          try {
            const res = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/articles?select=*&order=sort_order.asc`,
              { headers: { 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` } }
            );
            const fallbackArts = await res.json();
            if (Array.isArray(fallbackArts) && fallbackArts.length > 0) setArticles(normalizeArticles(fallbackArts));
          } catch (fe) { console.warn('Fallback fetch failed:', fe); }
        } else if (arts && arts.length > 0) setArticles(normalizeArticles(arts));

        // Editorial Members
        if (eds && eds.length > 0) setEditorialMembers(eds);
        else setEditorialMembers(initialEditorialMembers);

        // Research Areas
        if (ras && ras.length > 0) setResearchAreas(normalizeResearchAreas(ras));
        else setResearchAreas(initialResearchAreas);

        // Page Content
        if (pgs && pgs.length > 0) setPageContents(pgs);
        else setPageContents(initialPageContent);

        // Media
        if (med && med.length > 0) setMediaItems(med);

        // Theses
        if (ths && ths.length > 0) setTheses(ths.map(t => ({ ...t, guide_names: parseJsonField(t.guide_names), keywords: parseJsonField(t.keywords) })));

        // Announcements
        if (anns && anns.length > 0) setAnnouncements(anns);
        else setAnnouncements(initialAnnouncements);

        // Conferences
        if (confs && confs.length > 0) setConferences(confs.map(c => ({ ...c, research_areas: parseJsonField(c.research_areas), paper_titles: parseJsonField(c.paper_titles) })));
        else setConferences(initialConferences);

      } catch (err) {
        console.warn('Supabase fetch error, maintaining local state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupabaseData();
  }, []);

  // --- CRUD ACTIONS ---

  // Admin Login / Logout
  const loginAdmin = async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data?.user) {
          setAdminSession({ user: data.user, token: data.session.access_token, mode: 'supabase' });
          return data;
        }
      } catch (err) {
        console.warn('Supabase auth sign-in notice:', err);
      }
    }
    // Fallback Admin Credentials
    if (email === 'gyanaksharsanskritifoundation@gmail.com' && password === 'gyanaksharsanskritifoundation@.com') {
      const demoUser = { id: 'demo-admin-id', email: 'gyanaksharsanskritifoundation@gmail.com', role: 'Administrator' };
      setAdminSession({ user: demoUser, token: 'demo-token', mode: isSupabaseConfigured ? 'supabase' : 'demo' });
      return { user: demoUser };
    }
    throw new Error('Invalid Administrator Credentials');
  };

  const logoutAdmin = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setAdminSession(null);
  };

  // Settings
  const updateSettings = async (newSettings) => {
    const updated = { ...settings, ...newSettings, updated_at: new Date().toISOString() };
    setSettings(updated);
    if (isSupabaseConfigured && supabase) {
      // Use the real UUID from the fetched row if available, otherwise upsert
      if (updated.id && updated.id !== 'setting-1') {
        await supabase.from('journal_settings').update(updated).eq('id', updated.id);
      } else {
        // No real UUID yet — fetch it first, then update
        const { data: existing } = await supabase.from('journal_settings').select('id').single();
        if (existing?.id) {
          const withRealId = { ...updated, id: existing.id };
          setSettings(withRealId);
          await supabase.from('journal_settings').update(withRealId).eq('id', existing.id);
        } else {
          // Table is empty — insert for the first time
          const { data: inserted } = await supabase.from('journal_settings').insert(updated).select().single();
          if (inserted) setSettings(inserted);
        }
      }
    }
  };

  // Volumes
  const saveVolume = async (volumeData, options = {}) => {
    const { autoGenerateIssues = true } = options;
    
    if (isSupabaseConfigured && supabase) {
      const isNew = !volumeData.id || volumeData.id.startsWith('vol-');
      if (isNew) {
        const { id: _, ...rest } = volumeData;
        const payload = { ...rest, created_at: new Date().toISOString() };
        const { data: inserted, error } = await supabase.from('volumes').insert(payload).select().single();
        if (!error && inserted) { 
          setVolumes(prev => [inserted, ...prev]); 
          
          // Auto-generate 6 bimonthly issues for the new volume
          if (autoGenerateIssues) {
            const bimonthlyIssues = [
              { number: 1, month_range: 'Jan–Feb', title: 'Number 1' },
              { number: 2, month_range: 'Mar–Apr', title: 'Number 2' },
              { number: 3, month_range: 'May–Jun', title: 'Number 3' },
              { number: 4, month_range: 'Jul–Aug', title: 'Number 4' },
              { number: 5, month_range: 'Sep–Oct', title: 'Number 5' },
              { number: 6, month_range: 'Nov–Dec', title: 'Number 6' },
            ];
            
            for (let i = 0; i < bimonthlyIssues.length; i++) {
              const issueTemplate = bimonthlyIssues[i];
              await saveIssue({
                volume_id: inserted.id,
                issue_number: issueTemplate.number,
                month_range: issueTemplate.month_range,
                year: inserted.year,
                pub_date: '',
                cover_url: '',
                editorial_note: `${issueTemplate.title} - ${issueTemplate.month_range} ${inserted.year}`,
                sort_order: i + 1
              });
            }
          }
          
          return;
        }
      } else {
        await supabase.from('volumes').update(volumeData).eq('id', volumeData.id);
        setVolumes(prev => prev.map(v => v.id === volumeData.id ? { ...v, ...volumeData } : v)); return;
      }
    }
    // Offline fallback
    if (volumeData.id && !volumeData.id.startsWith('vol-')) {
      setVolumes(prev => prev.map(v => v.id === volumeData.id ? { ...v, ...volumeData } : v));
    } else {
      const newVol = { ...volumeData, id: `vol-${Date.now()}`, created_at: new Date().toISOString() };
      setVolumes(prev => [newVol, ...prev]);
      
      // Auto-generate 6 bimonthly issues for the new volume (offline mode)
      if (autoGenerateIssues) {
        const bimonthlyIssues = [
          { number: 1, month_range: 'Jan–Feb', title: 'Number 1' },
          { number: 2, month_range: 'Mar–Apr', title: 'Number 2' },
          { number: 3, month_range: 'May–Jun', title: 'Number 3' },
          { number: 4, month_range: 'Jul–Aug', title: 'Number 4' },
          { number: 5, month_range: 'Sep–Oct', title: 'Number 5' },
          { number: 6, month_range: 'Nov–Dec', title: 'Number 6' },
        ];
        
        for (let i = 0; i < bimonthlyIssues.length; i++) {
          const issueTemplate = bimonthlyIssues[i];
          await saveIssue({
            volume_id: newVol.id,
            issue_number: issueTemplate.number,
            month_range: issueTemplate.month_range,
            year: newVol.year,
            pub_date: '',
            cover_url: '',
            editorial_note: `${issueTemplate.title} - ${issueTemplate.month_range} ${newVol.year}`,
            sort_order: i + 1
          });
        }
      }
    }
  };

  const deleteVolume = async (id) => {
    setVolumes(volumes.filter(v => v.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('volumes').delete().eq('id', id);
    }
  };

  // Issues
  const saveIssue = async (issueData) => {
    if (isSupabaseConfigured && supabase) {
      const isNew = !issueData.id || issueData.id.startsWith('iss-');
      if (isNew) {
        const { id: _, ...rest } = issueData;
        const payload = { ...rest, sort_order: issues.length + 1, created_at: new Date().toISOString() };
        const { data: inserted, error } = await supabase.from('issues').insert(payload).select().single();
        if (!error && inserted) { setIssues(prev => [...prev, inserted]); return; }
      } else {
        await supabase.from('issues').update(issueData).eq('id', issueData.id);
        setIssues(prev => prev.map(i => i.id === issueData.id ? { ...i, ...issueData } : i)); return;
      }
    }
    // Offline fallback
    if (issueData.id && !issueData.id.startsWith('iss-')) {
      setIssues(prev => prev.map(i => i.id === issueData.id ? { ...i, ...issueData } : i));
    } else {
      setIssues(prev => [...prev, { ...issueData, id: `iss-${Date.now()}`, sort_order: issues.length + 1, created_at: new Date().toISOString() }]);
    }
  };

  const deleteIssue = async (id) => {
    setIssues(issues.filter(i => i.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('issues').delete().eq('id', id);
    }
  };

  const reorderIssues = (reorderedList) => {
    const updated = reorderedList.map((item, index) => ({ ...item, sort_order: index + 1 }));
    setIssues(updated);
    if (isSupabaseConfigured && supabase) {
      updated.forEach(item => supabase.from('issues').update({ sort_order: item.sort_order }).eq('id', item.id));
    }
  };

  // Articles
  const saveArticle = async (articleData) => {
    if (isSupabaseConfigured && supabase) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isNew = !articleData.id || articleData.id.startsWith('art-');
      if (isNew) {
        // Strip fake local id and invalid foreign keys
        const { id: _fakeId, ...rest } = articleData;
        const payload = {
          ...rest,
          issue_id: rest.issue_id && uuidRegex.test(rest.issue_id) ? rest.issue_id : null,
          // Convert empty date strings to null — Supabase DATE columns reject ""
          received_date: rest.received_date || null,
          revised_date: rest.revised_date || null,
          accepted_date: rest.accepted_date || null,
          published_date: rest.published_date || null,
          sort_order: articles.length + 1,
          created_at: new Date().toISOString()
        };
        const { data: inserted, error } = await supabase.from('articles').insert(payload).select();
        if (error) {
          console.error('Article insert error:', error.message, error.details);
          throw new Error(`Supabase insert failed: ${error.message}`);
        } else if (inserted && inserted.length > 0) {
          const normalized = normalizeArticles(inserted)[0];
          setArticles(prev => [normalized, ...prev]);
          return;
        }
      } else {
        // Real UUID — update in place
        const { error } = await supabase.from('articles').update(articleData).eq('id', articleData.id);
        if (error) console.error('Article update error:', error.message);
        setArticles(prev => prev.map(a => a.id === articleData.id ? { ...a, ...normalizeArticles([articleData])[0] } : a));
        return;
      }
    }
    // Offline / no Supabase fallback — use local id
    if (articleData.id && !articleData.id.startsWith('art-')) {
      setArticles(prev => prev.map(a => a.id === articleData.id ? { ...a, ...articleData } : a));
    } else {
      const newArt = { ...articleData, id: `art-${Date.now()}`, sort_order: articles.length + 1, created_at: new Date().toISOString() };
      setArticles(prev => [newArt, ...prev]);
    }
  };

  const deleteArticle = async (id) => {
    setArticles(articles.filter(a => a.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('articles').delete().eq('id', id);
    }
  };

  const toggleArticlePublish = async (id) => {
    const updated = articles.map(a => a.id === id ? { ...a, is_published: !a.is_published } : a);
    setArticles(updated);
    const target = updated.find(a => a.id === id);
    if (isSupabaseConfigured && supabase && target) {
      await supabase.from('articles').update({ is_published: target.is_published }).eq('id', id);
    }
  };

  const moveArticle = async (articleId, newIssueId) => {
    const updated = articles.map(a => a.id === articleId ? { ...a, issue_id: newIssueId } : a);
    setArticles(updated);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('articles').update({ issue_id: newIssueId }).eq('id', articleId);
    }
  };

  const reorderArticles = (reorderedList) => {
    const updated = articles.map(a => {
      const found = reorderedList.find(r => r.id === a.id);
      return found ? { ...a, sort_order: found.sort_order } : a;
    });
    setArticles(updated);
    if (isSupabaseConfigured && supabase) {
      reorderedList.forEach(item => supabase.from('articles').update({ sort_order: item.sort_order }).eq('id', item.id));
    }
  };

  // Test Storage Buckets Access
  const testStorageBuckets = async () => {
    if (!isSupabaseConfigured || !supabase) {
      alert('⚠️ Supabase not configured');
      return;
    }

    console.log('🧪 Testing Supabase Storage buckets...');
    
    const requiredBuckets = ['manuscripts', 'journal-images', 'published-papers'];
    const results = [];

    for (const bucketName of requiredBuckets) {
      try {
        // Try to list files in bucket to test access
        const { data, error } = await supabase.storage.from(bucketName).list('', { limit: 1 });
        
        if (error) {
          results.push(`❌ ${bucketName}: ${error.message}`);
          console.error(`❌ Bucket "${bucketName}" error:`, error);
        } else {
          results.push(`✅ ${bucketName}: OK (${data.length} files listed)`);
          console.log(`✅ Bucket "${bucketName}" accessible`);
        }
      } catch (ex) {
        results.push(`❌ ${bucketName}: ${ex.message || 'Unknown error'}`);
        console.error(`❌ Bucket "${bucketName}" exception:`, ex);
      }
    }

    alert('🧪 STORAGE BUCKETS TEST RESULTS:\n\n' + results.join('\n') + '\n\n📋 If any buckets show errors, create them in:\nSupabase Dashboard → Storage → New Bucket');
    return results;
  };

  // Editorial Members
  const saveEditorialMember = async (memberData) => {
    if (isSupabaseConfigured && supabase) {
      const isNew = !memberData.id || memberData.id.startsWith('ed-');

      // If photo is base64, upload to Supabase Storage first
      let finalPhotoUrl = memberData.photo_url || '';
      if (memberData.photo_url?.startsWith('data:')) {
        try {
          console.log('📤 Uploading base64 photo to Supabase Storage...');
          
          // Convert base64 to blob
          const res = await fetch(memberData.photo_url);
          const blob = await res.blob();
          const ext = blob.type.includes('png') ? 'png' : 'jpg';
          const fileName = `editorial/${Date.now()}.${ext}`;
          
          console.log(`📁 Uploading file: ${fileName} (${blob.size} bytes, ${blob.type})`);
          
          const { data: uploaded, error: uploadErr } = await supabase.storage
            .from('journal-images')
            .upload(fileName, blob, { contentType: blob.type, upsert: true });
            
          if (uploadErr) {
            console.error('❌ Upload error:', uploadErr);
            throw new Error(`Upload failed: ${uploadErr.message}`);
          }
          
          if (uploaded) {
            const { data: { publicUrl } } = supabase.storage.from('journal-images').getPublicUrl(fileName);
            console.log('✅ Photo uploaded successfully:', publicUrl);
            finalPhotoUrl = publicUrl;
          } else {
            throw new Error('Upload succeeded but no data returned');
          }
          
        } catch (uploadEx) {
          console.error('❌ Editorial photo upload failed:', uploadEx);
          
          // Check if it's a bucket not found error
          if (uploadEx.message && (uploadEx.message.includes('bucket') || uploadEx.message.includes('not found'))) {
            console.error('🚨 BUCKET ERROR: journal-images bucket not found in Supabase Storage');
            alert('⚠️ STORAGE SETUP REQUIRED\n\nThe "journal-images" bucket is missing from your Supabase Storage.\n\n📋 TO FIX:\n1. Go to Supabase Dashboard → Storage\n2. Create new bucket: "journal-images"\n3. Set as Public: ✅ Yes\n4. Max file size: 5MB\n5. Try uploading again');
          } else {
            alert('⚠️ Photo upload failed: ' + (uploadEx.message || 'Unknown error') + '\n\nSaving member with base64 photo for now. Create the journal-images bucket to store photos properly.');
          }
          
          // Keep the base64 as fallback if upload fails
          console.log('📝 Keeping base64 photo as fallback due to upload failure');
          finalPhotoUrl = memberData.photo_url;
        }
      }

      const supabasePayload = { ...memberData, photo_url: finalPhotoUrl };

      if (isNew) {
        const { id: _, ...rest } = supabasePayload;
        const payload = { ...rest, sort_order: editorialMembers.length + 1 };
        const { data: inserted, error } = await supabase.from('editorial_members').insert(payload).select().single();
        if (!error && inserted) {
          setEditorialMembers(prev => [...prev, { ...inserted, photo_url: finalPhotoUrl || memberData.photo_url || '' }]);
          return;
        }
      } else {
        const { error } = await supabase.from('editorial_members').update(supabasePayload).eq('id', memberData.id);
        if (!error) {
          setEditorialMembers(prev => prev.map(m => m.id === memberData.id ? { ...m, ...memberData, photo_url: finalPhotoUrl || memberData.photo_url || '' } : m));
          return;
        }
        console.error('Editorial member update error');
      }
    }
    // Offline fallback
    if (memberData.id && !memberData.id.startsWith('ed-')) {
      setEditorialMembers(prev => prev.map(m => m.id === memberData.id ? { ...m, ...memberData } : m));
    } else {
      setEditorialMembers(prev => [...prev, { ...memberData, id: `ed-${Date.now()}`, sort_order: editorialMembers.length + 1 }]);
    }
  };

  const deleteEditorialMember = async (id) => {
    setEditorialMembers(editorialMembers.filter(m => m.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('editorial_members').delete().eq('id', id);
    }
  };

  const toggleEditorialActive = async (id) => {
    const updated = editorialMembers.map(m => m.id === id ? { ...m, is_active: !m.is_active } : m);
    setEditorialMembers(updated);
    const target = updated.find(m => m.id === id);
    if (isSupabaseConfigured && supabase && target) {
      await supabase.from('editorial_members').update({ is_active: target.is_active }).eq('id', id);
    }
  };

  const reorderEditorialMembers = (reorderedList) => {
    const updated = reorderedList.map((item, index) => ({ ...item, sort_order: index + 1 }));
    setEditorialMembers(updated);
    if (isSupabaseConfigured && supabase) {
      updated.forEach(item => supabase.from('editorial_members').update({ sort_order: item.sort_order }).eq('id', item.id));
    }
  };

  // Research Areas
  const saveResearchArea = async (raData) => {
    const normalized = {
      ...raData,
      subcategories: Array.isArray(raData.subcategories)
        ? raData.subcategories
        : typeof raData.subcategories === 'string'
        ? (() => { try { return JSON.parse(raData.subcategories); } catch { return []; } })()
        : [],
    };
    if (isSupabaseConfigured && supabase) {
      const isNew = !normalized.id || normalized.id.startsWith('ra-');
      if (isNew) {
        const { id: _, ...rest } = normalized;
        const payload = { ...rest, sort_order: researchAreas.length + 1 };
        const { data: inserted, error } = await supabase.from('research_areas').insert(payload).select().single();
        if (!error && inserted) { setResearchAreas(prev => [...prev, { ...inserted, subcategories: parseJsonField(inserted.subcategories) }]); return; }
      } else {
        await supabase.from('research_areas').update(normalized).eq('id', normalized.id);
        setResearchAreas(prev => prev.map(r => r.id === normalized.id ? { ...r, ...normalized } : r)); return;
      }
    }
    // Offline fallback
    if (normalized.id && !normalized.id.startsWith('ra-')) {
      setResearchAreas(prev => prev.map(r => r.id === normalized.id ? { ...r, ...normalized } : r));
    } else {
      setResearchAreas(prev => [...prev, { ...normalized, id: `ra-${Date.now()}`, sort_order: researchAreas.length + 1 }]);
    }
  };

  const deleteResearchArea = async (id) => {
    setResearchAreas(researchAreas.filter(r => r.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('research_areas').delete().eq('id', id);
    }
  };

  // CMS Page Content
  const savePageContent = async (pageKey, sectionKey, title, content) => {
    const existing = pageContents.find(p => p.page_key === pageKey && p.section_key === sectionKey);
    let updated;
    if (existing) {
      updated = pageContents.map(p => p.id === existing.id ? { ...p, title, content, updated_at: new Date().toISOString() } : p);
    } else {
      const newPg = { id: `pg-${Date.now()}`, page_key: pageKey, section_key: sectionKey, title, content, updated_at: new Date().toISOString() };
      updated = [...pageContents, newPg];
    }
    setPageContents(updated);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('page_content').upsert({ page_key: pageKey, section_key: sectionKey, title, content });
    }
  };

  // Media Management
  const addMediaItem = async (mediaData) => {
    const newMed = { ...mediaData, id: `med-${Date.now()}`, uploaded_at: new Date().toISOString() };
    setMediaItems([newMed, ...mediaItems]);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('media').insert(mediaData);
    }
    return newMed;
  };

  const deleteMediaItem = async (id) => {
    setMediaItems(mediaItems.filter(m => m.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('media').delete().eq('id', id);
    }
  };

  // Theses
  const saveThesis = async (thesisData) => {
    const normalized = {
      ...thesisData,
      guide_names: Array.isArray(thesisData.guide_names)
        ? thesisData.guide_names
        : thesisData.guide_names.split(',').map(g => g.trim()).filter(Boolean),
      keywords: Array.isArray(thesisData.keywords)
        ? thesisData.keywords
        : thesisData.keywords.split(',').map(k => k.trim()).filter(Boolean),
    };
    if (isSupabaseConfigured && supabase) {
      const isNew = !normalized.id || normalized.id.startsWith('thesis-');
      if (isNew) {
        const { id: _, ...rest } = normalized;
        const payload = { ...rest, created_at: new Date().toISOString() };
        const { data: inserted, error } = await supabase.from('theses').insert(payload).select().single();
        if (!error && inserted) {
          setTheses(prev => [{ ...inserted, guide_names: parseJsonField(inserted.guide_names), keywords: parseJsonField(inserted.keywords) }, ...prev]);
          return;
        }
      } else {
        await supabase.from('theses').update(normalized).eq('id', normalized.id);
        setTheses(prev => prev.map(t => t.id === normalized.id ? { ...t, ...normalized } : t)); return;
      }
    }
    // Offline fallback
    if (normalized.id && !normalized.id.startsWith('thesis-')) {
      setTheses(prev => prev.map(t => t.id === normalized.id ? { ...t, ...normalized } : t));
    } else {
      setTheses(prev => [{ ...normalized, id: `thesis-${Date.now()}`, created_at: new Date().toISOString() }, ...prev]);
    }
  };

  // Paper Submissions
  const submitPaper = async (submissionData, files) => {
    const storageWarnings = [];

    const saveDraftSubmission = (submissionId, submissionRecord, warningMessage) => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SUBMISSIONS) || '[]');
        const entry = {
          id: `local-${Date.now()}`,
          submission_id: submissionId,
          ...submissionRecord,
          status: 'SUBMITTED',
          submitted_date: submissionRecord.submitted_date || new Date().toISOString(),
          saved_locally_at: submissionRecord.saved_locally_at || new Date().toISOString(),
          warning: warningMessage || 'Saved locally while storage is unavailable.',
        };

        stored.unshift(entry);
        localStorage.setItem(STORAGE_KEYS.PENDING_SUBMISSIONS, JSON.stringify(stored.slice(0, 25)));
        return entry;
      } catch (localError) {
        console.warn('Local submission fallback failed:', localError);
        return null;
      }
    };

    try {
      if (!isSupabaseConfigured || !supabase) {
        const fallbackSubmissionId = `RJ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
        const fallbackRecord = {
          author_name: submissionData.author_name,
          author_email: submissionData.author_email,
          paper_title: submissionData.paper_title,
          abstract: submissionData.abstract,
          keywords: submissionData.keywords,
        };

        const fallback = saveDraftSubmission(
          fallbackSubmissionId,
          fallbackRecord,
          'Supabase is not configured. Submission was saved locally.'
        );

        return { success: true, submissionId: fallbackSubmissionId, submission: fallback, storageWarnings, savedLocally: true };
      }

      const { data: idData, error: idError } = await supabase.rpc('generate_submission_id');
      if (idError) throw new Error('Failed to generate submission ID');
      const submissionId = idData;

      let manuscriptUrl = null, manuscriptFilename = null;
      let coverLetterUrl = null, coverLetterFilename = null;
      let copyrightUrl = null, copyrightFilename = null;

      const uploadResults = await Promise.all([
        files.manuscript_file
          ? uploadSubmissionFile({ client: supabase, bucket: 'manuscripts', submissionId, purpose: 'manuscript', file: files.manuscript_file })
          : Promise.resolve({ url: null, filename: null, status: 'skipped' }),
        files.cover_letter_file
          ? uploadSubmissionFile({ client: supabase, bucket: 'manuscripts', submissionId, purpose: 'cover-letter', file: files.cover_letter_file })
          : Promise.resolve({ url: null, filename: null, status: 'skipped' }),
        files.copyright_file
          ? uploadSubmissionFile({ client: supabase, bucket: 'manuscripts', submissionId, purpose: 'copyright', file: files.copyright_file })
          : Promise.resolve({ url: null, filename: null, status: 'skipped' }),
      ]);

      const [manuscriptUpload, coverLetterUpload, copyrightUpload] = uploadResults;

      if (manuscriptUpload.status === 'failed') {
        storageWarnings.push(`Manuscript upload warning: ${manuscriptUpload.error}`);
      } else {
        manuscriptUrl = manuscriptUpload.url;
        manuscriptFilename = manuscriptUpload.filename;
      }

      if (coverLetterUpload.status === 'failed') {
        storageWarnings.push(`Cover letter upload warning: ${coverLetterUpload.error}`);
      } else {
        coverLetterUrl = coverLetterUpload.url;
        coverLetterFilename = coverLetterUpload.filename;
      }

      if (copyrightUpload.status === 'failed') {
        storageWarnings.push(`Copyright form upload warning: ${copyrightUpload.error}`);
      } else {
        copyrightUrl = copyrightUpload.url;
        copyrightFilename = copyrightUpload.filename;
      }

      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          submission_id: submissionId,
          author_name: submissionData.author_name,
          author_email: submissionData.author_email,
          author_phone: submissionData.author_phone,
          author_affiliation: submissionData.author_affiliation,
          author_institution: submissionData.author_institution,
          author_country: submissionData.author_country,
          paper_title: submissionData.paper_title,
          abstract: submissionData.abstract,
          keywords: submissionData.keywords,
          manuscript_file_url: manuscriptUrl,
          manuscript_filename: manuscriptFilename,
          cover_letter_file_url: coverLetterUrl,
          cover_letter_filename: coverLetterFilename,
          copyright_file_url: copyrightUrl,
          copyright_filename: copyrightFilename,
          status: 'SUBMITTED',
        })
        .select()
        .single();

      if (submissionError) {
        const savedLocally = saveDraftSubmission(submissionId, {
          author_name: submissionData.author_name,
          author_email: submissionData.author_email,
          paper_title: submissionData.paper_title,
          abstract: submissionData.abstract,
          keywords: submissionData.keywords,
          manuscript_filename: manuscriptFilename,
        }, 'Submission was saved locally because the database insert failed.');
        return { success: true, submissionId, submission: savedLocally, storageWarnings, savedLocally: true };
      }

      if (submissionData.coAuthors && submissionData.coAuthors.length > 0) {
        const coAuthorsData = submissionData.coAuthors.map((ca, idx) => ({
          submission_id: submission.id,
          name: ca.name,
          email: ca.email,
          affiliation: ca.affiliation || '',
          institution: ca.institution || '',
          country: ca.country || '',
          author_order: idx + 2,
        }));

        const { error: coAuthorsError } = await supabase
          .from('submission_authors')
          .insert(coAuthorsData);

        if (coAuthorsError) console.warn('Failed to insert co-authors:', coAuthorsError);
      }

      // Send submission notification to editorial team ONLY after successful database storage
      try {
        console.log('📧 Sending submission notification to editorial team...');
        const notificationResult = await emailService.sendSubmissionNotification({
          submission_id: submissionId,
          author_name: submissionData.author_name,
          author_email: submissionData.author_email,
          paper_title: submissionData.paper_title,
          abstract: submissionData.abstract,
          keywords: submissionData.keywords
        });
        
        console.log('📧 Submission notification result:', notificationResult);
        if (notificationResult.success && notificationResult.method === 'emailjs') {
          console.log('✅ Editorial team notified successfully via EmailJS');
        } else if (notificationResult.method === 'console') {
          console.log('⚠️ Email notification logged to console (EmailJS not configured)');
        }
      } catch (emailError) {
        // Don't fail the submission if email fails - just log the error
        console.error('⚠️ Failed to send submission notification (submission still succeeded):', emailError);
      }

      return { success: true, submissionId, submission, storageWarnings, savedLocally: false };
    } catch (error) {
      console.error('Submission failed:', error);
      const fallbackSubmissionId = `RJ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
      const savedLocally = saveDraftSubmission(fallbackSubmissionId, {
        author_name: submissionData.author_name,
        author_email: submissionData.author_email,
        paper_title: submissionData.paper_title,
        abstract: submissionData.abstract,
        keywords: submissionData.keywords,
      }, 'Submission was saved locally after a processing error.');
      return { success: true, submissionId: fallbackSubmissionId, submission: savedLocally, storageWarnings, savedLocally: true };
    }
  };

  const fetchSubmissions = async () => {
    const localSubmissions = getPendingLocalSubmissions();

    if (!isSupabaseConfigured || !supabase) {
      return localSubmissions;
    }

    try {
      const { data: submissions, error } = await supabase
        .from('submissions')
        .select(`
          *,
          submission_authors (
            id,
            name,
            email,
            affiliation,
            institution,
            country,
            author_order
          )
        `)
        .order('submitted_date', { ascending: false });

      if (error) throw error;

      const normalizedDb = (submissions || []).map(sub => ({
        ...sub,
        coAuthors: sub.submission_authors || [],
      }));

      const merged = [...normalizedDb, ...localSubmissions];
      const submissionMap = new Map();

      merged.forEach((sub) => {
        const key = (sub.submission_id || sub.id || '').toString();
        if (!key) return;

        const candidate = {
          ...sub,
          submitted_date: sub.submitted_date || sub.saved_locally_at || new Date().toISOString(),
          coAuthors: Array.isArray(sub.coAuthors) ? sub.coAuthors : [],
        };

        const existing = submissionMap.get(key);
        if (!existing || (existing.id && String(existing.id).startsWith('local-') && !(String(sub.id).startsWith('local-')))) {
          submissionMap.set(key, candidate);
        } else if (!existing) {
          submissionMap.set(key, candidate);
        }
      });

      return [...submissionMap.values()].sort((a, b) => new Date(b.submitted_date || 0) - new Date(a.submitted_date || 0));
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      return localSubmissions;
    }
  };

  const updateSubmissionStatus = async (submissionId, newStatus) => {
    if (!submissionId) {
      throw new Error('Submission ID is required');
    }

    if (String(submissionId).startsWith('local-')) {
      const updated = updatePendingLocalSubmissionStatus(submissionId, newStatus);
      if (updated) return { success: true };
      throw new Error('Local submission could not be updated');
    }

    if (!isSupabaseConfigured || !supabase) {
      const fallbackUpdated = updatePendingLocalSubmissionStatus(submissionId, newStatus);
      if (fallbackUpdated) return { success: true };
      return { success: false };
    }

    try {
      const updateData = { status: newStatus };

      if (newStatus === 'UNDER REVIEW') updateData.reviewed_date = new Date().toISOString();
      if (newStatus === 'ACCEPTED') updateData.accepted_date = new Date().toISOString();
      if (newStatus === 'PUBLISHED') updateData.published_date = new Date().toISOString();

      const { data, error } = await supabase
        .from('submissions')
        .update(updateData)
        .eq('id', submissionId)
        .select();

      if (error) {
        const localUpdated = updatePendingLocalSubmissionStatus(submissionId, newStatus);
        if (localUpdated) return { success: true };
        throw error;
      }

      if (!data || data.length === 0) {
        const localUpdated = updatePendingLocalSubmissionStatus(submissionId, newStatus);
        if (localUpdated) return { success: true };
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to update submission status:', error);
      throw error;
    }
  };

  const convertSubmissionToPublishedArticle = async (submission) => {
    if (!submission) {
      throw new Error('Submission is required');
    }

    const duplicate = articles.some((article) => {
      const titleMatch = article.title && article.title.toLowerCase() === (submission.paper_title || '').toLowerCase();
      const doiMatch = article.doi && submission.submission_id && article.doi.includes(submission.submission_id);
      return titleMatch || doiMatch;
    });

    if (duplicate) {
      await updateSubmissionStatus(submission.id || submission.submission_id, 'PUBLISHED');
      return { success: true, duplicated: true };
    }

    const authors = [
      {
        name: submission.author_name || 'Author',
        affiliation: submission.author_affiliation || submission.author_institution || '',
        email: submission.author_email || '',
        orcid: '',
        is_corresponding: true,
      },
      ...(Array.isArray(submission.coAuthors) ? submission.coAuthors.map((coAuthor) => ({
        name: coAuthor.name || '',
        affiliation: coAuthor.affiliation || coAuthor.institution || '',
        email: coAuthor.email || '',
        orcid: '',
        is_corresponding: false,
      })) : [])
    ].filter((author) => author.name);

    const articlePayload = {
      id: `art-${Date.now()}`,
      title: submission.paper_title || 'Untitled Paper',
      issue_id: issues[0]?.id || '',
      authors,
      corresponding_author: submission.author_name || authors[0]?.name || 'Author',
      corresponding_author_email: submission.author_email || authors[0]?.email || '',
      abstract: submission.abstract || '',
      keywords: Array.isArray(submission.keywords) 
        ? submission.keywords 
        : (submission.keywords || '').split(',').map(k => k.trim()).filter(k => k),
      research_area: researchAreas[0]?.category || 'Commerce & Management',
      article_type: 'Research Paper',
      received_date: submission.submitted_date ? new Date(submission.submitted_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      revised_date: '',
      accepted_date: new Date().toISOString().split('T')[0],
      published_date: new Date().toISOString().split('T')[0],
      doi: `10.5281/ijcast.${(submission.submission_id || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 20) || Date.now()}`,
      page_numbers: '1-12',
      pdf_url: submission.manuscript_file_url || '',
      html_content: '',
      article_references: '',
      is_published: true,
      created_at: new Date().toISOString(),
      sort_order: articles.length + 1,
    };

    await saveArticle(articlePayload);
    await updateSubmissionStatus(submission.id || submission.submission_id, 'PUBLISHED');
    
    // Send automatic publication notification email
    try {
      const emailResult = await sendPublicationNotificationEmail(submission, articlePayload);
      console.log('📧 Automatic publication notification:', emailResult);
    } catch (emailError) {
      console.warn('⚠️ Publication notification failed (not blocking):', emailError);
    }
    
    return { success: true, article: articlePayload };
  };

  // Send acceptance email with payment link
  const sendAcceptanceEmail = async (submission) => {
    try {
      console.log('📧 Sending acceptance email for submission:', submission.submission_id);
      
      // Use the email service to send real emails
      const result = await emailService.sendAcceptanceEmail(submission);
      
      if (result.success) {
        console.log(`✅ Acceptance email sent via ${result.method}:`, {
          to: submission.author_email,
          cc: ['editor.ijcast.in@gmail.com', 'gyanakshar16092026@gmail.com'],
          paymentUrl: result.paymentUrl
        });
        
        return { 
          success: true, 
          emailSent: true, 
          method: result.method,
          paymentUrl: result.paymentUrl 
        };
      } else {
        throw new Error('Email service returned failure');
      }
    } catch (error) {
      console.error('Failed to send acceptance email:', error);
      throw new Error('Failed to send acceptance email: ' + error.message);
    }
  };

  // Send publication notification email to author
  const sendPublicationNotificationEmail = async (submission, article) => {
    try {
      console.log('📧 Sending publication notification for:', submission.submission_id);
      
      // Use the email service to send publication notification
      const result = await emailService.sendPublicationNotificationEmail(submission, article);
      
      if (result.success) {
        console.log(`✅ Publication notification sent via ${result.method}:`, {
          to: submission.author_email,
          cc: ['editor.ijcast.in@gmail.com', 'gyanakshar16092026@gmail.com'],
          article: article.id
        });
        
        return { 
          success: true, 
          emailSent: true, 
          method: result.method,
          messageId: result.messageId 
        };
      } else {
        throw new Error('Email service returned failure');
      }
    } catch (error) {
      console.error('Failed to send publication notification:', error);
      return { success: false, error: error.message };
    }
  };
  const checkPaymentStatus = async (submissionId) => {
    try {
      console.log('Checking payment status for submission:', submissionId);
      
      // Call the API to check payment status
      const response = await fetch(`/api?action=status&manuscriptId=${submissionId}`);
      const result = await response.json();
      
      if (result.success && result.paid) {
        return {
          paid: true,
          amount: result.amount,
          paymentId: result.paymentId,
          paidAt: result.paidAt
        };
      } else {
        return { 
          paid: false, 
          message: result.message || 'No payment found' 
        };
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
      throw new Error('Failed to check payment status');
    }
  };

  // Sync all local articles to Supabase (one-time migration)
  const syncArticlesToSupabase = async () => {
    if (!isSupabaseConfigured || !supabase) return { success: false, message: 'Supabase not configured' };
    try {
      // Delete all existing rows first to avoid duplicates
      await supabase.from('articles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Clean articles: strip fake local IDs and fake foreign key references
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const cleaned = articles.map(({ id, ...rest }) => ({
        ...rest,
        issue_id: null, // Always null during sync — issues table may be empty
        received_date: rest.received_date || null,
        revised_date: rest.revised_date || null,
        accepted_date: rest.accepted_date || null,
        published_date: rest.published_date || null,
      }));

      const { data: inserted, error } = await supabase.from('articles').insert(cleaned).select();
      if (error) return { success: false, message: error.message };
      if (inserted) {
        const normalized = normalizeArticles(inserted);
        setArticles(normalized);
        return { success: true, count: normalized.length };
      }
      return { success: false, message: 'No data returned from insert' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteThesis = async (id) => {    setTheses(theses.filter(t => t.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('theses').delete().eq('id', id);
    }
  };

  const toggleThesisPublish = async (id) => {
    const updated = theses.map(t => t.id === id ? { ...t, is_published: !t.is_published } : t);
    setTheses(updated);
    const target = updated.find(t => t.id === id);
    if (isSupabaseConfigured && supabase && target) {
      await supabase.from('theses').update({ is_published: target.is_published }).eq('id', id);
    }
  };

  // Conferences CRUD
  const saveConference = async (data) => {
    const normalized = {
      ...data,
      research_areas: Array.isArray(data.research_areas) ? data.research_areas : (data.research_areas || '').split(',').map(s => s.trim()).filter(Boolean),
      paper_titles: Array.isArray(data.paper_titles) ? data.paper_titles : (data.paper_titles || '').split('\n').map(s => s.trim()).filter(Boolean),
    };
    const isNew = !normalized.id || normalized.id.startsWith('conf-');
    if (isSupabaseConfigured && supabase) {
      if (isNew) {
        const { id: _, ...rest } = normalized;
        const { data: inserted, error } = await supabase.from('conferences').insert({ ...rest, created_at: new Date().toISOString() }).select().single();
        if (!error && inserted) {
          setConferences(prev => [{ ...inserted, research_areas: parseJsonField(inserted.research_areas), paper_titles: parseJsonField(inserted.paper_titles) }, ...prev]);
          return;
        }
      } else {
        await supabase.from('conferences').update(normalized).eq('id', normalized.id);
        setConferences(prev => prev.map(c => c.id === normalized.id ? { ...c, ...normalized } : c));
        return;
      }
    }
    if (isNew) {
      setConferences(prev => [{ ...normalized, id: `conf-${Date.now()}`, created_at: new Date().toISOString() }, ...prev]);
    } else {
      setConferences(prev => prev.map(c => c.id === normalized.id ? { ...c, ...normalized } : c));
    }
  };

  const deleteConference = async (id) => {
    setConferences(prev => prev.filter(c => c.id !== id));
    if (isSupabaseConfigured && supabase) await supabase.from('conferences').delete().eq('id', id);
  };

  // Announcements CRUD
  const saveAnnouncement = async (data) => {
    const isNew = !data.id || data.id.startsWith('ann-');
    if (isSupabaseConfigured && supabase) {
      if (isNew) {
        const { id: _, ...rest } = data;
        const { data: inserted, error } = await supabase.from('announcements').insert({ ...rest, created_at: new Date().toISOString() }).select().single();
        if (!error && inserted) { setAnnouncements(prev => [inserted, ...prev]); return; }
      } else {
        await supabase.from('announcements').update(data).eq('id', data.id);
        setAnnouncements(prev => prev.map(a => a.id === data.id ? { ...a, ...data } : a)); return;
      }
    }
    if (isNew) {
      setAnnouncements(prev => [{ ...data, id: `ann-${Date.now()}`, created_at: new Date().toISOString() }, ...prev]);
    } else {
      setAnnouncements(prev => prev.map(a => a.id === data.id ? { ...a, ...data } : a));
    }
  };

  const deleteAnnouncement = async (id) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    if (isSupabaseConfigured && supabase) await supabase.from('announcements').delete().eq('id', id);
  };

  const toggleAnnouncement = async (id) => {
    const updated = announcements.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a);
    setAnnouncements(updated);
    const target = updated.find(a => a.id === id);
    if (isSupabaseConfigured && supabase && target) await supabase.from('announcements').update({ is_active: target.is_active }).eq('id', id);
  };

  const value = {
    settings,
    updateSettings,
    volumes,
    saveVolume,
    deleteVolume,
    issues,
    saveIssue,
    deleteIssue,
    reorderIssues,
    articles,
    saveArticle,
    deleteArticle,
    toggleArticlePublish,
    moveArticle,
    reorderArticles,
    syncArticlesToSupabase,
    editorialMembers,
    saveEditorialMember,
    deleteEditorialMember,
    toggleEditorialActive,
    reorderEditorialMembers,
    researchAreas,
    saveResearchArea,
    deleteResearchArea,
    pageContents,
    savePageContent,
    mediaItems,
    addMediaItem,
    deleteMediaItem,
    theses,
    saveThesis,
    deleteThesis,
    toggleThesisPublish,
    adminSession,
    loginAdmin,
    logoutAdmin,
    isSearchOpen,
    setIsSearchOpen,
    isSubmitOpen,
    setIsSubmitOpen,
    pdfModalData,
    setPdfModalData,
    isLoading,
    announcements,
    saveAnnouncement,
    deleteAnnouncement,
    toggleAnnouncement,
    conferences,
    saveConference,
    deleteConference,
    // Paper Submissions
    submitPaper,
    fetchSubmissions,
    updateSubmissionStatus,
    convertSubmissionToPublishedArticle,
    sendAcceptanceEmail,
    sendPublicationNotificationEmail,
    checkPaymentStatus,
    testStorageBuckets
  };

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};
