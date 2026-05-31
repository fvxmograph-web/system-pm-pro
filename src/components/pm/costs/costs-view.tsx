'use client'

import { useMemo, useState } from 'react'
import { usePMStore, type CostItem, type StartupProgram, type StartupProgramStatus } from '@/lib/pm-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import {
  DollarSign, TrendingDown, Award, ExternalLink, Clock,
  CheckCircle2, XCircle, AlertCircle, Loader2, Ban,
  ArrowUpDown, Sparkles,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

// ============================================================
// Helpers & Colors
// ============================================================

const STATUS_CONFIG: Record<StartupProgramStatus, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
  active:   { bg: 'bg-green-100 dark:bg-green-950/50', text: 'text-green-700 dark:text-green-300',  icon: <CheckCircle2 className="h-3 w-3" />,   label: 'Active' },
  approved: { bg: 'bg-blue-100 dark:bg-blue-950/50',   text: 'text-blue-700 dark:text-blue-300',    icon: <CheckCircle2 className="h-3 w-3" />,   label: 'Approved' },
  applied:  { bg: 'bg-yellow-100 dark:bg-yellow-950/50',text: 'text-yellow-700 dark:text-yellow-300',icon: <Loader2 className="h-3 w-3" />,        label: 'Applied' },
  expired:  { bg: 'bg-gray-100 dark:bg-gray-800/50',  text: 'text-gray-500 dark:text-gray-400',    icon: <XCircle className="h-3 w-3" />,          label: 'Expired' },
  rejected: { bg: 'bg-red-100 dark:bg-red-950/50',     text: 'text-red-700 dark:text-red-300',     icon: <Ban className="h-3 w-3" />,             label: 'Rejected' },
}

const PIE_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16', '#a855f7']

// ============================================================
// Cost Overview Section
// ============================================================

