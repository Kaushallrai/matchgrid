import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Trophy, Zap, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Dashboard() {
  const supabase = await createClient()

  const [{ count: playerCount }, { count: matchCount }, { data: recentMatches }] = await Promise.all([
    supabase.from('players').select('*', { count: 'exact', head: true }),
    supabase.from('matches').select('*', { count: 'exact', head: true }),
    supabase.from('matches').select('*').order('played_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Total Players', value: playerCount ?? 0,  icon: Users,       color: 'text-blue-400'   },
    { label: 'Matches Played',value: matchCount ?? 0,   icon: Trophy,      color: 'text-purple-400' },
    { label: 'Avg Goals/Game', value: '—',              icon: TrendingUp,  color: 'text-amber-400'  },
    { label: 'Active Season',  value: '1',              icon: Zap,         color: 'text-green-400'  },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your futsal group at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <Icon size={18} className={`${color} mb-3`} />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Button render={<Link href="/generate" />} nativeButton={false}>
          <Zap size={15} className="mr-2" />Generate Teams
        </Button>
        <Button variant="outline" render={<Link href="/players" />} nativeButton={false}>
          <Users size={15} className="mr-2" />Manage Players
        </Button>
      </div>

      {/* Recent matches */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Recent Matches</CardTitle>
          <Link href="/matches" className="text-xs text-primary hover:underline">View all →</Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentMatches && recentMatches.length > 0 ? recentMatches.map(m => (
            <Link key={m.id} href={`/matches/${m.id}`}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors gap-2 sm:gap-0">
              <span className="text-xs text-muted-foreground">
                {new Date(m.played_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-sm font-semibold">
                {m.team_a_score ?? '?'} — {m.team_b_score ?? '?'}
              </span>
              <Badge variant={m.winner === 'A' ? 'default' : m.winner === 'B' ? 'secondary' : 'outline'} className="w-fit">
                {m.winner ? (m.winner === 'draw' ? 'Draw' : `Team ${m.winner} wins`) : 'Pending'}
              </Badge>
            </Link>
          )) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No matches yet.{' '}
              <Link href="/generate" className="text-primary hover:underline">Generate your first →</Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}