import { createClient } from '@/lib/supabase/server'
import PlayerCard from '@/components/players/PlayerCard'
import AddPlayerDialog from '@/components/players/AddPlayerDialog'
import { Users } from 'lucide-react'

export default async function PlayersPage() {
  const supabase = await createClient()
  const { data: players } = await supabase.from('players').select('*').order('name')

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Players</h1>
          <p className="text-muted-foreground text-sm mt-1">{players?.length ?? 0} players in your squad</p>
        </div>
        <AddPlayerDialog />
      </div>

      {players && players.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map(p => <PlayerCard key={p.id} player={p} />)}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Users size={40} className="mx-auto mb-3 opacity-20" />
          <p className="mb-4">No players yet. Add your first one.</p>
          <AddPlayerDialog />
        </div>
      )}
    </div>
  )
}