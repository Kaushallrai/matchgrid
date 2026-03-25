'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { RatingInput } from '@/components/ui/rating'

const defaultForm = {
  name: '', preferred_position: 'MID',
  attack: 3, defense: 3, stamina: 3, passing: 3, gk_ability: 2,
}

export default function AddPlayerDialog() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('players').insert([form])
    setSaving(false)
    setOpen(false)
    setForm(defaultForm)
    router.refresh()
  }

  const positions = ['GK','DEF','MID','FWD']
  const posColors: Record<string, string> = {
    GK: 'border-amber-500 bg-amber-500/10 text-amber-400',
    DEF: 'border-blue-500 bg-blue-500/10 text-blue-400',
    MID: 'border-purple-500 bg-purple-500/10 text-purple-400',
    FWD: 'border-red-500 bg-red-500/10 text-red-400',
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus size={15} className="mr-2" />Add Player
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Player</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input placeholder="Player name" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>

          <div className="space-y-1.5">
            <Label>Preferred Position</Label>
            <div className="flex gap-2">
              {positions.map(pos => (
                <button key={pos} type="button"
                  onClick={() => setForm(f => ({ ...f, preferred_position: pos }))}
                  className={cn(
                    'flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                    form.preferred_position === pos
                      ? posColors[pos]
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}>
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {(['attack','defense','stamina','passing'] as const).map(attr => (
            <div key={attr} className="space-y-1.5">
              <div className="flex justify-between items-center bg-secondary/20 p-2 rounded-xl border border-border/30">
                <Label className="capitalize pl-2 font-medium">{attr}</Label>
                <RatingInput value={form[attr]} onChange={(val: number) => setForm(f => ({ ...f, [attr]: val }))} />
              </div>
            </div>
          ))}

          {form.preferred_position === 'GK' && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center bg-secondary/20 p-2 rounded-xl border border-border/30">
                <Label className="pl-2 font-medium">GK Ability</Label>
                <RatingInput value={form.gk_ability} onChange={(val: number) => setForm(f => ({ ...f, gk_ability: val }))} />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Player'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}