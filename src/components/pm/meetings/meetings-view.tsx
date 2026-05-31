'use client'

import { useState, useMemo } from 'react'
import { usePMStore, type MeetingNote, type MeetingType } from '@/lib/pm-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  DecisionIcon,
  FileText,
  Users,
  Video,
  CheckCircle2,
  Circle,
  Map,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

// ── Meeting type config ──────────────────────────────────────────────
const MEETING_TYPE_CONFIG: Record<MeetingType, { label: string; color: string; bgClass: string; textClass: string; borderClass: string }> = {
  daily:          { label: 'Daily Standup',    color: 'cyan',   bgClass: 'bg-cyan-50 dark:bg-cyan-950/40',    textClass: 'text-cyan-700 dark:text-cyan-300',   borderClass: 'border-cyan-200 dark:border-cyan-800' },
  sprint_planning:{ label: 'Sprint Planning',   color: 'purple', bgClass: 'bg-purple-50 dark:bg-purple-950/40',  textClass: 'text-purple-700 dark:text-purple-300', borderClass: 'border-purple-200 dark:border-purple-800' },
  retro:          { label: 'Retrospective',     color: 'orange', bgClass: 'bg-orange-50 dark:bg-orange-950/40',  textClass: 'text-orange-700 dark:text-orange-300', borderClass: 'border-orange-200 dark:border-orange-800' },
  stakeholder:    { label: 'Stakeholder',       color: 'blue',   bgClass: 'bg-blue-50 dark:bg-blue-950/40',     textClass: 'text-blue-700 dark:text-blue-300',    borderClass: 'border-blue-200 dark:border-blue-800' },
  tech_review:    { label: 'Tech Review',       color: 'green',  bgClass: 'bg-green-50 dark:bg-green-950/40',   textClass: 'text-green-700 dark:text-green-300',  borderClass: 'border-green-200 dark:border-green-800' },
  one_on_one:     { label: '1:1',               color: 'pink',   bgClass: 'bg-pink-50 dark:bg-pink-950/40',     textClass: 'text-pink-700 dark:text-pink-300',    borderClass: 'border-pink-200 dark:border-pink-800' },
}

// ── Helper ───────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

