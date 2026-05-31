'use client'

import { useState, useMemo } from 'react'
import { usePMStore, type Project, type ProjectStatus } from '@/lib/pm-store'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FolderKanban,
  Plus,
  Calendar,
  DollarSign,
  AlertTriangle,
  Users,
  ChevronRight,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Clock,
  X,
  Target,
  Zap,
  TrendingUp,
} from 'lucide-react'

// ─── Status Config ────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; className: string; dotColor: string }
> = {
  discovery: {
    label: 'Discovery',
    className:
      'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
    dotColor: 'bg-yellow-500',
  },
  planning: {
    label: 'Planning',
    className:
      'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
    dotColor: 'bg-sky-500',
  },
  active: {
    label: 'Active',
    className:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    dotColor: 'bg-emerald-500',
  },
  paused: {
    label: 'Paused',
    className:
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
    dotColor: 'bg-orange-500',
  },
  completed: {
    label: 'Completed',
    className:
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    dotColor: 'bg-purple-500',
  },
  archived: {
    label: 'Archived',
    className:
      'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    dotColor: 'bg-gray-500',
  },
}

const RISK_COLORS: Record<string, string> = {
  critical: 'text-red-500',
  high: 'text-orange-500',
  medium: 'text-yellow-500',
  low: 'text-emerald-500',
}

// ─── Progress Gradient ────────────────────────────────────────────
function getProgressGradientColor(progress: number): string {
  if (progress >= 75) return 'from-emerald-500 to-green-400'
  if (progress >= 50) return 'from-sky-500 to-blue-400'
  if (progress >= 25) return 'from-amber-500 to-yellow-400'
  return 'from-orange-500 to-red-400'
}

