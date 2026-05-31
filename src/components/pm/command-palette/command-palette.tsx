'use client'

import { useEffect, useCallback, useMemo } from 'react'
import { usePMStore } from '@/lib/pm-store'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
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
  Shield,
  Video,
  BarChart3,
  ArrowRight,
  Hash,
  Search,
  Moon,
  Sun,
  Sprint,
  Settings,
  type LucideIcon,
} from 'lucide-react'

// ── Command definitions ──────────────────────────────────────────────
interface CommandDef {
  id: string
  label: string
  keywords: string[]
  icon: LucideIcon
  shortcut?: string
  category: 'navigation' | 'tasks' | 'projects' | 'actions' | 'recent'
  onSelect?: () => void
  viewId?: string
}

function buildCommands(): CommandDef[] {
  return [
    // Navigation
    { id: 'nav-dashboard', label: 'Go to Dashboard', keywords: ['dashboard', 'home', 'overview'], icon: LayoutDashboard, shortcut: '⌘1', category: 'navigation', viewId: 'dashboard' },
    { id: 'nav-projects', label: 'Go to Projects', keywords: ['projects', 'list', 'all'], icon: FolderKanban, shortcut: '⌘2', category: 'navigation', viewId: 'projects' },
    { id: 'nav-tasks', label: 'Go to Tasks', keywords: ['tasks', 'board', 'backlog'], icon: CheckSquare, shortcut: '⌘3', category: 'navigation', viewId: 'tasks' },
    { id: 'nav-sprints', label: 'Go to Sprints', keywords: ['sprints', 'iterations', 'agile'], icon: Columns, shortcut: '⌘4', category: 'navigation', viewId: 'sprints' },
    { id: 'nav-roadmap', label: 'Go to Roadmap', keywords: ['roadmap', 'timeline', 'strategy'], icon: Map, shortcut: '⌘5', category: 'navigation', viewId: 'roadmap' },
    { id: 'nav-analytics', label: 'Go to Analytics', keywords: ['analytics', 'metrics', 'data', 'charts'], icon: BarChart3, shortcut: '⌘6', category: 'navigation', viewId: 'analytics' },
    { id: 'nav-meetings', label: 'Go to Meetings', keywords: ['meetings', 'notes', 'standup'], icon: Video, category: 'navigation', viewId: 'meetings' },
    { id: 'nav-team', label: 'Go to Team', keywords: ['team', 'members', 'people'], icon: Users, category: 'navigation', viewId: 'team' },
    { id: 'nav-risks', label: 'Go to Risks', keywords: ['risks', 'risk register'], icon: Shield, category: 'navigation', viewId: 'risks' },
    { id: 'nav-settings', label: 'Go to Settings', keywords: ['settings', 'preferences', 'config'], icon: Settings, category: 'navigation', viewId: 'settings' },

    // Quick Actions
    { id: 'action-create-task', label: 'Create Task', keywords: ['create', 'new', 'add', 'task', 'issue'], icon: CheckSquare, shortcut: '⌘N', category: 'actions' },
    { id: 'action-create-sprint', label: 'Create Sprint', keywords: ['create', 'new', 'sprint', 'iteration'], icon: Zap, category: 'actions' },
    { id: 'action-toggle-dark', label: 'Toggle Dark Mode', keywords: ['dark', 'light', 'theme', 'mode', 'appearance'], icon: Moon, category: 'actions' },

    // Finance
    { id: 'nav-costs', label: 'Go to Costs & Budgets', keywords: ['costs', 'budget', 'spending', 'finance'], icon: DollarSign, category: 'navigation', viewId: 'costs' },
  ]
}

// ── Recent items (mock) ──────────────────────────────────────────────
function useRecentItems(): CommandDef[] {
  const { tasks, projects } = usePMStore()

  return useMemo(() => {
    const recent: CommandDef[] = []

    // Recent tasks
    tasks.slice(0, 3).forEach((task) => {
      recent.push({
        id: `recent-task-${task.id}`,
        label: `View Task ${task.key}`,
        keywords: [task.key, task.title.toLowerCase()],
        icon: Hash,
        category: 'recent',
        viewId: `task-${task.id}`,
      })
    })

    // Recent projects
    projects.slice(0, 2).forEach((project) => {
      recent.push({
        id: `recent-project-${project.id}`,
        label: `View Project ${project.name}`,
        keywords: [project.name.toLowerCase(), project.id],
        icon: FolderKanban,
        category: 'recent',
        viewId: `project-${project.id}`,
      })
    })

    return recent
  }, [tasks, projects])
}

