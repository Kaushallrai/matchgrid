'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Save, Trophy } from 'lucide-react'

export default function MatchDetailClient({ match, players, existingStats }: any) {
  const router = useRouter()
  const [scoreA, setScoreA] = useState(match.team_a_score ?? '')
  const [scoreB, setScoreB] = useState(match.team_b_score ?? '')
  const [saving, setSaving] = useState(false)

  // Stats state: { [playerId]: { goals, assists } }
  const [stats, setStats] = useState<Record<string, { goals: number; assists: number }>>(() => {
    const init: Record<string, { goals: number; assists: number }> = {}
    players.forEach((p: any) => {
      const existing = existingStats.find((s: any) => s.player_id === p.id)
      init[p.id] = { goals: existing?.goals ?? 0, assists: existing?.assists ?? 0 }
    })
    return init
  })

  function setStat(playerId: string, field: 'goals' | 'assists', value: number) {
    setStats(s => ({ ...s, [playerId]: { ...s[playerId], [field]: Math.max(0, value) } }))
  }

  async function saveResult() {
    setSaving(true)
    const supabase = createClient()
    const sa = Number(scoreA), sb = Number(scoreB)
    const winner = sa > sb ? 'A' : sb > sa ? 'B' : 'draw'

    await supabase.from('matches').update({
      team_a_score: sa, team_b_score: sb, winner
    }).eq('id', match.id)

    // Upsert player stats
    const statsToUpsert = players.map((p: any) => ({
      match_id: match.id,
      player_id: p.id,
      team: match.team_a_ids.includes(p.id) ? 'A' : 'B',
      goals: stats[p.id]?.goals ?? 0,
      assists: stats[p.id]?.assists ?? 0,
    }))

    // Delete old stats then re-insert
    await supabase.from('match_player_stats').delete().eq('match_id', match.id)
    await supabase.from('match_player_stats').insert(statsToUpsert)

    // Update wins for winning team players
    if (winner !== 'draw') {
      const winnerIds = winner === 'A' ? match.team_a_ids : match.team_b_ids
      for (const id of winnerIds) {
        try {
          await supabase.rpc('increment_wins', { player_id: id })
        } catch (e) {
          // ignore error
        }
      }
    }

    setSaving(false)
    router.refresh()
  }

  const teamAPlayers = players.filter((p: any) => match.team_a_ids.includes(p.id))
  const teamBPlayers = players.filter((p: any) => match.team_b_ids.includes(p.id))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Match Detail</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date(match.played_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Score entry */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Trophy size={16} />Result</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 space-y-1">
              <Label className="text-green-400">Team A</Label>
              <Input type="number" min={0} value={scoreA}
                onChange={e => setScoreA(e.target.value)}
                className="text-2xl font-bold text-center h-14" />
            </div>
            <span className="text-2xl font-bold text-muted-foreground pt-6">—</span>
            <div className="flex-1 space-y-1">
              <Label className="text-blue-400">Team B</Label>
              <Input type="number" min={0} value={scoreB}
                onChange={e => setScoreB(e.target.value)}
                className="text-2xl font-bold text-center h-14" />
            </div>
          </div>

          {match.winner && (
            <Badge className="mb-4" variant="default">
              {match.winner === 'draw' ? 'Draw' : `Team ${match.winner} won`}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Player stats — goals and assists */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Team A', color: 'green', teamPlayers: teamAPlayers },
          { label: 'Team B', color: 'blue',  teamPlayers: teamBPlayers },
        ].map(({ label, color, teamPlayers }) => (
          <Card key={label} className={color === 'green' ? 'border-green-500/30' : 'border-blue-500/30'}>
            <CardHeader className="pb-2">
              <CardTitle className={color === 'green' ? 'text-green-400 text-base' : 'text-blue-400 text-base'}>
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {teamPlayers.map((p: any) => (
                <div key={p.id} className="space-y-1.5">
                  <p className="text-sm font-medium">{p.name}</p>
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">Goals</Label>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setStat(p.id,'goals', stats[p.id].goals - 1)}
                          className="w-7 h-7 rounded bg-secondary text-sm hover:bg-secondary/80">−</button>
                        <span className="w-8 text-center text-sm font-bold">{stats[p.id]?.goals ?? 0}</span>
                        <button onClick={() => setStat(p.id,'goals', stats[p.id].goals + 1)}
                          className="w-7 h-7 rounded bg-secondary text-sm hover:bg-secondary/80">+</button>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">Assists</Label>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setStat(p.id,'assists', stats[p.id].assists - 1)}
                          className="w-7 h-7 rounded bg-secondary text-sm hover:bg-secondary/80">−</button>
                        <span className="w-8 text-center text-sm font-bold">{stats[p.id]?.assists ?? 0}</span>
                        <button onClick={() => setStat(p.id,'assists', stats[p.id].assists + 1)}
                          className="w-7 h-7 rounded bg-secondary text-sm hover:bg-secondary/80">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={saveResult} disabled={saving} size="lg">
        <Save size={15} className="mr-2" />{saving ? 'Saving...' : 'Save Result & Stats'}
      </Button>
    </div>
  )
}