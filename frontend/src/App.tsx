/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useCreatePage, useDeletePage, useGetPages, useUpdatePage } from "./features/content/hooks/useContent";
import { MDXRenderer } from "./features/content/components/mdx/MDXRenderer";
import type { ContentMeta } from "./features/content/types";

export default function App() {
  
  const { data, isLoading } = useGetPages('pages')
  const [selectedPage, setSelectedPage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newFilename, setNewFilename] = useState('')
  const [editMeta, setEditMeta] = useState<ContentMeta>({})
  const [editContent, setEditContent] = useState('')

  const pages = Object.entries(data || {})
  const currentPage = selectedPage ? data?.[selectedPage] : null

  const updateMutation = useUpdatePage('pages', selectedPage || '')
  const createMutation = useCreatePage('pages')
  const deleteMutation = useDeletePage('pages', selectedPage || '')

  const handleEdit = () => {
    if (currentPage) {
      setEditMeta(currentPage.Meta)
      setEditContent(currentPage.Content)
      setIsEditing(true)
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({ meta: editMeta, content: editContent }, {
      onSuccess: () => {
        setIsEditing(false)
      }
    })
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFilename.trim()) return

    createMutation.mutate({
      filename: newFilename.trim().endsWith('.mdx') ? newFilename.trim() : `${newFilename.trim()}.mdx`,
      meta: editMeta,
      content: editContent
    }, {
      onSuccess: () => {
        setIsCreating(false)
        setNewFilename('')
        setEditMeta({})
        setEditContent('')
      }
    })
  }

  const handleDelete = () => {
    if (!selectedPage) return
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        setSelectedPage(null)
        setIsEditing(false)
      }
    })
  }

  return (
    <div className="w-full" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* Nav */}
      <nav className="px-6 py-4">
        <div className="flex gap-8 items-center">
          {pages.map(([filename, page]: any) => (
            <button
              key={filename}
              onClick={() => {
                setSelectedPage(filename)
                setIsEditing(false)
                setIsCreating(false)
              }}
              className={selectedPage === filename ? 'text-blue-600' : 'text-black'}
            >
              {page.Meta?.Name || page.Meta?.Title || ''}
            </button>
          ))}
          <button
            className="bg-green-600 px-3 py-2 rounded-full text-white min-w-24"
            onClick={() => {
              setIsCreating(true)
              setIsEditing(false)
              setSelectedPage(null)
              setEditMeta({})
              setEditContent('')
            }}
          >
            New Page
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="px-6 py-12">
        {isLoading ? (
          <div>Loading...</div>
        ) : isCreating ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label>Filename</label>
              <input
                type="text"
                value={newFilename}
                onChange={(e) => setNewFilename(e.target.value)}
                placeholder="new-page.mdx"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <div>
              <label>Title</label>
              <input
                type="text"
                value={typeof editMeta.Name === 'string' ? editMeta.Name : ''}
                onChange={(e) => setEditMeta({ ...editMeta, Name: e.target.value })}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <div>
              <label>Content</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={20}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <div className="flex gap-4">
              <button type="submit">Create</button>
              <button type="button" onClick={() => setIsCreating(false)}>Cancel</button>
            </div>
          </form>
        ) : currentPage ? (
          <div>
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label>Title</label>
                  <input
                    type="text"
                    value={typeof editMeta.Name === 'string' ? editMeta.Name : ''}
                    onChange={(e) => setEditMeta({ ...editMeta, Name: e.target.value })}
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>

                <div>
                  <label>Content</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={20}
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>

                <div className="flex gap-4">
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1>{currentPage.Meta.Title}</h1>
                  <div className="flex gap-3">
                    <button className="bg-blue-500 px-3 py-2 rounded-full text-white min-w-24" onClick={handleEdit}>Edit</button>
                    <button
                      type="button"
                      className="bg-red-500 px-3 py-2 rounded-full text-white min-w-24"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex flex-col w-fit gap-4">
                  <MDXRenderer content={currentPage.Content} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>Select a page</div>
        )}
      </div>
    </div>
  );
}