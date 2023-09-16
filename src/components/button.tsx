import clsx from 'clsx'

interface ButtonProps {
  color: 'red' | 'blue' | 'gray'
  onClick: () => void
  children?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({ color, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'p-2 border w-full text-gray-900 rounded-lg transition-colors',
        color === 'red' && 'border-red-500 hover:bg-red-100',
        color === 'blue' && 'border-blue-500 hover:bg-blue-100',
        color === 'gray' && 'border-gray-500 hover:bg-gray-100'
      )}
    >
      {children}
    </button>
  )
}
