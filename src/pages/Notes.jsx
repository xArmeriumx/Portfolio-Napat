import { useState, useEffect, useMemo } from 'react';
import NoteCard from '../components/notes/NoteCard';
import { BookOpen, FileText, ChevronRight, Hash, FolderTree, Search, ArrowLeft, ArrowRight, List } from 'lucide-react';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const formatFileName = (path) => {
    const filename = path.split('/').pop().replace('.md', '');
    return filename.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const markdownFiles = import.meta.glob('/src/data/notes/*.md', { query: '?raw', import: 'default' });
        const loadedNotes = [];
        
        for (const path in markdownFiles) {
          const content = await markdownFiles[path]();
          loadedNotes.push({ 
            path, 
            content,
            name: formatFileName(path),
            rawName: path.split('/').pop()
          });
        }
        
        setNotes(loadedNotes);
        if (loadedNotes.length > 0) {
          setActiveNote(loadedNotes[0]);
        }
      } catch (error) {
        console.error("Failed to load notes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, []);

  const filteredNotes = notes.filter(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()) || n.rawName.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const currentIndex = notes.findIndex(n => n.path === activeNote?.path);
  const prevNote = currentIndex > 0 ? notes[currentIndex - 1] : null;
  const nextNote = currentIndex < notes.length - 1 ? notes[currentIndex + 1] : null;

  // Extract headings for Table of Contents (TOC) - h2 and h3
  const headings = useMemo(() => {
    if (!activeNote) return [];
    const regex = /^(#{2,3})\s+(.+)$/gm;
    const items = [];
    let match;
    while ((match = regex.exec(activeNote.content)) !== null) {
      const level = match[1].length; // number of #
      const text = match[2].replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/`([^`]+)`/g, '$1'); // Clean simple markdown
      const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
      items.push({ level, text, id });
    }
    return items;
  }, [activeNote]);

  const scrollToHeading = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // scroll with some offset for the fixed navbar (approx 120px)
      const top = element.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: 'smooth' });
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
             <FolderTree size={18} className="text-red-500"/>
             <span className="font-bold uppercase tracking-wider text-sm">Explorer</span>
           </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-gray-100 bg-gray-50/30">
          <div className="relative">
             <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search cheatsheets..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-shadow"
             />
          </div>
        </div>

        {/* File List */}
        <div className="p-2 flex-1 overflow-y-auto scrollbar-hide">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-2 mb-2 mt-2 flex items-center gap-1">
             <ChevronRight size={14} /> 
             <span>DOCS</span>
          </div>
          
          <ul className="space-y-0.5 relative before:absolute before:inset-y-0 before:left-3.5 before:w-px before:bg-gray-100 ml-4 pb-8">
            {filteredNotes.map((note) => (
              <li key={note.path} className="relative group">
                <button
                  onClick={() => {
                    setActiveNote(note);
                    if (window.innerWidth < 768) window.scrollTo(0, 0); // scroll to top on mobile
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm rounded-md transition-all text-left relative z-10 ${
                    activeNote?.path === note.path
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
                    <FileText size={14} className={activeNote?.path === note.path ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-600'} />
                  )}
                  <span className="truncate flex-1">{note.name}</span>
                </button>
              </li>
            ))}
            {filteredNotes.length === 0 && (
               <li className="text-xs text-gray-400 pl-6 italic py-2">No files found.</li>
            )}
          </ul>
        </div>
      </aside>

      {/* 2) Main Workspace (Scrollable area) */}
      <main className="flex-1 min-w-0 bg-white md:h-[calc(100vh-64px)] md:overflow-y-auto scrollbar-hide flex flex-col relative">
        
        {/* Editor Tabs / Header */}
        {activeNote && (
          <div className="h-12 border-b border-gray-200 flex items-center bg-white sticky top-0 z-20">
            <div className="flex items-center h-full px-6 border-r border-gray-200 bg-gray-100 text-sm gap-2.5 min-w-fit">
               <Hash size={14} className="text-gray-500"/>
               <span className="font-semibold text-gray-700 tracking-wide">{activeNote.name}</span>
            </div>
            {/* Empty space filler to look like a tab bar */}
            <div className="flex-1 h-full bg-gray-50/50"></div>
          </div>
        )}

        <div className="flex-1 flex justify-center pb-24">
          {activeNote ? (
            <div className="w-full max-w-3xl p-4 md:p-8 shrink-0 pb-16">
              
              {/* The Core Cheatsheet Content */}
              <div className="animate-fade-in-up">
                <NoteCard markdown={activeNote.content} />
              </div>

              {/* Document Navigation (Prev / Next) */}
              <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center text-sm">
                {prevNote ? (
                  <button 
                    onClick={() => setActiveNote(prevNote)}
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
                     onClick={() => setActiveNote(nextNote)}
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
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-1.5"><List size={14} className="text-gray-400"/> On this page</h3>
              <ul className="space-y-2.5 text-sm text-gray-500">
                {headings.map((heading, i) => (
                  <li 
                    key={`${heading.id}-${i}`}
                    style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
                  >
                    <a 
                      href={`#${heading.id}`}
                      onClick={(e) => scrollToHeading(e, heading.id)}
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
    </div>
  );
}