// ── Category config ──────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  recent: 'Recent',
  navigation: 'Navigation',
  tasks: 'Tasks',
  projects: 'Projects',
  actions: 'Quick Actions',
}

const CATEGORY_ORDER: string[] = ['recent', 'navigation', 'tasks', 'projects', 'actions']

// ── Main Component ───────────────────────────────────────────────────
export default function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveView,
    tasks,
    projects,
  } = usePMStore()

  const recentItems = useRecentItems()

  // Build full command list including dynamic task/project commands
  const allCommands = useMemo(() => {
    const staticCommands = buildCommands()

    // Dynamic task commands
    const taskCommands: CommandDef[] = tasks.slice(0, 8).map((task) => ({
      id: `task-${task.id}`,
      label: `${task.key}: ${task.title.length > 50 ? task.title.slice(0, 50) + '...' : task.title}`,
      keywords: [task.key, task.title.toLowerCase(), ...task.labels],
      icon: Hash as LucideIcon,
      category: 'tasks' as const,
      viewId: `task-${task.id}`,
    }))

    // Dynamic project commands
    const projectCommands: CommandDef[] = projects.map((project) => ({
      id: `project-${project.id}`,
      label: `View Project: ${project.name}`,
      keywords: [project.name.toLowerCase(), project.id, ...project.tags.map(t => t.toLowerCase())],
      icon: FolderKanban as LucideIcon,
      category: 'projects' as const,
      viewId: `project-${project.id}`,
    }))

    return [...recentItems, ...staticCommands, ...taskCommands, ...projectCommands]
  }, [recentItems, tasks, projects])

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandDef[]> = {}
    for (const cmd of allCommands) {
      if (!groups[cmd.category]) groups[cmd.category] = []
      groups[cmd.category].push(cmd)
    }
    return groups
  }, [allCommands])

  // Keyboard shortcut handler (Cmd+K / Ctrl+K)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
    },
    [commandPaletteOpen, setCommandPaletteOpen]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Handle command selection
  const handleSelect = useCallback(
    (cmd: CommandDef) => {
      if (cmd.viewId) {
        // Extract the view type (e.g. 'task-CF-101' -> navigate to tasks view and select task)
        if (cmd.viewId.startsWith('task-')) {
          const taskId = cmd.viewId.replace('task-', '')
          setActiveView('tasks')
          // Also could set selected task
        } else if (cmd.viewId.startsWith('project-')) {
          const projectId = cmd.viewId.replace('project-', '')
          setActiveView('projects')
        } else {
          setActiveView(cmd.viewId)
        }
      }
      setCommandPaletteOpen(false)
    },
    [setActiveView, setCommandPaletteOpen]
  )

  return (
    <CommandDialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
      className="sm:max-w-xl"
      title="Command Palette"
      description="Search for a command to run..."
    >
      <CommandInput placeholder="Type a command or search..." />

      <CommandList className="max-h-[420px]">
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-4">
            <Search className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No commands found.</p>
            <p className="text-xs text-muted-foreground">Try a different search term.</p>
          </div>
        </CommandEmpty>

        {CATEGORY_ORDER.map((category, catIdx) => {
          const commands = groupedCommands[category]
          if (!commands || commands.length === 0) return null

          const CategoryIcon = commands[0]?.icon ?? Search

          return (
            <div key={category}>
              {catIdx > 0 && <CommandSeparator />}
              <CommandGroup heading={CATEGORY_LABELS[category] ?? category}>
                {commands.map((cmd) => {
                  const Icon = cmd.icon
                  return (
                    <CommandItem
                      key={cmd.id}
                      value={`${cmd.label} ${cmd.keywords.join(' ')}`}
                      onSelect={() => handleSelect(cmd)}
                      className="flex items-center gap-3"
                    >
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="flex-1 truncate">{cmd.label}</span>
                      {cmd.shortcut && (
                        <CommandShortcut>{cmd.shortcut}</CommandShortcut>
                      )}
                      {!cmd.shortcut && cmd.viewId && cmd.category === 'navigation' && (
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </div>
          )
        })}
      </CommandList>

      {/* Footer hint */}
      <div className="border-t px-4 py-2 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <kbd className="inline-flex items-center rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">↑↓</kbd>
          Navigate
        </span>
        <span className="flex items-center gap-1">
          <kbd className="inline-flex items-center rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">↵</kbd>
          Select
        </span>
        <span className="flex items-center gap-1">
          <kbd className="inline-flex items-center rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">esc</kbd>
          Close
        </span>
      </div>
    </CommandDialog>
  )
}
