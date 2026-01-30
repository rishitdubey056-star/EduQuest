
import React, { useState, useEffect } from 'react';
import { Flashcard } from '../types';
import { srsService } from '../services/srsService';

interface FlashcardModeProps {
  cards: Flashcard[];
  onFinish: () => void;
}

const FlashcardMode: React.FC<FlashcardModeProps> = ({ cards, onFinish }) => {
  const [sessionQueue, setSessionQueue] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setSessionQueue([...cards]);
  }, [cards]);

  const currentCard = sessionQueue[currentIndex];

  const handleMastered = () => {
    if (!currentCard) return;
    srsService.recordReview(currentCard.front, true);
    proceed();
  };

  const handleSkip = () => {
    if (!currentCard) return;
    srsService.recordReview(currentCard.front, false);
    const updatedQueue = [...sessionQueue, currentCard];
    setSessionQueue(updatedQueue);
    proceed();
  };

  const proceed = () => {
    setIsFlipped(false);
    if (currentIndex < sessionQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!currentCard) return null;

  const masteryData = srsService.getCardMastery(currentCard.front);
  const totalInSession = sessionQueue.length;
  const progressPercentage = (currentIndex / totalInSession) * 100;

  return (
    <div className="max-w-xl mx-auto w-full px-4 py-4 sm:py-8 animate-in fade-in duration-500">
      {/* Session Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full mb-6 border-2 border-indigo-100 shadow-sm">
          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span>
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">
            Active Study Session
          </span>
        </div>
        
        <div className="flex items-center justify-between px-2 mb-3">
           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
             Card {currentIndex + 1} / {totalInSession}
           </span>
           <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">
             {Math.round(progressPercentage)}% Complete
           </span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700 ease-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Mastery Badge */}
      <div className="flex justify-center mb-6">
        <div className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all shadow-sm ${
          masteryData.level === 0 ? 'bg-slate-50 text-slate-500 border-slate-200' :
          masteryData.level < 3 ? 'bg-amber-50 text-amber-600 border-amber-200' :
          'bg-emerald-50 text-emerald-600 border-emerald-200'
        }`}>
          {masteryData.level === 0 ? '✨ New Discovery' : 
           masteryData.level < 3 ? `🎯 Learning Progress: Lvl ${masteryData.level}` : 
           '🏆 Mastered Concept'}
        </div>
      </div>

      {/* Card Visual */}
      <div 
        className="relative w-full aspect-[4/3.5] cursor-pointer perspective-2000 group mb-10"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-[3.5rem] shadow-2xl border-2 border-slate-100 flex flex-col items-center justify-center p-8 sm:p-14 text-center backface-hidden overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-40 blur-3xl"></div>
            <div className="relative z-10">
              <span className="block text-6xl mb-10 filter drop-shadow-xl animate-bounce">🧐</span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight px-4">{currentCard.front}</p>
            </div>
            <div className="absolute bottom-12 left-0 w-full text-[11px] font-black text-indigo-400 uppercase tracking-[0.5em] flex items-center justify-center gap-4 opacity-70">
              <span className="w-12 h-[2px] bg-indigo-100"></span>
              TAP TO REVEAL
              <span className="w-12 h-[2px] bg-indigo-100"></span>
            </div>
          </div>
          
          {/* Back */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-700 to-purple-800 rounded-[3.5rem] shadow-2xl flex flex-col items-center justify-center p-8 sm:p-14 text-center rotate-y-180 backface-hidden overflow-hidden border-4 border-indigo-400/20">
             <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full -ml-40 -mb-40 opacity-30 blur-3xl"></div>
            <div className="relative z-10 text-white">
              <span className="block text-6xl mb-10 filter drop-shadow-lg">💡</span>
              <p className="text-xl sm:text-2xl font-bold leading-relaxed px-2">{currentCard.back}</p>
              {currentCard.hint && (
                <div className="mt-8 p-6 bg-black/20 rounded-[2.5rem] border border-white/10 backdrop-blur-md shadow-inner">
                   <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-2 opacity-90 underline underline-offset-8">Quick Tip</p>
                   <p className="text-[15px] font-semibold italic text-indigo-50 leading-relaxed">{currentCard.hint}</p>
                </div>
              )}
            </div>
            <div className="absolute bottom-12 left-0 w-full text-[11px] font-black text-white/40 uppercase tracking-[0.5em] flex items-center justify-center gap-4">
              <span className="w-12 h-[2px] bg-white/10"></span>
              RECALL COMPLETE
              <span className="w-12 h-[2px] bg-white/10"></span>
            </div>
          </div>
        </div>
      </div>

      {/* SRS Controls */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-5 h-24">
          <button 
            onClick={handleSkip}
            className="group flex flex-col items-center justify-center bg-white border-4 border-slate-100 text-slate-500 rounded-[2.5rem] font-black transition-all hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 shadow-lg active:scale-95"
          >
            <span className="text-sm uppercase tracking-widest">Hard / Redo</span>
            <span className="text-[10px] opacity-60 uppercase mt-1 font-bold">Try again soon</span>
          </button>

          <button 
            onClick={handleMastered}
            className="group flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-[2.5rem] font-black transition-all hover:brightness-110 shadow-xl shadow-indigo-200 active:scale-95"
          >
            <span className="text-sm uppercase tracking-widest">Mastered!</span>
            <span className="text-[10px] text-indigo-200 uppercase mt-1 font-bold">Save Progress</span>
          </button>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center px-4 pt-6 border-t border-slate-100">
           <button 
             onClick={handlePrev}
             disabled={currentIndex === 0}
             className="px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-[11px] font-black text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-0 transition-all uppercase tracking-widest flex items-center gap-3 shadow-sm active:scale-95"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
             Previous
           </button>

           <div className="flex gap-1.5 bg-slate-100 p-2 rounded-full px-4 border border-slate-200">
             {sessionQueue.slice(0, 8).map((_, i) => (
               <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i === currentIndex % 8 ? 'bg-indigo-600 w-6' : 'bg-slate-300'}`}></div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardMode;
