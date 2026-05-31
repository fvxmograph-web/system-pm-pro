'use client'

import * as React from 'react'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Columns,
  Zap,
  Map,
  FileText,
  Layers,
  Users,
  DollarSign,
  ShieldAlert,
  Video,
  BarChart3,
  Rocket,
  Search,
  ChevronRight,
  Settings,
} from 'lucide-react'
import { usePMStore } from '@/lib/pm-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

type NavItem = {
  id: string
  label: string
  icon: React.ElementType
  badge?: string | number
}

type NavSection = {
  id: string
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'projects', label: 'Projects', icon: FolderKanban, badge: 4 },
      { id: 'tasks', label: 'Tasks / Issues', icon: CheckSquare, badge: 16 },
      { id: 'kanban', label: 'Kanban Board', icon: Columns },
      { id: 'sprints', label: 'Sprints', icon: Zap },
      { id: 'roadmap', label: 'Roadmap', icon: Map },
    ],
  },
  {
    id: 'documentation',
    label: 'Documentation',
    items: [
      { id: 'prd', label: 'PRD Writer', icon: FileText, badge: 2 },
      { id: 'techstack', label: 'Tech Stack', icon: Layers },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { id: 'team', label: 'Team', icon: Users, badge: 8 },
      { id: 'costs', label: 'Costs & Programs', icon: DollarSign },
      { id: 'risks', label: 'Risks', icon: ShieldAlert, badge: 3 },
      { id: 'meetings', label: 'Meetings', icon: Video },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
]

const DEFAULT_OPEN_SECTIONS = ['workspace', 'documentation', 'operations']

interface AppSidebarProps {
  collapsed?: boolean
}

export function AppSidebar({ collapsed = false }: AppSidebarProps) {
  const { activeView, setActiveView, setCommandPaletteOpen, team } = usePMStore()
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(DEFAULT_OPEN_SECTIONS.map((s) => [s, true]))
  )

  const currentUser = team[0] // María García as default user

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId)
  }

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const handleSearchClick = () => {
    setCommandPaletteOpen(true)
  }

  // Render nav item based on collapsed state
  const renderNavItem = (item: NavItem) => {
    const isActive = activeView === item.id

    if (collapsed) {
      return (
        <Tooltip key={item.id}>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'relative flex w-full items-center justify-center rounded-lg p-2.5 text-sm transition-all duration-150',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'bg-accent text-primary font-medium'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="size-[18px] shrink-0" />
              {item.badge !== undefined && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {item.label}
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <button
        key={item.id}
        onClick={() => handleNavClick(item.id)}
        className={cn(
          'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isActive
            ? 'bg-accent text-primary font-medium'
            : 'text-muted-foreground'
        )}
      >
        <item.icon className={cn(
          'size-[18px] shrink-0 transition-colors',
          isActive && 'text-primary'
        )} />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge !== undefined && (
          <Badge
            variant="secondary"
            className="h-5 min-w-5 px-1.5 text-[10px] font-medium tabular-nums"
          >
            {item.badge}
          </Badge>
        )}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary" />
        )}
      </button>
    )
  }

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo Header */}
      <div className={cn(
        'flex h-14 shrink-0 items-center border-b border-sidebar-border',
        collapsed ? 'justify-center px-3' : 'gap-3 px-4'
      )}>
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary">
          <Rocket className="size-4.5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              PM Pro
            </span>
            <span className="text-[10px] text-muted-foreground leading-none">
              Project Management
            </span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className={cn(
        'shrink-0 px-3 py-2.5',
        collapsed && 'px-2'
      )}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSearchClick}
                className="flex w-full items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Search className="size-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Search (⌘K)
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={handleSearchClick}
            className="flex w-full items-center gap-2.5 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-accent-foreground"
          >
            <Search className="size-3.5 shrink-0" />
            <span className="flex-1 text-left text-xs">Search...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-sidebar-border bg-sidebar px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2.5">
        <nav className="flex flex-col gap-1 pb-4" role="navigation">
          {NAV_SECTIONS.map((section) => (
            <div key={section.id} className="flex flex-col gap-0.5">
              {/* Section Header */}
              {collapsed ? (
                <Separator className="my-1.5 bg-sidebar-border/50" />
              ) : (
                <Collapsible
                  open={openSections[section.id]}
                  onOpenChange={() => toggleSection(section.id)}
                >
                  <CollapsibleTrigger asChild>
                    <button className="flex w-full items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                      <ChevronRight className={cn(
                        'size-3 transition-transform duration-200',
                        openSections[section.id] && 'rotate-90'
                      )} />
                      {section.label}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="flex flex-col gap-0.5">
                      {section.items.map(renderNavItem)}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Collapsed: just show items */}
              {collapsed && (
                <div className="flex flex-col gap-0.5">
                  {section.items.map(renderNavItem)}
                </div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Footer */}
      <div className={cn(
        'shrink-0 border-t border-sidebar-border p-2.5',
        collapsed && 'p-2'
      )}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="size-8 mx-auto cursor-pointer">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback className="text-xs">
                  {currentUser.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {currentUser.name}
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent">
            <Avatar className="size-8 shrink-0">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback className="text-xs">
                {currentUser.name.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col min-w-0">
              <span className="text-sm font-medium truncate">{currentUser.name}</span>
              <span className="text-[11px] text-muted-foreground truncate">{currentUser.role.toUpperCase()}</span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center justify-center size-7 rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-accent-foreground">
                  <Settings className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Settings</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}
