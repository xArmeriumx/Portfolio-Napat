import { useState } from 'react';
import { X, Search, ArrowRight, FileText } from 'lucide-react';
import { summarizeContent, askAiContext } from '../../services/aiService';

export default function AiSummaryPanel({ noteContent, noteId }) {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Track which note we evaluated so it clears when note changes
  const [currentEvalId, setCurrentEvalId] = useState(null);

  if (currentEvalId !== noteId && answer) {
    setAnswer('');
    setQuery('');
    setError(null);
  }

  const highlightQuoteInDocument = (quote) => {
    if (!quote || quote.length < 5) return;
    
    // Attempt to search for exact or fuzzy content block
    const elements = document.querySelectorAll('.prose p, .prose li, .prose h1, .prose h2, .prose h3, .prose td, .prose th');
    const normalizedQuote = quote.replace(/\\s+/g, '').toLowerCase();
    
    // Find shortest matching element to avoid highlighting huge parent chunks
    let bestMatch = null;
    let shortestLength = Infinity;
    
    for (let i = 0; i < elements.length; i++) {
       const el = elements[i];
       const text = el.textContent || '';
       const normalizedText = text.replace(/\\s+/g, '').toLowerCase();
       
       if (normalizedText.includes(normalizedQuote) && text.length < shortestLength) {
          bestMatch = el;
          shortestLength = text.length;
       }
    }
    
    if (bestMatch) {
      setTimeout(() => {
        bestMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Flash animation via Web Animations API (safe for React DOM)
        bestMatch.animate([
          { backgroundColor: 'rgba(254, 240, 138, 1)', color: '#000', outline: '4px solid rgba(254, 240, 138, 1)', borderRadius: '4px' },
          { backgroundColor: 'rgba(254, 240, 138, 0)', color: 'inherit', outline: '4px solid rgba(254, 240, 138, 0)', borderRadius: '4px' }
        ], {
          duration: 3500,
          easing: 'ease-out'
        });
      }, 100);
    }
  };

  const executeAction = async (actionType, customQuery = '') => {
    if (!noteContent.trim()) return;
    setLoading(true);
    setError(null);
    setCurrentEvalId(noteId);
    
    try {
      let result = '';
      if (actionType === 'summarize') {
        result = await summarizeContent(noteContent);
        setAnswer(result);
      } else if (actionType === 'ask') {
        const resObj = await askAiContext(customQuery, noteContent);
        setAnswer(resObj.answer);
        if (resObj.quote) {
          highlightQuoteInDocument(resObj.quote);
        }
      }
    } catch (err) {
      setError('ขออภัย ไม่สามารถประมวลผลข้อมูลได้ในเวลานี้');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      executeAction('ask', query);
    }
  };

  return (
    <div className="mb-6 w-full border border-gray-200 bg-white rounded-xl sm:rounded-lg shadow-sm overflow-hidden text-sm">
      {/* Search & Tool Bar (Very minimal, non-sticky) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-gray-50 border-b border-gray-100">
         <form onSubmit={handleFormSubmit} className="relative flex-1 group border-b sm:border-b-0 sm:border-r border-gray-200 bg-white sm:bg-transparent">
           <Search size={18} className="absolute left-4 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 sm:w-3.5 sm:h-3.5 pointer-events-none" />
           <input 
             type="text"
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder="พิมพ์ข้อสงสัย หรือให้ระบบอ่านเนื้อหา..."
             className="w-full py-3.5 sm:py-2.5 pl-11 sm:pl-9 pr-14 sm:pr-10 bg-transparent border-none text-[16px] sm:text-[13px] leading-relaxed text-gray-800 focus:outline-none focus:bg-white transition-colors placeholder-gray-400"
             autoComplete="off"
             spellCheck="false"
           />
           <button 
             type="submit"
             disabled={!query.trim() || loading}
             className="absolute right-2 sm:right-1.5 top-1/2 -translate-y-1/2 p-2 sm:p-1 bg-gray-100 sm:bg-gray-200 text-gray-600 rounded-md sm:rounded hover:bg-gray-200 disabled:opacity-50 transition-colors"
           >
             <ArrowRight size={18} className="sm:w-3.5 sm:h-3.5" />
           </button>
         </form>
         
         <div className="flex items-center justify-between sm:justify-start px-4 sm:px-2 py-3 sm:py-0 w-full sm:w-auto bg-gray-50/50 sm:bg-transparent">
            {answer && (
              <button 
                onClick={() => { setAnswer(''); setQuery(''); setError(null); }}
                className="px-2 py-1 text-[13px] sm:text-xs text-gray-500 hover:text-red-500 font-medium flex items-center gap-1.5 sm:gap-1 transition-colors"
                title="ล้างผลลัพธ์"
              >
                 <X size={14} className="sm:w-3 sm:h-3" /> ปิดผลลัพธ์
              </button>
            )}
            {!answer && !loading && (
              <div className="flex gap-2 items-center w-full justify-end">
                <button 
                  onClick={() => executeAction('summarize')}
                  className="px-5 sm:px-3 py-2 sm:py-1 bg-white border border-gray-200 text-gray-700 rounded-lg sm:rounded text-[14px] sm:text-xs hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-colors font-semibold flex items-center gap-2 sm:gap-1"
                >
                  <FileText size={16} className="sm:w-3 sm:h-3" /> สรุปใจความสำคัญ
                </button>
              </div>
            )}
            {loading && (
              <div className="text-[11px] text-gray-500 px-3 flex items-center gap-2">
                 <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                 ประมวลผล...
              </div>
            )}
         </div>
      </div>

      {/* Result Panel (Rendered Inline cleanly) */}
      {(answer || error) && (
        <div className="p-4 bg-white animate-fade-in-down border-t border-gray-100">
           {error ? (
             <div className="text-xs text-red-600 flex items-start gap-2 bg-red-50 p-3 rounded border border-red-100">
               <span className="font-bold">Error:</span> {error}
             </div>
           ) : (
             <div className="prose prose-sm prose-gray max-w-none text-gray-700">
                <div style={{ whiteSpace: 'pre-wrap' }} className="leading-relaxed whitespace-pre-line text-[13px]">
                  {answer}
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
