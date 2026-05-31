import { create } from 'zustand'

// ============================================================
// TYPES - Complete type system for the PM application
// ============================================================

export type ProjectStatus = 'discovery' | 'planning' | 'active' | 'paused' | 'completed' | 'archived'
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low' | 'none'
export type TaskType = 'epic' | 'story' | 'task' | 'bug' | 'spike' | 'chore' | 'improvement'
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'testing' | 'blocked' | 'done' | 'cancelled'
export type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled'
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'
export type RiskCategory = 'technical' | 'market' | 'financial' | 'operational' | 'team' | 'compliance'
export type RiskStatus = 'identified' | 'analyzing' | 'mitigating' | 'resolved' | 'accepted' | 'closed'
export type TeamRole = 'pm' | 'lead' | 'senior' | 'mid' | 'junior' | 'designer' | 'qa' | 'devops'
export type PRDStatus = 'draft' | 'in_review' | 'approved' | 'deprecated' | 'archived'
export type MeetingType = 'daily' | 'sprint_planning' | 'retro' | 'stakeholder' | 'tech_review' | 'one_on_one'
export type RoadmapItemStatus = 'discovery' | 'planned' | 'in_progress' | 'shipped' | 'cancelled'
export type TechCategory = 'frontend' | 'backend' | 'database' | 'cloud' | 'auth' | 'payments' | 'analytics' | 'monitoring' | 'email' | 'ci_cd' | 'design' | 'other'
export type StartupProgramStatus = 'applied' | 'approved' | 'active' | 'expired' | 'rejected'

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  startDate: string
  endDate: string
  progress: number
  teamId: string
  budget: number
  spent: number
  tags: string[]
  techStack: string[]
  keyMetrics: { label: string; value: number; target: number }[]
  milestones: { id: string; name: string; date: string; completed: boolean }[]
  risks: number
  tasksCount: number
  completedTasks: number
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  key: string
  title: string
  description: string
  type: TaskType
  priority: TaskPriority
  status: TaskStatus
  projectId: string
  assigneeId: string | null
  reporterId: string
  epicId: string | null
  sprintId: string | null
  storyPoints: number | null
  labels: string[]
  dueDate: string | null
  createdAt: string
  updatedAt: string
  comments: Comment[]
  subtasks: Subtask[]
  attachments: string[]
  acceptanceCriteria: string[]
  dependencies: string[]
  blocking: string[]
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Comment {
  id: string
  authorId: string
  content: string
  createdAt: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string
  role: TeamRole
  teamId: string
  capacity: number
  currentLoad: number
  skills: string[]
  availability: 'full' | 'partial' | 'unavailable'
  joinDate: string
}

export interface Sprint {
  id: string
  name: string
  goal: string
  status: SprintStatus
  startDate: string
  endDate: string
  projectId: string
  velocity: number
  plannedPoints: number
  completedPoints: number
  tasks: string[]
  retrospective: string | null
}

export interface RoadmapItem {
  id: string
  title: string
  description: string
  status: RoadmapItemStatus
  startDate: string
  endDate: string
  priority: TaskPriority
  confidence: number
  projectId: string
  category: string
  metrics: string[]
  dependencies: string[]
  progress: number
}

export interface PRDDocument {
  id: string
  title: string
  status: PRDStatus
  projectId: string
  authorId: string
  version: number
  summary: string
  problemStatement: string
  targetAudience: string
  userStories: { as: string; iWant: string; soThat: string; priority: TaskPriority; points: number }[]
  functionalRequirements: { id: string; description: string; priority: TaskPriority; status: 'pending' | 'in_progress' | 'done' }[]
  nonFunctionalRequirements: string[]
  successMetrics: { metric: string; baseline: string; target: string; timeline: string }[]
  technicalConsiderations: string[]
  openQuestions: { question: string; answer: string | null; owner: string }[]
  timeline: string
  dependencies: string[]
  risks: string[]
  createdAt: string
  updatedAt: string
}

export interface TechStackItem {
  id: string
  name: string
  category: TechCategory
  description: string
  purpose: string
  alternatives: string[]
  pros: string[]
  cons: string[]
  cost: string
  learningCurve: 'low' | 'medium' | 'high'
  communitySize: 'small' | 'medium' | 'large'
  maturity: 'experimental' | 'stable' | 'mature' | 'legacy'
  url: string
  logo: string
}

export interface CostItem {
  id: string
  category: string
  tool: string
  monthlyCost: number
  annualCost: number
  plan: string
  notes: string
  essential: boolean
}

export interface StartupProgram {
  id: string
  name: string
  company: string
  description: string
  benefits: string
  status: StartupProgramStatus
  applicationDate: string | null
  expirationDate: string | null
  url: string
  savings: string
  notes: string
}

export interface Risk {
  id: string
  title: string
  description: string
  category: RiskCategory
  level: RiskLevel
  probability: number
  impact: number
  status: RiskStatus
  projectId: string
  mitigation: string
  owner: string
  identifiedDate: string
  resolvedDate: string | null
}

export interface MeetingNote {
  id: string
  title: string
  type: MeetingType
  date: string
  projectId: string
  attendees: string[]
  actionItems: { id: string; text: string; assignee: string; dueDate: string | null; done: boolean }[]
  decisions: { id: string; text: string; context: string }[]
  notes: string
  recordingUrl: string | null
}

export interface AnalyticsData {
  dailyActiveUsers: { date: string; value: number }[]
  featureUsage: { feature: string; users: number; sessions: number; trend: number }[]
  conversionFunnel: { stage: string; value: number; rate: number }[]
  retentionCohorts: { cohort: string; day0: number; day7: number; day14: number; day30: number }[]
  npsScore: { score: number; trend: number; responses: number }
  errorRates: { date: string; value: number; p95: number }[]
  revenueMetrics: { mrr: number; arr: number; churn: number; ltv: number; cac: number }
}

// ============================================================
// MOCK DATA - Realistic SaaS project data
// ============================================================

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luis',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
]

export const MOCK_TEAM: TeamMember[] = [
  { id: 't1', name: 'María García', email: 'maria@startup.io', avatar: AVATARS[0], role: 'pm', teamId: 'team1', capacity: 40, currentLoad: 32, skills: ['Product Strategy', 'User Research', 'Agile', 'Analytics'], availability: 'full', joinDate: '2025-01-15' },
  { id: 't2', name: 'Carlos Rodríguez', email: 'carlos@startup.io', avatar: AVATARS[1], role: 'lead', teamId: 'team1', capacity: 40, currentLoad: 38, skills: ['React', 'Node.js', 'TypeScript', 'System Design'], availability: 'full', joinDate: '2025-01-20' },
  { id: 't3', name: 'Ana Martínez', email: 'ana@startup.io', avatar: AVATARS[2], role: 'senior', teamId: 'team1', capacity: 40, currentLoad: 35, skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'], availability: 'full', joinDate: '2025-02-01' },
  { id: 't4', name: 'Diego López', email: 'diego@startup.io', avatar: AVATARS[3], role: 'mid', teamId: 'team1', capacity: 40, currentLoad: 28, skills: ['React', 'Next.js', 'Tailwind', 'CSS'], availability: 'full', joinDate: '2025-03-01' },
  { id: 't5', name: 'Sofía Hernández', email: 'sofia@startup.io', avatar: AVATARS[4], role: 'designer', teamId: 'team1', capacity: 40, currentLoad: 30, skills: ['Figma', 'UI/UX', 'Design Systems', 'User Research'], availability: 'full', joinDate: '2025-02-15' },
  { id: 't6', name: 'Luis Torres', email: 'luis@startup.io', avatar: AVATARS[5], role: 'junior', teamId: 'team1', capacity: 40, currentLoad: 22, skills: ['JavaScript', 'React', 'Git'], availability: 'full', joinDate: '2025-04-01' },
  { id: 't7', name: 'Elena Sánchez', email: 'elena@startup.io', avatar: AVATARS[6], role: 'qa', teamId: 'team1', capacity: 40, currentLoad: 25, skills: ['Testing', 'Cypress', 'Playwright', 'QA Automation'], availability: 'full', joinDate: '2025-03-15' },
  { id: 't8', name: 'Pedro Ruiz', email: 'pedro@startup.io', avatar: AVATARS[7], role: 'devops', teamId: 'team1', capacity: 40, currentLoad: 20, skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'], availability: 'full', joinDate: '2025-02-01' },
]

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj1', name: 'CloudFlow SaaS', description: 'Plataforma principal de gestión en la nube. Un sistema completo para empresas que buscan digitalizar sus operaciones de negocio con flujos de trabajo automatizados, dashboards en tiempo real y colaboración multi-equipo. Incluye autenticación SSO, multi-tenancy, API RESTful y panel de administración.',
    status: 'active', startDate: '2025-01-15', endDate: '2025-12-31', progress: 42, teamId: 'team1', budget: 150000, spent: 58000, tags: ['SaaS', 'Core Product', 'B2B', 'Cloud'], techStack: ['Next.js', 'TypeScript', 'Supabase', 'Stripe', 'Tailwind'],
    keyMetrics: [{ label: 'DAU', value: 342, target: 1000 }, { label: 'MRR', value: 12500, target: 50000 }, { label: 'Churn Rate', value: 2.3, target: 1.5 }, { label: 'NPS', value: 72, target: 80 }],
    milestones: [
      { id: 'm1', name: 'Alpha Release', date: '2025-03-31', completed: true },
      { id: 'm2', name: 'Beta Pública', date: '2025-06-15', completed: true },
      { id: 'm3', name: 'V1.0 Launch', date: '2025-09-01', completed: false },
      { id: 'm4', name: 'Enterprise Tier', date: '2025-12-15', completed: false },
    ],
    risks: 3, tasksCount: 47, completedTasks: 22, createdAt: '2025-01-15', updatedAt: '2025-05-30'
  },
  {
    id: 'proj2', name: 'DataPulse Analytics', description: 'Módulo de analytics avanzado para visualización de datos en tiempo real. Proporciona a los usuarios dashboards personalizables, reportes automatizados, alertas inteligentes y exportación de datos en múltiples formatos.',
    status: 'planning', startDate: '2025-07-01', endDate: '2026-03-31', progress: 8, teamId: 'team1', budget: 80000, spent: 5000, tags: ['Analytics', 'Data Viz', 'Feature'],
    techStack: ['D3.js', 'PostgreSQL', 'Redis', 'WebSocket'], keyMetrics: [{ label: 'Dashboards Created', value: 0, target: 100 }, { label: 'Data Sources', value: 0, target: 5 }],
    milestones: [{ id: 'm5', name: 'Spec Complete', date: '2025-07-15', completed: false }, { id: 'm6', name: 'MVP', date: '2025-10-01', completed: false }, { id: 'm7', name: 'GA', date: '2026-01-15', completed: false }],
    risks: 5, tasksCount: 12, completedTasks: 1, createdAt: '2025-05-01', updatedAt: '2025-05-30'
  },
  {
    id: 'proj3', name: 'Mobile Companion', description: 'App móvil complementaria (iOS y Android) para notificaciones push, acceso rápido a métricas y gestión on-the-go. Desarrollada con React Native para reutilizar la lógica de negocio existente.',
    status: 'discovery', startDate: '2025-09-01', endDate: '2026-06-30', progress: 0, teamId: 'team1', budget: 120000, spent: 2000, tags: ['Mobile', 'React Native', 'Cross-Platform'],
    techStack: ['React Native', 'Expo', 'Firebase', 'Biometrics'], keyMetrics: [{ label: 'Mobile DAU', value: 0, target: 500 }, { label: 'Push CTR', value: 0, target: 15 }],
    milestones: [{ id: 'm8', name: 'Platform Decision', date: '2025-08-01', completed: false }, { id: 'm9', name: 'Prototype', date: '2025-11-01', completed: false }, { id: 'm10', name: 'Beta Test', date: '2026-03-01', completed: false }],
    risks: 7, tasksCount: 5, completedTasks: 0, createdAt: '2025-05-15', updatedAt: '2025-05-30'
  },
  {
    id: 'proj4', name: 'API Marketplace', description: 'Marketplace donde terceros pueden publicar y consumir APIs. Incluye gestión de API keys, rate limiting, documentación automática y monetización por uso.',
    status: 'planning', startDate: '2025-10-01', endDate: '2026-06-30', progress: 0, teamId: 'team1', budget: 95000, spent: 0, tags: ['Platform', 'API', 'Marketplace', 'Revenue'],
    techStack: ['Kong', 'GraphQL', 'Stripe Connect'], keyMetrics: [{ label: 'APIs Published', value: 0, target: 50 }, { label: 'Revenue Share', value: 0, target: 25000 }],
    milestones: [{ id: 'm11', name: 'Architecture Review', date: '2025-09-15', completed: false }, { id: 'm12', name: 'Developer Portal', date: '2025-12-01', completed: false }],
    risks: 6, tasksCount: 8, completedTasks: 0, createdAt: '2025-05-20', updatedAt: '2025-05-30'
  },
]

