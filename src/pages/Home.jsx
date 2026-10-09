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
  BarChart3,
  Eye,
  Archive,
  Calendar as CalendarIcon
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
    <div className="min-h-screen bg-gray-50">
      {/* Main Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-50 to-white">
        {/* Background with responsive images */}
        <div className="absolute inset-0 bg-cover bg-center">
          {/* Desktop Background */}
          <div 
            className="absolute inset-0 bg-cover bg-right hidden md:block"
            style={{
              backgroundImage: "url('/herobg.png')"
            }}
          ></div>
          {/* Mobile Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center block md:hidden"
            style={{
              backgroundImage: "url('/herobgmobile.png')"
            }}
          ></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Content */}
            <div className="space-y-6">
              {/* Status Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>PEER REVIEWED</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  <span>OPEN ACCESS</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                  <span>MULTI-DISCIPLINARY JOURNAL</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold">
                  <Award className="w-3 h-3" />
                  <span>IMPACT FACTOR: 6.255</span>
                </span>
              </div>

              {/* Main Title */}
              <div className="space-y-2">
                <h1 className="text-4xl lg:text-5xl font-bold">
                  <span className="text-gray-900">International Journal of</span>
                </h1>
                <h2 className="text-4xl lg:text-5xl font-bold text-orange-600">
                  Commerce, Arts, Science
                </h2>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                  and Technology
                </h2>
              </div>

              {/* Description */}
              <p className="text-lg text-white font-medium leading-relaxed max-w-2xl mx-auto" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                A prestigious, peer-reviewed, open access journal publishing original research 
                across Commerce, Arts, Science, and Technology.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-4 pt-4">
                <button
                  onClick={() => navigate('/submit-paper')}
                  className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <Send className="w-5 h-5" />
                  <span>Submit Your Paper</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/archives')}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  <span>View Published Papers</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">2394-9007</div>
              <div className="text-sm text-gray-500 font-medium">ISSN (Online)</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">4</div>
              <div className="text-sm text-gray-500 font-medium">Issues Per Year</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">500+</div>
              <div className="text-sm text-gray-500 font-medium">Published Papers</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">Global</div>
              <div className="text-sm text-gray-500 font-medium">Researchers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Indexing Information Section */}
      <div className="bg-slate-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Indexed In</h2>
            <p className="text-gray-600">IJRT is indexed in prestigious academic databases and platforms</p>
          </div>
          
          {/* Indexing Logos Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 items-center justify-items-center">
            {/* Google Scholar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-28 h-20 flex items-center justify-center hover:shadow-md transition-shadow">
              <img 
                src="/googlelogo.jpeg" 
                alt="Google Scholar" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Scholar (Google Scholar variant) */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-28 h-20 flex items-center justify-center hover:shadow-md transition-shadow">
              <img 
                src="/scholarlogo.jpeg" 
                alt="Google Scholar" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Academic */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-28 h-20 flex items-center justify-center hover:shadow-md transition-shadow">
              <img 
                src="/academiclogo.jpeg" 
                alt="Academic Database" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Together */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-28 h-20 flex items-center justify-center hover:shadow-md transition-shadow">
              <img 
                src="/togetherlogo.jpeg" 
                alt="Together Database" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Cards */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Submit Your Paper Card */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-orange-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Send className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Your Paper</h3>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Submit your manuscript online for peer review and publication in our journal.
            </p>
            <button
              onClick={() => navigate('/submit-paper')}
              className="inline-flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <span>Start Submission</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Published Papers Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Archive className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">View Published Papers</h3>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Browse our complete archive of published research articles.
            </p>
            <button
              onClick={() => navigate('/archives')}
              className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <span>Explore Archive</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Upcoming Conferences Card */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-green-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Upcoming Conferences</h3>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Stay updated about our upcoming conferences, events and important dates.
            </p>
            <button
              onClick={() => navigate('/conferences')}
              className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <span>View Conferences</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

