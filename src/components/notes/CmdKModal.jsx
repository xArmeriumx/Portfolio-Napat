import { useState, useEffect, useRef } from 'react';
import { Search, FileText } from 'lucide-react';

export default function CmdKModal({ notes, isOpen, onClose, onSelectNote }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setActiveIndex(0);
      // Timeout ensures the input is rendered before focusing
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Full-text search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const newResults = [];

    notes.forEach(note => {
      // 1. Check title match
      const titleMatch = note.name.toLowerCase().includes(lowerQuery);
      
      // 2. Search in file content
      const content = note.content;
      const lowerContent = content.toLowerCase();
      let matchIdx = lowerContent.indexOf(lowerQuery);
      
      const snippets = [];
      let lastExtractEnd = 0;
      let count = 0;

      // Extract up to 3 snippets per file
      while (matchIdx !== -1 && count < 3) {
        // Find safe boundaries for a snippet (approx 40 chars before, 60 after)
        const start = Math.max(lastExtractEnd, matchIdx - 40);
        const end = Math.min(content.length, matchIdx + query.length + 60);
        
        let snippet = content.slice(start, end);

        snippets.push({ text: snippet, exactMatch: matchIdx });
        
        count++;
        lastExtractEnd = end;
        // Find next occurrence, skipping a bit to prevent overlapping too closely
        matchIdx = lowerContent.indexOf(lowerQuery, matchIdx + query.length + 20);
      }

      if (titleMatch || snippets.length > 0) {
        newResults.push({
          note,
          snippets
        });
      }
    });

    setResults(newResults);
    setActiveIndex(0); // Reset selection to top result
  }, [query, notes]);

  // Handle Keyboard Navigation within Modal
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[activeIndex]) {
        onSelectNote(results[activeIndex].note);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Search Modal */}
      <div 
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 animate-fade-in-up z-10"
        role="dialog"
        aria-modal="true"
      >
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-gray-100 bg-white">
          <Search size={22} className="text-red-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-lg placeholder-gray-400 text-gray-900 focus:ring-0 p-0"
            placeholder="Search in all notes..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            onClick={onClose} 
            className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 border border-gray-200 rounded hover:bg-gray-200 transition-colors ml-2 shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[50vh] overflow-y-auto scrollbar-hide py-2 bg-[#fdfdfd]">
          {query && results.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              No results found for "<span className="text-gray-900 font-bold">{query}</span>"
            </div>
          ) : (
            <ul className="py-2">
              {results.map((result, i) => {
                const isSelected = i === activeIndex;
                return (
                  <li key={result.note.path} className="px-2">
                    <button
                      className={`w-full text-left px-4 py-3 rounded-lg flex flex-col gap-2 transition-all ${
                        isSelected ? 'bg-red-50 shadow-sm border border-red-100' : 'hover:bg-gray-50 border border-transparent'
                      }`}
                      onClick={() => {
                        onSelectNote(result.note);
                        onClose();
                      }}
                      onMouseEnter={() => setActiveIndex(i)}
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={18} className={isSelected ? 'text-red-500' : 'text-gray-400'} />
                        <span className={`text-base font-bold ${isSelected ? 'text-red-700' : 'text-gray-800'}`}>
                          {result.note.name}
                        </span>
                      </div>

                      {/* Display Text Snippets */}
                      {result.snippets.length > 0 && (
                        <div className="space-y-1 mt-1">
                          {result.snippets.map((snip, j) => {
                             // Safe splitting for highlight
                             const parts = snip.text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
                             return (
                               <div key={j} className="text-xs text-gray-600 pl-6 line-clamp-2 leading-relaxed opacity-90 font-mono bg-white p-2 rounded border border-gray-100">
                                 <span className="text-gray-300 font-sans mr-1">...</span>
                                 {parts.map((part, k) => 
                                   part.toLowerCase() === query.toLowerCase() ? (
                                     <mark key={k} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5 font-bold shadow-sm">{part}</mark>
                                   ) : (
                                     <span key={k}>{part}</span>
                                   )
                                 )}
                                 <span className="text-gray-300 font-sans ml-1">...</span>
                               </div>
                             );
                          })}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          
          {/* Default Empty State */}
          {!query && (
            <div className="px-6 py-10 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
               <Search size={32} className="opacity-20 mb-2" />
               <p className="text-sm font-medium text-gray-500">Start typing to search inside the documents.</p>
               <div className="flex gap-2 items-center opacity-70 mt-4">
                 <span>Navigate:</span>
                 <kbd className="bg-white rounded border border-gray-200 shadow-sm px-1.5 py-0.5 font-sans">↑</kbd> 
                 <kbd className="bg-white rounded border border-gray-200 shadow-sm px-1.5 py-0.5 font-sans">↓</kbd> 
                 <span className="ml-2">Select:</span>
                 <kbd className="bg-white rounded border border-gray-200 shadow-sm px-1.5 py-0.5 font-sans">Enter</kbd>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
