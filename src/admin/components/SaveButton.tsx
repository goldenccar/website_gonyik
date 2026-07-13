import { Save } from 'lucide-react'
import PrimaryButton from './PrimaryButton'

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
  return (
    <PrimaryButton
      type={type}
      onClick={onClick}
      loading={loading}
      loadingLabel="保存中..."
      size={size}
      icon={<Save size={size === 'sm' ? 14 : 16} />}
    >
      {children}
    </PrimaryButton>
  )
}