export const MOCK_TASKS: Task[] = [
  // Epic 1 - Onboarding Flow
  { id: 'task1', key: 'CF-101', title: 'Implementar flujo de onboarding multi-paso', description: 'Crear un flujo de onboarding guiado de 5 pasos para nuevos usuarios: 1) Crear workspace, 2) Invitar miembros, 3) Configurar perfil, 4) Primer proyecto, 5) Tutorial interactivo. Debe ser skippable y resumible.', type: 'epic', priority: 'high', status: 'in_progress', projectId: 'proj1', assigneeId: 't2', reporterId: 't1', epicId: null, sprintId: 'sprint3', storyPoints: 34, labels: ['onboarding', 'ux', 'core'], dueDate: '2025-07-15', createdAt: '2025-03-01', updatedAt: '2025-05-28', comments: [{ id: 'c1', authorId: 't1', content: 'Vamos a usar un stepper component con animaciones. Sofia ya tiene los wireframes.', createdAt: '2025-03-02' }], subtasks: [{ id: 'st1', title: 'Stepper UI component', completed: true }, { id: 'st2', title: 'Workspace creation wizard', completed: true }, { id: 'st3', title: 'Member invitation flow', completed: false }, { id: 'st4', title: 'Profile setup', completed: false }, { id: 'st5', title: 'Interactive tutorial', completed: false }], attachments: [], acceptanceCriteria: ['Usuario puede completar onboarding en menos de 3 minutos', 'Progreso se guarda automáticamente', 'Puede saltar pasos y volver después'], dependencies: ['task5'], blocking: ['task2', 'task3'] },
  // Stories under Epic 1
  { id: 'task2', key: 'CF-102', title: 'Como nuevo usuario, quiero crear mi workspace con nombre y logo personalizado', description: 'Formulario de creación de workspace con validación en tiempo real, subida de logo (drag & drop), y selección de URL personalizada. Incluir sugerencias de nombre basadas en el nombre de la empresa del usuario.', type: 'story', priority: 'high', status: 'done', projectId: 'proj1', assigneeId: 't4', reporterId: 't1', epicId: 'task1', sprintId: 'sprint2', storyPoints: 8, labels: ['onboarding', 'workspace'], dueDate: '2025-05-30', createdAt: '2025-03-10', updatedAt: '2025-05-25', comments: [], subtasks: [{ id: 'st6', title: 'Create workspace API', completed: true }, { id: 'st7', title: 'Logo upload with crop', completed: true }, { id: 'st8', title: 'URL slug validation', completed: true }], attachments: [], acceptanceCriteria: ['Logo se redimensiona automáticamente a 200x200', 'URL slug es único y validado en tiempo real', 'Se guardan hasta 3 logo suggestions'], dependencies: ['task1'], blocking: [] },
  { id: 'task3', key: 'CF-103', title: 'Como usuario, quiero invitar a mi equipo por email con roles predefinidos', description: 'Pantalla de invitación con input de emails (múltiples), selector de roles (Admin, Editor, Viewer), y envío de emails con magic link. Mostrar avatar del invitado si ya está registrado.', type: 'story', priority: 'high', status: 'in_review', projectId: 'proj1', assigneeId: 't6', reporterId: 't1', epicId: 'task1', sprintId: 'sprint3', storyPoints: 5, labels: ['onboarding', 'team', 'emails'], dueDate: '2025-06-10', createdAt: '2025-04-01', updatedAt: '2025-05-29', comments: [{ id: 'c2', authorId: 't6', content: 'Magic link necesita expirar en 24h. ¿Lo enviamos con Resend?', createdAt: '2025-04-15' }, { id: 'c3', authorId: 't2', content: 'Sí, Resend con template de onboarding. El link apunta a /invite/[token]', createdAt: '2025-04-16' }], subtasks: [{ id: 'st9', title: 'Email invitation component', completed: true }, { id: 'st10', title: 'Role selector', completed: true }, { id: 'st11', title: 'Magic link generation', completed: true }, { id: 'st12', title: 'Email template (Resend)', completed: true }], attachments: [], acceptanceCriteria: ['Se pueden invitar hasta 20 emails a la vez', 'Rol por defecto: Editor', 'Magic link expira en 24 horas'], dependencies: ['task2'], blocking: [] },

  // Epic 2 - Payment Integration
  { id: 'task4', key: 'CF-200', title: 'Integrar Stripe para suscripciones SaaS', description: 'Implementar sistema de pagos completo con Stripe: checkout, portal de cliente, webhooks, manejo de fraudes, y soporte para planes mensuales/anuales con descuento. Incluir período de prueba gratuito de 14 días.', type: 'epic', priority: 'critical', status: 'in_progress', projectId: 'proj1', assigneeId: 't3', reporterId: 't1', epicId: null, sprintId: 'sprint3', storyPoints: 21, labels: ['payments', 'stripe', 'monetization'], dueDate: '2025-07-31', createdAt: '2025-04-01', updatedAt: '2025-05-28', comments: [{ id: 'c4', authorId: 't3', content: 'Stripe Checkout Session + Customer Portal + Webhooks. Vamos a usar Stripe Billing.', createdAt: '2025-04-02' }], subtasks: [{ id: 'st13', title: 'Stripe Checkout integration', completed: true }, { id: 'st14', title: 'Subscription management API', completed: false }, { id: 'st15', title: 'Customer portal', completed: false }, { id: 'st16', title: 'Webhook handlers', completed: false }, { id: 'st17', title: 'Free trial logic', completed: false }], attachments: [], acceptanceCriteria: ['Usuario puede seleccionar plan mensual o anual', 'Descuento del 20% en plan anual', 'Portal permite cancelar/cambiar plan', 'Webhooks manejan todos los eventos de Stripe'], dependencies: [], blocking: ['task5'] },
  { id: 'task5', key: 'CF-201', title: 'Página de pricing con toggle mensual/anual y comparison table', description: 'Landing page de precios con 3 planes (Free, Pro, Enterprise), toggle mensual/anual con animación, comparison table de features, FAQ section, y CTAs que llevan al checkout de Stripe.', type: 'story', priority: 'high', status: 'done', projectId: 'proj1', assigneeId: 't4', reporterId: 't1', epicId: 'task4', sprintId: 'sprint2', storyPoints: 5, labels: ['payments', 'marketing', 'landing'], dueDate: '2025-05-15', createdAt: '2025-04-10', updatedAt: '2025-05-10', comments: [], subtasks: [{ id: 'st18', title: 'Pricing card components', completed: true }, { id: 'st19', title: 'Monthly/Annual toggle', completed: true }, { id: 'st20', title: 'Feature comparison table', completed: true }], attachments: [], acceptanceCriteria: ['Toggle animación suave', 'Enterprise muestra "Contact Sales"', 'Mobile responsive'], dependencies: [], blocking: [] },

  // Bugs
  { id: 'task6', key: 'CF-301', title: 'Bug: Dashboard charts no renderizan en Safari mobile', description: 'Los gráficos del dashboard principal no se muestran correctamente en Safari para iOS. Los charts de recharts aparecen en blanco o con dimensiones incorrectas. Parece ser un issue con ResizeObserver en Safari.', type: 'bug', priority: 'high', status: 'in_progress', projectId: 'proj1', assigneeId: 't4', reporterId: 't7', epicId: null, sprintId: 'sprint3', storyPoints: 3, labels: ['bug', 'mobile', 'safari', 'charts'], dueDate: '2025-06-05', createdAt: '2025-05-20', updatedAt: '2025-05-28', comments: [{ id: 'c5', authorId: 't7', content: 'Reproducible en iOS 17.5 Safari. Chrome en iOS funciona bien. Captura de pantalla en el ticket.', createdAt: '2025-05-20' }, { id: 'c6', authorId: 't4', content: 'Parece que es el ResizeObserver que no se dispara correctamente. Voy a agregar un fallback con window resize event.', createdAt: '2025-05-21' }], subtasks: [{ id: 'st21', title: 'Reproduce in Safari iOS', completed: true }, { id: 'st22', title: 'Fix ResizeObserver fallback', completed: false }, { id: 'st23', title: 'Test on multiple iOS versions', completed: false }], attachments: ['safari-bug-screenshot.png'], acceptanceCriteria: ['Charts renderizan correctamente en Safari iOS', 'Fallback para versiones sin ResizeObserver', 'No regression en otros browsers'], dependencies: [], blocking: [] },
  { id: 'task7', key: 'CF-302', title: 'Bug: API rate limiting no funciona correctamente para usuarios free', description: 'Los usuarios del plan Free deberían tener un límite de 100 requests/hora pero actualmente no se está aplicando. Las requests se contabilizan globalmente por workspace en lugar de por usuario.', type: 'bug', priority: 'critical', status: 'backlog', projectId: 'proj1', assigneeId: null, reporterId: 't2', epicId: null, sprintId: null, storyPoints: 5, labels: ['bug', 'api', 'security', 'billing'], dueDate: null, createdAt: '2025-05-25', updatedAt: '2025-05-25', comments: [{ id: 'c7', authorId: 't2', content: 'Esto es crítico para el billing. Necesitamos fix ASAP antes del launch.', createdAt: '2025-05-25' }], subtasks: [{ id: 'st24', title: 'Audit rate limiting middleware', completed: false }, { id: 'st25', title: 'Fix per-user rate limiting', completed: false }, { id: 'st26', title: 'Add rate limit headers', completed: false }], attachments: [], acceptanceCriteria: ['Rate limit aplica por usuario, no por workspace', 'Headers X-RateLimit-* en todas las responses', '429 response con retry-after header'], dependencies: [], blocking: [] },

  // Spike
  { id: 'task8', key: 'CF-401', title: 'Spike: Evaluar migración de Supabase a self-hosted Postgres', description: 'Investigar las implicaciones técnicas, de costo y rendimiento de migrar de Supabase (managed) a PostgreSQL self-hosted en AWS RDS. Evaluar si el costo actual de Supabase scale justifica la complejidad de self-hosted.', type: 'spike', priority: 'medium', status: 'todo', projectId: 'proj1', assigneeId: 't3', reporterId: 't2', epicId: null, sprintId: 'sprint3', storyPoints: 3, labels: ['spike', 'infrastructure', 'database'], dueDate: '2025-06-15', createdAt: '2025-05-15', updatedAt: '2025-05-27', comments: [], subtasks: [{ id: 'st27', title: 'Benchmark performance comparison', completed: false }, { id: 'st28', title: 'Cost analysis (1yr projection)', completed: false }, { id: 'st29', title: 'Migration complexity assessment', completed: false }], attachments: [], acceptanceCriteria: ['Report with performance benchmarks', 'Cost comparison table (monthly, 6mo, 12mo)', 'Recommendation with rationale'], dependencies: [], blocking: [] },

  // More tasks
  { id: 'task9', key: 'CF-105', title: 'Como admin, quiero ver dashboard de métricas del workspace en tiempo real', description: 'Dashboard principal con: DAU/MAU, revenue metrics, feature usage heatmap, error rates, y alerts. Datos actualizados cada 30 segundos via WebSocket.', type: 'story', priority: 'high', status: 'in_progress', projectId: 'proj1', assigneeId: 't4', reporterId: 't1', epicId: 'task1', sprintId: 'sprint3', storyPoints: 8, labels: ['dashboard', 'analytics', 'real-time'], dueDate: '2025-06-20', createdAt: '2025-04-05', updatedAt: '2025-05-28', comments: [], subtasks: [{ id: 'st30', title: 'KPI cards component', completed: true }, { id: 'st31', title: 'Charts (line, bar, pie)', completed: true }, { id: 'st32', title: 'WebSocket data layer', completed: false }, { id: 'st33', title: 'Alert configuration UI', completed: false }], attachments: [], acceptanceCriteria: ['Datos actualizan cada 30s', 'Responsive design', 'Export to PDF'], dependencies: ['task2'], blocking: [] },
  { id: 'task10', key: 'CF-106', title: 'Como usuario, quiero recibir notificaciones por email de actividad reciente', description: 'Sistema de notificaciones por email: resumen diario, notificaciones instantáneas para mentions, y digest semanal. Configurable en preferencias del usuario.', type: 'story', priority: 'medium', status: 'todo', projectId: 'proj1', assigneeId: null, reporterId: 't1', epicId: 'task1', sprintId: null, storyPoints: 5, labels: ['notifications', 'email', 'ux'], dueDate: null, createdAt: '2025-04-20', updatedAt: '2025-05-20', comments: [], subtasks: [{ id: 'st34', title: 'Email template system', completed: false }, { id: 'st35', title: 'Daily digest worker', completed: false }, { id: 'st36', title: 'User preference UI', completed: false }], attachments: [], acceptanceCriteria: ['3 tipos: instant, daily, weekly', 'Usuario puede configurar en settings', 'Unsubscribe link en cada email'], dependencies: ['task2'], blocking: [] },
  { id: 'task11', key: 'CF-107', title: 'Implementar autenticación con Google y GitHub (OAuth2)', description: 'Social login con Google (Gmail) y GitHub. Usar Clerk para manejar el flujo OAuth. Incluir account linking si el usuario ya existe con otro provider.', type: 'story', priority: 'high', status: 'done', projectId: 'proj1', assigneeId: 't3', reporterId: 't2', epicId: null, sprintId: 'sprint1', storyPoints: 5, labels: ['auth', 'oauth', 'security'], dueDate: '2025-04-15', createdAt: '2025-03-15', updatedAt: '2025-04-10', comments: [], subtasks: [{ id: 'st37', title: 'Clerk Google provider', completed: true }, { id: 'st38', title: 'Clerk GitHub provider', completed: true }, { id: 'st39', title: 'Account linking logic', completed: true }], attachments: [], acceptanceCriteria: ['Login con Google y GitHub funciona', 'Account linking automático', 'Error handling para accounts existentes'], dependencies: [], blocking: [] },
  { id: 'task12', key: 'CF-108', title: 'Diseñar y implementar Design System completo', description: 'Crear un design system completo con tokens de color, tipografía, componentes base (Button, Input, Card, Modal, Toast, etc.), y documentación en Storybook.', type: 'task', priority: 'high', status: 'done', projectId: 'proj1', assigneeId: 't5', reporterId: 't1', epicId: null, sprintId: 'sprint1', storyPoints: 13, labels: ['design-system', 'ui', 'components'], dueDate: '2025-04-30', createdAt: '2025-03-01', updatedAt: '2025-04-25', comments: [], subtasks: [{ id: 'st40', title: 'Design tokens (colors, spacing, typography)', completed: true }, { id: 'st41', title: 'Base components (20+) ', completed: true }, { id: 'st42', title: 'Storybook documentation', completed: true }], attachments: [], acceptanceCriteria: ['20+ componentes documentados', 'Tokens accesibles como CSS variables', 'Storybook con ejemplos interactivos'], dependencies: [], blocking: ['task2', 'task9'] },
  { id: 'task13', key: 'CF-109', title: 'Chore: Migrar a ESLint flat config y agregar reglas estrictas', description: 'Migrar de .eslintrc a eslint.config.js (flat config). Agregar reglas estrictas para TypeScript, React hooks, y accessibility. Configurar pre-commit hooks con husky.', type: 'chore', priority: 'low', status: 'backlog', projectId: 'proj1', assigneeId: null, reporterId: 't2', epicId: null, sprintId: null, storyPoints: 2, labels: ['tooling', 'eslint', 'dx'], dueDate: null, createdAt: '2025-05-22', updatedAt: '2025-05-22', comments: [], subtasks: [{ id: 'st43', title: 'Eslint flat config migration', completed: false }, { id: 'st44', title: 'Husky + lint-staged setup', completed: false }], attachments: [], acceptanceCriteria: ['Flat config working', 'No new warnings', 'Pre-commit hook runs lint + type-check'], dependencies: [], blocking: [] },
  { id: 'task14', key: 'CF-110', title: 'Improvement: Optimizar bundle size con code splitting', description: 'Analizar y reducir el bundle size actual. Implementar dynamic imports para rutas pesadas (dashboard, settings), lazy loading de componentes pesados, y tree shaking optimizado. Target: reducir bundle en 40%.', type: 'improvement', priority: 'medium', status: 'todo', projectId: 'proj1', assigneeId: null, reporterId: 't2', epicId: null, sprintId: null, storyPoints: 5, labels: ['performance', 'bundle', 'optimization'], dueDate: null, createdAt: '2025-05-18', updatedAt: '2025-05-18', comments: [], subtasks: [{ id: 'st45', title: 'Bundle analysis (webpack-bundle-analyzer)', completed: false }, { id: 'st46', title: 'Dynamic imports for heavy routes', completed: false }, { id: 'st47', title: 'Component lazy loading', completed: false }], attachments: [], acceptanceCriteria: ['Bundle size reduced by 40%', 'Lighthouse Performance > 90', 'No waterfall loading issues'], dependencies: [], blocking: [] },
  // More for variety
  { id: 'task15', key: 'CF-111', title: 'Como usuario, quiero buscar en toda la app con Cmd+K', description: 'Command palette global (Cmd+K / Ctrl+K) que permita buscar proyectos, tareas, miembros, documentos y navegar rápidamente. Inspirado en Linear y Spotlight de macOS.', type: 'story', priority: 'high', status: 'todo', projectId: 'proj1', assigneeId: null, reporterId: 't1', epicId: null, sprintId: null, storyPoints: 5, labels: ['search', 'ux', 'command-palette'], dueDate: null, createdAt: '2025-05-25', updatedAt: '2025-05-25', comments: [], subtasks: [{ id: 'st48', title: 'Command palette UI', completed: false }, { id: 'st49', title: 'Search index with Fuse.js', completed: false }, { id: 'st50', title: 'Recent items + navigation', completed: false }], attachments: [], acceptanceCriteria: ['Cmd+K abre command palette', 'Busca en < 200ms', 'Keyboard navigation completa'], dependencies: [], blocking: [] },
  { id: 'task16', key: 'CF-112', title: 'Implementar WebSocket para colaboración en tiempo real', description: 'Sistema de WebSocket para notificaciones en tiempo real, presencia de usuarios (who is online), y sync de cambios en documentos. Usar Socket.io con rooms por workspace.', type: 'story', priority: 'high', status: 'backlog', projectId: 'proj1', assigneeId: null, reporterId: 't2', epicId: null, sprintId: null, storyPoints: 8, labels: ['websocket', 'real-time', 'collaboration'], dueDate: null, createdAt: '2025-05-20', updatedAt: '2025-05-20', comments: [], subtasks: [{ id: 'st51', title: 'Socket.io server setup', completed: false }, { id: 'st52', title: 'Room management per workspace', completed: false }, { id: 'st53', title: 'Presence indicator', completed: false }, { id: 'st54', title: 'Notification delivery', completed: false }], attachments: [], acceptanceCriteria: ['Latencia < 100ms', 'Auto-reconnect', 'Presencia visible en UI'], dependencies: [], blocking: [] },
]

