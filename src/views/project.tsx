// Project detail page + related components.
import { useState } from 'react';
import { DEPS, PEOPLE, PRIO_META, PROJECTS, TASK_STATUS_META, type Dep, type Priority, type Project, type Task } from '../data';
import { canSeeProject } from '../auth';
import { useLang, useT } from '../i18n';
import { Icons } from '../icons';
import { NewTaskModal } from '../shell';
import { actions, useAppState, type GroupBy } from '../store';
import { Avatar, AvatarStack, Btn, Card, Dot, HealthOrb, Pill, ProgressBar, Sparkbars, StatusPill } from '../ui';

const todayISO = () => new Date().toISOString().slice(0, 10);
const isOverdue = (task: Task) => !!task.deadline && task.status !== 'done' && todayISO() > task.deadline;

export const ProjectView = ({ id, setView: _setView }: { id: string; setView: (v: string) => void }) => {
  const projects = useAppState(s => s.projects);
  const allTasks = useAppState(s => s.tasks);
  const session = useAppState(s => s.session);
  const t = useT();
  const lang = useLang();
  const p = projects.find(x => x.id === id);
  const [tab, setTab] = useState('overview');
  const [linkCopied, setLinkCopied] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  if (!p) return null;
  if (session && !canSeeProject(session, p)) {
    return (
      <div style={{padding:'40px 28px', textAlign:'center', color:'var(--ink-3)'}}>{t('project.noAccess')}</div>
    );
  }
  const tasks = allTasks.filter(tk => tk.proj === id);
  const deps = DEPS.filter(d => d.from === id || d.to === id);

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${p.code}`;
    try { await navigator.clipboard.writeText(url); } catch {
      const ta = document.createElement('textarea'); ta.value = url; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } finally { document.body.removeChild(ta); }
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1600);
  };

  return (
    <div style={{padding:'20px 28px', maxWidth:1280, margin:'0 auto'}}>
      {/* Header card */}
      <div style={{
        background: `linear-gradient(135deg, oklch(0.94 0.03 ${p.hue}) 0%, var(--paper) 60%)`,
        border:'1px solid var(--line)', borderRadius:'var(--radius)', padding:'20px 24px', marginBottom:18,
      }}>
        <div style={{display:'flex', alignItems:'flex-start', gap:16}}>
          <div style={{
            width:52, height:52, borderRadius:12, background:`oklch(0.55 0.14 ${p.hue})`, color:'white',
            display:'flex', alignItems:'center', justifyContent:'center', flex:'none',
            fontFamily:'var(--font-mono)', fontSize:14, fontWeight:600,
          }}>{p.code.split('-')[0]}</div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:4}}>
              <span style={{fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink-3)'}}>{p.code}</span>
              <StatusPill s={p.status} small/>
              <Pill small c="var(--ink-3)">{p.dept}</Pill>
              <Pill small c="var(--ink-3)">{p.q}</Pill>
            </div>
            <h2 style={{fontFamily:'var(--font-serif)', fontWeight:500, fontSize:28, letterSpacing:'-0.01em', margin:0}}>{p.name}</h2>
            <div style={{fontSize:14, color:'var(--ink-2)', marginTop:6, maxWidth:720, textWrap:'pretty'} as any}>{p.summary}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.05em', textTransform:'uppercase', fontWeight:600}}>{lang === 'es' ? 'Progreso' : 'Progress'}</div>
            <div style={{display:'flex', alignItems:'center', gap:8, marginTop:4}}>
              <HealthOrb health={p.health} progress={p.progress} size={22}/>
              <span style={{fontSize:28, fontWeight:600, fontFamily:'var(--font-serif)'}}>{p.progress}%</span>
            </div>
            <div style={{fontSize:11, color:'var(--ink-3)', marginTop:4, fontFamily:'var(--font-mono)'}}>{p.start} → {p.end}</div>
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:14, marginTop:16}}>
          <AvatarStack ids={p.team} size={24}/>
          <span style={{fontSize:12, color:'var(--ink-3)'}}>{t('common.owner')} · {PEOPLE.find(x => x.id === p.owner)?.name}</span>
          <span style={{flex:1}}/>
          <Btn variant="outline" size="sm" icon={<Icons.link size={13}/>} onClick={copyLink}>{linkCopied ? t('project.copied') : t('project.copyLink')}</Btn>
          <Btn variant="outline" size="sm" icon={<Icons.doc size={13}/>} onClick={() => setTab('docs')}>{t('project.specDoc')}</Btn>
          <Btn variant="accent" size="sm" icon={<Icons.plus size={13}/>} onClick={() => setNewTaskOpen(true)}>{t('project.newTask')}</Btn>
        </div>
      </div>

      <NewTaskModal open={newTaskOpen} onClose={() => setNewTaskOpen(false)} defaultProject={id} onCreated={() => setTab('tasks')}/>

      {/* Tabs */}
      <div style={{display:'flex', gap:2, borderBottom:'1px solid var(--line)', marginBottom:18}}>
        {['overview','tasks','timeline','docs','activity'].map(tb => (
          <button key={tb} onClick={() => setTab(tb)} style={{
            padding:'10px 14px', border:0, background:'transparent', cursor:'pointer',
            fontSize:13, fontWeight:500,
            color: tab === tb ? 'var(--ink)' : 'var(--ink-3)',
            borderBottom: tab === tb ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom:-1, textTransform:'capitalize',
          }}>{t(`project.tabs.${tb}`)}</button>
        ))}
      </div>

      {tab === 'overview' && <ProjectOverview p={p} tasks={tasks} deps={deps} setTab={setTab}/>}
      {tab === 'tasks' && <TaskList tasks={tasks} projectId={p.id}/>}
      {tab === 'timeline' && <ProjectTimeline p={p}/>}
      {tab === 'docs' && <ProjectDocs/>}
      {tab === 'activity' && <ProjectActivity/>}
    </div>
  );
};

const ProjectOverview = ({ p, tasks, deps, setTab }: { p: Project; tasks: Task[]; deps: Dep[]; setTab: (t: string) => void }) => {
  const t = useT();
  const lang = useLang();
  return (
  <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:18}}>
    <div style={{display:'flex',flexDirection:'column',gap:18}}>
      <Card title={t('project.okrs')}>
        {p.okrs.map((k, i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderTop: i ? '1px solid var(--line-2)' : '0'}}>
            <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-4)', width:32}}>KR-{i+1}</span>
            <span style={{flex:1, fontSize:13}}>{k}</span>
            <div style={{width:120}}><ProgressBar v={[60,20,78,45,8,22][i] || 40}/></div>
          </div>
        ))}
      </Card>
      <Card title={`${lang==='es'?'Tareas abiertas':'Open tasks'} · ${tasks.filter(tk => tk.status !== 'done').length}`} right={<Btn size="sm" variant="ghost" onClick={() => setTab('tasks')}>{t('project.allTasks')}</Btn>}>
        <TaskMini tasks={tasks.slice(0, 6)}/>
      </Card>
      {p.blockers && (
        <Card style={{background:'color-mix(in oklab, var(--risk) 6%, white)', borderColor:'color-mix(in oklab, var(--risk) 30%, var(--line))'} as any} title={t('project.blockers')}>
          {p.blockers.map((b, i) => (
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'6px 0'}}>
              <Icons.block size={15}/>
              <span style={{fontSize:13, color:'var(--ink)'}}>{b}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:18}}>
      <Card title={t('project.team')}>
        {p.team.map((pid, i) => {
          const person = PEOPLE.find(x => x.id === pid)!;
          return (
            <div key={pid} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 0',borderTop: i ? '1px solid var(--line-2)' : '0'}}>
              <Avatar id={pid} size={28}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13, fontWeight:500}}>{person.name}</div>
                <div style={{fontSize:11, color:'var(--ink-3)'}}>{person.role}</div>
              </div>
              <div style={{width:80}}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--ink-4)', marginBottom:2, fontFamily:'var(--font-mono)'}}>
                  <span>{lang==='es'?'carga':'load'}</span><span>{person.load}%</span>
                </div>
                <ProgressBar v={Math.min(100, person.load)} c={person.load > 90 ? 'var(--risk)' : person.load > 75 ? 'var(--warn)' : 'var(--accent)'}/>
              </div>
            </div>
          );
        })}
      </Card>
      <Card title={t('project.deps')}>
        {deps.length === 0 && <div style={{fontSize:12, color:'var(--ink-4)'}}>{t('project.noDeps')}</div>}
        {deps.map((d, i) => {
          const other = d.from === p.id ? PROJECTS.find(x => x.id === d.to)! : PROJECTS.find(x => x.id === d.from)!;
          const direction = d.from === p.id ? 'out' : 'in';
          return (
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'9px 0',borderTop: i ? '1px solid var(--line-2)' : '0'}}>
              <span style={{marginTop:2, color: d.kind === 'blocks' ? 'var(--risk)' : d.kind === 'feeds' ? 'var(--accent)' : '#7a52c0'}}>
                {direction === 'out' ? <Icons.arrow size={15}/> : <Icons.arrow size={15} style={{transform:'rotate(180deg)'}}/>}
              </span>
              <div style={{flex:1, fontSize:12.5}}>
                <div><span style={{color:'var(--ink-3)'}}>{d.kind} </span><b>{other.name}</b></div>
                <div style={{color:'var(--ink-3)', marginTop:2}}>{d.note}</div>
              </div>
            </div>
          );
        })}
      </Card>
      <Card title={t('project.time')}>
        <div style={{display:'flex', alignItems:'flex-end', gap:12}}>
          <div>
            <div style={{fontSize:28, fontWeight:600, fontFamily:'var(--font-serif)'}}>184<span style={{fontSize:14,color:'var(--ink-3)'}}>h</span></div>
            <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.04em', textTransform:'uppercase'}}>{t('project.loggedSprint')}</div>
          </div>
          <div style={{flex:1, display:'flex', justifyContent:'flex-end'}}>
            <Sparkbars values={[40,55,48,60,72,68,84,90,62,78,55,72,80,65]} h={38}/>
          </div>
        </div>
      </Card>
    </div>
  </div>
  );
};

const TaskMini = ({ tasks }: { tasks: Task[] }) => {
  const t = useT();
  return (
  <div>
    {tasks.map((task, i) => {
      const st = TASK_STATUS_META[task.status];
      const overdue = isOverdue(task);
      return (
        <div key={task.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderTop: i ? '1px solid var(--line-2)' : '0'}}>
          <span style={{width:13,height:13,border:`1.5px solid ${st.c}`, borderRadius:4, flex:'none'}}/>
          <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-4)'}}>{task.id}</span>
          <span style={{flex:1, fontSize:12.5}}>{task.title}</span>
          {overdue && <Pill small c="var(--risk)" bg="color-mix(in oklab, var(--risk) 10%, white)">{t('common.overdue')}</Pill>}
          <Avatar id={task.owner} size={18}/>
          <span style={{fontSize:11, color: overdue ? 'var(--risk)' : 'var(--ink-3)', fontFamily:'var(--font-mono)', width:48, textAlign:'right'}}>{(task.deadline || task.due).slice(5)}</span>
        </div>
      );
    })}
  </div>
  );
};

const TaskList = ({ tasks, projectId }: { tasks: Task[]; projectId: string }) => {
  const filterPrio = useAppState(s => s.projectFilter.prio);
  const groupBy = useAppState(s => s.projectGroupBy);
  const t = useT();
  const [newOpen, setNewOpen] = useState(false);

  const filtered = filterPrio === 'all' ? tasks : tasks.filter(tk => tk.prio === filterPrio);

  const groups = groupTasks(filtered, groupBy, t);
  const nextGroup: Record<GroupBy, GroupBy> = {
    status: 'priority',
    priority: 'owner',
    owner: 'status',
    project: 'status',
  };
  const groupLabel = groupBy === 'status' ? t('common.status')
    : groupBy === 'priority' ? t('common.priority')
    : t('common.owner');

  return (
    <Card pad={0}>
      <div style={{padding:'10px 14px', borderBottom:'1px solid var(--line)', display:'flex', gap:8, alignItems:'center'}}>
        <FilterDropdown value={filterPrio} onChange={actions.setProjectFilter}/>
        <Btn size="sm" variant="ghost" onClick={() => actions.setProjectGroupBy(nextGroup[groupBy])}>{t('common.group')}: {groupLabel}</Btn>
        <span style={{flex:1}}/>
        <Btn size="sm" variant="ghost" icon={<Icons.plus size={13}/>} onClick={() => setNewOpen(true)}>{t('common.new')}</Btn>
      </div>
      {groups.map(g => (
        <div key={g.key}>
          <div style={{padding:'10px 14px', background:'var(--paper-2)', fontSize:11, fontWeight:600, color:'var(--ink-2)', textTransform:'uppercase', letterSpacing:'.04em', display:'flex', alignItems:'center', gap:8}}>
            <Dot c={g.color}/> {g.label} · {g.tasks.length}
          </div>
          {g.tasks.map(task => {
            const rowColor = TASK_STATUS_META[task.status].c;
            const overdue = isOverdue(task);
            return (
              <div key={task.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderBottom:'1px solid var(--line-2)'}}>
                <button
                  onClick={() => actions.cycleTaskStatus(task.id)}
                  title={t('common.status')}
                  style={{width:14,height:14,border:`1.5px solid ${rowColor}`, borderRadius:4, flex:'none', background:'transparent', cursor:'pointer', padding:0, display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
                  {task.status === 'done' && <Icons.check size={10}/>}
                </button>
                <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-4)', width:52}}>{task.id}</span>
                <span style={{flex:1, fontSize:13, textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'var(--ink-3)' : 'inherit'}}>{task.title}</span>
                {overdue && <Pill small c="var(--risk)" bg="color-mix(in oklab, var(--risk) 10%, white)">{t('common.overdue')}</Pill>}
                <Pill small c={PRIO_META[task.prio].c}>{t(`prio.${task.prio}`)}</Pill>
                {task.tags.slice(0, 2).map(tag => <Pill key={tag} small>{tag}</Pill>)}
                <Avatar id={task.owner} size={22}/>
                <span title={task.start ? `${t('common.start')}: ${task.start}` : undefined} style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--font-mono)', width:48, textAlign:'right'}}>{task.start ? task.start.slice(5) : '—'}</span>
                <span title={`${t('common.due')}: ${task.due}`} style={{fontSize:11, color:'var(--ink-3)', fontFamily:'var(--font-mono)', width:48, textAlign:'right'}}>{task.due ? task.due.slice(5) : '—'}</span>
                <span title={task.deadline ? `${t('common.deadline')}: ${task.deadline}` : undefined} style={{fontSize:11, color: overdue ? 'var(--risk)' : 'var(--ink-3)', fontFamily:'var(--font-mono)', width:48, textAlign:'right', fontWeight: overdue ? 600 : 400}}>{task.deadline ? task.deadline.slice(5) : '—'}</span>
                <span style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--font-mono)', width:28, textAlign:'right'}}>{task.est}h</span>
              </div>
            );
          })}
        </div>
      ))}
      {groups.length === 0 && <div style={{padding:'24px', fontSize:13, color:'var(--ink-4)', textAlign:'center'}}>{t('project.noMatch')}</div>}
      <NewTaskModal open={newOpen} onClose={() => setNewOpen(false)} defaultProject={projectId}/>
    </Card>
  );
};

function groupTasks(tasks: Task[], by: GroupBy, t: (key: string) => string): { key: string; label: string; color: string; tasks: Task[] }[] {
  if (by === 'priority') {
    const order: Priority[] = ['urgent', 'high', 'med', 'low'];
    return order.map(prio => ({
      key: prio, label: t(`prio.${prio}`), color: PRIO_META[prio].c,
      tasks: tasks.filter(tk => tk.prio === prio),
    })).filter(g => g.tasks.length);
  }
  if (by === 'owner') {
    const owners = Array.from(new Set(tasks.map(tk => tk.owner)));
    return owners.map(id => {
      const p = PEOPLE.find(x => x.id === id);
      return {
        key: id, label: p ? p.name : id, color: 'var(--ink-3)',
        tasks: tasks.filter(tk => tk.owner === id),
      };
    }).filter(g => g.tasks.length);
  }
  const statuses: (keyof typeof TASK_STATUS_META)[] = ['in-progress', 'review', 'todo', 'blocked', 'done'];
  return statuses.map(st => {
    const m = TASK_STATUS_META[st];
    return { key: st, label: t(`status.${st}`), color: m.c, tasks: tasks.filter(tk => tk.status === st) };
  }).filter(g => g.tasks.length);
}

const FilterDropdown = ({ value, onChange }: { value: Priority | 'all'; onChange: (v: Priority | 'all') => void }) => {
  const [open, setOpen] = useState(false);
  const t = useT();
  const label = value === 'all' ? t('common.filter') : `${t('common.priority')}: ${t(`prio.${value}`)}`;
  return (
    <div style={{position:'relative'}}>
      <Btn size="sm" variant={value === 'all' ? 'subtle' : 'outline'} icon={<Icons.filter size={13}/>} onClick={() => setOpen(v => !v)}>{label}</Btn>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{position:'fixed', inset:0, zIndex:29}}/>
          <div style={{position:'absolute', top:32, left:0, minWidth:160, background:'var(--paper)', border:'1px solid var(--line)', borderRadius:8, boxShadow:'0 8px 24px -8px rgba(6,14,31,.2)', zIndex:30, padding:4}}>
            {(['all','urgent','high','med','low'] as const).map(v => (
              <button key={v} onClick={() => { onChange(v); setOpen(false); }}
                style={{display:'block', width:'100%', textAlign:'left', padding:'7px 10px', border:0, borderRadius:6, background: value === v ? 'var(--paper-2)' : 'transparent', cursor:'pointer', fontSize:13, color:'var(--ink)'}}>
                {v === 'all' ? t('prio.allPriorities') : t(`prio.${v}`)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ProjectTimeline = ({ p }: { p: Project }) => {
  const lang = useLang();
  const phases = lang === 'es'
    ? [
        { l:'Diseño y planeación',  s:0,    e:0.18 },
        { l:'Compras',              s:0.15, e:0.42 },
        { l:'Instalación',          s:0.38, e:0.78 },
        { l:'Puesta en marcha',     s:0.74, e:0.92 },
        { l:'Entrega',              s:0.9,  e:1.0  },
      ]
    : [
        { l:'Design & planning',   s:0,    e:0.18 },
        { l:'Procurement',         s:0.15, e:0.42 },
        { l:'Install / build',     s:0.38, e:0.78 },
        { l:'Commissioning',       s:0.74, e:0.92 },
        { l:'Handoff',             s:0.9,  e:1.0  },
      ];
  return (
    <Card title={lang==='es'?'Fases':'Phases'}>
      <div style={{display:'flex', fontSize:10, color:'var(--ink-4)', fontFamily:'var(--font-mono)', justifyContent:'space-between', padding:'0 160px 6px 160px'}}>
        <span>{p.start}</span><span>{lang==='es'?'medio':'mid'}</span><span>{p.end}</span>
      </div>
      {phases.map((ph, i) => (
        <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'8px 0',borderTop: i ? '1px solid var(--line-2)' : '0'}}>
          <span style={{width:160, fontSize:13}}>{ph.l}</span>
          <div style={{flex:1, position:'relative', height:18, background:'var(--paper-2)', borderRadius:6}}>
            <div style={{position:'absolute', left:`${ph.s*100}%`, width:`${(ph.e-ph.s)*100}%`, top:0, bottom:0, borderRadius:6, background:`oklch(0.7 0.09 ${p.hue})`}}/>
            {i === 2 && <div style={{position:'absolute', left:'55%', top:-2, bottom:-2, width:2, background:'var(--ink)'}}/>}
          </div>
        </div>
      ))}
    </Card>
  );
};

const ProjectDocs = () => {
  const lang = useLang();
  const updated = lang === 'es' ? 'Actualizado' : 'Updated';
  return (
  <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14}}>
    {[
      { t:'Project Charter',       sub:'v4 · 12 pages',         who:'p5', date:'Apr 2'  },
      { t:'Technical Spec',        sub:'v2.1 · 34 pages',       who:'p1', date:'Apr 11' },
      { t:'Cutover Runbook',       sub:'v3 draft · 18 pages',   who:'p1', date:'today'  },
      { t:'Risk Register',         sub:'updated weekly',        who:'p5', date:'Apr 15' },
      { t:'Vendor Contracts · ABB',sub:'signed',                who:'p5', date:'Mar 3'  },
      { t:'Arc-Flash Study',       sub:'pending sign-off',      who:'p1', date:'Apr 17' },
    ].map((d, i) => (
      <Card key={i} pad={14}>
        <div style={{display:'flex', gap:12, alignItems:'flex-start'}}>
          <span style={{width:32,height:40, background:'var(--paper-2)', border:'1px solid var(--line)', borderRadius:4, flex:'none', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Icons.doc size={16}/>
          </span>
          <div style={{minWidth:0, flex:1}}>
            <div style={{fontSize:13, fontWeight:500}}>{d.t}</div>
            <div style={{fontSize:11, color:'var(--ink-3)', marginTop:2}}>{d.sub}</div>
            <div style={{display:'flex', alignItems:'center', gap:6, marginTop:10}}>
              <Avatar id={d.who} size={18}/>
              <span style={{fontSize:11, color:'var(--ink-3)'}}>{updated} {d.date}</span>
            </div>
          </div>
        </div>
      </Card>
    ))}
  </div>
  );
};

const ProjectActivity = () => {
  const lang = useLang();
  return (
  <Card>
    {[
      { who:'p5', t:'2h ago', text:'moved 3 tasks from Backlog into Sprint 16' },
      { who:'p1', t:'4h ago', text:'updated the cutover runbook to v3 draft' },
      { who:'sys',t:'6h ago', text:'flagged SE-07 as At Risk (blocker age > 14d)' },
      { who:'p6', t:'y’day', text:'closed T-298 · Protection relay calibration' },
      { who:'p7', t:'y’day', text:'commented on T-304 · Review MAPE regression' },
      { who:'p5', t:'Mon',  text:'shifted end date from Jun 1 to Jun 15' },
    ].map((a, i) => (
      <div key={i} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'10px 0',borderTop: i ? '1px solid var(--line-2)' : '0'}}>
        {a.who === 'sys' ? (
          <span style={{width:24,height:24,borderRadius:24,background:'var(--navy-100)',display:'inline-flex',alignItems:'center',justifyContent:'center',color:'var(--navy-600)',flex:'none'}}>
            <Icons.zap size={12}/>
          </span>
        ) : <Avatar id={a.who} size={24}/>}
        <div style={{flex:1, fontSize:13}}>
          <b>{a.who === 'sys' ? (lang==='es'?'Sistema':'System') : PEOPLE.find(p => p.id === a.who)?.name.split(' ')[0]}</b>{' '}
          <span style={{color:'var(--ink-3)'}}>{a.text}</span>
        </div>
        <span style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--font-mono)'}}>{a.t}</span>
      </div>
    ))}
  </Card>
  );
};
