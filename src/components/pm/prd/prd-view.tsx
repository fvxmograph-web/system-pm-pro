'use client'

import { useState, useMemo } from 'react'
import { usePMStore } from '@/lib/pm-store'
import type { PRDDocument, PRDStatus, TaskPriority } from '@/lib/pm-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  FileText,
  Plus,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  Calendar,
  Layers,
  BarChart3,
  BookOpen,
  Target,
  Wrench,
  MessageSquare,
  Shield,
  ExternalLink,
} from 'lucide-react'

// ── helpers ──────────────────────────────────────────────────

const statusConfig: Record<PRDStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-gray-600', bg: 'bg-gray-100 border-gray-200' },
  in_review: { label: 'In Review', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  approved: { label: 'Approved', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  deprecated: { label: 'Deprecated', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  archived: { label: 'Archived', color: 'text-zinc-500', bg: 'bg-zinc-100 border-zinc-200' },
}

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  high: { label: 'High', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  medium: { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  low: { label: 'Low', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  none: { label: 'None', color: 'text-zinc-500', bg: 'bg-zinc-50 border-zinc-200' },
}

const reqStatusConfig: Record<string, { label: string; icon: typeof Circle; color: string }> = {
  pending: { label: 'Pending', icon: Circle, color: 'text-gray-400' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-amber-500' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-emerald-500' },
}

const statusWorkflow: PRDStatus[] = ['draft', 'in_review', 'approved', 'deprecated']

const formatDate = (d: string) => {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n) + '…' : s)

// ── types ────────────────────────────────────────────────────

interface SectionDef {
  id: string
  title: string
  icon: typeof FileText
}

// ── component ─────────────────────────────────────────────────

export default function PRDView() {
  const prds = usePMStore((s) => s.prds)
  const team = usePMStore((s) => s.team)
  const projects = usePMStore((s) => s.projects)
  const addPRD = usePMStore((s) => s.addPRD)
  const updatePRD = usePMStore((s) => s.updatePRD)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [expandedPros, setExpandedPros] = useState<Record<string, boolean>>({})
  const [reqChecked, setReqChecked] = useState<Record<string, boolean>>({})

  const selectedPRD = prds.find((p) => p.id === selectedId) ?? null

  const getAuthorName = (authorId: string) =>
    team.find((m) => m.id === authorId)?.name ?? 'Unknown'

  const getProjectName = (projectId: string) =>
    projects.find((p) => p.id === projectId)?.name ?? 'Unknown'

  // ── sections for TOC ──
  const sections: SectionDef[] = useMemo(
    () => [
      { id: 'summary', title: 'Summary', icon: FileText },
      { id: 'problem', title: 'Problem Statement', icon: AlertCircle },
      { id: 'audience', title: 'Target Audience', icon: Target },
      { id: 'stories', title: 'User Stories', icon: BookOpen },
      { id: 'func-req', title: 'Functional Requirements', icon: CheckCircle2 },
      { id: 'nonfunc-req', title: 'Non-Functional Requirements', icon: Shield },
      { id: 'metrics', title: 'Success Metrics', icon: BarChart3 },
      { id: 'technical', title: 'Technical Considerations', icon: Wrench },
      { id: 'questions', title: 'Open Questions', icon: HelpCircle },
      { id: 'timeline', title: 'Timeline', icon: Calendar },
      { id: 'dependencies', title: 'Dependencies', icon: Layers },
      { id: 'risks', title: 'Risks', icon: AlertCircle },
    ],
    [],
  )

  // ── toggle requirement checkbox ──
  const toggleReq = (frId: string, currentStatus: string) => {
    if (!selectedPRD) return
    const next =
      currentStatus === 'done' ? 'pending' : currentStatus === 'pending' ? 'in_progress' : 'done'
    updatePRD(selectedPRD.id, {
      functionalRequirements: selectedPRD.functionalRequirements.map((r) =>
        r.id === frId ? { ...r, status: next as 'pending' | 'in_progress' | 'done' } : r,
      ),
    })
  }

  // ── create PRD handler ──
  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const now = new Date().toISOString()
    const newPRD: PRDDocument = {
      id: `prd-${Date.now()}`,
      title: fd.get('title') as string,
      status: 'draft',
      projectId: fd.get('projectId') as string,
      authorId: 't1',
      version: 1,
      summary: (fd.get('summary') as string) || '',
      problemStatement: '',
      targetAudience: '',
      userStories: [],
      functionalRequirements: [],
      nonFunctionalRequirements: [],
      successMetrics: [],
      technicalConsiderations: [],
      openQuestions: [],
      timeline: '',
      dependencies: [],
      risks: [],
      createdAt: now,
      updatedAt: now,
    }
    addPRD(newPRD)
    setCreateOpen(false)
    setSelectedId(newPRD.id)
  }

  // ── status advance ──
  const advanceStatus = () => {
    if (!selectedPRD) return
    const idx = statusWorkflow.indexOf(selectedPRD.status)
    if (idx < statusWorkflow.length - 1) {
      updatePRD(selectedPRD.id, { status: statusWorkflow[idx + 1] })
    }
  }

  // ════════════════════════════════════════════════════════════
  //  DETAIL VIEW
  // ════════════════════════════════════════════════════════════

  if (selectedPRD) {
    const sc = statusConfig[selectedPRD.status]
    const reqsDone = selectedPRD.functionalRequirements.filter((r) => r.status === 'done').length
    const reqsTotal = selectedPRD.functionalRequirements.length

    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {/* ── Header bar ── */}
          <div className="mb-6 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          </div>

          {/* ── Document header ── */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge variant="outline" className={`border text-xs font-semibold ${sc.bg} ${sc.color}`}>
                {sc.label}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                v{selectedPRD.version}
              </Badge>
              <span className="text-xs text-muted-foreground">
                by {getAuthorName(selectedPRD.authorId)}
              </span>
              <span className="text-xs text-muted-foreground">
                Updated {formatDate(selectedPRD.updatedAt)}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{selectedPRD.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{getProjectName(selectedPRD.projectId)}</p>

            {/* Status workflow */}
            <div className="mt-4 flex items-center gap-2">
              {statusWorkflow.map((s, i) => {
                const c = statusConfig[s]
                const active = statusWorkflow.indexOf(selectedPRD.status) >= i
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
                        active ? c.bg + ' ' + c.color + ' border-current' : 'bg-muted text-muted-foreground border-muted'
                      }`}
                    >
                      {active ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                      {c.label}
                    </div>
                    {i < statusWorkflow.length - 1 && (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Table of Contents ── */}
          <Card className="mb-8">
            <CardHeader className="pb-3 pt-4 px-5">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4" /> Table of Contents
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-4">
                {sections.map((sec) => {
                  const Icon = sec.icon
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{sec.title}</span>
                    </a>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* ── Sections ── */}
          <div className="space-y-10">
            {/* Summary */}
            <section id="summary">
              <SectionHeader icon={FileText} title="Summary" accent="border-l-emerald-500" />
              <p className="text-sm leading-relaxed text-foreground/80">{selectedPRD.summary || 'No summary provided.'}</p>
            </section>

            {/* Problem Statement */}
            <section id="problem">
              <SectionHeader icon={AlertCircle} title="Problem Statement" accent="border-l-red-400" />
              <p className="text-sm leading-relaxed text-foreground/80">{selectedPRD.problemStatement || 'No problem statement defined.'}</p>
            </section>

            {/* Target Audience */}
            <section id="audience">
              <SectionHeader icon={Target} title="Target Audience" accent="border-l-violet-500" />
              <p className="text-sm leading-relaxed text-foreground/80">{selectedPRD.targetAudience || 'No target audience defined.'}</p>
            </section>

            {/* User Stories */}
            <section id="stories">
              <SectionHeader icon={BookOpen} title="User Stories" accent="border-l-blue-500" />
              {selectedPRD.userStories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No user stories defined.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs font-semibold">As a...</TableHead>
                        <TableHead className="text-xs font-semibold">I want to...</TableHead>
                        <TableHead className="text-xs font-semibold">So that...</TableHead>
                        <TableHead className="w-[80px] text-xs font-semibold">Priority</TableHead>
                        <TableHead className="w-[60px] text-xs font-semibold text-center">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPRD.userStories.map((us, i) => {
                        const pc = priorityConfig[us.priority]
                        return (
                          <TableRow key={i}>
                            <TableCell className="text-sm font-medium">{us.as}</TableCell>
                            <TableCell className="text-sm">{us.iWant}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{us.soThat}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-[10px] font-semibold border ${pc.bg} ${pc.color}`}>
                                {pc.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                {us.points}
                              </span>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {selectedPRD.userStories.length} stories ·{' '}
                {selectedPRD.userStories.reduce((a, s) => a + s.points, 0)} total points
              </p>
            </section>

            {/* Functional Requirements */}
            <section id="func-req">
              <SectionHeader icon={CheckCircle2} title="Functional Requirements" accent="border-l-teal-500" />
              {reqsTotal > 0 && (
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${(reqsDone / reqsTotal) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {reqsDone}/{reqsTotal} done
                  </span>
                </div>
              )}
              {selectedPRD.functionalRequirements.length === 0 ? (
                <p className="text-sm text-muted-foreground">No functional requirements defined.</p>
              ) : (
                <div className="space-y-1">
                  {selectedPRD.functionalRequirements.map((req) => {
                    const rsc = reqStatusConfig[req.status]
                    const RscIcon = rsc.icon
                    const pc = priorityConfig[req.priority]
                    return (
                      <button
                        key={req.id}
                        onClick={() => toggleReq(req.id, req.status)}
                        className="flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left transition-colors hover:bg-muted/50"
                      >
                        <RscIcon className={`h-5 w-5 flex-shrink-0 ${rsc.color}`} />
                        <span className={`flex-1 text-sm ${req.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                          {req.description}
                        </span>
                        <Badge variant="outline" className={`text-[10px] font-semibold border ${pc.bg} ${pc.color}`}>
                          {pc.label}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] border ${statusConfig[req.status === 'done' ? 'approved' : req.status === 'in_progress' ? 'in_review' : 'draft'].bg} ${statusConfig[req.status === 'done' ? 'approved' : req.status === 'in_progress' ? 'in_review' : 'draft'].color}`}>
                          {rsc.label}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Non-Functional Requirements */}
            <section id="nonfunc-req">
              <SectionHeader icon={Shield} title="Non-Functional Requirements" accent="border-l-amber-500" />
              {selectedPRD.nonFunctionalRequirements.length === 0 ? (
                <p className="text-sm text-muted-foreground">No non-functional requirements defined.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedPRD.nonFunctionalRequirements.map((nfr, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                      {nfr}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Success Metrics */}
            <section id="metrics">
              <SectionHeader icon={BarChart3} title="Success Metrics" accent="border-l-cyan-500" />
              {selectedPRD.successMetrics.length === 0 ? (
                <p className="text-sm text-muted-foreground">No success metrics defined.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs font-semibold">Metric</TableHead>
                        <TableHead className="text-xs font-semibold">Baseline</TableHead>
                        <TableHead className="text-xs font-semibold">Target</TableHead>
                        <TableHead className="text-xs font-semibold">Timeline</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPRD.successMetrics.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm font-medium">{m.metric}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{m.baseline}</TableCell>
                          <TableCell className="text-sm font-medium text-emerald-600">{m.target}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{m.timeline}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>

            {/* Technical Considerations */}
            <section id="technical">
              <SectionHeader icon={Wrench} title="Technical Considerations" accent="border-l-indigo-500" />
              {selectedPRD.technicalConsiderations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No technical considerations listed.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedPRD.technicalConsiderations.map((tc, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
                      {tc}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Open Questions */}
            <section id="questions">
              <SectionHeader icon={HelpCircle} title="Open Questions" accent="border-l-orange-500" />
              {selectedPRD.openQuestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open questions.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs font-semibold">Question</TableHead>
                        <TableHead className="text-xs font-semibold">Answer</TableHead>
                        <TableHead className="w-[120px] text-xs font-semibold">Owner</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPRD.openQuestions.map((q, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm font-medium">{q.question}</TableCell>
                          <TableCell className="text-sm">
                            {q.answer ? (
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                {q.answer}
                              </span>
                            ) : (
                              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-600 text-[10px]">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{q.owner}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>

            {/* Timeline */}
            <section id="timeline">
              <SectionHeader icon={Calendar} title="Timeline" accent="border-l-rose-500" />
              <p className="text-sm leading-relaxed text-foreground/80">{selectedPRD.timeline || 'No timeline defined.'}</p>
            </section>

            {/* Dependencies */}
            <section id="dependencies">
              <SectionHeader icon={Layers} title="Dependencies" accent="border-l-purple-500" />
              {selectedPRD.dependencies.length === 0 ? (
                <p className="text-sm text-muted-foreground">No dependencies listed.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedPRD.dependencies.map((dep, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-400" />
                      {dep}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Risks */}
            <section id="risks">
              <SectionHeader icon={AlertCircle} title="Risks" accent="border-l-red-500" />
              {selectedPRD.risks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No risks identified.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedPRD.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* ── Footer actions ── */}
          <Separator className="my-8" />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={advanceStatus}
              disabled={selectedPRD.status === 'deprecated' || selectedPRD.status === 'archived'}
            >
              Advance to {statusConfig[statusWorkflow[statusWorkflow.indexOf(selectedPRD.status) + 1] || statusWorkflow[statusWorkflow.length - 1]]?.label}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  //  LIST VIEW
  // ════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ── Page header ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6 text-emerald-500" />
              PRD Documents
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Product Requirements Documents — Notion-inspired writer
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" /> New PRD
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create New PRD</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" placeholder="PRD: Feature Name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectId">Project</Label>
                    <Select name="projectId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea
                      id="summary"
                      name="summary"
                      placeholder="Brief overview of this PRD..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">Create PRD</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* ── PRD cards ── */}
        {prds.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No PRDs yet</p>
              <p className="text-xs text-muted-foreground">Create your first PRD to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prds.map((prd) => {
              const sc = statusConfig[prd.status]
              return (
                <Card
                  key={prd.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-foreground/20 group"
                  onClick={() => setSelectedId(prd.id)}
                >
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-[10px] font-semibold border ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        v{prd.version}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold leading-snug group-hover:text-emerald-600 transition-colors">
                      {prd.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      {getProjectName(prd.projectId)}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {truncate(prd.summary, 120)}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{getAuthorName(prd.authorId)}</span>
                      <span>{formatDate(prd.updatedAt)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        {prd.userStories.length} user {prd.userStories.length === 1 ? 'story' : 'stories'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── sub-components ────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  accent,
}: {
  icon: typeof FileText
  title: string
  accent: string
}) {
  return (
    <div className={`mb-3 flex items-center gap-2.5 border-l-2 ${accent} pl-3`}>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <h2 className="text-base font-semibold">{title}</h2>
    </div>
  )
}
