// Tiny i18n layer. Dictionary maps keys to { en, es }. Missing keys fall back
// to the key itself (dev aid).
import { useAppState } from './store';

export type Lang = 'en' | 'es';

const DICT: Record<string, { en: string; es: string }> = {
  // Nav / rail / topbar
  'nav.today':           { en: 'Today',            es: 'Hoy' },
  'nav.inbox':           { en: 'Inbox',            es: 'Entrada' },
  'nav.projects':        { en: 'Projects',         es: 'Proyectos' },
  'nav.kanban':          { en: 'Board',            es: 'Tablero' },
  'nav.roadmap':         { en: 'Roadmap',          es: 'Hoja de ruta' },
  'nav.table':           { en: 'Table',            es: 'Tabla' },
  'nav.calendar':        { en: 'Calendar',         es: 'Calendario' },
  'nav.capacity':        { en: 'Capacity',         es: 'Capacidad' },
  'nav.exec':            { en: 'Exec status',      es: 'Dirección' },
  'nav.list':            { en: 'List',             es: 'Lista' },
  'topbar.search':       { en: 'Search or run a command…', es: 'Buscar o ejecutar…' },
  'topbar.new':          { en: 'New',              es: 'Nuevo' },
  'topbar.new.task':     { en: 'New task',         es: 'Nueva tarea' },
  'topbar.new.project':  { en: 'New project',      es: 'Nuevo proyecto' },
  'topbar.notifications':{ en: 'Notifications',    es: 'Notificaciones' },
  'topbar.openInbox':    { en: 'Open inbox →',     es: 'Abrir bandeja →' },
  'topbar.markAllRead':  { en: 'Mark all read',    es: 'Marcar todo leído' },

  // Generic
  'common.cancel':       { en: 'Cancel',           es: 'Cancelar' },
  'common.save':         { en: 'Save',             es: 'Guardar' },
  'common.create':       { en: 'Create',           es: 'Crear' },
  'common.add':          { en: 'Add',              es: 'Añadir' },
  'common.close':        { en: 'Close',            es: 'Cerrar' },
  'common.all':          { en: 'All',              es: 'Todos' },
  'common.none':         { en: 'None',             es: 'Ninguno' },
  'common.filter':       { en: 'Filter',           es: 'Filtrar' },
  'common.group':        { en: 'Group',            es: 'Agrupar' },
  'common.new':          { en: 'New',              es: 'Nuevo' },
  'common.search':       { en: 'Search',           es: 'Buscar' },
  'common.today':        { en: 'today',            es: 'hoy' },
  'common.overdue':      { en: 'Overdue',          es: 'Atrasado' },
  'common.due':          { en: 'Due',              es: 'Vence' },
  'common.start':        { en: 'Start',            es: 'Inicio' },
  'common.deadline':     { en: 'Deadline',         es: 'Límite' },
  'common.owner':        { en: 'Owner',            es: 'Responsable' },
  'common.priority':     { en: 'Priority',         es: 'Prioridad' },
  'common.status':       { en: 'Status',           es: 'Estado' },
  'common.project':      { en: 'Project',          es: 'Proyecto' },
  'common.title':        { en: 'Title',            es: 'Título' },
  'common.loading':      { en: 'Loading…',         es: 'Cargando…' },
  'common.logout':       { en: 'Log out',          es: 'Cerrar sesión' },
  'common.settings':     { en: 'Settings',         es: 'Ajustes' },

  // Priority labels
  'prio.urgent':         { en: 'Urgent',           es: 'Urgente' },
  'prio.high':           { en: 'High',             es: 'Alta' },
  'prio.med':            { en: 'Med',              es: 'Media' },
  'prio.low':            { en: 'Low',              es: 'Baja' },
  'prio.allPriorities':  { en: 'All priorities',   es: 'Todas las prioridades' },

  // Status labels
  'status.todo':         { en: 'To do',            es: 'Por hacer' },
  'status.in-progress':  { en: 'In progress',      es: 'En curso' },
  'status.review':       { en: 'In review',        es: 'En revisión' },
  'status.blocked':      { en: 'Blocked',          es: 'Bloqueada' },
  'status.done':         { en: 'Done',             es: 'Hecha' },
  'status.planning':     { en: 'Planning',         es: 'Planeación' },
  'status.active':       { en: 'Active',           es: 'Activo' },
  'status.at-risk':      { en: 'At risk',          es: 'En riesgo' },
  'status.shipped':      { en: 'Shipped',          es: 'Entregado' },
  'status.on-track':     { en: 'On track',         es: 'En curso' },

  // Today view
  'today.protectFocus':  { en: 'Protect focus',    es: 'Proteger foco' },
  'today.focusOn':       { en: 'Focus mode on',    es: 'Modo foco activo' },
  'today.addBlock':      { en: 'Add block',        es: 'Añadir bloque' },
  'today.pullMore':      { en: 'Pull more',        es: 'Traer más' },
  'today.pulled':        { en: 'Today · pulled',   es: 'Hoy · seleccionadas' },
  'today.enterFocus':    { en: 'Enter deep focus', es: 'Entrar en foco profundo' },
  'today.leaveFocus':    { en: 'Leave focus',      es: 'Salir del foco' },
  'today.openDoc':       { en: 'Open doc',         es: 'Abrir documento' },
  'today.seeAll':        { en: 'See all',          es: 'Ver todo' },
  'today.escalate':      { en: 'Escalate',         es: 'Escalar' },
  'today.routeLegal':    { en: 'Route to legal',   es: 'Enviar a legal' },
  'today.review':        { en: 'Review',           es: 'Revisar' },
  'today.handled':       { en: 'Handled',          es: 'Atendido' },
  'today.risks':         { en: 'Risk stream',      es: 'Riesgos' },
  'today.okrs':          { en: 'Company OKRs',     es: 'OKRs' },
  'today.inboxMini':     { en: 'Inbox',            es: 'Entrada' },
  'today.greetingMorning':{en: 'Good morning',     es: 'Buenos días' },
  'today.greetingAfternoon':{en:'Good afternoon',  es: 'Buenas tardes' },
  'today.greetingEvening':{ en:'Good evening',     es: 'Buenas noches' },
  'today.statsActive':   { en: 'projects active',  es: 'proyectos activos' },
  'today.statsOpen':     { en: 'tasks open',       es: 'tareas abiertas' },
  'today.statsAtRisk':   { en: 'at risk',          es: 'en riesgo' },
  'today.statsBlocked':  { en: 'blocked',          es: 'bloqueado' },

  // Project view
  'project.copyLink':    { en: 'Copy link',        es: 'Copiar enlace' },
  'project.copied':      { en: 'Copied!',          es: '¡Copiado!' },
  'project.specDoc':     { en: 'Spec doc',         es: 'Especificación' },
  'project.newTask':     { en: 'New task',         es: 'Nueva tarea' },
  'project.allTasks':    { en: 'All tasks',        es: 'Todas las tareas' },
  'project.tabs.overview':{ en:'overview',         es: 'resumen' },
  'project.tabs.tasks':  { en: 'tasks',            es: 'tareas' },
  'project.tabs.timeline':{en: 'timeline',         es: 'cronograma' },
  'project.tabs.docs':   { en: 'docs',             es: 'documentos' },
  'project.tabs.activity':{en: 'activity',         es: 'actividad' },
  'project.team':        { en: 'Team',             es: 'Equipo' },
  'project.deps':        { en: 'Dependencies',     es: 'Dependencias' },
  'project.noDeps':      { en: 'No dependencies tracked.', es: 'Sin dependencias registradas.' },
  'project.time':        { en: 'Time tracking',    es: 'Tiempo' },
  'project.loggedSprint':{ en: 'logged this sprint', es: 'registradas en el sprint' },
  'project.okrs':        { en: 'Milestones & KRs', es: 'Hitos y KRs' },
  'project.blockers':    { en: 'Blockers',         es: 'Bloqueadores' },
  'project.noAccess':    { en: 'You don’t have access to this project.', es: 'No tienes acceso a este proyecto.' },
  'project.noMatch':     { en: 'No tasks match the current filter.', es: 'Ninguna tarea coincide con el filtro.' },

  // Roadmap
  'roadmap.year':        { en: 'Year',             es: 'Año' },
  'roadmap.quarter':     { en: 'Quarter',          es: 'Trimestre' },
  'roadmap.month':       { en: 'Month',            es: 'Mes' },
  'roadmap.dept':        { en: 'Dept',             es: 'Depto' },
  'roadmap.depts':       { en: 'Departments',      es: 'Departamentos' },
  'roadmap.owners':      { en: 'Owners',           es: 'Responsables' },

  // Exec
  'exec.exportPdf':      { en: 'Export PDF',       es: 'Exportar PDF' },
  'exec.draft':          { en: 'Draft with Harvey IA',   es: 'Redactar con Harvey IA' },
  'exec.drafting':       { en: 'Drafting…',        es: 'Redactando…' },
  'exec.redraft':        { en: 'Re-draft with Harvey IA',es: 'Rehacer con Harvey IA' },
  'exec.narrative':      { en: 'Narrative',        es: 'Resumen ejecutivo' },
  'exec.activeProjects': { en: 'Active projects',  es: 'Proyectos activos' },
  'exec.avgProgress':    { en: 'Avg progress',     es: 'Progreso medio' },
  'exec.atRisk':         { en: 'At risk',          es: 'En riesgo' },
  'exec.blocked':        { en: 'Blocked',          es: 'Bloqueados' },
  'exec.perProjectHealth':{en:'Per-project health',es: 'Salud por proyecto' },

  // Settings modal
  'settings.title':      { en: 'Settings',         es: 'Ajustes' },
  'settings.language':   { en: 'Language',         es: 'Idioma' },
  'settings.notifications':{en:'Notifications',    es: 'Notificaciones' },
  'settings.dailyDigest':{ en: 'Daily digest email',es:'Resumen diario por correo' },
  'settings.protectFocus':{en:'Protect focus blocks', es: 'Proteger bloques de foco' },
  'settings.resetData':  { en: 'Reset local data', es: 'Restablecer datos' },
  'settings.resetConfirm':{en:'Discard local changes and reseed?', es: '¿Descartar cambios y recargar datos?' },

  // Login
  'login.title':         { en: 'Sign in to Krill', es: 'Acceder a Krill' },
  'login.subtitle':      { en: 'Internal planner · use your team credentials', es: 'Planner interno · usa tus credenciales' },
  'login.username':      { en: 'Username',         es: 'Usuario' },
  'login.password':      { en: 'Password',         es: 'Contraseña' },
  'login.submit':        { en: 'Sign in',          es: 'Entrar' },
  'login.error':         { en: 'Invalid username or password.', es: 'Usuario o contraseña incorrectos.' },
  'login.demoHint':      { en: 'Demo · any password is "demo"', es: 'Demo · la contraseña es "demo"' },

  // Roles
  'role.exec':           { en: 'Executive',        es: 'Dirección' },
  'role.manager':        { en: 'Manager',          es: 'Gerencia' },
  'role.member':         { en: 'Member',           es: 'Colaborador' },

  // Kanban
  'kanban.title':        { en: 'Board',            es: 'Tablero' },
  'kanban.sprint':       { en: 'Sprint 16 · Apr 14–28', es: 'Sprint 16 · 14–28 abr' },

  // Calendar
  'calendar.title':      { en: 'Calendar',         es: 'Calendario' },
  'calendar.prev':       { en: 'Prev',             es: 'Anterior' },
  'calendar.next':       { en: 'Next',             es: 'Siguiente' },
  'calendar.month':      { en: 'Month',            es: 'Mes' },

  // New task modal
  'newTask.title':       { en: 'New task',         es: 'Nueva tarea' },
  'newTask.titlePh':     { en: 'What needs doing?',es: '¿Qué hay que hacer?' },
  'newTask.create':      { en: 'Create task',      es: 'Crear tarea' },
  'newProject.title':    { en: 'New project',      es: 'Nuevo proyecto' },
  'newProject.namePh':   { en: 'Project name',     es: 'Nombre del proyecto' },
  'newProject.create':   { en: 'Create project',   es: 'Crear proyecto' },
  'newProject.dept':     { en: 'Department',       es: 'Departamento' },

  // Inbox
  'inbox.title':         { en: 'Inbox',            es: 'Bandeja' },
  'inbox.empty':         { en: 'No notifications.',es: 'Sin notificaciones.' },
  'inbox.system':        { en: 'System',           es: 'Sistema' },

  // Capacity
  'capacity.title':      { en: 'Capacity',         es: 'Capacidad' },
  'capacity.weekOf':     { en: 'Week of Apr 14',   es: 'Semana del 14 abr' },
  'capacity.teamLoad':   { en: 'Team · load by project', es: 'Equipo · carga por proyecto' },
  'capacity.fullTime':   { en: '100% = full-time', es: '100% = jornada completa' },
  'capacity.overloaded': { en: 'Overloaded',       es: 'Sobrecargados' },
  'capacity.underbooked':{ en: 'Underbooked · can take work', es: 'Disponibles · pueden tomar trabajo' },

  // Exec extras
  'exec.weekLabel':      { en: 'Week 16 · for leadership', es: 'Semana 16 · para dirección' },
  'exec.title':          { en: 'Exec status',      es: 'Estado directivo' },
  'exec.draftingNote':   { en: 'Harvey IA is drafting an updated narrative…', es: 'Harvey IA está redactando un resumen actualizado…' },
};

export function translate(key: string, lang: Lang): string {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[lang];
}

export function useLang(): Lang {
  return useAppState(s => s.lang);
}

export function useT(): (key: string) => string {
  const lang = useLang();
  return (key: string) => translate(key, lang);
}
