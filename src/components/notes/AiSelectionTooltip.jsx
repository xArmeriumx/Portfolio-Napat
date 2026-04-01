import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, Copy, Check, FileSearch } from 'lucide-react';
import { explainSelection } from '../../services/aiService';
import { useTypewriter } from '../../hooks/useTypewriter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AiSelectionTooltip({ noteContent }) {
  const [selection, setSelection] = useState("");
  const [position, setPosition] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Typewriter effect for AI explanation
  const { displayedText, isTyping, skipTyping } = useTypewriter(explanation, 8, !!explanation);
  
  const popoverRef = useRef(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    const handleMouseUp = (e) => {
      // Don't trigger if clicking inside the popover itself
      if (popoverRef.current && popoverRef.current.contains(e.target)) return;

      const fullSelection = window.getSelection();
      const text = fullSelection.toString().trim();

      // Only show if selection is reasonably long (e.g., > 10 chars) 
      if (text.length > 5 && text.length < 800) {
        // Ensure they highlighted inside the main document area
        const range = fullSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        let isInsideProse = false;
        let node = range.commonAncestorContainer;
        while (node) {
           if (node.nodeType === 1 && node.classList && node.classList.contains('prose')) {
              isInsideProse = true; break;
           }
           node = node.parentNode;
        }

        if (isInsideProse) {
          setSelection(text);
          // Get the exact rect of the first client box (to avoid huge block bounding box issues)
          const clientRects = range.getClientRects();
          const preciseRect = clientRects.length > 0 ? clientRects[0] : rect;
          
          setPosition({
            top: preciseRect.top - 8,
            left: preciseRect.left + (preciseRect.width / 2)
          });
          setIsOpen(false);
          setExplanation("");
        } else {
          closeTooltip();
        }
      } else {
        closeTooltip();
      }
    };

    // ⚡ 3. Double-Press Shortcut (Keyboard Haptic via claude-code's useDoublePress)
    // แก้อาการทับซ้อนกับการดับเบิลคลิกเมาส์ ด้วยการใช้ "กด Shift 2 ครั้งติดกัน" เมื่อคลุมดำเสร็จ
    let lastKeyTime = 0;
    let lastKey = '';
    
    const handleKeyDown = (e) => {
      // ห้ามทำงานถ้ากำลังพิมพ์ในช่อง Search
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // ตรวจจับเฉพาะปุ่ม Shift
      if (e.key === 'Shift') {
         const now = Date.now();
         if (lastKey === 'Shift' && now - lastKeyTime < 400) {
            // Double Press Detected (ภายใน 400ms)
            const text = window.getSelection().toString().trim();
            // เช็คว่ามีข้อความคลุมดำอยู่ และปุ่มรอพร้อมแล้ว หรือยังไม่ได้กดปุ่ม
            if (text.length > 0 && text.length < 800) {
              
              const range = window.getSelection().getRangeAt(0);
              let isInsideProse = false;
              let node = range.commonAncestorContainer;
              while (node) {
                 if (node.nodeType === 1 && node?.classList?.contains('prose')) {
                    isInsideProse = true; break;
                 }
                 node = node.parentNode;
              }
              
              if (isInsideProse) {
                 e.preventDefault();
                 
                 // ถ้าเปิดค้างไว้อยู่แล้ว ก็รันเลย
                 if (isOpen) {
                    triggerExplanation();
                 } else {
                    const rect = range.getBoundingClientRect();
                    const clientRects = range.getClientRects();
                    const preciseRect = clientRects.length > 0 ? clientRects[0] : rect;
                    setSelection(text);
                    triggerExplanation(text, {
                      top: preciseRect.top - 8,
                      left: preciseRect.left + (preciseRect.width / 2)
                    });
                 }
              }
            }
            lastKey = ''; // reset
         } else {
            lastKey = e.key;
            lastKeyTime = now;
         }
      } else {
         lastKey = '';
      }
    };

    const handleCustomExplain = (e) => {
       const { text, rect } = e.detail;
       setSelection(text);
       setPosition({
         top: rect.top - 10,
         left: rect.left + (rect.width / 2)
       });
       
       triggerExplanation(text);
    };

    const handleDocumentClick = (e) => {
       if (isOpen && popoverRef.current && !popoverRef.current.contains(e.target)) {
          const text = window.getSelection().toString().trim();
          if (text.length === 0) closeTooltip();
       }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('ai-explain-block', handleCustomExplain);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('ai-explain-block', handleCustomExplain);
    };
  }, [isOpen]);

  const closeTooltip = () => {
    setPosition(null);
    setSelection("");
    setIsOpen(false);
    setExplanation("");
    setCopied(false);
  };

  const handleCopyExplanation = () => {
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchInDoc = () => {
    // Fire the same event the AiSummaryPanel uses to highlight a quote
    const trimmed = selection.substring(0, 120); // use first 120 chars as the quote
    window.dispatchEvent(new CustomEvent('ai-highlight-quote', { detail: { quote: trimmed } }));
  };

  const triggerExplanation = async (textOverride = null, forcePos = null) => {
    const textToExplain = textOverride || selection;
    setIsOpen(true);
    setLoading(true);
    
    if (!isMobile) {
      if (forcePos) {
         setPosition({ top: forcePos.top + 30, left: forcePos.left });
      } else {
         setPosition(prev => ({ ...prev, top: prev.top + 30 }));
      }
    }
    
    // Notice: We don't remove ranges natively anymore! This allows the user to still use OS Copy tools!
    
    // Neighborhood Context Optimization: Extract text directly surrounding the selection
    let optimizedContext = noteContent;
    const matchIndex = noteContent.indexOf(textToExplain);
    if (matchIndex !== -1) {
       const start = Math.max(0, matchIndex - 600);
       const end = Math.min(noteContent.length, matchIndex + selection.length + 600);
       optimizedContext = noteContent.substring(start, end);
    } else {
       // Fallback to top 1500 chars if for some reason the selection text isn't an exact match
       optimizedContext = noteContent.substring(0, 1500) + "...";
    }
    
    const result = await explainSelection(textToExplain, optimizedContext);
    setExplanation(result);
    setLoading(false);
  };

  if (!position) return null;

  return createPortal(
    <div 
      ref={popoverRef}
      className={`fixed z-50 transition-all duration-200 ${isOpen && isMobile ? 'animate-fade-in-up' : isOpen ? 'animate-fade-in-down' : 'animate-fade-in-up'} w-full md:w-auto px-4 md:px-0`}
      style={
        (isMobile && isOpen) 
          ? { bottom: '24px', left: '0' }
          : { top: position.top, left: position.left, transform: 'translate(-50%, -100%)' }
      }
    >
      {!isOpen ? (
        <button 
          onClick={() => triggerExplanation()}
          className="group flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-700 text-white rounded-lg shadow-xl text-[12px] font-medium hover:bg-gray-800 transition-colors transform hover:scale-105"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-yellow-400" /> อธิบายส่วนนี้
          </span>
          {!isMobile && (
            <div className="hidden sm:flex items-center gap-0.5 px-1 bg-gray-800 rounded text-[9px] text-gray-400 border border-gray-700 opacity-80 group-hover:opacity-100 transition-opacity" title="กดปุ่ม Shift 2 ครั้ง">
              <span>⇧</span><span className="text-[8px] mx-0.5">x2</span>
            </div>
          )}
        </button>
      ) : (
        <div className={`bg-white/95 backdrop-blur-md border border-gray-200 shadow-2xl p-4 relative text-sm ${isMobile ? 'rounded-2xl w-full mx-auto max-w-sm border-gray-100 shadow-[0_-5px_40px_-15px_rgba(0,0,0,0.3)]' : 'rounded-xl w-[340px] max-w-[90vw]'}`}>
           <button onClick={closeTooltip} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
             <X size={14} />
           </button>
           
           <div className="flex items-center gap-1.5 mb-3 border-b border-gray-100 pb-2">
             <Sparkles size={14} className="text-gray-900" />
             <span className="font-bold text-[12px] text-gray-800 tracking-wide uppercase">สรุปเนื้อหาส่วนนี้</span>
           </div>

           <div className="text-gray-700 min-h-[60px] max-h-[260px] overflow-y-auto scrollbar-hide">
              {loading ? (
                 <div className="flex flex-col gap-2.5 mt-2 opacity-70">
                   <div className="h-2.5 bg-gray-200 rounded w-full animate-pulse"></div>
                   <div className="h-2.5 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                   <div className="h-2.5 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                   <div className="h-2.5 bg-gray-200 rounded w-1/2 animate-pulse mt-1"></div>
                 </div>
              ) : (
                 <div className="prose prose-sm prose-gray prose-p:leading-relaxed text-[13px] leading-relaxed relative group">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                       {displayedText}
                    </ReactMarkdown>
                    {isTyping && <span className="inline-block w-1.5 h-3.5 ml-1 bg-gray-400 animate-pulse align-middle"></span>}
                    
                    {isTyping && (
                      <button onClick={skipTyping} className="absolute right-0 bottom-0 text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                        ข้าม ⏭
                      </button>
                    )}
                 </div>
              )}
           </div>

           {/* Footer actions — only show when explanation is ready */}
           {!loading && explanation && (
             <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
               <button
                 onClick={handleSearchInDoc}
                 className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-red-600 transition-colors font-medium"
                 title="ไปยังเนื้อหานี้ในเอกสาร"
               >
                 <FileSearch size={12} />
                 ค้นหาในเอกสาร
               </button>
               <button
                 onClick={handleCopyExplanation}
                 className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-700 transition-colors font-medium"
                 title="คัดลอกคำอธิบาย"
               >
                 {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                 {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
               </button>
             </div>
           )}
        </div>
      )}
    </div>,
    document.body
  );
}
