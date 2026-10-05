import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, FileText, Mail, User, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useJournal } from '../../context/JournalContext';

export const SubmissionsManager = () => {
  const { fetchSubmissions, updateSubmissionStatus } = useJournal();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

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
    { value: 'REJECTED', label: 'Rejected', count: submissions.filter(s => s.status === 'REJECTED').length },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'SUBMITTED': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'UNDER REVIEW': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'REVISION REQUIRED': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'ACCEPTED': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
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
      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId ? { ...sub, status: newStatus } : sub
      ));
      // If viewing details, update selected submission
      if (selectedSubmission && selectedSubmission.id === submissionId) {
        setSelectedSubmission({ ...selectedSubmission, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update submission status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold font-serif text-white">Manuscript Submissions</h2>
        <p className="text-xs text-slate-400 mt-1">View, manage, and track all manuscript submissions</p>
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
                      <select
                        value={sub.status}
                        onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(sub.status)} bg-slate-950 focus:ring-2 focus:ring-amber-500`}
                      >
                        <option value="SUBMITTED">Submitted</option>
                        <option value="UNDER REVIEW">Under Review</option>
                        <option value="REVISION REQUIRED">Revision Required</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="PUBLISHED">Published</option>
                      </select>
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
                    <p className="text-white font-semibold">{selectedSubmission.author_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Email</p>
                    <a href={`mailto:${selectedSubmission.author_email}`} className="text-amber-400 font-semibold hover:underline flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{selectedSubmission.author_email}</span>
                    </a>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Phone</p>
                    <p className="text-white font-semibold">{selectedSubmission.author_phone}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Affiliation</p>
                    <p className="text-white font-semibold">{selectedSubmission.author_affiliation}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Institution</p>
                    <p className="text-white font-semibold">{selectedSubmission.author_institution}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Country</p>
                    <p className="text-white font-semibold">{selectedSubmission.author_country}</p>
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
                  {selectedSubmission.manuscript_file_url && (
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-white font-semibold text-sm">Manuscript</p>
                          <p className="text-slate-400 text-xs">{selectedSubmission.manuscript_filename}</p>
                        </div>
                      </div>
                      <a
                        href={selectedSubmission.manuscript_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}
                  {selectedSubmission.cover_letter_file_url && (
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-white font-semibold text-sm">Cover Letter</p>
                          <p className="text-slate-400 text-xs">{selectedSubmission.cover_letter_filename}</p>
                        </div>
                      </div>
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
                  )}
                  {selectedSubmission.copyright_file_url && (
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-white font-semibold text-sm">Copyright Form</p>
                          <p className="text-slate-400 text-xs">{selectedSubmission.copyright_filename}</p>
                        </div>
                      </div>
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
                  )}
                </div>
              </section>

              {/* Actions */}
              <section className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-colors">
                  Convert to Published Paper
                </button>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
