'use client'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import HexStatChart from './HexStatChart'
import EditPlayerDialog from './EditPlayerDialog'


const posVariant: Record<string, string> = {
  GK:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DEF: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  MID: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  FWD: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function PlayerCard({ player }: { player: any }) {
  const overall = ((player.attack + player.defense + player.stamina + player.passing) / 4).toFixed(1)

  return (
    <Card className="hover:border-primary/30 transition-colors">
      <CardContent className="p-4 space-y-4">

        {/* Header row */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-base">{player.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {player.games_played}g · {player.wins}W
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', posVariant[player.preferred_position])}>
              {player.preferred_position}
            </span>
            <EditPlayerDialog player={player} />
          </div>
        </div>

        {/* Hexagon chart */}
        <div className="w-full aspect-square max-w-[180px] mx-auto">
          <HexStatChart player={player} />
        </div>

        {/* Overall rating pill */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary">
          <span className="text-xs text-muted-foreground">Overall rating</span>
          <span className="font-bold text-primary">{overall}</span>
        </div>

        {/* Form modifier badge */}
        {player.dynamic_modifier !== 0 && (
          <div className={cn(
            'text-xs text-center py-1.5 rounded-lg font-medium',
            player.dynamic_modifier > 0
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          )}>
            Form: {player.dynamic_modifier > 0 ? '+' : ''}{player.dynamic_modifier}
          </div>
        )}

      </CardContent>
    </Card>
  )
}