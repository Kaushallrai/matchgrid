import MatchDetailClient from '@/components/matches/MatchDetailClient'
import { createClient } from '@/lib/supabase/server'

import { notFound } from 'next/navigation'

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const [{ data: match }, { data: players }, { data: existingStats }] = await Promise.all([
    supabase.from('matches').select('*').eq('id', params.id).single(),
    supabase.from('players').select('*'),
    supabase.from('match_player_stats').select('*').eq('match_id', params.id),
  ])

  if (!match) notFound()

  const allPlayerIds = [...(match.team_a_ids ?? []), ...(match.team_b_ids ?? [])]
  const matchPlayers = (players ?? []).filter(p => allPlayerIds.includes(p.id))

  return <MatchDetailClient match={match} players={matchPlayers} existingStats={existingStats ?? []} />
}