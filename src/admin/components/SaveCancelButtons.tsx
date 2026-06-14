import PrimaryButton from './PrimaryButton'

interface SaveCancelButtonsProps {
  onCancel: () => void
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
}

export default function SaveCancelButtons({
  onCancel,
  submitLabel = '保存',
  cancelLabel = '取消',
  loading,
}: SaveCancelButtonsProps) {
  return (
    <div className="flex gap-3 mt-6">
      <PrimaryButton type="submit" loading={loading} className="flex-1">
        {submitLabel}
      </PrimaryButton>
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 inline-flex items-center justify-center border border-white/30 text-white/80 py-2.5 text-[14px] font-medium rounded hover:bg-white/5 transition-colors"
      >
        {cancelLabel}
      </button>
    </div>
  )
}
