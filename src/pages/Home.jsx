import React, { useMemo } from 'react';
import { useJournal } from '../context/JournalContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArticleCard } from '../components/common/ArticleCard';
import {
  BookOpen,
  Send,
  Award,
  Globe,
  FileText,
  ArrowRight,
  Users,
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const { settings, articles, volumes, issues } = useJournal();

  const publishedArticles = articles
    .filter(a => a.is_published)
    .sort((a, b) => new Date(b.published_date || b.created_at) - new Date(a.published_date || a.created_at));
  const latestArticles = publishedArticles.slice(0, 6);

  const statistics = useMemo(() => {
    const totalPublishedPapers = publishedArticles.length;
    const currentYear = new Date().getFullYear();
    const currentVolume = volumes.filter(v => v.status === 'Active').sort((a, b) => b.year - a.year)[0];
    
    return {
      totalPublishedPapers,
      currentVolume,
      currentYear
    };
  }, [volumes, publishedArticles]);

  return (
    <div className="min-h-screen">
      {/* Top Stats Banner */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">{settings.eissn || 'ISSN XXXX-XXXX'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">Impact Factor: {settings.impact_factor || 'TBA'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="font-semibold">{settings.publication_frequency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with Background Image */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden">
        {/* Background Image - Replace with your actual background */}
        <div 
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1920&q=80')"
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/95 via-white/90 to-slate-50/95"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Title, Description & Buttons */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Peer Reviewed</span>
              </span>
              <span className="inline-flex items-center px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Open Access
              </span>
              <span className="inline-flex items-center px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Multi-Disciplinary Journal
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight font-serif">
              <span className="text-slate-900">International Journal of</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-700">
                Commerce, Arts, Science
              </span>
              <br />
              <span className="text-slate-900">and Technology</span>
            </h1>

            {/* Description */}
            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              A prestigious, peer-reviewed, open access journal publishing original research across Commerce, Arts, Science, and Technology.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => navigate('/submit-paper')}
                className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Submit Your Paper</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/archives')}
                className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl border-2 border-slate-300 hover:border-amber-500 transition-all shadow-md flex items-center space-x-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>View Published Papers</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right: Feature Cards */}
          <div className="grid grid-cols-1 gap-4">
            {/* Quality Research Card */}
            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <FileText className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Quality Research</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Rigorous double-blind peer review ensuring scholarly excellence in published research
                  </p>
                </div>
              </div>
            </div>

            {/* Global Community Card */}
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Globe className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Global Community</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    International network of researchers, scholars, and academics from around the world
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Excellence Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Award className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Academic Excellence</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Maintaining highest standards of research quality and scholarly contribution
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-50 rounded-xl text-amber-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 font-mono">{settings.eissn?.split(' ')[1] || 'XXXX-XXXX'}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ISSN (Online)</p>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">6</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Issues Per Year</p>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl text-emerald-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{statistics.totalPublishedPapers}+</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Published Papers</p>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-50 rounded-xl text-purple-600">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">Global</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Researchers</p>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-50 rounded-xl text-amber-600">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{settings.impact_factor || 'TBA'}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Impact Factor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 space-y-16">
        {/* Latest Published Papers */}
        {latestArticles.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-serif text-slate-900">Latest Published Papers</h2>
                <p className="text-sm text-slate-500 mt-1">Recently published research articles</p>
              </div>
              <Link to="/archives" className="text-sm font-bold text-amber-700 hover:underline flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {latestArticles.map(art => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>
          </section>
        )}

        {/* Three Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg hover:border-amber-300 transition-all group">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 group-hover:scale-110 transition-transform">
                <Send className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-serif mb-2">Submit Your Paper</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Submit your manuscript online for peer review and publication in our journal
                </p>
              </div>
              <button
                onClick={() => navigate('/submit-paper')}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow transition-colors inline-flex items-center space-x-2"
              >
                <span>Start Submission</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg hover:border-blue-300 transition-all group">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-serif mb-2">View Published Papers</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Browse our complete archive of published research articles
                </p>
              </div>
              <button
                onClick={() => navigate('/archives')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow transition-colors inline-flex items-center space-x-2"
              >
                <span>Explore Archive</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg hover:border-emerald-300 transition-all group">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-serif mb-2">Upcoming Conferences</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Stay updated about our upcoming conferences, events and important dates
                </p>
              </div>
              <button
                onClick={() => navigate('/conferences')}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow transition-colors inline-flex items-center space-x-2"
              >
                <span>View Conferences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
