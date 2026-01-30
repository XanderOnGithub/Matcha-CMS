import type { AlertProps, HeroProps, ButtonProps } from '../../types'

export function Button({ children, onClick }: ButtonProps) {
  return (
    <button className="bg-blue-500 hover:bg-blue-600 cursor-pointer rounded-full min-w-24 text-white px-4 py-2" onClick={onClick}>
      {children}
    </button>
  )
}

export function Alert({ type = 'info', children }: AlertProps) {
  const colors = {
    info: 'bg-blue-50',
    warning: 'bg-yellow-50',
    error: 'bg-red-50',
  }
  return <div className={colors[type]}>{children}</div>
}

export function Hero({ title, subtitle }: HeroProps) {
  return (
    <div className="bg-linear-to-r from-blue-600 to-purple-600 p-20 text-white">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  )
}