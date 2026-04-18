// Today / My Work — the hero screen. Three variants:
//   strip: horizontal day-strip (NOVEL — hero default)
//   classic: two-column agenda + task list
//   focus: single-column, minimal, deep-work framing
import { createElement, useState } from 'react';
import { OKRS, PEOPLE, PRIO_META, PROJECTS, TASK_STATUS_META, TODAY, type Task } from '../data';
import { canSeeProject, canSeeTask } from '../auth';
import { useLang, useT } from '../i18n';
import { Icons } from '../icons';
import { Avatar, AvatarStack, Btn, Card, HealthOrb, Modal, Pill, ProgressBar, Select, StatusPill, TextInput } from '../ui';
import { actions, useAppState } from '../store';

const todayISO = () => new Date().toISOString().slice(0, 10);
const isOverdue = (t: Task) => !!t.deadline && t.status !== 'done' && todayISO() > t.deadline;

const HR_LABELS = Array.from({ length: 11 }, (_, i) => 7 + i); // 7..17

const TimeStrip = () => {
  const now = 15.25; // 3:15 pm demo
  const width = 1040;
  const h = 120;
  const start = 7, end = 18;
  const hourW = width / (end - start);
  const x = (t: number) => (t - start) * hourW;

  const focusMode = useAppState(s => s.focusMode);
  const extraBlocks = useAppState(s => s.todayBlocks);
  const t = useT();
  const lang = useLang();
  const [addOpen, setAddOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [t0, setT0] = useState('14');
  const [dur, setDur] = useState('1');
  const [kind, setKind] = useState<'focus' | 'meeting' | 'review' | 'break'>('focus');

  const submitBlock = () => {
    if (!label.trim()) return;
    actions.addTodayBlock({ t: Number(t0), d: Number(dur), kind, label: label.trim() });
    setAddOpen(false); setLabel('');
  };

  const allBlocks = [...TODAY.blocks, ...extraBlocks];

  return (
    <div style={{
      position:'relative',
      background: focusMode ? 'color-mix(in oklab, var(--accent) 6%, var(--paper))' : 'var(--paper)',
      border: `1px solid ${focusMode ? 'var(--accent)' : 'var(--line)'}`,
      borderRadius:'var(--radius)', padding:'14px 18px 10px',
      transition:'background .15s, border-color .15s',
    }}>
      <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between', marginBottom:10}}>
        <div>
          <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.05em', textTransform:'uppercase', fontWeight:600}}>
            {lang === 'es' ? 'Tu día — vie 17 abr' : 'Your day — Fri Apr 17'} {focusMode && <span style={{color:'var(--accent-ink)', marginLeft:6}}>· {lang === 'es' ? 'foco protegido' : 'focus protected'}</span>}
          </div>
          <div style={{fontSize:22, fontWeight:600, fontFamily:'var(--font-serif)', letterSpacing:'-0.01em', marginTop:2}}>
            {lang === 'es'
              ? '2 bloques de foco profundo. 3 reuniones. 1 fecha en riesgo.'
              : '2 deep-focus blocks. 3 meetings. 1 drifting deadline.'}
          </div>
        </div>
        <div style={{display:'flex',gap:6}}>
          <Btn
            variant={focusMode ? 'accent' : 'subtle'}
            size="sm"
            icon={<Icons.zap size={13}/>}
            onClick={() => actions.toggleFocusMode()}>
            {focusMode ? t('today.focusOn') : t('today.protectFocus')}
          </Btn>
          <Btn variant="outline" size="sm" icon={<Icons.plus size={13}/>} onClick={() => setAddOpen(true)}>{t('today.addBlock')}</Btn>
        </div>
      </div>

      <div style={{position:'relative', overflow:'hidden'}}>
        <svg width={width} height={h} style={{display:'block', maxWidth:'100%'}} viewBox={`0 0 ${width} ${h}`} preserveAspectRatio="none">
          {/* hour grid */}
          {HR_LABELS.map(hr => (
            <g key={hr}>
              <line x1={x(hr)} x2={x(hr)} y1={18} y2={h-6} stroke="var(--line-2)" strokeWidth="1"/>
              <text x={x(hr)+4} y={12} fontSize="10" fontFamily="var(--font-mono)" fill="var(--ink-4)">
                {hr<=12?hr:hr-12}{hr<12?'a':'p'}
              </text>
            </g>
          ))}
          {/* lunch band */}
          <rect x={x(12)} y={20} width={x(13)-x(12)} height={h-28} fill="var(--paper-2)" opacity=".6"/>
          {/* blocks */}
          {allBlocks.map((b, i) => {
            const bx = x(b.t), bw = b.d * hourW - 4;
            const colorMap: Record<string, { bg: string; bd: string; ink: string }> = {
              focus:   { bg:'color-mix(in oklab, var(--accent) 14%, white)', bd:'var(--accent)', ink:'var(--accent-ink)' },
              meeting: { bg:'var(--paper-2)', bd:'var(--ink-4)', ink:'var(--ink)' },
              review:  { bg:'color-mix(in oklab, #7a52c0 14%, white)', bd:'#7a52c0', ink:'#3a2470' },
              ritual:  { bg:'#fff', bd:'var(--line)', ink:'var(--ink-3)' },
              break:   { bg:'transparent', bd:'var(--line)', ink:'var(--ink-4)' },
            };
            const kindColors = colorMap[b.kind];
            return (
              <g key={i}>
                <rect x={bx+2} y={22} width={bw} height={78} rx={6}
                  fill={kindColors.bg} stroke={kindColors.bd} strokeWidth="1"
                  strokeDasharray={b.kind === 'break' ? '3 3' : '0'}/>
                <text x={bx+10} y={40} fontSize="11" fontWeight="600" fill={kindColors.ink} style={{letterSpacing:'.02em'}}>
                  {b.kind.toUpperCase()}
                </text>
                <text x={bx+10} y={56} fontSize="13" fontWeight="500" fill="var(--ink)">
                  {b.label.length > bw/7 ? b.label.slice(0, Math.max(6, Math.floor(bw/7))) + '…' : b.label}
                </text>
                {b.proj && (
                  <text x={bx+10} y={74} fontSize="11" fontFamily="var(--font-mono)" fill="var(--ink-3)">
                    {PROJECTS.find(p => p.id === b.proj)?.code}
                  </text>
                )}
                {b.people && b.people.length > 0 && (
                  <g transform={`translate(${bx+10}, ${82})`}>
                    {b.people.slice(0, 3).map((pid, pi) => {
                      const p = PEOPLE.find(x => x.id === pid);
                      const hue = (pid.charCodeAt(2) * 37) % 360;
                      return (
                        <g key={pid} transform={`translate(${pi*14}, 0)`}>
                          <circle cx="7" cy="7" r="7" fill={`oklch(0.72 0.08 ${hue})`} stroke="white" strokeWidth="1.5"/>
                          <text x="7" y="10" fontSize="8" fontWeight="600" fill="white" textAnchor="middle">{p?.init}</text>
                        </g>
                      );
                    })}
                  </g>
                )}
              </g>
            );
          })}
          {/* now indicator */}
          <line x1={x(now)} x2={x(now)} y1={16} y2={h-4} stroke="var(--accent)" strokeWidth="1.5"/>
          <circle cx={x(now)} cy={16} r="4" fill="var(--accent)"/>
          <text x={x(now)+8} y={14} fontSize="10" fontFamily="var(--font-mono)" fill="var(--accent)" fontWeight="600">NOW 3:15p</text>
        </svg>
      </div>
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('today.addBlock')} footer={
        <>
          <Btn size="sm" variant="ghost" onClick={() => setAddOpen(false)}>{t('common.cancel')}</Btn>
          <Btn size="sm" variant="accent" onClick={submitBlock}>{t('common.add')}</Btn>
        </>
      }>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <TextInput value={label} onChange={setLabel} placeholder={lang==='es'?'¿Qué es?':'What is it?'} autoFocus/>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>
            <Select value={t0} onChange={setT0} options={Array.from({length:11},(_,i)=>({ value:String(i+7), label:`${((i+7)%12)||12}${i+7<12?'a':'p'}` }))}/>
            <Select value={dur} onChange={setDur} options={['0.5','1','1.5','2','2.5'].map(v => ({ value:v, label:`${v}h` }))}/>
            <Select value={kind} onChange={v => setKind(v as typeof kind)} options={[
              { value:'focus',   label: lang==='es'?'Foco':'Focus' },
              { value:'meeting', label: lang==='es'?'Reunión':'Meeting' },
              { value:'review',  label: lang==='es'?'Revisión':'Review' },
              { value:'break',   label: lang==='es'?'Descanso':'Break' },
            ]}/>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const PulledTasks = () => {
  const tasks = useAppState(s => s.tasks);
  const todayPull = useAppState(s => s.todayPull);
  const projects = useAppState(s => s.projects);
  const session = useAppState(s => s.session);
  const t = useT();
  const lang = useLang();
  const [pullOpen, setPullOpen] = useState(false);
  const [filter, setFilter] = useState('');

  const visibleTasks = session ? tasks.filter(tk => canSeeTask(session, tk, projects)) : tasks;
  const pulled = todayPull.map(id => visibleTasks.find(tk => tk.id === id)).filter(Boolean) as Task[];
  const unpulled = visibleTasks.filter(tk => !todayPull.includes(tk.id) && tk.status !== 'done');
  const unpulledFiltered = filter
    ? unpulled.filter(tk => (tk.title + tk.id).toLowerCase().includes(filter.toLowerCase()))
    : unpulled;

  const emptyCopy = lang === 'es'
    ? 'Nada traído aún. Usa "Traer más" para encolar trabajo.'
    : 'Nothing pulled yet. Hit "Pull more" to queue work.';

  return (
    <Card title={t('today.pulled')} right={<Btn size="sm" variant="ghost" icon={<Icons.plus size={13}/>} onClick={() => setPullOpen(true)}>{t('today.pullMore')}</Btn>}>
      <div>
        {pulled.length === 0 && <div style={{fontSize:12, color:'var(--ink-4)', padding:'12px 0'}}>{emptyCopy}</div>}
        {pulled.map(tk => {
          const proj = projects.find(p => p.id === tk.proj)!;
          const prio = PRIO_META[tk.prio];
          const st = TASK_STATUS_META[tk.status];
          const overdue = isOverdue(tk);
          return (
            <div key={tk.id} style={{display:'flex',alignItems:'center',gap:10, padding:'10px 0', borderTop:'1px solid var(--line-2)'}}>
              <button
                onClick={() => actions.cycleTaskStatus(tk.id)}
                title={t('common.status')}
                style={{width:14,height:14,border:`1.5px solid ${st.c}`, borderRadius:4, flex:'none', display:'inline-flex', alignItems:'center', justifyContent:'center', background:'transparent', cursor:'pointer', padding:0}}>
                {tk.status === 'done' && <Icons.check size={10}/>}
                {tk.status === 'blocked' && <span style={{width:6,height:2,background:st.c}}/>}
              </button>
              <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-4)'}}>{tk.id}</span>
              <span style={{flex:1, fontSize:13, fontWeight:500, textDecoration: tk.status === 'done' ? 'line-through' : 'none', color: tk.status === 'done' ? 'var(--ink-3)' : 'inherit'}}>{tk.title}</span>
              {overdue && <Pill small c="var(--risk)" bg="color-mix(in oklab, var(--risk) 10%, white)">{t('common.overdue')}</Pill>}
              <Pill small c={prio.c}>{t(`prio.${tk.prio}`)}</Pill>
              <span style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:11, color:'var(--ink-3)'}}>
                <span style={{width:6,height:6,borderRadius:6,background:`oklch(0.65 0.14 ${proj.hue})`}}/>
                {proj.code}
              </span>
              <span style={{fontSize:11, color: overdue ? 'var(--risk)' : 'var(--ink-3)', fontFamily:'var(--font-mono)'}} title={tk.deadline ? `${t('common.deadline')}: ${tk.deadline}` : undefined}>{(tk.deadline || tk.due).slice(5)}</span>
              <button onClick={() => actions.removeTaskFromToday(tk.id)} title={lang==='es'?'Quitar de hoy':'Remove from today'} style={{background:'transparent', border:0, cursor:'pointer', color:'var(--ink-4)', padding:2, fontSize:14, lineHeight:1}}>×</button>
            </div>
          );
        })}
      </div>
      <Modal open={pullOpen} onClose={() => setPullOpen(false)} title={lang==='es'?'Traer tareas a hoy':'Pull tasks into today'} width={520}>
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          <TextInput value={filter} onChange={setFilter} placeholder={lang==='es'?'Filtrar tareas…':'Filter tasks…'} autoFocus/>
          <div style={{display:'flex', flexDirection:'column', gap:4, maxHeight:380, overflowY:'auto'}}>
            {unpulledFiltered.length === 0 && <div style={{fontSize:12, color:'var(--ink-4)', padding:'12px 0', textAlign:'center'}}>{lang==='es'?'No hay más tareas que traer.':'No more tasks to pull.'}</div>}
            {unpulledFiltered.map(tk => {
              const proj = projects.find(p => p.id === tk.proj)!;
              const prio = PRIO_META[tk.prio];
              return (
                <button key={tk.id} onClick={() => actions.pullTaskIntoToday(tk.id)}
                  style={{display:'flex', alignItems:'center', gap:10, padding:'9px 10px', background:'transparent', border:'1px solid var(--line-2)', borderRadius:8, cursor:'pointer', textAlign:'left'}}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-4)'}}>{tk.id}</span>
                  <span style={{flex:1, fontSize:13}}>{tk.title}</span>
                  <Pill small c={prio.c}>{t(`prio.${tk.prio}`)}</Pill>
                  <span style={{fontSize:11, color:'var(--ink-3)', fontFamily:'var(--font-mono)'}}>{proj.code}</span>
                  <Icons.plus size={13}/>
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
    </Card>
  );
};

const RiskStream = () => {
  const escalated = useAppState(s => s.escalated);
  const t = useT();
  const lang = useLang();
  const risks = [
    { id:'risk-abb',  icon:'warn',  c:'var(--warn)',
      text: lang==='es' ? 'Envío de relé ABB retrasado 3 semanas' : 'ABB relay shipment slipped 3 weeks',
      sub:  lang==='es' ? 'SE-07 Retrofit · responsable Sofía' : 'SE-07 Retrofit · owner Sofía',
      actionKey:'today.escalate' },
    { id:'risk-pmu',  icon:'block', c:'var(--risk)',
      text: lang==='es' ? 'Despacho aduanal PMU aún retenido' : 'PMU customs clearance still held',
      sub:  lang==='es' ? 'Monitor de frecuencia · 8 semanas de retraso' : 'Grid Frequency Monitor · 8 weeks overdue',
      actionKey:'today.routeLegal' },
    { id:'risk-mape', icon:'warn',  c:'var(--warn)',
      text: lang==='es' ? 'Regresión de MAPE del forecaster en cohorte B' : 'Forecaster MAPE regression on cohort B',
      sub:  lang==='es' ? 'Harvey IA v2 · responsable Valentina' : 'Harvey IA v2 · owner Valentina',
      actionKey:'today.review' },
  ];
  return (
    <Card title={lang==='es'?'Necesita atención':'Needs attention'} right={<span style={{fontSize:11,color:'var(--ink-4)'}}>{lang==='es'?'auto-curado':'auto-curated'}</span>}>
      {risks.map((r, i) => {
        const done = escalated.includes(r.id);
        return (
          <div key={r.id} style={{display:'flex',alignItems:'flex-start', gap:12, padding:'10px 0', borderTop: i ? '1px solid var(--line-2)' : '0', opacity: done ? 0.55 : 1}}>
            <span style={{color:r.c, marginTop:2}}>{createElement(Icons[r.icon], { size:16 })}</span>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, fontWeight:500}}>{r.text}</div>
              <div style={{fontSize:11, color:'var(--ink-3)', marginTop:2}}>{r.sub}</div>
            </div>
            {done
              ? <Pill small c="var(--ok)" bg="color-mix(in oklab, var(--ok) 10%, white)">{t('today.handled')}</Pill>
              : <Btn size="sm" variant="outline" onClick={() => actions.escalate(r.id)}>{t(r.actionKey)}</Btn>}
          </div>
        );
      })}
    </Card>
  );
};

