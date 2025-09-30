import type { LucideIcon } from 'lucide-react'

export function IconSwitch({
  checked,
  onChange,
  disabled = false,
  className = '',
  iconChecked: IconChecked,
  iconNotChecked: IconNotChecked,
  color = [107, 114, 128], // default gray color
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  iconChecked: LucideIcon
  iconNotChecked: LucideIcon
  color?: number[]
}) {
  return (
    <button
      role='switch'
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-8 w-14 items-center justify-around rounded-md px-1 transition-colors focus:outline-none ${checked ? '' : 'bg-gray-200'} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className} `}
      style={{
        backgroundColor: checked ? `rgb(${color.join(',')})` : undefined,
      }}
    >
      <div
        className={`absolute h-6 w-6 transform rounded-md bg-white transition-transform ${checked ? 'translate-x-1/2' : '-translate-x-1/2'} `}
      />
      <IconChecked
        className='z-10 h-4 w-4'
        color={!checked ? `rgb(${color.join(',')})` : '#9CA3AF'}
      />
      <IconNotChecked
        className='z-10 h-4 w-4'
        color={checked ? `rgb(${color.join(',')})` : '#9CA3AF'}
      />
    </button>
  )
}
