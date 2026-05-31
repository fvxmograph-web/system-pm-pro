'use client'

import { useState, useMemo } from 'react'
import { usePMStore } from '@/lib/pm-store'
import type { TechCategory, TechStackItem } from '@/lib/pm-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  BarChart3,
  Users,
  BookOpen,
  Layers,
  ChevronRight,
  CheckCircle2,
  Globe,
  Zap,
  GraduationCap,
  TrendingUp,
} from 'lucide-react'

// ── helpers ──────────────────────────────────────────────────

const categoryConfig: Record<TechCategory, { label: string; color: string; bg: string; border: string; icon: typeof Layers }> = {
  frontend: { label: 'Frontend', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Globe },
  backend: { label: 'Backend', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: Layers },
  database: { label: 'Database', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', icon: Layers },
  cloud: { label: 'Cloud', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: Zap },
  auth: { label: 'Auth', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', icon: CheckCircle2 },
  payments: { label: 'Payments', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: DollarSign },
  analytics: { label: 'Analytics', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', icon: BarChart3 },
  monitoring: { label: 'Monitoring', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: BarChart3 },
  email: { label: 'Email', color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200', icon: BookOpen },
  ci_cd: { label: 'CI/CD', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: Zap },
  design: { label: 'Design', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: BookOpen },
  other: { label: 'Other', color: 'text-zinc-600', bg: 'bg-zinc-50', border: 'border-zinc-200', icon: Layers },
}

const maturityConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  experimental: { label: 'Experimental', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  stable: { label: 'Stable', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  mature: { label: 'Mature', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  legacy: { label: 'Legacy', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
}

const learningCurveConfig: Record<string, { label: string; level: number; color: string }> = {
  low: { label: 'Low', level: 1, color: 'bg-emerald-500' },
  medium: { label: 'Medium', level: 2, color: 'bg-amber-500' },
  high: { label: 'High', level: 3, color: 'bg-red-500' },
}

const communityConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  small: { label: 'Small', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  medium: { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  large: { label: 'Large', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
}

// Compute a simple score for the decision matrix
const computeScore = (item: TechStackItem): number => {
  let score = 0
  // Learning curve: low=3, medium=2, high=1
  score += item.learningCurve === 'low' ? 3 : item.learningCurve === 'medium' ? 2 : 1
  // Community: large=3, medium=2, small=1
  score += item.communitySize === 'large' ? 3 : item.communitySize === 'medium' ? 2 : 1
  // Maturity: mature=3, stable=2, experimental=1, legacy=0
  score += item.maturity === 'mature' ? 3 : item.maturity === 'stable' ? 2 : item.maturity === 'experimental' ? 1 : 0
  // Cost: if free, +1
  if (item.cost.toLowerCase().includes('free')) score += 1
  return score
}

// ── component ─────────────────────────────────────────────────

export default function TechStackView() {
  const techStack = usePMStore((s) => s.techStack)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<TechCategory, TechStackItem[]>()
    for (const item of techStack) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return map
  }, [techStack])

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Unique categories used
  const usedCategories = Array.from(grouped.keys())

  // ── architecture text ──
  const architectureLines = [
    '┌──────────────┐     ┌──────────────────┐     ┌──────────────┐',
    '│   Next.js 14  │────▶│    Vercel Edge   │────▶│    CDN +     │',
    '│  (Frontend)   │     │   Functions      │     │   Cache      │',
    '└──────┬───────┘     └──────────────────┘     └──────────────┘',
    '       │                                              ▲',
    '       ▼                                              │',
    '┌──────────────┐     ┌──────────────────┐     ┌──────────────┐',
    '│   Clerk      │────▶│    Supabase      │────▶│   PostgreSQL │',
    '│  (Auth)      │     │  (Backend/BaaS)  │────▶│  (Database) │',
    '└──────────────┘     └──────┬───────────┘     └──────────────┘',
    '                             │',
    '              ┌──────────────┼──────────────┐',
    '              ▼              ▼              ▼',
    '     ┌────────────┐  ┌───────────┐  ┌───────────┐',
    '     │   Stripe   │  │  Resend   │  │  Mixpanel │',
    '     │ (Payments) │  │  (Email)  │  │(Analytics)│',
    '     └────────────┘  └───────────┘  └───────────┘',
    '              │              │              │',
    '              ▼              ▼              ▼',
    '     ┌────────────┐  ┌───────────┐  ┌───────────┐',
    '     │  Sentry    │  │  GitHub   │  │  (Users)  │',
    '     │(Monitoring)│  │Actions/CI │  │           │',
    '     └────────────┘  └───────────┘  └───────────┘',
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ── Page header ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-blue-500" />
            Tech Stack Planner
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Technology decisions, alternatives, costs & architecture overview
          </p>
        </div>

        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="categories" className="text-xs sm:text-sm">
              <Layers className="mr-1.5 h-3.5 w-3.5 hidden sm:inline-block" />
              By Category
            </TabsTrigger>
            <TabsTrigger value="matrix" className="text-xs sm:text-sm">
              <BarChart3 className="mr-1.5 h-3.5 w-3.5 hidden sm:inline-block" />
              Decision Matrix
            </TabsTrigger>
            <TabsTrigger value="architecture" className="text-xs sm:text-sm">
              <Globe className="mr-1.5 h-3.5 w-3.5 hidden sm:inline-block" />
              Architecture
            </TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════════════════
              TAB 1: By Category
           ══════════════════════════════════════════════════ */}
          <TabsContent value="categories">
            <div className="space-y-6">
              {usedCategories.map((cat) => {
                const cc = categoryConfig[cat]
                const items = grouped.get(cat)!
                const CatIcon = cc.icon
                return (
                  <Card key={cat} className="overflow-hidden">
                    <CardHeader className={`border-b ${cc.bg} px-5 py-3`}>
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <CatIcon className={`h-4 w-4 ${cc.color}`} />
                        {cc.label}
                        <Badge variant="outline" className={`ml-1 text-[10px] ${cc.color} ${cc.border} ${cc.bg}`}>
                          {items.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {items.map((item) => (
                          <TechItemCard
                            key={item.id}
                            item={item}
                            expanded={expandedItems.has(item.id)}
                            onToggle={() => toggleExpanded(item.id)}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════
              TAB 2: Decision Matrix
           ══════════════════════════════════════════════════ */}
          <TabsContent value="matrix">
            <Card>
              <CardHeader className="pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Decision Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <ScrollArea className="w-full">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="text-xs font-semibold min-w-[140px]">Name</TableHead>
                          <TableHead className="text-xs font-semibold min-w-[100px]">Category</TableHead>
                          <TableHead className="text-xs font-semibold min-w-[140px]">Cost</TableHead>
                          <TableHead className="text-xs font-semibold min-w-[110px] text-center">Learning Curve</TableHead>
                          <TableHead className="text-xs font-semibold min-w-[100px] text-center">Community</TableHead>
                          <TableHead className="text-xs font-semibold min-w-[100px] text-center">Maturity</TableHead>
                          <TableHead className="text-xs font-semibold min-w-[70px] text-center">Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {techStack.map((item) => {
                          const cc = categoryConfig[item.category]
                          const mc = maturityConfig[item.maturity]
                          const lc = learningCurveConfig[item.learningCurve]
                          const csc = communityConfig[item.communitySize]
                          const score = computeScore(item)
                          return (
                            <TableRow key={item.id} className="group">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{item.logo}</span>
                                  <div>
                                    <span className="text-sm font-medium">{item.name}</span>
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-1.5 inline-block opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                    </a>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`text-[10px] font-semibold border ${cc.bg} ${cc.color}`}>
                                  {cc.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] font-semibold ${
                                          item.cost.toLowerCase().includes('free')
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                            : 'bg-amber-50 text-amber-600 border-amber-200'
                                        }`}
                                      >
                                        <DollarSign className="mr-0.5 h-3 w-3" />
                                        {item.cost.toLowerCase().includes('free') ? 'Free' : truncate(item.cost, 35)}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs text-xs">{item.cost}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex gap-1">
                                    {[1, 2, 3].map((level) => (
                                      <div
                                        key={level}
                                        className={`h-2 w-6 rounded-full ${
                                          level <= lc.level ? lc.color : 'bg-muted'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[10px] text-muted-foreground">{lc.label}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className={`text-[10px] font-semibold border ${csc.bg} ${csc.color}`}>
                                  {csc.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className={`text-[10px] font-semibold border ${mc.bg} ${mc.color}`}>
                                  {mc.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <span
                                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                    score >= 9
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : score >= 6
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {score}
                                </span>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════
              TAB 3: Architecture Diagram
           ══════════════════════════════════════════════════ */}
          <TabsContent value="architecture">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Architecture Diagram */}
              <Card>
                <CardHeader className="pb-3 pt-4 px-5">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    System Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="overflow-x-auto rounded-lg border bg-zinc-950 p-4">
                    <pre className="text-[11px] leading-[1.35] font-mono text-emerald-400 whitespace-pre">
                      {architectureLines.join('\n')}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* How components connect */}
              <Card>
                <CardHeader className="pb-3 pt-4 px-5">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    How Components Connect
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="space-y-4">
                    {[
                      {
                        from: 'Next.js 14',
                        to: 'Vercel',
                        desc: 'Deployed on Vercel Edge Network. SSR/SSG pages served globally via CDN. Edge Functions for geo-aware routing.',
                      },
                      {
                        from: 'Clerk',
                        to: 'Next.js',
                        desc: 'Authentication via Clerk SDK. Session tokens stored in cookies. Middleware protects routes and injects user context.',
                      },
                      {
                        from: 'Next.js',
                        to: 'Supabase',
                        desc: 'Server Components & API routes query Supabase via the client library. RLS policies enforce tenant isolation per workspace.',
                      },
                      {
                        from: 'Supabase',
                        to: 'PostgreSQL',
                        desc: 'Managed PostgreSQL database with Row Level Security. Stores all application data: users, workspaces, tasks, billing.',
                      },
                      {
                        from: 'Stripe',
                        to: 'Next.js',
                        desc: 'Webhooks from Stripe hit /api/webhooks/stripe. Events trigger subscription updates, invoice generation, and billing sync.',
                      },
                      {
                        from: 'Resend',
                        to: 'Next.js',
                        desc: 'Transactional emails triggered from API routes: onboarding, payment receipts, notifications, team invitations.',
                      },
                      {
                        from: 'Mixpanel',
                        to: 'Client',
                        desc: 'Client-side event tracking with server-side identity merge. Event autocapture for page views and user interactions.',
                      },
                      {
                        from: 'Sentry',
                        to: 'Next.js',
                        desc: 'Error boundaries capture client-side errors. Server-side errors reported via Sentry SDK wrapper in API routes.',
                      },
                    ].map((conn, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold">
                            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">{conn.from}</span>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700">{conn.to}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{conn.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary stats */}
            <Card className="mt-6">
              <CardHeader className="pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Stack Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">{techStack.length}</p>
                    <p className="text-xs text-muted-foreground">Total Tools</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">{usedCategories.length}</p>
                    <p className="text-xs text-muted-foreground">Categories</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">
                      {techStack.filter((t) => t.cost.toLowerCase().includes('free')).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Free Tier</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">
                      {techStack.filter((t) => t.maturity === 'mature').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Mature</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// ── sub-components ────────────────────────────────────────────

function TechItemCard({
  item,
  expanded,
  onToggle,
}: {
  item: TechStackItem
  expanded: boolean
  onToggle: () => void
}) {
  const cc = categoryConfig[item.category]
  const mc = maturityConfig[item.maturity]
  const lc = learningCurveConfig[item.learningCurve]
  const csc = communityConfig[item.communitySize]

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        {/* ── Top row: logo, name, badges ── */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl flex-shrink-0 mt-0.5">{item.logo}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold">{item.name}</h3>
              <Badge variant="outline" className={`text-[10px] font-semibold border ${cc.bg} ${cc.color}`}>
                {cc.label}
              </Badge>
              <Badge variant="outline" className={`text-[10px] font-semibold border ${mc.bg} ${mc.color}`}>
                {mc.label}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.description}</p>
          </div>
        </div>

        {/* ── Purpose ── */}
        <div className="mb-3 rounded-md bg-muted/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">Purpose: </span>
            {item.purpose}
          </p>
        </div>

        {/* ── Indicators row ── */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {/* Cost */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold ${
                    item.cost.toLowerCase().includes('free')
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}
                >
                  <DollarSign className="mr-0.5 h-3 w-3" />
                  {item.cost.toLowerCase().includes('free') ? 'Free' : truncate(item.cost, 30)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">{item.cost}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Learning Curve */}
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="flex gap-0.5">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 w-4 rounded-full ${
                    level <= lc.level ? lc.color : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">{lc.label}</span>
          </div>

          {/* Community */}
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge variant="outline" className={`text-[10px] font-semibold border ${csc.bg} ${csc.color}`}>
              {csc.label}
            </Badge>
          </div>

          {/* Link */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Docs
          </a>
        </div>

        {/* ── Alternatives chips ── */}
        {item.alternatives.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground mr-1">Alternatives:</span>
            {item.alternatives.map((alt) => (
              <Badge key={alt} variant="secondary" className="text-[10px] font-normal py-0">
                {alt}
              </Badge>
            ))}
          </div>
        )}

        {/* ── Expand/collapse pros & cons ── */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-1.5 rounded-md border py-1.5 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          {expanded ? 'Hide' : 'Show'} pros & cons
          <ChevronRight
            className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
        </button>

        {expanded && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[11px] font-semibold text-emerald-600">Pros</span>
              </div>
              <ul className="space-y-1">
                {item.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                <span className="text-[11px] font-semibold text-red-600">Cons</span>
              </div>
              <ul className="space-y-1">
                {item.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-400" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s
}
