import { useId } from 'react'

interface RadioButtonProps {
  name: string
  value: 1 | 2 | 3
  onSelect: () => void
  defaultValue?: 1 | 2 | 3
  disabled?: boolean
  label?: string
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  value,
  name,
  defaultValue,
  onSelect,
  disabled,
  label,
}) => {
  const id = useId()

  return (
    <div className="flex items-center gap-2">
      <input
        type="radio"
        id={id}
        name={name}
        value={value.toString()}
        onChange={onSelect}
        checked={defaultValue === value}
        disabled={disabled}
      />
      {label && (
        <label htmlFor={id} className="cursor-pointer">
          {label}
        </label>
      )}
    </div>
  )
}
