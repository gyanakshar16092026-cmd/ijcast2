import React, { useState, useEffect } from 'react';
import { useJournal } from '../../context/JournalContext';
import { supabase } from '../../lib/supabase';

const SubmissionDiagnostic = () => {
  const { fetchSubmissions } = useJournal();
  const [submissions, setSubmissions] = useState([]);
  const [bucketExists, setBucketExists] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostic = async () => {
      setLoading(true);
      
      // Check if manuscripts bucket exists
      if (supabase) {
        try {
          const { data: buckets, error } = await supabase.storage.listBuckets();
          const manuscriptsBucket = buckets?.find(b => b.name === 'manuscripts');
          setBucketExists(!!manuscriptsBucket);
          console.log('📦 Storage Buckets:', buckets);
          console.log('📄 Manuscripts Bucket:', manuscriptsBucket);
        } catch (error) {
          console.error('❌ Failed to check buckets:', error);
          setBucketExists(false);
        }
      }

      // Fetch submissions to check file URLs
      try {
        const subs = await fetchSubmissions();
        setSubmissions(subs);
        console.log('📋 Submissions:', subs);
      } catch (error) {
        console.error('❌ Failed to fetch submissions:', error);
      }
      
      setLoading(false);
    };

    runDiagnostic();
  }, [fetchSubmissions]);

  const testStorageUpload = async () => {
    if (!supabase) {
      alert('Supabase not configured');
      return;
    }

    try {
      // Create a test file
      const testContent = 'This is a test file for storage diagnostic';
      const testFile = new Blob([testContent], { type: 'text/plain' });
      const fileName = `test-${Date.now()}.txt`;

      console.log('🧪 Testing storage upload...');
      
      const { error } = await supabase.storage
        .from('manuscripts')
        .upload(fileName, testFile, {
          contentType: 'text/plain',
          upsert: true,
        });

      if (error) {
        console.error('❌ Test upload failed:', error);
        alert(`Storage test failed: ${error.message}`);
      } else {
        console.log('✅ Test upload successful');
        alert('Storage test successful! Files can be uploaded.');
        
        // Clean up test file
        await supabase.storage.from('manuscripts').remove([fileName]);
      }
    } catch (error) {
      console.error('❌ Storage test error:', error);
      alert(`Storage test error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Running submission diagnostic...</p>
        </div>
      </div>
    );
  }

  const hasFileIssues = submissions.some(sub => 
    !sub.id?.toString().startsWith('local-') && 
    (!sub.manuscript_file_url && sub.manuscript_filename)
  );

  const localSubmissions = submissions.filter(sub => sub.id?.toString().startsWith('local-'));
  const dbSubmissions = submissions.filter(sub => !sub.id?.toString().startsWith('local-'));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <h3 className="text-lg font-semibold mb-4">📋 Submission File Diagnostic</h3>
      
      {/* Storage Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Storage Configuration:</h4>
        <div className="space-y-2 text-sm">
          <div className={`flex items-center space-x-2 ${supabase ? 'text-green-600' : 'text-red-600'}`}>
            <span>{supabase ? '✅' : '❌'}</span>
            <span>Supabase Client: {supabase ? 'Connected' : 'Not Configured'}</span>
          </div>
          <div className={`flex items-center space-x-2 ${bucketExists ? 'text-green-600' : bucketExists === false ? 'text-red-600' : 'text-yellow-600'}`}>
            <span>{bucketExists ? '✅' : bucketExists === false ? '❌' : '⏳'}</span>
            <span>Manuscripts Bucket: {bucketExists ? 'Exists' : bucketExists === false ? 'Missing' : 'Checking...'}</span>
          </div>
        </div>
        
        {supabase && (
          <button
            onClick={testStorageUpload}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
          >
            🧪 Test Storage Upload
          </button>
        )}
      </div>

      {/* Submissions Analysis */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Submissions Analysis:</h4>
        <div className="space-y-2 text-sm">
          <div>📊 Total Submissions: {submissions.length}</div>
          <div>💾 Local Submissions: {localSubmissions.length}</div>
          <div>🗄️ Database Submissions: {dbSubmissions.length}</div>
          <div className={hasFileIssues ? 'text-red-600' : 'text-green-600'}>
            📎 File Issues: {hasFileIssues ? 'Found problems' : 'No issues detected'}
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="space-y-3">
        <h4 className="font-medium">Recent Submissions (Last 5):</h4>
        {submissions.slice(0, 5).map(submission => (
          <div key={submission.id} className="border border-gray-200 rounded p-3 text-sm">
            <div className="font-medium">{submission.paper_title}</div>
            <div className="text-gray-600">ID: {submission.submission_id}</div>
            <div className="text-gray-600">Author: {submission.author_name}</div>
            <div className="mt-2 space-y-1">
              <div className={submission.manuscript_file_url ? 'text-green-600' : 'text-red-600'}>
                📄 Manuscript: {submission.manuscript_file_url ? '✅ URL Available' : '❌ No URL'}
                {submission.manuscript_filename && <span className="text-gray-500"> ({submission.manuscript_filename})</span>}
              </div>
              {submission.cover_letter_file_url && (
                <div className="text-green-600">
                  📝 Cover Letter: ✅ URL Available
                </div>
              )}
              {submission.copyright_file_url && (
                <div className="text-green-600">
                  📋 Copyright: ✅ URL Available
                </div>
              )}
              {submission.id?.toString().startsWith('local-') && (
                <div className="text-yellow-600">
                  ⚠️ This is a local submission (files may be lost)
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {(bucketExists === false || hasFileIssues) && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
          <h4 className="font-medium text-red-800 mb-2">🚨 Issues Found:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {bucketExists === false && (
              <li>• The "manuscripts" storage bucket is missing. Create it in your Supabase dashboard.</li>
            )}
            {hasFileIssues && (
              <li>• Some submissions have filenames but no download URLs. Files may have failed to upload.</li>
            )}
          </ul>
        </div>
      )}

      {bucketExists && !hasFileIssues && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <h4 className="font-medium text-green-800 mb-2">✅ Configuration Looks Good:</h4>
          <p className="text-sm text-green-700">
            Storage bucket exists and recent submissions have file URLs. PDF downloads should work in the admin interface.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubmissionDiagnostic;
