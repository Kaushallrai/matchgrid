import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function MatchesPage() {
  const supabase = await createClient()
  const [{ data: matches }, { data: players }] = await Promise.all([
    supabase.from('matches').select('*').order('played_at', { ascending: false }),
    supabase.from('players').select('id, name'),
  ])
  const playerMap = Object.fromEntries((players ?? []).map(p => [p.id, p.name]))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Match History</h1>
          <p className="text-muted-foreground text-sm mt-1">{matches?.length ?? 0} matches recorded</p>
        </div>
        <Button render={<Link href="/generate" />} nativeButton={false}><Plus size={15} className="mr-2" />New Match</Button>
      </div>

      <div className="space-y-3">
        {matches && matches.length > 0 ? matches.map(m => (
          <Link key={m.id} href={`/matches/${m.id}`}>
            <Card className="hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-400 font-medium">Team A</span>
                      <span className="text-muted-foreground text-xs">
                        {m.team_a_ids?.slice(0,2).map((id: string) => playerMap[id]).filter(Boolean).join(', ')}
                        {m.team_a_ids?.length > 2 && ` +${m.team_a_ids.length - 2}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-blue-400 font-medium">Team B</span>
                      <span className="text-muted-foreground text-xs">
                        {m.team_b_ids?.slice(0,2).map((id: string) => playerMap[id]).filter(Boolean).join(', ')}
                        {m.team_b_ids?.length > 2 && ` +${m.team_b_ids.length - 2}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {m.team_a_score != null
                      ? <span className="text-xl font-bold tabular-nums">{m.team_a_score} — {m.team_b_score}</span>
                      : <span className="text-sm text-muted-foreground">No score yet</span>}
                    <Badge variant={m.winner === 'A' ? 'default' : 'outline'}
                      className={m.winner === 'B' ? 'border-blue-500/30 text-blue-400' : ''}>
                      {m.winner ? (m.winner === 'draw' ? 'Draw' : `Team ${m.winner}`) : 'Pending'}
                    </Badge>
                    <span className="text-xs text-muted-foreground w-20 text-right">
                      {new Date(m.played_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="mb-4">No matches yet.</p>
            <Button render={<Link href="/generate" />} nativeButton={false} variant="outline">
              Generate your first match →
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}