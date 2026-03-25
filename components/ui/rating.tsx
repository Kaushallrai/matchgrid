'use client'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RatingInput({ value, onChange }: { value: number, onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = value >= star
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={cn(
              "p-1.5 sm:p-2 rounded-lg transition-all duration-200 active:scale-75 cursor-pointer touch-manipulation",
              active ? "bg-primary/15" : "hover:bg-secondary bg-transparent"
            )}
          >
            <Star
              size={18}
              strokeWidth={active ? 2.5 : 2}
              className={cn(
                "transition-all duration-300",
                active 
                  ? "fill-primary text-primary scale-110 drop-shadow-sm" 
                  : "text-muted-foreground/30 scale-100"
              )}
            />
          </button>
        )
      })}
      <div className="ml-2 w-6 h-8 flex items-center justify-center rounded bg-secondary/50 border border-border/50">
        <span className="text-sm font-bold text-primary">{value}</span>
      </div>
    </div>
  )
}
