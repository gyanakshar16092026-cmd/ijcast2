import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { Send, Plus, Trash2, Upload, FileText, CheckCircle } from 'lucide-react';

export const SubmitPaper = () => {
  const navigate = useNavigate();
  const { settings, submitPaper } = useJournal();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  const [formData, setFormData] = useState({
    // Primary Author
    author_name: '',
    author_email: '',
    author_phone: '',
    author_affiliation: '',
    author_institution: '',
    author_country: '',
    
    // Paper Information
    paper_title: '',
    abstract: '',
    keywords: '',
    
    // Co-Authors
    coAuthors: [],
    
    // Files
    manuscript_file: null,
    cover_letter_file: null,
    copyright_file: null,
    
    // Consent
    consent_given: false,
  });

  const [coAuthor, setCoAuthor] = useState({
    name: '',
    email: '',
    affiliation: '',
    institution: '',
    country: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      
      // PHASE 16: Frontend file validation
      const validations = {
        manuscript_file: { types: ['pdf', 'doc', 'docx'], maxSize: 10 },
        cover_letter_file: { types: ['pdf', 'doc', 'docx'], maxSize: 5 },
        copyright_file: { types: ['pdf'], maxSize: 2 }
      };
      
      const config = validations[name];
      if (config) {
        // Check file size
        const maxSizeBytes = config.maxSize * 1024 * 1024;
        if (file.size > maxSizeBytes) {
          alert(`File size exceeds ${config.maxSize}MB limit`);
          e.target.value = '';
          return;
        }
        
        // Check file extension
        const fileName = file.name.toLowerCase();
        const hasValidExtension = config.types.some(type => fileName.endsWith(`.${type}`));
        if (!hasValidExtension) {
          alert(`Invalid file type. Allowed: ${config.types.map(t => `.${t}`).join(', ')}`);
          e.target.value = '';
          return;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
    }
  };

  const handleCoAuthorChange = (e) => {
    const { name, value } = e.target;
    setCoAuthor(prev => ({ ...prev, [name]: value }));
  };

  const addCoAuthor = () => {
    if (coAuthor.name && coAuthor.email) {
      setFormData(prev => ({
        ...prev,
        coAuthors: [...prev.coAuthors, { ...coAuthor, id: Date.now() }]
      }));
      setCoAuthor({ name: '', email: '', affiliation: '', institution: '', country: '' });
    }
  };

  const removeCoAuthor = (id) => {
    setFormData(prev => ({
      ...prev,
      coAuthors: prev.coAuthors.filter(ca => ca.id !== id)
    }));
  };

  const generateSubmissionId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `RJ-${year}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.author_name || !formData.author_email || !formData.author_phone ||
        !formData.author_affiliation || !formData.author_institution || !formData.author_country) {
      alert('Please fill out all required author information fields.');
      return;
    }
    
    if (!formData.paper_title || !formData.abstract || !formData.keywords) {
      alert('Please fill out all required paper information fields (title, abstract, keywords).');
      return;
    }
    
    if (!formData.consent_given) {
      alert('Please confirm that the submitted manuscript is original and complies with journal policies.');
      return;
    }

    if (!formData.manuscript_file) {
      alert('Please upload the manuscript file.');
      return;
    }

    setLoading(true);

    try {
      // Prepare submission data with validation
      const submissionData = {
        author_name: formData.author_name.trim(),
        author_email: formData.author_email.trim(),
        author_phone: formData.author_phone.trim(),
        author_affiliation: formData.author_affiliation.trim(),
        author_institution: formData.author_institution.trim(),
        author_country: formData.author_country.trim(),
        paper_title: formData.paper_title.trim(),
        abstract: formData.abstract.trim(),
        keywords: formData.keywords.trim(),
        coAuthors: formData.coAuthors,
      };

      // Debug: Log submission data
      console.log('📝 Submission Data:', submissionData);

      const files = {
        manuscript_file: formData.manuscript_file,
        cover_letter_file: formData.cover_letter_file,
        copyright_file: formData.copyright_file,
      };

      // Submit to database
      const result = await submitPaper(submissionData, files);
      
      console.log('✅ Submission Result:', result);
      
      setSubmissionId(result.submissionId);
      setSubmitted(true);
      
      // Scroll to top to show confirmation
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Submission failed: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-emerald-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                Manuscript Successfully Submitted!
              </h1>
              
              <div className="bg-slate-50 rounded-xl p-6 mb-6">
                <p className="text-sm text-slate-600 mb-2">Your Submission ID:</p>
                <p className="text-2xl font-mono font-bold text-amber-600">{submissionId}</p>
              </div>
              
              <div className="space-y-3 text-left bg-white border border-slate-200 rounded-xl p-6 mb-6">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Paper Title:</span>
                  <span className="text-sm font-semibold text-slate-900">{formData.paper_title}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Author Name:</span>
                  <span className="text-sm font-semibold text-slate-900">{formData.author_name}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-slate-600">Submission Date:</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {new Date().toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-slate-600 mb-6">
                Your manuscript has been successfully submitted to our editorial team! Here's what happens next:
                <br/><br/>
                <strong>1. Editorial Review:</strong> Our team will conduct plagiarism checking and content review offline.
                <br/>
                <strong>2. Selection Decision:</strong> If your paper is selected for publication, we will send an acceptance email to <strong>{formData.author_email}</strong> with payment details and copyright transfer agreement.
                <br/>
                <strong>3. Publication:</strong> After payment confirmation, your paper will be published on the website with free access forever.
                <br/><br/>
                Please save your submission ID for future reference. Thank you for choosing IJRT!
              </p>
              
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Submit Your Manuscript</h1>
          <p className="text-lg text-slate-600 mb-2">
            Submit your research paper to {settings.short_name} for editorial review
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
            <p><strong>Review Process:</strong> All submissions undergo plagiarism checking and editorial review. 
            Selected papers will receive acceptance notification with publication fee details and copyright agreement.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          
          {/* Author Information */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-amber-400">
              Primary Author Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="author_name"
                  required
                  value={formData.author_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Dr. John Smith"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="author_email"
                  required
                  value={formData.author_email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="john.smith@university.edu"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="author_phone"
                  required
                  value={formData.author_phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="+1 234 567 8900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Affiliation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="author_affiliation"
                  required
                  value={formData.author_affiliation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Department of Computer Science"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Institution <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="author_institution"
                  required
                  value={formData.author_institution}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="University of Example"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="author_country"
                  required
                  value={formData.author_country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="United States"
                />
              </div>
            </div>
          </section>

          {/* Paper Information */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-amber-400">
              Paper Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Paper Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="paper_title"
                  required
                  value={formData.paper_title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter the complete title of your paper"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Abstract <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="abstract"
                  required
                  rows={6}
                  value={formData.abstract}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Provide a concise abstract of your research (200-300 words)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Keywords <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="keywords"
                  required
                  value={formData.keywords}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter 4-6 keywords separated by commas"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Example: Machine Learning, Data Science, Artificial Intelligence
                </p>
              </div>
            </div>
          </section>

          {/* Co-Authors */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-amber-400">
              Co-Authors (Optional)
            </h2>
            
            {/* Co-Author Entry Form */}
            <div className="bg-slate-50 rounded-xl p-6 mb-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Add Co-Author</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="name"
                  value={coAuthor.name}
                  onChange={handleCoAuthorChange}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Co-Author Name"
                />
                <input
                  type="email"
                  name="email"
                  value={coAuthor.email}
                  onChange={handleCoAuthorChange}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Co-Author Email"
                />
                <input
                  type="text"
                  name="affiliation"
                  value={coAuthor.affiliation}
                  onChange={handleCoAuthorChange}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Affiliation"
                />
                <input
                  type="text"
                  name="institution"
                  value={coAuthor.institution}
                  onChange={handleCoAuthorChange}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Institution"
                />
                <input
                  type="text"
                  name="country"
                  value={coAuthor.country}
                  onChange={handleCoAuthorChange}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Country"
                />
              </div>
              <button
                type="button"
                onClick={addCoAuthor}
                className="flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Co-Author</span>
              </button>
            </div>

            {/* Co-Authors List */}
            {formData.coAuthors.length > 0 && (
              <div className="space-y-3">
                {formData.coAuthors.map((ca, index) => (
                  <div key={ca.id} className="flex items-start justify-between bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        {index + 1}. {ca.name}
                      </p>
                      <p className="text-sm text-slate-600">{ca.email}</p>
                      <p className="text-xs text-slate-500">
                        {ca.affiliation} • {ca.institution} • {ca.country}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCoAuthor(ca.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* File Uploads */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-amber-400">
              File Uploads
            </h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-amber-500 transition-colors">
                <label className="flex flex-col items-center cursor-pointer">
                  <Upload className="w-12 h-12 text-slate-400 mb-3" />
                  <span className="text-sm font-semibold text-slate-700 mb-1">
                    Upload Manuscript <span className="text-red-500">*</span>
                  </span>
                  <span className="text-xs text-slate-500 mb-3">
                    Accepted formats: PDF, DOC, DOCX (Max: 10MB)
                  </span>
                  <input
                    type="file"
                    name="manuscript_file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    required
                  />
                  {formData.manuscript_file && (
                    <div className="flex items-center space-x-2 mt-2 text-sm text-emerald-600">
                      <FileText className="w-4 h-4" />
                      <span>{formData.manuscript_file.name}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Choose File
                  </button>
                </label>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-amber-500 transition-colors">
                <label className="flex flex-col items-center cursor-pointer">
                  <Upload className="w-10 h-10 text-slate-400 mb-2" />
                  <span className="text-sm font-semibold text-slate-700 mb-1">
                    Upload Cover Letter (Optional)
                  </span>
                  <span className="text-xs text-slate-500 mb-3">
                    Accepted formats: PDF, DOC, DOCX (Max: 5MB)
                  </span>
                  <input
                    type="file"
                    name="cover_letter_file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                  {formData.cover_letter_file && (
                    <div className="flex items-center space-x-2 mt-2 text-sm text-emerald-600">
                      <FileText className="w-4 h-4" />
                      <span>{formData.cover_letter_file.name}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Choose File
                  </button>
                </label>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-amber-500 transition-colors">
                <label className="flex flex-col items-center cursor-pointer">
                  <Upload className="w-10 h-10 text-slate-400 mb-2" />
                  <span className="text-sm font-semibold text-slate-700 mb-1">
                    Upload Copyright / Declaration Form (Optional)
                  </span>
                  <span className="text-xs text-slate-500 mb-3">
                    Accepted formats: PDF (Max: 5MB)
                  </span>
                  <input
                    type="file"
                    name="copyright_file"
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                  />
                  {formData.copyright_file && (
                    <div className="flex items-center space-x-2 mt-2 text-sm text-emerald-600">
                      <FileText className="w-4 h-4" />
                      <span>{formData.copyright_file.name}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Choose File
                  </button>
                </label>
              </div>
            </div>
          </section>

          {/* Consent */}
          <section>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="consent_given"
                  checked={formData.consent_given}
                  onChange={handleInputChange}
                  className="mt-1 w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
                  required
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">
                    Declaration <span className="text-red-500">*</span>
                  </p>
                  <p className="text-sm text-slate-700">
                    I confirm that the submitted manuscript is original and complies with the journal's 
                    submission and publication policies. The work has not been published elsewhere and is 
                    not under consideration by another journal.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-lg rounded-xl shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Send className="w-6 h-6" />
              <span>{loading ? 'Submitting...' : 'Submit Manuscript'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

