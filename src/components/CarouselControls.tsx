import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CarouselControls({ previousLabel, nextLabel, onPrevious, onNext, controls, className = '' }: {
  previousLabel: string
  nextLabel: string
  onPrevious: () => void
  onNext: () => void
  controls?: string
  className?: string
}) {
  return <div className={`carousel-controls ${className}`}>
    <button type="button" aria-label={previousLabel} aria-controls={controls} onClick={onPrevious}><ChevronLeft size={20} strokeWidth={1.6} aria-hidden="true" /></button>
    <button type="button" aria-label={nextLabel} aria-controls={controls} onClick={onNext}><ChevronRight size={20} strokeWidth={1.6} aria-hidden="true" /></button>
  </div>
}
