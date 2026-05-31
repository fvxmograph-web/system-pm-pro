'use client'

import { useMemo } from 'react'
import { usePMStore } from '@/lib/pm-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Target,
  AlertTriangle,
  Zap,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

// ── KPI Card ─────────────────────────────────────────────────────────
function KPICard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  format: fmt,
}: {
  title: string
  value: number
  subtitle?: string
  trend?: number
  icon: React.ComponentType<{ className?: string }>
  format?: 'number' | 'currency' | 'percent'
}) {
  const formatted = useMemo(() => {
    if (fmt === 'currency') {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
      if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
      return `$${value.toLocaleString()}`
    }
    if (fmt === 'percent') return `${value}%`
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toLocaleString()
  }, [value, fmt])

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-2xl font-bold tracking-tight">{formatted}</div>
      <div className="flex items-center gap-2 mt-1.5">
        {trend !== undefined && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>
    </Card>
  )
}

// ── Sparkline ────────────────────────────────────────────────────────
function Sparkline({ data, color = '#8b5cf6' }: { data: number[]; color?: string }) {
  const chartData = data.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width={80} height={32}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Retention Heatmap Cell ───────────────────────────────────────────
function RetentionCell({ value, cohortSize }: { value: number; cohortSize: number }) {
  const pct = cohortSize > 0 ? (value / cohortSize) * 100 : 0
  let bgClass = 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
  if (pct >= 60) bgClass = 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300'
  else if (pct >= 40) bgClass = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
  else if (pct >= 25) bgClass = 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300'
  else if (pct >= 10) bgClass = 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300'

  if (value === 0 && pct === 0) return <span className="text-xs text-muted-foreground">—</span>

  return (
    <span className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded text-xs font-semibold ${bgClass}`}>
      {pct.toFixed(0)}%
    </span>
  )
}

// ── Custom Tooltip ───────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload) return null
  return (
    <div className="bg-popover border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// ── Funnel Bar Colors ────────────────────────────────────────────────
const FUNNEL_COLORS = ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#3b0764']

// ── Main Component ───────────────────────────────────────────────────
export default function AnalyticsView() {
  const { analytics } = usePMStore()

  const {
    dailyActiveUsers,
    featureUsage,
    conversionFunnel,
    retentionCohorts,
    npsScore,
    errorRates,
    revenueMetrics,
  } = analytics

  const ltvCacRatio = revenueMetrics.cac > 0 ? (revenueMetrics.ltv / revenueMetrics.cac).toFixed(1) : '0'

  // Chart data transformations
  const dauChartData = useMemo(
    () => dailyActiveUsers.map(d => ({ ...d, date: format(parseISO(d.date), 'MMM d') })),
    [dailyActiveUsers]
  )

  const errorChartData = useMemo(
    () => errorRates.map(d => ({ ...d, date: format(parseISO(d.date), 'MMM d') })),
    [errorRates]
  )

  const funnelChartData = useMemo(
    () => conversionFunnel.map(d => ({ ...d, value: d.value })),
    [conversionFunnel]
  )

  const featureChartData = useMemo(
    () => [...featureUsage].sort((a, b) => b.users - a.users),
    [featureUsage]
  )

  const retentionRows = useMemo(
    () => [...retentionCohorts].reverse(),
    [retentionCohorts]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Product Analytics
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time product metrics and user behavior insights.
        </p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard
          title="DAU"
          value={dailyActiveUsers[dailyActiveUsers.length - 1]?.value ?? 0}
          trend={14}
          subtitle="vs last week"
          icon={Users}
        />
        <KPICard
          title="MRR"
          value={revenueMetrics.mrr}
          trend={8}
          subtitle="vs last month"
          icon={DollarSign}
          format="currency"
        />
        <KPICard
          title="ARR"
          value={revenueMetrics.arr}
          trend={12}
          subtitle="vs last quarter"
          icon={DollarSign}
          format="currency"
        />
        <KPICard
          title="Churn Rate"
          value={revenueMetrics.churn}
          trend={-0.5}
          subtitle="vs last month"
          icon={AlertTriangle}
          format="percent"
        />
        <KPICard
          title="NPS Score"
          value={npsScore.score}
          trend={npsScore.trend}
          subtitle={`${npsScore.responses} responses`}
          icon={Target}
        />
        <KPICard
          title="LTV/CAC"
          value={Number(ltvCacRatio)}
          subtitle="Ratio (target > 3)"
          icon={Zap}
        />
      </div>

      {/* Row 1: DAU Trend + Feature Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* DAU Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" />
              DAU Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dauChartData}>
                <defs>
                  <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#dauGradient)"
                  name="DAU"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feature Usage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-500" />
              Feature Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={featureChartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="feature" tick={{ fontSize: 11 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="users" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
            {/* Feature details table */}
            <div className="mt-2 space-y-1.5 max-h-[120px] overflow-y-auto">
              {featureChartData.map((f) => (
                <div key={f.feature} className="flex items-center justify-between text-xs px-1">
                  <span className="font-medium truncate max-w-[120px]">{f.feature}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{f.users} users</span>
                    <span className="text-muted-foreground">{f.sessions} sessions</span>
                    <span className={`font-medium ${f.trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {f.trend >= 0 ? '+' : ''}{f.trend}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Conversion Funnel + Retention Cohorts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Conversion Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={funnelChartData} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Users">
                  {funnelChartData.map((_, i) => (
                    <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Funnel rates */}
            <div className="flex flex-wrap gap-2 mt-2">
              {conversionFunnel.map((stage, i) => (
                <div key={stage.stage} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-xs text-muted-foreground mx-1">&rarr;</span>}
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {stage.rate}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Retention Cohorts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Retention Cohorts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-center">
                <thead>
                  <tr className="border-b">
                    <th className="text-left text-xs font-medium text-muted-foreground py-2 pr-4 w-24">Cohort</th>
                    <th className="text-xs font-medium text-muted-foreground py-2 px-2">Day 0</th>
                    <th className="text-xs font-medium text-muted-foreground py-2 px-2">Day 7</th>
                    <th className="text-xs font-medium text-muted-foreground py-2 px-2">Day 14</th>
                    <th className="text-xs font-medium text-muted-foreground py-2 px-2">Day 30</th>
                  </tr>
                </thead>
                <tbody>
                  {retentionRows.map((row) => (
                    <tr key={row.cohort} className="border-b border-border/50">
                      <td className="text-xs font-medium py-2.5 pr-4 text-left whitespace-nowrap">{row.cohort}</td>
                      <td className="py-2.5 px-2"><RetentionCell value={row.day0} cohortSize={row.day0} /></td>
                      <td className="py-2.5 px-2"><RetentionCell value={row.day7} cohortSize={row.day0} /></td>
                      <td className="py-2.5 px-2"><RetentionCell value={row.day14} cohortSize={row.day0} /></td>
                      <td className="py-2.5 px-2"><RetentionCell value={row.day30} cohortSize={row.day0} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Error Rates + Revenue Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Error Rates */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Error Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={errorChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                  name="Error Rate"
                />
                <Line
                  type="monotone"
                  dataKey="p95"
                  stroke="#f97316"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#f97316', r: 3 }}
                  name="P95"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-red-500 rounded" />
                <span className="text-xs text-muted-foreground">Error Rate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-orange-500 rounded border-dashed" />
                <span className="text-xs text-muted-foreground">P95 Latency</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              Revenue Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20">
                <div className="text-xs text-muted-foreground mb-1">MRR</div>
                <div className="text-xl font-bold">${revenueMetrics.mrr.toLocaleString()}</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +8% MoM
                </div>
              </div>
              <div className="rounded-xl border p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20">
                <div className="text-xs text-muted-foreground mb-1">ARR</div>
                <div className="text-xl font-bold">${revenueMetrics.arr.toLocaleString()}</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +12% QoQ
                </div>
              </div>
              <div className="rounded-xl border p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20">
                <div className="text-xs text-muted-foreground mb-1">Churn Rate</div>
                <div className="text-xl font-bold">{revenueMetrics.churn}%</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" /> -0.5%
                </div>
              </div>
              <div className="rounded-xl border p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20">
                <div className="text-xs text-muted-foreground mb-1">LTV / CAC</div>
                <div className="text-xl font-bold">{ltvCacRatio}x</div>
                <div className="text-xs text-muted-foreground mt-1">Target &gt; 3x</div>
              </div>
              <div className="rounded-xl border p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20">
                <div className="text-xs text-muted-foreground mb-1">LTV</div>
                <div className="text-xl font-bold">${revenueMetrics.ltv.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">Avg lifetime value</div>
              </div>
              <div className="rounded-xl border p-4 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20">
                <div className="text-xs text-muted-foreground mb-1">CAC</div>
                <div className="text-xl font-bold">${revenueMetrics.cac.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">Customer acquisition</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
