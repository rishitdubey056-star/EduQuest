
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  funMode?: boolean;
  onToggleFun?: (val: boolean) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, title = "EduQuest AI", funMode, onToggleFun }) => {
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${funMode ? 'bg-purple-50/30' : 'bg-slate-50'}`}>
      <header className="sticky top-0 z-40 glass-morphism border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg text-white shadow-lg transition-all duration-500 ${funMode ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-purple-200' : 'bg-indigo-600 shadow-indigo-200'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className={`text-lg sm:text-xl font-black bg-clip-text text-transparent transition-all duration-500 bg-gradient-to-r ${funMode ? 'from-purple-600 to-pink-600' : 'from-indigo-600 to-purple-600'}`}>
              {title}
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            {onToggleFun !== undefined && (
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${funMode ? 'text-purple-600' : 'text-slate-400'}`}>
                  {funMode ? 'Fun Mode' : 'Serious Mode'}
                </span>
                <button 
                  onClick={() => onToggleFun(!funMode)}
                  className={`w-11 h-6 rounded-full relative transition-all duration-300 ring-4 ring-white shadow-sm ${funMode ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${funMode ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>
            )}
            <div className="hidden md:block">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-l border-slate-200 pl-6 h-full flex items-center">Official Curriculum Engine</span>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-gray-400 text-[10px] sm:text-xs uppercase tracking-widest">
        &copy; {new Date().getFullYear()} EduQuest AI • Built for Excellence
      </footer>
    </div>
  );
};

export default Layout;
