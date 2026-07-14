interface ReadingProgressProps {
  progress: number
  orientation?: 'horizontal' | 'vertical'
  className?: string
  label?: string
}

export default function ReadingProgress({ progress, orientation = 'horizontal', className = '', label }: ReadingProgressProps) {
  const normalized = Math.min(1, Math.max(0, progress))
  const vertical = orientation === 'vertical'

  return <div
    role={label ? 'progressbar' : undefined}
    aria-label={label}
    aria-valuemin={label ? 0 : undefined}
    aria-valuemax={label ? 100 : undefined}
    aria-valuenow={label ? Math.round(normalized * 100) : undefined}
    aria-hidden={label ? undefined : true}
    className={`overflow-hidden ${vertical ? 'w-px bg-transparent' : 'h-px bg-border'} ${className}`}
  >
    <span
      className={`block bg-[#69B2C1] transition-transform duration-[var(--motion-instant)] ease-apple ${vertical ? 'h-full w-full origin-top' : 'h-full w-full origin-left'}`}
      style={{ transform: vertical ? `scaleY(${normalized})` : `scaleX(${normalized})` }}
    />
  </div>
}
