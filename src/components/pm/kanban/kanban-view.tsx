'use client'

import React, { useState, useMemo, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  MeasuringStrategy,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { usePMStore, type Task, type TaskType, type TaskPriority, type TaskStatus, type TeamMember } from '@/lib/pm-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Circle,
  Square,
  Triangle,
  Calendar,
  GripVertical,
  MessageSquare,
  Paperclip,
  ListChecks,
  Plus,
  AlertTriangle,
} from 'lucide-react'
import { differenceInDays, format } from 'date-fns'

// ============================================================
// Constants
// ============================================================

const KANBAN_COLUMNS: { id: TaskStatus; title: string; wipLimit: number }[] = [
  { id: 'backlog', title: 'Backlog', wipLimit: Infinity },
  { id: 'todo', title: 'Todo', wipLimit: Infinity },
  { id: 'in_progress', title: 'In Progress', wipLimit: 5 },
  { id: 'in_review', title: 'In Review', wipLimit: 3 },
  { id: 'testing', title: 'Testing', wipLimit: 5 },
  { id: 'done', title: 'Done', wipLimit: Infinity },
]

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

const PRIORITY_ORDER: Record<TaskPriority, number> = { critical: 0, high: 1, medium: 2, low: 3, none: 4 }

const LABEL_COLORS = [
  'bg-blue-100 dark:bg-blue-900',
  'bg-purple-100 dark:bg-purple-900',
  'bg-pink-100 dark:bg-pink-900',
  'bg-orange-100 dark:bg-orange-900',
  'bg-emerald-100 dark:bg-emerald-900',
  'bg-cyan-100 dark:bg-cyan-900',
  'bg-amber-100 dark:bg-amber-900',
  'bg-rose-100 dark:bg-rose-900',
  'bg-teal-100 dark:bg-teal-900',
  'bg-indigo-100 dark:bg-indigo-900',
]

const COLUMN_HEADER_COLORS: Record<TaskStatus, string> = {
  backlog: 'bg-gray-100 dark:bg-gray-800/60',
  todo: 'bg-slate-100 dark:bg-slate-800/60',
  in_progress: 'bg-blue-50 dark:bg-blue-900/30',
  in_review: 'bg-amber-50 dark:bg-amber-900/30',
  testing: 'bg-purple-50 dark:bg-purple-900/30',
  done: 'bg-emerald-50 dark:bg-emerald-900/30',
  blocked: 'bg-red-50 dark:bg-red-900/30',
  cancelled: 'bg-gray-50 dark:bg-gray-800/40',
}

const COLUMN_ACCENT_COLORS: Record<TaskStatus, string> = {
  backlog: 'bg-gray-400',
  todo: 'bg-slate-400',
  in_progress: 'bg-blue-500',
  in_review: 'bg-amber-500',
  testing: 'bg-purple-500',
  done: 'bg-emerald-500',
  blocked: 'bg-red-500',
  cancelled: 'bg-gray-300',
}

// ============================================================
// Helpers
// ============================================================

function getTypeIcon(type: TaskType, size = 12) {
  const config = TASK_TYPES.find(t => t.value === type) || TASK_TYPES[3]
  if (config.shape === 'triangle') {
    return <Triangle size={size} className={`${config.color} fill-current`} />
  }
  if (config.shape === 'square') {
    return <Square size={size} className={`${config.color} fill-current rounded-[2px]`} />
  }
  return <Circle size={size} className={`${config.color} fill-current`} />
}