// ── Meeting Card ─────────────────────────────────────────────────────
function MeetingCard({
  meeting,
  expanded,
  onToggle,
}: {
  meeting: MeetingNote
  expanded: boolean
  onToggle: () => void
}) {
  const { team, projects } = usePMStore()
  const project = projects.find(p => p.id === meeting.projectId)
  const attendees = meeting.attendees.map(id => team.find(m => m.id === id)).filter(Boolean)
  const pendingActions = meeting.actionItems.filter(a => !a.done).length
  const totalActions = meeting.actionItems.length
  const config = MEETING_TYPE_CONFIG[meeting.type]

  return (
    <Card
      className={`overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer border ${config.borderClass} ${
        expanded ? 'ring-2 ring-primary/20 shadow-lg' : ''
      }`}
      onClick={onToggle}
    >
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant="secondary" className={`${config.bgClass} ${config.textClass} border-0 text-xs font-semibold`}>
                {config.label}
              </Badge>
              {project && (
                <Badge variant="outline" className="text-xs">
                  <Map className="w-3 h-3 mr-1" />
                  {project.name}
                </Badge>
              )}
            </div>
            <CardTitle className="text-base font-semibold leading-snug">{meeting.title}</CardTitle>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {format(parseISO(meeting.date), 'MMM d, yyyy')}
            </div>
            <div className="text-muted-foreground">
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Attendees + stats row */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {attendees.slice(0, 5).map((member) => (
                <Avatar key={member!.id} className="w-7 h-7 border-2 border-background ring-1 ring-border/50">
                  <AvatarImage src={member!.avatar} alt={member!.name} />
                  <AvatarFallback className="text-[10px]">{getInitials(member!.name)}</AvatarFallback>
                </Avatar>
              ))}
              {attendees.length > 5 && (
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center border-2 border-background text-[10px] font-medium text-muted-foreground">
                  +{attendees.length - 5}
                </div>
              )}
            </div>
            <span className="ml-2 text-xs text-muted-foreground">
              <Users className="w-3 h-3 inline mr-1" />
              {attendees.length} attendees
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs">
              <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground font-medium">{pendingActions}/{totalActions}</span>
              <span className="text-muted-foreground">actions</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <DecisionIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground font-medium">{meeting.decisions.length}</span>
              <span className="text-muted-foreground">decisions</span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Expanded content */}
      {expanded && (
        <CardContent className="pt-0 space-y-4" onClick={e => e.stopPropagation()}>
          <Separator />

          {/* Meeting Notes */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Meeting Notes
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/40 rounded-lg p-3">
              {meeting.notes}
            </p>
          </div>

          {/* Action Items */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-muted-foreground" />
              Action Items
              <Badge variant="secondary" className="text-xs ml-auto">
                {pendingActions} pending
              </Badge>
            </h4>
            <div className="space-y-2">
              {meeting.actionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border p-3 bg-card transition-colors hover:bg-muted/30"
                >
                  <Checkbox
                    checked={item.done}
                    className="mt-0.5"
                    onCheckedChange={() => {/* toggle handled by store */}}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${item.done ? 'line-through text-muted-foreground' : ''}`}>
                      {item.text}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {item.assignee}
                      </span>
                      {item.dueDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(parseISO(item.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Decisions */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <DecisionIcon className="w-4 h-4 text-muted-foreground" />
              Decisions
              <Badge variant="secondary" className="text-xs ml-auto">
                {meeting.decisions.length}
              </Badge>
            </h4>
            <div className="space-y-2">
              {meeting.decisions.map((decision) => (
                <div
                  key={decision.id}
                  className="rounded-lg border-l-4 border-l-amber-400 bg-amber-50/50 dark:bg-amber-950/20 p-3"
                >
                  <p className="text-sm font-medium">{decision.text}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{decision.context}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// ── Decision Log Item ────────────────────────────────────────────────
function DecisionLogItem({
  text,
  context,
  date,
  meetingTitle,
  meetingType,
  projectName,
}: {
  text: string
  context: string
  date: string
  meetingTitle: string
  meetingType: MeetingType
  projectName: string
}) {
  const config = MEETING_TYPE_CONFIG[meetingType]

  return (
    <div className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
      <div className="flex flex-col items-center gap-1 shrink-0">
        <DecisionIcon className="w-5 h-5 text-amber-500" />
        <div className="w-px flex-1 bg-border" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">{text}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{context}</p>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(parseISO(date), 'MMM d, yyyy')}
          </span>
          <Badge variant="secondary" className={`${config.bgClass} ${config.textClass} border-0 text-[10px]`}>
            {meetingTitle}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {projectName}
          </Badge>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────
export default function MeetingsView() {
  const { meetings, projects } = usePMStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [tab, setTab] = useState<'meetings' | 'decisions'>('meetings')

  // Build chronological decision log across all meetings
  const allDecisions = useMemo(() => {
    const decisions: Array<{
      id: string
      text: string
      context: string
      date: string
      meetingTitle: string
      meetingType: MeetingType
      projectName: string
      meetingId: string
    }> = []
    for (const meeting of meetings) {
      const project = projects.find(p => p.id === meeting.projectId)
      for (const decision of meeting.decisions) {
        decisions.push({
          id: decision.id,
          text: decision.text,
          context: decision.context,
          date: meeting.date,
          meetingTitle: meeting.title,
          meetingType: meeting.type,
          projectName: project?.name ?? 'Unknown',
          meetingId: meeting.id,
        })
      }
    }
    return decisions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [meetings, projects])

  // Sort meetings newest first
  const sortedMeetings = useMemo(
    () => [...meetings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [meetings]
  )

  const totalDecisions = allDecisions.length
  const totalActions = meetings.reduce((sum, m) => sum + m.actionItems.length, 0)
  const pendingActions = meetings.reduce((sum, m) => sum + m.actionItems.filter(a => !a.done).length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Video className="w-6 h-6" />
            Meeting Notes & Decision Log
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track meetings, action items, and decisions across projects.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-2xl font-bold">{meetings.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Meetings</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{totalDecisions}</div>
          <div className="text-xs text-muted-foreground mt-1">Decisions Made</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{totalActions}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Action Items</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">{pendingActions}</div>
          <div className="text-xs text-muted-foreground mt-1">Pending Actions</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setTab('meetings')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'meetings'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Video className="w-4 h-4 inline mr-1.5" />
          Meetings
        </button>
        <button
          onClick={() => setTab('decisions')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'decisions'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <DecisionIcon className="w-4 h-4 inline mr-1.5" />
          Decision Log
          <Badge variant="secondary" className="ml-2 text-[10px]">{totalDecisions}</Badge>
        </button>
      </div>

      {/* Content */}
      {tab === 'meetings' ? (
        <div className="space-y-3">
          {sortedMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              expanded={expandedId === meeting.id}
              onToggle={() => setExpandedId(expandedId === meeting.id ? null : meeting.id)}
            />
          ))}
          {sortedMeetings.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              <Video className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No meetings recorded yet.</p>
            </Card>
          )}
        </div>
      ) : (
        <ScrollArea className="max-h-[800px]">
          <div className="space-y-2 pr-4">
            {allDecisions.map((d) => (
              <DecisionLogItem
                key={`${d.meetingId}-${d.id}`}
                text={d.text}
                context={d.context}
                date={d.date}
                meetingTitle={d.meetingTitle}
                meetingType={d.meetingType}
                projectName={d.projectName}
              />
            ))}
            {allDecisions.length === 0 && (
              <Card className="p-8 text-center text-muted-foreground">
                <DecisionIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No decisions recorded yet.</p>
              </Card>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
