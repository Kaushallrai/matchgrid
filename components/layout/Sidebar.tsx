'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Zap, History, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/',          label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/players',   label: 'Players',    icon: Users           },
  { href: '/generate',  label: 'Generate',   icon: Zap             },
  { href: '/matches',   label: 'Matches',    icon: History         },
  { href: '/analytics', label: 'Analytics',  icon: BarChart2       },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-border bg-card flex-col py-6 px-3 gap-1 z-10 h-full">
        <div className="px-3 mb-6">
          <h1 className="text-xl font-bold tracking-tight">
            Match<span className="text-primary">Grid</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Futsal team balancer</p>
        </div>

        <nav className="flex flex-col gap-0.5">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                path === href
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto px-3">
          <div className="rounded-lg bg-secondary p-3">
            <p className="text-xs text-muted-foreground">⚽ Select players in Generate to create balanced teams</p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card z-50">
        <div className="flex items-center justify-around p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {nav.map(({ href, label, icon: Icon }) => {
            const isActive = path === href
            return (
              <Link key={href} href={href}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg min-w-[4rem] transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}>
                <Icon size={isActive ? 22 : 20} className={cn('mb-1 transition-all', isActive && 'scale-110')} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}