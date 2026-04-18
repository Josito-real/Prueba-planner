// Root app — routing + state glue.
import { useEffect, useState } from 'react';
import { ACCENTS, TASKS } from './data';
import { CommandPalette, CommandRail, NewProjectModal, NewTaskModal, SettingsModal, TopBar, type CommandAction } from './shell';
import { MobileShowcase } from './mobile';
import { TweaksPanel, type Tweaks } from './tweaks';
import { TodayClassic, TodayFocus, TodayStrip } from './views/today';
import { ProjectView } from './views/project';
import { Roadmap } from './views/roadmap';
import { CalendarView, CapacityView, ExecView, InboxView, KanbanView, ListView, TableView } from './views/other';

export function App() {
  const [tweaks, setTweaks] = useState<Tweaks>(window.__TWEAK_DEFAULTS as Tweaks);
  const [view, setView] = useState<string>('today');
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newProjOpen, setNewProjOpen] = useState(false);

  // Edit-mode handshake with host
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') setEditMode(true);
      if (d.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', onMsg);
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch {}
    return () => window.removeEventListener('message', onMsg);
  }, []);

  // Keyboard: ⌘K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(v => !v);
      } else if (e.key === 'Escape') {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Restore last view from localStorage
  useEffect(() => {
    const v = localStorage.getItem('krill.view');
    const p = localStorage.getItem('krill.project');
    if (v) setView(v);
    if (p) setActiveProject(p);
  }, []);
  useEffect(() => { localStorage.setItem('krill.view', view); }, [view]);
  useEffect(() => { if (activeProject) localStorage.setItem('krill.project', activeProject); }, [activeProject]);

  // Apply accent to root CSS vars
  useEffect(() => {
    const a = ACCENTS[tweaks.accent] || ACCENTS.electric;
    document.documentElement.style.setProperty('--accent', a.c);
    document.documentElement.style.setProperty('--accent-2', a.c2);
    document.documentElement.style.setProperty('--accent-wash', `color-mix(in oklab, ${a.c} 10%, white)`);
    // ink accent ≈ darker variant
    document.documentElement.style.setProperty('--accent-ink', `oklch(from ${a.c} 0.35 calc(c * 0.9) h)`);
    document.documentElement.dataset.density = tweaks.density;
  }, [tweaks]);

  const openProject = (id: string) => {
    setActiveProject(id);
    setView('project');
  };

  const handleAction = (i: CommandAction) => {
    if (i.kind === 'view') setView(i.id);
    else if (i.kind === 'project') openProject(i.id);
    else if (i.kind === 'task') {
      const t = TASKS.find(x => x.id === i.id);
      if (t) openProject(t.proj);
    } else if (i.kind === 'action') {
      if (i.id === 'status-exec') setView('exec');
      else if (i.id === 'new-task') setNewTaskOpen(true);
      else if (i.id === 'new-project') setNewProjOpen(true);
    }
  };

  // If mobile tweak is on, render mobile showcase instead
  if (tweaks.mobile) {
    return (
      <>
        <MobileShowcase/>
        <TweaksPanel active={editMode} tweaks={tweaks} setTweaks={setTweaks}/>
      </>
    );
  }

  let body;
  if (view === 'today') {
    const V = tweaks.heroVariant === 'classic' ? TodayClassic :
              tweaks.heroVariant === 'focus' ? TodayFocus : TodayStrip;
    body = <V openProject={openProject} setView={setView}/>;
  } else if (view === 'project' && activeProject) body = <ProjectView id={activeProject} setView={setView}/>;
  else if (view === 'roadmap') body = <Roadmap openProject={openProject}/>;
  else if (view === 'kanban') body = <KanbanView openProject={openProject}/>;
  else if (view === 'projects' || view === 'list') body = <ListView/>;
  else if (view === 'table') body = <TableView/>;
  else if (view === 'calendar') body = <CalendarView/>;
  else if (view === 'capacity') body = <CapacityView/>;
  else if (view === 'exec') body = <ExecView/>;
  else if (view === 'inbox') body = <InboxView/>;
  else body = <TodayStrip openProject={openProject}/>;

  return (
    <div style={{paddingLeft:56, minHeight:'100vh', background:'var(--paper)'}}>
      <CommandRail
        view={view} setView={setView}
        openProject={openProject} activeProject={activeProject}
        openPalette={() => setPaletteOpen(true)}
        onLogoClick={() => { setView('today'); setActiveProject(null); }}
        openSettings={() => setSettingsOpen(true)}
      />
      <TopBar view={view} activeProject={activeProject} onCmd={() => setPaletteOpen(true)} setView={setView} openProject={openProject}/>
      <main>{body}</main>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onAction={handleAction}/>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)}/>
      <NewTaskModal open={newTaskOpen} onClose={() => setNewTaskOpen(false)} defaultProject={activeProject}/>
      <NewProjectModal open={newProjOpen} onClose={() => setNewProjOpen(false)} onCreated={id => openProject(id)}/>
      <TweaksPanel active={editMode} tweaks={tweaks} setTweaks={setTweaks}/>
    </div>
  );
}