export const MOCK_SPRINTS: Sprint[] = [
  { id: 'sprint1', name: 'Sprint 1 - Foundation', goal: 'Configurar infraestructura base, auth, y design system', status: 'completed', startDate: '2025-03-01', endDate: '2025-03-14', projectId: 'proj1', velocity: 18, plannedPoints: 18, completedPoints: 18, tasks: ['task11', 'task12'], retrospective: 'Buena velocidad inicial. Design system tomó más tiempo de lo esperado pero la inversión valió la pena. Auth fue más rápido gracias a Clerk. Next: onboarding flow y pagos.' },
  { id: 'sprint2', name: 'Sprint 2 - Core Features', goal: 'Completar pricing page, workspace creation, y primeros features de onboarding', status: 'completed', startDate: '2025-03-17', endDate: '2025-03-30', projectId: 'proj1', velocity: 13, plannedPoints: 13, completedPoints: 13, tasks: ['task2', 'task5'], retrospective: 'Velocidad estable. Luis se integró bien como junior. El logo upload tuvo bugs inesperados con formatos HEIC de iPhone. Necesitamos mejor manejo de imágenes.' },
  { id: 'sprint3', name: 'Sprint 3 - Payments & Onboarding', goal: 'Avanzar Stripe integration, completar onboarding, y fix bugs críticos', status: 'active', startDate: '2025-05-26', endDate: '2025-06-08', projectId: 'proj1', velocity: 0, plannedPoints: 26, completedPoints: 0, tasks: ['task1', 'task3', 'task4', 'task6', 'task8', 'task9'], retrospective: null },
]

