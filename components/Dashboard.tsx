
import React from 'react';
import { UserAccount, QuizResult } from '../types';

interface DashboardProps {
  user: UserAccount;
  onNewTest: () => void;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNewTest, onReset }) => {
  const history = user.history || [];
  const totalTests = history.length;
  const avgScore = totalTests > 0 
    ? (history.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / totalTests * 100).toFixed(1)
    : 0;

  const topicStats: Record<string, { correct: number, total: number }> = {};
  history.forEach(res => {
    res.questions.forEach((q, idx) => {
      const isCorrect = res.answers[idx]?.isCorrect;
      if (!topicStats[q.topic]) topicStats[q.topic] = { correct: 0, total: 0 };
      topicStats[q.topic].total += 1;
      if (isCorrect) topicStats[q.topic].correct += 1;
    });
  });

  const flaws = Object.entries(topicStats)
    .map(([name, stat]) => ({ name, accuracy: (stat.correct / stat.total) * 100 }))
    .filter(f => f.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto px-1">
      {/* Welcome Header */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl border-2 border-indigo-100 flex items-center justify-center overflow-hidden">
             <img src={user.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} className="w-full h-full object-cover" alt="Profile" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">Welcome, {user.name}</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Class {user.grade} • {user.board} Syllabus</p>
          </div>
        </div>
        <button 
          onClick={onNewTest}
          className="w-full md:w-auto bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
        >
          <span className="text-xl">📚</span> Start Studying Now
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Overview */}
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                  <span className="p-2 bg-indigo-600 rounded-xl text-xs">📈</span> Your Learning Journey
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Sessions</p>
                    <p className="text-xl font-black text-white">{totalTests}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Avg Accuracy</p>
                    <p className="text-xl font-black text-indigo-300">{avgScore}%</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Study Streak</p>
                    <p className="text-xl font-black text-orange-400">🔥 {user.streak}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed italic border-l-2 border-indigo-500 pl-4">
                  "Success is the sum of small efforts, repeated day in and day out."
                </p>
             </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black mb-6 text-slate-800 flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">📜</span> Recent Activity
            </h3>
            <div className="space-y-3">
              {history.slice().reverse().map((res) => (
                <div key={res.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all">
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 text-sm truncate">{res.subject}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(res.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-black text-indigo-600">{res.score}/{res.total}</p>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[9px] font-black rounded-full uppercase">{res.difficulty}</span>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-slate-400 text-sm italic font-medium">No activity yet. Click 'Start Studying' to begin.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-slate-800">
              <span className="p-2 bg-amber-100 text-amber-600 rounded-xl text-xs">🔍</span> Needs Review
            </h3>
            {flaws.length > 0 ? (
              <div className="space-y-6">
                {flaws.map(f => (
                  <div key={f.name}>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-widest text-slate-400">
                      <span className="truncate mr-2">{f.name}</span>
                      <span className="text-amber-600">{f.accuracy.toFixed(0)}% accuracy</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full transition-all duration-1000" style={{ width: `${f.accuracy}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="text-4xl mb-4">⭐</div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Excellent Mastery!</p>
              </div>
            )}
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
            <h4 className="text-sm font-black uppercase tracking-widest text-indigo-200 mb-4">Pro Tip</h4>
            <p className="text-sm leading-relaxed font-medium">
              Use the **Flashcards** mode after every lecture for 3x better memory retention.
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-center pt-8">
        <button onClick={onReset} className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] hover:text-red-400 transition-colors">
          Sign Out & Reset
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
