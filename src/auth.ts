// Auth layer. Client-only demo: credentials are seeded from PEOPLE and lived in
// localStorage. Replace `authProvider` with a real backend-backed impl later —
// the interface is intentionally small so `login` / `logout` / `getCurrentUser`
// can map to an API client without touching the views.
import { PEOPLE } from './data';

export type Role = 'exec' | 'manager' | 'member';

export interface User {
  id: string;        // maps to PEOPLE.id
  username: string;
  name: string;
  role: Role;
  dept: string;
  team?: string[];   // peer ids a manager is responsible for
}

export interface AuthProvider {
  login(username: string, password: string): Promise<User | null>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

// Seed user directory. Username = first-name lowercased. Password = "demo".
// Roles assigned deliberately so each case is exercised in the UI.
export const DEMO_USERS: Record<string, { password: string; user: User }> = (() => {
  const roleByPerson: Record<string, Role> = {
    p1: 'member',   // Andrea — Grid engineer
    p2: 'member',   // Marco — Residential
    p3: 'member',   // Lucía — Harvey IA
    p4: 'manager',  // Diego — Solar field lead
    p5: 'exec',     // Sofía — PM, serves as the exec account in the demo
    p6: 'member',   // Rafael — Grid
    p7: 'manager',  // Valentina — ML lead
    p8: 'member',   // Iván — Solar civil
    p9: 'member',   // Carla — Ops
  };
  const map: Record<string, { password: string; user: User }> = {};
  for (const p of PEOPLE) {
    const first = p.name.split(' ')[0].toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // strip accents
    const role = roleByPerson[p.id] || 'member';
    map[first] = {
      password: 'demo',
      user: {
        id: p.id,
        username: first,
        name: p.name,
        role,
        dept: p.dept,
        team: PEOPLE.filter(x => x.dept === p.dept).map(x => x.id),
      },
    };
  }
  return map;
})();

export const localStorageAuthProvider: AuthProvider = {
  async login(username, password) {
    const key = username.trim().toLowerCase();
    const entry = DEMO_USERS[key];
    if (!entry || entry.password !== password) return null;
    return entry.user;
  },
  async logout() { /* noop in demo; real impl would revoke token */ },
  async getCurrentUser() { return null; /* session lives in the app store */ },
};

// The one used across the app. Swap this line to wire a real backend.
export const authProvider: AuthProvider = localStorageAuthProvider;

// Role-gated visibility helpers — keep them pure so they're trivial to test.
export function canSeeProject(user: User, project: { dept: string; team: string[]; owner: string }): boolean {
  if (user.role === 'exec') return true;
  if (project.owner === user.id) return true;
  if (project.team.includes(user.id)) return true;
  if (user.role === 'manager' && project.dept === user.dept) return true;
  return false;
}

export function canSeeTask(
  user: User,
  task: { owner: string; proj: string },
  projects: { id: string; dept: string; team: string[]; owner: string }[],
): boolean {
  if (user.role === 'exec') return true;
  if (task.owner === user.id) return true;
  const proj = projects.find(p => p.id === task.proj);
  if (!proj) return false;
  return canSeeProject(user, proj);
}

export function roleCanAccessView(role: Role, view: string): boolean {
  // Views that exec/manager only should see.
  if (view === 'exec' || view === 'capacity') return role !== 'member';
  return true;
}
