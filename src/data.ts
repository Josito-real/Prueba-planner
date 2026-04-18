// ——— Sample data for Krill Energy's planner ———
// Projects are energy-sector realistic: solar, substations, grid, residential rollout, Harvey IA (their AI product).

export interface Person {
  id: string;
  name: string;
  role: string;
  init: string;
  load: number;
  dept: string;
}

export type ProjectStatus = 'planning' | 'active' | 'at-risk' | 'blocked' | 'shipped';
export type Health = 'on-track' | 'at-risk' | 'blocked' | 'shipped';

export interface Project {
  id: string;
  code: string;
  name: string;
  owner: string;
  dept: string;
  status: ProjectStatus;
  health: Health;
  progress: number;
  q: string;
  start: string;
  end: string;
  summary: string;
  glyph: string;
  hue: number;
  okrs: string[];
  team: string[];
  blockers?: string[];
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'blocked' | 'done';
export type Priority = 'urgent' | 'high' | 'med' | 'low';

export interface Task {
  id: string;
  proj: string;
  title: string;
  owner: string;
  status: TaskStatus;
  prio: Priority;
  start?: string;   // ISO date (yyyy-mm-dd) — when work should begin
  due: string;      // target completion date
  deadline?: string;// hard deadline; overdue if today > deadline
  est: number;
  tags: string[];
}

export type DepKind = 'blocks' | 'feeds' | 'enables';
export interface Dep {
  from: string;
  to: string;
  kind: DepKind;
  note: string;
}

export interface TodayBlock {
  t: number;
  d: number;
  kind: 'ritual' | 'focus' | 'meeting' | 'break' | 'review';
  label: string;
  proj?: string;
  people?: string[];
}

export interface Notification {
  id: string;
  t: string;
  who: string;
  text: string;
  what: string;
}

export interface Quarter {
  id: string;
  label: string;
  months: string[];
}

export interface Okr {
  id: string;
  title: string;
  owner: string;
  progress: number;
  krs: number;
}

export interface Accent {
  label: string;
  c: string;
  c2: string;
}

export const PEOPLE: Person[] = [
  { id:'p1', name:'Andrea Salas',      role:'Lead Engineer',     init:'AS', load:92, dept:'Grid' },
  { id:'p2', name:'Marco Rivas',       role:'Electrical Eng.',   init:'MR', load:78, dept:'Residential' },
  { id:'p3', name:'Lucía Ortega',      role:'Data Engineer',     init:'LO', load:64, dept:'Harvey IA' },
  { id:'p4', name:'Diego Pineda',      role:'Field Lead',        init:'DP', load:105,dept:'Solar' },
  { id:'p5', name:'Sofía Benítez',     role:'Project Manager',   init:'SB', load:71, dept:'Ops' },
  { id:'p6', name:'Rafael Cárdenas',   role:'Control Systems',   init:'RC', load:55, dept:'Grid' },
  { id:'p7', name:'Valentina Méndez',  role:'ML Engineer',       init:'VM', load:82, dept:'Harvey IA' },
  { id:'p8', name:'Iván Peralta',      role:'Civil Engineer',    init:'IP', load:48, dept:'Solar' },
  { id:'p9', name:'Carla Núñez',       role:'Analyst',           init:'CN', load:66, dept:'Ops' },
];

// status: planning | active | at-risk | blocked | shipped
export const PROJECTS: Project[] = [
  {
    id:'PRJ-01', code:'SOL-14', name:'Valencia Solar Farm · Phase II',
    owner:'p4', dept:'Solar', status:'active', health:'on-track',
    progress:62, q:'Q2–Q3', start:'2026-02-10', end:'2026-09-30',
    summary:'Expand Valencia array by 48 MW; tie-in to regional substation SE-07.',
    glyph:'◐', hue:215,
    okrs:['Q2: 50% installation complete','Q3: commissioning + handoff'],
    team:['p4','p8','p1','p5'],
  },
  {
    id:'PRJ-02', code:'HAR-03', name:'Harvey IA · Load Forecaster v2',
    owner:'p7', dept:'Harvey IA', status:'active', health:'at-risk',
    progress:44, q:'Q2', start:'2026-03-01', end:'2026-06-28',
    summary:'Second-gen residential demand forecaster. Lower MAPE, hourly resolution.',
    glyph:'◑', hue:190,
    okrs:['Q2: MAPE < 6% on pilot cohort','Q2: shadow deploy across 3 circuits'],
    team:['p7','p3','p9'],
  },
  {
    id:'PRJ-03', code:'GRD-22', name:'Substation SE-07 Retrofit',
    owner:'p1', dept:'Grid', status:'at-risk', health:'at-risk',
    progress:31, q:'Q2', start:'2026-01-20', end:'2026-06-15',
    summary:'Replace legacy protection relays, add SCADA telemetry.',
    glyph:'◓', hue:225,
    okrs:['Q2: cutover window held','Q2: zero unplanned outages'],
    team:['p1','p6','p5'],
    blockers:['Waiting on ABB relay shipment — ETA slipped 3 weeks'],
  },
  {
    id:'PRJ-04', code:'RES-09', name:'Residential Rollout · Maracaibo',
    owner:'p2', dept:'Residential', status:'active', health:'on-track',
    progress:78, q:'Q1–Q2', start:'2026-01-05', end:'2026-05-20',
    summary:'Smart-meter install across 4,200 households in three boroughs.',
    glyph:'◒', hue:200,
    okrs:['Q2: 4,000 meters active','Q2: self-serve portal launch'],
    team:['p2','p9','p5'],
  },
  {
    id:'PRJ-05', code:'HAR-04', name:'Harvey IA · Outage Triage Assistant',
    owner:'p3', dept:'Harvey IA', status:'planning', health:'on-track',
    progress:8, q:'Q3', start:'2026-06-01', end:'2026-10-15',
    summary:'LLM-backed triage for field crews; integrates with SCADA + CRM.',
    glyph:'◐', hue:195,
    okrs:['Q3: private beta with 2 crews','Q4: 30% MTTR reduction'],
    team:['p3','p7','p1'],
  },
  {
    id:'PRJ-06', code:'GRD-25', name:'Grid Frequency Monitor Network',
    owner:'p6', dept:'Grid', status:'blocked', health:'blocked',
    progress:22, q:'Q2', start:'2026-02-15', end:'2026-07-30',
    summary:'Deploy 40 PMU sensors across west corridor.',
    glyph:'◓', hue:220,
    okrs:['Q2: 20 sensors live','Q3: data pipeline to Harvey IA'],
    team:['p6','p1','p3'],
    blockers:['Customs clearance held 8 weeks on PMU shipment'],
  },
];

// tasks
export const TASKS: Task[] = [
  { id:'T-301', proj:'PRJ-01', title:'Inverter bank commissioning — string 14–22', owner:'p4', status:'in-progress', prio:'high',  start:'2026-04-15', due:'2026-04-22', deadline:'2026-04-25', est:8, tags:['field'] },
  { id:'T-302', proj:'PRJ-01', title:'Update as-built drawings with revision C',   owner:'p8', status:'todo',        prio:'med',   start:'2026-04-20', due:'2026-04-24', deadline:'2026-04-30', est:3, tags:['docs'] },
  { id:'T-303', proj:'PRJ-02', title:'Retrain forecaster on Q1 2026 residential dataset', owner:'p7', status:'in-progress', prio:'high', start:'2026-04-12', due:'2026-04-19', deadline:'2026-04-22', est:5, tags:['ml'] },
  { id:'T-304', proj:'PRJ-02', title:'Review MAPE regression on cohort B',         owner:'p3', status:'review',      prio:'high',  start:'2026-04-14', due:'2026-04-18', deadline:'2026-04-18', est:2, tags:['ml','review'] },
  { id:'T-305', proj:'PRJ-03', title:'Draft cutover runbook v3',                   owner:'p1', status:'todo',        prio:'high',  start:'2026-04-16', due:'2026-04-25', deadline:'2026-04-28', est:6, tags:['ops'] },
  { id:'T-306', proj:'PRJ-03', title:'Escalate ABB shipment with procurement',     owner:'p5', status:'blocked',     prio:'urgent',start:'2026-04-10', due:'2026-04-18', deadline:'2026-04-18', est:1, tags:['blocker'] },
  { id:'T-307', proj:'PRJ-04', title:'Portal: outage notification copy review',    owner:'p9', status:'review',      prio:'med',   start:'2026-04-14', due:'2026-04-20', deadline:'2026-04-24', est:2, tags:['copy'] },
  { id:'T-308', proj:'PRJ-04', title:'Door-to-door schedule — Zone 3B',            owner:'p2', status:'in-progress', prio:'med',   start:'2026-04-17', due:'2026-04-23', deadline:'2026-04-30', est:4, tags:['field'] },
  { id:'T-309', proj:'PRJ-05', title:'Spec: SCADA event ingestion format',         owner:'p3', status:'in-progress', prio:'med',   start:'2026-04-15', due:'2026-04-26', deadline:'2026-05-05', est:3, tags:['spec'] },
  { id:'T-310', proj:'PRJ-06', title:'PMU mounting plan — pole survey',            owner:'p6', status:'todo',        prio:'low',   start:'2026-04-22', due:'2026-05-02', deadline:'2026-05-10', est:4, tags:['field'] },
  { id:'T-311', proj:'PRJ-01', title:'Arc-flash study sign-off',                   owner:'p1', status:'review',      prio:'high',  start:'2026-04-12', due:'2026-04-19', deadline:'2026-04-21', est:2, tags:['safety'] },
  { id:'T-312', proj:'PRJ-02', title:'Feature flag: shadow-mode toggle',           owner:'p7', status:'done',        prio:'med',   start:'2026-04-10', due:'2026-04-15', deadline:'2026-04-18', est:1, tags:['ml'] },
];

// cross-project dependencies (source → target). drawn as threads on roadmap.
export const DEPS: Dep[] = [
  { from:'PRJ-03', to:'PRJ-01', kind:'blocks',   note:'SE-07 must energize before Valencia tie-in' },
  { from:'PRJ-06', to:'PRJ-02', kind:'feeds',    note:'PMU data stream feeds forecaster v2' },
  { from:'PRJ-02', to:'PRJ-05', kind:'enables',  note:'Triage assistant reuses forecaster models' },
  { from:'PRJ-04', to:'PRJ-02', kind:'feeds',    note:'Smart-meter telemetry trains cohort B' },
];

// today / agenda for hero "My Work"
export const ME = 'p1'; // Andrea Salas — lead engineer
export const TODAY = {
  date:'2026-04-17', // Friday
  focus:{ start:9.0, end:11.5, label:'Cutover runbook — deep focus' },
  blocks: [
    { t:7.5,  d:0.5, kind:'ritual',  label:'Morning walk + planning' },
    { t:9.0,  d:2.5, kind:'focus',   label:'Runbook v3 — SE-07 cutover', proj:'PRJ-03' },
    { t:11.5, d:0.5, kind:'meeting', label:'Daily standup — Grid',        people:['p1','p6','p5'] },
    { t:12.0, d:0.75,kind:'break',   label:'Lunch' },
    { t:13.0, d:1.0, kind:'meeting', label:'Harvey IA × Grid sync',        people:['p1','p7','p3'] },
    { t:14.0, d:2.5, kind:'focus',   label:'Arc-flash study review',       proj:'PRJ-01' },
    { t:16.5, d:0.75,kind:'review',  label:'1:1 with Sofía',                people:['p1','p5'] },
    { t:17.25,d:0.75,kind:'meeting', label:'Exec status — Q2 outlook',      people:['p1','p5','p7'] },
  ] as TodayBlock[],
  pull:[ 'T-305','T-311','T-306' ], // pulled into today
};

export const NOTIFICATIONS: Notification[] = [
  { id:'n1', t:'8m',   who:'p5', text:'pulled you into',    what:'Exec status — Q2 outlook' },
  { id:'n2', t:'21m',  who:'p7', text:'asked for review on',what:'Retrain forecaster on Q1 data' },
  { id:'n3', t:'1h',   who:'p4', text:'updated status on',  what:'Valencia Solar · Phase II' },
  { id:'n4', t:'2h',   who:'sys',text:'flagged risk on',    what:'SE-07 Retrofit (ABB shipment)' },
  { id:'n5', t:'y’day',who:'p3', text:'shipped',             what:'Feature flag: shadow-mode' },
];

// quarters for roadmap
export const QUARTERS: Quarter[] = [
  { id:'Q1', label:'Q1 ’26', months:['Jan','Feb','Mar'] },
  { id:'Q2', label:'Q2 ’26', months:['Apr','May','Jun'] },
  { id:'Q3', label:'Q3 ’26', months:['Jul','Aug','Sep'] },
  { id:'Q4', label:'Q4 ’26', months:['Oct','Nov','Dec'] },
];

// OKRs — company level
export const OKRS: Okr[] = [
  { id:'O1', title:'Ship Harvey IA v2 to production',   owner:'p7', progress:48, krs:3 },
  { id:'O2', title:'Zero unplanned grid outages in west corridor', owner:'p1', progress:71, krs:2 },
  { id:'O3', title:'50 MW new solar capacity online',   owner:'p4', progress:62, krs:2 },
  { id:'O4', title:'100k residential smart-meters live',owner:'p2', progress:58, krs:4 },
];

export const STATUS_META: Record<string, { label: string; dot: string }> = {
  'planning':   { label:'Planning',   dot:'var(--ink-4)' },
  'active':     { label:'Active',     dot:'var(--accent)' },
  'at-risk':    { label:'At risk',    dot:'var(--warn)' },
  'blocked':    { label:'Blocked',    dot:'var(--risk)' },
  'shipped':    { label:'Shipped',    dot:'var(--ok)' },
  'on-track':   { label:'On track',   dot:'var(--ok)' },
};

export const PRIO_META: Record<Priority, { label: string; c: string }> = {
  urgent:{label:'Urgent',c:'var(--risk)'},
  high:  {label:'High',  c:'var(--warn)'},
  med:   {label:'Med',   c:'var(--ink-3)'},
  low:   {label:'Low',   c:'var(--ink-4)'},
};

export const TASK_STATUS_META: Record<TaskStatus, { label: string; c: string }> = {
  todo:       { label:'To do',       c:'var(--ink-4)' },
  'in-progress':{ label:'In progress', c:'var(--accent)' },
  review:     { label:'In review',   c:'#7a52c0' },
  blocked:    { label:'Blocked',     c:'var(--risk)' },
  done:       { label:'Done',        c:'var(--ok)' },
};

// accent presets for Tweaks
export const ACCENTS: Record<string, Accent> = {
  electric: { label:'Electric',  c:'#1E5BEF', c2:'#4FD0E7' },
  cyan:     { label:'Cyan',      c:'#0EA5B7', c2:'#7BE3D9' },
  navy:     { label:'Deep navy', c:'#0F2A6B', c2:'#5E80C8' },
  amber:    { label:'Amber',     c:'#B4791E', c2:'#EBC46B' },
  graphite: { label:'Graphite',  c:'#2F3949', c2:'#8A93A6' },
};
