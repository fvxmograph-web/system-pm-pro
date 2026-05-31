'use client'

import { useMemo, useState } from 'react'
import {
  Zap,
  Target,
  ChevronRight,
  Clock,
  TrendingUp,
  Calendar,
  Eye,
  List,
  GitBranch,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  GripVertical,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Activity,
  Timer,
} from 'lucide-react'
import { usePMStore, type Sprint, type Task, type TaskStatus } from '@/lib/pm-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'

// ── Status config ──────────────────────────────────────────────
const SPRINT_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; border: string; bg: string; icon: React.ReactNode }
> = {
  active: {
    label: 'Active',
    color: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    icon: <Play className="h-3.5 w-3.5" />,
  },
  planning: {
    label: 'Planning',
    color: 'text-blue-700 dark:text-blue-400',
    border: 'border-l-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    icon: <Pause className="h-3.5 w-3.5" />,
  },
  completed: {
    label: 'Completed',
    color: 'text-muted-foreground',
    border: 'border-l-gray-400 dark:border-l-gray-600',
    bg: 'bg-gray-50 dark:bg-gray-900/40',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600 dark:text-red-400',
    border: 'border-l-red-400',
    bg: 'bg-red-50 dark:bg-red-950/40',
    icon: <RotateCcw className="h-3.5 w-3.5" />,
  },
}

const TASK_STATUS_ORDER: TaskStatus[] = [
  'todo',
  'in_progress',
  'in_review',
  'testing',
  'blocked',
  'done',
]

