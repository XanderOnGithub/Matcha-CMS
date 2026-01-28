import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Editor from '../editor'; 

export default function PageBuilder() {
  const [isEditing, setIsEditing] = useState(false);
  const location = useLocation();
  
  const rawPath = location.pathname.startsWith('/') 
    ? location.pathname.substring(1) 
    : location.pathname;
    
  const slug = rawPath === "" ? "home" : rawPath;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['pages', slug],
    queryFn: async () => {
      const response = await fetch(`/api/pages/${slug}`);
      if (!response.ok) throw new Error('Not found');
      return response.json();
    }
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <p className="text-emerald-600 font-medium animate-pulse">Brewing Matcha...</p>
    </div>
  );
  
  if (isError) return (
    <div className="max-w-2xl mx-auto mt-20 p-8 border-2 border-dashed border-red-200 rounded-xl bg-red-50">
      <h1 className="text-4xl font-bold text-red-600">404</h1>
      <p className="mt-2 text-red-700">The page <code className="bg-red-100 px-1 rounded">{slug}</code> doesn't exist yet.</p>
    </div>
  );

  if (isEditing) {
    return (
      <div className="h-screen flex flex-col relative">
        <Editor 
          initialContent={data?.raw || ""} 
          initialMetadata={data?.metadata || {}} 
          slug={slug} 
          onSaveSuccess={() => setIsEditing(false)} 
        />
        
        <button 
          onClick={() => setIsEditing(false)} 
          className="absolute top-3 right-40 px-3 py-1.5 text-[10px] font-bold bg-white border border-slate-200 text-slate-500 rounded hover:bg-slate-50 shadow-sm transition-all"
        >
          EXIT
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 relative">
      <main className="max-w-3xl mx-auto bg-white shadow-sm border border-slate-200 rounded-2xl p-8 md:p-12">
        <header className="mb-10 pb-8 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-sm text-emerald-600 font-semibold uppercase tracking-wider mb-3">
            <span>Content</span>
            <span className="text-slate-300">/</span>
            <span>{slug.replace('/', ' / ')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            {data?.metadata?.title || "Untitled Page"}
          </h1>
        </header>

        <article 
          className="prose prose-slate prose-emerald lg:prose-xl max-w-none"
          dangerouslySetInnerHTML={{ __html: data?.body }} 
        />
      </main>

      <button 
        onClick={() => setIsEditing(true)}
        className="fixed bottom-8 right-8 flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl hover:bg-emerald-600 hover:scale-105 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
        <span className="font-bold tracking-tight">Edit Page</span>
      </button>
    </div>
  );
}