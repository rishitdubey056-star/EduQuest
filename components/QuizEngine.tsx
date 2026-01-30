
import React, { useState, useEffect } from 'react';
import { Question, UserAnswer, QuizResult } from '../types';
import { speakText, stopSpeech } from '../services/geminiService';

interface QuizEngineProps {
  questions: Question[];
  funMode: boolean;
  onFinish: (result: Pick<QuizResult, 'score' | 'total' | 'answers' | 'questions'>) => void;
}

// IDs from the standardized list in geminiService
const CORRECT_MEMES = [
  "https://i.giphy.com/l0HlIDlD46A6kS7tG.gif",
  "https://i.giphy.com/26ufgSwMRcg9V01K8.gif",
  "https://i.giphy.com/3o7TKSjPqcK9Uj77W0.gif"
];

const WRONG_MEMES = [
  "https://i.giphy.com/hEc4k5T8C96G4.gif",
  "https://i.giphy.com/vKHKDIdSW9OmI.gif",
  "https://i.giphy.com/l41lSLzuBA7LsqX8Q.gif"
];

const QuizEngine: React.FC<QuizEngineProps> = ({ questions, funMode, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentMeme, setCurrentMeme] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  useEffect(() => {
    stopSpeech();
    setIsSpeaking(false);
  }, [currentIndex]);

  const handleSpeak = async () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    try {
      await speakText(currentQuestion.question);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsSpeaking(false), 5000); 
    }
  };

  const handleNext = () => {
    if (selectedOption === null || isProcessing) return;

    setIsProcessing(true);
    stopSpeech();

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOption,
      isCorrect
    };

    if (funMode) {
      const memes = isCorrect ? CORRECT_MEMES : WRONG_MEMES;
      setCurrentMeme(memes[Math.floor(Math.random() * memes.length)]);
      setShowFeedback(true);
      
      setTimeout(() => {
        setShowFeedback(false);
        proceed(newAnswer);
      }, 2500);
    } else {
      proceed(newAnswer);
    }
  };

  const proceed = (newAnswer: UserAnswer) => {
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setSelectedOption(null);
    setIsProcessing(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
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
    <div className="max-w-3xl mx-auto px-4 relative">
      {/* Meme Feedback Overlay */}
      {showFeedback && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in">
          <div className="text-center p-8 animate-in zoom-in max-w-lg w-full">
            <h4 className={`text-4xl sm:text-6xl font-black mb-8 tracking-tighter drop-shadow-lg ${CORRECT_MEMES.includes(currentMeme) ? 'text-emerald-400' : 'text-rose-500'}`}>
              {CORRECT_MEMES.includes(currentMeme) ? 'GENIUS!' : 'OOF!'}
            </h4>
            <div className="rounded-[3rem] overflow-hidden border-8 border-white/10 shadow-[0_0_80px_rgba(255,255,255,0.1)] bg-slate-900">
              <img 
                src={currentMeme} 
                className="w-full h-auto object-cover min-h-[300px]" 
                alt="AI Feedback Meme" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://i.giphy.com/3o7TKSjPqcK9Uj77W0.gif";
                }}
              />
            </div>
            <p className="mt-8 text-white/50 font-black uppercase tracking-[0.3em] text-[11px]">Analyzing response accuracy...</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</p>
            <h3 className="text-gray-400 text-xs font-black uppercase tracking-tighter">{currentQuestion.topic}</h3>
          </div>
          <span className="text-2xl font-black text-indigo-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-indigo-50 h-3 rounded-full overflow-hidden border border-indigo-100">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-700 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-2xl p-6 sm:p-12 border border-slate-100 min-h-[480px] flex flex-col relative overflow-hidden animate-in slide-in-up">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-30"></div>
        
        <div className="flex-1 relative z-10">
          <div className="flex items-start justify-between gap-6 mb-10">
            <h2 className="text-xl sm:text-3xl font-black text-slate-800 leading-tight">
              {currentQuestion.question}
            </h2>
            <button 
              onClick={handleSpeak}
              className={`p-4 rounded-2xl transition-all flex-shrink-0 shadow-lg ${
                isSpeaking 
                ? 'bg-indigo-600 text-white scale-110 shadow-indigo-200' 
                : 'bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50 hover:scale-105 active:scale-95'
              }`}
              title="Toggle Question Voice"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${isSpeaking ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>

          <div className="grid gap-4">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                disabled={isProcessing}
                onClick={() => setSelectedOption(idx)}
                className={`p-6 rounded-[1.75rem] text-left border-2 transition-all group relative overflow-hidden ${
                  selectedOption === idx 
                    ? 'border-indigo-600 bg-indigo-50 shadow-xl shadow-indigo-100/50' 
                    : 'border-slate-50 bg-slate-50 hover:border-indigo-100 hover:bg-white hover:shadow-lg hover:shadow-slate-100'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-5 relative z-10">
                  <span className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm transition-all ${
                    selectedOption === idx 
                    ? 'bg-indigo-600 text-white rotate-6' 
                    : 'bg-white border border-slate-200 text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className={`text-lg font-bold ${selectedOption === idx ? 'text-indigo-900' : 'text-slate-600'}`}>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-end relative z-10">
          <button
            onClick={handleNext}
            disabled={selectedOption === null || isProcessing}
            className={`w-full sm:w-auto px-12 py-6 rounded-[1.5rem] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
              selectedOption === null || isProcessing
                ? 'bg-slate-100 text-slate-300 shadow-none' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-200 hover:brightness-110 hover:-translate-y-1'
            }`}
          >
            {isProcessing ? 'Checking...' : (currentIndex === questions.length - 1 ? 'Finish Assessment' : 'Check Answer')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizEngine;
