import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  children: ReactNode
  onClose: () => void
  maxWidth?: string
}

export default function Modal({ title, children, onClose, maxWidth = 'max-w-[500px]' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    return () => { if (dialog.open) dialog.close() }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={`m-auto h-[100dvh] w-full overflow-y-auto bg-dark p-0 text-left text-white backdrop:bg-black/60 sm:h-auto sm:max-h-[calc(100dvh-3rem)] ${maxWidth}`}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="sticky top-0 z-20 flex min-h-14 items-center justify-between border-b border-white/10 bg-dark/95 px-4 backdrop-blur sm:px-8 sm:pt-4">
        <h3 id={titleId} className="text-[17px] font-bold text-white sm:text-[18px]">{title}</h3>
        <button type="button" onClick={onClose} className="-mr-2 flex h-11 w-11 items-center justify-center text-accent hover:text-white" aria-label="关闭">
          <X size={20} />
        </button>
      </div>
      <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 sm:p-8 sm:pt-6">{children}</div>
    </dialog>
  )
}
