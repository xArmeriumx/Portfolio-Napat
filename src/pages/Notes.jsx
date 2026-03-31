import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NoteCard from '../components/notes/NoteCard';
import CmdKModal from '../components/notes/CmdKModal';
import GithubSlugger from 'github-slugger';
import { BookOpen, FileText, ChevronRight, Hash, FolderTree, Search, ArrowLeft, ArrowRight, List } from 'lucide-react';

import { FEATURES } from '../config/features';
import AiSummaryPanel from '../components/notes/AiSummaryPanel';
import AiSelectionTooltip from '../components/notes/AiSelectionTooltip';

export default function Notes() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);

  // Calculate activeNote from the URL parameter slug
  const activeNote = useMemo(() => {
    if (notes.length === 0) return null;
    if (!slug) return null; // handled in useEffect
    return notes.find(n => n.id === slug) || notes[0];
  }, [notes, slug]);

  const formatFileName = (path) => {
    const filename = path.split('/').pop().replace('.md', '');
    return filename.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Global Cmd+K Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdKOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const markdownFiles = import.meta.glob('/src/data/notes/*.md', { query: '?raw', import: 'default' });
        const loadedNotes = [];

        for (const path in markdownFiles) {
          const content = await markdownFiles[path]();
          const filename = path.split('/').pop().replace('.md', '');
          loadedNotes.push({
            path,
            id: filename,
            content,
            name: formatFileName(path),
            rawName: path.split('/').pop()
          });
        }

        setNotes(loadedNotes);
        if (loadedNotes.length > 0 && !slug) {
          navigate(`/notes/${loadedNotes[0].id}`, { replace: true });
        }
      } catch (error) {
        console.error("Failed to load notes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, []);

  const currentIndex = notes.findIndex(n => n.id === activeNote?.id);
  const prevNote = currentIndex > 0 ? notes[currentIndex - 1] : null;
  const nextNote = currentIndex < notes.length - 1 ? notes[currentIndex + 1] : null;

  // Auto-scroll on initial load if URL has a #hash
  useEffect(() => {
    if (activeNote && window.location.hash) {
      const hashId = window.location.hash.substring(1);
      setTimeout(() => {
        // Find by exact ID from rehype-slug
        const element = document.getElementById(hashId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500); // give markdown time to render
    }
  }, [activeNote]);

  // Auto SEO / Meta Tags updating based on active document
  useEffect(() => {
    if (activeNote) {
      // Update Page Title
      document.title = `${activeNote.name} - Cheatsheet | Napat Portfolio`;

      // Extract brief description from markdown (strip symbols, find first real sentence)
      const plainText = activeNote.content.replace(/[#*`_\[\]()]/g, '').replace(/(\r\n|\n|\r)/gm, ' ').trim();
      const descMatch = plainText.match(/.*?[a-zA-Zก-๙]{10,}.*?(?=\s|$)/);
      const desc = descMatch ? plainText.substring(0, 160) + '...' : `Cheatsheet document for ${activeNote.name}`;

      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = desc;

      // Update og:title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.content = document.title;
    }
  }, [activeNote]);

  // Extract headings for Table of Contents (TOC) - h2 and h3
  const headings = useMemo(() => {
    if (!activeNote) return [];

    const slugger = new GithubSlugger();
    const regex = /^(#{1,3})\s+(.+)$/gm;
    const items = [];
    let match;
    while ((match = regex.exec(activeNote.content)) !== null) {
      const level = match[1].length; // number of #
      const text = match[2].replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/`([^`]+)`/g, '$1'); // Clean simple markdown
      const id = slugger.slug(text); // This ensures 1:1 match with rehype-slug ID output
      items.push({ level, text, id });
    }
    return items;
  }, [activeNote]);

  const scrollToHeading = (e, id, headingText) => {
    e.preventDefault();

    // First try standard ID matching (rehype-slug usually generates this)
    let element = document.getElementById(id);

    // Bulletproof Fallback: if IDs mismatch due to Unicode/Thai/Special chars, find by text!
    if (!element) {
      const allHeadings = Array.from(document.querySelectorAll('main h1, main h2, main h3'));
      element = allHeadings.find(h => {
        // Strip out any # or extra spaces from raw text for comparison
        const cleanContentText = h.textContent.trim().toLowerCase();
        const cleanTargetText = headingText.trim().toLowerCase();
        return cleanContentText.includes(cleanTargetText) || cleanTargetText.includes(cleanContentText);
      });
    }

    if (element) {
      // scroll Into View natively handles whichever container is scrolling (window or main)
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update browser URL hash seamlessly
      window.history.pushState(null, '', `#${element.id || id}`);
    } else {
      console.warn("TOC Scroll Failed: Heading not found for", headingText);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen pt-16 text-gray-400 gap-3 bg-[#fdfdfd]">
        <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-[#fdfdfd] flex flex-col md:flex-row relative z-10 w-full animate-fade-in-up md:overflow-hidden">

      {/* 1) Sidebar Explorer */}
      <aside className="w-full md:w-72 bg-[#fdfdfd] border-b md:border-b-0 md:border-r border-gray-200 md:h-[calc(100vh-64px)] flex flex-col shrink-0 text-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between text-gray-800">
          <div className="flex items-center gap-2">
            <FolderTree size={18} className="text-red-500" />
            <span className="font-bold uppercase tracking-wider text-sm">Explorer</span>
          </div>
        </div>

        {/* Search Bar - Fake Button to Open Modal */}
        <div className="p-3 border-b border-gray-100 bg-gray-50/30">
          <button
            onClick={() => setIsCmdKOpen(true)}
            className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 bg-white border border-gray-200 rounded-md text-sm hover:border-red-400 hover:ring-1 hover:ring-red-400 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-2 text-gray-400 group-hover:text-red-500 transition-colors">
              <Search size={14} />
              <span className="text-gray-500 font-medium">Search guides...</span>
            </div>
            <div className="flex gap-1">
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-gray-50 border border-gray-200 rounded text-gray-400 font-mono tracking-widest shadow-sm">⌘K</kbd>
            </div>
          </button>
        </div>

        {/* File List */}
        <div className="p-2 flex-1 overflow-y-auto scrollbar-hide">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-2 mb-2 mt-2 flex items-center gap-1">
            <ChevronRight size={14} />
            <span>DOCS</span>
          </div>

          <ul className="space-y-0.5 relative before:absolute before:inset-y-0 before:left-3.5 before:w-px before:bg-gray-100 ml-4 pb-8">
            {notes.map((note) => (
              <li key={note.path} className="relative group">
                <button
                  onClick={() => {
                    navigate(`/notes/${note.id}`);
                    if (window.innerWidth < 768) window.scrollTo(0, 0); // scroll to top on mobile
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm rounded-md transition-all text-left relative z-10 ${activeNote?.id === note.id
                    ? 'bg-red-50 text-red-700 font-semibold before:absolute before:left-[-17px] before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-4 before:bg-red-600 before:rounded-r'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  {note.rawName.toLowerCase().includes('sql') ? (
                    <span className="text-blue-500 font-mono text-[9px] font-bold bg-blue-50 px-1 rounded shadow-sm">SQL</span>
                  ) : note.rawName.toLowerCase().includes('git') ? (
                    <span className="text-orange-500 font-mono text-[9px] font-bold bg-orange-50 px-1 rounded shadow-sm">GIT</span>
                  ) : note.rawName.toLowerCase().includes('react') ? (
                    <span className="text-blue-400 font-mono text-[9px] font-bold bg-blue-50 px-1 rounded shadow-sm">JSX</span>
                  ) : (
                    <FileText size={14} className={activeNote?.id === note.id ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-600'} />
                  )}
                  <span className="truncate flex-1">{note.name}</span>
                </button>
              </li>
            ))}
            {notes.length === 0 && (
              <li className="text-xs text-gray-400 pl-6 italic py-2">No files found.</li>
            )}
          </ul>
        </div>
      </aside>

      {/* 2) Main Workspace (Scrollable area) */}
      <main className="flex-1 min-w-0 bg-white md:h-[calc(100vh-64px)] md:overflow-y-auto scrollbar-hide flex flex-col relative">

        {/* Editor Tabs / Header */}
        {activeNote && (
          <div className="h-14 border-b border-gray-200 flex items-center bg-gray-50/80 sticky top-0 z-20">
            <div className="flex items-center h-full px-8 border-r border-gray-200 bg-white border-t-[3px] border-t-red-500 text-sm gap-2.5 min-w-fit shadow-sm relative">
              <Hash size={16} className="text-gray-400" />
              <span className="font-bold text-gray-800 tracking-wide">{activeNote.name}</span>

              {/* Bottom cover to blend with content area */}
              <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-white z-10"></div>
            </div>
            {/* Empty space filler to look like a tab bar */}
            <div className="flex-1 h-full"></div>
          </div>
        )}

        <div className="flex-1 flex justify-center pb-24">
          {activeNote ? (
            <div className="w-full max-w-3xl p-4 md:p-8 shrink-0 pb-16">

              {/* The Core Cheatsheet Content */}
              <div className="animate-fade-in-up">
                {/* AI Summary Injection */}
                {FEATURES.ENABLE_AI_ASSISTANT && activeNote?.content && (
                  <>
                    <AiSummaryPanel
                      noteContent={activeNote.content}
                      noteId={activeNote.id}
                    />

                    {/* Mobile Onboarding Tip for Long-Press */}
                    <div className="md:hidden mt-2 mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/60 rounded-xl p-4 flex gap-3 items-start shadow-sm mx-1">
                      <span className="text-yellow-600 text-base leading-none shrink-0 bg-white rounded-full p-1.5 shadow-sm border border-yellow-200 flex items-center justify-center">💡</span>
                      <div className="text-[13px] text-yellow-900/90 leading-relaxed font-medium pt-0.5">
                        <strong className="block mb-1 text-yellow-950 text-sm">คำแนะนำ: การเปิดโหมดสรุปเนื้อหา</strong>
                        สามารถ <span className="underline decoration-yellow-400 font-bold underline-offset-4 decoration-2">แตะหน้าจอค้างไว้</span> (Long-press) ที่ย่อหน้าใดก็ได้ประมาณ 1 วินาที เพื่ออ่านสรุปใจความสำคัญ
                      </div>
                    </div>

                    <AiSelectionTooltip noteContent={activeNote.content} />
                  </>
                )}

                <NoteCard markdown={activeNote.content} />
              </div>

              {/* Document Navigation (Prev / Next) */}
              <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center text-sm">
                {prevNote ? (
                  <button
                    onClick={() => navigate(`/notes/${prevNote.id}`)}
                    className="flex flex-col items-start p-4 border border-gray-200 rounded-lg hover:border-red-400 hover:shadow-sm focus:ring-1 focus:ring-red-400 transition-all w-full sm:w-[48%] bg-white group"
                  >
                    <span className="text-xs text-gray-400 uppercase font-semibold mb-1 flex items-center gap-1 group-hover:text-red-500 transition-colors">
                      <ArrowLeft size={12} /> Previous
                    </span>
                    <span className="font-medium text-gray-800 truncate w-full text-left">{prevNote.name}</span>
                  </button>
                ) : <div className="hidden sm:block sm:w-[48%]"></div>}

                {nextNote ? (
                  <button
                    onClick={() => navigate(`/notes/${nextNote.id}`)}
                    className="flex flex-col items-end p-4 border border-gray-200 rounded-lg hover:border-red-400 hover:shadow-sm focus:ring-1 focus:ring-red-400 transition-all w-full sm:w-[48%] bg-white group text-right"
                  >
                    <span className="text-xs text-gray-400 uppercase font-semibold mb-1 flex items-center gap-1 group-hover:text-red-500 transition-colors">
                      Next <ArrowRight size={12} />
                    </span>
                    <span className="font-medium text-gray-800 truncate w-full">{nextNote.name}</span>
                  </button>
                ) : <div className="hidden sm:block sm:w-[48%]"></div>}
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full min-h-[50vh] text-gray-400 opacity-50 space-y-4">
              <BookOpen size={64} />
              <p className="text-lg">Select a file from the explorer to view</p>
            </div>
          )}

          {/* 3) Right Sidebar: Table of Contents (TOC) */}
          {activeNote && headings.length > 0 && (
            <aside className="hidden xl:block w-64 shrink-0 px-6 py-8 border-l border-gray-100 bg-[#fdfdfd] h-[calc(100vh-104px)] sticky top-10 overflow-y-auto scrollbar-hide">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-1.5"><List size={14} className="text-gray-400" /> On this page</h3>
              <ul className="space-y-2.5 text-sm text-gray-500">
                {headings.map((heading, i) => (
                  <li
                    key={`${heading.id}-${i}`}
                    style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                  >
                    <a
                      href={`#${heading.id}`}
                      onClick={(e) => scrollToHeading(e, heading.id, heading.text)}
                      className="hover:text-red-600 transition-colors line-clamp-2 leading-tight"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}

        </div>
      </main>

      {/* 4) Modal */}
      <CmdKModal
        notes={notes}
        isOpen={isCmdKOpen}
        onClose={() => setIsCmdKOpen(false)}
        onSelectNote={(note) => {
          navigate(`/notes/${note.id}`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