export const MOCK_ROADMAP: RoadmapItem[] = [
  { id: 'rm1', title: 'V1.0 - Core Platform', description: 'Lanzamiento principal con onboarding, autenticación, workspace management, y dashboards básicos', status: 'in_progress', startDate: '2025-01-15', endDate: '2025-09-01', priority: 'critical', confidence: 85, projectId: 'proj1', category: 'Core', metrics: ['DAU > 500', 'MRR > $10K', 'NPS > 70'], dependencies: [], progress: 42 },
  { id: 'rm2', title: 'Billing & Subscriptions', description: 'Stripe integration completa con planes mensuales/anuales, trial, y portal de cliente', status: 'in_progress', startDate: '2025-04-01', endDate: '2025-07-31', priority: 'critical', confidence: 80, projectId: 'proj1', category: 'Monetization', metrics: ['Conversion > 5%', 'Trial-to-paid > 25%'], dependencies: ['rm1'], progress: 35 },
  { id: 'rm3', title: 'Real-time Collaboration', description: 'WebSocket, presence, collaborative editing, y notificaciones push en tiempo real', status: 'planned', startDate: '2025-07-01', endDate: '2025-10-15', priority: 'high', confidence: 70, projectId: 'proj1', category: 'Feature', metrics: ['WS latency < 100ms', '99.9% uptime'], dependencies: ['rm1'], progress: 0 },
  { id: 'rm4', title: 'Advanced Analytics Dashboard', description: 'Dashboards personalizables con widgets drag-and-drop, reportes automatizados, y export a PDF/CSV', status: 'planned', startDate: '2025-08-01', endDate: '2025-11-30', priority: 'high', confidence: 65, projectId: 'proj2', category: 'Feature', metrics: ['100+ dashboards created', 'Avg session < 5min'], dependencies: ['rm1'], progress: 5 },
  { id: 'rm5', title: 'Mobile App (React Native)', description: 'App companion para iOS y Android con notificaciones push, acceso rápido a métricas, y gestión on-the-go', status: 'planned', startDate: '2025-10-01', endDate: '2026-03-31', priority: 'medium', confidence: 50, projectId: 'proj3', category: 'Platform', metrics: ['Mobile DAU > 300', 'Push CTR > 15%'], dependencies: ['rm1', 'rm3'], progress: 0 },
  { id: 'rm6', title: 'API Marketplace & Integrations', description: 'Marketplace de APIs, integraciones con Slack/GitHub/Notion, y developer portal', status: 'planned', startDate: '2026-01-01', endDate: '2026-06-30', priority: 'medium', confidence: 40, projectId: 'proj4', category: 'Platform', metrics: ['50+ APIs', 'Revenue share $25K/mo'], dependencies: ['rm1', 'rm3'], progress: 0 },
  { id: 'rm7', title: 'AI Copilot for PMs', description: 'Asistente AI integrado para generar historias de usuario, auto-triage de bugs, y sugerencias de priorización', status: 'discovery', startDate: '2026-04-01', endDate: '2026-09-30', priority: 'medium', confidence: 30, projectId: 'proj1', category: 'Innovation', metrics: ['50% stories auto-generated', 'PM time saved 30%'], dependencies: ['rm1', 'rm4'], progress: 0 },
]

