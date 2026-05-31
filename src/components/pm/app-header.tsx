'use client'

import * as React from 'react'
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  Settings,
  LogOut,
  User,
  HelpCircle,
} from 'lucide-react'
import { usePMStore } from '@/lib/pm-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// Map view IDs to display names
const VIEW_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  tasks: 'Tasks / Issues',
  kanban: 'Kanban Board',
  sprints: 'Sprints',
  roadmap: 'Roadmap',
  prd: 'PRD Writer',
  techstack: 'Tech Stack',
  team: 'Team',
  costs: 'Costs & Programs',
  risks: 'Risks',
  meetings: 'Meetings',
  analytics: 'Analytics',
}

// Map view IDs to parent sections
const VIEW_SECTIONS: Record<string, string> = {
  dashboard: 'Workspace',
  projects: 'Workspace',
  tasks: 'Workspace',
  kanban: 'Workspace',
  sprints: 'Workspace',
  roadmap: 'Workspace',
  prd: 'Documentation',
  techstack: 'Documentation',
  team: 'Operations',
  costs: 'Operations',
  risks: 'Operations',
  meetings: 'Operations',
  analytics: 'Operations',
}

interface AppHeaderProps {
  onToggleSidebar: () => void
}

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const { activeView, setCommandPaletteOpen, team } = usePMStore()
  const currentUser = team[0]

  const viewLabel = VIEW_LABELS[activeView] || 'Dashboard'
  const viewSection = VIEW_SECTIONS[activeView] || 'Workspace'

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-md px-4">
      {/* Left: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={onToggleSidebar}
            >
              <Menu className="size-4" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            Toggle sidebar (⌘B)
          </TooltipContent>
        </Tooltip>

        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => {}}
              >
                {viewSection}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">
                {viewLabel}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Mobile: just show view name */}
        <span className="sm:hidden text-sm font-medium truncate">
          {viewLabel}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Search Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex items-center gap-2 h-8 px-3 text-muted-foreground hover:text-foreground"
              onClick={() => setCommandPaletteOpen(true)}
            >
              <Search className="size-3.5" />
              <span className="text-xs">Search</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Search (⌘K)
          </TooltipContent>
        </Tooltip>

        {/* Mobile search icon */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden size-8"
              onClick={() => setCommandPaletteOpen(true)}
            >
              <Search className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search</TooltipContent>
        </Tooltip>

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="relative size-8">
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        {/* Separator */}
        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-8 px-1.5 hover:bg-accent"
            >
              <Avatar className="size-6">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback className="text-[10px]">
                  {currentUser.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="size-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <User className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <HelpCircle className="size-4" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
