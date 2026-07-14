import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  children: ReactNode
  onClose: () => void
  maxWidth?: string
}

export default function Modal({ title, children, onClose, maxWidth = 'max-w-[500px]' }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={`max-h-[calc(100vh-3rem)] w-full overflow-y-auto bg-dark ${maxWidth} p-8`}>
        <h3 className="text-white text-[18px] font-bold mb-6">{title}</h3>
        {children}
      </div>
    </div>
  )
}