function getPriorityDot(priority: TaskPriority) {
  const config = PRIORITY_CONFIG.find(p => p.value === priority) || PRIORITY_CONFIG[4]
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${config.bgColor} shrink-0`} />
  )
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
// Drop animation config
// ============================================================

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    className: {
      active: { opacity: '0.4' },
    },
  }),
}

// ============================================================
// Main Component
// ============================================================

export default function KanbanView() {
  const { tasks, team, moveTaskToStatus } = usePMStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor)
  )

  // Group tasks by column status
  const columnTasks = useMemo(() => {
    const grouped: Record<string, Task[]> = {}
    KANBAN_COLUMNS.forEach(col => {
      const colTasks = tasks
        .filter(t => t.status === col.id)
        .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
      grouped[col.id] = colTasks
    })
    return grouped
  }, [tasks])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find(t => t.id === active.id)
    if (task) setActiveTask(task)
  }, [tasks])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Visual only - actual move happens on drag end
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    // Determine the target column
    // Check if dropping over a column droppable or another card
    const targetColumnId = over.data.current?.sortable?.containerId || over.id as string

    if (targetColumnId && KANBAN_COLUMNS.some(col => col.id === targetColumnId)) {
      const task = tasks.find(t => t.id === taskId)
      if (task && task.status !== targetColumnId) {
        moveTaskToStatus(taskId, targetColumnId as TaskStatus)
      }
    }
  }, [tasks, moveTaskToStatus])

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Board</h2>
            <Badge variant="secondary" className="text-xs">{tasks.length} tasks</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1">
              <ListChecks className="h-3 w-3" />
              {tasks.filter(t => t.status === 'done').length} completed
            </Badge>
            <Badge variant="outline" className="text-xs gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              {tasks.filter(t => {
                if (!t.dueDate || t.status === 'done') return false
                return differenceInDays(new Date(t.dueDate), new Date()) < 0
              }).length} overdue
            </Badge>
          </div>
        </div>

        {/* Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex gap-3 overflow-x-auto p-4">
            {KANBAN_COLUMNS.map(column => {
              const colTasks = columnTasks[column.id] || []
              const totalPoints = colTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
              const isOverWip = column.wipLimit !== Infinity && colTasks.length > column.wipLimit

              return (
                <div
                  key={column.id}
                  className={`flex w-[280px] min-w-[280px] shrink-0 flex-col rounded-lg border ${COLUMN_HEADER_COLORS[column.id]} overflow-hidden`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${COLUMN_ACCENT_COLORS[column.id]}`} />
                      <span className="text-sm font-semibold">{column.title}</span>
                      <Badge
                        variant={isOverWip ? 'destructive' : 'secondary'}
                        className="h-5 min-w-5 px-1.5 text-xs"
                      >
                        {colTasks.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {totalPoints > 0 && (
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {totalPoints} SP
                        </span>
                      )}
                      {column.wipLimit !== Infinity && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isOverWip ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'text-muted-foreground'}`}>
                              WIP {colTasks.length}/{column.wipLimit}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isOverWip ? 'Over WIP limit!' : `WIP limit: ${column.wipLimit}`}
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Column Body */}
                  <SortableContext
                    items={colTasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div
                      className="flex-1 overflow-y-auto px-2 pb-2 space-y-1.5 min-h-[80px]"
                      data-column={column.id}
                    >
                      {/* Droppable zone */}
                      <div className="min-h-[60px]">
                        {colTasks.map(task => (
                          <SortableTaskCard
                            key={task.id}
                            task={task}
                            team={team}
                            columnId={column.id}
                          />
                        ))}
                      </div>

                      {colTasks.length === 0 && (
                        <div className="flex items-center justify-center py-8 rounded-md border-2 border-dashed border-muted-foreground/20 text-muted-foreground">
                          <span className="text-xs">Drop tasks here</span>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </div>
              )
            })}
          </div>

          {/* Drag Overlay */}
          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask ? (
              <KanbanTaskCard task={activeTask} team={team} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </TooltipProvider>
  )
}

// ============================================================
// Sortable Task Card
// ============================================================

function SortableTaskCard({
  task,
  team,
  columnId,
}: {
  task: Task
  team: TeamMember[]
  columnId: TaskStatus
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
      sortable: {
        containerId: columnId,
      },
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <KanbanTaskCard task={task} team={team} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  )
}

// ============================================================
// Kanban Task Card
// ============================================================

function KanbanTaskCard({
  task,
  team,
  isOverlay = false,
  dragHandleProps,
}: {
  task: Task
  team: TeamMember[]
  isOverlay?: boolean
  dragHandleProps?: Record<string, unknown>
}) {
  const assignee = task.assigneeId ? team.find(m => m.id === task.assigneeId) : null
  const dueDateInfo = getDueDateInfo(task.dueDate)
  const subtaskDone = task.subtasks.filter(s => s.completed).length
  const subtaskTotal = task.subtasks.length

  return (
    <Card
      className={`
        p-2.5 cursor-pointer transition-all group
        ${isOverlay
          ? 'w-[260px] shadow-2xl rotate-2 border-primary/30 bg-background'
          : 'hover:shadow-md hover:-translate-y-0.5 hover:border-border'
        }
        ${task.status === 'done' ? 'opacity-60' : ''}
      `}
      {...(isOverlay ? {} : dragHandleProps)}
    >
      {/* Top row: Type + Key */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {getTypeIcon(task.type, 12)}
          <span className="text-[11px] font-mono text-muted-foreground">{task.key}</span>
        </div>
        <div className="flex items-center gap-1">
          {task.comments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
            </span>
          )}
          {task.attachments.length > 0 && (
            <Paperclip className="h-3 w-3 text-muted-foreground" />
          )}
          {isOverlay && <GripVertical className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />}
        </div>
      </div>

      {/* Title */}
      <p className={`text-sm leading-tight mb-2 line-clamp-2 ${task.status === 'done' ? 'line-through text-muted-foreground' : 'font-medium'}`}>
        {task.title}
      </p>

      {/* Labels (as dots) */}
      {task.labels.length > 0 && (
        <div className="flex items-center gap-1 mb-2">
          {task.labels.slice(0, 4).map(label => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <span className={`inline-block w-3 h-3 rounded-full ${getLabelColor(label)} cursor-default`} />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">{label}</TooltipContent>
            </Tooltip>
          ))}
          {task.labels.length > 4 && (
            <span className="text-[10px] text-muted-foreground">+{task.labels.length - 4}</span>
          )}
        </div>
      )}

      {/* Bottom row: Priority + Points + Due Date + Assignee */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          {getPriorityDot(task.priority)}

          {task.storyPoints && (
            <span className="flex items-center justify-center h-5 min-w-5 rounded bg-muted px-1 text-[10px] font-mono font-semibold text-muted-foreground">
              {task.storyPoints}
            </span>
          )}

          {subtaskTotal > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <ListChecks className="h-3 w-3" />
              {subtaskDone}/{subtaskTotal}
            </span>
          )}

          {dueDateInfo && (
            <span className={`flex items-center gap-0.5 text-[10px] ${dueDateInfo.colorClass}`}>
              <Calendar className="h-3 w-3" />
              {dueDateInfo.formatted}
            </span>
          )}
        </div>

        {/* Assignee */}
        {assignee && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-6 w-6 ring-1 ring-background">
                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                <AvatarFallback className="text-[9px]">{assignee.name[0]}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="top">{assignee.name}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </Card>
  )
}
