interface ButtonProps {
    variant?: 'primary' | 'secondary'
    children?: React.ReactNode
    onClick?: () => void
}

// Map of variant to class names
const variantClasses: Record<string, string> = {
    primary: 'bg-matcha-medium hover:bg-matcha-dark text-white',
    secondary: 'border-2 hover:bg-gray-600 text-white',
}

const genericButtonClasses = 'cursor-pointer rounded-full min-w-24 px-4 py-2 transition-all duration-150'

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
    return(
        <button type="button" className={`${genericButtonClasses} ${variantClasses[variant]}`} onClick={onClick}>
            {children}
        </button>
    );
}