const OkrMini = ({ setView }: { setView?: (v: string) => void }) => {
  const t = useT();
  return (
  <Card title="OKRs · Q2" right={<Btn size="sm" variant="ghost" onClick={() => setView?.('exec')}>{t('today.seeAll')}</Btn>}>
    {OKRS.map((o, i) => (
      <div key={o.id} style={{padding:'9px 0', borderTop: i ? '1px solid var(--line-2)' : '0'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:6}}>
          <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-4)'}}>{o.id}</span>
          <span style={{flex:1, fontSize:13, fontWeight:500}}>{o.title}</span>
          <Avatar id={o.owner} size={18}/>
          <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-2)', width:32, textAlign:'right'}}>{o.progress}%</span>
        </div>
        <ProgressBar v={o.progress}/>
      </div>
    ))}
  </Card>
  );
};

const InboxMini = ({ setView }: { setView?: (v: string) => void }) => {
  const notifications = useAppState(s => s.notifications);
  const t = useT();
  const lang = useLang();
  const unread = notifications.filter(n => !n.read).length;
  return (
    <Card
      title={t('today.inboxMini')}
      right={
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          {unread > 0 && <Pill small c="var(--accent-ink)" bg="var(--accent-wash)">{unread} {lang==='es'?'nuevas':'new'}</Pill>}
          <Btn size="sm" variant="ghost" onClick={() => setView?.('inbox')}>{lang==='es'?'Abrir':'Open'}</Btn>
        </div>
      }>
    {notifications.map((n, i) => {
      const p = n.who === 'sys' ? null : PEOPLE.find(x => x.id === n.who);
      return (
        <div key={n.id} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'9px 0',borderTop: i ? '1px solid var(--line-2)' : '0'}}>
          {p ? <Avatar id={n.who} size={22}/> : (
            <span style={{width:22,height:22,borderRadius:22,background:'var(--navy-100)',display:'inline-flex',alignItems:'center',justifyContent:'center',color:'var(--navy-600)',flex:'none'}}>
              <Icons.zap size={12}/>
            </span>
          )}
          <div style={{flex:1, fontSize:12.5}}>
            <span style={{fontWeight:500}}>{p ? p.name.split(' ')[0] : (lang==='es'?'Sistema':'System')}</span>{' '}
            <span style={{color:'var(--ink-3)'}}>{n.text}</span>{' '}
            <span style={{fontWeight:500}}>{n.what}</span>
          </div>
          <span style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--font-mono)'}}>{n.t}</span>
        </div>
      );
    })}
  </Card>
  );
};

