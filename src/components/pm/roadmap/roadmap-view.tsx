'use client'

import { useMemo, useState, useRef, useCallback } from 'react'
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
  ArrowUpRight,
  Filter,
  SlidersHorizontal,
  X,
  CircleDot,
  BarChart3,
  Sparkles,
  Rocket,
  Compass,
  Link2,
} from 'lucide-react'
import { usePMStore, type RoadmapItem, type RoadmapItemStatus, type TaskPriority } from '@/lib/pm-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ── Status config ──────────────────────────────────────────────
const STATUS_CONFIG: Record<
  RoadmapItemStatus,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  discovery: {
    label: 'Discovery',
    color: 'text-violet-700 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    border: 'border-violet-200 dark:border-violet-800',
    icon: <Compass className="h-3.5 w-3.5" />,
  },
  planned: {
    label: 'Planned',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    icon: <CircleDot className="h-3.5 w-3.5" />,
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    icon: <Zap className="h-3.5 w-3.5" />,
  },
  shipped: {
    label: 'Shipped',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: <Rocket className="h-3.5 w-3.5" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-200 dark:border-red-800',
    icon: <X className="h-3.5 w-3.5" />,
  },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  critical: { label: 'Critical', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/40', dot: 'bg-red-500' },
  high: { label: 'High', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/40', dot: 'bg-orange-500' },
  medium: { label: 'Medium', color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/40', dot: 'bg-yellow-500' },
  low: { label: 'Low', color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/40', dot: 'bg-green-500' },
  none: { label: 'None', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', dot: 'bg-gray-400' },
}

const CONFIDENCE_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  high: { label: 'High', color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  medium: { label: 'Medium', color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  low: { label: 'Low', color: 'text-red-500 dark:text-red-400', dot: 'bg-red-500' },
}

const CATEGORY_COLORS: Record<string, string> = {
  Core: '#10b981',
  Monetization: '#f59e0b',
  Feature: '#6366f1',
  Platform: '#8b5cf6',
  Innovation: '#ec4899',
  Infrastructure: '#06b6d4',
  Mobile: '#f97316',
  Integration: '#14b8a6',
}

// ── Helpers ────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function getConfidence(confidence: number) {
  if (confidence >= 70) return 'high'
  if (confidence >= 40) return 'medium'
  return 'low'
}

function getMonthsBetween(startStr: string, endStr: string) {
  const months: string[] = []
  const start = new Date(startStr)
  const end = new Date(endStr)
  const current = new Date(start.getFullYear(), start.getMonth(), 1)
  while (current <= end) {
    months.push(
      current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    )
    current.setMonth(current.getMonth() + 1)
  }
  return months
}

// ── Roadmap Card (List View) ───────────────────────────────────
function RoadmapCard({ item, projects }: { item: RoadmapItem; projects: { id: string; name: string }[] }) {
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.discovery
  const priCfg = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.none
  const conf = CONFIDENCE_CONFIG[getConfidence(item.confidence)]
  const project = projects.find((p) => p.id === item.projectId)
  const barColor = CATEGORY_COLORS[item.category] || '#6b7280'

  return (
    <Card className="group hover:shadow-md transition-all cursor-pointer border-l-4" style={{ borderLeftColor: barColor }}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant="outline" className={`gap-1 text-[11px] ${cfg.bg} ${cfg.color} border-0`}>
                {cfg.icon}
                {cfg.label}
              </Badge>
              <Badge variant="outline" className={`text-[10px] h-5 px-1.5 border-0 ${priCfg.bg} ${priCfg.color}`}>
                {priCfg.label}
              </Badge>
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                {item.category}
              </Badge>
            </div>
            <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[11px] text-muted-foreground">
          {/* Confidence */}
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${conf.dot}`} />
            <span className={conf.color}>{conf.label}</span> confidence
          </span>

          {/* Progress */}
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3" />
            {item.progress}%
          </span>

          {/* Dates */}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDateShort(item.startDate)} – {formatDateShort(item.endDate)}
          </span>

          {/* Project */}
          {project && (
            <span className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              {project.name}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <Progress value={item.progress} className="h-1.5" />
        </div>

        {/* Metrics & Dependencies */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {item.metrics.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
              {item.metrics.map((metric) => (
                <Badge key={metric} variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                  {metric}
                </Badge>
              ))}
            </div>
          )}
          {item.dependencies.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Link2 className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                {item.dependencies.length} dep{item.dependencies.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Timeline Row ───────────────────────────────────────────────
function TimelineRow({
  item,
  projects,
  timelineStart,
  totalDays,
  dayWidth,
}: {
  item: RoadmapItem
  projects: { id: string; name: string }[]
  timelineStart: Date
  totalDays: number
  dayWidth: number
}) {
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.discovery
  const priCfg = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.none
  const conf = CONFIDENCE_CONFIG[getConfidence(item.confidence)]
  const project = projects.find((p) => p.id === item.projectId)
  const barColor = CATEGORY_COLORS[item.category] || '#6b7280'

  const itemStart = new Date(item.startDate)
  const itemEnd = new Date(item.endDate)
  const startOffset = Math.max(0, (itemStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
  const duration = Math.max(1, (itemEnd.getTime() - itemStart.getTime()) / (1000 * 60 * 60 * 24))

  const leftPercent = (startOffset / totalDays) * 100
  const widthPercent = (duration / totalDays) * 100

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-3 py-1.5 group cursor-pointer border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
            {/* Label */}
            <div className="w-48 sm:w-56 flex-shrink-0 px-2">
              <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                {item.title}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="outline" className={`text-[9px] h-4 px-1 border-0 ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </Badge>
                {project && (
                  <span className="text-[10px] text-muted-foreground truncate">{project.name}</span>
                )}
              </div>
            </div>

            {/* Timeline bar area */}
            <div className="relative flex-1 h-8">
              {/* Today indicator */}
              <div
                className="absolute top-0 bottom-0 w-px bg-red-400/60 z-10"
                style={{
                  left: `${((new Date().getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100}%`,
                }}
              />

              {/* Bar */}
              <div
                className="absolute top-1 bottom-1 rounded-md transition-all group-hover:opacity-90"
                style={{
                  left: `${leftPercent}%`,
                  width: `${Math.max(widthPercent, 1)}%`,
                  backgroundColor: barColor,
                  opacity: 0.8,
                }}
              >
                {/* Progress fill inside bar */}
                <div
                  className="absolute inset-y-0 left-0 rounded-md bg-black/15 dark:bg-white/15"
                  style={{ width: `${item.progress}%` }}
                />
                {/* Label inside bar if wide enough */}
                {widthPercent > 12 && (
                  <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
                    <span className="text-[10px] font-medium text-white truncate drop-shadow-sm">
                      {item.progress}% – {item.title.length > 20 ? item.title.slice(0, 20) + '…' : item.title}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Side info */}
            <div className="w-20 sm:w-24 flex-shrink-0 px-2 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${conf.dot}`} />
              <span className="text-[10px] text-muted-foreground">{item.confidence}%</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm">
          <div className="space-y-1.5">
            <p className="font-semibold text-xs">{item.title}</p>
            <p className="text-[11px] text-muted-foreground">{item.description.slice(0, 150)}</p>
            <div className="flex items-center gap-2 text-[10px]">
              <Badge variant="outline" className={`text-[9px] h-4 px-1 border-0 ${cfg.bg} ${cfg.color}`}>{cfg.label}</Badge>
              <Badge variant="outline" className={`text-[9px] h-4 px-1 border-0 ${priCfg.bg} ${priCfg.color}`}>{priCfg.label}</Badge>
              <span>{item.progress}%</span>
            </div>
            <div className="text-[10px] text-muted-foreground">
              {formatDate(item.startDate)} → {formatDate(item.endDate)}
            </div>
            {item.metrics.length > 0 && (
              <div className="text-[10px]">
                <span className="text-muted-foreground">Targets: </span>
                {item.metrics.join(', ')}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ── Timeline View ──────────────────────────────────────────────
function TimelineView({
  items,
  projects,
}: {
  items: RoadmapItem[]
  projects: { id: string; name: string }[]
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const { timelineStart, timelineEnd, totalDays, months } = useMemo(() => {
    if (items.length === 0) {
      const now = new Date()
      const inSixMonths = new Date(now.getFullYear(), now.getMonth() + 6, 0)
      return {
        timelineStart: now,
        timelineEnd: inSixMonths,
        totalDays: 180,
        months: getMonthsBetween(now.toISOString(), inSixMonths.toISOString()),
      }
    }
    const starts = items.map((i) => new Date(i.startDate).getTime())
    const ends = items.map((i) => new Date(i.endDate).getTime())
    const earliest = new Date(Math.min(...starts))
    const latest = new Date(Math.max(...ends))

    // Add 1 month padding on each side
    const timelineStart = new Date(earliest.getFullYear(), earliest.getMonth() - 1, 1)
    const timelineEnd = new Date(latest.getFullYear(), latest.getMonth() + 2, 0)
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
    const months = getMonthsBetween(timelineStart.toISOString(), timelineEnd.toISOString())

    return { timelineStart, timelineEnd, totalDays, months }
  }, [items])

  const dayWidth = 3.5 // px per day for scrollable area

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Timeline View
        </CardTitle>
        <CardDescription className="text-xs">
          Horizontal timeline showing all roadmap items and their date ranges
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div ref={scrollRef} className="overflow-x-auto pb-2">
          <div className="min-w-[800px]">
            {/* Month headers */}
            <div className="flex items-center border-b border-border mb-1">
              <div className="w-48 sm:w-56 flex-shrink-0 px-2 pb-2">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Initiative
                </span>
              </div>
              <div className="flex-1 flex pb-2">
                {months.map((month) => {
                  const monthDate = new Date(month)
                  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
                  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
                  const monthOffset = Math.max(0, (monthStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
                  const monthWidth = ((monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24) + 1) / totalDays * 100

                  return (
                    <div
                      key={month}
                      className="text-[10px] text-muted-foreground text-center border-l border-border/50"
                      style={{ width: `${monthWidth}%` }}
                    >
                      {month}
                    </div>
                  )
                })}
              </div>
              <div className="w-20 sm:w-24 flex-shrink-0 px-2 pb-2">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Conf.
                </span>
              </div>
            </div>

            {/* Today line label */}
            {(() => {
              const todayOffset = (new Date().getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
              if (todayOffset >= 0 && todayOffset <= totalDays) {
                return null // We handle this in TimelineRow
              }
              return null
            })()}

            {/* Items */}
            <div>
              {items.map((item) => (
                <TimelineRow
                  key={item.id}
                  item={item}
                  projects={projects}
                  timelineStart={timelineStart}
                  totalDays={totalDays}
                  dayWidth={dayWidth}
                />
              ))}
              {items.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No roadmap items match the current filters
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── List View ──────────────────────────────────────────────────
function ListView({
  items,
  projects,
}: {
  items: RoadmapItem[]
  projects: { id: string; name: string }[]
}) {
  const grouped = useMemo(() => {
    const groups: Record<RoadmapItemStatus, RoadmapItem[]> = {
      discovery: [],
      planned: [],
      in_progress: [],
      shipped: [],
      cancelled: [],
    }
    for (const item of items) {
      if (groups[item.status]) {
        groups[item.status].push(item)
      }
    }
    return groups
  }, [items])

  const statusOrder: RoadmapItemStatus[] = ['in_progress', 'planned', 'discovery', 'shipped', 'cancelled']

  const totalItems = items.length
  const shippedCount = items.filter((i) => i.status === 'shipped').length
  const avgConfidence = totalItems > 0
    ? Math.round(items.reduce((sum, i) => sum + i.confidence, 0) / totalItems)
    : 0
  const avgProgress = totalItems > 0
    ? Math.round(items.reduce((sum, i) => sum + i.progress, 0) / totalItems)
    : 0

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-[11px] text-muted-foreground font-medium">Total Items</span>
          </div>
          <p className="text-xl font-bold">{totalItems}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="h-4 w-4 text-emerald-500" />
            <span className="text-[11px] text-muted-foreground font-medium">Shipped</span>
          </div>
          <p className="text-xl font-bold">{shippedCount}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-amber-500" />
            <span className="text-[11px] text-muted-foreground font-medium">Avg Confidence</span>
          </div>
          <p className="text-xl font-bold">{avgConfidence}%</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className="text-[11px] text-muted-foreground font-medium">Avg Progress</span>
          </div>
          <p className="text-xl font-bold">{avgProgress}%</p>
        </Card>
      </div>

      {/* Grouped by status */}
      {statusOrder.map((status) => {
        const group = grouped[status]
        if (group.length === 0) return null
        const cfg = STATUS_CONFIG[status]

        return (
          <div key={status} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {cfg.icon}
                <h3 className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</h3>
              </div>
              <Badge variant="secondary" className="text-[10px] h-5">{group.length}</Badge>
              <Separator className="flex-1" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.map((item) => (
                <RoadmapCard key={item.id} item={item} projects={projects} />
              ))}
            </div>
          </div>
        )
      })}

      {items.length === 0 && (
        <Card className="p-12 text-center">
          <Compass className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-muted-foreground">No Items Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Adjust the filters to see roadmap items
          </p>
        </Card>
      )}
    </div>
  )
}

// ── Main Roadmap View ──────────────────────────────────────────
export default function RoadmapView() {
  const { roadmap, projects } = usePMStore()
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Get unique projects and categories
  const uniqueProjects = useMemo(() => {
    const ids = new Set(roadmap.map((r) => r.projectId))
    return projects.filter((p) => ids.has(p.id))
  }, [roadmap, projects])

  const uniqueCategories = useMemo(
    () => [...new Set(roadmap.map((r) => r.category))].sort(),
    [roadmap]
  )

  const activeFilters = [
    statusFilter !== 'all' ? 1 : 0,
    projectFilter !== 'all' ? 1 : 0,
    priorityFilter !== 'all' ? 1 : 0,
    categoryFilter !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  // Filter items
  const filteredItems = useMemo(() => {
    return roadmap.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      if (projectFilter !== 'all' && item.projectId !== projectFilter) return false
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
      return true
    })
  }, [roadmap, statusFilter, projectFilter, priorityFilter, categoryFilter])

  const clearFilters = () => {
    setStatusFilter('all')
    setProjectFilter('all')
    setPriorityFilter('all')
    setCategoryFilter('all')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Product Roadmap
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plan features, track progress, and align your team on what ships next
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="sm"
            className="gap-1.5 text-xs relative"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilters > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                {activeFilters}
              </span>
            )}
          </Button>
          <Button size="sm" className="gap-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            New Item
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="animate-in slide-in-from-top-2 fade-in duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Filters
              </h3>
              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-muted-foreground" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="discovery">Discovery</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Project</label>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {uniqueProjects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-muted rounded-lg p-0.5">
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'ghost'}
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={() => setViewMode('timeline')}
          >
            <Calendar className="h-3 w-3" />
            Timeline
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={() => setViewMode('list')}
          >
            <List className="h-3 w-3" />
            List
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {filteredItems.length} of {roadmap.length} items
        </p>
      </div>

      {/* Category Legend */}
      <div className="flex flex-wrap items-center gap-3">
        {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
          <div key={category} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-[11px] text-muted-foreground">{category}</span>
          </div>
        ))}
      </div>

      {/* View Content */}
      {viewMode === 'timeline' ? (
        <TimelineView items={filteredItems} projects={projects} />
      ) : (
        <ListView items={filteredItems} projects={projects} />
      )}
    </div>
  )
}