export const MOCK_PRDS: PRDDocument[] = [
  {
    id: 'prd1', title: 'PRD: Flujo de Onboarding Multi-Paso', status: 'approved', projectId: 'proj1', authorId: 't1', version: 3,
    summary: 'Implementar un flujo de onboarding guiado de 5 pasos para nuevos usuarios que reduce el time-to-value y mejora la activación del producto.',
    problemStatement: 'Actualmente el 45% de los usuarios que se registran nunca completan la configuración de su workspace. El time-to-first-action promedio es de 12 minutos, lo cual es 4x más que la media del industry (3 min). Esto resulta en una tasa de activación del 23%, muy por debajo del benchmark de SaaS B2B de 60%.',
    targetAudience: 'SMBs y startups con equipos de 2-50 personas que buscan una herramienta de gestión de proyectos. Principalmente roles de Product Managers, Team Leads, y CTOs. Decision-makers técnicos entre 25-45 años.',
    userStories: [
      { as: 'nuevo usuario registrado', iWant: 'completar la configuración de mi workspace en menos de 3 minutos', soThat: 'puedo empezar a usar el producto inmediatamente y ver su valor', priority: 'critical', points: 8 },
      { as: 'nuevo usuario', iWant: 'invitar a mi equipo durante el onboarding', soThat: 'mis colaboradores puedan empezar a trabajar conmigo desde el día 1', priority: 'high', points: 5 },
      { as: 'nuevo usuario', iWant: 'saltar pasos del onboarding y volver después', soThat: 'no me siento forzado a completar todo de una vez', priority: 'medium', points: 3 },
      { as: 'admin de workspace', iWant: 'ver el progreso de onboarding de mi equipo', soThat: 'pueda identificar quién necesita ayuda', priority: 'low', points: 3 },
    ],
    functionalRequirements: [
      { id: 'fr1', description: 'Stepper component con 5 pasos navegables', priority: 'high', status: 'in_progress' },
      { id: 'fr2', description: 'Validación en tiempo real de todos los formularios', priority: 'high', status: 'in_progress' },
      { id: 'fr3', description: 'Auto-save del progreso cada 30 segundos', priority: 'high', status: 'pending' },
      { id: 'fr4', description: 'Sistema de tips/contextual help por paso', priority: 'medium', status: 'pending' },
      { id: 'fr5', description: 'Analytics tracking de cada paso completado', priority: 'medium', status: 'pending' },
    ],
    nonFunctionalRequirements: ['El stepper debe cargar en < 1 segundo', 'Soportar navegación con teclado (Tab, Enter)', 'Accesible WCAG 2.1 AA', 'Funcionar offline para los datos ya guardados (Service Worker)'],
    successMetrics: [{ metric: 'Activation Rate', baseline: '23%', target: '60%', timeline: '90 días post-launch' }, { metric: 'Time-to-first-action', baseline: '12 min', target: '< 3 min', timeline: '90 días post-launch' }, { metric: 'Onboarding Completion', baseline: '55%', target: '85%', timeline: '90 días post-launch' }],
    technicalConsiderations: ['Usar react-hook-form para validación', 'Guardar progreso en localStorage + Supabase', 'Usar framer-motion para animaciones del stepper', 'Track con Mixpanel/June.so cada step_view, step_complete, onboarding_skip'],
    openQuestions: [{ question: '¿Debemos mostrar un video tutorial o tooltips interactivos?', answer: 'Tooltips interactivos (decisión: 15/05)', owner: 'Sofía' }, { question: '¿El trial de 14 días empieza al registro o al completar onboarding?', answer: 'Al completar onboarding (decisión: 12/05)', owner: 'María' }, { question: '¿Debemos requerir verificación de email antes del onboarding?', answer: null, owner: 'Carlos' }],
    timeline: 'Sprint 3 (May 26 - Jun 08) para las stories principales. Sprint 4 para el analytics y mejoras UX.',
    dependencies: ['Auth system (Clerk) debe estar funcionando', 'Workspace creation API debe estar lista', 'Design system stepper component'],
    risks: ['Riesgo de abandono si onboarding es muy largo - mitigación: permitir skip', 'Safari compatibility issues con animaciones - mitigación: progressive enhancement'],
    createdAt: '2025-02-28', updatedAt: '2025-05-30'
  },
  {
    id: 'prd2', title: 'PRD: Integración Stripe para Suscripciones SaaS', status: 'in_review', projectId: 'proj1', authorId: 't1', version: 2,
    summary: 'Implementar sistema de pagos completo con Stripe Billing para monetización del producto con 3 planes (Free, Pro, Enterprise) y soporte para suscripciones mensuales/anuales.',
    problemStatement: 'Sin una solución de pagos, no podemos generar revenue recurrente. Necesitamos una integración que sea robusta, escalable, y que ofrezca una experiencia de pago sin fricciones para maximizar la conversión de trial a paid.',
    targetAudience: 'Usuarios existentes en plan Free que quieran upgradear. Nuevos usuarios que evalúen el producto y quieran comenzar con un plan de pago.',
    userStories: [
      { as: 'usuario Free', iWant: 'ver una página de precios clara con comparación de planes', soThat: 'puedo decidir qué plan es mejor para mi equipo', priority: 'high', points: 5 },
      { as: 'usuario Pro', iWant: 'pagar con tarjeta y recibir confirmación inmediata', soThat: 'tenga confianza de que mi pago fue procesado', priority: 'critical', points: 8 },
      { as: 'admin', iWant: 'gestionar mi suscripción desde un portal de cliente', soThat: 'pueda cancelar, cambiar plan, o actualizar mi método de pago', priority: 'high', points: 5 },
      { as: 'usuario Enterprise', iWant: 'contactar a ventas para un plan personalizado', soThat: 'pueda negociar volumen y features específicas', priority: 'medium', points: 3 },
    ],
    functionalRequirements: [
      { id: 'fr10', description: 'Stripe Checkout Session integration', priority: 'critical', status: 'done' },
      { id: 'fr11', description: 'Subscription CRUD via Stripe API', priority: 'critical', status: 'in_progress' },
      { id: 'fr12', description: 'Customer Portal (cancel, upgrade, downgrade)', priority: 'high', status: 'pending' },
      { id: 'fr13', description: 'Webhook handlers para todos los eventos de Stripe', priority: 'critical', status: 'pending' },
      { id: 'fr14', description: 'Billing history y invoice download', priority: 'medium', status: 'pending' },
    ],
    nonFunctionalRequirements: ['PCI compliant (Stripe Elements handles this)', 'Webhook processing < 5s', 'Retry logic con exponential backoff para webhooks', 'Audit log de todos los cambios de billing'],
    successMetrics: [{ metric: 'Trial-to-paid conversion', baseline: '0%', target: '25%', timeline: 'Q3 2025' }, { metric: 'Checkout completion rate', baseline: 'N/A', target: '85%', timeline: 'Q3 2025' }, { metric: 'Monthly churn rate', baseline: 'N/A', target: '< 3%', timeline: 'Q4 2025' }],
    technicalConsiderations: ['Usar Stripe Billing (no solo Payments)', 'Webhook signing verification', 'Idempotency keys para todas las llamadas', 'Stripe CLI para desarrollo local'],
    openQuestions: [{ question: '¿Ofrecemos descuento por pago anual?', answer: '20% descuento (decisión: 20/05)', owner: 'María' }, { question: '¿Cuántos días de trial gratuito?', answer: '14 días (decisión: 18/05)', owner: 'María' }, { question: '¿Procesamos pagos en EUR también o solo USD?', answer: null, owner: 'Carlos' }],
    timeline: 'Sprint 3 (Checkout + Subscription API), Sprint 4 (Customer Portal + Webhooks), Sprint 5 (Billing History + Polish).',
    dependencies: ['Workspace/tenant model debe estar definido', 'User model con plan association', 'Pricing page UI'],
    risks: ['Stripe API changes - mitigación: usar versiones fijadas de la API', 'Webhook failures causan inconsistencias - mitigación: retry queue con Dead Letter Queue'],
    createdAt: '2025-03-15', updatedAt: '2025-05-30'
  },
]

