import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as sucrase from 'sucrase';
import { Play, RotateCcw, XCircle, Code2, Terminal } from 'lucide-react';

export default function LiveRunner({ initialCode, language }) {
  const [code, setCode] = useState(initialCode);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
    });
  };

  const handleRun = () => {
    setLogs([]);
    setError(null);
    let compiledCode = code;

    try {
      if (language === 'typescript' || language === 'ts') {
         const result = sucrase.transform(code, {
           transforms: ['typescript']
         });
         compiledCode = result.code;
      }
      
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      const originalConsoleInfo = console.info;

      const outputLogs = [];
      const pushLog = (type, ...args) => {
         const msg = args.map(arg => {
             if (typeof arg === 'object') {
                 try { return JSON.stringify(arg, null, 2); } catch(e) { return String(arg); }
             }
             return String(arg);
         }).join(' ');
         outputLogs.push({ type, msg, id: Math.random().toString() });
         setLogs([...outputLogs]); 
      };

      console.log = (...args) => pushLog('log', ...args);
      console.error = (...args) => pushLog('error', ...args);
      console.warn = (...args) => pushLog('warn', ...args);
      console.info = (...args) => pushLog('info', ...args);

      try {
         const exec = new Function(compiledCode);
         exec();
      } catch (err) {
         pushLog('error', err.toString());
      } finally {
         console.log = originalConsoleLog;
         console.error = originalConsoleError;
         console.warn = originalConsoleWarn;
         console.info = originalConsoleInfo;
      }
    } catch (err) {
       setError("Compilation Error: " + err.message);
    }
  };

  const monacoLanguage = (language === 'ts' || language === 'typescript') ? 'typescript' : 'javascript';

  return (
    <div className="w-full flex flex-col bg-white animate-fade-in-up border-t border-gray-100 shadow-inner">
      <div className="flex flex-col">
        {/* Top pane: Editor */}
        <div className="w-full border-b border-gray-200 flex flex-col">
          <div className="h-10 bg-gray-50 border-b border-gray-100 flex items-center justify-between px-3">
             <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 tracking-wider">
               <Code2 size={12} className="text-gray-400" /> SOURCE
             </div>
             <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setCode(initialCode)}
                   className="text-gray-400 hover:text-gray-700 transition-colors p-1"
                   title="Reset Code"
                 >
                    <RotateCcw size={12} />
                 </button>
             </div>
          </div>
          <div className="flex-1 p-1">
            <Editor
              height="300px"
              language={monacoLanguage}
              theme="light"
              value={code}
              onChange={(val) => setCode(val)}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                lineHeight: 1.6,
                padding: { top: 12, bottom: 12 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                renderLineHighlight: "none",
                tabSize: 4,
              }}
            />
          </div>
        </div>

        {/* Bottom pane: Console Output */}
        <div className="w-full flex flex-col bg-[#fafafa]">
           <div className="h-10 border-b border-gray-100 flex items-center justify-between px-4 bg-gray-50">
             <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 tracking-wider">
               <Terminal size={12} className="text-gray-400" /> CONSOLE
             </div>
             
             <div className="flex items-center gap-2">
                <button
                   onClick={handleRun}
                   className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-[10px] uppercase font-bold tracking-wider rounded shadow-[0_2px_4px_rgba(239,68,68,0.2)] hover:bg-red-600 hover:shadow-sm transition-all border border-red-500"
                >
                  <Play size={10} className="fill-white" /> RUN CODE
                </button>
             </div>
           </div>
           
           <div className="p-4 overflow-y-auto font-mono text-[13px] text-gray-700 bg-[#fbfbfb] shadow-inner flex flex-col gap-2 min-h-[120px] max-h-[250px]">
              {error ? (
                 <div className="text-red-500 bg-red-50 p-3 rounded-md text-xs border border-red-100 whitespace-pre-wrap flex gap-2 shadow-sm">
                     <XCircle size={14} className="shrink-0 mt-0.5" />
                     <span>{error}</span>
                 </div>
              ) : logs.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-gray-300 italic text-xs tracking-wide">
                    Press RUN to execute your code...
                 </div>
              ) : (
                 <ul className="space-y-1.5">
                    {logs.map((log) => (
                       <li 
                         key={log.id} 
                         className={`py-1.5 px-3 border border-gray-100 rounded-md bg-white shadow-sm
                            ${log.type === 'error' ? 'text-red-600 bg-red-50 border-red-100' : 
                              log.type === 'warn' ? 'text-yellow-600 bg-yellow-50 border-yellow-100' : ''}
                         `}
                       >
                         <span className="opacity-40 text-[10px] mr-2 text-gray-400 select-none">›</span>
                         <span className="whitespace-pre-wrap break-all">{log.msg}</span>
                       </li>
                    ))}
                 </ul>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
