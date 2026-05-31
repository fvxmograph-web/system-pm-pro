'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { usePMStore, type Task, type TaskType, type TaskPriority, type TaskStatus, type TeamMember } from '@/lib/pm-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import {
  Filter,
  ArrowUpDown,
  MessageSquare,
  Paperclip,
  Link2,
  Calendar,
  ChevronDown,
  Circle,
  Square,
  Triangle,
  X,
  Search,
  Clock,
  User,
  Tag,
  ListChecks,
  Activity,
  ChevronRight,
} from 'lucide-react'
import { format, formatDistanceToNow, isPast, isToday, addDays, differenceInDays } from 'date-fns'

// ============================================================
// Constants
// ============================================================

const TASK_TYPES: { value: TaskType; label: string; color: string; shape: 'circle' | 'square' | 'triangle' }[] = [
  { value: 'epic', label: 'Epic', color: 'text-purple-500', shape: 'square' },
  { value: 'story', label: 'Story', color: 'text-emerald-500', shape: 'circle' },
  { value: 'task', label: 'Task', color: 'text-blue-500', shape: 'circle' },
  { value: 'bug', label: 'Bug', color: 'text-red-500', shape: 'circle' },
  { value: 'spike', label: 'Spike', color: 'text-yellow-500', shape: 'triangle' },
  { value: 'chore', label: 'Chore', color: 'text-gray-400', shape: 'square' },
  { value: 'improvement', label: 'Improvement', color: 'text-orange-500', shape: 'circle' },
]

const PRIORITY_CONFIG: { value: TaskPriority; label: string; color: string; bgColor: string }[] = [
  { value: 'critical', label: 'Critical', color: 'text-red-500', bgColor: 'bg-red-500' },
  { value: 'high', label: 'High', color: 'text-orange-500', bgColor: 'bg-orange-500' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
  { value: 'low', label: 'Low', color: 'text-green-500', bgColor: 'bg-green-500' },
  { value: 'none', label: 'None', color: 'text-gray-400', bgColor: 'bg-gray-400' },
]

const STATUS_CONFIG: { value: TaskStatus; label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }[] = [
  { value: 'backlog', label: 'Backlog', variant: 'secondary' },
  { value: 'todo', label: 'Todo', variant: 'outline' },
  { value: 'in_progress', label: 'In Progress', variant: 'default' },
  { value: 'in_review', label: 'In Review', variant: 'secondary' },
  { value: 'testing', label: 'Testing', variant: 'outline' },
  { value: 'blocked', label: 'Blocked', variant: 'destructive' },
  { value: 'done', label: 'Done', variant: 'secondary' },
  { value: 'cancelled', label: 'Cancelled', variant: 'outline' },
]

const SORT_OPTIONS = [
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'storyPoints', label: 'Story Points' },
  { value: 'updatedAt', label: 'Last Updated' },
]

const PRIORITY_ORDER: Record<TaskPriority, number> = { critical: 0, high: 1, medium: 2, low: 3, none: 4 }
const STATUS_ORDER: Record<TaskStatus, number> = { backlog: 0, todo: 1, in_progress: 2, in_review: 3, testing: 4, blocked: 5, done: 6, cancelled: 7 }

const LABEL_COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
]

// ============================================================
// Helper Functions
// ============================================================

function getTypeIcon(type: TaskType, size = 14) {
  const config = TASK_TYPES.find(t => t.value === type) || TASK_TYPES[3]
  const colorClass = config.color
  const shapeClass = config.shape === 'square'
    ? 'rounded-[3px]'
    : config.shape === 'triangle'
      ? 'rounded-[1px] rotate-0'
      : 'rounded-full'

  if (config.shape === 'triangle') {
    return (
      <Triangle
        size={size}
        className={`${colorClass} fill-current`}
      />
    )
  }
  if (config.shape === 'square') {
    return (
      <Square
        size={size}
        className={`${colorClass} fill-current ${shapeClass}`}
      />
    )
  }
  return (
    <Circle
      size={size}
      className={`${colorClass} fill-current`}
    />
  )
}

