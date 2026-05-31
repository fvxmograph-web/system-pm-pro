'use client'

import { useMemo, useState } from 'react'
import { usePMStore, type Risk, type RiskLevel, type RiskCategory, type RiskStatus } from '@/lib/pm-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Shield, AlertTriangle, AlertOctagon, ChevronDown, ChevronUp,
  Clock, Filter, Eye,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

// ============================================================
// Color Mappings
// ============================================================

const LEVEL_COLORS: Record<RiskLevel, { bg: string; text: string; bar: string; label: string }> = {
  critical: { bg: 'bg-red-100 dark:bg-red-950/50',      text: 'text-red-700 dark:text-red-300',      bar: 'bg-red-500',      label: 'Critical' },
  high:     { bg: 'bg-orange-100 dark:bg-orange-950/50', text: 'text-orange-700 dark:text-orange-300', bar: 'bg-orange-500',   label: 'High' },
  medium:   { bg: 'bg-yellow-100 dark:bg-yellow-950/50', text: 'text-yellow-700 dark:text-yellow-300', bar: 'bg-yellow-500',   label: 'Medium' },
  low:      { bg: 'bg-green-100 dark:bg-green-950/50',   text: 'text-green-700 dark:text-green-300',  bar: 'bg-green-500',    label: 'Low' },
}

const CATEGORY_COLORS: Record<RiskCategory, { bg: string; text: string; label: string }> = {
  technical:  { bg: 'bg-purple-100 dark:bg-purple-950/50',  text: 'text-purple-700 dark:text-purple-300',  label: 'Technical' },
  market:     { bg: 'bg-blue-100 dark:bg-blue-950/50',      text: 'text-blue-700 dark:text-blue-300',      label: 'Market' },
  financial:  { bg: 'bg-green-100 dark:bg-green-950/50',    text: 'text-green-700 dark:text-green-300',     label: 'Financial' },
  operational:{ bg: 'bg-orange-100 dark:bg-orange-950/50',  text: 'text-orange-700 dark:text-orange-300',  label: 'Operational' },
  team:       { bg: 'bg-pink-100 dark:bg-pink-950/50',     text: 'text-pink-700 dark:text-pink-300',      label: 'Team' },
  compliance: { bg: 'bg-red-100 dark:bg-red-950/50',       text: 'text-red-700 dark:text-red-300',         label: 'Compliance' },
}

const STATUS_COLORS: Record<RiskStatus, { bg: string; text: string; label: string }> = {
  identified: { bg: 'bg-gray-100 dark:bg-gray-800/50',      text: 'text-gray-600 dark:text-gray-400',       label: 'Identified' },
  analyzing:  { bg: 'bg-blue-100 dark:bg-blue-950/50',     text: 'text-blue-600 dark:text-blue-400',       label: 'Analyzing' },
  mitigating: { bg: 'bg-yellow-100 dark:bg-yellow-950/50', text: 'text-yellow-600 dark:text-yellow-400',  label: 'Mitigating' },
  resolved:   { bg: 'bg-green-100 dark:bg-green-950/50',   text: 'text-green-600 dark:text-green-400',    label: 'Resolved' },
  accepted:   { bg: 'bg-teal-100 dark:bg-teal-950/50',     text: 'text-teal-600 dark:text-teal-400',      label: 'Accepted' },
  closed:     { bg: 'bg-slate-100 dark:bg-slate-800/50',  text: 'text-slate-500 dark:text-slate-400',     label: 'Closed' },
}

// ============================================================
// Risk Matrix (5x5)
// ============================================================

function getMatrixColor(probIdx: number, impIdx: number): string {
  const score = (probIdx + 1) * (impIdx + 1)
  if (score <= 4)  return 'bg-green-200 dark:bg-green-900/60'
  if (score <= 9)  return 'bg-green-300 dark:bg-green-800/60'
  if (score <= 12) return 'bg-yellow-200 dark:bg-yellow-800/60'
  if (score <= 16) return 'bg-orange-300 dark:bg-orange-800/60'
  return 'bg-red-400 dark:bg-red-700/60'
}

