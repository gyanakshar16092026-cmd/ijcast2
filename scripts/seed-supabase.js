import { createClient } from '@supabase/supabase-js';
import {
  initialJournalSettings,
  initialResearchAreas,
  initialVolumes,
  initialIssues,
  initialArticles,
  initialEditorialMembers,
  initialPageContent,
  initialMedia
} from '../src/lib/mockData.js';

import dotenv from 'dotenv';
dotenv.config();

// SECURITY: Use environment variables instead of hardcoded credentials
// NOTE: The previous hardcoded credentials have been COMPROMISED and should be rotated
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ SECURITY ERROR: Supabase credentials not found in environment variables');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnectionAndSeed() {
  console.log('Testing connection to Supabase project...');
  
  try {
    const { data: set, error: setError } = await supabase.from('journal_settings').select('*');
    if (setError) {
      console.log('Note: Tables might not be created in Supabase SQL editor yet:', setError.message);
      console.log('Please copy and run the SQL script in supabase/schema.sql in your Supabase SQL Editor.');
      return;
    }
    
    console.log('Connected to Supabase successfully! Found existing settings rows:', set?.length || 0);

    if (set && set.length === 0) {
      console.log('Seeding initial journal settings...');
      await supabase.from('journal_settings').insert(initialJournalSettings);
    }
    
    const { data: ras } = await supabase.from('research_areas').select('*');
    if (ras && ras.length === 0) {
      console.log('Seeding research areas...');
      await supabase.from('research_areas').insert(initialResearchAreas);
    }

    console.log('Supabase check complete!');
  } catch (err) {
    console.error('Connection test error:', err.message);
  }
}

testConnectionAndSeed();
