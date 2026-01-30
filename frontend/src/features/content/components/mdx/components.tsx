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

export function Hero({ brand, title, subtitle }: HeroProps) {
  return (
    <div className="flex flex-row gap-4 justify-center  text-black">

      {/* Image */}
      <div className="w-fit">
        <div className="w-64 bg-[#8ba888] aspect-square rounded-full flex m-2">
          <img src="/logo.png" alt="Hero Image" className="w-52 mx-auto my-auto object-cover" />
        </div>
      </div>
      
      <div className="flex flex-col gap-2 max-w-3xl">
        <h4>{brand}</h4>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

    </div>
  )
}