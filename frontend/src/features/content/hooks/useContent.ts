/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ContentFile, ContentResponse } from '../types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const API_URL = 'http://localhost:8080/api'

// Hook to get all pages in a collection
export function useGetPages(collection: string) {
  return useQuery<ContentResponse>({
    queryKey: ['pages', collection],
    queryFn: () => 
      fetch(`${API_URL}/content/${collection}`)
        .then(r => r.json())
  })
}

// New hook to get a single page
export function useGetPage(collection: string, pageName: string) {
  return useQuery<ContentFile>({
    queryKey: ['page', collection, pageName],
    queryFn: () => 
      fetch(`${API_URL}/content/${collection}/${pageName}`)
        .then(r => r.json()),
    enabled: !!pageName
  })
}

// Hook to update a page
export function useUpdatePage(collection: string, filename: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { meta: Record<string, any>, content: string }) =>
      fetch(`${API_URL}/content/${collection}/${filename}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
    onSuccess: () => {
      // Invalidate both the single page and all pages queries
      queryClient.invalidateQueries({ queryKey: ['page', collection, filename] })
      queryClient.invalidateQueries({ queryKey: ['pages', collection] })
    }
  })
}

// New hook to create a page
export function useCreatePage(collection: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { filename: string, meta: Record<string, any>, content: string }) =>
      fetch(`${API_URL}/content/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pages', collection] })
      if (variables?.filename) {
        queryClient.invalidateQueries({ queryKey: ['page', collection, variables.filename] })
      }
    }
  })
}

// New hook to delete a page
export function useDeletePage(collection: string, filename: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      fetch(`${API_URL}/content/${collection}/${filename}`, {
        method: 'DELETE'
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page', collection, filename] })
      queryClient.invalidateQueries({ queryKey: ['pages', collection] })
    }
  })
}
