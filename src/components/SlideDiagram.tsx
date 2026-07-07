import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Terminal, 
  Layers, 
  ArrowRight, 
  ArrowDown, 
  Database, 
  Code, 
  FileCode, 
  Zap, 
  Cpu, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  Compass, 
  HelpCircle,
  Copy,
  FolderCode,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Hand
} from 'lucide-react';

interface SlideDiagramProps {
  diagramId: string;
}

export const SlideDiagram: React.FC<SlideDiagramProps> = ({ diagramId }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset zoom & pan when diagram changes
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [diagramId]);

  // Attach wheel listener natively to support { passive: false }
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.08;
      const zoomFactor = e.deltaY < 0 ? 1 : -1;
      setScale(prev => Math.min(Math.max(prev + zoomFactor * zoomSpeed, 0.4), 3.5));
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.5));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.4));
  };

  const resetZoomPan = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const lineVariants = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: 0.5, ease: "easeInOut" } }
  };

  const verticalLineVariants = {
    hidden: { scaleY: 0 },
    visible: { scaleY: 1, transition: { duration: 0.5, ease: "easeInOut" } }
  };

  const renderDiagramCore = () => {
    switch (diagramId) {
      case 'title-illustration':
        return (
          <div className="w-full flex flex-col items-center justify-center p-4">
            <motion.div variants={itemVariants} className="z-10 bg-[#1F2937]/90 backdrop-blur-md rounded-xl p-5 border border-gray-700 max-w-sm w-full shadow-2xl">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs font-mono text-gray-400 select-none ml-2">main.c</span>
                <Terminal className="w-4 h-4 text-blue-400 ml-auto" />
              </div>
              
              <pre className="text-left font-mono text-[11px] leading-relaxed text-gray-200">
                <span className="text-blue-400">#include</span> <span className="text-amber-300">&lt;stdio.h&gt;</span>{'\n'}
                <span className="text-emerald-400">int</span> <span className="text-yellow-300">main</span>(){'\n'}
                {'{'}{'\n'}
                {'    '}<span className="text-gray-400">// Function execution trigger</span>{'\n'}
                {'    '}<span className="text-purple-400">printf</span>(<span className="text-emerald-400">"Chapter 6: Functions\\n"</span>);{'\n'}
                {'    '}<span className="text-yellow-400">SumByPointer</span>(a, &amp;b);{'\n'}
                {'    '}<span className="text-blue-400">return</span> <span className="text-amber-400">0</span>;{'\n'}
                {'}'}
              </pre>
            </motion.div>

            <div className="mt-4 flex flex-wrap gap-2 justify-center z-10">
              <div className="flex items-center gap-2 bg-slate-950/80 border border-blue-500/35 rounded-lg py-1 px-2.5 text-[11px] text-blue-300 shadow-md">
                <Cpu className="w-3 h-3 text-blue-400 animate-pulse" />
                <span>កូដភាសា C ដែលមានរចនាសម្ព័ន្ធ</span>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/80 border border-emerald-500/35 rounded-lg py-1 px-2.5 text-[11px] text-emerald-300 shadow-md">
                <Layers className="w-3 h-3 text-emerald-400" />
                <span>ស្ថាបត្យកម្មម៉ូឌុល (Modular)</span>
              </div>
            </div>
          </div>
        );

      case 'intro-hierarchy':
        return (
          <div className="w-full flex flex-col items-center justify-center p-2 text-white">
            <motion.div 
              variants={itemVariants}
              className="bg-[#1E3A8A] text-white font-extrabold py-2 px-5 rounded-lg shadow-sm text-xs uppercase tracking-wider flex items-center gap-2 z-10"
            >
              <Layers className="w-4 h-4" />
              <span>រចនាសម្ព័ន្ធកម្មវិធីភាសា C</span>
            </motion.div>

            <motion.div 
              variants={verticalLineVariants}
              className="w-0.5 h-5 bg-blue-500 origin-top" 
            />

            <div className="w-full grid grid-cols-2 gap-4 max-w-sm relative">
              <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-blue-500" />
              
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-3 bg-blue-500" />
                <motion.div 
                  variants={itemVariants}
                  className="bg-[#1E3A8A] text-white py-1 px-3 rounded-md shadow-xs text-xs font-mono w-full text-center border-l-4 border-amber-400 font-bold"
                >
                  main() [ចាប់ផ្តើម]
                </motion.div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-0.5 h-3 bg-blue-500" />
                <motion.div 
                  variants={itemVariants}
                  className="bg-blue-600 text-white py-1 px-3 rounded-md shadow-xs text-xs font-extrabold w-full text-center"
                >
                  អនុគមន៍ផ្ទាល់ខ្លួន (Functions)
                </motion.div>
              </div>
            </div>

            <div className="w-full max-w-sm grid grid-cols-2 gap-4">
              <div />
              <div className="flex flex-col items-center">
                <motion.div 
                  variants={verticalLineVariants}
                  className="w-0.5 h-5 bg-blue-500 origin-top" 
                />
              </div>
            </div>

            <div className="w-full max-w-lg relative">
              <motion.div 
                variants={lineVariants}
                className="absolute top-0 left-[12%] right-[12%] h-0.5 bg-blue-500 origin-left" 
              />
              
              <div className="grid grid-cols-4 gap-1.5 pt-3">
                {[
                  { label: "មានតម្លៃត្រឡប់ +\nមានប៉ារ៉ាម៉ែត្រ", bg: "bg-blue-950/60 text-blue-100 border-blue-800/80", desc: "ប្រភេទ ១" },
                  { label: "មានតម្លៃត្រឡប់ +\nគ្មានប៉ារ៉ាម៉ែត្រ", bg: "bg-indigo-950/60 text-indigo-100 border-indigo-800/80", desc: "ប្រភេទ ២" },
                  { label: "គ្មានតម្លៃត្រឡប់ +\nមានប៉ារ៉ាម៉ែត្រ", bg: "bg-sky-950/60 text-sky-100 border-sky-800/80", desc: "ប្រភេទ ៣" },
                  { label: "គ្មានតម្លៃត្រឡប់ +\nគ្មានប៉ារ៉ាម៉ែត្រ", bg: "bg-slate-800/80 text-gray-200 border-gray-700", desc: "ប្រភេទ ៤" }
                ].map((type, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-0.5 h-3 bg-blue-500" />
                    <motion.div 
                      variants={itemVariants}
                      className={`p-1.5 rounded-lg border shadow-xs text-[10px] text-center w-full min-h-[50px] flex flex-col justify-center items-center ${type.bg}`}
                    >
                      <span className="font-extrabold text-[8px] uppercase tracking-wider text-amber-400 mb-0.5">{type.desc}</span>
                      <span className="font-bold leading-tight whitespace-pre-line">{type.label}</span>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'four-types-grid':
        return (
          <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto w-full p-2">
            {[
              {
                id: "ប្រភេទ ១",
                name: "ប្រភេទ ១៖ អនុគមន៍សុទ្ធ",
                sub: "មានតម្លៃត្រឡប់ + មានប៉ារ៉ាម៉ែត្រ",
                formula: "result = Sum(a, b);",
                color: "border-blue-800/80 bg-blue-950/40 text-blue-100",
                badge: "bg-blue-900/80 text-blue-200"
              },
              {
                id: "ប្រភេទ ២",
                name: "ប្រភេទ ២៖ អ្នកទទួលតម្លៃ",
                sub: "មានតម្លៃត្រឡប់ + គ្មានប៉ារ៉ាម៉ែត្រ",
                formula: "result = Sum();",
                color: "border-indigo-800/80 bg-indigo-950/40 text-indigo-100",
                badge: "bg-indigo-900/80 text-indigo-200"
              },
              {
                id: "ប្រភេទ ៣",
                name: "ប្រភេទ ៣៖ អ្នកបង្ហាញលទ្ធផល",
                sub: "គ្មានតម្លៃត្រឡប់ (void) + មានប៉ារ៉ាម៉ែត្រ",
                formula: "Sum(a, b);",
                color: "border-sky-800/80 bg-sky-950/40 text-sky-100",
                badge: "bg-sky-900/80 text-sky-200"
              },
              {
                id: "ប្រភេទ ៤",
                name: "ប្រភេទ ៤៖ ដំណើរការស្តង់ដារ",
                sub: "គ្មានតម្លៃត្រឡប់ (void) + គ្មានប៉ារ៉ាម៉ែត្រ",
                formula: "Sum();",
                color: "border-slate-700/80 bg-slate-800/40 text-slate-100",
                badge: "bg-slate-700/80 text-slate-200"
              }
            ].map((box) => (
              <motion.div 
                key={box.id}
                variants={itemVariants}
                className={`p-2.5 rounded-xl border ${box.color} flex flex-col justify-between hover:scale-[1.01] transition-transform shadow-xs`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${box.badge} font-bold`}>{box.id}</span>
                  <Code className="w-3 h-3 opacity-60 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold leading-tight text-white">{box.name}</h4>
                  <p className="text-[9px] opacity-75 mt-0.5 leading-tight font-medium text-blue-200">{box.sub}</p>
                </div>
                <div className="mt-2 bg-slate-950 rounded px-1.5 py-0.5 font-mono text-[9px] text-amber-300 border border-slate-800">
                  {box.formula}
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'call-flow-type1':
        return (
          <div className="w-full flex flex-col items-center justify-center p-2 max-w-xs mx-auto text-white">
            {[
              { step: "១. main()", label: "បញ្ជូនតម្លៃ x, y ទៅអនុគមន៍", icon: User, color: "bg-[#1E3A8A] text-white" },
              { step: "២. Sum(a, b)", label: "តម្លៃចម្លងទៅប៉ារ៉ាម៉ែត្រក្នុងអនុគមន៍", icon: Code, color: "bg-indigo-600 text-white" },
              { step: "៣. a + b", label: "ដំណើរការគណនាត្រូវបានបញ្ចប់", icon: Cpu, color: "bg-emerald-600 text-white" },
              { step: "៤. return លទ្ធផល", label: "បញ្ជូនលទ្ធផលត្រឡប់ទៅ main() វិញ", icon: Zap, color: "bg-amber-500 text-white" }
            ].map((item, idx, arr) => (
              <React.Fragment key={idx}>
                <motion.div 
                  variants={itemVariants}
                  className="w-full flex items-center gap-2.5 bg-slate-800/60 p-2 rounded-xl border border-slate-700/60 shadow-xs text-white text-left"
                >
                  <div className={`p-1.5 rounded-lg ${item.color}`}>
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold text-white leading-none">{item.step}</div>
                    <div className="text-[9px] text-gray-300 font-medium mt-0.5 leading-none">{item.label}</div>
                  </div>
                </motion.div>
                {idx < arr.length - 1 && (
                  <motion.div variants={itemVariants} className="my-0.5">
                    <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
        );

      case 'location-flowchart':
        return (
          <div className="w-full flex flex-col items-center justify-center p-2 max-w-xs mx-auto text-white">
            <div className="w-full text-center font-extrabold text-[10px] uppercase tracking-wider text-amber-400 mb-2.5 select-none">
              លំដាប់លំដោយនៃការចងក្រង (Compiler)
            </div>
            {[
              { name: "គំរូអនុគមន៍ (Function Prototype)", desc: "ការប្រកាស (ប្រភេទត្រឡប់, ឈ្មោះ, ប៉ារ៉ាម៉ែត្រ)", color: "border-blue-800 text-blue-100 bg-blue-950/40" },
              { name: "អនុគមន៍ main()", desc: "ចំណុចចាប់ផ្តើមដំណើរការកម្មវិធីចម្បង", color: "border-amber-800 text-amber-100 bg-amber-950/40" },
              { name: "ការកំណត់អនុគមន៍ (Function Definition)", desc: "ប្លុកកូដដំណើរការជាក់ស្តែង", color: "border-emerald-800 text-emerald-100 bg-emerald-950/40" }
            ].map((item, idx, arr) => (
              <React.Fragment key={idx}>
                <motion.div 
                  variants={itemVariants}
                  className={`w-full p-2 rounded-xl border-2 text-center shadow-xs ${item.color}`}
                >
                  <div className="text-xs font-bold font-mono text-white leading-tight">{item.name}</div>
                  <div className="text-[9px] opacity-85 mt-0.5 font-bold leading-tight">{item.desc}</div>
                </motion.div>
                {idx < arr.length - 1 && (
                  <motion.div variants={itemVariants} className="my-1">
                    <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
        );

      case 'call-flow-type2':
        return (
          <div className="w-full flex flex-col items-center justify-center p-2 text-white max-w-xs mx-auto shadow-xs">
            <div className="text-center text-amber-400 text-[10px] font-extrabold uppercase tracking-wider mb-2.5">
              ប្រភេទទី ២៖ លំដាប់លំដោយនៃការហៅអនុគមន៍
            </div>
            {[
              { step: "១. ការហៅពី main()", details: "ហៅអនុគមន៍ Sum() ដោយគ្មានបញ្ជូនប៉ារ៉ាម៉ែត្រ។", color: "text-blue-300 border-blue-900/60" },
              { step: "២. ដែនកូដ Sum()", details: "បង្កើតអថេរក្នុងស្រុក 'a' និង 'b' នៅក្នុង Stack ក្នុងស្រុក។", color: "text-indigo-300 border-indigo-900/60" },
              { step: "៣. ការទទួលតម្លៃបញ្ចូល", details: "អានតម្លៃបញ្ចូលដោយផ្ទាល់ក្នុងអនុគមន៍ដោយប្រើ scanf()។", color: "text-amber-300 border-amber-900/60" },
              { step: "៤. តម្លៃត្រឡប់មកវិញ", details: "បញ្ជូនលទ្ធផលដែលបានគណនារួចត្រឡប់ទៅ main() វិញ។", color: "text-emerald-300 border-emerald-900/60" }
            ].map((item, idx, arr) => (
              <React.Fragment key={idx}>
                <motion.div 
                  variants={itemVariants}
                  className={`w-full p-2 rounded-lg border bg-slate-800/50 flex items-start gap-2 ${item.color}`}
                >
                  <div className="font-mono text-[10px] font-bold leading-none mt-0.5">{idx + 1}.</div>
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-white leading-none">{item.step}</div>
                    <div className="text-[9px] text-gray-300 mt-1 leading-normal font-medium">{item.details}</div>
                  </div>
                </motion.div>
                {idx < arr.length - 1 && (
                  <motion.div variants={itemVariants} className="my-0.5 text-blue-400">
                    <ArrowDown className="w-3 h-3" />
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
        );

      case 'call-flow-type3':
        return (
          <div className="w-full flex flex-col items-center justify-center p-2 text-white max-w-xs mx-auto shadow-xs">
            <div className="text-center text-amber-400 text-[10px] font-extrabold uppercase tracking-wider mb-2.5">
              ប្រភេទទី ៣៖ លំដាប់លំដោយនៃការហៅអនុគមន៍
            </div>
            {[
              { step: "១. ប្រមូលតម្លៃអថេរក្នុង main()", details: "scanf() ទទួលតម្លៃសម្រាប់អថេរ x និង y។", bg: "bg-slate-800/40 border-slate-700/40 text-gray-200" },
              { step: "២. ហៅអនុគមន៍ Sum(x, y)", details: "ហៅអនុគមន៍ដោយបញ្ជូនចម្លងតម្លៃ x និង y ទៅប៉ារ៉ាម៉ែត្រ។", bg: "bg-slate-800/40 border-slate-700/40 text-gray-200" },
              { step: "៣. បង្ហាញលទ្ធផលពីខាងក្នុង", details: "printf() បង្ហាញផលបូករបស់តម្លៃចម្លង។ មិនត្រូវការតម្លៃត្រឡប់ទេ។", bg: "bg-emerald-950/40 border-emerald-800 text-emerald-200" }
            ].map((item, idx, arr) => (
              <React.Fragment key={idx}>
                <motion.div 
                  variants={itemVariants}
                  className={`w-full p-2.5 rounded-lg border flex gap-2.5 items-center ${item.bg} shadow-xs text-left`}
                >
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">{idx + 1}</span>
                  <div>
                    <div className="text-[11px] font-bold text-white leading-none">{item.step}</div>
                    <div className="text-[9px] text-gray-300 mt-0.5 leading-tight font-medium">{item.details}</div>
                  </div>
                </motion.div>
                {idx < arr.length - 1 && (
                  <motion.div variants={itemVariants} className="my-0.5 text-blue-400">
                    <ArrowDown className="w-3 h-3" />
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
        );

      case 'call-flow-type4':
        return (
          <div className="w-full flex flex-col items-center justify-center p-2 text-white max-w-xs mx-auto shadow-xs">
            <div className="text-center text-amber-400 text-[10px] font-extrabold uppercase tracking-wider mb-2.5">
              ប្រភេទទី ៤៖ លំដាប់ដំណើរការពេញលេញ
            </div>
            {[
              { title: "main() ហៅ Sum()", desc: "គ្មានការបញ្ជូនតម្លៃ (Arguments) ឡើយ។", icon: Terminal, color: "text-blue-400" },
              { title: "scanf() អានតម្លៃ 'a' & 'b'", desc: "អថេររស់នៅក្នុង stack ក្នុងស្រុកតែប៉ុណ្ណោះ។", icon: FileCode, color: "text-amber-400" },
              { title: "printf() បង្ហាញលទ្ធផល", desc: "បង្ហាញលទ្ធផលដោយផ្ទាល់ រួចត្រឡប់មកវិញ។", icon: Zap, color: "text-emerald-400" }
            ].map((item, idx, arr) => (
              <React.Fragment key={idx}>
                <motion.div 
                  variants={itemVariants}
                  className="w-full p-2 rounded-lg border border-slate-700/50 bg-slate-800/40 flex gap-2.5 items-center shadow-xs text-white text-left"
                >
                  <div className="p-1 rounded-md bg-slate-950 border border-slate-800/80">
                    <item.icon className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white leading-none">{item.title}</div>
                    <div className="text-[9px] text-gray-300 mt-0.5 leading-tight font-semibold">{item.desc}</div>
                  </div>
                </motion.div>
                {idx < arr.length - 1 && (
                  <motion.div variants={itemVariants} className="my-0.5 text-blue-400">
                    <ArrowDown className="w-3 h-3" />
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
        );

      case 'comparison-pointers':
        return (
          <div className="w-full text-white p-2">
            <motion.div 
              variants={itemVariants}
              className="bg-[#1E3A8A] text-white rounded-xl p-2.5 text-center shadow max-w-sm mx-auto mb-3"
            >
              <div className="text-[9px] font-bold uppercase tracking-wider opacity-75">Stack របស់កម្មវិធីហៅ៖ main()</div>
              <div className="font-mono text-xs font-semibold mt-0.5">int x = 5;  int y = 10;</div>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto relative">
              <div className="flex flex-col items-center">
                <motion.div 
                  variants={itemVariants}
                  className="bg-slate-800/40 border border-indigo-500/30 rounded-xl p-2.5 shadow-xs w-full min-h-[120px] flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      Call by Value (តាមតម្លៃ)
                    </h4>
                    <p className="text-[9px] text-gray-300 mt-1 leading-tight font-medium">
                      ចម្លងតម្លៃអថេរទៅប៉ារ៉ាម៉ែត្រ។ ការកែប្រែប៉ារ៉ាម៉ែត្រគ្មានផលប៉ះពាល់ដល់អថេរដើមឡើយ។
                    </p>
                  </div>
                  
                  <div className="mt-2 pt-1.5 border-t border-indigo-900 font-mono text-[9px] text-indigo-300 font-bold">
                    <div>SumByValue(x, y);</div>
                    <div className="text-[8px] text-rose-400 font-bold mt-0.5">y នៅរក្សាតម្លៃ 10 ដដែល</div>
                  </div>
                </motion.div>
              </div>

              <div className="flex flex-col items-center">
                <motion.div 
                  variants={itemVariants}
                  className="bg-slate-800/40 border border-emerald-500/30 rounded-xl p-2.5 shadow-xs w-full min-h-[120px] flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Call by Pointer (តាមចង្អុល)
                    </h4>
                    <p className="text-[9px] text-gray-300 mt-1 leading-tight font-medium">
                      បញ្ជូនអាសយដ្ឋានអង្គចងចាំ (&amp;y)។ កែប្រែតម្លៃដើមដោយផ្ទាល់ក្នុងអង្គចងចាំ។
                    </p>
                  </div>
                  
                  <div className="mt-2 pt-1.5 border-t border-emerald-900 font-mono text-[9px] text-emerald-300 font-bold">
                    <div>SumByPointer(x, &amp;y);</div>
                    <div className="text-[8px] text-emerald-400 font-bold mt-0.5">y ត្រូវបានប្តូរទៅជា 15</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        );

      case 'overall-flowchart':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 w-full p-2">
            {[
              { num: "01", title: "ការបញ្ចូល (User Input)", desc: "ប្រមូលទិន្នន័យពីក្តារចុចតាម scanf() ឬកំណត់តម្លៃថេរ។", color: "border-blue-900/60 text-blue-100 bg-blue-950/30" },
              { num: "02", title: "ដំណើរការ main()", desc: "ការចាប់ផ្តើមដំណើរការកម្មវិធីនៅក្នុងប្លុកចម្បង។", color: "border-indigo-900/60 text-indigo-100 bg-indigo-950/30" },
              { num: "03", title: "ការហៅអនុគមន៍", desc: "បញ្ជូនតម្លៃ និងលោតទៅកាន់អាសយដ្ឋានកំណត់អនុគមន៍។", color: "border-sky-900/60 text-sky-100 bg-sky-950/30" },
              { num: "04", title: "ដំណើរការទិន្នន័យ", desc: "ធ្វើការគណនានៅលើអង្គចងចាំ stack ក្នុងស្រុករបស់អនុគមន៍។", color: "border-amber-900/60 text-amber-100 bg-amber-950/30" },
              { num: "05", title: "បញ្ជូនតម្លៃត្រឡប់", desc: "បញ្ជូនលទ្ធផលទៅ register រួចលុប stack របស់អនុគមន៍។", color: "border-emerald-900/60 text-emerald-100 bg-emerald-950/30" },
              { num: "06", title: "បង្ហាញលទ្ធផល", desc: "បង្ហាញលទ្ធផលដែលទទួលបាននៅលើអេក្រង់ Terminal។", color: "border-purple-900/60 text-purple-100 bg-purple-950/30" }
            ].map((step, idx) => (
              <motion.div 
                key={step.num}
                variants={itemVariants}
                className={`p-2 rounded-xl border flex flex-col justify-between ${step.color} shadow-xs hover:shadow-sm transition-all`}
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[8px] font-mono font-bold text-gray-400">ជំហាន {step.num}</span>
                  <CheckCircle2 className="w-3 h-3 text-slate-500" />
                </div>
                <div>
                  <h5 className="text-[10px] font-extrabold leading-tight text-white">{step.title}</h5>
                  <p className="text-[8.5px] text-gray-300 mt-0.5 leading-normal font-medium">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'summary-infographic':
        return (
          <div className="grid grid-cols-2 gap-2.5 max-w-lg mx-auto w-full p-2">
            {[
              { title: "ការប្រើឡើងវិញ (Reusability)", desc: "សរសេរកូដតែម្តង ហើយហៅប្រើប្រាស់បានច្រើនដងពីគ្រប់ទីកន្លែង។", color: "border-blue-900/60 bg-blue-950/30 text-blue-100", icon: Copy },
              { title: "គ្មានកូដដដែលៗ (DRY)", desc: "កាត់បន្ថយទំហំកូដ និងធានាថាការកែប្រែកូដធ្វើឡើងតែមួយកន្លែងគត់។", color: "border-indigo-900/60 bg-indigo-950/30 text-indigo-100", icon: FolderCode },
              { title: "ងាយស្រួលធ្វើតេស្ត (Debugging)", desc: "អាចវិភាគ និងតេស្តសាកល្បងអនុគមន៍នីមួយៗដាច់ដោយឡែកពីគ្នា។", color: "border-emerald-900/60 bg-emerald-950/30 text-emerald-100", icon: Terminal },
              { title: "ការគិតបែបម៉ូឌុល (Modularity)", desc: "រៀបចំកម្មវិធីជាផ្នែកៗយ៉ាងមានរបៀបរៀបរយ និងងាយស្រួលយល់។", color: "border-amber-900/60 bg-amber-950/30 text-amber-100", icon: Compass }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className={`p-2.5 rounded-xl border flex flex-col justify-between shadow-xs ${item.color} hover:scale-[1.01] transition-transform`}
              >
                <div className="flex gap-1.5 items-center mb-1 text-left">
                  <div className="p-1 bg-slate-950 rounded-lg border border-slate-800 shadow-xs shrink-0">
                    <item.icon className="w-3 h-3 text-blue-400" />
                  </div>
                  <h4 className="text-[10px] font-extrabold leading-tight text-white">{item.title}</h4>
                </div>
                <p className="text-[9px] text-gray-300 leading-normal font-medium text-left">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-slate-700/50 rounded-xl text-xs text-slate-400">
            No diagram available
          </div>
        );
    }
  };

  return (
    <motion.div 
      className="relative w-full h-full min-h-[270px] flex flex-col items-center justify-center bg-slate-950/65 rounded-2xl border border-slate-800 shadow-xl overflow-hidden group select-none"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Viewport for Panning & Zooming */}
      <div 
        ref={viewportRef}
        className={`w-full h-full flex items-center justify-center overflow-hidden relative ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Decorative Grid Backdrop (static background so it doesn't move with zoom/pan) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-25 pointer-events-none" />

        {/* The actual moving diagram container */}
        <motion.div 
          className="w-full max-w-full origin-center flex flex-col items-center justify-center"
          animate={{
            x: position.x,
            y: position.y,
            scale: scale
          }}
          transition={isDragging ? { type: "tween", duration: 0 } : { type: "spring", stiffness: 300, damping: 28 }}
        >
          {renderDiagramCore()}
        </motion.div>
      </div>

      {/* Premium floating Zoom / Pan Toolbar */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl shadow-2xl z-20">
        <button 
          onClick={zoomOut}
          title="Zoom Out"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        
        {/* Zoom level indicator */}
        <span className="text-[10px] font-mono font-bold text-slate-300 min-w-[36px] text-center">
          {Math.round(scale * 100)}%
        </span>

        <button 
          onClick={zoomIn}
          title="Zoom In"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-700/60 mx-0.5" />

        <button 
          onClick={resetZoomPan}
          title="Reset View"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating navigation hint at bottom left */}
      <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-xs border border-slate-800/60 px-2.5 py-1 rounded-full text-[9px] text-slate-400 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-60">
        <Hand className="w-3 h-3 text-amber-500 animate-pulse" />
        <span>Drag to Pan &bull; Wheel to Zoom</span>
      </div>
    </motion.div>
  );
};