export const MOCK_TECH_STACK: TechStackItem[] = [
  { id: 'ts1', name: 'Next.js 14', category: 'frontend', description: 'Framework React full-stack con SSR, SSG, ISR y App Router para la interfaz de usuario y la landing page.', purpose: 'Core framework para toda la aplicación web y marketing site', alternatives: ['Remix', 'Nuxt.js', 'Astro'], pros: ['SSR/SSG integrado', 'App Router moderno', 'Excelente DX con TypeScript', 'Vercel integration', 'Image optimization built-in'], cons: ['Bundle size puede ser grande', 'Server components aún madurando', 'Algunas librerías no son compatibles con SSR'], cost: 'Free (Vercel hosting: $20/mo Pro)', learningCurve: 'medium', communitySize: 'large', maturity: 'mature', url: 'https://nextjs.org', logo: '⚡' },
  { id: 'ts2', name: 'Supabase', category: 'backend', description: 'Backend-as-a-Service con PostgreSQL, Auth, Storage, Edge Functions y Realtime subscriptions.', purpose: 'Backend principal: base de datos, autenticación, almacenamiento y APIs', alternatives: ['Firebase', 'Appwrite', 'PocketBase'], pros: ['PostgreSQL real (no NoSQL lock-in)', 'Auth built-in (SSO, social, magic link)', 'Storage con CDN', 'Realtime subscriptions', 'Row Level Security', 'Generoso free tier'], cons: ['Vendor lock-in parcial', 'Edge Functions limitadas vs AWS Lambda', 'Custom domains requiere Pro plan'], cost: 'Free tier: 500MB DB, 50K MAU. Pro: $25/mo', learningCurve: 'low', communitySize: 'large', maturity: 'stable', url: 'https://supabase.com', logo: '🔥' },
  { id: 'ts3', name: 'Stripe', category: 'payments', description: 'Plataforma de pagos líder para suscripciones, one-time payments, y marketplace payouts.', purpose: 'Sistema de pagos, suscripciones, facturación y portal de cliente', alternatives: ['Paddle', 'Lemon Squeezy', 'RevenueCat'], pros: ['Gold standard para SaaS billing', 'Stripe Checkout simplifica PCI compliance', 'Customer Portal out-of-the-box', 'Excelente dashboard', 'Webhooks confiables', 'Soporta 135+ currencies'], cons: ['Fees: 2.9% + $0.30 per transaction', 'Custom flows complejos requieren más código', 'Account freezes pueden ser problemáticos'], cost: 'No monthly fee. 2.9% + $0.30 per transaction', learningCurve: 'medium', communitySize: 'large', maturity: 'mature', url: 'https://stripe.com', logo: '💳' },
  { id: 'ts4', name: 'Clerk', category: 'auth', description: 'Authentication-as-a-Service con UI components pre-built, social login, SSO y MFA.', purpose: 'Autenticación de usuarios, registro, login social y gestión de sesiones', alternatives: ['Auth0', 'Supabase Auth', 'NextAuth'], pros: ['UI components pre-built (drop-in)', 'Social login: Google, GitHub, Apple, etc.', 'SSO/SAML enterprise', 'MFA built-in', 'User management dashboard', 'Next.js SDK excelente'], cons: ['Costo escala con MAU', 'Customization limitada de UI', 'Vendor lock-in para auth'], cost: 'Free: 10K MAU. Pro: $25/mo (100K MAU)', learningCurve: 'low', communitySize: 'medium', maturity: 'stable', url: 'https://clerk.com', logo: '🔐' },
  { id: 'ts5', name: 'Resend', category: 'email', description: 'Email API moderna con templates React, analytics, y reputación excelente para delivery.', purpose: 'Correos transaccionales: verificación, recibos, notificaciones, newsletters', alternatives: ['Postmark', 'SendGrid', 'Mailgun'], pros: ['Templates con React email', 'Excelente deliverability', 'Dashboard limpio y moderno', 'Analytics built-in', 'Next.js integration', 'Free tier generoso'], cons: ['Menos features que SendGrid Enterprise', 'No tiene marketing email nativo', 'DNS setup puede ser complejo'], cost: 'Free: 3K emails/mo. Pro: $20/mo (50K emails)', learningCurve: 'low', communitySize: 'medium', maturity: 'stable', url: 'https://resend.com', logo: '📧' },
  { id: 'ts6', name: 'Tailwind CSS', category: 'frontend', description: 'Utility-first CSS framework para diseño rápido y consistente sin escribir CSS custom.', purpose: 'Estilizado de toda la interfaz de usuario', alternatives: ['Bootstrap', 'Chakra UI', 'Radix Themes'], pros: ['Utility-first = consistency', 'Tree-shaking = minimal CSS', 'JIT compiler = ultra rápido', 'Design tokens fácil', 'Plugins ecosystem', 'Great docs'], cons: ['HTML puede ser verbose', 'Learning curve para conceptos de utility', 'Custom animations requieren @apply o plugins'], cost: 'Free', learningCurve: 'low', communitySize: 'large', maturity: 'mature', url: 'https://tailwindcss.com', logo: '🎨' },
  { id: 'ts7', name: 'Vercel', category: 'cloud', description: 'Plataforma de deployment y hosting optimizada para Next.js con Edge Functions, CDN y analytics.', purpose: 'Hosting de la aplicación, CI/CD, preview deployments y Edge Functions', alternatives: ['Netlify', 'Render', 'AWS Amplify', 'Railway'], pros: ['Zero-config Next.js deployment', 'Preview deployments por PR', 'Edge Functions globally', 'Analytics built-in', 'Image/Video optimization', 'Free tier generoso'], cons: ['Costo escala con bandwidth', 'Vendor lock-in parcial', 'Build times pueden ser lentos en free tier', 'Limited background workers'], cost: 'Free: 100GB bandwidth. Pro: $20/mo (1TB)', learningCurve: 'low', communitySize: 'large', maturity: 'mature', url: 'https://vercel.com', logo: '▲' },
  { id: 'ts8', name: 'Sentry', category: 'monitoring', description: 'Error tracking y performance monitoring con stack traces, breadcrumbs, y alertas en tiempo real.', purpose: 'Monitoreo de errores en producción, crash reports y performance tracking', alternatives: ['Datadog', 'Rollbar', 'Bugsnag'], cons: ['Pricing escala rápido con volumen', 'UI puede ser confusa inicialmente', 'Algunos features requieren Business plan'], pros: ['Real-time error tracking', 'Stack traces con source maps', 'Performance monitoring (tracing)', 'Alertas configurables', 'GitHub/GitLab integration', 'Release tracking'], cost: 'Free: 5K errors/mo. Pro: $26/mo (50K)', learningCurve: 'medium', communitySize: 'large', maturity: 'mature', url: 'https://sentry.io', logo: '🚨' },
  { id: 'ts9', name: 'Mixpanel', category: 'analytics', description: 'Product analytics con event tracking, funnels, cohorts, retention analysis y A/B testing.', purpose: 'Analítica de producto: event tracking, funnels, retention, cohorts', alternatives: ['Amplitude', 'PostHog', 'June.so', 'GA4'], pros: ['Powerful funnel analysis', 'Cohort retention', 'Event autocapture option', 'Free tier: 20M events', 'Good for SaaS metrics'], cons: ['Pricing escala con events', 'No web analytics nativa', 'Learning curve para queries avanzadas'], cost: 'Free: 20M events/mo. Pro: $20/mo (100M)', learningCurve: 'medium', communitySize: 'large', maturity: 'mature', url: 'https://mixpanel.com', logo: '📊' },
  { id: 'ts10', name: 'GitHub Actions', category: 'ci_cd', description: 'CI/CD integrado en GitHub con workflows YAML para testing, linting, deploy y más.', purpose: 'CI/CD pipeline: tests automáticos, lint, deploy a Vercel', alternatives: ['CircleCI', 'GitLab CI', 'Bitbucket Pipelines'], pros: ['Native GitHub integration', 'Free: 2000 min/mo', 'Marketplace de actions', 'Matrix builds', 'Environment secrets'], cons: ['Can be slow for complex pipelines', 'Pricing per minute after free tier', 'Debugging failures can be tricky'], cost: 'Free: 2000 min/mo. Pro: $4/user/mo (3000 min)', learningCurve: 'medium', communitySize: 'large', maturity: 'mature', url: 'https://github.com/features/actions', logo: '⚙️' },
]

export const MOCK_COSTS: CostItem[] = [
  { id: 'cost1', category: 'Hosting', tool: 'Vercel Pro', monthlyCost: 20, annualCost: 240, plan: 'Pro', notes: '1TB bandwidth, preview deployments, analytics', essential: true },
  { id: 'cost2', category: 'Backend', tool: 'Supabase Pro', monthlyCost: 25, annualCost: 300, plan: 'Pro', notes: '8GB DB, 100K MAU, custom domains, priority support', essential: true },
  { id: 'cost3', category: 'Auth', tool: 'Clerk Pro', monthlyCost: 25, annualCost: 300, plan: 'Pro', notes: '100K MAU, SSO/SAML, custom email templates', essential: true },
  { id: 'cost4', category: 'Emails', tool: 'Resend Pro', monthlyCost: 20, annualCost: 240, plan: 'Pro', notes: '50K emails/mo, domains, analytics', essential: true },
  { id: 'cost5', category: 'Monitoring', tool: 'Sentry Pro', monthlyCost: 26, annualCost: 312, plan: 'Pro', notes: '50K errors/mo, performance monitoring, releases', essential: true },
  { id: 'cost6', category: 'Analytics', tool: 'Mixpanel', monthlyCost: 20, annualCost: 240, plan: 'Growth', notes: '100M events/mo, funnels, cohorts, A/B testing', essential: false },
  { id: 'cost7', category: 'Domain', tool: 'Cloudflare DNS + Domain', monthlyCost: 1.5, annualCost: 18, plan: 'Basic', notes: 'Domain registration + DNS management', essential: true },
  { id: 'cost8', category: 'Design', tool: 'Figma Professional', monthlyCost: 15, annualCost: 180, plan: 'Pro', notes: 'Design system, prototyping, dev mode', essential: true },
  { id: 'cost9', category: 'Communication', tool: 'Slack', monthlyCost: 8.75, annualCost: 105, plan: 'Pro', notes: 'Per user. 10K message history, integrations', essential: false },
  { id: 'cost10', category: 'Meetings', tool: 'Google Meet (Workspace)', monthlyCost: 6, annualCost: 72, plan: 'Business Starter', notes: 'Per user. 150 participant meetings, recordings', essential: false },
  { id: 'cost11', category: 'CI/CD', tool: 'GitHub Team', monthlyCost: 4, annualCost: 48, plan: 'Team', notes: 'Per user. 3000 CI minutes, private repos', essential: true },
  { id: 'cost12', category: 'Support', tool: 'Crisp', monthlyCost: 0, annualCost: 0, plan: 'Free', notes: 'Live chat para soporte. Upgrade si crece', essential: false },
  { id: 'cost13', category: 'AI', tool: 'OpenAI API', monthlyCost: 0, annualCost: 0, plan: 'Pay-as-you-go', notes: 'Para features de AI. Estimado $50/mo a 1K users', essential: false },
]

