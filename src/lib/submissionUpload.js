export const uploadSubmissionFile = async ({ client, bucket, submissionId, purpose, file }) => {
  if (!file) {
    return { url: null, filename: null, status: 'skipped' };
  }

  const extension = (file.name || '').includes('.')
    ? file.name.split('.').pop()
    : 'pdf';

  const normalizedPurpose = purpose || 'file';
  const fileName = `${submissionId}-${normalizedPurpose}.${extension}`;

  try {
    const { error } = await client.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (error) {
      return {
        url: null,
        filename: file.name,
        status: 'failed',
        error: error.message || 'Storage upload failed',
      };
    }

    const { data } = client.storage.from(bucket).getPublicUrl(fileName);

    return {
      url: data?.publicUrl || null,
      filename: file.name,
      status: 'uploaded',
    };
  } catch (error) {
    return {
      url: null,
      filename: file.name,
      status: 'failed',
      error: error?.message || 'Storage upload failed',
    };
  }
};
