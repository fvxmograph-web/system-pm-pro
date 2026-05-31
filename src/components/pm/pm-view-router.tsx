'use client'

import * as React from 'react'
import { usePMStore } from '@/lib/pm-store'
import DashboardView from './dashboard/dashboard-view'
import ProjectsView from './projects/projects-view'
import TasksView from './tasks/tasks-view'
import KanbanView from './kanban/kanban-view'
import SprintsView from './sprints/sprints-view'
import RoadmapView from './roadmap/roadmap-view'
import PRDView from './prd/prd-view'
import TechStackView from './techstack/techstack-view'
import TeamView from './team/team-view'
import CostsView from './costs/costs-view'
import RisksView from './risks/risks-view'
import MeetingsView from './meetings/meetings-view'
import AnalyticsView from './analytics/analytics-view'
import CommandPalette from './command-palette/command-palette'

const views: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  projects: ProjectsView,
  tasks: TasksView,
  kanban: KanbanView,
  sprints: SprintsView,
  roadmap: RoadmapView,
  prd: PRDView,
  techstack: TechStackView,
  team: TeamView,
  costs: CostsView,
  risks: RisksView,
  meetings: MeetingsView,
  analytics: AnalyticsView,
}

export function PMViewRouter() {
  const { activeView } = usePMStore()
  const ViewComponent = views[activeView]

  if (!ViewComponent) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        View not found: {activeView}
      </div>
    )
  }

  return (
    <>
      <ViewComponent key={activeView} />
      <CommandPalette />
    </>
  )
}
