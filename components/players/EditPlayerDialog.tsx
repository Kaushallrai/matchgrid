'use client'
import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function EditPlayerDialog({ player }: { player: any }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name:               player.name,
    preferred_position: player.preferred_position,
    attack:             player.attack,
    defense:            player.defense,
    stamina:            player.stamina,
    passing:            player.passing,
    gk_ability:         player.gk_ability,
  })
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('players').update(form).eq('id', player.id)
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  async function handleDelete() {
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('players').delete().eq('id', player.id)
    setDeleting(false)
    setOpen(false)
    router.refresh()
  }

  const positions = ['GK', 'DEF', 'MID', 'FWD']
  const posColors: Record<string, string> = {
    GK:  'border-amber-500 bg-amber-500/10 text-amber-400',
    DEF: 'border-blue-500 bg-blue-500/10 text-blue-400',
    MID: 'border-purple-500 bg-purple-500/10 text-purple-400',
    FWD: 'border-red-500 bg-red-500/10 text-red-400',
  }

  const attrs = [
    { key: 'attack',     label: 'Attack'     },
    { key: 'defense',    label: 'Defense'    },
    { key: 'stamina',    label: 'Stamina'    },
    { key: 'passing',    label: 'Passing'    },
  ] as const

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" />
      }>
        <Pencil size={13} />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">

          {/* Name */}
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          {/* Position */}
          <div className="space-y-1.5">
            <Label>Position</Label>
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

          {/* Skill sliders */}
          {attrs.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>{label}</Label>
                <div className="flex items-center gap-2">
                  {/* Show dots for visual rating */}
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button"
                      onClick={() => setForm(f => ({ ...f, [key]: n }))}
                      className={cn(
                        'w-5 h-5 rounded-full border text-xs font-bold transition-colors',
                        form[key] >= n
                          ? 'bg-primary border-primary text-black'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      )}>
                    </button>
                  ))}
                  <span className="text-sm font-semibold text-primary w-4 text-right">
                    {form[key]}
                  </span>
                </div>
              </div>
              <Slider
                min={1} max={5} step={1}
                value={[form[key]]}
                onValueChange={(v: any) => setForm(f => ({ ...f, [key]: Array.isArray(v) ? v[0] : v }))}
              />
            </div>
          ))}

          {/* GK ability — only if GK */}
          {form.preferred_position === 'GK' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>GK Ability</Label>
                <span className="text-sm font-semibold text-primary">{form.gk_ability}</span>
              </div>
              <Slider
                min={1} max={5} step={1}
                value={[form.gk_ability]}
                onValueChange={(v: any) => setForm(f => ({ ...f, gk_ability: Array.isArray(v) ? v[0] : v }))}
              />
            </div>
          )}

        </div>

        {/* Footer — save + delete */}
        <div className="flex gap-3 pt-2">

          {/* Delete with confirmation */}
          <AlertDialog>
            <AlertDialogTrigger render={
              <Button variant="outline" size="icon" className="text-destructive border-destructive/30 hover:bg-destructive/10" />
            }>
              <Trash2 size={14} />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {player.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove the player and all their match stats. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleting ? 'Deleting...' : 'Yes, delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}