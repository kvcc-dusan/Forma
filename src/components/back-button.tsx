import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function BackButton({
  className,
  variant = 'default',
  fallback = '/',
}: {
  className?: string
  variant?: 'default' | 'overlay'
  fallback?: string
}) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={() => {
        if (window.history.length > 1) navigate(-1)
        else navigate(fallback)
      }}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full border transition-colors',
        variant === 'overlay'
          ? 'border-white/15 bg-black/40 text-white backdrop-blur hover:bg-black/60'
          : 'border-border bg-secondary text-secondary-foreground hover:bg-muted',
        className,
      )}
    >
      <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.8} />
    </button>
  )
}
