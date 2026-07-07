import React, { useState, useEffect, useRef } from 'react';
import { slides } from './data/slides';
import { Slide } from './types';
import { SlideDiagram } from './components/SlideDiagram';
import { InteractiveConsole } from './components/InteractiveConsole';
import { CodeHighlighter } from './components/CodeHighlighter';
import { QuickQuiz } from './components/QuickQuiz';
import { RuppLogo } from './components/RuppLogo';
import { motion, AnimatePresence } from 'motion/react';
import { slideTranslations, uiTranslations } from './data/translations';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  BookOpen, 
  HelpCircle, 
  Code2, 
  ListOrdered, 
  Info, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Download, 
  FileText, 
  GraduationCap, 
  Clock, 
  LayoutGrid, 
  ChevronDown, 
  ExternalLink,
  X,
  Sun,
  Moon,
  RotateCcw,
  Printer,
  ArrowLeft
} from 'lucide-react';

export default function App() {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [isTheatreMode, setIsTheatreMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'lecture' | 'lab'>('lecture');
  const [codeTheme, setCodeTheme] = useState<'light' | 'dark'>('dark');
  const [copiedIndex, setCopiedIndex] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [autoplaySpeed, setAutoplaySpeed] = useState<number>(10); // seconds
  const [secondsRemaining, setSecondsRemaining] = useState<number>(autoplaySpeed);
  
  // Session presentation timer state
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [isSessionRunning, setIsSessionRunning] = useState<boolean>(true);
  
  // Print Mode / Study Guide State
  const [isPrintMode, setIsPrintMode] = useState<boolean>(false);

  // Localization & Custom Code Editor States
  const [language, setLanguage] = useState<'kh' | 'en'>('kh');
  const [slideCodes, setSlideCodes] = useState<Record<number, string>>({});
  
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSlide: Slide = slides[currentIdx];

  // Helper to get fully localized and editable slide content
  const getLocalizedSlide = (slide: Slide) => {
    const activeCode = slideCodes[slide.id] ?? slide.code ?? '';
    return {
      ...slide,
      code: activeCode,
      title: language === 'en' ? (slideTranslations[slide.id]?.title ?? slide.title) : slide.title,
      subtitle: language === 'en' ? (slideTranslations[slide.id]?.subtitle ?? slide.subtitle) : slide.subtitle,
      section: language === 'en' ? (slideTranslations[slide.id]?.section ?? slide.section) : slide.section,
      bullets: language === 'en' ? (slideTranslations[slide.id]?.bullets ?? slide.bullets) : slide.bullets,
      presenterNotes: language === 'en' ? (slideTranslations[slide.id]?.presenterNotes ?? slide.presenterNotes) : slide.presenterNotes,
    };
  };

  const localizedSlide = getLocalizedSlide(currentSlide);
  const t = uiTranslations[language];

  const handleCodeChange = (newCode: string) => {
    setSlideCodes(prev => ({ ...prev, [currentSlide.id]: newCode }));
  };

  const handleResetCode = (slideId: number) => {
    setSlideCodes(prev => {
      const updated = { ...prev };
      delete updated[slideId];
      return updated;
    });
  };

  // Presentation Session Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSessionRunning) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionRunning]);

  const formatSessionTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    const pad = (n: number) => String(n).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Auto-play effect
  useEffect(() => {
    if (isPlaying) {
      setSecondsRemaining(autoplaySpeed);
      
      // Countdown ticking
      countdownTimerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleNextSlide();
            return autoplaySpeed;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isPlaying, currentIdx, autoplaySpeed]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Skip when typing in console inputs
      }
      
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        setIsTheatreMode((prev) => !prev);
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes((prev) => !prev);
      } else if (e.key === 'q' || e.key === 'Q') {
        setShowQuiz((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx]);

  // Reset tab to lecture when slide changes
  useEffect(() => {
    if (localizedSlide.code) {
      setActiveTab('lecture');
    }
  }, [currentIdx]);

  const handleNextSlide = () => {
    setCurrentIdx((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  const handlePrevSlide = () => {
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const toggleAutoPlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(true);
    setTimeout(() => setCopiedIndex(false), 2000);
  };

  const handleDownloadCode = (codeText: string, filename: string) => {
    const blob = new Blob([codeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isPrintMode) {
    return (
      <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col antialiased">
        {/* Sticky Controls Header (Hidden during actual print) */}
        <div className="no-print sticky top-0 z-50 bg-[#1E3A8A] text-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPrintMode(false)}
              className="flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-2 rounded-lg transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'en' ? 'Back to Slide Presentation' : 'ត្រឡប់ទៅការបង្ហាញស្លាយ'}</span>
            </button>
            <div className="border-l border-white/20 h-5 pl-3 hidden sm:block" />
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">
                {language === 'en' ? 'C Programming: Chapter 6 Study Guide' : 'កម្មវិធីសរសេរភាសា C៖ កំណត់ត្រាសិក្សាជំពូកទី ៦'}
              </h2>
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">
                {language === 'en' ? 'Slide compilation & custom study guide resource' : 'ការចងក្រងស្លាយមេរៀន និងមគ្គុទ្ទេសក៍សិក្សា'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="text-[11px] text-blue-100 hidden md:block">
              {language === 'en' ? (
                <span>Tip: Set printer layout to <strong>"Save as PDF"</strong> in configuration.</span>
              ) : (
                <span>គន្លឹះ៖ កំណត់ប្លង់ម៉ាស៊ីនបោះពុម្ពទៅជា <strong>"រក្សាទុកជា PDF" (Save as PDF)</strong> នៅក្នុងការកំណត់។</span>
              )}
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 border border-emerald-600 px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow-lg active:scale-95 text-white"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'en' ? 'Print Document / Save as PDF' : 'បោះពុម្ពឯកសារសិក្សា / រក្សាទុកជា PDF'}</span>
            </button>
          </div>
        </div>

        {/* Study Guide Content */}
        <div className="max-w-4xl mx-auto w-full p-4 md:p-8 space-y-12">
          {/* Document Header Intro */}
          <div className="border-b-2 border-gray-900 pb-6 text-center md:text-left print:mt-4 flex flex-col md:flex-row items-center gap-6">
            <RuppLogo size="lg" className="bg-[#1E3A8A] p-1.5 rounded-full border-2 border-amber-400" />
            <div className="flex-1 text-center md:text-left">
              <span className="text-xs font-extrabold text-[#1E3A8A] tracking-wider uppercase font-mono">
                {language === 'en' ? 'Royal University of Phnom Penh (RUPP)' : 'សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ'}
              </span>
              <h1 className="text-3xl font-extrabold text-gray-900 mt-1">
                {language === 'en' ? 'C Programming • Chapter 6: Functions' : 'ការសរសេរកម្មវិធីភាសា C • ជំពូកទី ៦៖ អនុគមន៍'}
              </h1>
              <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed">
                {language === 'en' ? (
                  <span>
                    Academic Source: <span className="font-semibold text-gray-800">Royal University of Phnom Penh</span> &bull; 
                    Slide content, code exercises, memory diagrams, and university study guides compiled dynamically. Perfect for offline reading or printing out as physical study sheets.
                  </span>
                ) : (
                  <span>
                    ប្រភពឯកសារ៖ <span className="font-semibold text-gray-800">សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ</span> &bull; 
                    ឯកសារមេរៀន ស្លាយបទបង្ហាញ គោលការណ៍ Syntax កូដគំរូ និងមគ្គុទ្ទេសក៍សិក្សាថ្នាក់សាកលវិទ្យាល័យដែលបានចងក្រងយ៉ាងលម្អិត។ ស័ក្តិសមបំផុតសម្រាប់ការសិក្សាបន្ថែម និងបោះពុម្ពជាក្រដាសកត់ត្រា។
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Sequential Slides */}
          <div className="space-y-10">
            {slides.map((slide, sIdx) => {
              const locSlide = getLocalizedSlide(slide);
              return (
                <div 
                  key={slide.id} 
                  className="print-page bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs relative transition-all hover:shadow-sm"
                >
                  {/* Header info of slide */}
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-gray-100 pb-3 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-[#1E3A8A] text-white px-2 py-0.5 rounded-full">
                        {language === 'en' ? `Slide ${sIdx + 1}` : `ស្លាយ ${sIdx + 1}`}
                      </span>
                      {locSlide.section && (
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-extrabold">
                          {locSlide.section}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold font-mono">
                      {language === 'en' ? 'Chapter 6: Functions' : 'ជំពូកទី ៦៖ អនុគមន៍'}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="mb-6">
                    <h3 className="text-xl font-extrabold text-gray-900 leading-tight">{locSlide.title}</h3>
                    {locSlide.subtitle && (
                      <p className="text-xs text-[#1E3A8A] mt-1 font-bold tracking-tight">{locSlide.subtitle}</p>
                    )}
                  </div>

                  {/* Slide content columns */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left Column: Bullets and Code */}
                    <div className={`${locSlide.code || locSlide.bullets ? 'md:col-span-7' : 'md:col-span-12'} space-y-4`}>
                      {locSlide.bullets && locSlide.bullets.length > 0 && (
                        <ul className="space-y-2 list-disc list-inside text-xs text-gray-700 leading-relaxed font-medium">
                          {locSlide.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="align-top">
                              <span className="text-gray-800 pl-1">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {locSlide.code && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 shadow-inner print-code bg-gray-50">
                          <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100 border-b border-gray-200 text-gray-700 no-print select-none">
                            <span className="text-[9px] font-mono font-bold">main.c</span>
                          </div>
                          <CodeHighlighter code={locSlide.code} theme="light" />
                        </div>
                      )}
                    </div>

                    {/* Right Column: Presenter Explanations / Professor Study Notes */}
                    <div className={`${locSlide.code || locSlide.bullets ? 'md:col-span-5' : 'md:col-span-12'} flex flex-col`}>
                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex-1">
                        <div className="flex items-center gap-1.5 border-b border-amber-200/60 pb-1.5 mb-2.5">
                          <span className="text-[10px] font-mono font-extrabold text-amber-800 uppercase tracking-wider">
                            {language === 'en' ? 'Instructor Explanations & Notes' : 'ការពន្យល់បន្ថែមរបស់សាស្ត្រាចារ្យ'}
                          </span>
                        </div>
                        <ul className="space-y-2 text-xs text-amber-900 leading-relaxed list-disc list-inside font-medium">
                          {locSlide.presenterNotes.map((note, nIdx) => (
                            <li key={nIdx} className="align-top">
                              <span className="text-amber-950 pl-1">{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Print view footer */}
          <div className="border-t border-gray-300 pt-8 mt-12 text-center text-xs text-gray-400 pb-16 no-print font-mono">
            <span>
              {language === 'en' 
                ? 'End of Study Guide • Chapter 6: Functions • University Courseware System' 
                : 'ចប់ឯកសារសិក្សាណែនាំ • ជំពូកទី ៦៖ អនុគមន៍ • ប្រព័ន្ធឯកសារសិក្សាសាកលវិទ្យាល័យ'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827] flex flex-col font-sans transition-all duration-300">
      {/* Dynamic Top Banner */}
      <header className="h-12 bg-[#1E3A8A] flex items-center justify-between px-6 text-white shrink-0 shadow-md">
        <div className="flex items-center gap-4">
          <RuppLogo size="sm" className="bg-[#1E3A8A] rounded-full p-0.5 border border-amber-400" />
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white leading-none">
              {language === 'en' ? 'C Programming | Chapter 6: Functions' : 'ការសរសេរកម្មវិធីភាសា C | ជំពូកទី ៦៖ អនុគមន៍'}
            </h1>
            <p className="text-[10px] text-blue-200 font-bold mt-0.5 uppercase tracking-wider">
              {language === 'en' ? 'Royal University of Phnom Penh (RUPP)' : 'សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ (RUPP)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Global Presentation Session Timer */}
          <div className="flex items-center gap-2 bg-white/10 border border-white/10 h-8 px-2.5 rounded-md text-xs font-mono font-bold select-none text-white transition-all shadow-sm">
            <Clock className={`w-3.5 h-3.5 text-blue-200 ${isSessionRunning ? 'animate-pulse' : ''}`} />
            <span className="w-14 text-center tracking-wider">{formatSessionTime(sessionSeconds)}</span>
            
            <div className="flex items-center gap-1 border-l border-white/15 pl-1.5 ml-1">
              <button
                onClick={() => setIsSessionRunning(!isSessionRunning)}
                className="p-1 hover:bg-white/10 rounded text-blue-200 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                title={isSessionRunning ? "Pause Presentation Timer" : "Resume Presentation Timer"}
              >
                {isSessionRunning ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
              </button>
              
              <button
                onClick={() => setSessionSeconds(0)}
                className="p-1 hover:bg-white/10 rounded text-blue-200 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                title="Reset Presentation Timer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Language Switcher Button */}
          <button
            onClick={() => setLanguage(prev => prev === 'kh' ? 'en' : 'kh')}
            className="h-8 px-2.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border bg-white/10 border-white/5 text-white hover:bg-white/20 hover:scale-[1.02]"
            title="Switch Language / ប្តូរភាសា"
          >
            <span className="text-xs">🌐</span>
            <span>{language === 'kh' ? 'English' : 'ខ្មែរ'}</span>
          </button>

          {/* Sidebar toggle */}
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className={`h-8 px-3 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isSidebarOpen 
                ? 'bg-white/20 border-white/10 text-white' 
                : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
            }`}
            title="Toggle Slide Index"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'en' ? 'Index' : 'មាតិកា'}</span>
          </button>

          <button
            onClick={() => setShowQuiz((prev) => !prev)}
            className={`h-8 px-3 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showQuiz 
                ? 'bg-amber-500 border-amber-600 text-white shadow-sm' 
                : 'bg-white/10 border-white/5 text-white hover:bg-white/20'
            }`}
          >
            <HelpCircle className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">{language === 'en' ? 'Self-Check Quiz' : 'តេស្តចំណេះដឹង'}</span>
          </button>

          <button
            onClick={() => setIsPrintMode(true)}
            className="h-8 px-3 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-500 hover:scale-[1.02] shadow-sm active:scale-95"
            title="Generate Printer-Friendly Study Guide & Print to PDF"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'en' ? 'Print to PDF' : 'បោះពុម្ពជា PDF'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Drawer / Slide Index List */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="bg-[#E5E7EB] border-r border-gray-300 shrink-0 flex flex-col overflow-hidden h-full hidden lg:flex"
            >
              <div className="p-4 border-b border-gray-300 bg-[#E5E7EB] flex justify-between items-center shrink-0">
                <span className="text-xs font-extrabold tracking-wider uppercase text-gray-600">
                  {language === 'en' ? 'Slide Navigation Map' : 'ផែនទីមេរៀន និងស្លាយ'}
                </span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-white border border-gray-300 rounded text-[#1E3A8A]">
                  {currentIdx + 1} / {slides.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-thin">
                {slides.map((slide, idx) => {
                  const isActive = idx === currentIdx;
                  const locSlide = getLocalizedSlide(slide);
                  return (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex gap-3 items-start cursor-pointer ${
                        isActive
                          ? 'bg-white border-2 border-[#1E3A8A] text-[#111827] shadow-md ring-2 ring-[#1E3A8A]/10'
                          : 'bg-white/50 border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className={`text-[10px] font-mono font-bold mt-0.5 px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-[#1E3A8A] text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {String(slide.id).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[10px] font-mono font-bold tracking-wider uppercase leading-none mb-1 ${
                          isActive ? 'text-[#1E3A8A]' : 'text-gray-400'
                        }`}>
                          {locSlide.section}
                        </div>
                        <div className={`text-xs font-extrabold truncate leading-snug ${
                          isActive ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {locSlide.title}
                        </div>
                        <div className="text-[10px] opacity-70 truncate mt-0.5 font-semibold leading-none text-gray-500">
                          {locSlide.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="p-3 border-t border-gray-300 bg-gray-200 text-[10px] text-gray-500 font-mono text-center shrink-0 leading-normal">
                Use Left/Right arrow keys to play
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Slide Stage Container */}
        <main className="flex-1 flex flex-col items-center justify-between p-4 md:p-6 overflow-y-auto relative bg-[#F3F4F6]">
          
          {/* Background Ambient University Banner */}
          <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />

          {/* Quiz Overlay container */}
          <AnimatePresence>
            {showQuiz && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-4 md:inset-8 z-40 bg-white rounded-2xl shadow-2xl border border-gray-300 overflow-hidden flex flex-col p-2"
              >
                <div className="flex justify-between items-center border-b border-gray-200 p-3 shrink-0 bg-[#F9FAFB]">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#1E3A8A]" />
                    <span className="font-extrabold text-sm tracking-wide text-[#1E3A8A] uppercase">
                      {language === 'en' ? 'C Functions Interactive Quiz' : 'តេស្តចំណេះដឹង អនុគមន៍ភាសា C'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowQuiz(false)}
                    className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-800 cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 bg-gray-50">
                  <QuickQuiz language={language} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Presentation Sizing Box */}
          <div className={`w-full ${isTheatreMode ? 'max-w-7xl' : 'max-w-5xl'} flex-1 flex flex-col justify-center items-center`}>
            
            {/* 16:9 Aspect Ratio Lock Slide Frame */}
            <div 
              id="presentation-slide-deck"
              className="w-full aspect-[16/9] bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-300 overflow-hidden relative flex flex-col justify-between p-6 md:p-8 select-none transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
                color: '#ffffff'
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={localizedSlide.id}
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="flex-1 flex flex-col justify-between"
                >
                  {/* Slide Header Context */}
                  <div className="flex justify-between items-start border-b pb-3 border-slate-800">
                    <div>
                      <span className="text-[10px] md:text-xs font-mono font-extrabold tracking-widest uppercase py-0.5 px-2.5 rounded-full bg-blue-600 text-white"
                      >
                        {localizedSlide.section}
                      </span>
                    </div>
                    <span className="text-[10px] md:text-xs font-mono font-bold opacity-60 text-slate-400">
                      {language === 'en' ? `C Courseware • Slide ${localizedSlide.id}` : `កម្មវិធីសិក្សាភាសា C • ស្លាយ ${localizedSlide.id}`}
                    </span>
                  </div>

                  {/* Slide Main Content Grid */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 items-center my-4 overflow-hidden">
                    
                    {localizedSlide.type === 'title' ? (
                      /* TITLE LAYOUT */
                      <div className="md:col-span-12 flex flex-col md:flex-row items-center justify-around h-full gap-8 relative">
                        {/* Decorative background accents for premium feel */}
                        <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="text-left space-y-6 max-w-xl z-10">
                          {/* Premium Top Institution Badge */}
                          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-amber-400/30 px-3 py-1.5 rounded-full shadow-inner">
                            <RuppLogo size="sm" className="bg-[#DA251D] p-0.5 rounded-full border border-amber-400" />
                            <span className="text-[10px] md:text-xs font-bold tracking-wider text-amber-300 uppercase font-sans">
                              {language === 'en' ? 'Royal University of Phnom Penh' : 'សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ'}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <motion.h2 
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.1 }}
                              className="text-4xl md:text-5xl font-extrabold tracking-tight font-sans leading-tight text-white drop-shadow-md"
                            >
                              {localizedSlide.title}
                            </motion.h2>
                            
                            {/* Accent line with golden highlight */}
                            <div className="h-1 w-24 bg-gradient-to-r from-amber-400 to-blue-500 rounded-full" />
                            
                            <motion.p 
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="text-lg md:text-xl font-semibold text-blue-200 font-sans tracking-wide"
                            >
                              {localizedSlide.subtitle}
                            </motion.p>
                          </div>
                          
                          {/* Study Guide and Lecture Info */}
                          <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="pt-4 border-t border-blue-900/40 flex items-center gap-4"
                          >
                            <div className="bg-white/5 hover:bg-white/10 transition-colors p-2.5 rounded-xl border border-white/10 shadow-sm flex items-center gap-3">
                              <BookOpen className="w-5 h-5 text-amber-400" />
                              <div className="text-left">
                                <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold block">
                                  {language === 'en' ? 'COURSEWARE:' : 'កម្មវិធីសិក្សា៖'}
                                </span>
                                <span className="text-xs font-bold text-white mt-0.5 block">
                                  {language === 'en' ? 'C Programming Language' : 'ការសរសេរកម្មវិធីភាសា C'}
                                </span>
                              </div>
                            </div>

                            <div className="bg-white/5 hover:bg-white/10 transition-colors p-2.5 rounded-xl border border-white/10 shadow-sm flex items-center gap-3">
                              <Info className="w-5 h-5 text-blue-400" />
                              <div className="text-left">
                                <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold block">
                                  {language === 'en' ? 'ACADEMIC UNIT:' : 'កម្រិតមេរៀន៖'}
                                </span>
                                <span className="text-xs font-bold text-white mt-0.5 block">
                                  {language === 'en' ? 'Chapter 6: Functions' : 'ជំពូកទី ៦៖ អនុគមន៍'}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                        
                        {/* Right side beautifully designed illustration / logo container */}
                        <div className="w-full md:w-[380px] h-[260px] hidden md:block shrink-0 relative z-10">
                          <div className="absolute inset-0 bg-blue-600/5 rounded-2xl border border-blue-500/20 backdrop-blur-sm p-4 flex flex-col items-center justify-center">
                            <RuppLogo size="xl" className="bg-[#DA251D] p-3 rounded-full border-4 border-amber-400 shadow-2xl hover:scale-105 transition-transform duration-300" />
                            <div className="mt-4 text-center">
                              <p className="text-xs font-bold text-amber-400 tracking-wide uppercase">
                                {language === 'en' ? 'RUPP' : 'ស.ភ.ភ.'}
                              </p>
                              <p className="text-[10px] text-slate-300 font-medium mt-1">
                                {language === 'en' ? 'Faculty of Science' : 'មហាវិទ្យាល័យវិទ្យាសាស្ត្រ'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* STANDARD WORK-SLIDE LAYOUT */
                      <>
                        {/* LEFT COLUMN: Bullets or Code/Simulation toggles */}
                        <div className="md:col-span-7 flex flex-col justify-between h-full overflow-hidden">
                          <div className="space-y-4 overflow-y-auto pr-1">
                            <div className="border-l-8 border-amber-400 pl-4">
                              <h3 className="text-xl md:text-2xl font-extrabold tracking-tight font-sans leading-tight text-white">
                                {localizedSlide.title}
                              </h3>
                              <p className="text-xs font-bold text-blue-300 mt-0.5 uppercase tracking-wider leading-none">
                                {localizedSlide.subtitle}
                              </p>
                            </div>

                            {/* Lab view toggle if code is present */}
                            {localizedSlide.code && (
                              <div className="flex border-b border-slate-700/60 pb-1.5 gap-2 select-none shrink-0">
                                <button
                                  onClick={() => setActiveTab('lecture')}
                                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                                    activeTab === 'lecture'
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80'
                                  }`}
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>{t.lectureTab}</span>
                                </button>
                                <button
                                  onClick={() => setActiveTab('lab')}
                                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                                    activeTab === 'lab'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80'
                                  }`}
                                >
                                  <Code2 className="w-3.5 h-3.5" />
                                  <span>{t.interactiveLab}</span>
                                </button>
                              </div>
                            )}

                            {/* Subcontent display tab */}
                            {activeTab === 'lecture' || !localizedSlide.code ? (
                              <motion.ul 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-3 pt-1.5 text-xs text-slate-200 leading-relaxed font-sans list-none"
                              >
                                {localizedSlide.bullets?.map((bullet, index) => {
                                  // Split label if semicolon exists for nice styling
                                  const parts = bullet.split(/[:៖]/);
                                  return (
                                    <motion.li 
                                      key={index}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                      className="flex items-start gap-3"
                                    >
                                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                                        {index + 1}
                                      </span>
                                      <span className="leading-relaxed pt-0.5 text-slate-200">
                                        {parts.length > 1 ? (
                                          <>
                                            <strong className="text-amber-400 font-extrabold">{parts[0]}{language === 'en' ? ': ' : '៖ '}</strong>
                                            {parts.slice(1).join(language === 'en' ? ': ' : '៖ ')}
                                          </>
                                        ) : (
                                          bullet
                                        )}
                                      </span>
                                    </motion.li>
                                  );
                                })}
                              </motion.ul>
                            ) : (
                              /* LAB TAB: Show editable dynamic VS Code terminal simulator emulator */
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-[215px] overflow-hidden shrink-0 select-text"
                              >
                                <InteractiveConsole 
                                  code={localizedSlide.code || ''} 
                                  onReset={() => handleResetCode(localizedSlide.id)} 
                                  language={language} 
                                />
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Slides Graphic or Code viewer depending on active tab */}
                        <div className="md:col-span-5 h-full flex flex-col justify-center overflow-hidden">
                          {activeTab === 'lecture' || !localizedSlide.code ? (
                            /* Lecture view shows diagrams */
                            <div className="w-full h-full max-h-[290px] flex items-center justify-center">
                              <SlideDiagram diagramId={localizedSlide.diagramId} />
                            </div>
                          ) : (
                            /* Lab view shows the VS Code-like fully editable code block */
                            <div className="w-full h-full flex flex-col justify-between max-h-[290px]">
                              <div className={`flex items-center justify-between px-3 py-1.5 rounded-t-xl border-t border-r border-l transition-colors duration-300 ${
                                codeTheme === 'dark' 
                                  ? 'bg-[#1F2937] border-gray-700 text-gray-200' 
                                  : 'bg-gray-100 border-gray-200 text-gray-750'
                              }`}>
                                <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1.5">
                                  <span>main.c</span>
                                  <span className="text-amber-500 text-[9px] font-sans font-bold animate-pulse">
                                    {language === 'en' ? '✏️ Editable VS Code Editor' : '✏️ កែសម្រួលកូដនៅទីនេះ'}
                                  </span>
                                </span>
                                <div className="flex gap-2.5 items-center select-none">
                                  {/* Light/Dark Toggle Button */}
                                  <button
                                    onClick={() => setCodeTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                                    className={`p-1 rounded transition-colors cursor-pointer flex items-center justify-center ${
                                      codeTheme === 'dark' 
                                        ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                                        : 'hover:bg-gray-200 text-gray-500 hover:text-gray-800'
                                    }`}
                                    title={`Switch to ${codeTheme === 'dark' ? 'Light' : 'Dark'} Theme`}
                                  >
                                    {codeTheme === 'dark' ? (
                                      <Sun className="w-3.5 h-3.5" />
                                    ) : (
                                      <Moon className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleCopyCode(localizedSlide.code || '')}
                                    className={`p-1 rounded transition-colors cursor-pointer ${
                                      codeTheme === 'dark' 
                                        ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                                        : 'hover:bg-gray-200 text-gray-500 hover:text-gray-850'
                                    }`}
                                    title="Copy Source Code"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadCode(localizedSlide.code || '', `slide_${localizedSlide.id}_main.c`)}
                                    className={`p-1 rounded transition-colors cursor-pointer ${
                                      codeTheme === 'dark' 
                                        ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                                        : 'hover:bg-gray-200 text-gray-500 hover:text-gray-850'
                                    }`}
                                    title="Download as .c file"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div className={`flex-1 overflow-auto rounded-b-xl border-b border-l border-r transition-colors duration-300 flex ${
                                codeTheme === 'dark' ? 'border-gray-700 bg-[#111827]' : 'border-gray-200 bg-white'
                              }`}>
                                <div className="flex-1 flex overflow-hidden font-mono text-[10.5px]">
                                  {/* Line numbers on the left */}
                                  <div className={`text-right pr-2 pl-3 py-3 select-none border-r text-[10px] leading-relaxed shrink-0 ${
                                    codeTheme === 'dark' ? 'bg-[#0b0f19] text-gray-600 border-gray-800' : 'bg-gray-50 text-gray-400 border-gray-200'
                                  }`}>
                                    {(localizedSlide.code || '').split('\n').map((_, lineIdx) => (
                                      <div key={lineIdx} className="h-[18px]">{lineIdx + 1}</div>
                                    ))}
                                  </div>
                                  {/* Text area editable editor */}
                                  <textarea
                                    value={localizedSlide.code || ''}
                                    onChange={(e) => handleCodeChange(e.target.value)}
                                    className={`flex-1 p-3 resize-none focus:outline-none leading-relaxed text-[11px] h-full ${
                                      codeTheme === 'dark' ? 'text-emerald-400 bg-transparent' : 'text-blue-800 bg-white'
                                    }`}
                                    style={{ lineHeight: '18px' }}
                                    spellCheck={false}
                                  />
                                </div>
                              </div>
                              <AnimatePresence>
                                {copiedIndex && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className="text-[10px] text-center font-bold text-emerald-600 mt-1 select-none"
                                  >
                                    {language === 'en' ? 'C code copied to clipboard!' : 'កូដគំរូភាសា C ត្រូវបានចម្លងទុក!'}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                  </div>

                  {/* Slide Footer */}
                  <div className="flex justify-between items-center border-t pt-2 border-slate-800">
                    <span className="text-[9px] md:text-xs font-mono opacity-50 text-slate-400">
                      {language === 'en' 
                        ? 'C Programming • Chapter 6: Functions' 
                        : 'ការសរសេរកម្មវិធីភាសា C • ជំពូកទី ៦៖ អនុគមន៍'}
                    </span>
                    <div className="flex items-center gap-1.5 text-amber-400 font-extrabold uppercase tracking-wider text-[9px] md:text-xs">
                      <RuppLogo size="sm" className="w-4 h-4" />
                      <span>{language === 'en' ? 'Royal University of Phnom Penh' : 'សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ'}</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Quick Helper Shortcut Tip */}
            <p className="text-[10px] text-gray-500 font-mono text-center mt-3 select-none">
              {language === 'en' ? (
                <span>
                  Keyboard: <span className="text-gray-600 font-bold bg-white border border-gray-300 px-1 py-0.2 rounded font-mono">←</span> / <span className="text-gray-600 font-bold bg-white border border-gray-300 px-1 py-0.2 rounded font-mono">→</span> or <span className="text-gray-600 font-bold bg-white border border-gray-300 px-1.5 py-0.2 rounded font-mono">Space</span> to navigate &bull; <span className="text-gray-600 font-bold bg-white border border-gray-300 px-1 py-0.2 rounded font-mono">F</span> Fullscreen &bull; <span className="text-gray-600 font-bold bg-white border border-gray-300 px-1 py-0.2 rounded font-mono">N</span> Lecture Notes &bull; <span className="text-gray-600 font-bold bg-white border border-gray-300 px-1 py-0.2 rounded font-mono">Q</span> Quiz
                </span>
              ) : (
                <span>
                  ក្តារចុច៖ <span className="text-gray-600 font-bold bg-white border border-gray-300 px-1 py-0.2 rounded font-mono">←</span> / <span className="text-gray-600 font-bold bg-white border border-gray-300 px-1 py-0.2 rounded font-mono">→</span> ឬ <span className="text-gray-600 font-bold bg-white border border-gray-300 px-1.5 py-0.2 rounded font-mono">Space</span> ដើម្បីប្តូរស្លាយ &bull; <span className="text-gray-600 font-bold bg-white border border-gray-300 px-1 py-0.2 rounded font-mono">F</span> ពេញអេក្រង់ &bull; <span className="text-gray-600 font-bold bg-white border border-gray-300 px-1 py-0.2 rounded font-mono">N</span> បើកកំណត់ត្រាសិក្សា &bull; <span className="text-gray-600 font-bold bg-white border border-gray-300 px-1 py-0.2 rounded font-mono">Q</span> សាកល្បងតេស្ត
                </span>
              )}
            </p>

            {/* Navigation Controllers & Slide Settings Panel */}
            <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 mt-5 flex flex-col md:flex-row gap-4 items-center justify-between shadow-md z-10 shrink-0">
              
              {/* Left Group: Slide Indicator Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 select-none">
                <button
                  onClick={handlePrevSlide}
                  className="p-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl text-gray-700 transition-colors cursor-pointer border border-gray-200"
                  title={language === 'en' ? 'Previous Slide' : 'ស្លាយមុន'}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold tracking-wide text-gray-700">
                  <span className="text-[#1E3A8A]">{currentIdx + 1}</span>
                  <span className="text-gray-300 mx-1.5">/</span>
                  <span className="text-gray-500">{slides.length}</span>
                </div>

                <button
                  onClick={handleNextSlide}
                  className="p-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl text-gray-700 transition-colors cursor-pointer border border-gray-200"
                  title={language === 'en' ? 'Next Slide' : 'ស្លាយបន្ទាប់'}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Middle Group: Slide dots progression */}
              <div className="hidden lg:flex items-center gap-1.5 select-none">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentIdx 
                        ? 'w-6 bg-[#1E3A8A]' 
                        : 'w-2 bg-gray-200 hover:bg-gray-300'
                    }`}
                    title={language === 'en' ? `Go to Slide ${idx + 1}` : `ទៅកាន់ស្លាយទី ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Right Group: Playback & Notes settings */}
              <div className="flex items-center gap-3 shrink-0 select-none">
                
                {/* Autoplay controller */}
                <div className="flex items-center gap-2 border-r border-gray-200 pr-3">
                  <button
                    onClick={toggleAutoPlay}
                    className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      isPlaying 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' 
                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isPlaying ? (language === 'en' ? 'Pause slideshow' : 'ផ្អាកការលេងស្វ័យប្រវត្តិ') : (language === 'en' ? 'Auto-play slideshow' : 'លេងស្លាយស្វ័យប្រវត្តិ')}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />}
                  </button>
                  
                  {isPlaying && (
                    <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 py-1.5 px-2.5 rounded-lg text-[10px] font-mono">
                      <Clock className="w-3 h-3 text-emerald-600 font-bold" />
                      <span className="text-emerald-700 font-bold">{secondsRemaining}s</span>
                    </div>
                  )}
                </div>

                {/* Theatre Mode */}
                <button
                  onClick={() => setIsTheatreMode((prev) => !prev)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isTheatreMode 
                      ? 'bg-blue-50 border-blue-200 text-[#1E3A8A]' 
                      : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={language === 'en' ? 'Toggle Theatre (Wide) Mode' : 'ប្តូរទៅរបៀបអេក្រង់ធំ'}
                >
                  {isTheatreMode ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
                </button>

                {/* Speaker Notes */}
                <button
                  onClick={() => setShowNotes((prev) => !prev)}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showNotes 
                      ? 'bg-blue-50 border-blue-200 text-[#1E3A8A]' 
                      : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Info className="w-4.5 h-4.5" />
                  <span>{language === 'en' ? 'Notes' : 'កំណត់ត្រា'}</span>
                </button>

              </div>

            </div>

            {/* Presenter Notes / Study Guide Drawer */}
            <AnimatePresence>
              {showNotes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full bg-white border border-gray-200 rounded-2xl p-4 mt-4 shadow-sm"
                >
                  <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-3">
                    <Info className="w-4 h-4 text-[#1E3A8A]" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#1E3A8A]">
                      {language === 'en' ? 'University Study Guide & Student Notes' : 'មគ្គុទ្ទេសក៍សិក្សា និងកំណត់ត្រារបស់និស្សិត'}
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-600 leading-relaxed list-disc list-inside">
                    {localizedSlide.presenterNotes.map((note, idx) => (
                      <li key={idx}>
                        <span className="text-gray-700">{note}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 text-[10px] text-gray-400 font-mono italic">
                    {language === 'en' 
                      ? "Tip: Press 'N' at any time to toggle this teaching script block." 
                      : "គន្លឹះ៖ ចុចគ្រាប់ចុច 'N' នៅពេលណាក៏បានដើម្បីបើក/បិទប្រអប់កំណត់ត្រានេះ។"}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>

      </div>
    </div>
  );
}
