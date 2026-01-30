
import React from 'react';
import { UserAccount } from '../types';

interface DashboardProps {
  user: UserAccount;
  funMode: boolean;
  onNewTest: () => void;
  onReset: () => void;
  onToggleFun: (val: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, funMode, onNewTest, onReset, onToggleFun }) => {
  const history = user.history || [];
  const totalTests = history.length;
  const avgScore = totalTests > 0 
    ? (history.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / totalTests * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto px-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl border-2 border-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
             <img src={user.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} className="w-full h-full object-cover" alt="Profile" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight truncate">{user.name}</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Class {user.grade} • {user.board} Scholar</p>
          </div>
          
          {/* Fun Mode Toggle */}
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className={`text-[10px] font-black uppercase tracking-widest ${funMode ? 'text-purple-600' : 'text-slate-400'}`}>Fun Mode</span>
            <button 
              onClick={() => onToggleFun(!funMode)}
              className={`w-12 h-6 rounded-full relative transition-all ${funMode ? 'bg-purple-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${funMode ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
        </div>
        <button 
          onClick={onNewTest}
          className="w-full md:w-auto bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          🚀 Start Study Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                  <span className="p-2 bg-indigo-600 rounded-xl text-xs">📈</span> Academic Performance
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Total Tests</p>
                    <p className="text-xl font-black text-white">{totalTests}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Avg Score</p>
                    <p className="text-xl font-black text-indigo-300">{avgScore}%</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Points</p>
                    <p className="text-xl font-black text-emerald-400">✨ {user.points}</p>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-300 font-medium">
                  {funMode ? "Don't let your memes be dreams. Keep studying!" : "Your academic journey is tracked for optimal performance."}
                </div>
             </div>
             <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black mb-6 text-slate-800">📜 Learning History</h3>
            <div className="space-y-3">
              {history.slice().reverse().map((res) => (
                <div key={res.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all">
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 text-sm truncate">{res.subject}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(res.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-black text-indigo-600">{res.score}/{res.total}</p>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="py-20 text-center text-slate-400 italic font-medium">No sessions logged yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black mb-6 text-slate-800">🔥 Daily Streak</h3>
            <div className="text-center py-10">
              <span className="text-7xl">🔥</span>
              <p className="text-4xl font-black mt-4 text-slate-900">{user.streak}</p>
              <p className="text-xs font-black text-orange-500 uppercase tracking-widest">Days Strong</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-3">Today's Insight</h4>
            <p className="text-sm font-medium leading-relaxed italic">
              "Mastering a subject requires 70% understanding and 30% consistent recall."
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-center pt-8">
        <button onClick={onReset} className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] hover:text-red-400 transition-colors py-2 px-4">
          Reset Profile
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
