import React, { useState, useEffect, useRef } from 'react';
import { CInterpreter, StackFrame, PointerRef } from '../lib/cInterpreter';
import { Terminal, Play, RefreshCw, AlertCircle, Database, HelpCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uiTranslations } from '../data/translations';

interface InteractiveConsoleProps {
  code: string;
  onReset: () => void;
  language: 'kh' | 'en';
}

export const InteractiveConsole: React.FC<InteractiveConsoleProps> = ({ code, onReset, language }) => {
  const t = uiTranslations[language];

  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stackFrames, setStackFrames] = useState<any[]>([]);
  
  // Stdin state
  const [isWaitingForInput, setIsWaitingForInput] = useState<boolean>(false);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  
  const interpreterRef = useRef<CInterpreter | null>(null);
  const terminalBottomRef = useRef<HTMLDivElement | null>(null);

  // Initialize or reset output when code changes
  useEffect(() => {
    setOutput(
      language === 'kh'
        ? `// ប៉ារ៉ាម៉ែត្រកូដ C គឺអាចកែសម្រួលបាននៅផ្នែកខាងស្តាំ។\n// ចុចប៊ូតុង 'ដំណើរការកូដ C' ដើម្បីរ៉ាន់កម្មវិធីពិតៗ។`
        : `// C source code is fully editable in the editor on the right.\n// Click 'Run C Code' above to compile & execute.`
    );
    setStackFrames([]);
    setIsWaitingForInput(false);
    setIsRunning(false);
  }, [code, language]);

  // Auto scroll terminal to bottom
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, isWaitingForInput]);

  const handleRun = () => {
    setIsRunning(true);
    setIsWaitingForInput(false);
    setInputValue('');
    setOutput(language === 'kh' ? 'កំពុងដំណើរការចងក្រងកូដ C...' : 'Compiling C source code...');
    setStackFrames([]);

    setTimeout(() => {
      try {
        const interpreter = new CInterpreter(code);
        interpreterRef.current = interpreter;

        interpreter.registerOnOutput((text) => {
          setOutput(text);
        });

        interpreter.registerOnStackUpdate((frames) => {
          setStackFrames(frames);
        });

        interpreter.registerOnScanf((promptLabel) => {
          setInputPrompt(promptLabel);
          setIsWaitingForInput(true);
        });

        interpreter.registerOnFinished((success) => {
          setIsRunning(false);
          setIsWaitingForInput(false);
        });

        interpreter.start();
      } catch (err: any) {
        setOutput(`[Compiler Error]\n${err.message}`);
        setIsRunning(false);
      }
    }, 450);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !interpreterRef.current) return;

    const val = inputValue.trim();
    setInputValue('');
    setIsWaitingForInput(false);

    // Feed input to interpreter
    interpreterRef.current.addInput(val);
  };

  // Help generate mock memory addresses for variables to look authentic
  const getMockAddress = (frameIdx: number, varName: string) => {
    // Generate a fixed but authentic looking address based on scope & variable name
    let hash = 0;
    for (let i = 0; i < varName.length; i++) {
      hash = varName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const offset = Math.abs(hash % 256).toString(16).toUpperCase().padStart(2, '0');
    return `0x7ffd${4 - frameIdx}${offset}`;
  };

  return (
    <div className="w-full bg-[#111827] border border-gray-750 rounded-xl p-3 text-white flex flex-col h-full min-h-[290px] text-xs">
      {/* Top Action Header bar */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-2.5 mb-2.5">
        <div className="flex items-center gap-1.5 select-none">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h4 className="font-bold tracking-tight text-emerald-400 font-mono text-[11px] uppercase">
            {t.interactiveLab}
          </h4>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning && !isWaitingForInput}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-40 text-white font-bold py-1 px-2.5 rounded text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
          >
            {isRunning && !isWaitingForInput ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            <span>{isRunning && !isWaitingForInput ? t.running : t.runCode}</span>
          </button>

          <button
            onClick={onReset}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-1 px-2 rounded text-[10px] flex items-center gap-1 cursor-pointer transition-colors border border-gray-700"
            title="Reset code editor to slide default"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{t.reset}</span>
          </button>
        </div>
      </div>

      {/* Split Body Layout: Left = Terminal Console, Right = Stack trace */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 overflow-hidden min-h-0">
        
        {/* Terminal Stdio Emulator Pane */}
        <div className="md:col-span-7 flex flex-col bg-[#0b0f19] border border-gray-800 rounded-lg overflow-hidden h-full min-h-[140px]">
          <div className="flex items-center justify-between px-2 py-1 bg-[#151d30] border-b border-gray-850 select-none shrink-0">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-gray-400" />
              <span className="text-[9px] font-mono text-gray-300 font-bold">{t.terminalTitle}</span>
            </div>
            <span className="text-[8px] font-mono font-bold text-gray-500">C99 STDOUT</span>
          </div>

          {/* Console stdout view */}
          <div className="p-3 font-mono text-[10.5px] leading-relaxed overflow-y-auto flex-1 text-emerald-400 space-y-1">
            <pre className="whitespace-pre-wrap text-emerald-300 font-mono leading-normal">{output}</pre>
            
            {/* Stdin Interactive prompt */}
            {isWaitingForInput && (
              <form onSubmit={handleInputSubmit} className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-emerald-500/15 mt-1 select-text">
                <span className="text-amber-400 font-bold animate-pulse text-[10px] shrink-0 font-mono">
                  {inputPrompt}
                </span>
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    autoFocus
                    className="flex-1 bg-[#1e293b] border border-emerald-500/40 text-white font-mono rounded px-2 py-0.5 text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 shadow-sm"
                    placeholder="Enter int..."
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded text-[10px] shrink-0 cursor-pointer"
                  >
                    {t.submit}
                  </button>
                </div>
              </form>
            )}
            <div ref={terminalBottomRef} />
          </div>
        </div>

        {/* Stack Frame / Memory Address Trace Panel */}
        <div className="md:col-span-5 flex flex-col bg-[#111827] border border-gray-800 rounded-lg overflow-hidden h-full min-h-[140px]">
          <div className="flex items-center justify-between px-2 py-1 bg-[#151d30] border-b border-gray-850 select-none shrink-0">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-cyan-400" />
              <span className="text-[9px] font-mono text-gray-300 font-bold">{t.stackTitle}</span>
            </div>
            <span className="text-[8px] font-mono font-bold text-cyan-400">RAM MEMORY</span>
          </div>

          <div className="p-2.5 flex-1 overflow-y-auto select-text font-mono space-y-2.5 bg-[#0f172a]/40">
            {stackFrames.length > 0 ? (
              <div className="space-y-3">
                {stackFrames.map((frame, frameIdx) => {
                  const isActive = frameIdx === stackFrames.length - 1;
                  const variables = Object.entries(frame.variables);

                  return (
                    <motion.div
                      key={frameIdx}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`border rounded p-2 transition-all ${
                        isActive 
                          ? 'border-cyan-500/45 bg-[#172554]/20 ring-1 ring-cyan-500/20' 
                          : 'border-gray-800 bg-gray-900/30 opacity-70'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5 border-b border-gray-800 pb-1">
                        <span className={`text-[10px] font-bold font-mono ${isActive ? 'text-cyan-400' : 'text-gray-400'}`}>
                          {isActive ? '👉 ' : ''}Stack Frame {frameIdx}: <strong className="text-white font-extrabold">{frame.functionName}()</strong>
                        </span>
                        <span className="text-[8px] text-gray-500 font-mono">
                          BP: {getMockAddress(frameIdx, 'BASE')}
                        </span>
                      </div>

                      {variables.length > 0 ? (
                        <div className="space-y-1 text-[9.5px]">
                          {/* Table Headers */}
                          <div className="grid grid-cols-12 gap-1 text-[8px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">
                            <span className="col-span-4">{t.address}</span>
                            <span className="col-span-3">Type & Name</span>
                            <span className="col-span-5 text-right">{t.value}</span>
                          </div>

                          {variables.map(([varName, val]: [string, any]) => {
                            const isPtr = val && typeof val === 'object' && val.type === 'pointer';
                            const address = getMockAddress(frameIdx, varName);
                            
                            return (
                              <div key={varName} className="grid grid-cols-12 gap-1 items-center border-b border-gray-800/25 py-0.5 font-mono hover:bg-gray-800/20 rounded px-1">
                                <span className="col-span-4 text-gray-400 text-[8px] font-mono leading-none">
                                  {address}
                                </span>
                                <span className="col-span-4 text-cyan-300 font-semibold truncate leading-none">
                                  {isPtr ? 'int* ' : 'int '}
                                  <strong className="text-white font-bold">{varName}</strong>
                                </span>
                                <span className="col-span-4 text-right truncate text-amber-400 font-bold leading-none">
                                  {isPtr ? (
                                    <span className="text-amber-300 font-mono text-[8.5px]" title={`Points to variable ${val.targetVarName} in frame ${val.targetFrameIndex}`}>
                                      &amp;{val.targetVarName} ({getMockAddress(val.targetFrameIndex, val.targetVarName)})
                                    </span>
                                  ) : (
                                    val
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-[9px] text-gray-500 italic text-center py-1">
                          (No local scope variables)
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-500 space-y-1.5 my-auto select-none">
                <Database className="w-6 h-6 text-gray-700" />
                <span className="text-[9px] font-mono">{t.stackEmpty}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
