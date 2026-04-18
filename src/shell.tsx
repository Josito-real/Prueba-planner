// App shell: command rail (novel sidebar) + topbar.
// The rail is a spine of project glyphs + section icons; hover/click expands into a full nav panel.
import { createElement, useEffect, useRef, useState, type ReactNode } from 'react';
import { PEOPLE, STATUS_META, type TaskStatus } from './data';
import { canSeeProject, canSeeTask, roleCanAccessView } from './auth';
import { useLang, useT } from './i18n';
import { Icons, KrillMark } from './icons';
import { Avatar, Btn, DateInput, Dot, Kbd, HealthOrb, Modal, Pill, Select, TextInput } from './ui';
import { actions, useAppState } from './store';

export const NAV_SECTIONS = [
  { id:'today',    tKey:'nav.today',     icon:'today' },
  { id:'inbox',    tKey:'nav.inbox',     icon:'bell' },
  { id:'roadmap',  tKey:'nav.roadmap',   icon:'gantt' },
  { id:'projects', tKey:'nav.projects',  icon:'folder' },
  { id:'kanban',   tKey:'nav.kanban',    icon:'kanban' },
  { id:'list',     tKey:'nav.list',      icon:'list' },
  { id:'calendar', tKey:'nav.calendar',  icon:'cal' },
  { id:'table',    tKey:'nav.table',     icon:'table' },
  { id:'capacity', tKey:'nav.capacity',  icon:'capacity' },
  { id:'exec',     tKey:'nav.exec',      icon:'star' },
];

type CommandRailProps = {
  view: string;
  setView: (v: string) => void;
  openProject: (id: string) => void;
  activeProject: string | null;
  openPalette: () => void;
  onLogoClick: () => void;
  openSettings: () => void;
};

