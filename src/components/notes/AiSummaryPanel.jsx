import { useState } from 'react';
import { AlignLeft, X, ChevronDown, Check, Search, ArrowRight, Lightbulb } from 'lucide-react';
import { summarizeContent, askAiContext } from '../../services/aiService';

export default function AiSummaryPanel({ noteContent, noteId }) {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Track which note we evaluated so it clears when note changes
  const [currentEvalId, setCurrentEvalId] = useState(null);

  if (currentEvalId !== noteId && answer) {
    setAnswer('');
    setQuery('');
    setError(null);
  }

  const executeAction = async (actionType, customQuery = '') => {
    if (!noteContent.trim()) return;
    setLoading(true);
    setError(null);
    setCurrentEvalId(noteId);
    
    try {
      let result = '';
      if (actionType === 'summarize') {
        result = await summarizeContent(noteContent);
      } else if (actionType === 'ask') {
        result = await askAiContext(customQuery, noteContent);
      }
      setAnswer(result);
      setIsExpanded(true);
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
    <div className="mb-8 border border-gray-200 bg-white shadow-sm rounded-xl overflow-hidden animate-fade-in-up">
      
      {/* Search / Ask Box (Always visible) */}
      <div className="p-4 border-b border-gray-100 bg-white relative">
        <form onSubmit={handleFormSubmit} className="relative flex items-center">
           <Search size={18} className="absolute left-3 text-gray-400" />
           <input 
             type="text"
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder="พิมพ์ข้อสงสัย ค้นหา หรือสั่งสรุปข้อมูลจากเอกสารนี้..."
             className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:bg-white transition-all placeholder-gray-400"
           />
           <button 
             type="submit"
             disabled={!query.trim() || loading}
             className="absolute right-2 p-1.5 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800 transition-colors"
           >
             <ArrowRight size={16} />
           </button>
        </form>

        {/* Quick Suggestions (Pills) */}
        {!answer && !loading && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
             <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
               <Lightbulb size={12}/> แนะนำ:
             </span>
             <button 
               onClick={() => executeAction('summarize')} 
               className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-colors shadow-sm"
             >
                สรุปเนื้อหาสำคัญทั้งหมด
             </button>
             <button 
               onClick={() => {
                 const q = 'อธิบายเนื้อหานี้ให้มือใหม่เข้าใจง่ายๆ แบบเห็นภาพ';
                 setQuery(q);
                 executeAction('ask', q);
               }} 
               className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-colors shadow-sm hidden sm:inline-block"
             >
                อธิบายแบบฉบับย่อให้มือใหม่
             </button>
          </div>
        )}
      </div>

      {/* Result Panel (Only shown if we have an answer or are loading) */}
      {(answer || loading || error) && (
        <>
          {/* Header Panel */}
          <div 
            className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              <AlignLeft size={16} className="text-gray-600" />
              <span className="font-bold text-sm text-gray-800">ผลการประมวลผลเอกสาร</span>
              {!loading && <Check size={14} className="text-gray-400 ml-1" />}
            </div>
            <div className="flex gap-2 items-center">
              <button 
                onClick={(e) => { e.stopPropagation(); setAnswer(''); setQuery(''); setError(null); }}
                className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors mr-1"
                title="Clear result"
              >
                <X size={16} />
              </button>
              <button className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronDown size={18} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Content Body */}
          {isExpanded && (
            <div className="p-5 bg-white">
               {loading ? (
                 <div className="space-y-3">
                   <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"></div>
                   <div className="h-3 bg-gray-100 rounded animate-pulse w-full"></div>
                   <div className="h-3 bg-gray-100 rounded animate-pulse w-5/6"></div>
                   <div className="text-xs text-gray-500 mt-4 flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      กำลังวิเคราะห์อ้างอิงจากรหัสและเอกสาร...
                   </div>
                 </div>
               ) : error ? (
                 <div className="text-sm text-red-600 flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-100">
                   <span className="font-bold">เกิดข้อผิดพลาด:</span> {error}
                 </div>
               ) : (
                 <div className="prose prose-sm prose-gray max-w-none text-gray-700">
                    <div style={{ whiteSpace: 'pre-wrap' }} className="leading-relaxed whitespace-pre-line text-[15px]">
                      {answer}
                    </div>
                 </div>
               )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
