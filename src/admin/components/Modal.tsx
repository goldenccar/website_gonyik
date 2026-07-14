import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  children: ReactNode
  onClose: () => void
  maxWidth?: string
}

export default function Modal({ title, children, onClose, maxWidth = 'max-w-[500px]' }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={`h-[100dvh] w-full overflow-y-auto bg-dark sm:h-auto sm:max-h-[calc(100dvh-3rem)] ${maxWidth}`}>
        <div className="sticky top-0 z-20 flex min-h-14 items-center justify-between border-b border-white/10 bg-dark/95 px-4 backdrop-blur sm:px-8 sm:pt-4">
          <h3 className="text-[17px] font-bold text-white sm:text-[18px]">{title}</h3>
          <button type="button" onClick={onClose} className="-mr-2 flex h-11 w-11 items-center justify-center text-accent hover:text-white" aria-label="关闭">
            <X size={20} />
          </button>
        </div>
        <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 sm:p-8 sm:pt-6">{children}</div>
      </div>
    </div>
  )
}
