import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useJournal } from '../../context/JournalContext';
import { BookOpen, Menu, X, Send, ChevronDown, Search } from 'lucide-react';

export const Navbar = () => {
  const { settings, setIsSubmitOpen, setIsSearchOpen } = useJournal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [authorsDropdownOpen, setAuthorsDropdownOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Editorial Board', path: '/editorial-board' },
    { name: 'Author Guidelines', path: '/for-authors' },
    { name: 'Published Papers', path: '/archives' },
    { name: 'Conferences', path: '/conferences' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white backdrop-blur-md border-b border-slate-200 shadow-md">
      {/* Brand Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center space-x-3 group">
          <img
            src="/logo.png"
            alt="IJRT Logo"
            className="w-12 h-12 rounded-full object-cover shadow-md group-hover:scale-105 transition-transform border-2 border-amber-500/30"
          />
          <div>
            <h1 className="text-lg font-bold font-serif tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
              {settings.short_name || 'IJCAST'}
            </h1>
            <p className="text-[11px] text-slate-500 font-sans tracking-wide">
              {settings.journal_name}
            </p>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden xl:flex items-center space-x-1 text-xs font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-600 font-semibold border border-amber-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center space-x-3">
          {/* PHASE 8: Added search trigger for better discoverability */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden lg:inline-flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg transition-colors"
            title="Search published articles"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
          
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="hidden sm:inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Send className="w-4 h-4" />
            <span>Submit Your Paper</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 text-sm">
          {navItems.map((item) => (
            <div key={item.name}>
              <NavLink
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
              >
                {item.name}
              </NavLink>
            </div>
          ))}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            {/* PHASE 8: Added mobile search trigger */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm"
            >
              <Search className="w-4 h-4" />
              <span>Search Articles</span>
            </button>
            
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsSubmitOpen(true);
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm"
            >
              <Send className="w-4 h-4" />
              <span>Submit Your Paper</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

