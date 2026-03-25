'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import HexStatChart from './HexStatChart'
import { Badge } from '@/components/ui/badge'

const posColors: Record<string, string> = {
  GK:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DEF: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  MID: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  FWD: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const tooltipStyle = {
  backgroundColor: 'hsl(0 0% 10%)',
  border: '1px solid hsl(0 0% 18%)',
  borderRadius: 8,
  color: 'hsl(0 0% 94%)',
  fontSize: 12,
}

export default function PlayerDetailModal({ player, children }: { player: any, children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const overall = ((player.attack + player.defense + player.stamina + player.passing) / 4).toFixed(1)

  const statData = [
    { name: 'Attack', value: player.attack },
    { name: 'Defense', value: player.defense },
    { name: 'Stamina', value: player.stamina },
    { name: 'Passing', value: player.passing },
  ]
  if (player.preferred_position === 'GK') {
    statData.push({ name: 'GK', value: player.gk_ability })
  }

  const winRate = player.games_played > 0 
    ? Math.round((player.wins / player.games_played) * 100) 
    : 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<div role="button" aria-label="View Player Details" className="text-left w-full h-full" />}>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between w-[90%]">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                {player.name}
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${posColors[player.preferred_position]}`}>
                  {player.preferred_position}
                </span>
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Player Analytics & Performance</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-3xl font-bold text-primary">{overall}</span>
              <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">OVR</span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Left Column: Hex Chart & Basic Stats */}
          <div className="space-y-6">
            <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
              <div className="w-full aspect-square max-w-[220px] mx-auto">
                <HexStatChart player={player} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground mb-1">Matches</span>
                <span className="text-2xl font-bold">{player.games_played}</span>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 border border-border/50 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground mb-1">Win Rate</span>
                <span className="text-2xl font-bold text-green-400">{winRate}%</span>
              </div>
            </div>
            
            {player.dynamic_modifier !== 0 && (
              <div className={`p-3 rounded-xl border text-center font-medium ${player.dynamic_modifier > 0 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                Current Form Modifier: {player.dynamic_modifier > 0 ? '+' : ''}{player.dynamic_modifier}
              </div>
            )}
          </div>

          {/* Right Column: Deep Attributes Chart */}
          <div className="space-y-6 flex flex-col justify-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Attribute Breakdown</h3>
            <div className="h-[250px] w-full bg-secondary/30 rounded-xl p-4 border border-border/50">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(0 0% 18%)" />
                  <XAxis type="number" domain={[0, 5]} tick={{ fill: 'hsl(0 0% 53%)', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(0 0% 90%)', fontSize: 12, fontWeight: 500 }} width={70} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'hsl(0 0% 18% / 0.5)'}} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {statData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${142 + (index * 20)} 71% ${45 - (index * 5)}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 text-sm">
              <p className="text-muted-foreground leading-relaxed">
                This player excels in <strong className="text-foreground">{[...statData].sort((a, b) => b.value - a.value)[0].name}</strong>, 
                achieving a top rating of <strong className="text-foreground">{[...statData].sort((a, b) => b.value - a.value)[0].value}/5</strong>. 
                {player.games_played < 5 && " They are relatively new to the system, so form ratings may fluctuate as more matches are recorded."}
              </p>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
