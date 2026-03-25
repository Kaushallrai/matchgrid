import { createClient } from '@/lib/supabase/server'
import GenerateClient from '@/components/generate/GenerateClient'

export default async function GeneratePage() {
  const supabase = await createClient()
  const { data: players } = await supabase.from('players').select('*').order('name')
  return <GenerateClient allPlayers={players ?? []} />
}