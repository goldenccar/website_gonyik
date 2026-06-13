import { Save } from 'lucide-react'

interface SaveButtonProps {
  onClick?: () => void
  loading?: boolean
  children?: React.ReactNode
  size?: 'sm' | 'md'
  type?: 'button' | 'submit'
}

export default function SaveButton({
  onClick,
  loading,
  children = '保存更改',
  size = 'md',
  type = 'button',
}: SaveButtonProps) {
  const sizeClasses =
    size === 'sm' ? 'px-4 py-2 text-[13px]' : 'px-5 py-2.5 text-[14px]'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 bg-accentWarm text-white font-medium rounded shadow-sm hover:bg-accentWarm/90 active:scale-[0.98] transition-all disabled:opacity-50 ${sizeClasses}`}
    >
      <Save size={size === 'sm' ? 14 : 16} />
      {loading ? '保存中...' : children}
    </button>
  )
}
