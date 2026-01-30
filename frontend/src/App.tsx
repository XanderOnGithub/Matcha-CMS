/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useGetPages } from "./features/content/hooks/useContent";
import { MDXRenderer } from "./features/content/components/mdx/MDXRenderer";
import { Navbar } from "./features/navigation/components/NavBar";

export default function App() {
  
  const { data, isLoading } = useGetPages('pages')
  const [selectedPage, setSelectedPage] = useState<string | null>(null)

  const pages = Object.entries(data || {})
  const currentPage = selectedPage ? data?.[selectedPage] : null

  useEffect(() => {
    if (data && !selectedPage) {
      if (data['home.mdx']) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedPage('home.mdx')
      }
    }
  }, [data, selectedPage])

  return (
    <div className="w-full flex flex-col">
      <Navbar pages={pages} selectedPage={selectedPage} setSelectedPage={setSelectedPage} />

      <div className="max-w-360 mx-auto w-full grow my-12">
        {isLoading ? (
          <div>Loading...</div>
        ) : currentPage ? (
          <div className="">
            <div className="w-full">
              <MDXRenderer content={currentPage.Content} />
            </div>
          </div>
        ) : (
          <div>Select a page</div>
        )}
      </div>
    </div>
  );
}