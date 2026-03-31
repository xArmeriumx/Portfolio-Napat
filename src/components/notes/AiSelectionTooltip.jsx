import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X } from 'lucide-react';
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
  
  // Typewriter effect for AI explanation
  const { displayedText, isTyping, skipTyping } = useTypewriter(explanation, 8, !!explanation);
  
  const popoverRef = useRef(null);

  useEffect(() => {
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

    const handleCustomExplain = (e) => {
       const { text, rect } = e.detail;
       setSelection(text);
       setPosition({
         top: rect.top - 10,
         left: rect.left + (rect.width / 2)
       });
       setIsOpen(false);
       setExplanation("");
    };

    const handleDocumentClick = (e) => {
       // Close if clicked outside the popover and no selection exists
       if (isOpen && popoverRef.current && !popoverRef.current.contains(e.target)) {
          const text = window.getSelection().toString().trim();
          if (text.length === 0) closeTooltip();
       }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleDocumentClick);
    window.addEventListener('ai-explain-block', handleCustomExplain);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleDocumentClick);
      window.removeEventListener('ai-explain-block', handleCustomExplain);
    };
  }, [isOpen]);

  const closeTooltip = () => {
    setPosition(null);
    setSelection("");
    setIsOpen(false);
    setExplanation("");
  };

  const handleExplain = async () => {
    setIsOpen(true);
    setLoading(true);
    // Move position down slightly to act as a proper modal popup
    setPosition(prev => ({ ...prev, top: prev.top + 30 }));
    
    // Clear selection natively so it looks clean while reading
    window.getSelection().removeAllRanges();
    
    // Neighborhood Context Optimization: Extract text directly surrounding the selection
    let optimizedContext = noteContent;
    const matchIndex = noteContent.indexOf(selection);
    if (matchIndex !== -1) {
       const start = Math.max(0, matchIndex - 600);
       const end = Math.min(noteContent.length, matchIndex + selection.length + 600);
       optimizedContext = noteContent.substring(start, end);
    } else {
       // Fallback to top 1500 chars if for some reason the selection text isn't an exact match
       optimizedContext = noteContent.substring(0, 1500) + "...";
    }
    
    const result = await explainSelection(selection, optimizedContext);
    setExplanation(result);
    setLoading(false);
  };

  if (!position) return null;

  return createPortal(
    <div 
      ref={popoverRef}
      className={`fixed z-50 transition-all duration-200 ${isOpen ? 'animate-fade-in-down' : 'animate-fade-in-up'}`}
      style={{ 
        top: position.top, 
        left: position.left,
        transform: 'translate(-50%, -100%)'
      }}
    >
      {!isOpen ? (
        <button 
          onClick={handleExplain}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 border border-gray-700 text-white rounded-lg shadow-xl text-[12px] font-medium hover:bg-gray-800 transition-colors transform hover:scale-105"
        >
          <Sparkles size={14} className="text-yellow-400" /> อธิบายส่วนนี้
        </button>
      ) : (
        <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-2xl p-4 w-[340px] max-w-[90vw] relative text-sm">
           <button onClick={closeTooltip} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
             <X size={14} />
           </button>
           
           <div className="flex items-center gap-1.5 mb-3 border-b border-gray-100 pb-2">
             <Sparkles size={14} className="text-gray-900" />
             <span className="font-bold text-[12px] text-gray-800 tracking-wide uppercase">AI Explanation</span>
           </div>

           <div className="text-gray-700 min-h-[60px] max-h-[300px] overflow-y-auto scrollbar-hide">
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
                       Skip ⏭
                     </button>
                   )}
                </div>
             )}
           </div>
        </div>
      )}
    </div>,
    document.body
  );
}
