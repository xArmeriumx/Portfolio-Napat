import { useState, useEffect } from 'react';
import { X, Search, ArrowRight, FileText, CheckCircle2, AlertCircle, Sparkles, Copy, Check, CornerDownRight } from 'lucide-react';
import { summarizeContent, askAiContext, generatePrompts } from '../../services/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AiSummaryPanel({ noteContent, noteId }) {
  const [query, setQuery] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState(null);
  const [currentEvalId, setCurrentEvalId] = useState(null);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Follow-up chips
  const [followUps, setFollowUps] = useState([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(false);
  
  // Typeahead (Predictive Input)
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const [typeahead, setTypeahead] = useState('');

  // Note: We no longer use useTypewriter because we have real streaming (SSE) from the backend!

  if (currentEvalId !== noteId && (summaryText || searchStatus)) {
    setSummaryText('');
    setSearchStatus(null);
    setQuery('');
    setFollowUps([]);
    setCopied(false);
  }

  // 1. Proactive Cache-Warming (Kairos/Daemon effect)
  // แอบคอมพิวท์คำตอบ(Summary, Prompts) ไว้ใน Background หลังจากที่ผู้ใช้อ่านเนื้อหาเกิน 3 วินาที
  // ผลลัพธ์จะถูกเซฟเงียบๆ ลง Cache ฝั่ง Client ทำให้ตอนที่ผู้ใช้กดปุ่มจะได้ข้อมูลทันที 0ms!
  useEffect(() => {
    if (!noteContent || !noteId) return;
    const timer = setTimeout(() => {
      // โหลดทิ้งไว้ในแบคกราวด์ ไม่เอาผลมาโชว์ (Fire and forget)
      generatePrompts(noteContent.substring(0, 1500))
        .then(chips => { if (Array.isArray(chips)) setSuggestedPrompts(chips); })
        .catch(() => {});
      summarizeContent(noteContent).catch(() => {});
    }, 3500); // ดีเลย์ 3.5 วินาที
    return () => clearTimeout(timer);
  }, [noteContent, noteId]);

  // 1.5 Typeahead Ghost Text effect
  useEffect(() => {
    if (!query) {
      setTypeahead('');
      return;
    }
    const match = suggestedPrompts.find(p => p.toLowerCase().startsWith(query.toLowerCase()));
    setTypeahead(match || '');
  }, [query, suggestedPrompts]);


  // Listen for cross-component highlight requests (from AiSelectionTooltip)
  useEffect(() => {
    const handleHighlight = (e) => highlightQuoteInDocument(e.detail.quote);
    window.addEventListener('ai-highlight-quote', handleHighlight);
    return () => window.removeEventListener('ai-highlight-quote', handleHighlight);
  }, []);

  const highlightQuoteInDocument = (quote) => {
    if (!quote || quote === 'null' || quote.length < 5) return false;
    
    const elements = document.querySelectorAll('.prose p, .prose li, .prose h1, .prose h2, .prose h3, .prose td, .prose th, .prose blockquote');
    const normalizedQuote = quote.replace(/\s+/g, '').toLowerCase();
    
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
        bestMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        bestMatch.animate([
          { backgroundColor: 'rgba(254, 240, 138, 1)', color: '#000', outline: '4px solid rgba(254, 240, 138, 1)', borderRadius: '4px' },
          { backgroundColor: 'rgba(254, 240, 138, 0)', color: 'inherit', outline: '4px solid rgba(254, 240, 138, 0)', borderRadius: '4px' }
        ], { duration: 3500, easing: 'ease-out' });
      }, 100);
      return true;
    }
    return false;
  };

  const handleSearch = async (e, directQuery = null) => {
    if (e) e.preventDefault();
    const activeQuery = directQuery || query;
    if (!activeQuery.trim() || !noteContent.trim()) return;
    
    if (directQuery && !query) setQuery(directQuery);

    setLoading(true);
    setSearchStatus('searching');
    setCurrentEvalId(noteId);
    
    try {
      const resObj = await askAiContext(activeQuery, noteContent);
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
      setTimeout(() => {
         setSearchStatus((prev) => prev !== 'summarizing' ? null : prev);
      }, 4000);
    }
  };

  const handleSummarize = async () => {
    if (!noteContent.trim()) return;
    setLoading(true);
    setSearchStatus('summarizing');
    setCurrentEvalId(noteId);
    setSummaryText('');
    setFollowUps([]);
    setCopied(false);
    
    try {
      await summarizeContent(noteContent, (chunk) => {
         setSummaryText(chunk);
      });

      // Generate follow-up chips after summary is ready
      setFollowUpsLoading(true);
      try {
        const chips = await generatePrompts(noteContent.substring(0, 1500));
        if (Array.isArray(chips)) setFollowUps(chips.slice(0, 3));
      } catch (_) { /* silently skip follow-ups on error */ }
      setFollowUpsLoading(false);

    } catch (err) {
      setSummaryText('ขออภัย ไม่สามารถประมวลผลข้อมูลได้ในเวลานี้');
    } finally {
      setLoading(false);
      setSearchStatus(null);
    }
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let statusIcon = <Search size={18} className="absolute left-4 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 sm:w-3.5 sm:h-3.5 pointer-events-none" />;
  if (searchStatus === 'searching') {
     statusIcon = <div className="absolute left-4 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin"></div>;
  } else if (searchStatus === 'found') {
     statusIcon = <CheckCircle2 size={18} className="absolute left-4 sm:left-3 top-1/2 -translate-y-1/2 text-green-500 sm:w-4 sm:h-4" />;
  } else if (searchStatus === 'not_found' || searchStatus === 'error') {
     statusIcon = <AlertCircle size={18} className="absolute left-4 sm:left-3 top-1/2 -translate-y-1/2 text-red-500 sm:w-4 sm:h-4" />;
  }

  let inputPlaceholder = "พิมพ์คำค้นหาเพื่อให้ระบบพาไปเนื้อหาส่วนนั้น...";
  if (searchStatus === 'found') inputPlaceholder = "เจอจุดที่เกี่ยวข้องแล้ว!";
  else if (searchStatus === 'not_found') inputPlaceholder = "ไม่พบเนื้อหาที่เกี่ยวข้องในเอกสารนี้";
  else if (searchStatus === 'searching') inputPlaceholder = "กำลังหาจุดที่เกี่ยวข้อง...";

  return (
    <div className="mb-6 w-full border border-gray-200 bg-white rounded-xl sm:rounded-lg shadow-sm overflow-hidden text-sm transition-all duration-300">
      
      {/* 1. Main Search Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-gray-50 border-b border-gray-100">
         <form onSubmit={(e) => handleSearch(e)} className="relative flex-1 group border-b sm:border-b-0 sm:border-r border-gray-200 bg-white sm:bg-transparent transition-colors">
           {statusIcon}
           
           {/* Ghost Text (Typeahead) Layer */}
           <div className="absolute inset-0 flex items-center pl-12 sm:pl-10 pr-14 sm:pr-10 text-[16px] sm:text-[13px] leading-relaxed pointer-events-none whitespace-pre overflow-hidden">
             <span className="opacity-0">{query}</span>
             {typeahead && typeahead.toLowerCase().startsWith(query.toLowerCase()) && (
               <span className="text-gray-400 font-medium tracking-wide">
                 {typeahead.slice(query.length)}
               </span>
             )}
             {/* Key Hint Button for Tab */}
             {query && typeahead && typeahead.toLowerCase().startsWith(query.toLowerCase()) && (
               <span className="ml-2 text-[10px] bg-gray-100 text-gray-400 px-1 rounded border border-gray-200 uppercase animate-fade-in-up">Tab ⇥</span>
             )}
           </div>

           <input 
             type="text"
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             onKeyDown={(e) => {
               if (e.key === 'Tab' && typeahead) {
                  e.preventDefault();
                  setQuery(typeahead);
               }
             }}
             placeholder={inputPlaceholder}
             className="relative z-10 w-full py-3.5 sm:py-2.5 pl-12 sm:pl-10 pr-14 sm:pr-10 bg-transparent border-none text-[16px] sm:text-[13px] leading-relaxed text-gray-800 focus:outline-none transition-colors placeholder-gray-400"
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

      {/* 1.5. Keybindings & Shortcuts Formal Hint */}
      {!summaryText && !searchStatus && (
         <div className="bg-white px-4 sm:px-3 py-2 border-b border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11.5px] text-gray-500 animate-fade-in-down">
           <span className="flex items-center gap-1.5 font-medium whitespace-nowrap">
             <kbd className="bg-gray-100/80 text-gray-500 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border border-gray-200/60 shadow-[0_1px_0_rgba(200,200,200,0.5)]">Tab ⇥</kbd> 
             เติมข้อความอัตโนมัติ
           </span>
           <span className="hidden sm:block w-1 h-1 bg-gray-200 rounded-full"></span>
           <span className="flex items-center gap-1.5 font-medium whitespace-nowrap">
             <div className="flex items-center gap-0.5">
                <kbd className="bg-gray-100/80 text-gray-500 px-1.5 py-0.5 rounded text-[10px] font-bold border border-gray-200/60 shadow-[0_1px_0_rgba(200,200,200,0.5)]">⇧ Shift</kbd>
                <span className="text-[10px] text-gray-400 font-bold">×2</span>
             </div>
             อธิบายข้อความที่คลุมดำไว้ทันที
           </span>
         </div>
      )}

      {/* 2. Streaming Summary Render Panel */}
      {summaryText && (
        <div className="relative p-5 sm:p-4 bg-white animate-fade-in-down border-t border-gray-100 group">

          {/* Header row: label + copy button */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={11} /> ผลสรุปเนื้อหา
            </span>
            <button
              onClick={handleCopySummary}
              title="คัดลอกผลสรุป"
              className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
            </button>
          </div>

           <div className="prose prose-sm prose-gray max-w-none text-gray-700 
               prose-p:leading-relaxed prose-a:text-red-600 prose-strong:text-gray-900 
               prose-ul:pl-4 prose-ol:pl-4 prose-li:my-1 text-[14px] sm:text-[13px]"
           >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {summaryText}
              </ReactMarkdown>
              {searchStatus === 'summarizing' && <span className="inline-block w-1.5 h-4 ml-1 bg-gray-400 animate-pulse align-middle"></span>}
           </div>

          {/* Follow-up question chips */}
          {searchStatus !== 'summarizing' && followUps.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                <CornerDownRight size={11} /> คำถามที่เกี่ยวข้อง
              </p>
              <div className="flex flex-wrap gap-2">
                {followUps.map((chip, i) => (
                  <button
                    key={i}
                    onClick={(e) => handleSearch(e, chip)}
                    disabled={loading}
                    className="px-3 py-1.5 text-[12px] bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-300 text-gray-600 hover:text-red-700 rounded-full transition-all font-medium shadow-sm"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up chips loading skeleton */}
          {searchStatus !== 'summarizing' && followUpsLoading && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
              {[80, 100, 90].map((w, i) => (
                <div key={i} className="h-7 bg-gray-100 rounded-full animate-pulse" style={{ width: w }} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