export const MOCK_STARTUP_PROGRAMS: StartupProgram[] = [
  { id: 'sp1', name: 'Stripe Atlas', company: 'Stripe', description: 'Cuentas bancarias, incorporation y herramientas de pago para startups', benefits: '$50K en waived Stripe fees primer año + Stripe Atlas', status: 'active', applicationDate: '2025-01-20', expirationDate: '2026-01-20', url: 'https://stripe.com/atlas', savings: '~$1,450 en fees waived', notes: 'Aprobado en 3 días. Incluye Mercury bank account.' },
  { id: 'sp2', name: 'Vercel for Startups', company: 'Vercel', description: 'Programa especial para startups early-stage con crédito gratuito', benefits: '12 meses de Pro plan gratis + $2,000 en credits', status: 'active', applicationDate: '2025-01-25', expirationDate: '2026-01-25', url: 'https://vercel.com/startups', savings: '$240 + $2,000 en credits', notes: 'Requiere ser parte de un acelerador o incubadora. Aprobado vía YC application.' },
  { id: 'sp3', name: 'Supabase Launchpad', company: 'Supabase', description: 'Crédito gratuito para startups en fase temprana usando Supabase', benefits: '$200/mo en credits por 6 meses', status: 'active', applicationDate: '2025-02-01', expirationDate: '2025-08-01', url: 'https://supabase.com/docs/guides/launch-week/startups', savings: '$1,200 total', notes: 'Estamos usando $80/mo actualmente de los $200.' },
  { id: 'sp4', name: 'GitHub for Startups', company: 'GitHub', description: 'GitHub Team/Enterprise gratis para startups calificadas', benefits: 'GitHub Team gratis por 2 años', status: 'approved', applicationDate: '2025-02-15', expirationDate: null, url: 'https://github.com/education', savings: '$96/user/año x 8 miembros = $768/año', notes: 'Aprobado. Falta activar (pending onboarding).' },
  { id: 'sp5', name: 'Clerk for Startups', company: 'Clerk', description: 'Plan Pro gratis para startups pre-seed', benefits: 'Clerk Pro gratis por 1 año', status: 'active', applicationDate: '2025-02-01', expirationDate: '2026-02-01', url: 'https://clerk.com/pricing', savings: '$300/año', notes: 'Activado. 100K MAU incluidos.' },
  { id: 'sp6', name: 'Resend for Startups', company: 'Resend', description: 'Email credits gratis para startups', benefits: '50K emails/mes gratis por 6 meses', status: 'active', applicationDate: '2025-03-01', expirationDate: '2025-09-01', url: 'https://resend.com', savings: '$120 total', notes: 'Suficiente para nuestro volumen actual de ~5K emails/mes.' },
  { id: 'sp7', name: 'Sentry for Startups', company: 'Sentry', description: 'Programa de startup con créditos de monitoreo', benefits: 'Sentry Team gratis por 1 año', status: 'applied', applicationDate: '2025-05-20', expirationDate: null, url: 'https://sentry.io/startups/', savings: '$312/año', notes: 'Aplicado. Pendiente de aprobación (2-3 semanas).' },
  { id: 'sp8', name: 'Figma for Startups', company: 'Figma', description: 'Plan Organization gratis para startups elegibles', benefits: 'Figma Organization gratis por 2 años', status: 'applied', applicationDate: '2025-05-25', expirationDate: null, url: 'https://www.figma.com/startups/', savings: '$360/año', notes: 'Aplicado. Pendiente de aprobación.' },
]

export const MOCK_RISKS: Risk[] = [
  { id: 'risk1', title: 'Performance degradation con >1000 usuarios concurrentes', description: 'Supabase RLS policies pueden causar latencia significativa cuando hay más de 1000 usuarios activos simultáneamente. Queries complejas con joins múltiples pueden degradar el rendimiento del dashboard.', category: 'technical', level: 'high', probability: 60, impact: 8, status: 'mitigating', projectId: 'proj1', mitigation: 'Implementar caching agresivo con Redis para queries frecuentes. Preparar migración a self-hosted Postgres con pgBouncer si es necesario. Monitoring de query performance con Supabase dashboard.', owner: 'Carlos Rodríguez', identifiedDate: '2025-03-15', resolvedDate: null },
  { id: 'risk2', title: 'Vendor lock-in con Supabase', description: 'Dependencia total de Supabase para auth, database, storage y realtime. Si Supabase cambia pricing, tiene downtime, o se descontinua un feature, nos afecta directamente.', category: 'technical', level: 'medium', probability: 30, impact: 7, status: 'identified', projectId: 'proj1', mitigation: 'Mantener capa de abstracción en el backend. Evitar usar Supabase client-side directamente. Evaluar migración a self-hosted cada 6 meses. Spike en Sprint 3.', owner: 'Ana Martínez', identifiedDate: '2025-04-01', resolvedDate: null },
  { id: 'risk3', title: 'Churn rate alto en primeros 30 días', description: 'SaaS B2B typical tiene 5-7% churn mensual. Si nuestro onboarding no es efectivo, podríamos ver churn > 10% en los primeros 30 días, matando el growth.', category: 'market', level: 'high', probability: 45, impact: 9, status: 'mitigating', projectId: 'proj1', mitigation: 'Implementar onboarding multi-paso (Epic CF-101). Activar email nurture sequence para usuarios inactivos. NPS survey a los 7 días. Dedicated customer success para early adopters.', owner: 'María García', identifiedDate: '2025-03-01', resolvedDate: null },
  { id: 'risk4', title: 'Falta de PMF antes de agotar runway', description: 'Si no logramos Product-Market Fit antes de los 12 meses, nos quedaremos sin runway para continuar. Actualmente no hay evidencia clara de PMF.', category: 'financial', level: 'critical', probability: 35, impact: 10, status: 'analyzing', projectId: 'proj1', mitigation: 'Iterar rapidamente basado en feedback de early adopters. Mantener burn rate < $10K/mes. Alternativa: buscar seed funding si trazas de PMF son positivas pero no suficientes.', owner: 'María García', identifiedDate: '2025-01-15', resolvedDate: null },
  { id: 'risk5', title: 'Seguridad de datos (compliance GDPR/CCPA)', description: 'Manejamos datos de empresas (PII, billing info). Un data breach o non-compliance con GDPR/CCPA puede resultar en multas legales y pérdida de confianza.', category: 'compliance', level: 'high', probability: 20, impact: 10, status: 'mitigating', projectId: 'proj1', mitigation: 'Implementar RLS strict en todas las tablas. Audit de security cada sprint. Encriptar PII at rest y in transit. Cookie consent banner. Privacy policy y DPA con clientes enterprise.', owner: 'Pedro Ruiz', identifiedDate: '2025-02-01', resolvedDate: null },
  { id: 'risk6', title: 'Key person dependency (Carlos - Tech Lead)', description: 'Carlos es el único que conoce profundamente la arquitectura del sistema. Si se va, el conocimiento se pierde.', category: 'team', level: 'medium', probability: 25, impact: 8, status: 'identified', projectId: 'proj1', mitigation: 'Pair programming sessions. Architecture Decision Records (ADRs) documentados. Code reviews cruzados. Ana y Diego asumen progresivamente más responsabilidad técnica.', owner: 'María García', identifiedDate: '2025-04-15', resolvedDate: null },
  { id: 'risk7', title: 'Scope creep en V1.0', description: 'Tendencia natural de agregar más features al MVP. Cada feature adicional retrasa el launch y aumenta la complejidad.', category: 'operational', level: 'medium', probability: 70, impact: 6, status: 'mitigating', projectId: 'proj1', mitigation: 'Strict backlog prioritization. "If in doubt, leave it out". Feature freeze 2 semanas antes del target launch. Document every new request but defer a V1.1.', owner: 'María García', identifiedDate: '2025-03-01', resolvedDate: null },
  { id: 'risk8', title: 'Mobile app complexity underestimated', description: 'React Native puede tener problemas con librerías nativas, animations complejas, y debugging en dispositivos específicos. El scope del mobile app es grande.', category: 'technical', level: 'high', probability: 55, impact: 7, status: 'identified', projectId: 'proj3', mitigation: 'Usar Expo para simplificar. Empezar con feature set mínimo. Prototipo antes de desarrollo full. Considerar PWA como alternativa si React Native no cumple.', owner: 'Carlos Rodríguez', identifiedDate: '2025-05-15', resolvedDate: null },
]

