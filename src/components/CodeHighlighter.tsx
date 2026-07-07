import React from 'react';

interface CodeHighlighterProps {
  code: string;
  theme?: 'light' | 'dark';
}

export const CodeHighlighter: React.FC<CodeHighlighterProps> = ({ code, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  // Simple regex-based syntax highlighter for C code
  const highlightC = (rawCode: string) => {
    // Escape HTML first
    let escaped = rawCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Keywords
    const keywords = [
      '#include', 'long', 'int', 'void', 'return', 'float', 'double', 'char', 'if', 'else', 'for', 'while'
    ];
    
    // Highlight system headers e.g. <stdio.h>
    const headerClass = isDark ? 'text-amber-400 font-semibold' : 'text-amber-600 font-bold';
    escaped = escaped.replace(/(&lt;[a-zA-Z0-9_.]+\.h&gt;)/g, `<span class="${headerClass}">$1</span>`);

    // Highlight strings "..."
    const stringClass = isDark ? 'text-emerald-400 font-medium' : 'text-emerald-700 font-bold';
    escaped = escaped.replace(/(".*?")/g, `<span class="${stringClass}">$1</span>`);

    // Highlight functions and standard calls
    const funcClass = isDark ? 'text-yellow-300 font-medium' : 'text-[#1E3A8A] font-extrabold';
    escaped = escaped.replace(/\b(printf|scanf|Sum|SumByValue|SumByPointer|main)\b/g, `<span class="${funcClass}">$1</span>`);

    // Highlight standard types and keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      if (keyword.startsWith('#')) {
        const hashClass = isDark ? 'text-rose-400 font-semibold' : 'text-rose-600 font-bold';
        escaped = escaped.replace(regex, `<span class="${hashClass}">${keyword}</span>`);
      } else {
        const keyClass = isDark ? 'text-blue-400 font-semibold' : 'text-blue-700 font-bold';
        escaped = escaped.replace(regex, `<span class="${keyClass}">${keyword}</span>`);
      }
    });

    // Highlight numbers
    const numClass = isDark ? 'text-violet-400' : 'text-violet-600 font-bold';
    escaped = escaped.replace(/\b(\d+)\b/g, `<span class="${numClass}">$1</span>`);

    // Highlight comments // ...
    const commentClass = isDark ? 'text-slate-400 italic' : 'text-gray-400 italic';
    escaped = escaped.replace(/(\/\/.*)/g, `<span class="${commentClass}">$1</span>`);

    return escaped;
  };

  const preClass = isDark
    ? "text-left font-mono text-xs leading-relaxed text-slate-100 overflow-x-auto p-4 select-text select-all bg-transparent"
    : "text-left font-mono text-xs leading-relaxed text-gray-800 overflow-x-auto p-4 select-text select-all bg-transparent";

  return (
    <pre className={preClass}>
      <code dangerouslySetInnerHTML={{ __html: highlightC(code) }} />
    </pre>
  );
};