type TodayProps = { openProject: (id: string) => void; setView?: (v: string) => void };

// Hero variant A — "strip" (novel, default)
export const TodayStrip = ({ openProject, setView }: TodayProps) => (
  <div style={{padding:'24px 28px', display:'flex', flexDirection:'column', gap:18, maxWidth:1280, margin:'0 auto'}}>
    <GreetingHeader/>
    <TimeStrip/>
    <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18}}>
      <PulledTasks/>
      <RiskStream/>
    </div>
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18}}>
      <OkrMini setView={setView}/>
      <InboxMini setView={setView}/>
    </div>
    <ActiveProjectsRow openProject={openProject}/>
  </div>
);

// Hero variant B — "classic"
export const TodayClassic = ({ openProject: _openProject, setView }: TodayProps) => {
  const projects = useAppState(s => s.projects);
  const extraBlocks = useAppState(s => s.todayBlocks);
  const lang = useLang();
  const agenda = [...TODAY.blocks, ...extraBlocks].filter(b => b.kind !== 'break').sort((a, b) => a.t - b.t);
  return (
    <div style={{padding:'24px 28px', display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:20, maxWidth:1280, margin:'0 auto'}}>
      <div style={{display:'flex',flexDirection:'column',gap:18}}>
        <GreetingHeader/>
        <Card title={lang==='es'?'Agenda':'Agenda'}>
          {agenda.map((b, i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'10px 0',borderTop: i ? '1px solid var(--line-2)' : '0'}}>
              <span style={{fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink-3)', width:72}}>
                {fmtTime(b.t)}–{fmtTime(b.t+b.d)}
              </span>
              <span style={{width:4, height:24, borderRadius:2, background: b.kind==='focus'?'var(--accent)':b.kind==='review'?'#7a52c0':'var(--ink-4)'}}/>
              <span style={{fontSize:13,fontWeight:500,flex:1}}>{b.label}</span>
              {b.proj && <Pill small c="var(--ink-2)">{projects.find(p => p.id === b.proj)?.code}</Pill>}
              {b.people && <AvatarStack ids={b.people} size={20}/>}
            </div>
          ))}
        </Card>
        <PulledTasks/>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:18}}>
        <RiskStream/>
        <OkrMini setView={setView}/>
        <InboxMini setView={setView}/>
      </div>
    </div>
  );
};

