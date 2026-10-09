import React from 'react';
import { useJournal } from '../context/JournalContext';
import { Users, Mail, Award } from 'lucide-react';

const MemberCard = ({ mem, size = 'md', showNumber = null, roleLabel = null, roleBadgeColor = 'bg-amber-50 text-amber-800' }) => {
  const imgSize = size === 'lg' ? 'w-28 h-28 rounded-2xl' : size === 'md' ? 'w-16 h-16 rounded-xl' : 'w-12 h-12 rounded-xl';
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all p-5 flex items-start gap-4`}>
      {showNumber !== null && (
        <span className="text-amber-600 font-bold font-mono text-sm flex-shrink-0 w-6 text-right">{showNumber}.</span>
      )}
      <img
        src={mem.photo_url || '/gyan-akshar-logo.png'}
        alt={mem.name}
        className={`${imgSize} object-cover border-2 border-amber-400 flex-shrink-0`}
        onError={e => { 
          console.log(`❌ Image load failed for ${mem.name}: ${mem.photo_url}`);
          e.target.src = '/gyan-akshar-logo.png'; 
        }}
      />
      <div className="flex-1 min-w-0">
        {roleLabel && (
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-1 ${roleBadgeColor}`}>{roleLabel}</span>
        )}
        <h3 className={`font-bold font-serif text-slate-900 ${size === 'lg' ? 'text-xl' : 'text-sm'} leading-snug`}>{mem.name}</h3>
        <p className={`text-slate-600 mt-0.5 ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>{mem.designation}</p>
        <p className="text-xs text-slate-500 mt-0.5">{mem.institution}{mem.country ? `, ${mem.country}` : ''}</p>
        {mem.email && (
          <a href={`mailto:${mem.email}`} className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:underline mt-1">
            <Mail className="w-3 h-3" />{mem.email}
          </a>
        )}
      </div>
    </div>
  );
};

const SectionHeader = ({ title }) => (
  <div className="border-b-2 border-amber-500 pb-3 mb-6">
    <h2 className="text-2xl font-bold font-serif text-slate-900">{title}</h2>
  </div>
);

export const EditorialBoard = () => {
  const { editorialMembers } = useJournal();
  const active = editorialMembers.filter(m => m.is_active).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  // Debug logging to help troubleshoot photo display issues
  React.useEffect(() => {
    console.log('🌐 PUBLIC EDITORIAL BOARD - Data loaded:', {
      totalMembers: editorialMembers.length,
      activeMembers: active.length,
      membersWithPhotos: editorialMembers.filter(m => m.photo_url && m.photo_url !== '/gyan-akshar-logo.png').length
    });
    editorialMembers.forEach((mem, idx) => {
      if (mem.photo_url && mem.photo_url !== '/gyan-akshar-logo.png') {
        console.log(`📸 Photo ${idx + 1}: ${mem.name} -> ${mem.photo_url}`);
      }
    });
  }, [editorialMembers, active]);

  const editorInChief    = active.filter(m => m.role === 'Editor-in-Chief');
  const managingEditor   = active.filter(m => m.role === 'Managing Editor');
  const advisoryBoard    = active.filter(m => m.role === 'Technical Advisory Board');
  const associateEditors = active.filter(m => m.role === 'Associate Editors');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-14">

      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>Academic Governance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif">Editorial Board</h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Distinguished academic scholars overseeing the scientific rigor, peer-review standards, and publication ethics of IJRT.
        </p>
      </div>

      {/* 1. Editor-in-Chief */}
      {editorInChief.length > 0 && (
        <section>
          <SectionHeader title="Editor-in-Chief" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editorInChief.map(mem => (
              <div key={mem.id} className="bg-white rounded-3xl border-2 border-amber-300 shadow-lg p-8 flex flex-col sm:flex-row gap-6 items-start">
                <img
                  src={mem.photo_url || '/gyan-akshar-logo.png'}
                  alt={mem.name}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-amber-500 shadow-md flex-shrink-0"
                  onError={e => { 
                    console.log(`❌ Image load failed for ${mem.name} (Editor-in-Chief): ${mem.photo_url}`);
                    e.target.src = '/gyan-akshar-logo.png'; 
                  }}
                />
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-xs">Editor-in-Chief</span>
                  <h3 className="text-2xl font-bold text-slate-900 font-serif">{mem.name}</h3>
                  <p className="text-sm font-semibold text-slate-700">{mem.designation}</p>
                  <p className="text-xs text-slate-500">{mem.institution}, {mem.country}</p>
                  {mem.email && (
                    <a href={`mailto:${mem.email}`} className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:underline font-medium">
                      <Mail className="w-3.5 h-3.5" />{mem.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Managing Editor */}
      {managingEditor.length > 0 && (
        <section>
          <SectionHeader title="Managing Editor" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {managingEditor.map(mem => (
              <div key={mem.id} className="bg-white rounded-3xl border-2 border-sky-200 shadow-lg p-8 flex flex-col sm:flex-row gap-6 items-start">
                <img
                  src={mem.photo_url || '/gyan-akshar-logo.png'}
                  alt={mem.name}
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-sky-400 shadow-md flex-shrink-0"
                  onError={e => { 
                    console.log(`❌ Image load failed for ${mem.name} (Managing Editor): ${mem.photo_url}`);
                    e.target.src = '/gyan-akshar-logo.png'; 
                  }}
                />
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 font-bold rounded text-xs">Managing Editor</span>
                  <h3 className="text-xl font-bold text-slate-900 font-serif">{mem.name}</h3>
                  <p className="text-sm font-semibold text-slate-700">{mem.designation}</p>
                  <p className="text-xs text-slate-500">{mem.institution}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Technical Advisory Board */}
      {advisoryBoard.length > 0 && (
        <section>
          <SectionHeader title="Technical Advisory Board" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {advisoryBoard.map((mem, idx) => (
              <MemberCard key={mem.id} mem={mem} size="sm" showNumber={idx + 1}
                roleLabel="Technical Advisory Board"
                roleBadgeColor="bg-purple-50 text-purple-800" />
            ))}
          </div>
        </section>
      )}

      {/* 4. Associate Editors */}
      {associateEditors.length > 0 && (
        <section>
          <SectionHeader title="Associate Editors" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {associateEditors.map((mem, idx) => (
              <MemberCard key={mem.id} mem={mem} size="sm" showNumber={idx + 1}
                roleLabel="Associate Editor"
                roleBadgeColor="bg-emerald-50 text-emerald-800" />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

