
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = "EduQuest AI" }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-40 glass-morphism border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              {title}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span>The Topper's Choice</span>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-gray-400 text-[10px] sm:text-xs uppercase tracking-widest">
        &copy; {new Date().getFullYear()} EduQuest AI • All Rights Reserved
      </footer>
    </div>
  );
};

export default Layout;
