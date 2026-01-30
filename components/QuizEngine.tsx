
import React, { useState } from 'react';
import { Question, UserAnswer, QuizResult } from '../types';

interface QuizEngineProps {
  questions: Question[];
  // Fix: QuizEngine only provides the core quiz outcome data; metadata is handled in App.tsx
  onFinish: (result: Pick<QuizResult, 'score' | 'total' | 'answers' | 'questions'>) => void;
}

const QuizEngine: React.FC<QuizEngineProps> = ({ questions, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleNext = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOption,
      isCorrect
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setSelectedOption(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate score
      const score = updatedAnswers.filter(a => a.isCorrect).length;
      onFinish({
        score,
        total: questions.length,
        answers: updatedAnswers,
        questions
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</p>
            <h3 className="text-gray-500 text-sm font-medium">{currentQuestion.topic}</h3>
          </div>
          <span className="text-2xl font-black text-indigo-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-600 h-full transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 min-h-[400px] flex flex-col">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-tight">
            {currentQuestion.question}
          </h2>

          <div className="grid gap-4">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`p-5 rounded-2xl text-left border-2 transition-all group relative overflow-hidden ${
                  selectedOption === idx 
                    ? 'border-indigo-600 bg-indigo-50 shadow-md ring-1 ring-indigo-600' 
                    : 'border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${
                    selectedOption === idx ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className={`text-lg font-medium ${selectedOption === idx ? 'text-indigo-900' : 'text-gray-700'}`}>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <button
            onClick={handleNext}
            disabled={selectedOption === null}
            className={`px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center gap-3 ${
              selectedOption === null 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'
            }`}
          >
            {currentIndex === questions.length - 1 ? 'Finish Test' : 'Next Question'}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizEngine;
