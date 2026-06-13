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
      <button
        type="submit"
        disabled={loading}
        className="flex-1 bg-white text-primary py-2.5 text-[13px] font-medium hover:bg-bg disabled:opacity-50"
      >
        {loading ? '保存中...' : submitLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 border border-white/20 text-white py-2.5 text-[13px] hover:bg-white/5"
      >
        {cancelLabel}
      </button>
    </div>
  )
}
