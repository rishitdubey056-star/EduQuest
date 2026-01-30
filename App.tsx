
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import SetupWizard from './components/SetupWizard';
import QuizEngine from './components/QuizEngine';
import ResultDashboard from './components/ResultDashboard';
import FlashcardMode from './components/FlashcardMode';
import AITeacher from './components/AITeacher';
import Dashboard from './components/Dashboard';
import { generateQuiz, generateLecture } from './services/geminiService';
import { QuizConfig, Question, QuizResult, UserAccount, LectureData } from './types';

type ScreenState = 'auth' | 'dashboard' | 'setup' | 'loading' | 'quiz' | 'results' | 'lecture' | 'flashcards';

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('auth');
  const [user, setUser] = useState<UserAccount | null>(null);
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [lecture, setLecture] = useState<LectureData | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('eduquest_user');
    if (saved) {
      setUser(JSON.parse(saved));
      setScreen('dashboard');
    }
  }, []);

  const saveUser = (u: UserAccount) => {
    setUser(u);
    localStorage.setItem('eduquest_user', JSON.stringify(u));
  };

  const simulateGoogleLogin = () => {
    setIsLoggingIn(true);
    // Mimic real OAuth flow with immediate visual feedback
    const newUser: UserAccount = {
      name: "Student Scholar",
      email: "scholar@eduquest.ai",
      photo: `https://api.dicebear.com/7.x/pixel-art/svg?seed=Scholar`,
      grade: "10",
      board: "CBSE",
      history: [],
      streak: 1,
      points: 0,
      lastActive: Date.now()
    };
    
    setTimeout(() => {
      saveUser(newUser);
      setScreen('dashboard');
      setIsLoggingIn(false);
    }, 800);
  };

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
      console.error(error);
      alert("Education engine encountered an issue. Please check your connection.");
      setScreen('setup');
    }
  };

  const handleQuizFinish = (quizResult: Pick<QuizResult, 'score' | 'total' | 'answers' | 'questions'>) => {
    const finalResult: QuizResult = { 
      ...quizResult, 
      id: Date.now().toString(), 
      timestamp: Date.now(), 
      subject: quizConfig?.subject || 'Unknown', 
      difficulty: quizConfig?.difficulty || 'Intermediate' 
    };
    setResult(finalResult);
    if (user) {
      const updatedHistory = [...user.history, finalResult];
      const pointsAdded = quizResult.score * 10;
      saveUser({ ...user, history: updatedHistory, points: (user.points || 0) + pointsAdded, streak: (user.streak || 1) + 1 });
    }
    setScreen('results');
  };

  return (
    <Layout title="EduQuest AI">
      <div className="min-h-[75vh] flex flex-col justify-center py-4 sm:py-6">
        
        {screen === 'auth' && (
          <div className="max-w-md mx-auto w-full px-4">
            <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-2 bg-indigo-600"></div>
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-200">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black mb-2 text-indigo-900 tracking-tight">Advanced Study Hub</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-10">AI-Powered Educational Support</p>
              
              <button 
                onClick={simulateGoogleLogin}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-4 py-5 px-6 bg-white border-2 border-slate-100 rounded-2xl font-bold shadow-sm hover:border-indigo-200 hover:shadow-md transition-all text-slate-700 disabled:opacity-50"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="G" />
                <span className="text-lg">{isLoggingIn ? 'Logging in...' : 'Sign in with Google'}</span>
              </button>
              
              <p className="mt-8 text-xs text-gray-400 font-medium">No billing required. Free lifetime access for all students.</p>
            </div>
          </div>
        )}

        {screen === 'dashboard' && user && (
          <Dashboard user={user} onNewTest={() => setScreen('setup')} onReset={() => { localStorage.clear(); setScreen('auth'); }} />
        )}

        {screen === 'setup' && (
          <SetupWizard initialValues={user || {}} onStart={handleStartSession} />
        )}

        {screen === 'loading' && (
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-10">
              <div className="absolute inset-0 border-8 border-indigo-50 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 bg-indigo-50 rounded-full flex items-center justify-center font-black text-indigo-600">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-black text-indigo-900 mb-2">Preparing Content...</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Curating high-quality study materials</p>
          </div>
        )}

        {screen === 'quiz' && <QuizEngine questions={questions} onFinish={handleQuizFinish} />}

        {screen === 'flashcards' && lecture && (
          <FlashcardMode cards={lecture.flashcards} onFinish={() => setScreen('dashboard')} />
        )}

        {screen === 'lecture' && lecture && (
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-5 px-4">
            <div className="bg-white p-6 sm:p-12 rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
              <h1 className="text-3xl sm:text-5xl font-black text-indigo-900 mb-8 tracking-tight">{lecture.title}</h1>
              <div className="prose prose-lg sm:prose-indigo max-w-none text-gray-700 leading-relaxed mb-12 whitespace-pre-wrap">
                {lecture.content}
              </div>
              <div className="bg-slate-900 p-8 sm:p-10 rounded-3xl text-white shadow-2xl">
                <h3 className="text-lg font-black text-indigo-400 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">📝</span> 
                  Key Concepts
                </h3>
                <ul className="space-y-4">
                  {lecture.keyPoints.map((kp, i) => (
                    <li key={i} className="flex gap-4 group">
                      <span className="text-indigo-500 font-black text-xl leading-none">0{i+1}</span>
                      <p className="text-slate-300 font-medium group-hover:text-white transition-colors">{kp}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => setScreen('dashboard')} className="px-10 py-5 bg-white border-2 border-gray-100 rounded-2xl font-black text-gray-500 hover:bg-gray-50 transition-all">Exit to Dashboard</button>
              <button onClick={() => setScreen('flashcards')} className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 justify-center">
                Review Flashcards
              </button>
            </div>
          </div>
        )}

        {screen === 'results' && result && (
          <ResultDashboard result={result} onRetry={() => setScreen('dashboard')} />
        )}
      </div>

      <AITeacher />
    </Layout>
  );
};

export default App;
