
import React, { useState } from 'react';
import { BoardType, ClassLevel, UserAccount } from '../types';

interface ProfileSetupProps {
  onComplete: (user: UserAccount) => void;
  initialEmail: string;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete, initialEmail }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<ClassLevel>('10');
  const [board, setBoard] = useState<BoardType>('CBSE');

  const classes: ClassLevel[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const boards: BoardType[] = ['CBSE', 'NCERT', 'ICSE', 'State Board'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onComplete({
      name: name.trim(),
      email: initialEmail,
      photo: `https://api.dicebear.com/7.x/initials/svg?seed=${name.trim()}&backgroundColor=6366f1`,
      grade,
      board,
      history: [],
      streak: 1,
      points: 0,
      lastActive: Date.now()
    });
  };

  return (
    <div className="max-w-lg mx-auto w-full px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white p-10 sm:p-14 rounded-[3.5rem] shadow-2xl border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        
        <h2 className="text-3xl font-black mb-2 text-slate-900 tracking-tight relative z-10">Complete Your Profile</h2>
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-10 relative z-10">Personalize your AI study engine</p>
        
        <form onSubmit={handleSubmit} className="space-y-8 text-left relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
            <input 
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
              className="w-full px-6 py-5 rounded-[1.5rem] bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 focus:bg-white font-bold text-slate-800 outline-none transition-all text-lg shadow-inner"
            />
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Select Your Academic Grade</label>
             <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {classes.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setGrade(c)}
                    className={`py-3 rounded-xl font-black text-sm transition-all border-2 ${
                      grade === c 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110' 
                      : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-indigo-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Select Your Education Board</label>
            <div className="grid grid-cols-2 gap-3">
              {boards.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBoard(b)}
                  className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${
                    board === b 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-indigo-100'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-indigo-200 hover:brightness-110 transition-all flex items-center justify-center gap-3 mt-6 active:scale-95"
          >
            Create Account
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
