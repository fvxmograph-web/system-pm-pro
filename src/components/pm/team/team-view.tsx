'use client'

import { useMemo, useState } from 'react'
import { usePMStore, type TeamMember, type TeamRole } from '@/lib/pm-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { Users, UserCheck, Clock, Zap, Target } from 'lucide-react'
import { format, parseISO } from 'date-fns'

// ============================================================
// Role & Availability Color Mappings
// ============================================================

const ROLE_COLORS: Record<TeamRole, { bg: string; text: string; border: string; label: string }> = {
  pm:       { bg: 'bg-purple-100 dark:bg-purple-950/50',  text: 'text-purple-700 dark:text-purple-300',  border: 'border-purple-200 dark:border-purple-800', label: 'PM' },
  lead:     { bg: 'bg-red-100 dark:bg-red-950/50',      text: 'text-red-700 dark:text-red-300',      border: 'border-red-200 dark:border-red-800',      label: 'Lead' },
  senior:   { bg: 'bg-blue-100 dark:bg-blue-950/50',     text: 'text-blue-700 dark:text-blue-300',    border: 'border-blue-200 dark:border-blue-800',    label: 'Senior' },
  mid:      { bg: 'bg-green-100 dark:bg-green-950/50',   text: 'text-green-700 dark:text-green-300',  border: 'border-green-200 dark:border-green-800',  label: 'Mid' },
  junior:   { bg: 'bg-yellow-100 dark:bg-yellow-950/50',text: 'text-yellow-700 dark:text-yellow-300',border: 'border-yellow-200 dark:border-yellow-800',label: 'Junior' },
  designer: { bg: 'bg-pink-100 dark:bg-pink-950/50',   text: 'text-pink-700 dark:text-pink-300',   border: 'border-pink-200 dark:border-pink-800',   label: 'Designer' },
  qa:       { bg: 'bg-orange-100 dark:bg-orange-950/50',text: 'text-orange-700 dark:text-orange-300',border: 'border-orange-200 dark:border-orange-800',label: 'QA' },
  devops:   { bg: 'bg-teal-100 dark:bg-teal-950/50',    text: 'text-teal-700 dark:text-teal-300',    border: 'border-teal-200 dark:border-teal-800',    label: 'DevOps' },
}

const AVAILABILITY_CONFIG = {
  full:       { color: 'bg-green-500', label: 'Available', ring: 'ring-green-200' },
  partial:    { color: 'bg-yellow-500', label: 'Partial', ring: 'ring-yellow-200' },
  unavailable:{ color: 'bg-red-500', label: 'Unavailable', ring: 'ring-red-200' },
} as const

function getWorkloadColor(percent: number): string {
  if (percent < 80) return '#22c55e'
  if (percent <= 95) return '#eab308'
  return '#ef4444'
}

function getWorkloadLabel(percent: number): string {
  if (percent < 80) return 'Healthy'
  if (percent <= 95) return 'Heavy'
  return 'Overloaded'
}

// ============================================================
// Team Member Card
// ============================================================

