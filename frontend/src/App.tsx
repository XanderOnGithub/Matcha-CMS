import { useState } from 'react';
import Sidebar from './components/sidebar';
import PageBuilder from './components/page-builder';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* SIDEBAR CONTAINER 
          The transition-all and overflow-hidden handle the sliding effect.
      */}
      <div 
        className={`transition-all duration-300 ease-in-out border-r border-slate-200 bg-white overflow-hidden ${
          isSidebarOpen ? 'w-64' : 'w-0 border-r-0'
        }`}
      >
        <div className="w-64 h-full">
          <Sidebar onToggleCollapse={() => setIsSidebarOpen(false)} />
        </div>
      </div>

      {/* MAIN CONTENT 
          We use relative positioning so the "Open" button can float 
          over the content when the sidebar is closed.
      */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        
        {/* Floating Open Button (Only visible when sidebar is closed) */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-6 left-6 z-[100] p-2.5 bg-white border border-slate-200 rounded-xl shadow-lg hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all text-slate-500"
            title="Open Explorer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
          </button>
        )}

        <PageBuilder />
      </div>
    </div>
  );
}