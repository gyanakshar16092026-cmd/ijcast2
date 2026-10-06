import test from 'node:test';
import assert from 'node:assert/strict';

import { uploadSubmissionFile } from '../src/lib/submissionUpload.js';
import { getPendingLocalSubmissions, updatePendingLocalSubmissionStatus } from '../src/lib/supabase.js';

test('getPendingLocalSubmissions reads saved local entries', () => {
  const original = global.localStorage;
  global.localStorage = {
    getItem: (key) => {
      if (key === 'ijcast_pending_submissions') {
        return JSON.stringify([
          {
            id: 'local-1',
            submission_id: 'RJ-2026-0001',
            author_name: 'Alice',
            paper_title: 'Local fallback paper',
            status: 'SUBMITTED',
            submitted_date: '2026-10-01T00:00:00.000Z',
          },
        ]);
      }
      return null;
    },
    setItem: () => {},
    removeItem: () => {},
  };

  try {
    const subs = getPendingLocalSubmissions();
    assert.equal(subs.length, 1);
    assert.equal(subs[0].submission_id, 'RJ-2026-0001');
  } finally {
    global.localStorage = original;
  }
});

test('updatePendingLocalSubmissionStatus updates a fallback submission', () => {
  const original = global.localStorage;
  global.localStorage = {
    getItem: (key) => {
      if (key === 'ijcast_pending_submissions') {
        return JSON.stringify([
          {
            id: 'local-1',
            submission_id: 'RJ-2026-0001',
            author_name: 'Alice',
            paper_title: 'Local fallback paper',
            status: 'SUBMITTED',
            submitted_date: '2026-10-01T00:00:00.000Z',
          },
        ]);
      }
      return null;
    },
    setItem: (_key, value) => {
      global.localStorage.__lastSet = value;
    },
    removeItem: () => {},
  };

  try {
    const updated = updatePendingLocalSubmissionStatus('local-1', 'UNDER REVIEW');
    assert.equal(updated, true);
    const current = JSON.parse(global.localStorage.__lastSet);
    assert.equal(current[0].status, 'UNDER REVIEW');
  } finally {
    global.localStorage = original;
  }
});

test('uploadSubmissionFile does not throw when storage upload fails', async () => {
  const file = new File(['hello world'], 'demo.pdf', { type: 'application/pdf' });

  const client = {
    storage: {
      from: () => ({
        upload: async () => ({ error: { message: 'Bucket missing or access denied' } }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/fallback.pdf' } }),
      }),
    },
  };

  const result = await uploadSubmissionFile({
    client,
    bucket: 'manuscripts',
    submissionId: 'RJ-2026-0001',
    purpose: 'manuscript',
    file,
  });

  assert.equal(result.status, 'failed');
  assert.equal(result.url, null);
  assert.equal(result.filename, 'demo.pdf');
  assert.ok(result.error);
});
