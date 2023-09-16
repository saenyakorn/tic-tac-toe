interface CellProps {
  color?: 'red' | 'blue'
  marker?: 'X' | 'O'
  level?: 1 | 2 | 3
  onClick: () => void
  disabled?: boolean
}
export const Cell: React.FC<CellProps> = ({ onClick, color, marker, level, disabled }) => {
  return (
    <div
      className={
        'w-16 h-16 flex items-center justify-center bg-gray-100 text-2xl' +
        (disabled ? ' cursor-not-allowed bg-gray-300' : ' cursor-pointer')
      }
      onClick={() => {
        !disabled && onClick()
      }}
    >
      <p className={color === 'red' ? 'text-red-500' : 'text-blue-500'}>
        {marker} {level && <sub>{level}</sub>}
      </p>
    </div>
  )
}
