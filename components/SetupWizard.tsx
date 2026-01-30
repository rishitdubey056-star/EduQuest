
import React, { useState, useMemo, useEffect } from 'react';
import { BoardType, ClassLevel, QuizConfig, TestScope, Difficulty } from '../types';
import { getChaptersList } from '../services/geminiService';

interface SetupWizardProps {
  onStart: (config: QuizConfig, mode: 'quiz' | 'lecture' | 'flashcards') => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onStart }) => {
  const [config, setConfig] = useState<Partial<QuizConfig>>({
    classLevel: '10',
    board: 'CBSE',
    subject: 'English',
    scope: 'Chapter',
    chapter: '',
    numQuestions: 10,
    useRefresher: false,
    difficulty: 'Intermediate'
  });

  const [availableChapters, setAvailableChapters] = useState<string[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);

  const boards: BoardType[] = ['CBSE', 'NCERT', 'ICSE', 'State Board'];
  const classes: ClassLevel[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const subjects = useMemo(() => {
    const common = ['English', 'Hindi', 'Mathematics'];
    const grade = parseInt(config.classLevel || '10');
    if (grade <= 5) return [...common, 'Environmental Science (EVS)'];
    if (grade <= 10) return [...common, 'Science', 'Social Science', 'Sanskrit', 'Computer Applications'];
    return [
      ...common, 'Physics', 'Chemistry', 'Biology', 
      'History', 'Geography', 'Political Science', 'Economics', 
      'Business Studies', 'Accountancy', 'Computer Science'
    ];
  }, [config.classLevel]);

  useEffect(() => {
    if (!subjects.includes(config.subject || '')) {
      setConfig(prev => ({ ...prev, subject: subjects[0] }));
    }
  }, [subjects, config.subject]);

  useEffect(() => {
    let ignore = false;
    const fetchChapters = async () => {
      if (config.board && config.classLevel && config.subject) {
        setLoadingChapters(true);
        setAvailableChapters([]); 
        try {
          const list = await getChaptersList(config.board, config.classLevel, config.subject);
          if (!ignore) {
            setAvailableChapters(list);
            setLoadingChapters(false);
            if (list.length > 0) {
              setConfig(prev => ({ ...prev, chapter: list[0], scope: 'Chapter' }));
            } else {
              setConfig(prev => ({ ...prev, chapter: '', scope: 'Full Book' }));
            }
          }
        } catch (e) {
          if (!ignore) setLoadingChapters(false);
        }
      }
    };
    fetchChapters();
    return () => { ignore = true; };
  }, [config.board, config.classLevel, config.subject]);

  const handleAction = (mode: 'quiz' | 'lecture' | 'flashcards') => {
    if (!config.subject) { alert("Please select a subject."); return; }
    if (config.scope === 'Chapter' && !config.chapter) { alert("Please select a chapter."); return; }
    onStart(config as QuizConfig, mode);
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 mb-20 animate-in fade-in slide-in-up duration-700">
      <div className="bg-white rounded-[3rem] sm:rounded-[4rem] shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header Gradient matching screenshot */}
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 p-10 sm:p-20 text-white relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-[100px]"></div>
          <div className="relative z-10">
            <h2 className="text-5xl sm:text-7xl font-black mb-4 tracking-tighter">Study Portal</h2>
            <p className="opacity-90 text-[11px] font-black uppercase tracking-[0.4em] ml-1">Configure Your Intelligence Engine</p>
          </div>
        </div>

        <div className="p-8 sm:p-20 space-y-16 text-left">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
            <div className="space-y-6">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade Level</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {classes.map(c => (
                  <button
                    key={c}
                    onClick={() => setConfig({...config, classLevel: c})}
                    className={`py-4 rounded-2xl text-base font-black transition-all border-2 ${
                      config.classLevel === c 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-100 scale-110 z-10' 
                      : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200 active:scale-95'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Education Board</label>
              <div className="grid grid-cols-2 gap-4">
                {boards.map(b => (
                  <button
                    key={b}
                    onClick={() => setConfig({...config, board: b})}
                    className={`py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border-2 ${
                      config.board === b 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-100 scale-105 z-10' 
                      : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200 active:scale-95'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
              <div className="relative group">
                <select 
                  value={config.subject}
                  onChange={(e) => setConfig({...config, subject: e.target.value})}
                  className="w-full px-8 py-6 rounded-[2rem] bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:bg-white font-black text-slate-700 outline-none transition-all shadow-inner appearance-none relative z-10"
                >
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth={3} /></svg>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Topic Scope</label>
              <div className="relative group">
                <select 
                  disabled={loadingChapters}
                  value={config.scope === 'Full Book' ? 'FULL_BOOK' : config.chapter}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'FULL_BOOK') setConfig({...config, scope: 'Full Book', chapter: ''});
                    else setConfig({...config, scope: 'Chapter', chapter: val});
                  }}
                  className={`w-full px-8 py-6 rounded-[2rem] border-2 transition-all font-black shadow-inner appearance-none relative z-10 ${
                    loadingChapters ? 'bg-slate-100 border-slate-100 text-slate-300' : 'bg-slate-50 border-slate-100 focus:border-indigo-500 focus:bg-white text-slate-700'
                  }`}
                >
                  <option value="FULL_BOOK">Entire Book Curriculum</option>
                  {!loadingChapters && availableChapters.map(ch => (
                    <option key={ch} value={ch}>{ch}</option>
                  ))}
                </select>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth={3} /></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Questions Count</label>
              <div className="relative">
                <input 
                  type="number" min="5" max="50"
                  value={config.numQuestions}
                  onChange={(e) => setConfig({...config, numQuestions: parseInt(e.target.value) || 5})}
                  className="w-full px-8 py-6 rounded-[2rem] bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:bg-white font-black text-slate-700 shadow-inner"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Concept Refresher</label>
              <div className="flex gap-4 h-[72px]">
                {[true, false].map(val => (
                  <button 
                    key={val ? 'Y' : 'N'}
                    onClick={() => setConfig({...config, useRefresher: val})}
                    className={`flex-1 rounded-[1.75rem] font-black text-xs uppercase tracking-[0.25em] border-2 transition-all ${
                      config.useRefresher === val 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-100 scale-105' 
                      : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {val ? 'Active' : 'Off'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-12 space-y-6 border-t border-slate-50">
            <button 
              onClick={() => handleAction('quiz')}
              className="group w-full py-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[2.5rem] font-black text-2xl shadow-[0_25px_80px_-15px_rgba(219,39,119,0.4)] hover:brightness-110 active:scale-[0.97] transition-all flex items-center justify-center gap-5"
            >
              <span>🚀 Launch MCQ Test</span>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" /></svg>
              </div>
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => handleAction('lecture')} className="py-6 bg-white border-2 border-slate-100 text-slate-800 rounded-[2rem] font-black text-base hover:bg-slate-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-slate-100/50">
                <span>📖 Study Theory</span>
              </button>
              <button onClick={() => handleAction('flashcards')} className="py-6 bg-white border-2 border-slate-100 text-slate-800 rounded-[2rem] font-black text-base hover:bg-slate-50 hover:border-purple-300 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-slate-100/50">
                <span>🃏 Flashcards</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