function GradientProgress({ value }: { value: number }) {
  const gradientClass = getProgressGradientColor(value)
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

// ─── Format Helpers ───────────────────────────────────────────────
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Project Card ─────────────────────────────────────────────────
function ProjectCard({
  project,
  onClick,
}: {
  project: Project
  onClick: () => void
}) {
  const statusConfig = STATUS_CONFIG[project.status]
  const budgetPercent =
    project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0

  const relatedRisks = usePMStore((s) =>
    s.risks.filter((r) => r.projectId === project.id)
  )
  const highRiskCount = relatedRisks.filter(
    (r) => r.level === 'critical' || r.level === 'high'
  ).length

  const teamMembers = usePMStore((s) =>
    s.team.filter((m) => m.teamId === project.teamId)
  )

  return (
    <Card
      className="group relative cursor-pointer border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${statusConfig.className}`}
            >
              <FolderKanban className="h-4.5 w-4.5" />
            </div>
            <CardTitle className="truncate text-base">{project.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {highRiskCount > 0 && (
              <div
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  highRiskCount > 2
                    ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                    : 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400'
                }`}
              >
                <AlertTriangle className="h-3 w-3" />
                {highRiskCount}
              </div>
            )}
            <Badge
              variant="outline"
              className={`${statusConfig.className} gap-1.5`}
            >
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`} />
              {statusConfig.label}
            </Badge>
          </div>
        </div>
        <CardDescription className="line-clamp-2 leading-relaxed">
          {project.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Progress</span>
            <span className="font-semibold tabular-nums">{project.progress}%</span>
          </div>
          <GradientProgress value={project.progress} />
        </div>

        {/* Mini KPIs */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <DollarSign className="h-3 w-3" />
            </div>
            <p className="mt-0.5 text-xs font-semibold tabular-nums">
              {budgetPercent}%
            </p>
            <p className="text-[10px] text-muted-foreground">Budget</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Target className="h-3 w-3" />
            </div>
            <p className="mt-0.5 text-xs font-semibold tabular-nums">
              {project.completedTasks}/{project.tasksCount}
            </p>
            <p className="text-[10px] text-muted-foreground">Tasks</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
            </div>
            <p className="mt-0.5 text-xs font-semibold tabular-nums">
              {teamMembers.length}
            </p>
            <p className="text-[10px] text-muted-foreground">Team</p>
          </div>
        </div>

        {/* Tech Stack Tags */}
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.slice(0, 4).map((tech) => (
            <Badge
              key={tech}
              variant="secondary"
              className="rounded-md px-1.5 py-0 text-[10px] font-normal"
            >
              {tech}
            </Badge>
          ))}
          {project.techStack.length > 4 && (
            <Badge
              variant="secondary"
              className="rounded-md px-1.5 py-0 text-[10px] font-normal"
            >
              +{project.techStack.length - 4}
            </Badge>
          )}
        </div>

        {/* Timeline & Footer */}
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDate(project.startDate)} — {formatDate(project.endDate)}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Project Detail Panel ─────────────────────────────────────────
function ProjectDetailPanel({
  project,
  onClose,
}: {
  project: Project
  onClose: () => void
}) {
  const statusConfig = STATUS_CONFIG[project.status]

  const tasks = usePMStore((s) => s.getTasksByProject(project.id))
  const risks = usePMStore((s) => s.risks.filter((r) => r.projectId === project.id))
  const teamMembers = usePMStore((s) =>
    s.team.filter((m) => m.teamId === project.teamId)
  )

  const budgetPercent =
    project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0
  const completedMilestones = project.milestones.filter((m) => m.completed).length

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l bg-background shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`${statusConfig.className} gap-1.5`}>
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`} />
              {statusConfig.label}
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight">{project.name}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(project.startDate)} — {formatDate(project.endDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Updated {formatDate(project.updatedAt)}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-8 px-6 py-6">
          {/* Description */}
          <section>
            <h3 className="mb-2 text-sm font-semibold text-foreground">Description</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          </section>

          {/* Progress & Milestones */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Progress & Milestones</h3>
              <span className="text-sm font-bold tabular-nums text-primary">
                {project.progress}%
              </span>
            </div>
            <GradientProgress value={project.progress} />
            <p className="text-xs text-muted-foreground">
              {completedMilestones} of {project.milestones.length} milestones completed
            </p>
            <div className="space-y-2">
              {project.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5"
                >
                  {milestone.completed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        milestone.completed
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                      }`}
                    >
                      {milestone.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(milestone.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Key Metrics */}
          {project.keyMetrics.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Key Metrics
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {project.keyMetrics.map((metric) => {
                  const pct =
                    metric.target > 0
                      ? Math.round((metric.value / metric.target) * 100)
                      : 0
                  return (
                    <div
                      key={metric.label}
                      className="rounded-xl border bg-card p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">
                          {metric.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Target: {metric.target.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-lg font-bold tabular-nums">
                        {metric.value.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 80
                                ? 'bg-emerald-500'
                                : pct >= 50
                                  ? 'bg-sky-500'
                                  : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium tabular-nums text-muted-foreground">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Budget */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget
            </h3>
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Spent</p>
                  <p className="text-lg font-bold tabular-nums">
                    {formatCurrency(project.spent)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Budget</p>
                  <p className="text-lg font-bold tabular-nums">
                    {formatCurrency(project.budget)}
                  </p>
                </div>
              </div>
              <GradientProgress value={budgetPercent} />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(project.budget - project.spent)} remaining</span>
                <span className="font-medium">{budgetPercent}% used</span>
              </div>
            </div>
          </section>

          {/* Team Members */}
          {teamMembers.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team ({teamMembers.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2.5 rounded-lg border bg-muted/30 px-3 py-2"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="text-[10px]">
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{member.name}</p>
                      <p className="truncate text-[10px] text-muted-foreground capitalize">
                        {member.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          member.availability === 'full'
                            ? 'bg-emerald-500'
                            : member.availability === 'partial'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        }`}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {member.capacity}h
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Tasks */}
          {tasks.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Related Tasks ({tasks.length})
              </h3>
              <div className="space-y-1.5">
                {tasks.slice(0, 8).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5"
                  >
                    <div className="flex items-center justify-center">
                      {task.status === 'done' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : task.status === 'in_progress' || task.status === 'in_review' ? (
                        <Circle className="h-4 w-4 fill-sky-500 text-sky-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{task.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {task.key} · <span className="capitalize">{task.status.replace('_', ' ')}</span>
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-[10px] capitalize ${
                        task.priority === 'critical'
                          ? 'border-red-200 text-red-600 dark:border-red-800 dark:text-red-400'
                          : task.priority === 'high'
                            ? 'border-orange-200 text-orange-600 dark:border-orange-800 dark:text-orange-400'
                            : 'border-muted text-muted-foreground'
                      }`}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
                {tasks.length > 8 && (
                  <p className="py-1 text-center text-xs text-muted-foreground">
                    +{tasks.length - 8} more tasks
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Related Risks */}
          {risks.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Risks ({risks.length})
              </h3>
              <div className="space-y-1.5">
                {risks.map((risk) => (
                  <div
                    key={risk.id}
                    className="flex items-start gap-3 rounded-lg border bg-muted/30 px-3 py-2.5"
                  >
                    <AlertTriangle
                      className={`mt-0.5 h-4 w-4 shrink-0 ${RISK_COLORS[risk.level] ?? 'text-muted-foreground'}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium">{risk.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${
                            risk.level === 'critical'
                              ? 'border-red-200 text-red-600 dark:border-red-800 dark:text-red-400'
                              : risk.level === 'high'
                                ? 'border-orange-200 text-orange-600 dark:border-orange-800 dark:text-orange-400'
                                : risk.level === 'medium'
                                  ? 'border-yellow-200 text-yellow-600 dark:border-yellow-800 dark:text-yellow-400'
                                  : 'border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400'
                          }`}
                        >
                          {risk.level}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {risk.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {project.tags.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-md">
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Tech Stack */}
          {project.techStack.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Tech Stack</h3>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <Badge key={tech} variant="outline" className="rounded-md font-normal">
                    {tech}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// ─── Create Project Dialog ────────────────────────────────────────
function CreateProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const addProject = usePMStore((s) => s.addProject)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('discovery')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [techStackInput, setTechStackInput] = useState('')

  const resetForm = () => {
    setName('')
    setDescription('')
    setStatus('discovery')
    setStartDate('')
    setEndDate('')
    setBudget('')
    setTagsInput('')
    setTechStackInput('')
  }

  const handleSubmit = () => {
    if (!name.trim()) return

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const techStack = techStackInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'No description provided.',
      status,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate:
        endDate ||
        new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      progress: 0,
      teamId: 'team1',
      budget: budget ? parseFloat(budget) : 50000,
      spent: 0,
      tags,
      techStack,
      keyMetrics: [],
      milestones: [],
      risks: 0,
      tasksCount: 0,
      completedTasks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addProject(newProject)
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Add a new project to your workspace. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              placeholder="e.g. CloudFlow SaaS"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              placeholder="Describe the project goals and scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Status & Budget Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as ProjectStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(STATUS_CONFIG) as [ProjectStatus, (typeof STATUS_CONFIG)[ProjectStatus]][]
                  ).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${config.dotColor}`}
                        />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-budget">Budget ($)</Label>
              <Input
                id="project-budget"
                type="number"
                placeholder="50000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-start">Start Date</Label>
              <Input
                id="project-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-end">End Date</Label>
              <Input
                id="project-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="project-tags">Tags</Label>
            <Input
              id="project-tags"
              placeholder="SaaS, Core Product (comma separated)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <Label htmlFor="project-tech">Tech Stack</Label>
            <Input
              id="project-tech"
              placeholder="Next.js, TypeScript, Supabase (comma separated)"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Separate technologies with commas
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main View ────────────────────────────────────────────────────
export default function ProjectsView() {
  const projects = usePMStore((s) => s.projects)
  const setSelectedProjectId = usePMStore((s) => s.setSelectedProjectId)
  const selectedProjectId = usePMStore((s) => s.selectedProjectId)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredProjects = useMemo(() => {
    if (statusFilter === 'all') return projects
    return projects.filter((p) => p.status === statusFilter)
  }, [projects, statusFilter])

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null
    return projects.find((p) => p.id === selectedProjectId) ?? null
  }, [projects, selectedProjectId])

  const handleCardClick = (project: Project) => {
    setSelectedProjectId(project.id)
  }

  const handleCloseDetail = () => {
    setSelectedProjectId(null)
  }

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length }
    for (const p of projects) {
      counts[p.status] = (counts[p.status] || 0) + 1
    }
    return counts
  }, [projects])

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
              <FolderKanban className="h-6 w-6 text-primary" />
              Projects
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {projects.length} project{projects.length !== 1 ? 's' : ''} across your workspace
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="border-t">
          <div className="mx-auto flex items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8 scrollbar-none">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              All
              <span
                className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                  statusFilter === 'all'
                    ? 'bg-primary-foreground/20'
                    : 'bg-muted'
                }`}
              >
                {statusCounts['all'] ?? 0}
              </span>
            </button>
            {(
              Object.entries(STATUS_CONFIG) as [
                ProjectStatus,
                (typeof STATUS_CONFIG)[ProjectStatus],
              ][]
            ).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    statusFilter === key ? 'bg-primary-foreground' : config.dotColor
                  }`}
                />
                {config.label}
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                    statusFilter === key
                      ? 'bg-primary-foreground/20'
                      : 'bg-muted'
                  }`}
                >
                  {statusCounts[key] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <FolderKanban className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {statusFilter !== 'all'
                ? `No projects with "${STATUS_CONFIG[statusFilter as ProjectStatus]?.label}" status.`
                : 'Get started by creating your first project.'}
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                setStatusFilter('all')
                setCreateDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleCardClick(project)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Panel Overlay */}
      {selectedProject && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 animate-in fade-in duration-200"
            onClick={handleCloseDetail}
          />
          <ProjectDetailPanel
            project={selectedProject}
            onClose={handleCloseDetail}
          />
        </>
      )}

      {/* Create Dialog */}
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
}
