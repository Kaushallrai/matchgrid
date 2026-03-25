'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, RefreshCw, Save, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// ── Rating algorithm ──────────────────────────────────────────────────
function getRating(p: any): number {
  const base = (p.attack * 1.3 + p.defense * 1.1 + p.stamina * 0.9 + p.passing * 0.9) / 4.2
  return parseFloat((base + (p.dynamic_modifier ?? 0)).toFixed(2))
}

function balanceTeams(players: any[]) {
  const posOrder: Record<string, number> = { GK:0, DEF:1, MID:2, FWD:3 }
  const sorted = [...players].sort((a, b) => {
    const pd = posOrder[a.preferred_position] - posOrder[b.preferred_position]
    return pd !== 0 ? pd : getRating(b) - getRating(a)
  })

  const teamA: any[] = [], teamB: any[] = []
  sorted.forEach((p, i) => {
    const slot = Math.floor(i / 2)
    if (i % 2 === 0) { slot % 2 === 0 ? teamA.push(p) : teamB.push(p) }
    else             { slot % 2 === 0 ? teamB.push(p) : teamA.push(p) }
  })

  // Single-pass swap optimisation
  let bestScore = scoreGap(teamA, teamB)
  for (let i = 0; i < teamA.length; i++) {
    for (let j = 0; j < teamB.length; j++) {
      const a2 = [...teamA], b2 = [...teamB]
      ;[a2[i], b2[j]] = [b2[j], a2[i]]
      const s = scoreGap(a2, b2)
      if (s < bestScore) { bestScore = s; teamA[i] = a2[i]; teamB[j] = b2[j] }
    }
  }

  return { teamA, teamB, gap: bestScore }
}

function scoreGap(a: any[], b: any[]) {
  const sum = (arr: any[]) => arr.reduce((s, p) => s + getRating(p), 0)
  return Math.abs(sum(a) - sum(b))
}
// ─────────────────────────────────────────────────────────────────────

const posBadge: Record<string, string> = {
  GK:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DEF: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  MID: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  FWD: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function GenerateClient({ allPlayers }: { allPlayers: any[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<{ teamA: any[]; teamB: any[]; gap: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function toggle(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
    setResult(null)
  }

  function generate() {
    const players = allPlayers.filter(p => selected.has(p.id))
    if (players.length >= 4) setResult(balanceTeams(players))
  }

  async function saveMatch() {
    if (!result) return
    setSaving(true)
    const supabase = createClient()
    const { data: match } = await supabase.from('matches').insert([{
      team_a_ids: result.teamA.map(p => p.id),
      team_b_ids: result.teamB.map(p => p.id),
      balance_score: result.gap,
    }]).select().single()

    for (const p of [...result.teamA, ...result.teamB]) {
      await supabase.rpc('increment_games_played', { player_id: p.id })
    }
    setSaving(false)
    if (match) router.push(`/matches/${match.id}`)
  }

  const sumRating = (arr: any[]) => arr.reduce((s, p) => s + getRating(p), 0).toFixed(1)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Generate Teams</h1>
          <p className="text-muted-foreground text-sm mt-1">Select who's playing today, then generate</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{selected.size} selected</span>
          {result && (
            <Badge variant="outline" className="text-green-400 border-green-500/30">
              Gap: {result.gap.toFixed(2)}
            </Badge>
          )}
        </div>
      </div>

      {/* Player picker */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Attending players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {allPlayers.map(p => {
              const on = selected.has(p.id)
              return (
                <button key={p.id} onClick={() => toggle(p.id)}
                  className={cn(
                    'p-3 rounded-xl border text-left transition-all relative',
                    on ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:border-primary/20'
                  )}>
                  {on && <CheckCircle2 size={13} className="absolute top-2 right-2 text-primary" />}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium truncate pr-4">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('text-xs px-1.5 py-0.5 rounded border', posBadge[p.preferred_position])}>
                      {p.preferred_position}
                    </span>
                    <span className="text-xs text-muted-foreground">{getRating(p).toFixed(1)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button onClick={generate} disabled={selected.size < 4}>
          <Zap size={15} className="mr-2" />Generate Teams
        </Button>
        {result && (
          <Button variant="outline" onClick={generate}>
            <RefreshCw size={14} className="mr-2" />Reshuffle
          </Button>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Team A', players: result.teamA, color: 'green' },
              { label: 'Team B', players: result.teamB, color: 'blue'  },
            ].map(({ label, players, color }) => (
              <Card key={label} className={color === 'green' ? 'border-green-500/30' : 'border-blue-500/30'}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className={color === 'green' ? 'text-green-400' : 'text-blue-400'}>
                      {label}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      Strength {sumRating(players)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {players.map(p => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary">
                      <span className="text-sm font-medium">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{getRating(p).toFixed(1)}</span>
                        <span className={cn('text-xs px-1.5 py-0.5 rounded border', posBadge[p.preferred_position])}>
                          {p.preferred_position}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <Button variant="outline" onClick={saveMatch} disabled={saving}>
            <Save size={14} className="mr-2" />
            {saving ? 'Saving...' : 'Save Match & Enter Score'}
          </Button>
        </div>
      )}
    </div>
  )
}