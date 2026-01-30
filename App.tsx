
import React, { useState } from 'react';
import Layout from './components/Layout';
import SetupWizard from './components/SetupWizard';
import QuizEngine from './components/QuizEngine';
import ResultDashboard from './components/ResultDashboard';
import FlashcardMode from './components/FlashcardMode';
import AITeacher from './components/AITeacher';
import { generateQuiz, generateLecture } from './services/geminiService';
import { QuizConfig, Question, QuizResult, LectureData } from './types';

type ScreenState = 'setup' | 'loading' | 'quiz' | 'results' | 'lecture' | 'flashcards';

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('setup');
  const [funMode, setFunMode] = useState(false);
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [lecture, setLecture] = useState<LectureData | null>(null);

  const handleStartSession = async (config: QuizConfig, mode: 'quiz' | 'lecture' | 'flashcards') => {
    setQuizConfig(config);
    setScreen('loading');
    try {
      if (mode === 'quiz') {
        const generated = await generateQuiz(config);
        setQuestions(generated);
        setScreen('quiz');
      } else {
        const lectureData = await generateLecture(config.subject, config.chapter || 'Overview', config.classLevel);
        setLecture(lectureData);
        setScreen(mode);
      }
    } catch (error) {
      alert("Error generating content. Check your API key or connection.");
      setScreen('setup');
    }
  };

  const handleQuizFinish = (quizResult: Pick<QuizResult, 'score' | 'total' | 'answers' | 'questions'>) => {
    const finalResult: QuizResult = { 
      ...quizResult, 
      id: Date.now().toString(), 
      timestamp: Date.now(), 
      subject: quizConfig?.subject || 'Assessment', 
      difficulty: quizConfig?.difficulty || 'Intermediate' 
    };
    setResult(finalResult);
    setScreen('results');
  };

  return (
    <Layout 
      title="EduQuest AI" 
      funMode={funMode} 
      onToggleFun={setFunMode}
    >
      <div className="min-h-[80vh] flex flex-col justify-center py-6">
        
        {screen === 'setup' && (
          <SetupWizard onStart={handleStartSession} />
        )}

        {screen === 'loading' && (
          <div className="text-center animate-pulse">
            <div className="w-24 h-24 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-8 shadow-xl shadow-indigo-100"></div>
            <h2 className="text-3xl font-black text-slate-900">Theo AI is Analyzing...</h2>
            <p className="mt-2 text-slate-400 font-bold uppercase tracking-widest text-xs">Crafting your personalized study session</p>
          </div>
        )}

        {screen === 'quiz' && (
          <QuizEngine 
            questions={questions} 
            funMode={funMode} 
            onFinish={handleQuizFinish} 
          />
        )}

        {screen === 'flashcards' && lecture && (
          <FlashcardMode 
            cards={lecture.flashcards} 
            onFinish={() => setScreen('setup')} 
          />
        )}

        {screen === 'lecture' && lecture && (
          <div className="max-w-4xl mx-auto p-8 sm:p-12 bg-white rounded-[3rem] shadow-2xl border border-slate-50 animate-in fade-in slide-in-from-bottom-6">
            <h1 className="text-4xl font-black mb-10 text-slate-900 leading-tight">{lecture.title}</h1>
            <div className="prose prose-xl prose-slate max-w-none text-slate-600 mb-12 leading-relaxed whitespace-pre-wrap">
              {lecture.content}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setScreen('setup')} 
                className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
              >
                Exit Session
              </button>
              <button 
                onClick={() => setScreen('flashcards')} 
                className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                Review Flashcards
              </button>
            </div>
          </div>
        )}

        {screen === 'results' && result && (
          <ResultDashboard 
            result={result} 
            onRetry={() => setScreen('setup')} 
          />
        )}
      </div>

      <AITeacher funMode={funMode} />
    </Layout>
  );
};

export default App;
