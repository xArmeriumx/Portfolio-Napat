import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { Copy, Check } from 'lucide-react';
import 'highlight.js/styles/github.css'; // Light IDE theme

// Helper to extract raw text from react-markdown AST
const extractTextFromAST = (n) => {
  if (n.type === 'text') return n.value;
  if (n.children) return n.children.map(extractTextFromAST).join('');
  return '';
};

// Custom Code block component to add "Copy" button
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const rawCode = extractTextFromAST(node);
    navigator.clipboard.writeText(rawCode.replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative group rounded-md overflow-hidden my-4 border border-gray-200">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-200">
          <span>{match[1]}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 hover:text-gray-900 transition-colors bg-white px-2 py-1 rounded shadow-sm border border-gray-200 cursor-pointer"
            title="Copy code"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            <span className={copied ? "text-green-600" : ""}>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        <div className="overflow-x-auto text-sm bg-white">
          <code className={`${className} bg-transparent p-4 block`} {...props}>
            {children}
          </code>
        </div>
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
