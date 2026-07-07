import React, { useState } from 'react';
import { quizQuestions } from '../data/slides';
import { QuizQuestion } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { quizTranslations, uiTranslations } from '../data/translations';
import { 
  Check, 
  X, 
  HelpCircle, 
  Award, 
  RotateCcw, 
  ChevronRight, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';

interface QuickQuizProps {
  language: 'kh' | 'en';
}

export const QuickQuiz: React.FC<QuickQuizProps> = ({ language }) => {
  const t = uiTranslations[language];
  const activeQuestions = language === 'en' ? quizTranslations : quizQuestions;

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [answersLog, setAnswersLog] = useState<{ qIdx: number; correct: boolean }[]>([]);

  const handleOptionClick = (optIdx: number) => {
    if (isAnswered) return;
    setSelectedOpt(optIdx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOpt === null || isAnswered) return;
    
    const isCorrect = selectedOpt === activeQuestions[currentIdx].correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    
    setAnswersLog((prev) => [...prev, { qIdx: currentIdx, correct: isCorrect }]);
    setIsAnswered(true);
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setIsAnswered(false);
    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setShowSummary(false);
    setAnswersLog([]);
  };

  const currentQuestion: any = activeQuestions[currentIdx];

  const getSlogan = () => {
    const ratio = score / activeQuestions.length;
    if (language === 'en') {
      if (ratio === 1) return { title: "C Programming Master!", msg: "Perfect score! You understand Chapter 6 functions, stack activation records, and pointers deeply.", color: "text-emerald-400" };
      if (ratio >= 0.6) return { title: "Proficient Programmer!", msg: "Great job! You have a solid grasp on how C passes arguments and structures definitions.", color: "text-blue-400" };
      return { title: "Keen Learner!", msg: "Good effort! Try reviewing slide notes on call by reference pointers and try again.", color: "text-amber-400" };
    } else {
      if (ratio === 1) return { title: "កំពូលអ្នកសរសេរកម្មវិធី C!", msg: "ពិន្ទុពេញ! អ្នកយល់ដឹងច្បាស់ពីមេរៀនអនុគមន៍ Stack Memory និង Pointer។", color: "text-emerald-400" };
      if (ratio >= 0.6) return { title: "អ្នកសរសេរកម្មវិធីកម្រិតល្អ!", msg: "ល្អណាស់! អ្នកមានការយល់ដឹងរឹងមាំពីការបញ្ជូនប៉ារ៉ាម៉ែត្រក្នុងភាសា C។", color: "text-blue-400" };
      return { title: "អ្នកសិក្សាគួរឱ្យសរសើរ!", msg: "កិច្ចខិតខំប្រឹងប្រែងដ៏ល្អ! ព្យាយាមពិនិត្យមើលស្លាយមេរៀនឡើងវិញ រួចសាកល្បងម្តងទៀត។", color: "text-amber-400" };
    }
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-4 md:p-6 text-gray-800 min-h-[340px] flex flex-col justify-between shadow-sm">
      <AnimatePresence mode="wait">
        {!showSummary ? (
          <motion.div
            key="quiz-question"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full justify-between"
          >
            {/* Header / Progress bar */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 bg-blue-50 text-[#1E3A8A] rounded-full border border-blue-100 font-bold flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-[#1E3A8A]" />
                  <span>{language === 'en' ? 'CHAPTER 6 SELF-CHECK' : 'តេស្តស្វែងយល់ជំពូកទី ៦'}</span>
                </span>
                <span className="text-xs font-mono text-gray-500 font-semibold">
                  {language === 'en' ? `Question ${currentIdx + 1} of ${activeQuestions.length}` : `សំណួរទី ${currentIdx + 1} លើ ${activeQuestions.length}`}
                </span>
              </div>
              
              <div className="w-full bg-gray-100 h-1.5 rounded-full mb-5 overflow-hidden">
                <div 
                  className="bg-[#1E3A8A] h-full transition-all duration-300"
                  style={{ width: `${((currentIdx) / activeQuestions.length) * 100}%` }}
                />
              </div>

              {/* The Question */}
              <h3 className="text-sm font-extrabold mb-4 leading-relaxed text-gray-900 flex items-start gap-2">
                <HelpCircle className="w-4.5 h-4.5 text-[#1E3A8A] shrink-0 mt-0.5" />
                <span>{currentQuestion.question}</span>
              </h3>

              {/* Options */}
              <div className="space-y-2 mb-4">
                {currentQuestion.options.map((opt: string, idx: number) => {
                  let optStyle = "border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-700";
                  let icon = null;

                  if (selectedOpt === idx && !isAnswered) {
                    optStyle = "border-[#1E3A8A] bg-blue-50/50 text-[#1E3A8A] ring-2 ring-blue-500/10 font-medium";
                  }

                  if (isAnswered) {
                    if (idx === currentQuestion.correctAnswer) {
                      optStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold";
                      icon = <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
                    } else if (selectedOpt === idx) {
                      optStyle = "border-rose-500 bg-rose-50 text-rose-800";
                      icon = <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
                    } else {
                      optStyle = "border-gray-100 bg-gray-50/20 text-gray-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left text-xs p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${optStyle}`}
                    >
                      <span className="leading-normal">{opt}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Answer validation message & Navigation */}
            <div className="pt-4 border-t border-gray-100">
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4 bg-gray-50 p-3.5 rounded-lg border border-gray-200 text-xs"
                  >
                    <div className="font-extrabold text-[#1E3A8A] flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t.explanation}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end gap-2">
                {!isAnswered ? (
                  <button
                    onClick={handleConfirmAnswer}
                    disabled={selectedOpt === null}
                    className="bg-[#1E3A8A] hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm animate-pulse"
                  >
                    {language === 'en' ? 'Confirm Answer' : 'ផ្ទៀងផ្ទាត់ចម្លើយ'}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                  >
                    <span>
                      {currentIdx < activeQuestions.length - 1 
                        ? (language === 'en' ? 'Next Question' : 'សំណួរបន្ទាប់') 
                        : (language === 'en' ? 'View Results' : 'មើលលទ្ធផលសរុប')}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="quiz-summary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center p-4"
          >
            <div className="w-14 h-14 bg-blue-50 text-[#1E3A8A] border border-blue-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Award className="w-8 h-8 text-[#1E3A8A]" />
            </div>

            <h3 className={`text-lg font-extrabold text-[#1E3A8A]`}>
              {getSlogan().title}
            </h3>
            
            <p className="text-xs text-gray-500 max-w-sm mt-2 leading-relaxed">
              {getSlogan().msg}
            </p>

            <div className="mt-5 mb-5 bg-gray-50 p-4 rounded-xl border border-gray-200 w-full max-w-xs flex justify-around items-center">
              <div>
                <div className="text-[10px] text-gray-400 font-mono font-bold tracking-wider">
                  {language === 'en' ? 'TOTAL SCORE' : 'ពិន្ទុសរុប'}
                </div>
                <div className="text-2xl font-extrabold text-gray-900 mt-1">
                  {score} / {activeQuestions.length}
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <div className="text-[10px] text-gray-400 font-mono font-bold tracking-wider">
                  {language === 'en' ? 'ACCURACY' : 'ភាគរយត្រឹមត្រូវ'}
                </div>
                <div className="text-2xl font-extrabold text-[#1E3A8A] mt-1">
                  {Math.round((score / activeQuestions.length) * 100)}%
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetQuiz}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