const TASK_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  backlog: { label: 'Backlog', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', dot: 'bg-gray-400' },
  todo: { label: 'To Do', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', dot: 'bg-slate-400' },
  in_progress: { label: 'In Progress', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40', dot: 'bg-blue-500' },
  in_review: { label: 'In Review', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', dot: 'bg-amber-500' },
  testing: { label: 'Testing', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40', dot: 'bg-purple-500' },
  blocked: { label: 'Blocked', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40', dot: 'bg-red-500' },
  done: { label: 'Done', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800', dot: 'bg-gray-300' },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critical', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/40' },
  high: { label: 'High', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/40' },
  medium: { label: 'Medium', color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/40' },
  low: { label: 'Low', color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/40' },
  none: { label: 'None', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
}

// ── Velocity chart config ──────────────────────────────────────
const velocityChartConfig = {
  completed: { label: 'Completed', color: '#10b981' },
  planned: { label: 'Planned', color: '#94a3b8' },
} satisfies ChartConfig

// ── Burndown chart config ─────────────────────────────────────
const burndownChartConfig = {
  ideal: { label: 'Ideal', color: '#94a3b8' },
  actual: { label: 'Actual', color: '#10b981' },
} satisfies ChartConfig

// ── Helpers ────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function daysBetween(a: string, b: string) {
  return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24))
}

// ── Sprint Card ────────────────────────────────────────────────
function SprintCard({
  sprint,
  taskCounts,
  isSelected,
  onClick,
}: {
  sprint: Sprint
  taskCounts: { total: number; done: number; inProgress: number }
  isSelected: boolean
  onClick: () => void
}) {
  const cfg = SPRINT_STATUS_CONFIG[sprint.status] || SPRINT_STATUS_CONFIG.planning
  const pct = sprint.plannedPoints > 0 ? Math.round((sprint.completedPoints / sprint.plannedPoints) * 100) : 0

  return (
    <Card
      className={`cursor-pointer border-l-4 transition-all hover:shadow-md ${cfg.border} ${
        isSelected ? 'ring-2 ring-primary/30 shadow-md' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={`gap-1 text-[11px] ${cfg.bg} ${cfg.color} border-0`}>
                {cfg.icon}
                {cfg.label}
              </Badge>
              {sprint.velocity > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="gap-1 text-[11px]">
                        <Zap className="h-3 w-3 text-amber-500" />
                        {sprint.velocity} pts
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent><p>Velocity: {sprint.velocity} story points</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <h3 className="font-semibold text-sm leading-tight mb-1 truncate">{sprint.name}</h3>
            {sprint.goal && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{sprint.goal}</p>
            )}
          </div>
          <ChevronRight className={`h-4 w-4 mt-1 text-muted-foreground transition-transform ${isSelected ? 'rotate-90' : ''}`} />
        </div>

        <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
          </span>
          <span className="flex items-center gap-1">
            <List className="h-3 w-3" />
            {taskCounts.total} tasks
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              {sprint.completedPoints} / {sprint.plannedPoints} pts
            </span>
            <span className={`font-medium ${cfg.color}`}>{pct}%</span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>

        {/* Task breakdown */}
        <div className="flex items-center gap-3 mt-2 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> {taskCounts.done} done
          </span>
          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <Activity className="h-3 w-3" /> {taskCounts.inProgress} active
          </span>
          <span className="text-muted-foreground">
            {taskCounts.total - taskCounts.done - taskCounts.inProgress} remaining
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Task Mini Card (for kanban) ────────────────────────────────
function TaskMiniCard({ task }: { task: Task }) {
  const priCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.none
  const statusCfg = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.backlog

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`rounded-md border p-2.5 cursor-pointer transition-all hover:shadow-sm hover:border-primary/30 ${statusCfg.bg}`}>
            <div className="flex items-start justify-between gap-1">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium leading-tight truncate">{task.title}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-muted-foreground font-mono">{task.key}</span>
                  {task.storyPoints && (
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-mono">
                      {task.storyPoints}p
                    </Badge>
                  )}
                </div>
              </div>
              <Badge variant="outline" className={`text-[10px] h-4 px-1.5 border-0 shrink-0 ${priCfg.bg} ${priCfg.color}`}>
                {priCfg.label}
              </Badge>
            </div>
            {task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {task.labels.slice(0, 3).map((label) => (
                  <span key={label} className="text-[10px] text-muted-foreground bg-muted rounded px-1 py-0.5">
                    {label}
                  </span>
                ))}
                {task.labels.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">+{task.labels.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="font-medium text-xs">{task.title}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{task.description.slice(0, 120)}...</p>
          {task.assigneeId && <p className="text-[11px] mt-1">Assignee: {task.assigneeId}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ── Backlog Item ───────────────────────────────────────────────
function BacklogItem({ task, onAddToSprint }: { task: Task; onAddToSprint: (taskId: string) => void }) {
  const priCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.none

  return (
    <div className="flex items-center gap-2 p-2 rounded-md border border-dashed border-muted-foreground/30 hover:border-primary/40 hover:bg-muted/50 transition-all group">
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 cursor-grab shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{task.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground font-mono">{task.key}</span>
          {task.storyPoints && (
            <span className="text-[10px] text-muted-foreground">{task.storyPoints} pts</span>
          )}
          <Badge variant="outline" className={`text-[10px] h-4 px-1.5 border-0 ${priCfg.bg} ${priCfg.color}`}>
            {priCfg.label}
          </Badge>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={() => onAddToSprint(task.id)}
      >
        <ArrowRight className="h-3 w-3 mr-1" />
        Add
      </Button>
    </div>
  )
}

// ── Velocity Chart ─────────────────────────────────────────────
function VelocityChart({ sprints }: { sprints: Sprint[] }) {
  const completedSprints = sprints.filter((s) => s.status === 'completed' || s.status === 'active')

  const data = completedSprints.map((s) => ({
    name: s.name.replace(/Sprint \d+ - /, 'S').replace('Sprint ', 'S'),
    completed: s.completedPoints,
    planned: s.plannedPoints,
  }))

  if (data.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Sprint Velocity
        </CardTitle>
        <CardDescription className="text-xs">Story points per sprint</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ChartContainer config={velocityChartConfig} className="h-[200px] w-full">
          <ComposedChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="planned" fill="var(--color-planned)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// ── Burndown Chart ─────────────────────────────────────────────
function BurndownChart({ sprint }: { sprint: Sprint }) {
  const totalDays = daysBetween(sprint.startDate, sprint.endDate)
  const pointsPerDay = totalDays > 0 ? sprint.plannedPoints / totalDays : 0

  // Generate ideal burndown
  const idealData = Array.from({ length: totalDays + 1 }, (_, i) => ({
    day: `Day ${i}`,
    dayIndex: i,
    ideal: Math.max(0, Math.round((sprint.plannedPoints - pointsPerDay * i) * 10) / 10),
    actual: i === 0
      ? sprint.plannedPoints
      : i <= Math.floor(totalDays * 0.4)
        ? Math.round(sprint.plannedPoints * (1 - i / totalDays * 0.6))
        : i <= Math.floor(totalDays * 0.7)
          ? Math.round(sprint.plannedPoints * 0.6 - (i - totalDays * 0.4) / (totalDays * 0.3) * sprint.plannedPoints * 0.2)
          : Math.round(sprint.plannedPoints * 0.4 - (i - totalDays * 0.7) / (totalDays * 0.3) * sprint.plannedPoints * 0.2),
  }))

  // Simulate actual burndown (slower than ideal for realism)
  const data = idealData.map((d) => ({
    ...d,
    actual: Math.max(0, d.actual + Math.random() * sprint.plannedPoints * 0.08),
  }))
  data[data.length - 1].actual = data[data.length - 1].ideal // End at same point for realism

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          Burndown Chart
        </CardTitle>
        <CardDescription className="text-xs">
          Remaining points vs sprint days
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ChartContainer config={burndownChartConfig} className="h-[200px] w-full">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
              interval={Math.floor(data.length / 6) || 1}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceLine
              y={0}
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
            />
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="var(--color-ideal)"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="var(--color-actual)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// ── Sprint Stats ───────────────────────────────────────────────
function SprintStats({ sprint, sprintTasks }: { sprint: Sprint; sprintTasks: Task[] }) {
  const doneTasks = sprintTasks.filter((t) => t.status === 'done')
  const donePoints = doneTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0)
  const totalSubtasks = sprintTasks.reduce((acc, t) => acc + t.subtasks.length, 0)
  const doneSubtasks = sprintTasks.reduce((acc, t) => acc + t.subtasks.filter((s) => s.completed).length, 0)
  const avgCycleTime = 2.4 // Simulated

  const stats = [
    {
      label: 'Tasks Completed',
      value: `${doneTasks.length}/${sprintTasks.length}`,
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      sub: `${Math.round((doneTasks.length / Math.max(sprintTasks.length, 1)) * 100)}% completion`,
    },
    {
      label: 'Points Completed',
      value: `${donePoints}/${sprint.plannedPoints}`,
      icon: <Zap className="h-4 w-4 text-amber-500" />,
      sub: `${sprint.velocity || '-'} velocity`,
    },
    {
      label: 'Subtasks',
      value: `${doneSubtasks}/${totalSubtasks}`,
      icon: <GitBranch className="h-4 w-4 text-blue-500" />,
      sub: `${totalSubtasks > 0 ? Math.round((doneSubtasks / totalSubtasks) * 100) : 0}% done`,
    },
    {
      label: 'Avg Cycle Time',
      value: `${avgCycleTime}d`,
      icon: <Timer className="h-4 w-4 text-purple-500" />,
      sub: 'Estimated average',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-3">
          <div className="flex items-center gap-2 mb-1">
            {stat.icon}
            <span className="text-[11px] text-muted-foreground font-medium">{stat.label}</span>
          </div>
          <p className="text-lg font-bold">{stat.value}</p>
          <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
        </Card>
      ))}
    </div>
  )
}

// ── Main Sprints View ──────────────────────────────────────────
export default function SprintsView() {
  const { sprints, tasks, projects } = usePMStore()
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>('__init__')
  const [showBacklog, setShowBacklog] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Find active sprint
  const activeSprint = useMemo(() => sprints.find((s) => s.status === 'active') || null, [sprints])

  // Initialize selected sprint to active (derived)
  const effectiveSprintId = selectedSprintId || activeSprint?.id || null

  const selectedSprint = useMemo(
    () => sprints.find((s) => s.id === effectiveSprintId) || null,
    [sprints, effectiveSprintId]
  )

  // Sprint tasks
  const sprintTasks = useMemo(
    () => tasks.filter((t) => selectedSprint?.tasks.includes(t.id)),
    [tasks, selectedSprint]
  )

  // Backlog tasks (no sprint assigned)
  const backlogTasks = useMemo(
    () => tasks.filter((t) => t.sprintId === null && t.status !== 'done' && t.status !== 'cancelled'),
    [tasks]
  )

  // Tasks grouped by status for kanban
  const kanbanGroups = useMemo(() => {
    const groups: Record<string, Task[]> = {}
    for (const status of TASK_STATUS_ORDER) {
      const group = sprintTasks.filter((t) => t.status === status)
      if (group.length > 0) groups[status] = group
    }
    return groups
  }, [sprintTasks])

  // Task counts per sprint
  const sprintTaskCounts = useMemo(() => {
    const counts: Record<string, { total: number; done: number; inProgress: number }> = {}
    for (const sprint of sprints) {
      const st = tasks.filter((t) => sprint.tasks.includes(t.id))
      counts[sprint.id] = {
        total: st.length,
        done: st.filter((t) => t.status === 'done').length,
        inProgress: st.filter((t) => t.status === 'in_progress').length,
      }
    }
    return counts
  }, [sprints, tasks])

  const handleAddToSprint = (taskId: string) => {
    if (!selectedSprint) return
    setNotification(`Task added to ${selectedSprint.name}`)
    setTimeout(() => setNotification(null), 2500)
  }

  const selectedProject = selectedSprint
    ? projects.find((p) => p.id === selectedSprint.projectId)
    : null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Sprint Planning
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage sprints, track velocity, and monitor progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Eye className="h-3.5 w-3.5" />
            View All
          </Button>
          <Button size="sm" className="gap-1.5 text-xs">
            <Zap className="h-3.5 w-3.5" />
            New Sprint
          </Button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <CheckCircle2 className="h-4 w-4" />
          {notification}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sprint List */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Sprints
            </h2>
            <Badge variant="secondary" className="text-[10px]">{sprints.length} total</Badge>
          </div>
          <ScrollArea className="max-h-[calc(100vh-220px)]">
            <div className="space-y-2 pr-3">
              {sprints
                .sort((a, b) => {
                  const order = { active: 0, planning: 1, completed: 2, cancelled: 3 }
                  return (order[a.status] ?? 4) - (order[b.status] ?? 4)
                })
                .map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    taskCounts={sprintTaskCounts[sprint.id] || { total: 0, done: 0, inProgress: 0 }}
                    isSelected={effectiveSprintId === sprint.id}
                    onClick={() => setSelectedSprintId(sprint.id)}
                  />
                ))}
            </div>
          </ScrollArea>

          {/* Backlog toggle */}
          <Separator className="my-3" />
          <button
            onClick={() => setShowBacklog(!showBacklog)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            {showBacklog ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Backlog
            <Badge variant="secondary" className="text-[10px] ml-auto">{backlogTasks.length}</Badge>
          </button>
          {showBacklog && (
            <ScrollArea className="max-h-64">
              <div className="space-y-1.5 pr-3">
                {backlogTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No backlog items</p>
                ) : (
                  backlogTasks.map((task) => (
                    <BacklogItem key={task.id} task={task} onAddToSprint={handleAddToSprint} />
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Sprint Detail */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          {!selectedSprint ? (
            <Card className="p-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-muted-foreground">Select a Sprint</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a sprint from the list to view details, charts, and task board
              </p>
            </Card>
          ) : (
            <>
              {/* Sprint Header */}
              <Card className={`border-l-4 ${SPRINT_STATUS_CONFIG[selectedSprint.status].border}`}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`gap-1 text-xs ${SPRINT_STATUS_CONFIG[selectedSprint.status].bg} ${SPRINT_STATUS_CONFIG[selectedSprint.status].color} border-0`}>
                          {SPRINT_STATUS_CONFIG[selectedSprint.status].icon}
                          {SPRINT_STATUS_CONFIG[selectedSprint.status].label}
                        </Badge>
                        {selectedProject && (
                          <Badge variant="secondary" className="text-[10px]">
                            {selectedProject.name}
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-lg font-bold">{selectedSprint.name}</h2>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {selectedSprint.goal}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-[11px] text-muted-foreground">Duration</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(selectedSprint.startDate)} – {formatDate(selectedSprint.endDate)}
                        </p>
                      </div>
                      <Separator orientation="vertical" className="h-8" />
                      <div className="text-right">
                        <p className="text-[11px] text-muted-foreground">Points</p>
                        <p className="text-sm font-bold">
                          {selectedSprint.completedPoints}
                          <span className="text-muted-foreground font-normal">/{selectedSprint.plannedPoints}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sprint Goal Progress */}
                  <div className="mt-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5" />
                        Sprint Progress
                      </span>
                      <span className="text-xs font-bold">
                        {selectedSprint.plannedPoints > 0
                          ? Math.round((selectedSprint.completedPoints / selectedSprint.plannedPoints) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        selectedSprint.plannedPoints > 0
                          ? (selectedSprint.completedPoints / selectedSprint.plannedPoints) * 100
                          : 0
                      }
                      className="h-2"
                    />
                    <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                      <span>{selectedSprint.completedPoints} pts completed</span>
                      <span>{selectedSprint.plannedPoints - selectedSprint.completedPoints} pts remaining</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sprint Stats */}
              <SprintStats sprint={selectedSprint} sprintTasks={sprintTasks} />

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <VelocityChart sprints={sprints} />
                {selectedSprint.status === 'active' && <BurndownChart sprint={selectedSprint} />}
              </div>

              {/* Task Board / Kanban */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <List className="h-4 w-4 text-muted-foreground" />
                        Task Board
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {sprintTasks.length} tasks in this sprint
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {sprintTasks.filter((t) => t.status === 'done').length}/{sprintTasks.length} done
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ScrollArea className="w-full">
                    <div className="flex gap-3 min-w-max pb-2">
                      {TASK_STATUS_ORDER.map((status) => {
                        const groupTasks = kanbanGroups[status]
                        if (!groupTasks) return null
                        const cfg = TASK_STATUS_CONFIG[status]

                        return (
                          <div key={status} className="flex-shrink-0 w-[260px]">
                            <div className="flex items-center gap-2 mb-2 px-1">
                              <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                              <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-auto">
                                {groupTasks.length}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              {groupTasks.map((task) => (
                                <TaskMiniCard key={task.id} task={task} />
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Retrospective (for completed sprints) */}
              {selectedSprint.status === 'completed' && selectedSprint.retrospective && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-muted-foreground" />
                      Sprint Retrospective
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {selectedSprint.retrospective}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
