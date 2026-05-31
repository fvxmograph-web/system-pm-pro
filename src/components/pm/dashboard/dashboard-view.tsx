'use client'

import { useMemo } from 'react'
import {
  FolderKanban,
  CheckCircle2,
  Zap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Play,
  Map,
  MessageSquare,
  Clock,
  CircleDot,
  ArrowUpRight,
  Avatar,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { usePMStore } from '@/lib/pm-store'
import type { TaskStatus } from '@/lib/pm-store'

// ──────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: '#6b7280',
  todo: '#3b82f6',
  in_progress: '#8b5cf6',
  in_review: '#f59e0b',
  testing: '#06b6d4',
  blocked: '#ef4444',
  done: '#22c55e',
  cancelled: '#9ca3af',
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  testing: 'Testing',
  blocked: 'Blocked',
  done: 'Done',
  cancelled: 'Cancelled',
}

const ROLE_LABELS: Record<string, string> = {
  pm: 'PM',
  lead: 'Tech Lead',
  senior: 'Senior',
  mid: 'Mid',
  junior: 'Junior',
  designer: 'Designer',
  qa: 'QA',
  devops: 'DevOps',
}

// ──────────────────────────────────────────────────────────────
// KPI Card
// ──────────────────────────────────────────────────────────────

interface KPICardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  iconBg: string
  trend: number
  trendLabel: string
  subtext?: string
}

