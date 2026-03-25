'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function getRating(p: any) {
  return +((p.attack * 1.3 + p.defense * 1.1 + p.stamina * 0.9 + p.passing * 0.9) / 4.2 + (p.dynamic_modifier ?? 0)).toFixed(2)
}

const tooltipStyle = {
  backgroundColor: 'hsl(0 0% 10%)',
  border: '1px solid hsl(0 0% 18%)',
  borderRadius: 8,
  color: 'hsl(0 0% 94%)',
  fontSize: 12,
}

export default function AnalyticsClient({ players, stats }: { players: any[]; stats: any[] }) {
  const [selectedId, setSelectedId] = useState<string>(players[0]?.id ?? '')

  // Overall ratings bar data
  const ratingsData = [...players]
    .sort((a, b) => getRating(b) - getRating(a))
    .map(p => ({ name: p.name, rating: getRating(p) }))

  // Radar for selected player
  const sel = players.find(p => p.id === selectedId)
  const radarData = sel ? [
    { attr: 'Attack',  value: sel.attack  },
    { attr: 'Defense', value: sel.defense },
    { attr: 'Stamina', value: sel.stamina },
    { attr: 'Passing', value: sel.passing },
    { attr: 'GK',      value: sel.gk_ability },
  ] : []

  // Goals + assists aggregated
  const goalMap: Record<string, { name: string; goals: number; assists: number }> = {}
  stats.forEach(s => {
    const name = s.players?.name ?? 'Unknown'
    if (!goalMap[name]) goalMap[name] = { name, goals: 0, assists: 0 }
    goalMap[name].goals   += s.goals   ?? 0
    goalMap[name].assists += s.assists ?? 0
  })
  const goalData = Object.values(goalMap).sort((a, b) => b.goals - a.goals).slice(0, 10)

  // Win rate bar data
  const winData = players
    .filter(p => p.games_played > 0)
    .sort((a, b) => (b.wins / b.games_played) - (a.wins / a.games_played))
    .map(p => ({ name: p.name, winRate: +((p.wins / p.games_played) * 100).toFixed(0) }))

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Player performance and match statistics</p>
      </div>

      <Tabs defaultValue="ratings">
        <TabsList className="mb-4">
          <TabsTrigger value="ratings">Ratings</TabsTrigger>
          <TabsTrigger value="profile">Player Profile</TabsTrigger>
          <TabsTrigger value="goals">Goals & Assists</TabsTrigger>
          <TabsTrigger value="wins">Win Rates</TabsTrigger>
        </TabsList>

        {/* Overall ratings */}
        <TabsContent value="ratings">
          <Card>
            <CardHeader><CardTitle>Overall Player Ratings</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ratingsData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(0 0% 53%)', fontSize: 12 }} />
                  <YAxis domain={[0, 5]} tick={{ fill: 'hsl(0 0% 53%)', fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="rating" fill="hsl(142 71% 45%)" radius={[4,4,0,0]} name="Rating" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Radar chart per player */}
        <TabsContent value="profile">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Player Profile</CardTitle>
              <Select value={selectedId} onValueChange={(val) => setSelectedId(val ?? '')}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {players.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(0 0% 18%)" />
                  <PolarAngleAxis dataKey="attr" tick={{ fill: 'hsl(0 0% 53%)', fontSize: 12 }} />
                  <Radar dataKey="value" stroke="hsl(142 71% 45%)" fill="hsl(142 71% 45%)" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals & assists */}
        <TabsContent value="goals">
          <Card>
            <CardHeader><CardTitle>Goals & Assists Leaders</CardTitle></CardHeader>
            <CardContent>
              {goalData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={goalData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(0 0% 53%)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(0 0% 53%)', fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ color: 'hsl(0 0% 53%)', fontSize: 12 }} />
                    <Bar dataKey="goals"   fill="hsl(142 71% 45%)" radius={[4,4,0,0]} name="Goals"   />
                    <Bar dataKey="assists" fill="hsl(221 83% 53%)" radius={[4,4,0,0]} name="Assists" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-12">
                  Record match stats to see leaders here.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Win rates */}
        <TabsContent value="wins">
          <Card>
            <CardHeader><CardTitle>Win Rate by Player</CardTitle></CardHeader>
            <CardContent>
              {winData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={winData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(0 0% 53%)', fontSize: 12 }} />
                    <YAxis unit="%" domain={[0,100]} tick={{ fill: 'hsl(0 0% 53%)', fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                    <Bar dataKey="winRate" fill="hsl(271 91% 65%)" radius={[4,4,0,0]} name="Win rate" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-12">
                  Play some matches first to see win rates.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}