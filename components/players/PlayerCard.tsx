'use client'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import EditPlayerDialog from './EditPlayerDialog'
import PlayerDetailModal from './PlayerDetailModal'


const posVariant: Record<string, string> = {
  GK:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DEF: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  MID: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  FWD: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function PlayerCard({ player }: { player: any }) {
  const overall = ((player.attack + player.defense + player.stamina + player.passing) / 4).toFixed(1)

  return (
    <PlayerDetailModal player={player}>
      <Card className="hover:border-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer h-full border-border/50 shadow-sm hover:shadow-primary/10">
        <CardContent className="p-4 space-y-4">

          {/* Header row */}
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-base tracking-tight">{player.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {player.games_played}g · {player.wins}W
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-bold tracking-wider', posVariant[player.preferred_position])}>
                {player.preferred_position}
              </span>
              <div onClick={e => e.stopPropagation()}>
                <EditPlayerDialog player={player} />
              </div>
            </div>
          </div>

          {/* Stat preview (Replaced huge HexStatChart on card with a compact preview) */}
          <div className="grid grid-cols-4 gap-1.5 pt-2 pb-1">
            {[
              { label: 'ATT', val: player.attack },
              { label: 'DEF', val: player.defense },
              { label: 'STM', val: player.stamina },
              { label: 'PAS', val: player.passing }
            ].map(s => (
              <div key={s.label} className="bg-secondary/40 rounded-md py-1.5 flex flex-col items-center justify-center border border-border/40">
                <span className="text-[9px] text-muted-foreground font-medium mb-0.5">{s.label}</span>
                <span className="text-xs font-bold text-foreground/90">{s.val}</span>
              </div>
            ))}
          </div>

          {/* Overall rating pill */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/80 border border-border/50">
            <span className="text-xs font-medium text-muted-foreground">Overall Rating</span>
            <span className="font-bold text-primary text-sm">{overall}</span>
          </div>

          {/* Form modifier badge */}
          {player.dynamic_modifier !== 0 && (
            <div className={cn(
              'text-[10px] font-bold tracking-wide text-center py-1.5 rounded-md uppercase',
              player.dynamic_modifier > 0
                ? 'bg-green-500/10 text-green-500/90 border border-green-500/20'
                : 'bg-red-500/10 text-red-500/90 border border-red-500/20'
            )}>
              Form: {player.dynamic_modifier > 0 ? '+' : ''}{player.dynamic_modifier}
            </div>
          )}

        </CardContent>
      </Card>
    </PlayerDetailModal>
  )
}