function getPriorityDot(priority: TaskPriority) {
  const config = PRIORITY_CONFIG.find(p => p.value === priority) || PRIORITY_CONFIG[4]
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${config.bgColor}`} />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {config.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function getStatusBadge(status: TaskStatus) {
  const config = STATUS_CONFIG.find(s => s.value === status) || STATUS_CONFIG[0]
  return <Badge variant={config.variant} className="text-xs font-medium whitespace-nowrap">{config.label}</Badge>
}

function getLabelColor(label: string) {
  let hash = 0
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash)
  }
  return LABEL_COLORS[Math.abs(hash) % LABEL_COLORS.length]
}

function getDueDateInfo(dueDate: string | null) {
  if (!dueDate) return null
  const date = new Date(dueDate)
  const daysUntil = differenceInDays(date, new Date())
  const isOverdue = daysUntil < 0
  const isNear = daysUntil >= 0 && daysUntil <= 3

  return {
    date,
    daysUntil,
    isOverdue,
    isNear,
    formatted: format(date, 'MMM d'),
    colorClass: isOverdue ? 'text-red-500' : isNear ? 'text-amber-500' : 'text-muted-foreground',
  }
}

// ============================================================
// Filter Types
// ============================================================

interface Filters {
  search: string
  projectId: string
  assigneeId: string
  type: string
  priority: string
  status: string
  label: string
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  projectId: 'all',
  assigneeId: 'all',
  type: 'all',
  priority: 'all',
  status: 'all',
  label: 'all',
}

// ============================================================
// Main Component
// ============================================================

export default function TasksView() {
  const { tasks, team, projects, selectedTaskId, setSelectedTaskId } = usePMStore()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState('priority')
  const [showFilters, setShowFilters] = useState(false)

  // Collect all unique labels
  const allLabels = useMemo(() => {
    const labelSet = new Set<string>()
    tasks.forEach(t => t.labels.forEach(l => labelSet.add(l)))
    return Array.from(labelSet).sort()
  }, [tasks])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (
          !task.key.toLowerCase().includes(searchLower) &&
          !task.title.toLowerCase().includes(searchLower) &&
          !task.description.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }
      if (filters.projectId !== 'all' && task.projectId !== filters.projectId) return false
      if (filters.assigneeId !== 'all') {
        if (filters.assigneeId === 'unassigned' && task.assigneeId !== null) return false
        if (filters.assigneeId !== 'unassigned' && task.assigneeId !== filters.assigneeId) return false
      }
      if (filters.type !== 'all' && task.type !== filters.type) return false
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false
      if (filters.status !== 'all' && task.status !== filters.status) return false
      if (filters.label !== 'all' && !task.labels.includes(filters.label)) return false
      return true
    })
  }, [tasks, filters])

  // Sort tasks
  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks]
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        case 'status':
          return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
        case 'dueDate': {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        }
        case 'storyPoints': {
          if (!a.storyPoints && !b.storyPoints) return 0
          if (!a.storyPoints) return 1
          if (!b.storyPoints) return -1
          return b.storyPoints - a.storyPoints
        }
        case 'updatedAt':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        default:
          return 0
      }
    })
    return sorted
  }, [filteredTasks, sortBy])

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null
    return tasks.find(t => t.id === selectedTaskId) || null
  }, [tasks, selectedTaskId])

  const getAssignee = useCallback((assigneeId: string | null): TeamMember | null => {
    if (!assigneeId) return null
    return team.find(m => m.id === assigneeId) || null
  }, [team])

  const getReporter = useCallback((reporterId: string): TeamMember | null => {
    return team.find(m => m.id === reporterId) || null
  }, [team])

  const getProject = useCallback((projectId: string) => {
    return projects.find(p => p.id === projectId)
  }, [projects])

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search' && value) return true
    if (key !== 'search' && value !== 'all') return true
    return false
  }).length

  const clearFilters = () => setFilters(DEFAULT_FILTERS)

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <Badge variant="secondary" className="text-xs">{sortedTasks.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                className="h-8 w-[200px] pl-8 text-sm lg:w-[280px]"
              />
            </div>
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <Filter className="h-3.5 w-3.5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-4" align="end">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Filters</span>
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearFilters}>
                        Clear all
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Project</label>
                    <Select value={filters.projectId} onValueChange={(v) => setFilters(f => ({ ...f, projectId: v }))}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Assignee</label>
                    <Select value={filters.assigneeId} onValueChange={(v) => setFilters(f => ({ ...f, assigneeId: v }))}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assignees</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {team.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Type</label>
                      <Select value={filters.type} onValueChange={(v) => setFilters(f => ({ ...f, type: v }))}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {TASK_TYPES.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Priority</label>
                      <Select value={filters.priority} onValueChange={(v) => setFilters(f => ({ ...f, priority: v }))}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          {PRIORITY_CONFIG.map(p => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {STATUS_CONFIG.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {allLabels.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Label</label>
                      <Select value={filters.label} onValueChange={(v) => setFilters(f => ({ ...f, label: v }))}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Labels</SelectItem>
                          {allLabels.map(l => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sort</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[180px] p-1" align="end">
                {SORT_OPTIONS.map(opt => (
                  <Button
                    key={opt.value}
                    variant={sortBy === opt.value ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-full justify-start h-8 text-sm"
                    onClick={() => setSortBy(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active filter tags */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap border-b px-4 py-2 bg-muted/30">
            {filters.projectId !== 'all' && (
              <FilterTag
                label={getProject(filters.projectId)?.name || filters.projectId}
                onRemove={() => setFilters(f => ({ ...f, projectId: 'all' }))}
              />
            )}
            {filters.assigneeId !== 'all' && (
              <FilterTag
                label={filters.assigneeId === 'unassigned' ? 'Unassigned' : getAssignee(filters.assigneeId)?.name || filters.assigneeId}
                onRemove={() => setFilters(f => ({ ...f, assigneeId: 'all' }))}
              />
            )}
            {filters.type !== 'all' && (
              <FilterTag
                label={TASK_TYPES.find(t => t.value === filters.type)?.label || filters.type}
                onRemove={() => setFilters(f => ({ ...f, type: 'all' }))}
              />
            )}
            {filters.priority !== 'all' && (
              <FilterTag
                label={PRIORITY_CONFIG.find(p => p.value === filters.priority)?.label || filters.priority}
                onRemove={() => setFilters(f => ({ ...f, priority: 'all' }))}
              />
            )}
            {filters.status !== 'all' && (
              <FilterTag
                label={STATUS_CONFIG.find(s => s.value === filters.status)?.label || filters.status}
                onRemove={() => setFilters(f => ({ ...f, status: 'all' }))}
              />
            )}
            {filters.label !== 'all' && (
              <FilterTag
                label={filters.label}
                onRemove={() => setFilters(f => ({ ...f, label: 'all' }))}
              />
            )}
            <Button variant="ghost" size="sm" className="h-5 text-xs text-muted-foreground" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}

        {/* Content area with split view */}
        <div className="flex flex-1 overflow-hidden">
          {/* Task List */}
          <div className={`flex-1 overflow-auto transition-all ${selectedTask ? 'hidden md:block' : ''}`}>
            {/* Table Header */}
            <div className="sticky top-0 z-10 grid grid-cols-[minmax(80px,80px)_minmax(20px,20px)_minmax(180px,1fr)_minmax(100px,100px)_minmax(30px,30px)_minmax(28px,28px)_minmax(45px,45px)_minmax(75px,75px)_minmax(120px,1fr)] items-center gap-2 border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
              <span>Key</span>
              <span></span>
              <span>Title</span>
              <span>Status</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-center cursor-default">!</span>
                </TooltipTrigger>
                <TooltipContent>Priority</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default"></span>
                </TooltipTrigger>
                <TooltipContent>Assignee</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-center cursor-default">SP</span>
                </TooltipTrigger>
                <TooltipContent>Story Points</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default"></span>
                </TooltipTrigger>
                <TooltipContent>Due Date</TooltipContent>
              </Tooltip>
              <span className="hidden lg:block">Labels</span>
            </div>

            {/* Task Rows */}
            <div className="divide-y">
              {sortedTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Search className="h-8 w-8 mb-2" />
                  <p className="text-sm">No tasks found</p>
                  <p className="text-xs mt-1">Try adjusting your filters</p>
                </div>
              )}
              {sortedTasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  assignee={getAssignee(task.assigneeId)}
                  isSelected={selectedTask?.id === task.id}
                  onClick={() => setSelectedTaskId(task.id === selectedTaskId ? null : task.id)}
                />
              ))}
            </div>
          </div>

          {/* Task Detail Panel */}
          {selectedTask && (
            <TaskDetailPanel
              task={selectedTask}
              assignee={getAssignee(selectedTask.assigneeId)}
              reporter={getReporter(selectedTask.reporterId)}
              project={getProject(selectedTask.projectId)}
              onClose={() => setSelectedTaskId(null)}
              team={team}
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

// ============================================================
// Filter Tag
// ============================================================

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge variant="secondary" className="gap-1 text-xs pr-1">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </Badge>
  )
}

// ============================================================
// Task Row
// ============================================================

function TaskRow({
  task,
  assignee,
  isSelected,
  onClick,
}: {
  task: Task
  assignee: TeamMember | null
  isSelected: boolean
  onClick: () => void
}) {
  const dueDateInfo = getDueDateInfo(task.dueDate)
  const subtaskDone = task.subtasks.filter(s => s.completed).length
  const subtaskTotal = task.subtasks.length

  return (
    <div
      className={`
        grid grid-cols-[minmax(80px,80px)_minmax(20px,20px)_minmax(180px,1fr)_minmax(100px,100px)_minmax(30px,30px)_minmax(28px,28px)_minmax(45px,45px)_minmax(75px,75px)_minmax(120px,1fr)] items-center gap-2 px-4 py-2.5 cursor-pointer transition-colors
        ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/50 border-l-2 border-l-transparent'}
        ${task.status === 'done' ? 'opacity-60' : ''}
      `}
      onClick={onClick}
    >
      {/* Key */}
      <span className="text-xs font-mono text-muted-foreground">{task.key}</span>

      {/* Type Icon */}
      <div className="flex justify-center">{getTypeIcon(task.type, 14)}</div>

      {/* Title */}
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-sm truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : 'font-medium'}`}>
          {task.title}
        </span>
        {task.subtasks.length > 0 && (
          <span className="flex items-center gap-0.5 shrink-0 text-[10px] text-muted-foreground">
            <ListChecks className="h-3 w-3" />
            {subtaskDone}/{subtaskTotal}
          </span>
        )}
        {task.comments.length > 0 && (
          <span className="flex items-center gap-0.5 shrink-0 text-[10px] text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            {task.comments.length}
          </span>
        )}
        {task.attachments.length > 0 && (
          <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
      </div>

      {/* Status */}
      <div>{getStatusBadge(task.status)}</div>

      {/* Priority */}
      <div className="flex justify-center">{getPriorityDot(task.priority)}</div>

      {/* Assignee */}
      <div className="flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className="h-6 w-6">
              {assignee ? (
                <AvatarImage src={assignee.avatar} alt={assignee.name} />
              ) : (
                <AvatarFallback className="text-[10px] bg-muted">?</AvatarFallback>
              )}
              {assignee && <AvatarFallback className="text-[10px]">{assignee.name[0]}</AvatarFallback>}
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>{assignee?.name || 'Unassigned'}</TooltipContent>
        </Tooltip>
      </div>

      {/* Story Points */}
      <div className="flex justify-center">
        {task.storyPoints ? (
          <Badge variant="outline" className="h-5 text-[10px] font-mono px-1.5">{task.storyPoints}</Badge>
        ) : (
          <span className="text-muted-foreground/30">-</span>
        )}
      </div>

      {/* Due Date */}
      <div>
        {dueDateInfo ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={`text-xs flex items-center gap-1 ${dueDateInfo.colorClass}`}>
                <Calendar className="h-3 w-3" />
                {dueDateInfo.formatted}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {dueDateInfo.isOverdue ? `${Math.abs(dueDateInfo.daysUntil)} days overdue` : dueDateInfo.isNear ? `Due in ${dueDateInfo.daysUntil} day${dueDateInfo.daysUntil !== 1 ? 's' : ''}` : `Due ${format(dueDateInfo.date, 'MMM d, yyyy')}`}
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-muted-foreground/30">-</span>
        )}
      </div>

      {/* Labels */}
      <div className="hidden lg:flex items-center gap-1 overflow-hidden">
        {task.labels.slice(0, 3).map(label => (
          <span key={label} className={`inline-block rounded-full px-1.5 py-0 text-[10px] leading-4 truncate max-w-[80px] ${getLabelColor(label)}`}>
            {label}
          </span>
        ))}
        {task.labels.length > 3 && (
          <span className="text-[10px] text-muted-foreground">+{task.labels.length - 3}</span>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Task Detail Panel
// ============================================================

function TaskDetailPanel({
  task,
  assignee,
  reporter,
  project,
  onClose,
  team,
}: {
  task: Task
  assignee: TeamMember | null
  reporter: TeamMember | null
  project: { name: string } | undefined
  onClose: () => void
  team: TeamMember[]
}) {
  const { tasks } = usePMStore()
  const dueDateInfo = getDueDateInfo(task.dueDate)
  const subtaskDone = task.subtasks.filter(s => s.completed).length
  const subtaskTotal = task.subtasks.length
  const [toggledSubtasks, setToggledSubtasks] = useState<Set<string>>(new Set())

  const toggleSubtask = (subtaskId: string) => {
    setToggledSubtasks(prev => {
      const next = new Set(prev)
      if (next.has(subtaskId)) next.delete(subtaskId)
      else next.add(subtaskId)
      return next
    })
  }

  // Resolve dependency task info
  const getTaskInfo = (taskId: string) => tasks.find(t => t.id === taskId)
  const getMemberName = (memberId: string) => team.find(m => m.id === memberId)?.name || memberId

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0 flex flex-col">
        <div className="overflow-y-auto flex-1">
          {/* Header */}
          <div className="sticky top-0 bg-background z-10 flex items-start justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3 min-w-0">
              {getTypeIcon(task.type, 18)}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-muted-foreground">{task.key}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{project?.name}</span>
                </div>
                <h3 className="text-lg font-semibold mt-0.5 leading-tight">{task.title}</h3>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 -mt-1" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="px-6 py-4 space-y-6">
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Status:</span>
                {getStatusBadge(task.status)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Priority:</span>
                <div className="flex items-center gap-1.5">
                  {getPriorityDot(task.priority)}
                  <span className={`text-xs font-medium ${PRIORITY_CONFIG.find(p => p.value === task.priority)?.color}`}>
                    {PRIORITY_CONFIG.find(p => p.value === task.priority)?.label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Type:</span>
                <span className="text-xs font-medium">{TASK_TYPES.find(t => t.value === task.type)?.label}</span>
              </div>
              {task.storyPoints && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Points:</span>
                  <Badge variant="outline" className="text-xs font-mono">{task.storyPoints}</Badge>
                </div>
              )}
            </div>

            {/* People */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Assignee:</span>
                {assignee ? (
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={assignee.avatar} alt={assignee.name} />
                      <AvatarFallback className="text-[10px]">{assignee.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Unassigned</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Reporter:</span>
                {reporter ? (
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={reporter.avatar} alt={reporter.name} />
                      <AvatarFallback className="text-[10px]">{reporter.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{reporter.name}</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Due:</span>
              {dueDateInfo ? (
                <span className={`text-sm font-medium ${dueDateInfo.colorClass}`}>
                  {format(dueDateInfo.date, 'MMMM d, yyyy')}
                  {dueDateInfo.isOverdue && (
                    <Badge variant="destructive" className="ml-2 text-[10px]">Overdue</Badge>
                  )}
                  {dueDateInfo.isNear && !dueDateInfo.isOverdue && (
                    <Badge variant="outline" className="ml-2 text-[10px] border-amber-500 text-amber-600">Due soon</Badge>
                  )}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground italic">No due date</span>
              )}
            </div>

            {/* Labels */}
            {task.labels.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Labels:</span>
                {task.labels.map(label => (
                  <Badge key={label} variant="outline" className="text-xs">
                    <span className={`mr-1.5 inline-block w-2 h-2 rounded-full ${getLabelColor(label).split(' ')[0]}`} />
                    {label}
                  </Badge>
                ))}
              </div>
            )}

            <Separator />

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <span className="w-1 h-4 rounded-full bg-primary" />
                Description
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>

            {/* Acceptance Criteria */}
            {task.acceptanceCriteria.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <span className="w-1 h-4 rounded-full bg-emerald-500" />
                  Acceptance Criteria
                </h4>
                <ul className="space-y-1.5">
                  {task.acceptanceCriteria.map((criteria, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {criteria}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Subtasks */}
            {task.subtasks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <span className="w-1 h-4 rounded-full bg-blue-500" />
                  Subtasks
                  <Badge variant="secondary" className="text-[10px] ml-1">
                    {subtaskDone}/{subtaskTotal}
                  </Badge>
                </h4>
                <div className="space-y-1">
                  {task.subtasks.map(subtask => {
                    const isChecked = subtask.completed || toggledSubtasks.has(subtask.id)
                    return (
                      <label
                        key={subtask.id}
                        className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleSubtask(subtask.id)}
                          className="h-4 w-4"
                        />
                        <span className={`text-sm ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
                          {subtask.title}
                        </span>
                      </label>
                    )
                  })}
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${subtaskDone === subtaskTotal ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: `${(subtaskDone / subtaskTotal) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Dependencies */}
            {(task.dependencies.length > 0 || task.blocking.length > 0) && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" />
                  Dependencies
                </h4>
                <div className="space-y-2">
                  {task.dependencies.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground">Depends on:</span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {task.dependencies.map(depId => {
                          const depTask = getTaskInfo(depId)
                          return (
                            <Badge key={depId} variant="outline" className="text-xs font-mono">
                              {depTask?.key || depId}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {task.blocking.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground">Blocking:</span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {task.blocking.map(blockId => {
                          const blockTask = getTaskInfo(blockId)
                          return (
                            <Badge key={blockId} variant="outline" className="text-xs font-mono border-red-300 text-red-600 dark:border-red-800 dark:text-red-400">
                              {blockTask?.key || blockId}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Comments
                <Badge variant="secondary" className="text-[10px] ml-1">{task.comments.length}</Badge>
              </h4>
              {task.comments.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No comments yet</p>
              ) : (
                <div className="space-y-3">
                  {task.comments.map(comment => {
                    const author = getMemberName(comment.authorId)
                    return (
                      <div key={comment.id} className="flex gap-3">
                        <div className="shrink-0 mt-0.5">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={team.find(m => m.id === comment.authorId)?.avatar} alt={author} />
                            <AvatarFallback className="text-[10px]">{author[0]}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">{author}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{comment.content}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Activity Log */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                Activity
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                  <span>Updated {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}</span>
                </div>
                {task.attachments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                    <span>{task.attachments.length} attachment{task.attachments.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
