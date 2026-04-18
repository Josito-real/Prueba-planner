// Global app state backed by localStorage.
// Seed data comes from data.ts on first load; subsequent loads restore user mutations.
import { useSyncExternalStore } from 'react';
import {
  NOTIFICATIONS, PROJECTS, TASKS, TODAY,
  type Notification, type Priority, type Project, type Task, type TaskStatus, type TodayBlock,
} from './data';

export type Scale = 'year' | 'quarter' | 'month';
export type GroupBy = 'status' | 'priority' | 'project' | 'owner';

export interface Settings {
  notifications: boolean;
  dailyDigest: boolean;
  protectFocus: boolean; // keep focus blocks visible
}

export interface AppState {
  version: number;
  tasks: Task[];
  projects: Project[];
  notifications: (Notification & { read?: boolean })[];
  todayPull: string[];
  todayBlocks: TodayBlock[];
  focusMode: boolean;
  settings: Settings;
  escalated: string[];      // risk labels that were escalated
  roadmapScale: Scale;
  roadmapDepts: string[];   // hidden depts
  roadmapOwners: string[];  // hidden owner ids
  projectFilter: { prio: Priority | 'all' };
  projectGroupBy: GroupBy;
  kanbanFilter: { prio: Priority | 'all' };
  kanbanGroupBy: GroupBy;
  calendarMonthOffset: number;
  execDraft: 'idle' | 'drafting' | 'drafted';
  execNarrative: string | null;
}

const KEY = 'krill.store.v1';
const VERSION = 1;

function initial(): AppState {
  return {
    version: VERSION,
    tasks: TASKS,
    projects: PROJECTS,
    notifications: NOTIFICATIONS,
    todayPull: TODAY.pull,
    todayBlocks: [],
    focusMode: false,
    settings: { notifications: true, dailyDigest: true, protectFocus: false },
    escalated: [],
    roadmapScale: 'year',
    roadmapDepts: [],
    roadmapOwners: [],
    projectFilter: { prio: 'all' },
    projectGroupBy: 'status',
    kanbanFilter: { prio: 'all' },
    kanbanGroupBy: 'status',
    calendarMonthOffset: 0,
    execDraft: 'idle',
    execNarrative: null,
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.version === VERSION) return { ...initial(), ...parsed };
    }
  } catch { /* ignore */ }
  return initial();
}

let state: AppState = load();
const listeners = new Set<() => void>();

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

function set(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  persist();
  listeners.forEach(l => l());
}

function genTaskId() {
  const nums = state.tasks.map(t => Number(t.id.replace(/\D/g, ''))).filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 300;
  return `T-${max + 1}`;
}

function genProjectId() {
  const nums = state.projects.map(p => Number(p.id.replace(/\D/g, ''))).filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `PRJ-${String(max + 1).padStart(2, '0')}`;
}

export const actions = {
  addTask(partial: Partial<Task> & { title: string; proj: string }): string {
    const id = genTaskId();
    const today = new Date().toISOString().slice(0, 10);
    const task: Task = {
      id,
      title: partial.title,
      proj: partial.proj,
      owner: partial.owner ?? 'p1',
      status: partial.status ?? 'todo',
      prio: partial.prio ?? 'med',
      due: partial.due ?? today,
      est: partial.est ?? 2,
      tags: partial.tags ?? [],
    };
    set({ tasks: [task, ...state.tasks] });
    return id;
  },
  updateTask(id: string, patch: Partial<Task>) {
    set({ tasks: state.tasks.map(t => (t.id === id ? { ...t, ...patch } : t)) });
  },
  cycleTaskStatus(id: string) {
    const order: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];
    const t = state.tasks.find(x => x.id === id);
    if (!t) return;
    const next = order[(order.indexOf(t.status) + 1) % order.length];
    actions.updateTask(id, { status: next });
  },
  addProject(partial: { name: string; dept: string }): string {
    const id = genProjectId();
    const today = new Date().toISOString().slice(0, 10);
    const end = new Date(); end.setMonth(end.getMonth() + 3);
    const code = `NEW-${state.projects.length + 1}`;
    const project: Project = {
      id, code, name: partial.name,
      owner: 'p1', dept: partial.dept,
      status: 'planning', health: 'on-track',
      progress: 0, q: 'Q2', start: today, end: end.toISOString().slice(0, 10),
      summary: 'Newly created project.', glyph: '◐', hue: 210,
      okrs: [], team: ['p1'],
    };
    set({ projects: [...state.projects, project] });
    return id;
  },
  pullTaskIntoToday(id: string) {
    if (state.todayPull.includes(id)) return;
    set({ todayPull: [...state.todayPull, id] });
  },
  removeTaskFromToday(id: string) {
    set({ todayPull: state.todayPull.filter(x => x !== id) });
  },
  addTodayBlock(b: TodayBlock) {
    set({ todayBlocks: [...state.todayBlocks, b] });
  },
  toggleFocusMode() {
    set({ focusMode: !state.focusMode });
  },
  escalate(label: string) {
    if (state.escalated.includes(label)) return;
    set({ escalated: [...state.escalated, label] });
  },
  markAllNotificationsRead() {
    set({ notifications: state.notifications.map(n => ({ ...n, read: true })) });
  },
  dismissNotification(id: string) {
    set({ notifications: state.notifications.filter(n => n.id !== id) });
  },
  updateSettings(patch: Partial<Settings>) {
    set({ settings: { ...state.settings, ...patch } });
  },
  setRoadmapScale(s: Scale) { set({ roadmapScale: s }); },
  toggleRoadmapDept(d: string) {
    const has = state.roadmapDepts.includes(d);
    set({ roadmapDepts: has ? state.roadmapDepts.filter(x => x !== d) : [...state.roadmapDepts, d] });
  },
  toggleRoadmapOwner(o: string) {
    const has = state.roadmapOwners.includes(o);
    set({ roadmapOwners: has ? state.roadmapOwners.filter(x => x !== o) : [...state.roadmapOwners, o] });
  },
  setProjectFilter(prio: Priority | 'all') { set({ projectFilter: { prio } }); },
  setProjectGroupBy(g: GroupBy) { set({ projectGroupBy: g }); },
  setKanbanFilter(prio: Priority | 'all') { set({ kanbanFilter: { prio } }); },
  setKanbanGroupBy(g: GroupBy) { set({ kanbanGroupBy: g }); },
  shiftCalendarMonth(delta: number) { set({ calendarMonthOffset: state.calendarMonthOffset + delta }); },
  resetCalendarMonth() { set({ calendarMonthOffset: 0 }); },
  async draftExecNarrative() {
    set({ execDraft: 'drafting' });
    await new Promise(r => setTimeout(r, 1100));
    const txt = `Harvey IA drafted narrative (${new Date().toLocaleTimeString()}): Portfolio is 62% on plan. SE-07 remains the dominant schedule risk; Valencia tie-in depends on its cutover. Harvey IA v2 MAPE regression on cohort B is mitigated pending final review. Residential Maracaibo ahead of plan. Recommend surfacing ABB procurement to exec review Monday.`;
    set({ execNarrative: txt, execDraft: 'drafted' });
  },
  resetAll() {
    state = initial();
    persist();
    listeners.forEach(l => l());
  },
};

function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function useAppState<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

export function getState(): AppState { return state; }
