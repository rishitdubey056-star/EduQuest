
import React, { useState } from 'react';
import { Flashcard } from '../types';

interface FlashcardModeProps {
  cards: Flashcard[];
  onFinish: () => void;
}

const FlashcardMode: React.FC<FlashcardModeProps> = ({ cards, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  if (!card) return null;

  return (
    <div className="max-w-xl mx-auto w-full px-4">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-black text-indigo-900 mb-1">Topper's Recall</h2>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Card {currentIndex + 1} of {cards.length}</p>
      </div>

      <div 
        className="relative w-full aspect-[4/3] cursor-pointer perspective-1000 group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-3xl shadow-2xl border-4 border-indigo-50 flex items-center justify-center p-8 text-center backface-hidden">
            <p className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">{card.front}</p>
            <div className="absolute bottom-6 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Click to Flip</div>
          </div>
          
          {/* Back */}
          <div className="absolute inset-0 w-full h-full bg-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center p-8 text-center rotate-y-180 backface-hidden">
            <div className="text-white">
              <p className="text-lg sm:text-xl font-medium leading-relaxed">{card.back}</p>
              {card.hint && <p className="mt-4 text-xs font-bold text-indigo-200 uppercase tracking-widest italic opacity-70">Hint: {card.hint}</p>}
            </div>
            <div className="absolute bottom-6 text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Concept Mastered</div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-12 gap-4">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-400 disabled:opacity-20 hover:bg-gray-50 transition-all"
        >
          Previous
        </button>
        <button 
          onClick={handleNext}
          className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          {currentIndex === cards.length - 1 ? 'Finish Set' : 'Next Card'}
        </button>
      </div>
    </div>
  );
};

export default FlashcardMode;
