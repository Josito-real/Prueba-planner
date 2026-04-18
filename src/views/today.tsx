// Today / My Work — the hero screen. Three variants:
//   strip: horizontal day-strip (NOVEL — hero default)
//   classic: two-column agenda + task list
//   focus: single-column, minimal, deep-work framing
import { createElement } from 'react';
import {
  NOTIFICATIONS, OKRS, PEOPLE, PRIO_META, PROJECTS, TASKS,
  TASK_STATUS_META, TODAY,
} from '../data';
import { Icons } from '../icons';
import { Avatar, AvatarStack, Btn, Card, HealthOrb, Pill, ProgressBar, StatusPill } from '../ui';

const HR_LABELS = Array.from({ length: 11 }, (_, i) => 7 + i); // 7..17

const TimeStrip = () => {
  const now = 15.25; // 3:15 pm demo
  const width = 1040;
  const h = 120;
  const start = 7, end = 18;
  const hourW = width / (end - start);
  const x = (t: number) => (t - start) * hourW;

  return (
    <div style={{position:'relative', background:'var(--paper)', border:'1px solid var(--line)', borderRadius:'var(--radius)', padding:'14px 18px 10px'}}>
      <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between', marginBottom:10}}>
        <div>
          <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.05em', textTransform:'uppercase', fontWeight:600}}>Your day — Fri Apr 17</div>
          <div style={{fontSize:22, fontWeight:600, fontFamily:'var(--font-serif)', letterSpacing:'-0.01em', marginTop:2}}>
            2 deep-focus blocks. 3 meetings. 1 drifting deadline.
          </div>
        </div>
        <div style={{display:'flex',gap:6}}>
          <Btn variant="subtle" size="sm" icon={<Icons.zap size={13}/>}>Protect focus</Btn>
          <Btn variant="outline" size="sm" icon={<Icons.plus size={13}/>}>Add block</Btn>
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
          {TODAY.blocks.map((b, i) => {
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
    </div>
  );
};

const PulledTasks = () => {
  const tasks = TODAY.pull.map(id => TASKS.find(t => t.id === id)).filter(Boolean) as typeof TASKS;
  return (
    <Card title="Pulled into today" right={<Btn size="sm" variant="ghost" icon={<Icons.plus size={13}/>}>Pull more</Btn>}>
      <div>
        {tasks.map(t => {
          const proj = PROJECTS.find(p => p.id === t.proj)!;
          const prio = PRIO_META[t.prio];
          const st = TASK_STATUS_META[t.status];
          return (
            <div key={t.id} style={{display:'flex',alignItems:'center',gap:10, padding:'10px 0', borderTop:'1px solid var(--line-2)'}}>
              <span style={{width:14,height:14,border:`1.5px solid ${st.c}`, borderRadius:4, flex:'none', display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
                {t.status === 'done' && <Icons.check size={10}/>}
                {t.status === 'blocked' && <span style={{width:6,height:2,background:st.c}}/>}
              </span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-4)'}}>{t.id}</span>
              <span style={{flex:1, fontSize:13, fontWeight:500}}>{t.title}</span>
              <Pill small c={prio.c}>{prio.label}</Pill>
              <span style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:11, color:'var(--ink-3)'}}>
                <span style={{width:6,height:6,borderRadius:6,background:`oklch(0.65 0.14 ${proj.hue})`}}/>
                {proj.code}
              </span>
              <span style={{fontSize:11, color:'var(--ink-3)', fontFamily:'var(--font-mono)'}}>{t.due.slice(5)}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const RiskStream = () => (
  <Card title="Needs attention" right={<span style={{fontSize:11,color:'var(--ink-4)'}}>auto-curated</span>}>
    {[
      { icon:'warn',  c:'var(--warn)', text:'ABB relay shipment slipped 3 weeks',         sub:'SE-07 Retrofit · owner Sofía',          action:'Escalate' },
      { icon:'block', c:'var(--risk)', text:'PMU customs clearance still held',           sub:'Grid Frequency Monitor · 8 weeks overdue', action:'Route to legal' },
      { icon:'warn',  c:'var(--warn)', text:'Forecaster MAPE regression on cohort B',     sub:'Harvey IA v2 · owner Valentina',         action:'Review' },
    ].map((r, i) => (
      <div key={i} style={{display:'flex',alignItems:'flex-start', gap:12, padding:'10px 0', borderTop: i ? '1px solid var(--line-2)' : '0'}}>
        <span style={{color:r.c, marginTop:2}}>{createElement(Icons[r.icon], { size:16 })}</span>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:13, fontWeight:500}}>{r.text}</div>
          <div style={{fontSize:11, color:'var(--ink-3)', marginTop:2}}>{r.sub}</div>
        </div>
        <Btn size="sm" variant="outline">{r.action}</Btn>
      </div>
    ))}
  </Card>
);

const OkrMini = () => (
  <Card title="OKRs · Q2" right={<Btn size="sm" variant="ghost">See all</Btn>}>
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

const InboxMini = () => (
  <Card title="Inbox" right={<Pill small c="var(--accent-ink)" bg="var(--accent-wash)">5 new</Pill>}>
    {NOTIFICATIONS.map((n, i) => {
      const p = n.who === 'sys' ? null : PEOPLE.find(x => x.id === n.who);
      return (
        <div key={n.id} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'9px 0',borderTop: i ? '1px solid var(--line-2)' : '0'}}>
          {p ? <Avatar id={n.who} size={22}/> : (
            <span style={{width:22,height:22,borderRadius:22,background:'var(--navy-100)',display:'inline-flex',alignItems:'center',justifyContent:'center',color:'var(--navy-600)',flex:'none'}}>
              <Icons.zap size={12}/>
            </span>
          )}
          <div style={{flex:1, fontSize:12.5}}>
            <span style={{fontWeight:500}}>{p ? p.name.split(' ')[0] : 'System'}</span>{' '}
            <span style={{color:'var(--ink-3)'}}>{n.text}</span>{' '}
            <span style={{fontWeight:500}}>{n.what}</span>
          </div>
          <span style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--font-mono)'}}>{n.t}</span>
        </div>
      );
    })}
  </Card>
);

// Hero variant A — "strip" (novel, default)
export const TodayStrip = ({ openProject }: { openProject: (id: string) => void }) => (
  <div style={{padding:'24px 28px', display:'flex', flexDirection:'column', gap:18, maxWidth:1280, margin:'0 auto'}}>
    <GreetingHeader/>
    <TimeStrip/>
    <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18}}>
      <PulledTasks/>
      <RiskStream/>
    </div>
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:18}}>
      <OkrMini/>
      <InboxMini/>
    </div>
    <ActiveProjectsRow openProject={openProject}/>
  </div>
);

