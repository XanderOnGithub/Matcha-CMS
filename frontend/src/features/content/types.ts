// src/features/content/types.ts
export interface ContentMeta {
  [key: string]: string | number | boolean | string[]
}

export interface ContentFile {
  Filename: string
  Meta: ContentMeta
  Content: string
}

export interface ContentResponse {
  [filename: string]: ContentFile
}

export interface MDXRendererProps {
  content: string
}

export interface AlertProps {
  type?: 'info' | 'warning' | 'error'
  children: React.ReactNode
}

export interface HeroProps {
  title: string
  subtitle: string
}

export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
}