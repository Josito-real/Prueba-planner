// App shell: command rail (novel sidebar) + topbar.
// The rail is a spine of project glyphs + section icons; hover/click expands into a full nav panel.
import { createElement, useEffect, useRef, useState, type ReactNode } from 'react';
import { ME, PROJECTS, STATUS_META, TASKS } from './data';
import { Icons, KrillMark } from './icons';
import { Avatar, Btn, Dot, Kbd, HealthOrb, Pill } from './ui';

export const NAV_SECTIONS = [
  { id:'today',    label:'Today',      icon:'today' },
  { id:'inbox',    label:'Inbox',      icon:'bell' },
  { id:'roadmap',  label:'Roadmap',    icon:'gantt' },
  { id:'projects', label:'Projects',   icon:'folder' },
  { id:'kanban',   label:'Board',      icon:'kanban' },
  { id:'list',     label:'List',       icon:'list' },
  { id:'calendar', label:'Calendar',   icon:'cal' },
  { id:'table',    label:'Spec table', icon:'table' },
  { id:'capacity', label:'Capacity',   icon:'capacity' },
  { id:'exec',     label:'Exec status',icon:'star' },
];

type CommandRailProps = {
  view: string;
  setView: (v: string) => void;
  openProject: (id: string) => void;
  activeProject: string | null;
  openPalette: () => void;
  onLogoClick: () => void;
};

export const CommandRail = ({ view, setView, openProject, activeProject, openPalette, onLogoClick }: CommandRailProps) => {
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hover || pinned;

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
        <RailBtn icon="cmd" label="Command · ⌘K" onClick={openPalette}/>
        <div style={{height:8}}/>
        {NAV_SECTIONS.slice(0,3).map(s=>(
          <RailBtn key={s.id} icon={s.icon} label={s.label} active={view===s.id} onClick={()=>setView(s.id)}/>
        ))}
        <div style={{height:1, width:24, background:'#18253f', margin:'8px 0'}}/>
        {/* project glyph spine */}
        {PROJECTS.map(p => {
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
        <RailBtn icon="settings" label="Settings"/>
        <Avatar id={ME} size={26}/>
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
          {NAV_SECTIONS.map(s => (
            <button key={s.id} onClick={()=>setView(s.id)}
              style={{
                width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:10,
                padding:'7px 10px', borderRadius:6, border:0, cursor:'pointer',
                background: view===s.id ? 'color-mix(in oklab, var(--accent) 22%, transparent)' : 'transparent',
                color: view===s.id ? 'white' : 'var(--navy-200)',
                fontSize:13, fontFamily:'var(--font-sans)',
              }}>
              {createElement(Icons[s.icon], {size:16})}
              {s.label}
            </button>
          ))}
        </div>

        <div style={{padding:'14px 14px 6px', fontSize:11, color:'var(--navy-400)', fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase'}}>Projects</div>
        <div style={{padding:'0 8px 12px', overflowY:'auto'}}>
          {PROJECTS.map(p => (
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

        <div style={{marginTop:'auto', padding:12, borderTop:'1px solid #0c1628', display:'flex', gap:8, alignItems:'center', fontSize:12, color:'var(--navy-300)'}}>
          <Avatar id={ME} size={26}/>
          <div>
            <div style={{color:'white',fontSize:13, fontWeight:500}}>Andrea Salas</div>
            <div style={{color:'var(--navy-400)', fontSize:11}}>Lead Engineer · Grid</div>
          </div>
        </div>
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
};

export const TopBar = ({ view, activeProject, crumb, onCmd, extra }: TopBarProps) => {
  const proj = PROJECTS.find(p => p.id === activeProject);
  const title = view === 'project' && proj ? proj.name :
    (NAV_SECTIONS.find(s => s.id === view)?.label || view);
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
        <span style={{display:'flex',alignItems:'center',gap:6}}><Icons.search size={14}/>Search projects, tasks, docs…</span>
        <Kbd>⌘K</Kbd>
      </button>
      <Btn variant="outline" size="sm" icon={<Icons.plus size={14}/>}>New</Btn>
      <button style={{background:'transparent',border:0,padding:6,cursor:'pointer',color:'var(--ink-3)',position:'relative'}}>
        <Icons.bell size={16}/>
        <span style={{position:'absolute',top:3,right:3,width:6,height:6,borderRadius:6,background:'var(--accent)'}}/>
      </button>
      <Avatar id={ME} size={28}/>
    </header>
  );
};

export type CommandAction =
  | { kind: 'view'; id: string; label: string; icon: string; hint: string; sub?: string }
  | { kind: 'project'; id: string; label: string; sub: string; icon: string; hint: string }
  | { kind: 'task'; id: string; label: string; sub: string; icon: string; hint: string }
  | { kind: 'action'; id: string; label: string; icon: string; hint: string; sub?: string };

// Command palette — global ⌘K
export const CommandPalette = ({ open, onClose, onAction }: { open: boolean; onClose: () => void; onAction: (i: CommandAction) => void }) => {
  const [q, setQ] = useState('');
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => { if (open) setTimeout(() => ref.current?.focus(), 30); setQ(''); }, [open]);
  if (!open) return null;

  const items: CommandAction[] = [
    ...NAV_SECTIONS.map(s => ({ kind:'view' as const, id:s.id, label:`Go to ${s.label}`, icon:s.icon, hint:'view' })),
    ...PROJECTS.map(p => ({ kind:'project' as const, id:p.id, label:p.name, sub:p.code, icon:'folder', hint:'project' })),
    ...TASKS.slice(0,8).map(t => ({ kind:'task' as const, id:t.id, label:t.title, sub:t.id, icon:'check', hint:'task' })),
    { kind:'action', id:'new-project', label:'Create new project…', icon:'plus', hint:'action' },
    { kind:'action', id:'new-task',    label:'Create new task…',    icon:'plus', hint:'action' },
    { kind:'action', id:'status-exec', label:'Draft weekly exec status', icon:'star', hint:'action' },
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
          <input ref={ref} value={q} onChange={e => setQ(e.target.value)} placeholder="Type a command, project, or task…"
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