function TeamMemberCard({ member }: { member: TeamMember }) {
  const tasks = usePMStore((s) => s.tasks)
  const utilization = Math.round((member.currentLoad / member.capacity) * 100)
  const assignedTasks = tasks.filter((t) => t.assigneeId === member.id && t.status !== 'done' && t.status !== 'cancelled').length
  const roleConfig = ROLE_COLORS[member.role]
  const availConfig = AVAILABILITY_CONFIG[member.availability]
  const workloadColor = getWorkloadColor(utilization)
  const initials = member.name.split(' ').map((n) => n[0]).join('')

  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        {/* Header: Avatar + Name + Email */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ${availConfig.color} ring-2 ${availConfig.ring}`}
              title={availConfig.label}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{member.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mb-3">
          <Badge variant="outline" className={`${roleConfig.bg} ${roleConfig.text} ${roleConfig.border} text-xs font-medium`}>
            {roleConfig.label}
          </Badge>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 mb-4">
          {member.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-md bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {skill}
            </span>
          ))}
          {member.skills.length > 3 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center rounded-md bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground cursor-help">
                    +{member.skills.length - 3}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{member.skills.slice(3).join(', ')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <Separator className="mb-3" />

        {/* Capacity vs Load */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-muted-foreground">Capacity</span>
            <span className="text-[11px] font-semibold" style={{ color: workloadColor }}>
              {member.currentLoad}h / {member.capacity}h ({utilization}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${utilization}%`, backgroundColor: workloadColor }}
            />
          </div>
        </div>

        {/* Bottom row: Tasks + Join date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Target className="h-3 w-3" />
            <span>{assignedTasks} tasks</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{format(parseISO(member.joinDate), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Workload Bar Chart
// ============================================================

function WorkloadChart({ members }: { members: TeamMember[] }) {
  const chartData = useMemo(() =>
    members.map((m) => {
      const pct = Math.round((m.currentLoad / m.capacity) * 100)
      return {
        name: m.name.split(' ')[0],
        fullName: m.name,
        load: m.currentLoad,
        capacity: m.capacity,
        utilization: pct,
        fill: getWorkloadColor(pct),
      }
    }).sort((a, b) => b.utilization - a.utilization),
    [members]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Team Workload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
              <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(value: number, name: string) => {
                  if (name === 'utilization') return [`${value}%`, 'Utilization']
                  return [value, name]
                }}
              />
              <Bar dataKey="load" radius={[0, 4, 4, 0]} barSize={18}>
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.fill} />
                ))}
                <LabelList dataKey="load" position="right" style={{ fontSize: 10, fill: '#888' }} formatter={(v: number, _entry: Record<string, unknown>) => `${v}h`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 justify-center">
          {[
            { color: '#22c55e', label: '< 80% Healthy' },
            { color: '#eab308', label: '80-95% Heavy' },
            { color: '#ef4444', label: '> 95% Overloaded' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
              {label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Team Stats
// ============================================================

function TeamStats({ members }: { members: TeamMember[] }) {
  const tasks = usePMStore((s) => s.tasks)

  const avgUtilization = useMemo(() => {
    const total = members.reduce((sum, m) => sum + (m.currentLoad / m.capacity) * 100, 0)
    return Math.round(total / members.length)
  }, [members])

  const allSkills = useMemo(() => {
    const skillCount: Record<string, number> = {}
    members.forEach((m) => m.skills.forEach((s) => { skillCount[s] = (skillCount[s] || 0) + 1 }))
    return Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  }, [members])

  const overloadCount = members.filter((m) => (m.currentLoad / m.capacity) * 100 > 95).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Team Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Stat row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{members.length}</div>
            <div className="text-[11px] text-muted-foreground">Members</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold" style={{ color: getWorkloadColor(avgUtilization) }}>{avgUtilization}%</div>
            <div className="text-[11px] text-muted-foreground">Avg Utilization</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold" style={{ color: overloadCount > 0 ? '#ef4444' : '#22c55e' }}>{overloadCount}</div>
            <div className="text-[11px] text-muted-foreground">Overloaded</div>
          </div>
        </div>

        <Separator />

        {/* Top Skills */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Skill Distribution</h4>
          <ScrollArea className="max-h-48">
            <div className="space-y-1.5">
              {allSkills.map(([skill, count]) => (
                <div key={skill} className="flex items-center gap-2">
                  <span className="text-xs w-28 truncate">{skill}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${(count / members.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-12 text-right">{count} members</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Availability breakdown */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Availability</h4>
          <div className="flex gap-3">
            {(['full', 'partial', 'unavailable'] as const).map((status) => {
              const cfg = AVAILABILITY_CONFIG[status]
              const count = members.filter((m) => m.availability === status).length
              return (
                <div key={status} className="flex items-center gap-1.5 text-xs">
                  <span className={`h-2.5 w-2.5 rounded-full ${cfg.color}`} />
                  <span className="text-muted-foreground">{cfg.label}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Main Team View
// ============================================================

export default function TeamView() {
  const members = usePMStore((s) => s.team)
  const tasks = usePMStore((s) => s.tasks)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return members
    const q = search.toLowerCase()
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.skills.some((s) => s.toLowerCase().includes(q))
    )
  }, [members, search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" />
            Team Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your team's workload, skills, and availability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-56 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Member Grid</TabsTrigger>
          <TabsTrigger value="workload">Workload View</TabsTrigger>
          <TabsTrigger value="stats">Team Stats</TabsTrigger>
        </TabsList>

        {/* Grid Tab */}
        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No team members found</div>
          )}
        </TabsContent>

        {/* Workload Tab */}
        <TabsContent value="workload" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <WorkloadChart members={filtered} />
            </div>
            <div>
              <TeamStats members={members} />
            </div>
          </div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TeamStats members={members} />
            <WorkloadChart members={filtered} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
