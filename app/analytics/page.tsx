import { createClient } from '@/lib/supabase/server'
import AnalyticsClient from '@/components/analytics/AnalyticsClient'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const [{ data: players }, { data: stats }] = await Promise.all([
    supabase.from('players').select('*'),
    supabase.from('match_player_stats').select('*, players(name)'),
  ])
  return <AnalyticsClient players={players ?? []} stats={stats ?? []} />
}