import { Loader2 } from 'lucide-react'

interface PrimaryButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  loading?: boolean
  disabled?: boolean
  size?: 'sm' | 'md'
  icon?: React.ReactNode
  className?: string
}

export default function PrimaryButton({
  children,
  onClick,
  type = 'button',
  loading,
  disabled,
  size = 'md',
  icon,
  className = '',
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 bg-accentWarm text-white font-medium rounded shadow-sm',
        'hover:bg-accentWarm/90 active:scale-[0.98] transition-all disabled:opacity-50',
        size === 'sm' ? 'px-3 py-1.5 text-[12px]' : 'px-4 py-2 text-[13px]',
        className,
      ].join(' ')}
    >
      {loading ? <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" /> : icon}
      {loading ? '处理中...' : children}
    </button>
  )
}
