import { useState } from 'react';
import { X, Search, ArrowRight, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { summarizeContent, askAiContext } from '../../services/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AiSummaryPanel({ noteContent, noteId }) {
  const [query, setQuery] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState(null); // 'searching', 'found', 'not_found', 'error', 'summarizing'
  
  const [currentEvalId, setCurrentEvalId] = useState(null);

  if (currentEvalId !== noteId && (summaryText || searchStatus)) {
    setSummaryText('');
    setSearchStatus(null);
    setQuery('');
  }

  const highlightQuoteInDocument = (quote) => {
    if (!quote || quote === 'null' || quote.length < 5) return false;
    
    // Attempt to search for exact or fuzzy content block
    const elements = document.querySelectorAll('.prose p, .prose li, .prose h1, .prose h2, .prose h3, .prose td, .prose th, .prose blockquote');
    const normalizedQuote = quote.replace(/\s+/g, '').toLowerCase();
    
    // Find shortest matching element to avoid highlighting huge parent chunks
    let bestMatch = null;
    let shortestLength = Infinity;
    
    for (let i = 0; i < elements.length; i++) {
       const el = elements[i];
       const text = el.textContent || '';
       const normalizedText = text.replace(/\s+/g, '').toLowerCase();
       
       if (normalizedText.includes(normalizedQuote) && text.length < shortestLength) {
          bestMatch = el;
          shortestLength = text.length;
       }
    }
    
    if (bestMatch) {
      setTimeout(() => {
        // Smooth scroll to element and center it
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
      return true; // found
    }
    return false; // not found
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() || !noteContent.trim()) return;
    
    setLoading(true);
    setSearchStatus('searching');
    setCurrentEvalId(noteId);
    
    try {
      // AI extracts the exact quote
      const resObj = await askAiContext(query, noteContent);
      
      if (resObj && resObj.quote && resObj.quote !== 'null') {
        const found = highlightQuoteInDocument(resObj.quote);
        setSearchStatus(found ? 'found' : 'not_found');
      } else {
        setSearchStatus('not_found');
      }
    } catch (err) {
      setSearchStatus('error');
    } finally {
      setLoading(false);
      // Reset interactive state after brief delay so user sees feedback
      setTimeout(() => {
         setSearchStatus(null);
      }, 4000);
    }
  };

  const handleSummarize = async () => {
    if (!noteContent.trim()) return;
    setLoading(true);
    setSearchStatus('summarizing');
    setCurrentEvalId(noteId);
    setSummaryText('');
    
    try {
      const result = await summarizeContent(noteContent);
      setSummaryText(result);
    } catch (err) {
      setSummaryText('ขออภัย ไม่สามารถประมวลผลข้อมูลได้ในเวลานี้');
    } finally {
      setLoading(false);
      setSearchStatus(null);
    }
  };

  // Dynamic UI Icon
  let statusIcon = <Search size={18} className="absolute left-4 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 sm:w-3.5 sm:h-3.5 pointer-events-none" />;
  if (searchStatus === 'searching') {
     statusIcon = <div className="absolute left-4 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin"></div>;
  } else if (searchStatus === 'found') {
     statusIcon = <CheckCircle2 size={18} className="absolute left-4 sm:left-3 top-1/2 -translate-y-1/2 text-green-500 sm:w-4 sm:h-4" />;
  } else if (searchStatus === 'not_found' || searchStatus === 'error') {
     statusIcon = <AlertCircle size={18} className="absolute left-4 sm:left-3 top-1/2 -translate-y-1/2 text-red-500 sm:w-4 sm:h-4" />;
  }

  // Dynamic Placeholder Text
  let inputPlaceholder = "พิมพ์คำค้นหาเพื่อให้ระบบพาไปเนื้อหาส่วนนั้น...";
  if (searchStatus === 'found') inputPlaceholder = "เจอจุดที่เกี่ยวข้องแล้ว!";
  else if (searchStatus === 'not_found') inputPlaceholder = "ไม่พบเนื้อหาที่เกี่ยวข้องในเอกสารนี้";
  else if (searchStatus === 'searching') inputPlaceholder = "กำลังหาจุดที่เกี่ยวข้อง...";

  return (
    <div className="mb-6 w-full border border-gray-200 bg-white rounded-xl sm:rounded-lg shadow-sm overflow-hidden text-sm transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-gray-50 border-b border-gray-100">
         
         {/* Feature 1: Smart Search & Highlight */}
         <form onSubmit={handleSearch} className="relative flex-1 group border-b sm:border-b-0 sm:border-r border-gray-200 bg-white sm:bg-transparent transition-colors">
           {statusIcon}
           <input 
             type="text"
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder={inputPlaceholder}
             className="w-full py-3.5 sm:py-2.5 pl-12 sm:pl-10 pr-14 sm:pr-10 bg-transparent border-none text-[16px] sm:text-[13px] leading-relaxed text-gray-800 focus:outline-none focus:bg-white transition-colors placeholder-gray-400"
             autoComplete="off"
             spellCheck="false"
             disabled={loading}
           />
           <button 
             type="submit"
             disabled={!query.trim() || loading || searchStatus === 'searching'}
             className="absolute right-2 sm:right-1.5 top-1/2 -translate-y-1/2 p-2 sm:p-1 bg-gray-100 sm:bg-gray-200 text-gray-600 rounded-md sm:rounded hover:bg-gray-200 disabled:opacity-50 transition-colors"
           >
             <ArrowRight size={18} className="sm:w-3.5 sm:h-3.5" />
           </button>
         </form>
         
         {/* Feature 2: Summarize (Optional) */}
         <div className="flex items-center justify-between sm:justify-start px-4 sm:px-2 py-3 sm:py-0 w-full sm:w-auto bg-gray-50/50 sm:bg-transparent">
            {summaryText && (
              <button 
                onClick={() => setSummaryText('')}
                className="px-2 py-1 text-[13px] sm:text-xs text-gray-500 hover:text-red-500 font-medium flex items-center gap-1.5 sm:gap-1 transition-colors"
              >
                 <X size={14} className="sm:w-3 sm:h-3" /> ปิดผลสรุป
              </button>
            )}
            {!summaryText && (
              <div className="flex gap-2 items-center w-full justify-end">
                <button 
                  onClick={handleSummarize}
                  disabled={loading || searchStatus === 'summarizing'}
                  className="px-5 sm:px-3 py-2 sm:py-1 bg-white border border-gray-200 text-gray-700 rounded-lg sm:rounded text-[14px] sm:text-xs hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-colors font-semibold flex items-center gap-2 sm:gap-1 disabled:opacity-50"
                  title="สรุปใจความสำคัญจากเนื้อหา"
                >
                  {searchStatus === 'summarizing' ? (
                     <div className="sm:w-3 sm:h-3 w-4 h-4 rounded-full border border-gray-300 border-t-gray-600 animate-spin"></div>
                  ) : (
                     <FileText size={16} className="sm:w-3 sm:h-3" />
                  )}
                  สรุปเนื้อหา
                </button>
              </div>
            )}
         </div>
      </div>

      {/* Summary Render Panel (Only drops down for Summarize) */}
      {summaryText && (
        <div className="p-5 sm:p-4 bg-white animate-fade-in-down border-t border-gray-100">
           <div className="prose prose-sm prose-gray max-w-none text-gray-700 
               prose-p:leading-relaxed prose-a:text-red-600 prose-strong:text-gray-900 
               prose-ul:pl-4 prose-ol:pl-4 prose-li:my-1 text-[14px] sm:text-[13px]"
           >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {summaryText}
              </ReactMarkdown>
           </div>
        </div>
      )}
    </div>
  );
}