// Hero variant B — "classic"
export const TodayClassic = ({ openProject: _openProject }: { openProject: (id: string) => void }) => (
  <div style={{padding:'24px 28px', display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:20, maxWidth:1280, margin:'0 auto'}}>
    <div style={{display:'flex',flexDirection:'column',gap:18}}>
      <GreetingHeader/>
      <Card title="Agenda">
        {TODAY.blocks.filter(b => b.kind !== 'break').map((b, i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'10px 0',borderTop: i ? '1px solid var(--line-2)' : '0'}}>
            <span style={{fontFamily:'var(--font-mono)', fontSize:12, color:'var(--ink-3)', width:72}}>
              {fmtTime(b.t)}–{fmtTime(b.t+b.d)}
            </span>
            <span style={{width:4, height:24, borderRadius:2, background: b.kind==='focus'?'var(--accent)':b.kind==='review'?'#7a52c0':'var(--ink-4)'}}/>
            <span style={{fontSize:13,fontWeight:500,flex:1}}>{b.label}</span>
            {b.proj && <Pill small c="var(--ink-2)">{PROJECTS.find(p => p.id === b.proj)?.code}</Pill>}
            {b.people && <AvatarStack ids={b.people} size={20}/>}
          </div>
        ))}
      </Card>
      <PulledTasks/>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:18}}>
      <RiskStream/>
      <OkrMini/>
      <InboxMini/>
    </div>
  </div>
);