export const MOCK_MEETINGS: MeetingNote[] = [
  {
    id: 'meet1', title: 'Daily Standup - Sprint 3', type: 'daily', date: '2025-05-30', projectId: 'proj1',
    attendees: ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'],
    actionItems: [
      { id: 'ai1', text: 'Luis: completar magic link email template y hacer PR', assignee: 'Luis Torres', dueDate: '2025-06-02', done: false },
      { id: 'ai2', text: 'Diego: fix Safari chart rendering - probar con ResizeObserver fallback', assignee: 'Diego López', dueDate: '2025-06-04', done: false },
      { id: 'ai3', text: 'Ana: investigar rate limiting middleware alternatives', assignee: 'Ana Martínez', dueDate: '2025-06-01', done: false },
    ],
    decisions: [
      { id: 'dec1', text: 'Usar Resend para todos los emails transaccionales (onboarding, payments, notifications)', context: 'Comparado SendGrid, Postmark y Resend. Resend tiene mejor DX con React email templates y pricing transparente.' },
    ],
    notes: 'Sprint 3 va bien. Onboarding flow 60% completado. Stripe checkout listo pero falta subscription management. Bug de Safari bloquea dashboard mobile. Luis está progresando rápido como junior.'
  },
  {
    id: 'meet2', title: 'Sprint 3 Planning', type: 'sprint_planning', date: '2025-05-26', projectId: 'proj1',
    attendees: ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'],
    actionItems: [
      { id: 'ai4', text: 'María: confirmar trial-to-paid conversion target con stakeholders', assignee: 'María García', dueDate: '2025-05-28', done: true },
      { id: 'ai5', text: 'Carlos: dividir epic de onboarding en stories individuales', assignee: 'Carlos Rodríguez', dueDate: '2025-05-27', done: true },
      { id: 'ai6', text: 'Ana: preparar spike de Supabase vs self-hosted Postgres', assignee: 'Ana Martínez', dueDate: '2025-06-15', done: false },
      { id: 'ai7', text: 'Sofía: entregar wireframes de command palette', assignee: 'Sofía Hernández', dueDate: '2025-05-30', done: true },
    ],
    decisions: [
      { id: 'dec2', text: 'Priorizar payments y onboarding sobre analytics dashboard para Sprint 3', context: 'Payments unblockea revenue. Onboarding es el #1 pain point. Analytics puede esperar a Sprint 4.' },
      { id: 'dec3', text: 'Incluir spike de DB migration en Sprint 3 (3 story points)', context: 'Necesitamos saber pronto si hay que migrar de Supabase para planificar Sprint 4+.' },
    ],
    notes: 'Capacidad del equipo: 38 puntos disponibles. Se planificaron 26 puntos. Buffer de 12 puntos para bugs y soporte. Diego reduce carga de onboarding para enfocarse en Safari bug.'
  },
  {
    id: 'meet3', title: 'Sprint 2 Retrospective', type: 'retro', date: '2025-03-31', projectId: 'proj1',
    attendees: ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'],
    actionItems: [
      { id: 'ai8', text: 'Carlos: crear guideline para formato de imágenes soportadas (HEIC issue)', assignee: 'Carlos Rodríguez', dueDate: '2025-04-07', done: true },
      { id: 'ai9', text: 'María: configurar Mixpanel tracking antes de Sprint 3', assignee: 'María García', dueDate: '2025-04-03', done: true },
      { id: 'ai10', text: 'Todo el equipo: documentar decisiones técnicas en ADR format', assignee: 'Team', dueDate: '2025-04-10', done: true },
    ],
    decisions: [
      { id: 'dec4', text: 'Adoptar ADR (Architecture Decision Records) para documentar decisiones técnicas', context: 'Para evitar perder contexto. Template en Confluence/Notion.' },
      { id: 'dec5', text: 'Agregar image validation server-side (no solo client-side)', context: 'El bug de HEIC pasó porque solo validábamos client-side. Agregar sharp para server-side validation.' },
    ],
    notes: 'WHAT WENT WELL: Velocidad estable (13/13 pts), Luis se integró rápido, design system reutilizó mucho. WHAT DIDN\'T: HEIC bug took 2 days, estimación fue optimista para workspace creation. IMPROVEMENTS: Agregar format docs, image validation server-side, ADRs.'
  },
  {
    id: 'meet4', title: 'Product Strategy - Q3 Roadmap Review', type: 'stakeholder', date: '2025-05-28', projectId: 'proj1',
    attendees: ['t1', 't2'],
    actionItems: [
      { id: 'ai11', text: 'María: presentar roadmap Q3 a stakeholders con priorización basada en revenue impact', assignee: 'María García', dueDate: '2025-06-05', done: false },
      { id: 'ai12', text: 'María: preparar financial projection para Series Pre-Seed pitch', assignee: 'María García', dueDate: '2025-06-15', done: false },
    ],
    decisions: [
      { id: 'dec6', text: 'Priorizar features que impactan revenue: billing, onboarding, trial-to-paid conversion', context: 'Runway limitado. Necesitamos revenue ASAP. Features de engagement y analytics son Q4.' },
      { id: 'dec7', text: 'Target: 50 paying customers y $5K MRR antes de buscar funding', context: 'Evidence de willingness-to-pay es más importante que DAU para inversionistas en esta etapa.' },
    ],
    notes: 'Discusión estratégica sobre dirección del producto. Acordado priorizar monetización y activación en Q3. Analytics y real-time features para Q4. Mobile app se pospone a Q1 2026. María preparará pitch para potential investors si metrics son positivas.'
  },
]

export const MOCK_ANALYTICS: AnalyticsData = {
  dailyActiveUsers: [
    { date: '2025-05-01', value: 180 }, { date: '2025-05-05', value: 210 }, { date: '2025-05-10', value: 245 },
    { date: '2025-05-15', value: 278 }, { date: '2025-05-20', value: 310 }, { date: '2025-05-25', value: 342 },
    { date: '2025-05-30', value: 368 }, { date: '2025-06-01', value: 390 }, { date: '2025-06-03', value: 412 },
  ],
  featureUsage: [
    { feature: 'Dashboard', users: 320, sessions: 1850, trend: 12 },
    { feature: 'Task Board', users: 280, sessions: 2400, trend: 8 },
    { feature: 'Team Chat', users: 150, sessions: 900, trend: 22 },
    { feature: 'Reports', users: 95, sessions: 420, trend: -3 },
    { feature: 'Settings', users: 200, sessions: 350, trend: 5 },
    { feature: 'API Keys', users: 45, sessions: 120, trend: 35 },
  ],
  conversionFunnel: [
    { stage: 'Visit Landing', value: 12000, rate: 100 },
    { stage: 'Sign Up', value: 2400, rate: 20 },
    { stage: 'Complete Onboarding', value: 1320, rate: 55 },
    { stage: 'First Project Created', value: 792, rate: 60 },
    { stage: 'Invite Team', value: 475, rate: 60 },
    { stage: 'Convert to Paid', value: 95, rate: 20 },
  ],
  retentionCohorts: [
    { cohort: '2025-01', day0: 100, day7: 65, day14: 48, day30: 32 },
    { cohort: '2025-02', day0: 120, day7: 72, day14: 55, day30: 38 },
    { cohort: '2025-03', day0: 150, day7: 82, day14: 62, day30: 45 },
    { cohort: '2025-04', day0: 200, day7: 95, day14: 70, day30: 52 },
    { cohort: '2025-05', day0: 250, day7: 110, day14: 78, day30: 0 },
  ],
  npsScore: { score: 72, trend: 8, responses: 156 },
  errorRates: [
    { date: '2025-05-01', value: 0.5, p95: 2.1 }, { date: '2025-05-10', value: 0.8, p95: 3.4 },
    { date: '2025-05-20', value: 1.2, p95: 5.6 }, { date: '2025-05-25', value: 0.3, p95: 1.8 },
    { date: '2025-05-30', value: 0.4, p95: 2.2 },
  ],
  revenueMetrics: { mrr: 12500, arr: 150000, churn: 2.3, ltv: 480, cac: 120 },
}

// ============================================================
// STORE - Zustand store with actions
// ============================================================

interface PMState {
  // Data
  projects: Project[]
  tasks: Task[]
  team: TeamMember[]
  sprints: Sprint[]
  roadmap: RoadmapItem[]
  prds: PRDDocument[]
  techStack: TechStackItem[]
  costs: CostItem[]
  startupPrograms: StartupProgram[]
  risks: Risk[]
  meetings: MeetingNote[]
  analytics: AnalyticsData

  // UI State
  activeView: string
  selectedProjectId: string | null
  selectedTaskId: string | null
  selectedSprintId: string | null
  sidebarOpen: boolean
  commandPaletteOpen: boolean

  // Actions
  setActiveView: (view: string) => void
  setSelectedProjectId: (id: string | null) => void
  setSelectedTaskId: (id: string | null) => void
  setSelectedSprintId: (id: string | null) => void
  toggleSidebar: () => void
  setCommandPaletteOpen: (open: boolean) => void

  // CRUD Actions
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void

  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  moveTaskToStatus: (id: string, status: TaskStatus) => void

  addPRD: (prd: PRDDocument) => void
  updatePRD: (id: string, updates: Partial<PRDDocument>) => void

  addRisk: (risk: Risk) => void
  updateRisk: (id: string, updates: Partial<Risk>) => void

  addMeeting: (meeting: MeetingNote) => void

  // Helpers
  getProjectById: (id: string) => Project | undefined
  getTaskById: (id: string) => Task | undefined
  getTeamMemberById: (id: string) => TeamMember | undefined
  getTasksByProject: (projectId: string) => Task[]
  getTasksBySprint: (sprintId: string) => Task[]
  getTasksByStatus: (status: TaskStatus) => Task[]
}

export const usePMStore = create<PMState>((set, get) => ({
  // Data
  projects: MOCK_PROJECTS,
  tasks: MOCK_TASKS,
  team: MOCK_TEAM,
  sprints: MOCK_SPRINTS,
  roadmap: MOCK_ROADMAP,
  prds: MOCK_PRDS,
  techStack: MOCK_TECH_STACK,
  costs: MOCK_COSTS,
  startupPrograms: MOCK_STARTUP_PROGRAMS,
  risks: MOCK_RISKS,
  meetings: MOCK_MEETINGS,
  analytics: MOCK_ANALYTICS,

  // UI State
  activeView: 'dashboard',
  selectedProjectId: null,
  selectedTaskId: null,
  selectedSprintId: null,
  sidebarOpen: true,
  commandPaletteOpen: false,

  // Actions
  setActiveView: (view) => set({ activeView: view }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setSelectedSprintId: (id) => set({ selectedSprintId: id }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  // Project CRUD
  addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
  updateProject: (id, updates) => set((s) => ({
    projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
  })),
  deleteProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

  // Task CRUD
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTask: (id, updates) => set((s) => ({
    tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
  })),
  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
  moveTaskToStatus: (id, status) => set((s) => ({
    tasks: s.tasks.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t))
  })),

  // PRD CRUD
  addPRD: (prd) => set((s) => ({ prds: [...s.prds, prd] })),
  updatePRD: (id, updates) => set((s) => ({
    prds: s.prds.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
  })),

  // Risk CRUD
  addRisk: (risk) => set((s) => ({ risks: [...s.risks, risk] })),
  updateRisk: (id, updates) => set((s) => ({
    risks: s.risks.map((r) => (r.id === id ? { ...r, ...updates } : r))
  })),

  // Meeting
  addMeeting: (meeting) => set((s) => ({ meetings: [...s.meetings, meeting] })),

  // Helpers
  getProjectById: (id) => get().projects.find((p) => p.id === id),
  getTaskById: (id) => get().tasks.find((t) => t.id === id),
  getTeamMemberById: (id) => get().team.find((m) => m.id === id),
  getTasksByProject: (projectId) => get().tasks.filter((t) => t.projectId === projectId),
  getTasksBySprint: (sprintId) => get().tasks.filter((t) => t.sprintId === sprintId),
  getTasksByStatus: (status) => get().tasks.filter((t) => t.status === status),
}))