function KPICard({ label, value, icon, iconBg, trend, trendLabel, subtext }: KPICardProps) {
  const isUp = trend >= 0
  return (
    <Card className="relative overflow-hidden group hover:shadow-md hover:shadow-violet-500/5 transition-all duration-300 hover:-translate-y-0.5">
      <div className={`absolute top-0 left-0 w-full h-1 ${iconBg}`} />
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtext && (
              <p className="text-xs text-muted-foreground">{subtext}</p>
            )}
          </div>
          <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${iconBg} shrink-0`}>
            {icon}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          {isUp ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className={`text-xs font-medium ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
            {isUp ? '+' : ''}{trend}%
          </span>
          <span className="text-xs text-muted-foreground">{trendLabel}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────────
// Custom Tooltip for Charts
// ──────────────────────────────────────────────────────────────

function ChartTooltipStyle({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Sprint Velocity Chart
// ──────────────────────────────────────────────────────────────

function SprintVelocityChart() {
  const { sprints } = usePMStore()

  const data = useMemo(() =>
    sprints.map((s) => ({
      name: s.name.replace('Sprint ', 'S'),
      planned: s.plannedPoints,
      actual: s.completedPoints,
    })),
    [sprints],
  )

  return (
    <Card className="hover:shadow-md hover:shadow-violet-500/5 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-base">Sprint Velocity</CardTitle>
        <CardDescription>Planned vs completed story points</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltipStyle />} />
            <Line
              type="monotone"
              dataKey="planned"
              name="Planned"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              activeDot={{ r: 6, fill: '#8b5cf6', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="#22c55e"
              strokeWidth={2.5}
              strokeDasharray="6 3"
              dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              activeDot={{ r: 6, fill: '#22c55e', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────────
// Task Status Donut Chart
// ──────────────────────────────────────────────────────────────

function TaskStatusChart() {
  const { tasks } = usePMStore()

  const data = useMemo(() => {
    const counts: Partial<Record<TaskStatus, number>> = {}
    for (const t of tasks) {
      counts[t.status] = (counts[t.status] || 0) + 1
    }
    return (Object.entries(counts) as [TaskStatus, number][])
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: STATUS_LABELS[status],
        value: count,
        color: STATUS_COLORS[status],
      }))
  }, [tasks])

  return (
    <Card className="hover:shadow-md hover:shadow-violet-500/5 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-base">Task Status Distribution</CardTitle>
        <CardDescription>Tasks grouped by current status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="55%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltipStyle />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 min-w-0">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground truncate">{entry.name}</span>
                <span className="font-semibold tabular-nums ml-auto">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────────
// Project Progress Bars
// ──────────────────────────────────────────────────────────────

function ProjectProgressChart() {
  const { projects } = usePMStore()

  return (
    <Card className="hover:shadow-md hover:shadow-violet-500/5 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-base">Project Progress</CardTitle>
        <CardDescription>Overall completion per project</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {projects.map((project) => (
          <div key={project.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium truncate mr-2">{project.name}</span>
              <span className="font-semibold tabular-nums text-muted-foreground shrink-0">
                {project.progress}%
              </span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-primary/15">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${project.progress}%`,
                  background:
                    project.progress >= 70
                      ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                      : project.progress >= 30
                        ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)'
                        : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {project.completedTasks}/{project.tasksCount} tasks
              </span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {project.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────────
// Team Workload
// ──────────────────────────────────────────────────────────────

function TeamWorkload() {
  const { team } = usePMStore()

  return (
    <Card className="hover:shadow-md hover:shadow-violet-500/5 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-base">Team Workload</CardTitle>
        <CardDescription>Current allocation vs capacity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {team.map((member) => {
          const pct = Math.round((member.currentLoad / member.capacity) * 100)
          const color =
            pct > 95
              ? 'bg-red-500'
              : pct > 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'

          return (
            <div key={member.id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border border-border">
                <img src={member.avatar} alt={member.name} className="rounded-full object-cover" />
              </Avatar>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium truncate">{member.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0">
                      {ROLE_LABELS[member.role] || member.role}
                    </span>
                  </div>
                  <span className={`font-semibold tabular-nums shrink-0 ${pct > 95 ? 'text-red-500' : pct > 80 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {pct}%
                  </span>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
        <div className="flex items-center gap-4 pt-2 text-[10px] text-muted-foreground border-t">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-emerald-500" />
            &lt; 80%
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-amber-500" />
            80-95%
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-red-500" />
            &gt; 95%
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────────
// Recent Activity
// ──────────────────────────────────────────────────────────────

function RecentActivity() {
  const { tasks, team } = usePMStore()

  const activities = useMemo(() => {
    const items: {
      id: string
      type: 'status' | 'comment' | 'deadline'
      taskKey: string
      title: string
      detail: string
      time: string
      color: string
    }[] = []

    // Recent status changes (tasks updated recently)
    const recentTasks = [...tasks]
      .filter((t) => t.updatedAt && t.status !== 'backlog')
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 4)

    for (const task of recentTasks) {
      const statusColor =
        task.status === 'done'
          ? 'text-emerald-500'
          : task.status === 'in_progress'
            ? 'text-violet-500'
            : task.status === 'in_review'
              ? 'text-amber-500'
              : 'text-muted-foreground'

      items.push({
        id: task.id,
        type: 'status',
        taskKey: task.key,
        title: task.title.length > 55 ? task.title.slice(0, 55) + '...' : task.title,
        detail: STATUS_LABELS[task.status],
        time: task.updatedAt,
        color: statusColor,
      })
    }

    // Recent comments
    for (const task of tasks) {
      for (const comment of task.comments.slice(-1)) {
        const author = team.find((m) => m.id === comment.authorId)
        items.push({
          id: comment.id,
          type: 'comment',
          taskKey: task.key,
          title: comment.content.length > 55 ? comment.content.slice(0, 55) + '...' : comment.content,
          detail: author?.name.split(' ')[0] || 'Unknown',
          time: comment.createdAt,
          color: 'text-blue-400',
        })
      }
    }

    // Upcoming deadlines
    const upcoming = tasks
      .filter((t) => t.dueDate && t.status !== 'done' && t.status !== 'cancelled')
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
      .slice(0, 3)

    for (const task of upcoming) {
      items.push({
        id: `deadline-${task.id}`,
        type: 'deadline',
        taskKey: task.key,
        title: task.title.length > 55 ? task.title.slice(0, 55) + '...' : task.title,
        detail: task.dueDate ? `Due ${task.dueDate}` : 'No date',
        time: task.dueDate || task.updatedAt,
        color: 'text-red-400',
      })
    }

    return items.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 8)
  }, [tasks, team])

  return (
    <Card className="hover:shadow-md hover:shadow-violet-500/5 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
        <CardDescription>Latest updates across all projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {activities.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors"
            >
              <div className="mt-0.5 shrink-0">
                {item.type === 'status' && (
                  <CircleDot className={`w-4 h-4 ${item.color}`} />
                )}
                {item.type === 'comment' && (
                  <MessageSquare className={`w-4 h-4 ${item.color}`} />
                )}
                {item.type === 'deadline' && (
                  <Clock className={`w-4 h-4 ${item.color}`} />
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-sm leading-snug truncate">
                  <span className="font-mono text-xs font-semibold text-violet-400 mr-1.5">
                    {item.taskKey}
                  </span>
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────────
// Main Dashboard View
// ──────────────────────────────────────────────────────────────

export default function DashboardView() {
  const { projects, tasks, sprints, team } = usePMStore()

  // ── KPI Calculations ──

  const kpis = useMemo(() => {
    // 1. Total Projects (active ones)
    const activeProjects = projects.filter((p) => p.status === 'active' || p.status === 'planning')
    const totalProjects = activeProjects.length

    // 2. Tasks Completion
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === 'done').length
    const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // 3. Team Velocity
    const completedSprints = sprints.filter((s) => s.status === 'completed' && s.completedPoints > 0)
    const avgVelocity =
      completedSprints.length > 0
        ? Math.round(completedSprints.reduce((acc, s) => acc + s.completedPoints, 0) / completedSprints.length)
        : 0

    // 4. Budget Health
    const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0)
    const totalSpent = projects.reduce((acc, p) => acc + p.spent, 0)
    const budgetPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

    return { totalProjects, completionPct, avgVelocity, budgetPct, totalTasks, completedTasks, totalSpent, totalBudget }
  }, [projects, tasks, sprints])

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Overview of your projects, tasks, and team performance.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white">
              <Plus className="w-4 h-4" />
              Create Task
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Play className="w-4 h-4" />
              Start Sprint
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Map className="w-4 h-4" />
              View Roadmap
            </Button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard
            label="Total Projects"
            value={kpis.totalProjects}
            icon={<FolderKanban className="w-5 h-5 text-violet-600" />}
            iconBg="bg-violet-100 dark:bg-violet-950/40"
            trend={12}
            trendLabel="vs last month"
          />
          <KPICard
            label="Tasks Completion"
            value={`${kpis.completionPct}%`}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-100 dark:bg-emerald-950/40"
            trend={8}
            trendLabel={`${kpis.completedTasks}/${kpis.totalTasks} tasks`}
            subtext={`${kpis.completedTasks} of ${kpis.totalTasks} completed`}
          />
          <KPICard
            label="Team Velocity"
            value={`${kpis.avgVelocity} pts`}
            icon={<Zap className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-100 dark:bg-amber-950/40"
            trend={-4}
            trendLabel="avg per sprint"
            subtext="From completed sprints"
          />
          <KPICard
            label="Budget Health"
            value={`${kpis.budgetPct}%`}
            icon={<DollarSign className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-100 dark:bg-blue-950/40"
            trend={-2}
            trendLabel="budget utilization"
            subtext={`$${(kpis.totalSpent / 1000).toFixed(0)}K / $${(kpis.totalBudget / 1000).toFixed(0)}K`}
          />
        </div>

        {/* ── Charts Section (2x2) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SprintVelocityChart />
          <TaskStatusChart />
          <ProjectProgressChart />
          <TeamWorkload />
        </div>

        {/* ── Bottom Row: Activity + Quick Stats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>

          {/* Quick Stats / Sprint Summary */}
          <Card className="hover:shadow-md hover:shadow-violet-500/5 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-base">Current Sprint</CardTitle>
              <CardSummaryContent />
            </CardHeader>
            <CardContent>
              <SprintSummaryContent />
            </CardContent>
          </Card>
        </div>

      </div>
    </main>
  )
}

// ── Helper sub-components ──

function CardSummaryContent() {
  const { sprints } = usePMStore()
  const active = sprints.find((s) => s.status === 'active')
  return (
    <CardDescription>
      {active
        ? `${active.name} · ${active.startDate} → ${active.endDate}`
        : 'No active sprint'}
    </CardDescription>
  )
}

function SprintSummaryContent() {
  const { sprints, tasks, team } = usePMStore()
  const active = sprints.find((s) => s.status === 'active')

  if (!active) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        No active sprint. Start a new sprint to track progress.
      </div>
    )
  }

  const sprintTasks = active.tasks
    .map((id) => tasks.find((t) => t.id === id))
    .filter(Boolean)

  const doneCount = sprintTasks.filter((t) => t.status === 'done').length
  const totalPts = active.plannedPoints
  const completedPts = active.completedPoints
  const pct = totalPts > 0 ? Math.round((completedPts / totalPts) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Goal */}
      <p className="text-sm text-muted-foreground italic">{active.goal}</p>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Points Completed</span>
          <span className="font-semibold tabular-nums text-violet-400">
            {completedPts}/{totalPts}
          </span>
        </div>
        <Progress value={pct} className="h-2" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-2xl font-bold tabular-nums">{sprintTasks.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Total Tasks</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-2xl font-bold tabular-nums text-emerald-500">{doneCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Completed</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-2xl font-bold tabular-nums text-amber-500">
            {sprintTasks.filter((t) => t.status === 'in_progress').length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">In Progress</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-2xl font-bold tabular-nums">
            {team.filter((m) =>
              sprintTasks.some((t) => t.assigneeId === m.id && t.status !== 'done'),
            ).length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Active Members</p>
        </div>
      </div>
    </div>
  )
}
