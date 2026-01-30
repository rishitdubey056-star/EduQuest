
import React, { useState } from 'react';
import { QuizResult } from '../types';

interface ResultDashboardProps {
  result: QuizResult;
  onRetry: () => void;
}

const ResultDashboard: React.FC<ResultDashboardProps> = ({ result, onRetry }) => {
  const percentage = (result.score / result.total) * 100;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getPerformanceMessage = () => {
    if (percentage === 100) return "Mastery Achieved! 🏆";
    if (percentage >= 80) return "Excellent Performance! 🌟";
    if (percentage >= 60) return "Good Effort! 👍";
    return "Keep Learning! 📚";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Score Summary Card */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 flex flex-col md:flex-row items-center gap-10">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96" cy="96" r="80"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-gray-100"
            />
            <circle
              cx="96" cy="96" r="80"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={2 * Math.PI * 80 * (1 - percentage / 100)}
              className="text-indigo-600 transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-black text-gray-800">{result.score}</span>
            <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">out of {result.total}</span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-4xl font-black text-gray-900 mb-2">{getPerformanceMessage()}</h2>
          <p className="text-gray-500 text-lg mb-6 leading-relaxed">
            You've completed the assessment for <span className="font-bold text-indigo-600">{result.questions[0]?.topic}</span>. 
            Review your answers below to master the concepts.
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <button 
              onClick={onRetry}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              New Assessment
            </button>
            <button 
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
              onClick={() => window.print()}
            >
              Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* Solutions List */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-800 px-2 flex items-center gap-2">
          Detailed Solutions
          <span className="text-sm font-medium bg-gray-200 px-3 py-1 rounded-full text-gray-600">
            Review your thinking
          </span>
        </h3>
        {result.questions.map((q, idx) => {
          const userAnswer = result.answers.find(a => a.questionId === q.id);
          const isCorrect = userAnswer?.isCorrect;
          const isExpanded = expandedId === q.id;

          return (
            <div 
              key={q.id}
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
                isExpanded ? 'ring-2 ring-indigo-500 border-transparent' : 'border-gray-100'
              }`}
            >
              <button 
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="w-full p-6 flex items-start gap-4 text-left group"
              >
                <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                  isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {isCorrect ? '✓' : '✕'}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold text-lg leading-snug group-hover:text-indigo-600 transition-colors">
                    {q.question}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{q.topic}</span>
                    {!isCorrect && (
                      <span className="text-xs font-bold text-red-500 uppercase">Incorrect Answer</span>
                    )}
                  </div>
                </div>
                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-8 border-t border-gray-50 pt-6 bg-gray-50/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {q.options.map((opt, oIdx) => {
                      const isCorrectOpt = oIdx === q.correctAnswer;
                      const isSelectedOpt = oIdx === userAnswer?.selectedOption;
                      
                      let variant = "bg-white border-gray-200 text-gray-500 opacity-60";
                      if (isCorrectOpt) variant = "bg-green-50 border-green-500 text-green-700 font-bold opacity-100";
                      if (isSelectedOpt && !isCorrectOpt) variant = "bg-red-50 border-red-500 text-red-700 font-bold opacity-100";

                      return (
                        <div key={oIdx} className={`p-4 rounded-xl border-2 flex items-center gap-3 ${variant}`}>
                          <span className="font-bold text-xs uppercase">{String.fromCharCode(65 + oIdx)}</span>
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Why this is correct:
                    </h4>
                    <p className="text-gray-700 leading-relaxed italic">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultDashboard;
