
import React, { useState, useMemo, useEffect } from 'react';
import { BoardType, ClassLevel, QuizConfig, TestScope, Difficulty, UserAccount } from '../types';
import { getChaptersList } from '../services/geminiService';

interface SetupWizardProps {
  onStart: (config: QuizConfig, mode: 'quiz' | 'lecture' | 'flashcards') => void;
  initialValues?: Partial<UserAccount>;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onStart, initialValues }) => {
  // Initialize configuration state, pre-filling class and board from user account if provided
  const [config, setConfig] = useState<Partial<QuizConfig>>({
    classLevel: initialValues?.grade || '10',
    board: initialValues?.board || 'CBSE',
    subject: '',
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

  // Handle Subject initialization when class changes
  useEffect(() => {
    if (!subjects.includes(config.subject || '')) {
      setConfig(prev => ({ ...prev, subject: subjects[0] }));
    }
  }, [subjects, config.subject]);

  // Fetch chapters when Board, Class, or Subject changes
  useEffect(() => {
    let ignore = false;
    const fetchChapters = async () => {
      if (config.board && config.classLevel && config.subject) {
        setLoadingChapters(true);
        setAvailableChapters([]); 
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
      }
    };
    fetchChapters();
    return () => { ignore = true; };
  }, [config.board, config.classLevel, config.subject]);

  const difficulties: Difficulty[] = ['Easy', 'Intermediate', 'Advanced', 'Expert'];

  const handleAction = (mode: 'quiz' | 'lecture' | 'flashcards') => {
    if (!config.subject) {
      alert("Please select a subject.");
      return;
    }
    if (config.scope === 'Chapter' && !config.chapter) {
      alert("Please select a chapter.");
      return;
    }
    onStart(config as QuizConfig, mode);
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-2 sm:px-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-700 p-8 sm:p-10 text-white">
          <h2 className="text-3xl font-black mb-2">Study Portal</h2>
          <p className="opacity-80 text-sm font-medium">Step-by-step session configuration.</p>
        </div>

        <div className="p-6 sm:p-10 space-y-8">
          {/* Step 1 & 2: Class and Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Step 1: Select Class</label>
              <select 
                value={config.classLevel}
                onChange={(e) => setConfig({...config, classLevel: e.target.value as ClassLevel})}
                className="w-full px-4 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 font-bold text-gray-700 outline-none transition-all"
              >
                {classes.map(c => <option key={c} value={c}>Grade {c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Step 2: Select Board</label>
              <div className="grid grid-cols-2 gap-2">
                {boards.map(b => (
                  <button
                    key={b}
                    onClick={() => setConfig({...config, board: b})}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                      config.board === b ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3 & 4: Subject and Scope */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Step 3: Select Subject</label>
              <select 
                value={config.subject}
                onChange={(e) => setConfig({...config, subject: e.target.value})}
                className="w-full px-4 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 font-bold text-gray-700 outline-none transition-all"
              >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Step 4: Chapter or Full Book</label>
              <select 
                disabled={loadingChapters}
                value={config.scope === 'Full Book' ? 'FULL_BOOK' : config.chapter}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'FULL_BOOK') setConfig({...config, scope: 'Full Book', chapter: ''});
                  else setConfig({...config, scope: 'Chapter', chapter: val});
                }}
                className={`w-full px-4 py-4 rounded-2xl border-2 transition-all font-bold ${
                  loadingChapters ? 'bg-gray-100 border-gray-100 text-gray-400' : 'bg-gray-50 border-gray-100 focus:border-indigo-500 text-gray-700'
                }`}
              >
                <option value="FULL_BOOK">Entire Book Test</option>
                {!loadingChapters && availableChapters.map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 5 & 6: Q Count and Refresher */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Step 5: Question Count</label>
              <input 
                type="number"
                min="5"
                max="50"
                value={config.numQuestions}
                onChange={(e) => setConfig({...config, numQuestions: parseInt(e.target.value) || 5})}
                className="w-full px-4 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 font-bold text-gray-700 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Step 6: Refresher Questions?</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setConfig({...config, useRefresher: true})}
                  className={`flex-1 py-4 rounded-xl font-bold transition-all border-2 ${config.useRefresher ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-100 text-gray-500'}`}
                >
                  Yes
                </button>
                <button 
                  onClick={() => setConfig({...config, useRefresher: false})}
                  className={`flex-1 py-4 rounded-xl font-bold transition-all border-2 ${!config.useRefresher ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-100 text-gray-500'}`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          {/* Step 7: Difficulty */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Difficulty</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {difficulties.map(d => (
                <button
                  key={d}
                  onClick={() => setConfig({ ...config, difficulty: d })}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                    config.difficulty === d ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-500'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 gap-4 pt-6">
            <button 
              onClick={() => handleAction('quiz')}
              className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              🚀 Start MCQ Test
            </button>
            <div className="flex gap-3">
              <button 
                onClick={() => handleAction('lecture')}
                className="flex-1 py-4 bg-white border-2 border-indigo-600 text-indigo-600 rounded-2xl font-black hover:bg-indigo-50 transition-all"
              >
                📖 Study Lecture
              </button>
              <button 
                onClick={() => handleAction('flashcards')}
                className="flex-1 py-4 bg-purple-100 text-purple-700 rounded-2xl font-black hover:bg-purple-200 transition-all"
              >
                🃏 Flashcards
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