// Hero variant C — "focus"
export const TodayFocus = ({ openProject, setView }: TodayProps) => {
  const projects = useAppState(s => s.projects);
  const focusMode = useAppState(s => s.focusMode);
  const session = useAppState(s => s.session);
  const t = useT();
  const lang = useLang();
  const current = TODAY.blocks.find(b => b.kind === 'focus') || TODAY.blocks[0];
  const proj = current.proj ? projects.find(p => p.id === current.proj) : null;
  const firstName = session?.name.split(' ')[0] ?? 'Andrea';
  return (
    <div style={{padding:'40px 28px', maxWidth:760, margin:'0 auto', display:'flex', flexDirection:'column', gap:28}}>
      <div>
        <div style={{fontSize:12, color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:600}}>
          {lang === 'es' ? 'Viernes · 17 de abril' : 'Friday · April 17'}
        </div>
        <h1 style={{fontFamily:'var(--font-serif)', fontWeight:500, fontSize:44, letterSpacing:'-0.02em', margin:'6px 0 0'}}>
          {t('today.greetingMorning')}, {firstName}.
        </h1>
        <div style={{fontSize:16, color:'var(--ink-2)', marginTop:6}}>
          {lang === 'es'
            ? <>Lo más importante hoy es el <b>runbook del cutover SE-07</b>. Todo lo demás puede esperar.</>
            : <>Your single most important thing today is the <b>SE-07 cutover runbook</b>. Everything else can wait.</>}
        </div>
      </div>

      <Card pad={24} style={{background:'var(--navy-950)', color:'white', border:0}}>
        <div style={{fontSize:11, color:'var(--navy-300)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:600}}>{lang==='es'?'Ahora · hasta las 11:30':'Now · until 11:30a'}</div>
        <div style={{fontSize:26, fontWeight:600, marginTop:8, fontFamily:'var(--font-serif)', letterSpacing:'-0.01em'}}>{lang==='es'?'Runbook v3 — cutover SE-07':'Runbook v3 — SE-07 cutover'}</div>
        {proj && <div style={{marginTop:10, fontSize:13, color:'var(--navy-200)'}}>{proj.code} · {proj.name}</div>}
        <div style={{display:'flex',gap:8,marginTop:18}}>
          <Btn variant="accent" size="sm" icon={<Icons.zap size={13}/>} onClick={() => actions.toggleFocusMode()}>
            {focusMode ? t('today.leaveFocus') : t('today.enterFocus')}
          </Btn>
          <Btn size="sm" style={{background:'rgba(255,255,255,.08)', color:'white'}} onClick={() => {
            if (proj) { openProject(proj.id); setView?.('project'); }
          }}>{t('today.openDoc')}</Btn>
        </div>
      </Card>

      <Card title={lang==='es'?'Después del foco':'After focus'}>
        {TODAY.blocks.filter(b => b.t > 11.4).slice(0, 5).map((b, i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 0',borderTop: i ? '1px solid var(--line-2)' : '0'}}>
            <span style={{fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink-3)', width:52}}>{fmtTime(b.t)}</span>
            <span style={{fontSize:13,flex:1}}>{b.label}</span>
            {b.people && <AvatarStack ids={b.people} size={18} max={3}/>}
          </div>
        ))}
      </Card>
    </div>
  );
};

const GreetingHeader = () => {
  const projects = useAppState(s => s.projects);
  const tasks = useAppState(s => s.tasks);
  const session = useAppState(s => s.session);
  const t = useT();
  const lang = useLang();
  // Role-filtered counts — members shouldn't see the whole portfolio.
  const visibleProjects = session ? projects.filter(p => canSeeProject(session, p)) : projects;
  const visibleTasks = session ? tasks.filter(tk => canSeeTask(session, tk, projects)) : tasks;
  const active = visibleProjects.filter(p => p.status !== 'shipped').length;
  const open = visibleTasks.filter(tk => tk.status !== 'done').length;
  const atRisk = visibleProjects.filter(p => p.health === 'at-risk').length;
  const blocked = visibleProjects.filter(p => p.health === 'blocked').length;
  const firstName = session?.name.split(' ')[0] ?? 'Andrea';
  return (
    <div style={{display:'flex',alignItems:'flex-end', justifyContent:'space-between', gap:20}}>
      <div>
        <div style={{fontSize:12, color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:600}}>
          {lang === 'es' ? 'Viernes · 17 de abril · Semana 16' : 'Friday · April 17 · Week 16'}
        </div>
        <h1 style={{fontFamily:'var(--font-serif)', fontWeight:500, fontSize:34, letterSpacing:'-0.02em', margin:'4px 0 0'}}>
          {t('today.greetingMorning')}, {firstName}.
        </h1>
      </div>
      <div style={{display:'flex', gap:22, alignItems:'center', fontSize:12, color:'var(--ink-3)'}}>
        <Stat v={String(active)}  l={t('today.statsActive')}/>
        <Stat v={String(open)}    l={t('today.statsOpen')}/>
        <Stat v={String(atRisk)}  l={t('today.statsAtRisk')} c="var(--warn)"/>
        <Stat v={String(blocked)} l={t('today.statsBlocked')} c="var(--risk)"/>
      </div>
    </div>
  );
};

const Stat = ({ v, l, c }: { v: string; l: string; c?: string }) => (
  <div style={{textAlign:'right'}}>
    <div style={{fontSize:22, fontWeight:600, color: c || 'var(--ink)', fontFamily:'var(--font-serif)', letterSpacing:'-0.01em'}}>{v}</div>
    <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.04em', textTransform:'uppercase'}}>{l}</div>
  </div>
);

const ActiveProjectsRow = ({ openProject }: { openProject: (id: string) => void }) => {
  const allProjects = useAppState(s => s.projects);
  const session = useAppState(s => s.session);
  const lang = useLang();
  const projects = session ? allProjects.filter(p => canSeeProject(session, p)) : allProjects;
  return (
  <div>
    <div style={{display:'flex',alignItems:'baseline', justifyContent:'space-between', marginBottom:12}}>
      <div style={{fontSize:12, fontWeight:600, color:'var(--ink-2)', letterSpacing:'.02em', textTransform:'uppercase'}}>{lang==='es'?'Tus proyectos':'Your projects'}</div>
      <span style={{fontSize:11, color:'var(--ink-4)'}}>{lang==='es'?'ordenados por urgencia':'sorted by urgency'}</span>
    </div>
    <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14}}>
      {projects.slice(0, 6).map(p => (
        <Card key={p.id} pad={14} onClick={() => openProject(p.id)} style={{transition:'border-color .12s'}}>
          <div style={{display:'flex',alignItems:'center', gap:10, marginBottom:10}}>
            <HealthOrb health={p.health} progress={p.progress}/>
            <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-4)'}}>{p.code}</span>
            <span style={{flex:1}}/>
            <StatusPill s={p.status} small/>
          </div>
          <div style={{fontSize:14, fontWeight:600, marginBottom:6, lineHeight:1.3}}>{p.name}</div>
          <div style={{fontSize:11.5, color:'var(--ink-3)', marginBottom:12, lineHeight:1.5, minHeight:32, textWrap:'pretty'} as any}>{p.summary}</div>
          <ProgressBar v={p.progress} c={p.health==='at-risk'?'var(--warn)':p.health==='blocked'?'var(--risk)':'var(--accent)'}/>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:10}}>
            <AvatarStack ids={p.team} size={20}/>
            <span style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--font-mono)'}}>{p.q}</span>
          </div>
        </Card>
      ))}
    </div>
  </div>
  );
};

export const fmtTime = (t: number) => {
  const h = Math.floor(t); const m = Math.round((t - h) * 60);
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const ampm = h >= 12 ? 'p' : 'a';
  return m ? `${hr}:${String(m).padStart(2, '0')}${ampm}` : `${hr}${ampm}`;
};
