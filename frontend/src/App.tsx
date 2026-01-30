/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function App() {

  function useGetPages() {
    return useQuery({
      queryKey: ['pages'],
      queryFn: () => fetch('http://localhost:8080/api/content/pages').then(r => r.json())
    })
  }
  
  const { data, isLoading } = useGetPages()
  const [selectedPage, setSelectedPage] = useState<string | null>(null)

  const pages = Object.entries(data || {})
  const currentPage = selectedPage ? data?.[selectedPage] : null

  const cleanFilename = (name: string) => name.replace(/\.mdx$/, '')

  return (
    <div className="w-full" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* Nav */}
      <nav className="px-6 py-4">
        <div className="flex gap-8">
          {pages.map(([filename, page]: any) => (
            <button
              key={filename}
              onClick={() => setSelectedPage(filename)}
              className={selectedPage === filename ? 'text-blue-600' : 'text-black'}
            >
              {page.Meta.Title || cleanFilename(filename)}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="px-6 py-12">
        {isLoading ? (
          <div>Loading...</div>
        ) : currentPage ? (
          <div>
            <h1>{currentPage.Meta.Title}</h1>
            <div>
              <ReactMarkdown>{currentPage.Content}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div>Select a page</div>
        )}
      </div>
    </div>
  );
}