// Hero variant C — "focus"
export const TodayFocus = ({ openProject: _openProject }: { openProject: (id: string) => void }) => {
  const current = TODAY.blocks.find(b => b.kind === 'focus') || TODAY.blocks[0];
  const proj = current.proj ? PROJECTS.find(p => p.id === current.proj) : null;
  return (
    <div style={{padding:'40px 28px', maxWidth:760, margin:'0 auto', display:'flex', flexDirection:'column', gap:28}}>
      <div>
        <div style={{fontSize:12, color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:600}}>Friday · April 17</div>
        <h1 style={{fontFamily:'var(--font-serif)', fontWeight:500, fontSize:44, letterSpacing:'-0.02em', margin:'6px 0 0'}}>
          Good morning, Andrea.
        </h1>
        <div style={{fontSize:16, color:'var(--ink-2)', marginTop:6}}>
          Your single most important thing today is the <b>SE-07 cutover runbook</b>. Everything else can wait.
        </div>
      </div>

      <Card pad={24} style={{background:'var(--navy-950)', color:'white', border:0}}>
        <div style={{fontSize:11, color:'var(--navy-300)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:600}}>Now · until 11:30a</div>
        <div style={{fontSize:26, fontWeight:600, marginTop:8, fontFamily:'var(--font-serif)', letterSpacing:'-0.01em'}}>Runbook v3 — SE-07 cutover</div>
        {proj && <div style={{marginTop:10, fontSize:13, color:'var(--navy-200)'}}>{proj.code} · {proj.name}</div>}
        <div style={{display:'flex',gap:8,marginTop:18}}>
          <Btn variant="accent" size="sm" icon={<Icons.zap size={13}/>}>Enter deep focus</Btn>
          <Btn size="sm" style={{background:'rgba(255,255,255,.08)', color:'white'}}>Open doc</Btn>
        </div>
      </Card>

      <Card title="After focus">
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

const GreetingHeader = () => (
  <div style={{display:'flex',alignItems:'flex-end', justifyContent:'space-between', gap:20}}>
    <div>
      <div style={{fontSize:12, color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:600}}>Friday · April 17 · Week 16</div>
      <h1 style={{fontFamily:'var(--font-serif)', fontWeight:500, fontSize:34, letterSpacing:'-0.02em', margin:'4px 0 0'}}>
        Morning, Andrea.
      </h1>
    </div>
    <div style={{display:'flex', gap:22, alignItems:'center', fontSize:12, color:'var(--ink-3)'}}>
      <Stat v="6" l="active projects"/>
      <Stat v="11" l="open tasks"/>
      <Stat v="2" l="at risk" c="var(--warn)"/>
      <Stat v="1" l="blocked" c="var(--risk)"/>
    </div>
  </div>
);

const Stat = ({ v, l, c }: { v: string; l: string; c?: string }) => (
  <div style={{textAlign:'right'}}>
    <div style={{fontSize:22, fontWeight:600, color: c || 'var(--ink)', fontFamily:'var(--font-serif)', letterSpacing:'-0.01em'}}>{v}</div>
    <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.04em', textTransform:'uppercase'}}>{l}</div>
  </div>
);

const ActiveProjectsRow = ({ openProject }: { openProject: (id: string) => void }) => (
  <div>
    <div style={{display:'flex',alignItems:'baseline', justifyContent:'space-between', marginBottom:12}}>
      <div style={{fontSize:12, fontWeight:600, color:'var(--ink-2)', letterSpacing:'.02em', textTransform:'uppercase'}}>Your projects</div>
      <span style={{fontSize:11, color:'var(--ink-4)'}}>sorted by urgency</span>
    </div>
    <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14}}>
      {PROJECTS.slice(0, 6).map(p => (
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

export const fmtTime = (t: number) => {
  const h = Math.floor(t); const m = Math.round((t - h) * 60);
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const ampm = h >= 12 ? 'p' : 'a';
  return m ? `${hr}:${String(m).padStart(2, '0')}${ampm}` : `${hr}${ampm}`;
};