function getMatrixTextColor(probIdx: number, impIdx: number): string {
  const score = (probIdx + 1) * (impIdx + 1)
  if (score <= 4)  return 'text-green-800 dark:text-green-200'
  if (score <= 9)  return 'text-green-900 dark:text-green-200'
  if (score <= 12) return 'text-yellow-900 dark:text-yellow-200'
  if (score <= 16) return 'text-orange-900 dark:text-orange-100'
  return 'text-red-900 dark:text-red-100'
}

function getRiskMatrixPosition(probability: number, impact: number): [number, number] {
  // probability 0-100 -> 0-4, impact 0-10 -> 0-4
  const probIdx = Math.min(4, Math.floor(probability / 20))
  const impIdx = Math.min(4, Math.floor(impact / 2))
  return [probIdx, impIdx]
}

function RiskMatrix({ risks }: { risks: Risk[] }) {
  // Build matrix grid positions
  const matrixPositions = useMemo(() => {
    const grid: Record<string, Risk[]> = {}
    risks.forEach((r) => {
      const [p, i] = getRiskMatrixPosition(r.probability, r.impact)
      const key = `${p}-${i}`
      if (!grid[key]) grid[key] = []
      grid[key].push(r)
    })
    return grid
  }, [risks])

  const probabilityLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High']
  const impactLabels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic']

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Risk Matrix
        </CardTitle>
        <CardDescription className="text-xs">Probability vs Impact — darker cells = higher severity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Y-axis label */}
            <div className="flex">
              <div className="w-16 flex-shrink-0" />
              {/* Column headers (Impact) */}
              <div className="flex-1 grid grid-cols-5 gap-1">
                {impactLabels.map((label) => (
                  <div key={label} className="text-center text-[10px] text-muted-foreground font-medium truncate">
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground font-medium text-center mb-1">Impact →</div>

            {/* Grid */}
            <div className="flex">
              {/* Y-axis */}
              <div className="w-16 flex-shrink-0 flex flex-col justify-around py-1">
                <div className="text-[10px] text-muted-foreground font-medium text-center -rotate-90 origin-center whitespace-nowrap">
                  Probability ↑
                </div>
              </div>

              <div className="flex-1 grid grid-rows-5 gap-1">
                {[4, 3, 2, 1, 0].map((probIdx) => (
                  <div key={probIdx} className="grid grid-cols-5 gap-1" style={{ gridTemplateRows: '1fr' }}>
                    {[0, 1, 2, 3, 4].map((impIdx) => {
                      const key = `${probIdx}-${impIdx}`
                      const cellRisks = matrixPositions[key] || []
                      const bgColor = getMatrixColor(probIdx, impIdx)
                      const textColor = getMatrixTextColor(probIdx, impIdx)
                      return (
                        <TooltipProvider key={key}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`relative flex items-center justify-center rounded-md min-h-[52px] p-1 cursor-default transition-transform hover:scale-105 ${bgColor} ${textColor}`}
                              >
                                {cellRisks.length > 0 ? (
                                  <div className="flex flex-wrap gap-0.5 justify-center">
                                    {cellRisks.map((r) => {
                                      const lvlCfg = LEVEL_COLORS[r.level]
                                      return (
                                        <Badge
                                          key={r.id}
                                          className={`text-[9px] px-1 py-0 ${lvlCfg.bg} ${lvlCfg.text} border-0`}
                                        >
                                          {r.id.replace('risk', 'R')}
                                        </Badge>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  <span className="text-[9px] opacity-50">{(probIdx + 1) * (impIdx + 1)}</span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs space-y-1 max-w-[250px]">
                                <p className="font-medium">P{probIdx + 1} × I{impIdx + 1} = {(probIdx + 1) * (impIdx + 1)}</p>
                                {cellRisks.map((r) => (
                                  <div key={r.id}>
                                    <p className="font-semibold">{r.title}</p>
                                    <p className="text-muted-foreground">Level: {r.level} | Status: {r.status}</p>
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Probability labels below */}
            <div className="flex mt-1">
              <div className="w-16 flex-shrink-0" />
              <div className="flex-1 flex justify-around">
                {[4, 3, 2, 1, 0].map((i) => (
                  <span key={i} className="text-[10px] text-muted-foreground w-1/5 text-center">
                    P{i + 1}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 justify-center flex-wrap">
          {[
            { color: 'bg-green-300 dark:bg-green-800/60', label: 'Low (1-4)' },
            { color: 'bg-yellow-200 dark:bg-yellow-800/60', label: 'Medium (5-9)' },
            { color: 'bg-orange-300 dark:bg-orange-800/60', label: 'High (10-16)' },
            { color: 'bg-red-400 dark:bg-red-700/60', label: 'Critical (17-25)' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={`h-3 w-3 rounded ${color}`} />
              {label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Risk Row (expandable)
// ============================================================

function RiskRow({ risk }: { risk: Risk }) {
  const [expanded, setExpanded] = useState(false)
  const levelCfg = LEVEL_COLORS[risk.level]
  const catCfg = CATEGORY_COLORS[risk.category]
  const statusCfg = STATUS_COLORS[risk.status]

  const projects = usePMStore((s) => s.projects)
  const project = projects.find((p) => p.id === risk.projectId)

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell className="py-3">
          <div className="flex items-center gap-1.5">
            {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            <div>
              <p className="text-xs font-semibold max-w-[260px] truncate">{risk.title}</p>
              <p className="text-[10px] text-muted-foreground">{risk.id.toUpperCase()}</p>
            </div>
          </div>
        </TableCell>
        <TableCell className="py-3">
          <Badge variant="outline" className={`text-[10px] ${catCfg.bg} ${catCfg.text} border-0`}>
            {catCfg.label}
          </Badge>
        </TableCell>
        <TableCell className="py-3">
          <Badge variant="outline" className={`text-[10px] ${levelCfg.bg} ${levelCfg.text} border-0`}>
            {levelCfg.label}
          </Badge>
        </TableCell>
        <TableCell className="py-3">
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${levelCfg.bar}`} style={{ width: `${risk.probability}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground w-8 text-right">{risk.probability}%</span>
          </div>
        </TableCell>
        <TableCell className="py-3">
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${levelCfg.bar}`} style={{ width: `${risk.impact * 10}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground w-6 text-right">{risk.impact}/10</span>
          </div>
        </TableCell>
        <TableCell className="py-3">
          <Badge variant="outline" className={`text-[10px] ${statusCfg.bg} ${statusCfg.text} border-0`}>
            {statusCfg.label}
          </Badge>
        </TableCell>
        <TableCell className="py-3 text-xs text-muted-foreground">{risk.owner}</TableCell>
        <TableCell className="py-3 text-[10px] text-muted-foreground">
          {format(parseISO(risk.identifiedDate), 'MMM d')}
        </TableCell>
      </TableRow>

      {/* Expanded row */}
      {expanded && (
        <TableRow>
          <TableCell colSpan={8} className="bg-muted/30 px-8 py-4">
            <div className="max-w-2xl space-y-3">
              <div>
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</h4>
                <p className="text-xs text-foreground leading-relaxed">{risk.description}</p>
              </div>
              <Separator />
              <div>
                <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Mitigation Strategy</h4>
                <p className="text-xs text-foreground leading-relaxed">{risk.mitigation}</p>
              </div>
              {project && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Project:</span>
                    <Badge variant="outline" className="text-[10px]">{project.name}</Badge>
                  </div>
                </>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

// ============================================================
// Risk Stats
// ============================================================

function RiskStats({ risks }: { risks: Risk[] }) {
  const byLevel = useMemo(() => {
    const counts: Record<RiskLevel, number> = { critical: 0, high: 0, medium: 0, low: 0 }
    risks.forEach((r) => { counts[r.level]++ })
    return counts
  }, [risks])

  const byStatus = useMemo(() => {
    const counts: Record<string, number> = {}
    risks.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1 })
    return counts
  }, [risks])

  const topRisks = useMemo(() =>
    [...risks]
      .sort((a, b) => (b.probability * b.impact) - (a.probability * a.impact))
      .slice(0, 5),
    [risks]
  )

  const levelIcon = (level: RiskLevel) => {
    if (level === 'critical') return <AlertOctagon className="h-4 w-4 text-red-500" />
    if (level === 'high') return <AlertTriangle className="h-4 w-4 text-orange-500" />
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />
  }

  return (
    <div className="space-y-4">
      {/* By Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Risk Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Level breakdown */}
          <div className="grid grid-cols-2 gap-3">
            {(['critical', 'high', 'medium', 'low'] as const).map((level) => {
              const cfg = LEVEL_COLORS[level]
              return (
                <div key={level} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  {levelIcon(level)}
                  <div className="flex-1">
                    <div className="text-xs font-medium">{cfg.label}</div>
                    <div className="text-lg font-bold">{byLevel[level]}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <Separator />

          {/* Status breakdown */}
          <div>
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">By Status</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(byStatus).map(([status, count]) => {
                const cfg = STATUS_COLORS[status as RiskStatus]
                return (
                  <Badge key={status} variant="outline" className={`text-[10px] ${cfg?.bg || ''} ${cfg?.text || ''} border-0`}>
                    {cfg?.label || status}: {count}
                  </Badge>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Top Risks */}
          <div>
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Top Risks by Severity</h4>
            <div className="space-y-2">
              {topRisks.map((r, idx) => {
                const severity = r.probability * r.impact
                return (
                  <div key={r.id} className="flex items-start gap-2">
                    <span className="text-xs font-bold text-muted-foreground mt-0.5 w-4">{idx + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{r.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className={`text-[9px] ${LEVEL_COLORS[r.level].bg} ${LEVEL_COLORS[r.level].text} border-0`}>
                          {LEVEL_COLORS[r.level].label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">Severity: {severity}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// Main Risk View
// ============================================================

export default function RisksView() {
  const risks = usePMStore((s) => s.risks)
  const [filterLevel, setFilterLevel] = useState<RiskLevel | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<RiskStatus | 'all'>('all')

  const filtered = useMemo(() => {
    return risks.filter((r) => {
      if (filterLevel !== 'all' && r.level !== filterLevel) return false
      if (filterStatus !== 'all' && r.status !== filterStatus) return false
      return true
    })
  }, [risks, filterLevel, filterStatus])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Risk Register
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Identify, assess, and track project risks with mitigation strategies
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Level filter */}
          <div className="flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as RiskLevel | 'all')}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as RiskStatus | 'all')}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="identified">Identified</option>
            <option value="analyzing">Analyzing</option>
            <option value="mitigating">Mitigating</option>
            <option value="resolved">Resolved</option>
            <option value="accepted">Accepted</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matrix">Risk Matrix</TabsTrigger>
          <TabsTrigger value="list">Risk List</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* Matrix Tab */}
        <TabsContent value="matrix" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <RiskMatrix risks={risks} />
            </div>
            <div>
              <RiskStats risks={risks} />
            </div>
          </div>
        </TabsContent>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk Register ({filtered.length} risks)</CardTitle>
              <CardDescription className="text-xs">Click a row to expand details and mitigation strategies</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs w-[280px]">Risk</TableHead>
                      <TableHead className="text-xs">Category</TableHead>
                      <TableHead className="text-xs">Level</TableHead>
                      <TableHead className="text-xs">Probability</TableHead>
                      <TableHead className="text-xs">Impact</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Owner</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((risk) => (
                      <RiskRow key={risk.id} risk={risk} />
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">
                          No risks match the selected filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RiskStats risks={risks} />
            <RiskMatrix risks={risks} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
