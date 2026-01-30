/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, type JSX } from 'react'
import { evaluate } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import type { MDXRendererProps } from '../../types'
import { mdxComponents } from './index'

export function MDXRenderer({ content }: MDXRendererProps) {
  const [MDXContent, setMDXContent] = useState<null | ((props: any) => JSX.Element)>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const renderMDX = async () => {
      try {
        const { default: Content } = await evaluate(content, {
          ...runtime,
        })
        setMDXContent(() => Content)
        setError(null)
      } catch (err) {
        console.error('MDX Error:', err)
        setError('Error rendering content')
      }
    }

    renderMDX()
  }, [content])

  if (error) return <div>{error}</div>
  if (!MDXContent) return <div>Loading...</div>

  // Pass components as a prop to the MDXContent function
  return <MDXContent components={mdxComponents} />
}