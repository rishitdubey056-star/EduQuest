
import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { dataService, LeaderboardEntry } from '../services/dataService';

interface LeaderboardProps {
  user: UserAccount;
  onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ user, onClose }) => {
  // Fix: dataService.getLeaderboard() returns a Promise, so we must use state and useEffect 
  // instead of useMemo to resolve and store the participants list.
  const [participants, setParticipants] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchLeaderboard = async () => {
      try {
        const data = await dataService.getLeaderboard();
        if (isMounted) {
          setParticipants(data);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard data", error);
      }
    };
    fetchLeaderboard();
    return () => { isMounted = false; };
  }, [user.points]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-[0_0_100px_rgba(99,102,241,0.2)] overflow-hidden border border-white/20 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
          {/* Decorative background blobs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full -ml-12 -mb-12 blur-2xl"></div>
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="relative z-10 text-center">
            <h2 className="text-3xl font-black mb-1 tracking-tight">Leaderboard</h2>
            <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.3em]">Realtime Rankings</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {participants.map((p, idx) => (
            <div 
              key={p.name + idx} 
              className={`flex items-center gap-4 p-5 rounded-[2rem] transition-all relative overflow-hidden ${
                p.isUser 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-200 scale-[1.03] ring-4 ring-white' 
                  : 'bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all'
              }`}
            >
              <div className={`w-8 font-black text-xl flex items-center justify-center ${p.isUser ? 'text-white' : 'text-slate-400'}`}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
              </div>
              
              <div className="relative">
                <img 
                  src={p.photo} 
                  className={`w-14 h-14 rounded-2xl border-2 object-cover ${p.isUser ? 'border-indigo-400 bg-indigo-500' : 'border-white bg-slate-200'}`} 
                  alt={p.name} 
                />
                {p.isUser && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-black truncate text-lg ${p.isUser ? 'text-white' : 'text-slate-800'}`}>
                  {p.name} {p.isUser && '(You)'}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                    p.isUser ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    Grade {p.grade}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-xl font-black ${p.isUser ? 'text-white' : 'text-indigo-600'}`}>
                  {p.points}
                </p>
                <p className={`text-[8px] font-black uppercase tracking-widest ${p.isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                  Pts
                </p>
              </div>
            </div>
          ))}
          {participants.length === 0 && (
            <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Fetching latest rankings...
            </div>
          )}
        </div>
        
        <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-400 leading-relaxed max-w-[200px] mx-auto">
            Score higher in tests to climb up the leaderboard!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
