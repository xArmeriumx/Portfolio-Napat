import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { Copy, Check, Pencil, Sparkles, X, RotateCcw, Save } from 'lucide-react';
import { reviewCode } from '../../services/aiService';
import { useTypewriter } from '../../hooks/useTypewriter';
import 'highlight.js/styles/github.css';

// Helper to extract raw text from react-markdown AST
const extractTextFromAST = (n) => {
  if (n.type === 'text') return n.value;
  if (n.children) return n.children.map(extractTextFromAST).join('');
  return '';
};

// Custom Code block component with Copy, Edit, and AI Review (Formal English Tone)
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  // Get raw code string from AST
  const rawCode = extractTextFromAST(node).replace(/\n$/, '');

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(rawCode);
  const [tempCode, setTempCode] = useState(rawCode);
  
  const [reviewResult, setReviewResult] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Extract explanation string for typewriter
  const extractExplanation = () => {
    if (!reviewResult) return '';
    return reviewResult.explanation || reviewResult.summary || '';
  };
  
  const aiText = extractExplanation();
  const { displayedText, isTyping, skipTyping } = useTypewriter(aiText, 10, !!aiText);

  const hasChanges = editedCode !== rawCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(editedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditClick = () => {
    setTempCode(editedCode);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleSaveClick = () => {
    setEditedCode(tempCode);
    setIsEditing(false);
  };

  const handleReset = () => {
    setEditedCode(rawCode);
    setReviewResult(null);
  };

  const handleReview = async () => {
    setReviewLoading(true);
    setReviewResult(null);
    const result = await reviewCode(editedCode, language);
    setReviewResult(result);
    setReviewLoading(false);
  };

  if (!inline && match) {
    return (
      <div className="relative group rounded-md overflow-hidden my-4 border border-gray-200 shadow-sm">
        {/* ── Header Bar ── */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200">
          <span className="flex items-center gap-2">
            {language}
            {hasChanges && !isEditing && (
              <span className="px-1.5 py-0.5 rounded border border-gray-200 bg-white text-gray-500">
                EDITED
              </span>
            )}
            {isEditing && (
              <span className="px-1.5 py-0.5 rounded border border-gray-300 bg-gray-200 text-gray-600">
                EDITING
              </span>
            )}
          </span>
          <div className="flex items-center gap-1.5">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelClick}
                  className="flex items-center gap-1 px-2.5 py-1 text-gray-500 hover:text-gray-800 transition-colors text-[11px] font-bold"
                >
                  <X size={12} />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSaveClick}
                  className="flex items-center gap-1 px-2.5 py-1 bg-gray-900 border border-gray-900 text-white rounded shadow-sm hover:bg-gray-800 transition-all text-[11px] font-bold"
                >
                  <Save size={12} />
                  <span>Save</span>
                </button>
              </>
            ) : (
              <>
                {hasChanges && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 text-gray-500 rounded shadow-sm hover:text-gray-900 transition-colors text-[11px] font-bold"
                    title="Reset to original code"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                )}
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 text-gray-500 rounded shadow-sm hover:text-gray-900 transition-colors text-[11px] font-bold"
                  title="Modify this code"
                >
                  <Pencil size={12} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleReview}
                  disabled={reviewLoading}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 text-gray-700 rounded shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 text-[11px] font-bold"
                  title="Review code with AI"
                >
                  {reviewLoading ? (
                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={12} className="text-gray-500" />
                  )}
                  <span>Review</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 text-gray-500 rounded shadow-sm hover:text-gray-900 transition-colors text-[11px] font-bold"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  <span className={copied ? 'text-green-600' : ''}>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Code Area ── */}
        <div className="overflow-x-auto text-sm bg-white">
          {isEditing ? (
            <textarea
              value={tempCode}
              onChange={(e) => setTempCode(e.target.value)}
              className="w-full p-4 font-mono text-sm bg-gray-50 text-gray-800 border-none outline-none resize-y"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', minHeight: '120px' }}
              spellCheck={false}
            />
          ) : hasChanges ? (
            <code className={`${className} bg-transparent p-4 block whitespace-pre-wrap text-gray-800`} {...props}>
              {editedCode}
            </code>
          ) : (
            <code className={`${className} bg-transparent p-4 block`} {...props}>
              {children}
            </code>
          )}
        </div>

        {/* ── AI Review Result Panel ── */}
        {(reviewLoading || reviewResult) && (
          <div className="border-t border-gray-100 bg-gray-50/50 p-5 text-sm animate-fade-in-up">
            {reviewLoading ? (
              <div className="flex flex-col gap-3 opacity-60">
                <div className="h-2 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-2 bg-gray-200 rounded w-5/6 animate-pulse" />
                <div className="h-2 bg-gray-200 rounded w-4/6 animate-pulse" />
              </div>
            ) : reviewResult && (
              <div className="space-y-4">
                {/* Panel header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                  <span className="text-[12px] font-bold text-gray-800 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={14} className="text-gray-500" /> คำอธิบายการทำงาน
                  </span>
                  <button onClick={() => setReviewResult(null)} className="p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-800 rounded transition-colors">
                    <X size={14} />
                  </button>
                </div>

                {/* Explanation with Markdown Formatting and forced word-wraps */}
                {aiText && (
                  <div className="relative group/typewriter">
                    <div className="prose prose-sm prose-gray max-w-none w-full text-gray-700 font-medium 
                        prose-p:leading-relaxed prose-p:my-2
                        prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2
                        prose-ul:pl-4 prose-ol:pl-4 prose-li:my-0.5
                        prose-hr:my-4 prose-hr:border-gray-200
                        prose-a:text-red-600 prose-strong:text-gray-900
                        prose-code:px-1.5 prose-code:py-0.5 prose-code:bg-gray-100 prose-code:text-red-600 prose-code:rounded prose-code:border prose-code:border-gray-200 prose-code:text-[12px] prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:text-gray-800 prose-pre:p-3 prose-pre:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:text-gray-800 [&_pre_code]:border-none [&_pre_code]:p-0
                        [&_p]:break-words [&_li]:break-words [&_li>p]:my-0"
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {displayedText}
                      </ReactMarkdown>
                      {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-gray-400 animate-pulse align-middle"></span>}
                    </div>

                    {/* Skip button appears only while typing on hover (or stays if mobile but fade is elegant) */}
                    {isTyping && (
                       <button 
                         onClick={skipTyping} 
                         className="absolute right-0 bottom-0 text-[11px] font-bold px-2 py-1 bg-white text-gray-500 rounded hover:bg-gray-100 transition-colors opacity-0 group-hover/typewriter:opacity-100 shadow border border-gray-100"
                       >
                         ข้ามการพิมพ์ ⏯
                       </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Inline code snippet
  return (
    <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200" {...props}>
      {children}
    </code>
  );
};

// Custom interactive block for mobile "Long-Press to Explain"
const InteractiveBlock = ({ node, children, tagName: Tag, ...props }) => {
  const timerRef = useRef(null);

  const handleTouchStart = (e) => {
    if (window.innerWidth >= 768) return;
    
    const text = extractTextFromAST(node);
    if (!text || text.trim().length < 10) return;
    
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    
    // Touch and hold for 700ms to trigger the AI summary
    timerRef.current = setTimeout(() => {
       // Haptic feedback if supported
       if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(50);
       }
       
       // Fire global event that AiSelectionTooltip listens to
       window.dispatchEvent(new CustomEvent('ai-explain-block', {
          detail: { text, rect }
       }));
    }, 700);
  };

  const cancelTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <Tag 
       {...props} 
       className={`relative group ${props.className || ''}`}
       onTouchStart={handleTouchStart}
       onTouchEnd={cancelTimer}
       onTouchMove={cancelTimer}
       onTouchCancel={cancelTimer}
    >
      {children}
    </Tag>
  );
};

export default function NoteCard({ markdown }) {
  // Extracting title assuming it's the first heading # Title
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Note';

  return (
    <div className="break-inside-avoid mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md hover:border-red-200 group relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-400 opacity-0 group-hover:opacity-100 rounded-t-xl transition-opacity"></div>
      
      {/* We use prose for tailwindcss/typography standard markdown styling.
          prose-pre:hidden is to hide the default unstyled pre block from tailwind typography, since we custom designed the box above */}
      <div className="prose prose-slate max-w-none 
          prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-24
          prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-0
          prose-h2:text-xl prose-h2:mt-6 prose-h2:border-b prose-h2:pb-2
          prose-a:text-red-600 hover:prose-a:text-red-700
          prose-table:border-collapse prose-table:w-full prose-table:text-sm
          prose-th:bg-gray-50 prose-th:border prose-th:border-gray-200 prose-th:p-2 prose-th:text-left
          prose-td:border prose-td:border-gray-200 prose-td:p-2
          prose-li:my-0.5
          prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0
          prose-details:bg-gray-50 prose-details:border prose-details:border-gray-200 prose-details:rounded-md prose-details:p-4 prose-details:my-4
          prose-summary:font-semibold prose-summary:cursor-pointer prose-summary:text-gray-800
      ">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
          components={{ 
            p: (props) => <InteractiveBlock tagName="p" {...props} />,
            h1: (props) => <InteractiveBlock tagName="h1" {...props} />,
            h2: (props) => <InteractiveBlock tagName="h2" {...props} />,
            h3: (props) => <InteractiveBlock tagName="h3" {...props} />,
            li: (props) => <InteractiveBlock tagName="li" {...props} />,
            pre: ({ node, children, ...props }) => (
              <div className="not-prose" {...props}>
                {children}
              </div>
            ),
            code: CodeBlock,
            table: ({node, ...props}) => (
              <div className="w-full overflow-x-auto mb-6 rounded-lg border-x border-gray-200">
                <table className="!my-0 border-0" {...props} />
              </div>
            )
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
