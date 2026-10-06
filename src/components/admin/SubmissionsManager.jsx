import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, FileText, Mail, User, Calendar, CheckCircle, XCircle, Clock, CreditCard, Send } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';
import EmailTest from './EmailTest';
import SubmissionDiagnostic from './SubmissionDiagnostic';

export const SubmissionsManager = () => {
  const { fetchSubmissions, updateSubmissionStatus, convertSubmissionToPublishedArticle, sendAcceptanceEmail, checkPaymentStatus } = useJournal();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [emailModal, setEmailModal] = useState({ open: false, submission: null });
  const [previewUrl, setPreviewUrl] = useState(null);

  // Fetch submissions on component mount
  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await fetchSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'ALL', label: 'All Submissions', count: submissions.length },
    { value: 'SUBMITTED', label: 'Submitted', count: submissions.filter(s => s.status === 'SUBMITTED').length },
    { value: 'UNDER REVIEW', label: 'Under Review', count: submissions.filter(s => s.status === 'UNDER REVIEW').length },
    { value: 'REVISION REQUIRED', label: 'Revision Required', count: submissions.filter(s => s.status === 'REVISION REQUIRED').length },
    { value: 'ACCEPTED', label: 'Accepted', count: submissions.filter(s => s.status === 'ACCEPTED').length },
    { value: 'PAYMENT_PENDING', label: 'Payment Pending', count: submissions.filter(s => s.status === 'PAYMENT_PENDING').length },
    { value: 'PAYMENT_RECEIVED', label: 'Payment Received', count: submissions.filter(s => s.status === 'PAYMENT_RECEIVED').length },
    { value: 'REJECTED', label: 'Rejected', count: submissions.filter(s => s.status === 'REJECTED').length },
    { value: 'PUBLISHED', label: 'Published', count: submissions.filter(s => s.status === 'PUBLISHED').length },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'SUBMITTED': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'UNDER REVIEW': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'REVISION REQUIRED': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'ACCEPTED': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'PAYMENT_PENDING': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'PAYMENT_RECEIVED': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'REJECTED': 'bg-red-500/20 text-red-400 border-red-500/30',
      'PUBLISHED': 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'SUBMITTED': Clock,
      'UNDER REVIEW': FileText,
      'REVISION REQUIRED': FileText,
      'ACCEPTED': CheckCircle,
      'PAYMENT_PENDING': CreditCard,
      'PAYMENT_RECEIVED': CheckCircle,
      'REJECTED': XCircle,
      'PUBLISHED': CheckCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = searchTerm === '' || 
      sub.paper_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.submission_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (submissionId, newStatus) => {
    try {
      await updateSubmissionStatus(submissionId, newStatus);
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId ? { ...sub, status: newStatus } : sub
      ));
      if (selectedSubmission && selectedSubmission.id === submissionId) {
        setSelectedSubmission({ ...selectedSubmission, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update submission status');
    }
  };

  const handlePublishSubmission = async (submission) => {
    try {
      const result = await convertSubmissionToPublishedArticle(submission);
      if (result?.success) {
        const nextStatus = 'PUBLISHED';
        await updateSubmissionStatus(submission.id || submission.submission_id, nextStatus);
        setSubmissions(prev => prev.map(sub => 
          (sub.id === submission.id || sub.submission_id === submission.submission_id)
            ? { ...sub, status: nextStatus }
            : sub
        ));
        if (selectedSubmission) {
          setSelectedSubmission({ ...selectedSubmission, status: nextStatus });
        }
        alert('Paper published and added to website successfully.');
      }
    } catch (error) {
      console.error('Failed to publish submission as article:', error);
      alert('Failed to publish paper to website.');
    }
  };

  const handleSendAcceptanceEmail = async (submission) => {
    setEmailModal({ open: true, submission });
  };

  const confirmSendEmail = async () => {
    console.log('🔄 Starting email send process...');
    console.log('Email modal submission:', emailModal.submission);
    
    try {
      const result = await sendAcceptanceEmail(emailModal.submission);
      console.log('📧 Email send result:', result);
      
      if (result?.success) {
        // Update status to PAYMENT_PENDING after sending acceptance email
        await updateSubmissionStatus(emailModal.submission.id, 'PAYMENT_PENDING');
        setSubmissions(prev => prev.map(sub => 
          sub.id === emailModal.submission.id 
            ? { ...sub, status: 'PAYMENT_PENDING' }
            : sub
        ));
        if (selectedSubmission && selectedSubmission.id === emailModal.submission.id) {
          setSelectedSubmission({ ...selectedSubmission, status: 'PAYMENT_PENDING' });
        }
        
        const method = result.method || 'unknown';
        alert(`Acceptance email sent successfully via ${method}! ${method === 'console' ? 'Check browser console for email content.' : 'Check email inboxes.'}`);
      }
    } catch (error) {
      console.error('Failed to send acceptance email:', error);
      alert('Failed to send acceptance email: ' + error.message);
    } finally {
      setEmailModal({ open: false, submission: null });
    }
  };

  const handleCheckPayment = async (submission) => {
    try {
      const paymentStatus = await checkPaymentStatus(submission.submission_id);
      if (paymentStatus?.paid) {
        // Payment confirmed - update to PAYMENT_RECEIVED
        await updateSubmissionStatus(submission.id, 'PAYMENT_RECEIVED');
        setSubmissions(prev => prev.map(sub => 
          sub.id === submission.id 
            ? { ...sub, status: 'PAYMENT_RECEIVED' }
            : sub
        ));
        if (selectedSubmission && selectedSubmission.id === submission.id) {
          setSelectedSubmission({ ...selectedSubmission, status: 'PAYMENT_RECEIVED' });
        }
        alert(`Payment confirmed! Amount: ₹${paymentStatus.amount}`);
      } else {
        alert('Payment not found or still pending.');
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
      alert('Failed to check payment status. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Diagnostic Components */}
      <SubmissionDiagnostic />
      <EmailTest />
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold font-serif text-white">Manuscript Submissions</h2>
        <p className="text-xs text-slate-400 mt-1">View and track manuscript submissions received through the website</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, author, or submission ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label} ({opt.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions Table/Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-amber-500 mb-4"></div>
            <p className="text-sm">Loading submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p className="text-sm">No submissions found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-xs text-amber-400 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 min-w-[900px]">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Submission ID</th>
                  <th className="p-4">Paper Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-amber-400">{sub.submission_id}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-white line-clamp-2 max-w-xs">{sub.paper_title}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-white">{sub.author_name}</p>
                      <p className="text-[11px] text-slate-400">{sub.author_institution}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1.5 text-slate-300">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(sub.submitted_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        title="View Details"
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-950 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="bg-slate-900 p-6 border-b border-slate-800 sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-mono font-bold text-amber-400 text-lg">{selectedSubmission.submission_id}</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center space-x-1.5 ${getStatusColor(selectedSubmission.status)}`}>
                      {getStatusIcon(selectedSubmission.status)}
                      <span>{selectedSubmission.status}</span>
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-serif">{selectedSubmission.paper_title}</h3>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-slate-400 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              
              {/* Author Information */}
              <section>
                <h4 className="text-sm font-bold text-amber-400 mb-4 flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Primary Author Information</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Name</p>
                    <p className="text-white font-semibold">{selectedSubmission.author_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Email</p>
                    {selectedSubmission.author_email ? (
                      <a href={`mailto:${selectedSubmission.author_email}`} className="text-amber-400 font-semibold hover:underline flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{selectedSubmission.author_email}</span>
                      </a>
                    ) : (
                      <p className="text-slate-500 text-xs">Not provided</p>
                    )}
                  </div>

                </div>
              </section>

              {/* Co-Authors */}
              {selectedSubmission.coAuthors && selectedSubmission.coAuthors.length > 0 && (
                <section>
                  <h4 className="text-sm font-bold text-amber-400 mb-3">Co-Authors</h4>
                  <div className="space-y-2">
                    {selectedSubmission.coAuthors.map((coAuthor, idx) => (
                      <div key={idx} className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <p className="text-white font-semibold text-sm">{coAuthor.name}</p>
                        <p className="text-slate-400 text-xs">{coAuthor.email} • {coAuthor.affiliation}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Paper Information */}
              <section>
                <h4 className="text-sm font-bold text-amber-400 mb-3">Paper Information</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Abstract</p>
                    <p className="text-white text-sm leading-relaxed">{selectedSubmission.abstract}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubmission.keywords.split(',').map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full border border-amber-500/30">
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Files */}
              <section>
                <h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Submitted Files</span>
                </h4>
                <div className="space-y-2">
                  {!selectedSubmission.manuscript_file_url && !selectedSubmission.cover_letter_file_url && !selectedSubmission.copyright_file_url && (
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
                      <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No files were uploaded with this submission</p>
                      <p className="text-slate-500 text-xs mt-1">
                        This may be due to storage configuration issues or the submission being saved locally
                      </p>
                      {/* Debug Information */}
                      <div className="mt-3 p-2 bg-slate-900 rounded text-xs text-left">
                        <div className="text-slate-400 mb-1">Debug Info:</div>
                        <div className="text-slate-300 font-mono space-y-1">
                          <div>Manuscript URL: {selectedSubmission.manuscript_file_url || 'null'}</div>
                          <div>Manuscript Filename: {selectedSubmission.manuscript_filename || 'null'}</div>
                          <div>Submission ID: {selectedSubmission.submission_id || 'null'}</div>
                          <div>Database ID: {selectedSubmission.id || 'null'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedSubmission.manuscript_file_url && (
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-amber-400" />
                          <div>
                            <p className="text-white font-semibold text-sm">Manuscript</p>
                            <p className="text-slate-400 text-xs">{selectedSubmission.manuscript_filename}</p>
                            {/* Show URL for debugging */}
                            <p className="text-slate-500 text-xs font-mono mt-1 break-all">
                              {selectedSubmission.manuscript_file_url}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              console.log('🔍 Opening PDF preview with URL:', selectedSubmission.manuscript_file_url);
                              setPreviewUrl(selectedSubmission.manuscript_file_url);
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <a
                            href={selectedSubmission.manuscript_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => console.log('📥 Downloading file from URL:', selectedSubmission.manuscript_file_url)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedSubmission.cover_letter_file_url && (
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-white font-semibold text-sm">Cover Letter</p>
                            <p className="text-slate-400 text-xs">{selectedSubmission.cover_letter_filename}</p>
                            <p className="text-slate-500 text-xs font-mono mt-1 break-all">
                              {selectedSubmission.cover_letter_file_url}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setPreviewUrl(selectedSubmission.cover_letter_file_url)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <a
                            href={selectedSubmission.cover_letter_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedSubmission.copyright_file_url && (
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-white font-semibold text-sm">Copyright Form</p>
                            <p className="text-slate-400 text-xs">{selectedSubmission.copyright_filename}</p>
                            <p className="text-slate-500 text-xs font-mono mt-1 break-all">
                              {selectedSubmission.copyright_file_url}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setPreviewUrl(selectedSubmission.copyright_file_url)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <a
                            href={selectedSubmission.copyright_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Actions */}
              <section className="flex justify-between items-center space-x-3 pt-4 border-t border-slate-800">
                <div className="flex space-x-3">
                  {/* Status Management */}
                  <select
                    value={selectedSubmission.status}
                    onChange={(e) => handleStatusChange(selectedSubmission.id, e.target.value)}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER REVIEW">Under Review</option>
                    <option value="REVISION REQUIRED">Revision Required</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="PAYMENT_PENDING">Payment Pending</option>
                    <option value="PAYMENT_RECEIVED">Payment Received</option>
                    <option value="REJECTED">Rejected</option>
                  </select>

                  {/* Send Acceptance Email - only for ACCEPTED status */}
                  {selectedSubmission.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleSendAcceptanceEmail(selectedSubmission)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Acceptance Email</span>
                    </button>
                  )}

                  {/* Check Payment - only for PAYMENT_PENDING status */}
                  {selectedSubmission.status === 'PAYMENT_PENDING' && (
                    <button
                      onClick={() => handleCheckPayment(selectedSubmission)}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Check Payment</span>
                    </button>
                  )}

                  {/* Publish Paper - only for PAYMENT_RECEIVED status */}
                  {selectedSubmission.status === 'PAYMENT_RECEIVED' && (
                    <button
                      onClick={() => handlePublishSubmission(selectedSubmission)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Publish Paper</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Email Confirmation Modal */}
      {emailModal.open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
          <div className="bg-slate-950 w-full max-w-md rounded-2xl shadow-2xl border border-slate-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Send Acceptance Email</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-300 mb-2">
                  <strong>Paper:</strong> {emailModal.submission?.paper_title}
                </p>
                <p className="text-sm text-slate-300 mb-2">
                  <strong>Author:</strong> {emailModal.submission?.author_name}
                </p>
                <p className="text-sm text-slate-300 mb-4">
                  <strong>Email:</strong> {emailModal.submission?.author_email}
                </p>
              </div>
              
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <p className="text-sm text-slate-300 mb-2">
                  This will send an acceptance email containing:
                </p>
                <ul className="text-xs text-slate-400 space-y-1 ml-4">
                  <li>• Acceptance congratulations</li>
                  <li>• Payment link for publication fee (₹2000 for Indian authors)</li>
                  <li>• Copyright transfer agreement</li>
                  <li>• Publication timeline information</li>
                </ul>
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Email Recipients:</p>
                  <div className="text-xs text-slate-300">
                    <div><strong>To:</strong> {emailModal.submission?.author_email}</div>
                    <div><strong>CC:</strong> editor.ijcast.in@gmail.com, gyanakshar16092026@gmail.com</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setEmailModal({ open: false, submission: null })}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSendEmail}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">Document Preview</h3>
              <div className="flex items-center space-x-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="text-slate-500 hover:text-slate-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* PDF Viewer */}
            <div className="flex-1 bg-slate-100">
              {previewUrl.toLowerCase().includes('.pdf') || previewUrl.includes('application/pdf') ? (
                <div className="w-full h-full relative">
                  <iframe
                    src={`${previewUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                    className="w-full h-full border-none"
                    title="PDF Preview"
                    onLoad={() => console.log('✅ PDF iframe loaded successfully')}
                    onError={(e) => {
                      console.error('❌ PDF iframe failed to load:', e);
                      // Fallback: try opening in new tab
                      window.open(previewUrl, '_blank', 'noopener,noreferrer');
                    }}
                  />
                  {/* Fallback message for unsupported browsers */}
                  <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center text-slate-600 hidden" id="pdf-fallback">
                    <FileText className="w-16 h-16 mb-4" />
                    <p className="text-lg font-medium mb-2">PDF Preview Unavailable</p>
                    <p className="text-sm text-center mb-4">
                      Your browser cannot display this PDF inline.<br />
                      Click the download button to view the file.
                    </p>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Open in New Tab</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-600">
                  <FileText className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium mb-2">Preview not available</p>
                  <p className="text-sm text-center mb-4">
                    This file type cannot be previewed in the browser.<br />
                    Please download the file to view it.
                  </p>
                  <div className="flex items-center space-x-2">
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download File</span>
                    </a>
                    <button
                      onClick={() => {
                        // Copy URL to clipboard for debugging
                        navigator.clipboard.writeText(previewUrl).then(() => {
                          alert('File URL copied to clipboard for debugging');
                        });
                      }}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                      title="Copy URL to clipboard"
                    >
                      Copy URL
                    </button>
                  </div>
                  <div className="mt-4 p-3 bg-slate-200 rounded text-xs text-slate-600 font-mono break-all max-w-md">
                    URL: {previewUrl}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