function CostOverview({ costs }: { costs: CostItem[] }) {
  const totalMonthly = useMemo(() => costs.reduce((s, c) => s + c.monthlyCost, 0), [costs])
  const totalAnnual = useMemo(() => costs.reduce((s, c) => s + c.annualCost, 0), [costs])
  const essentialCost = useMemo(() => costs.filter((c) => c.essential).reduce((s, c) => s + c.monthlyCost, 0), [costs])
  const optionalCost = totalMonthly - essentialCost

  const pieData = useMemo(() => {
    const byCategory: Record<string, number> = {}
    costs.forEach((c) => { byCategory[c.category] = (byCategory[c.category] || 0) + c.monthlyCost })
    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
  }, [costs])

  const barData = useMemo(() => {
    return costs
      .filter((c) => c.monthlyCost > 0)
      .map((c) => ({
        name: c.tool.length > 15 ? c.tool.slice(0, 13) + '…' : c.tool,
        fullName: c.tool,
        cost: c.monthlyCost,
      }))
      .sort((a, b) => b.cost - a.cost)
  }, [costs])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* KPI Cards */}
      <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Monthly Cost</p>
              <p className="text-xl font-bold">${totalMonthly.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Annual Cost</p>
              <p className="text-xl font-bold">${totalAnnual.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Essential</p>
              <p className="text-xl font-bold">${essentialCost.toFixed(2)}/mo</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Optional</p>
              <p className="text-xl font-bold">${optionalCost.toFixed(2)}/mo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost Breakdown</CardTitle>
          <CardDescription className="text-xs">By category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((_, idx) => (
                    <Cell key={`pie-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value: number) => [`$${value.toFixed(2)}/mo`, 'Cost']}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value: string) => <span className="text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Monthly Cost Trend</CardTitle>
          <CardDescription className="text-xs">Cost per tool (monthly)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <RechartsTooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value: number, name: string, props: { payload: { fullName: string } }) => [`$${value.toFixed(2)}/mo`, props.payload.fullName]}
                />
                <Bar dataKey="cost" radius={[4, 4, 0, 0]} barSize={24}>
                  {barData.map((_, idx) => (
                    <Cell key={`bar-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// Cost Table
// ============================================================

type SortField = 'tool' | 'monthlyCost' | 'annualCost' | 'category' | 'essential'
type SortDir = 'asc' | 'desc'

function SortIcon({ field, active }: { field: SortField; active: boolean }) {
  return <ArrowUpDown className={`h-3 w-3 ml-1 inline ${active ? 'opacity-100' : 'opacity-30'}`} />
}

function CostTable({ costs }: { costs: CostItem[] }) {
  const [sortField, setSortField] = useState<SortField>('monthlyCost')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => {
    return [...costs].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        return sortDir === 'asc' ? (aVal === bVal ? 0 : aVal ? -1 : 1) : (aVal === bVal ? 0 : aVal ? 1 : -1)
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDir === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal)
    })
  }, [costs, sortField, sortDir])

  const totalMonthly = costs.reduce((s, c) => s + c.monthlyCost, 0)
  const totalAnnual = costs.reduce((s, c) => s + c.annualCost, 0)

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('desc') }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cost Table</CardTitle>
        <CardDescription className="text-xs">All tools and services. Click column headers to sort.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[480px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs cursor-pointer select-none" onClick={() => toggleSort('category')}>
                  Category <SortIcon field="category" active={sortField === 'category'} />
                </TableHead>
                <TableHead className="text-xs cursor-pointer select-none" onClick={() => toggleSort('tool')}>
                  Tool <SortIcon field="tool" active={sortField === 'tool'} />
                </TableHead>
                <TableHead className="text-xs text-right cursor-pointer select-none" onClick={() => toggleSort('monthlyCost')}>
                  Monthly <SortIcon field="monthlyCost" active={sortField === 'monthlyCost'} />
                </TableHead>
                <TableHead className="text-xs text-right cursor-pointer select-none" onClick={() => toggleSort('annualCost')}>
                  Annual <SortIcon field="annualCost" active={sortField === 'annualCost'} />
                </TableHead>
                <TableHead className="text-xs">Plan</TableHead>
                <TableHead className="text-xs text-center">Essential</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((item) => (
                <TableRow key={item.id} className={item.essential ? 'bg-primary/[0.03]' : ''}>
                  <TableCell className="text-xs font-medium">{item.category}</TableCell>
                  <TableCell className="text-xs font-semibold">{item.tool}</TableCell>
                  <TableCell className="text-xs text-right font-mono">${item.monthlyCost.toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-right font-mono">${item.annualCost.toFixed(2)}</TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="text-[10px]">{item.plan}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-center">
                    {item.essential ? (
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Yes
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">{item.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell className="text-xs" colSpan={2}>Total ({costs.length} items)</TableCell>
                <TableCell className="text-xs text-right font-mono">${totalMonthly.toFixed(2)}</TableCell>
                <TableCell className="text-xs text-right font-mono">${totalAnnual.toFixed(2)}</TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </TableFooter>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Startup Program Card
// ============================================================

function StartupProgramCard({ program }: { program: StartupProgram }) {
  const statusCfg = STATUS_CONFIG[program.status]

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{program.company}</span>
            </div>
            <h3 className="text-sm font-semibold truncate">{program.name}</h3>
          </div>
          <Badge variant="outline" className={`shrink-0 ml-2 text-[10px] font-medium ${statusCfg.bg} ${statusCfg.text}`}>
            <span className="mr-1">{statusCfg.icon}</span>
            {statusCfg.label}
          </Badge>
        </div>

        {/* Benefits */}
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{program.benefits}</p>

        {/* Savings */}
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-md bg-green-50 dark:bg-green-950/30">
          <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
          <span className="text-xs font-semibold text-green-700 dark:text-green-300">{program.savings}</span>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 mb-3 text-[11px] text-muted-foreground">
          {program.applicationDate && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Applied: {format(parseISO(program.applicationDate), 'MMM d, yyyy')}</span>
            </div>
          )}
          {program.expirationDate && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Expires: {format(parseISO(program.expirationDate), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {program.notes && (
          <p className="text-[11px] text-muted-foreground mb-3 italic border-l-2 border-muted pl-2">{program.notes}</p>
        )}

        {/* Link */}
        {program.url && (
          <a href={program.url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-primary px-0">
              <ExternalLink className="h-3 w-3" />
              View Program
            </Button>
          </a>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================
// Savings Summary
// ============================================================

function SavingsSummary({ programs }: { programs: StartupProgram[] }) {
  const totalSavings = useMemo(() => {
    // Rough estimate of total savings from active programs
    const savingsStrings = programs
      .filter((p) => p.status === 'active' || p.status === 'approved')
      .map((p) => {
        const match = p.savings.match(/\$(?:(\d[\d,]*)|([\d.]+))/g)
        if (!match) return 0
        return match.reduce((s, m) => s + parseFloat(m.replace(/[$,]/g, '')), 0)
      })
    return savingsStrings.reduce((s, v) => s + v, 0)
  }, [programs])

  const activeCount = programs.filter((p) => p.status === 'active').length
  const approvedCount = programs.filter((p) => p.status === 'approved').length
  const appliedCount = programs.filter((p) => p.status === 'applied').length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          Savings Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
            <div className="text-lg font-bold text-green-700 dark:text-green-300">~${Math.round(totalSavings).toLocaleString()}</div>
            <div className="text-[10px] text-green-600 dark:text-green-400 uppercase tracking-wider">Estimated Savings</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
            <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{activeCount}</div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 uppercase tracking-wider">Active Programs</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          {[
            { label: 'Active', count: activeCount, color: 'bg-green-500' },
            { label: 'Approved', count: approvedCount, color: 'bg-blue-500' },
            { label: 'Applied', count: appliedCount, color: 'bg-yellow-500' },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${color}`} />
                <span className="text-muted-foreground">{label}</span>
              </div>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// Main Costs View
// ============================================================

export default function CostsView() {
  const costs = usePMStore((s) => s.costs)
  const programs = usePMStore((s) => s.startupPrograms)

  const monthlyTotal = useMemo(() => costs.reduce((s, c) => s + c.monthlyCost, 0), [costs])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          Cost Calculator & Startup Programs
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track SaaS costs, manage startup program benefits, and optimize spending
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Cost Overview</TabsTrigger>
          <TabsTrigger value="table">Cost Table</TabsTrigger>
          <TabsTrigger value="programs">Startup Programs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <CostOverview costs={costs} />
          <CostTable costs={costs} />
        </TabsContent>

        {/* Table Tab */}
        <TabsContent value="table" className="space-y-4">
          <CostTable costs={costs} />
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {programs.map((p) => (
                  <StartupProgramCard key={p.id} program={p} />
                ))}
              </div>
            </div>
            <div>
              <SavingsSummary programs={programs} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