export const CommandRail = ({ view, setView, openProject, activeProject, openPalette, onLogoClick, openSettings }: CommandRailProps) => {
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hover || pinned;
  const allProjects = useAppState(s => s.projects);
  const session = useAppState(s => s.session);
  const t = useT();
  // Role-filtered projects: execs see everything, others see only accessible.
  const projects = session ? allProjects.filter(p => canSeeProject(session, p)) : allProjects;
  const visibleNav = NAV_SECTIONS.filter(s => !session || roleCanAccessView(session.role, s.id));

  return (
    <>
      {/* Spine — always visible */}
      <aside
        onMouseEnter={()=>setHover(true)}
        onMouseLeave={()=>setHover(false)}
        style={{
          position:'fixed', left:0, top:0, bottom:0, width: 56, zIndex:40,
          background:'var(--navy-950)', color:'var(--navy-200)',
          display:'flex', flexDirection:'column', alignItems:'center',
          paddingTop:12, paddingBottom:12, gap:4,
          borderRight:'1px solid #0c1628',
        }}>
        <button onClick={onLogoClick} style={{background:'transparent',border:0,padding:6,cursor:'pointer',marginBottom:6}} title="Krill Planner">
          <KrillMark size={26}/>
        </button>
        <RailBtn icon="cmd" label="⌘K" onClick={openPalette}/>
        <div style={{height:8}}/>
        {visibleNav.slice(0,3).map(s=>(
          <RailBtn key={s.id} icon={s.icon} label={t(s.tKey)} active={view===s.id} onClick={()=>setView(s.id)}/>
        ))}
        <div style={{height:1, width:24, background:'#18253f', margin:'8px 0'}}/>
        {/* project glyph spine */}
        {projects.map(p => {
          const active = activeProject === p.id;
          return (
            <button key={p.id} onClick={()=>openProject(p.id)} title={`${p.code} · ${p.name}`}
              style={{
                width:32, height:32, borderRadius:8, border:0, cursor:'pointer',
                background: active ? 'color-mix(in oklab, var(--accent) 30%, transparent)' : 'transparent',
                color: active ? 'white' : 'var(--navy-300)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:16, fontFamily:'var(--font-mono)',
                position:'relative',
              }}>
              <span style={{
                width:22, height:22, borderRadius:22, display:'inline-flex',
                alignItems:'center', justifyContent:'center',
                background:`oklch(0.55 0.14 ${p.hue})`, color:'white', fontSize:12, fontWeight:600,
                boxShadow: active ? '0 0 0 2px color-mix(in oklab, var(--accent) 50%, white 20%)' : 'none',
              }}>{p.code.split('-')[0][0]}</span>
              <span style={{
                position:'absolute', right:2, top:2, width:5, height:5, borderRadius:5,
                background: STATUS_META[p.status].dot,
              }}/>
            </button>
          );
        })}
        <div style={{flex:1}}/>
        <RailBtn icon="settings" label={t('common.settings')} onClick={openSettings}/>
        {session && <Avatar id={session.id} size={26}/>}
      </aside>

      {/* Expanded panel */}
      <aside
        onMouseEnter={()=>setHover(true)}
        onMouseLeave={()=>setHover(false)}
        style={{
          position:'fixed', left:56, top:0, bottom:0,
          width: open ? 240 : 0,
          overflow:'hidden',
          background:'var(--navy-900)', color:'var(--navy-100)',
          borderRight: open ? '1px solid #0c1628' : '0',
          transition:'width .18s ease',
          zIndex:39,
          display:'flex', flexDirection:'column',
        }}>
        <div style={{padding:'16px 14px 10px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:12, color:'var(--navy-400)', fontWeight:500, letterSpacing:'.04em', textTransform:'uppercase'}}>Krill Energy</div>
            <div style={{fontSize:14, fontWeight:600, color:'white', marginTop:2}}>Engineering & Ops</div>
          </div>
          <button onClick={()=>setPinned(!pinned)} title={pinned?'Unpin':'Pin'} style={{background:'transparent',border:0,cursor:'pointer',color:'var(--navy-300)',padding:4,opacity:.8}}>
            <Icons.star/>
          </button>
        </div>

        <div style={{padding:'4px 10px'}}>
          {visibleNav.map(s => (
            <button key={s.id} onClick={()=>setView(s.id)}
              style={{
                width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:10,
                padding:'7px 10px', borderRadius:6, border:0, cursor:'pointer',
                background: view===s.id ? 'color-mix(in oklab, var(--accent) 22%, transparent)' : 'transparent',
                color: view===s.id ? 'white' : 'var(--navy-200)',
                fontSize:13, fontFamily:'var(--font-sans)',
              }}>
              {createElement(Icons[s.icon], {size:16})}
              {t(s.tKey)}
            </button>
          ))}
        </div>

        <div style={{padding:'14px 14px 6px', fontSize:11, color:'var(--navy-400)', fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase'}}>{t('nav.projects')}</div>
        <div style={{padding:'0 8px 12px', overflowY:'auto'}}>
          {projects.map(p => (
            <button key={p.id} onClick={()=>openProject(p.id)}
              style={{
                width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:10,
                padding:'6px 10px', borderRadius:6, border:0, cursor:'pointer',
                background: activeProject===p.id ? 'color-mix(in oklab, var(--accent) 22%, transparent)' : 'transparent',
                color: activeProject===p.id ? 'white' : 'var(--navy-200)',
                fontSize:12.5,
              }}>
              <span style={{width:8,height:8,borderRadius:8, background:`oklch(0.65 0.14 ${p.hue})`, flex:'none'}}/>
              <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--navy-400)'}}>{p.code}</span>
              <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex:1}}>{p.name.split('·')[0]}</span>
              <Dot c={STATUS_META[p.status].dot} size={5}/>
            </button>
          ))}
        </div>

        {session && (
          <div style={{marginTop:'auto', padding:12, borderTop:'1px solid #0c1628', display:'flex', gap:8, alignItems:'center', fontSize:12, color:'var(--navy-300)'}}>
            <Avatar id={session.id} size={26}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{color:'white',fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{session.name}</div>
              <div style={{color:'var(--navy-400)', fontSize:11}}>{t(`role.${session.role}`)} · {session.dept}</div>
            </div>
            <button
              onClick={() => actions.setSession(null)}
              title={t('common.logout')}
              style={{background:'transparent', border:0, padding:4, cursor:'pointer', color:'var(--navy-300)'}}>
              <Icons.arrow size={14} style={{transform:'rotate(180deg)'}}/>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

const RailBtn = ({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick?: () => void }) => (
  <button onClick={onClick} title={label} style={{
    width:32, height:32, borderRadius:8, border:0, cursor:'pointer',
    background: active ? 'color-mix(in oklab, var(--accent) 30%, transparent)' : 'transparent',
    color: active ? 'white' : 'var(--navy-300)',
    display:'flex',alignItems:'center',justifyContent:'center',
    transition:'background .12s',
  }}
    onMouseEnter={e=>{ if(!active) e.currentTarget.style.background='rgba(255,255,255,.06)'; }}
    onMouseLeave={e=>{ if(!active) e.currentTarget.style.background='transparent'; }}>
    {createElement(Icons[icon] || Icons.dot, {size:16})}
  </button>
);

type TopBarProps = {
  view: string;
  activeProject: string | null;
  crumb?: ReactNode;
  onCmd: () => void;
  extra?: ReactNode;
  setView: (v: string) => void;
  openProject: (id: string) => void;
};

export const TopBar = ({ view, activeProject, crumb, onCmd, extra, setView, openProject }: TopBarProps) => {
  const projects = useAppState(s => s.projects);
  const notifications = useAppState(s => s.notifications);
  const session = useAppState(s => s.session);
  const t = useT();
  const proj = projects.find(p => p.id === activeProject);
  const navSection = NAV_SECTIONS.find(s => s.id === view);
  const title = view === 'project' && proj ? proj.name : (navSection ? t(navSection.tKey) : view);

  const [newMenu, setNewMenu] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newProjOpen, setNewProjOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header style={{
      height:52, padding:'0 20px 0 76px', display:'flex', alignItems:'center',
      gap:14, borderBottom:'1px solid var(--line)', background:'var(--paper)',
      position:'sticky', top:0, zIndex:20,
    }}>
      <div style={{display:'flex', alignItems:'baseline', gap:10, minWidth:0, flex:1}}>
        {view === 'project' && proj ? (
          <>
            <span style={{fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink-3)'}}>{proj.code}</span>
            <h1 style={{fontSize:15, fontWeight:600, margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{proj.name}</h1>
            <HealthOrb health={proj.health} progress={proj.progress} size={12}/>
          </>
        ) : (
          <>
            <h1 style={{fontSize:15, fontWeight:600, margin:0}}>{title}</h1>
            {crumb && <span style={{fontSize:12, color:'var(--ink-3)'}}>· {crumb}</span>}
          </>
        )}
      </div>
      {extra}
      <button onClick={onCmd} style={{
        display:'flex', alignItems:'center', gap:8, height:30, padding:'0 10px 0 10px',
        border:'1px solid var(--line)', borderRadius:8, background:'var(--paper-2)', cursor:'pointer',
        fontSize:12, color:'var(--ink-3)', minWidth:260, justifyContent:'space-between',
      }}>
        <span style={{display:'flex',alignItems:'center',gap:6}}><Icons.search size={14}/>{t('topbar.search')}</span>
        <Kbd>⌘K</Kbd>
      </button>
      <div style={{position:'relative'}}>
        <Btn variant="outline" size="sm" icon={<Icons.plus size={14}/>} onClick={() => setNewMenu(v => !v)}>{t('topbar.new')}</Btn>
        {newMenu && (
          <>
            <div onClick={() => setNewMenu(false)} style={{position:'fixed', inset:0, zIndex:29}}/>
            <div style={{
              position:'absolute', top:36, right:0, minWidth:180, background:'var(--paper)',
              border:'1px solid var(--line)', borderRadius:8, boxShadow:'0 8px 24px -8px rgba(6,14,31,.2)',
              zIndex:30, padding:4,
            }}>
              <MenuItem icon={<Icons.check size={14}/>} label={t('topbar.new.task')} onClick={() => { setNewMenu(false); setNewTaskOpen(true); }}/>
              {session && session.role !== 'member' && (
                <MenuItem icon={<Icons.folder size={14}/>} label={t('topbar.new.project')} onClick={() => { setNewMenu(false); setNewProjOpen(true); }}/>
              )}
            </div>
          </>
        )}
      </div>
      <div style={{position:'relative'}}>
        <button
          aria-label="Notifications"
          onClick={() => setBellOpen(v => !v)}
          style={{background:'transparent',border:0,padding:6,cursor:'pointer',color:'var(--ink-3)',position:'relative'}}>
          <Icons.bell size={16}/>
          {unreadCount > 0 && <span style={{position:'absolute',top:3,right:3,width:6,height:6,borderRadius:6,background:'var(--accent)'}}/>}
        </button>
        {bellOpen && (
          <>
            <div onClick={() => setBellOpen(false)} style={{position:'fixed', inset:0, zIndex:29}}/>
            <div style={{
              position:'absolute', top:36, right:-60, width:320, maxHeight:400, overflowY:'auto',
              background:'var(--paper)', border:'1px solid var(--line)', borderRadius:10,
              boxShadow:'0 12px 32px -8px rgba(6,14,31,.25)', zIndex:30,
            }}>
              <div style={{padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--line)'}}>
                <span style={{fontSize:13, fontWeight:600}}>{t('topbar.notifications')}</span>
                <button onClick={() => { actions.markAllNotificationsRead(); }} style={{background:'transparent', border:0, cursor:'pointer', fontSize:11, color:'var(--accent)'}}>{t('topbar.markAllRead')}</button>
              </div>
              {notifications.length === 0 && <div style={{padding:20, textAlign:'center', fontSize:12, color:'var(--ink-4)'}}>{t('inbox.empty')}</div>}
              {notifications.map(n => {
                const p = n.who === 'sys' ? null : PEOPLE.find(x => x.id === n.who);
                return (
                  <div key={n.id} style={{padding:'10px 14px', borderBottom:'1px solid var(--line-2)', display:'flex', gap:10, alignItems:'flex-start'}}>
                    {p ? <Avatar id={n.who} size={22}/> : <span style={{width:22,height:22,borderRadius:22,background:'var(--navy-100)',display:'inline-flex',alignItems:'center',justifyContent:'center',color:'var(--navy-600)'}}><Icons.zap size={12}/></span>}
                    <div style={{flex:1, fontSize:12}}>
                      <div><b>{p ? p.name.split(' ')[0] : 'System'}</b> <span style={{color:'var(--ink-3)'}}>{n.text}</span> <b>{n.what}</b></div>
                      <div style={{fontSize:10.5, color:'var(--ink-4)', marginTop:2}}>{n.t}</div>
                    </div>
                    {!n.read && <Dot c="var(--accent)"/>}
                  </div>
                );
              })}
              <button onClick={() => { setBellOpen(false); setView('inbox'); }} style={{width:'100%', padding:'10px 14px', background:'var(--paper-2)', border:0, cursor:'pointer', fontSize:12, color:'var(--accent)'}}>{t('topbar.openInbox')}</button>
            </div>
          </>
        )}
      </div>
      {session && <Avatar id={session.id} size={28}/>}

      <NewTaskModal open={newTaskOpen} onClose={() => setNewTaskOpen(false)} defaultProject={activeProject}/>
      <NewProjectModal open={newProjOpen} onClose={() => setNewProjOpen(false)} onCreated={id => openProject(id)}/>
    </header>
  );
};

const MenuItem = ({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) => (
  <button onClick={onClick}
    style={{display:'flex', alignItems:'center', gap:10, width:'100%', padding:'8px 10px', border:0, borderRadius:6, background:'transparent', cursor:'pointer', fontSize:13, color:'var(--ink)', textAlign:'left'}}
    onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper-2)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
    <span style={{color:'var(--ink-3)'}}>{icon}</span>{label}
  </button>
);

export const NewTaskModal = ({ open, onClose, defaultProject, defaultStatus, onCreated }: {
  open: boolean; onClose: () => void; defaultProject?: string | null;
  defaultStatus?: TaskStatus; onCreated?: (id: string) => void;
}) => {
  const allProjects = useAppState(s => s.projects);
  const session = useAppState(s => s.session);
  const t = useT();
  // Members can only create tasks in projects they can see.
  const projects = session ? allProjects.filter(p => canSeeProject(session, p)) : allProjects;
  const [title, setTitle] = useState('');
  const [proj, setProj] = useState<string>(defaultProject || projects[0]?.id || '');
  const [prio, setPrio] = useState<'urgent' | 'high' | 'med' | 'low'>('med');
  const [owner, setOwner] = useState<string>(session?.id || 'p1');
  const [start, setStart] = useState<string>('');
  const [due, setDue] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  useEffect(() => {
    if (open) {
      setTitle('');
      setProj(defaultProject || projects[0]?.id || '');
      setPrio('med');
      setOwner(session?.id || 'p1');
      const today = new Date().toISOString().slice(0, 10);
      setStart(today);
      setDue('');
      setDeadline('');
    }
  }, [open, defaultProject, projects, session]);
  const submit = () => {
    if (!title.trim() || !proj) return;
    const id = actions.addTask({
      title: title.trim(), proj, prio, owner, status: defaultStatus,
      start: start || undefined,
      due: due || new Date().toISOString().slice(0, 10),
      deadline: deadline || undefined,
    });
    onClose();
    onCreated?.(id);
  };
  return (
    <Modal open={open} onClose={onClose} title={t('newTask.title')} footer={
      <>
        <Btn variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Btn>
        <Btn variant="accent" size="sm" onClick={submit}>{t('newTask.create')}</Btn>
      </>
    }>
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        <Field label={t('common.title')}><TextInput value={title} onChange={setTitle} placeholder={t('newTask.titlePh')} autoFocus/></Field>
        <Field label={t('common.project')}>
          <Select value={proj} onChange={setProj} options={projects.map(p => ({ value: p.id, label: `${p.code} · ${p.name}` }))}/>
        </Field>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <Field label={t('common.priority')}>
            <Select value={prio} onChange={v => setPrio(v as typeof prio)} options={[
              { value:'urgent', label: t('prio.urgent') },
              { value:'high',   label: t('prio.high') },
              { value:'med',    label: t('prio.med') },
              { value:'low',    label: t('prio.low') },
            ]}/>
          </Field>
          <Field label={t('common.owner')}>
            <Select value={owner} onChange={setOwner} options={PEOPLE.map(p => ({ value: p.id, label: p.name }))}/>
          </Field>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
          <Field label={t('common.start')}><DateInput value={start} onChange={setStart}/></Field>
          <Field label={t('common.due')}><DateInput value={due} onChange={setDue}/></Field>
          <Field label={t('common.deadline')}><DateInput value={deadline} onChange={setDeadline}/></Field>
        </div>
      </div>
    </Modal>
  );
};

export const NewProjectModal = ({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated?: (id: string) => void;
}) => {
  const t = useT();
  const [name, setName] = useState('');
  const [dept, setDept] = useState('Grid');
  useEffect(() => { if (open) { setName(''); setDept('Grid'); } }, [open]);
  const submit = () => {
    if (!name.trim()) return;
    const id = actions.addProject({ name: name.trim(), dept });
    onClose();
    onCreated?.(id);
  };
  return (
    <Modal open={open} onClose={onClose} title={t('newProject.title')} footer={
      <>
        <Btn variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Btn>
        <Btn variant="accent" size="sm" onClick={submit}>{t('newProject.create')}</Btn>
      </>
    }>
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        <Field label={t('common.title')}><TextInput value={name} onChange={setName} placeholder={t('newProject.namePh')} autoFocus/></Field>
        <Field label={t('newProject.dept')}>
          <Select value={dept} onChange={setDept} options={['Grid','Solar','Residential','Harvey IA','Ops'].map(d => ({ value: d, label: d }))}/>
        </Field>
      </div>
    </Modal>
  );
};

export const SettingsModal = ({ open, onClose, tweaksHook }: {
  open: boolean; onClose: () => void; tweaksHook?: ReactNode;
}) => {
  const settings = useAppState(s => s.settings);
  const session = useAppState(s => s.session);
  const lang = useLang();
  const t = useT();
  const confirmReset = () => {
    if (window.confirm(t('settings.resetConfirm'))) {
      actions.resetAll();
      onClose();
    }
  };
  return (
    <Modal open={open} onClose={onClose} title={t('settings.title')} width={520} footer={<Btn variant="accent" size="sm" onClick={onClose}>{t('common.close')}</Btn>}>
      <div style={{display:'flex', flexDirection:'column', gap:14}}>
        <Field label={t('settings.language')}>
          <Select value={lang} onChange={v => actions.setLang(v === 'es' ? 'es' : 'en')} options={[
            { value:'en', label:'English' },
            { value:'es', label:'Español' },
          ]}/>
        </Field>
        <Toggle label={t('settings.notifications')} checked={settings.notifications} onChange={v => actions.updateSettings({ notifications: v })}/>
        <Toggle label={t('settings.dailyDigest')} checked={settings.dailyDigest} onChange={v => actions.updateSettings({ dailyDigest: v })}/>
        <Toggle label={t('settings.protectFocus')} checked={settings.protectFocus} onChange={v => actions.updateSettings({ protectFocus: v })}/>
        {tweaksHook && <div style={{marginTop:4, paddingTop:12, borderTop:'1px solid var(--line-2)'}}>{tweaksHook}</div>}
        {session && (
          <div style={{marginTop:4, paddingTop:12, borderTop:'1px solid var(--line-2)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10}}>
            <div style={{fontSize:12, color:'var(--ink-3)'}}>
              <div><b style={{color:'var(--ink)'}}>{session.name}</b></div>
              <div>{t(`role.${session.role}`)} · {session.dept}</div>
            </div>
            <Btn variant="outline" size="sm" onClick={() => { actions.setSession(null); onClose(); }}>{t('common.logout')}</Btn>
          </div>
        )}
        <div style={{marginTop:4, paddingTop:12, borderTop:'1px solid var(--line-2)'}}>
          <div style={{fontSize:12, color:'var(--ink-3)', marginBottom:8}}>{lang === 'es' ? 'Zona de riesgo' : 'Danger zone'}</div>
          <Btn variant="outline" size="sm" onClick={confirmReset}>{t('settings.resetData')}</Btn>
        </div>
      </div>
    </Modal>
  );
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label style={{display:'flex', flexDirection:'column', gap:6}}>
    <span style={{fontSize:11, fontWeight:600, color:'var(--ink-3)', letterSpacing:'.04em', textTransform:'uppercase'}}>{label}</span>
    {children}
  </label>
);

const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, cursor:'pointer', fontSize:13}}>
    <span>{label}</span>
    <span onClick={() => onChange(!checked)} style={{
      width:34, height:20, borderRadius:20, background: checked ? 'var(--accent)' : 'var(--line)',
      position:'relative', transition:'background .15s', flex:'none',
    }}>
      <span style={{
        position:'absolute', top:2, left: checked ? 16 : 2, width:16, height:16, borderRadius:16,
        background:'white', boxShadow:'0 1px 2px rgba(0,0,0,.18)', transition:'left .15s',
      }}/>
    </span>
  </label>
);

export type CommandAction =
  | { kind: 'view'; id: string; label: string; icon: string; hint: string; sub?: string }
  | { kind: 'project'; id: string; label: string; sub: string; icon: string; hint: string }
  | { kind: 'task'; id: string; label: string; sub: string; icon: string; hint: string }
  | { kind: 'action'; id: string; label: string; icon: string; hint: string; sub?: string };

// Command palette — global ⌘K
export const CommandPalette = ({ open, onClose, onAction }: { open: boolean; onClose: () => void; onAction: (i: CommandAction) => void }) => {
  const [q, setQ] = useState('');
  const ref = useRef<HTMLInputElement | null>(null);
  const allProjects = useAppState(s => s.projects);
  const tasks = useAppState(s => s.tasks);
  const session = useAppState(s => s.session);
  const t = useT();
  const lang = useLang();
  const projects = session ? allProjects.filter(p => canSeeProject(session, p)) : allProjects;
  const visibleNav = NAV_SECTIONS.filter(s => !session || roleCanAccessView(session.role, s.id));
  const visibleTasks = session
    ? tasks.filter(tk => canSeeTask(session, tk, allProjects))
    : tasks;
  useEffect(() => { if (open) setTimeout(() => ref.current?.focus(), 30); setQ(''); }, [open]);
  if (!open) return null;

  const goTo = lang === 'es' ? 'Ir a' : 'Go to';
  const items: CommandAction[] = [
    ...visibleNav.map(s => ({ kind:'view' as const, id:s.id, label:`${goTo} ${t(s.tKey)}`, icon:s.icon, hint:'view' })),
    ...projects.map(p => ({ kind:'project' as const, id:p.id, label:p.name, sub:p.code, icon:'folder', hint:'project' })),
    ...visibleTasks.slice(0,8).map(tk => ({ kind:'task' as const, id:tk.id, label:tk.title, sub:tk.id, icon:'check', hint:'task' })),
    ...(session && session.role !== 'member' ? [{ kind:'action' as const, id:'new-project', label:lang==='es'?'Crear nuevo proyecto…':'Create new project…', icon:'plus', hint:'action' }] : []),
    { kind:'action', id:'new-task',    label: lang==='es'?'Crear nueva tarea…':'Create new task…',    icon:'plus', hint:'action' },
    ...(session && session.role !== 'member' ? [{ kind:'action' as const, id:'status-exec', label: lang==='es'?'Borrador de estado semanal':'Draft weekly exec status', icon:'star', hint:'action' }] : []),
  ];
  const filtered = q ? items.filter(i => (i.label + ' ' + ((i as { sub?: string }).sub || '')).toLowerCase().includes(q.toLowerCase())) : items;

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(6,14,31,.38)', zIndex:100,
      display:'flex', justifyContent:'center', paddingTop:'12vh', backdropFilter:'blur(2px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:560, maxWidth:'92vw', background:'var(--paper)', borderRadius:12,
        border:'1px solid var(--line)', boxShadow:'0 20px 60px -12px rgba(6,14,31,.35)',
        overflow:'hidden', display:'flex', flexDirection:'column', maxHeight:'70vh',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'14px 16px',borderBottom:'1px solid var(--line)'}}>
          <Icons.search size={16}/>
          <input ref={ref} value={q} onChange={e => setQ(e.target.value)} placeholder={lang==='es'?'Escribe un comando, proyecto o tarea…':'Type a command, project, or task…'}
            style={{flex:1,border:0,outline:'none',fontSize:15,background:'transparent',color:'var(--ink)'}}/>
          <Kbd>esc</Kbd>
        </div>
        <div style={{overflowY:'auto'}}>
          {filtered.slice(0,14).map((i, idx) => {
            const sub = (i as { sub?: string }).sub;
            return (
              <button key={idx} onClick={() => { onAction(i); onClose(); }} style={{
                width:'100%', display:'flex', alignItems:'center', gap:12, padding:'9px 16px',
                border:0, background:'transparent', cursor:'pointer', textAlign:'left',
                fontSize:13, color:'var(--ink)',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{color:'var(--ink-3)'}}>{createElement(Icons[i.icon] || Icons.dot, {size:15})}</span>
                <span style={{flex:1}}>{i.label}{sub && <span style={{color:'var(--ink-4)', marginLeft:8, fontFamily:'var(--font-mono)', fontSize:11}}>{sub}</span>}</span>
                <Pill small c="var(--ink-4)">{i.hint}</Pill>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
