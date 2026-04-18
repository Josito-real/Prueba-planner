// Remaining views: Kanban, List, Table, Calendar, Capacity, Exec, Inbox.
import {
  NOTIFICATIONS, PEOPLE, PRIO_META, PROJECTS, TASKS, TASK_STATUS_META,
} from '../data';
import { Icons } from '../icons';
import { Avatar, AvatarStack, Btn, Card, Dot, HealthOrb, Pill, ProgressBar, StatusPill } from '../ui';

export const KanbanView = ({ openProject }: { openProject: (id: string) => void }) => {
  const cols = ['todo','in-progress','review','blocked','done'] as const;
  return (
    <div style={{padding:'20px 28px'}}>
      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:14}}>
        <div>
          <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:600}}>Sprint 16 · Apr 14–28</div>
          <h1 style={{fontFamily:'var(--font-serif)', fontWeight:500, fontSize:26, letterSpacing:'-0.01em', margin:'4px 0 0'}}>Board</h1>
        </div>
        <div style={{display:'flex', gap:8}}>
          <Btn size="sm" variant="outline" icon={<Icons.filter size={13}/>}>Filter</Btn>
          <Btn size="sm" variant="outline">Group: Status</Btn>
          <Btn size="sm" variant="accent" icon={<Icons.plus size={13}/>}>New task</Btn>
        </div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:`repeat(${cols.length}, 1fr)`, gap:12}}>
        {cols.map(st => {
          const meta = TASK_STATUS_META[st];
          const items = TASKS.filter(t => t.status === st);
          return (
            <div key={st} style={{background:'var(--paper-2)', borderRadius:'var(--radius)', padding:10, minHeight:500}}>
              <div style={{display:'flex', alignItems:'center', gap:8, padding:'4px 6px 10px'}}>
                <Dot c={meta.c}/>
                <span style={{fontSize:12, fontWeight:600}}>{meta.label}</span>
                <span style={{fontSize:11, color:'var(--ink-4)', fontFamily:'var(--font-mono)'}}>{items.length}</span>
                <span style={{flex:1}}/>
                <button style={{background:'transparent',border:0,cursor:'pointer',color:'var(--ink-4)',padding:2}}><Icons.plus size={14}/></button>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:8}}>
                {items.map(t => {
                  const proj = PROJECTS.find(p => p.id === t.proj)!;
                  return (
                    <Card key={t.id} pad={12} onClick={() => openProject(t.proj)}>
                      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                        <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-4)'}}>{t.id}</span>
                        <span style={{flex:1}}/>
                        <Pill small c={PRIO_META[t.prio].c}>{PRIO_META[t.prio].label}</Pill>
                      </div>
                      <div style={{fontSize:13, fontWeight:500, lineHeight:1.35, marginBottom:10, textWrap:'pretty'} as any}>{t.title}</div>
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11}}>
                        <span style={{display:'inline-flex', alignItems:'center', gap:5, color:'var(--ink-3)'}}>
                          <span style={{width:6,height:6,borderRadius:6,background:`oklch(0.65 0.14 ${proj.hue})`}}/>
                          {proj.code}
                        </span>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          <span style={{color:'var(--ink-3)', fontFamily:'var(--font-mono)'}}>{t.due.slice(5)}</span>
                          <Avatar id={t.owner} size={18}/>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ListView = () => (
  <div style={{padding:'20px 28px', maxWidth:1280, margin:'0 auto'}}>
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:600}}>All projects</div>
      <h1 style={{fontFamily:'var(--font-serif)', fontWeight:500, fontSize:26, letterSpacing:'-0.01em', margin:'4px 0 0'}}>Projects list</h1>
    </div>
    <Card pad={0}>
      <div style={{display:'grid', gridTemplateColumns:'28px 80px 1.5fr 110px 90px 70px 140px 100px', padding:'10px 14px', fontSize:11, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.04em', fontWeight:600, borderBottom:'1px solid var(--line)', gap:12, alignItems:'center'}}>
        <span/><span>Code</span><span>Project</span><span>Status</span><span>Owner</span><span>Q</span><span>Team</span><span style={{textAlign:'right'}}>Progress</span>
      </div>
      {PROJECTS.map((p, i) => (
        <div key={p.id} style={{display:'grid', gridTemplateColumns:'28px 80px 1.5fr 110px 90px 70px 140px 100px', padding:'12px 14px', borderBottom: i < PROJECTS.length - 1 ? '1px solid var(--line-2)' : '0', gap:12, alignItems:'center', fontSize:13}}>
          <HealthOrb health={p.health} progress={p.progress}/>
          <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)'}}>{p.code}</span>
          <span style={{fontWeight:500}}>{p.name}</span>
          <StatusPill s={p.status} small/>
          <span style={{display:'flex', alignItems:'center', gap:6}}><Avatar id={p.owner} size={20}/><span style={{fontSize:12}}>{PEOPLE.find(x => x.id === p.owner)!.name.split(' ')[0]}</span></span>
          <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)'}}>{p.q}</span>
          <AvatarStack ids={p.team} size={20}/>
          <div style={{display:'flex',alignItems:'center',gap:8, justifyContent:'flex-end'}}>
            <div style={{width:60}}><ProgressBar v={p.progress}/></div>
            <span style={{fontFamily:'var(--font-mono)', fontSize:11, width:28, textAlign:'right'}}>{p.progress}%</span>
          </div>
        </div>
      ))}
    </Card>
  </div>
);

export const TableView = () => (
  <div style={{padding:'20px 28px', maxWidth:1280, margin:'0 auto'}}>
    <div style={{marginBottom:14}}>
      <h1 style={{fontFamily:'var(--font-serif)', fontWeight:500, fontSize:26, letterSpacing:'-0.01em', margin:0}}>Tasks · spreadsheet</h1>
    </div>
    <Card pad={0} style={{overflow:'hidden'}}>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5}}>
          <thead>
            <tr style={{background:'var(--paper-2)', textAlign:'left'}}>
              {['','ID','Task','Project','Owner','Status','Priority','Due','Est','Tags'].map(h => (
                <th key={h} style={{padding:'10px 12px', fontSize:10.5, fontWeight:600, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.04em', borderBottom:'1px solid var(--line)', whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TASKS.map(t => {
              const proj = PROJECTS.find(p => p.id === t.proj)!;
              const st = TASK_STATUS_META[t.status];
              return (
                <tr key={t.id} style={{borderBottom:'1px solid var(--line-2)'}}>
                  <td style={{padding:'8px 12px'}}><span style={{width:13,height:13,border:`1.5px solid ${st.c}`, borderRadius:4, display:'inline-block'}}/></td>
                  <td style={{padding:'8px 12px', fontFamily:'var(--font-mono)', color:'var(--ink-3)'}}>{t.id}</td>
                  <td style={{padding:'8px 12px'}}>{t.title}</td>
                  <td style={{padding:'8px 12px', fontFamily:'var(--font-mono)', color:'var(--ink-2)'}}>{proj.code}</td>
                  <td style={{padding:'8px 12px'}}><span style={{display:'inline-flex', gap:6, alignItems:'center'}}><Avatar id={t.owner} size={18}/>{PEOPLE.find(p => p.id === t.owner)!.name.split(' ')[0]}</span></td>
                  <td style={{padding:'8px 12px'}}><StatusPill s={t.status} small/></td>
                  <td style={{padding:'8px 12px'}}><Pill small c={PRIO_META[t.prio].c}>{PRIO_META[t.prio].label}</Pill></td>
                  <td style={{padding:'8px 12px', fontFamily:'var(--font-mono)', color:'var(--ink-3)'}}>{t.due.slice(5)}</td>
                  <td style={{padding:'8px 12px', fontFamily:'var(--font-mono)', color:'var(--ink-3)'}}>{t.est}h</td>
                  <td style={{padding:'8px 12px'}}>{t.tags.map(tg => <span key={tg} style={{marginRight:4}}><Pill small>{tg}</Pill></span>)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);

export const CalendarView = () => {
  // Apr 2026. Apr 1 is a Wednesday.
  const first = 3; // Wed
  const days = 30;
  const grid = Array.from({ length: 42 }, (_, i) => {
    const day = i - first + 1;
    if (day < 1 || day > days) return null;
    return day;
  });
  const events: Record<number, { l: string; c: string }[]> = {
    17: [{l:'Cutover runbook', c:'var(--accent)'},{l:'Exec status', c:'#7a52c0'}],
    18: [{l:'T-306 due', c:'var(--risk)'},{l:'Review MAPE', c:'var(--warn)'}],
    19: [{l:'Arc-flash sign-off', c:'var(--accent)'}],
    20: [{l:'Portal copy review', c:'var(--ink-4)'}],
    22: [{l:'Inverter commissioning', c:'var(--accent)'}],
    23: [{l:'Zone 3B door-to-door', c:'var(--accent)'}],
    24: [{l:'As-built drawings', c:'var(--ink-4)'}],
    25: [{l:'Cutover runbook draft', c:'var(--warn)'}],
    28: [{l:'Sprint 16 close', c:'#7a52c0'}, {l:'Sprint 17 open', c:'var(--ok)'}],
  };
  return (
    <div style={{padding:'20px 28px', maxWidth:1280, margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between', marginBottom:14}}>
        <div>
          <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:600}}>April 2026</div>
          <h1 style={{fontFamily:'var(--font-serif)', fontWeight:500, fontSize:26, letterSpacing:'-0.01em', margin:'4px 0 0'}}>Calendar</h1>
        </div>
        <div style={{display:'flex', gap:8}}>
          <Btn size="sm" variant="ghost" icon={<Icons.chev size={13} style={{transform:'rotate(180deg)'}}/>}>Prev</Btn>
          <Btn size="sm" variant="subtle">Month</Btn>
          <Btn size="sm" variant="ghost" icon={<Icons.chev size={13}/>}>Next</Btn>
        </div>
      </div>
      <Card pad={0}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', borderBottom:'1px solid var(--line)'}}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{padding:'10px 12px', fontSize:11, color:'var(--ink-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em'}}>{d}</div>
          ))}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gridAutoRows:'110px'}}>
          {grid.map((d, i) => (
            <div key={i} style={{borderRight: i % 7 < 6 ? '1px solid var(--line-2)' : '0', borderBottom:'1px solid var(--line-2)', padding:8, background: d === 17 ? 'color-mix(in oklab, var(--accent) 6%, white)' : 'transparent'}}>
              {d && (
                <>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4}}>
                    <span style={{fontSize:11, fontFamily:'var(--font-mono)', color: d === 17 ? 'var(--accent-ink)' : 'var(--ink-3)', fontWeight: d === 17 ? 700 : 400}}>{d}</span>
                    {d === 17 && <Pill small c="var(--accent-ink)" bg="var(--accent-wash)">today</Pill>}
                  </div>
                  {(events[d] || []).map((e, ei) => (
                    <div key={ei} style={{fontSize:11, color:'var(--ink-2)', borderLeft:`2px solid ${e.c}`, paddingLeft:6, marginBottom:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{e.l}</div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export const CapacityView = () => (
  <div style={{padding:'20px 28px', maxWidth:1280, margin:'0 auto'}}>
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:600}}>Week of Apr 14</div>
      <h1 style={{fontFamily:'var(--font-serif)', fontWeight:500, fontSize:26, letterSpacing:'-0.01em', margin:'4px 0 0'}}>Capacity</h1>
    </div>
    <div style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:18}}>
      <Card pad={0}>
        <div style={{padding:'12px 14px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', gap:10}}>
          <span style={{fontSize:12, fontWeight:600, color:'var(--ink-2)', textTransform:'uppercase', letterSpacing:'.04em'}}>Team · load by project</span>
          <span style={{flex:1}}/>
          <span style={{fontSize:11, color:'var(--ink-4)'}}>100% = full-time</span>
        </div>
        <div style={{padding:14}}>
          {PEOPLE.map((pr, i) => {
            // synth allocation across 3 projects
            const allocs = [
              { proj: PROJECTS[i % PROJECTS.length],         h: pr.load * 0.5 },
              { proj: PROJECTS[(i + 2) % PROJECTS.length],   h: pr.load * 0.3 },
              { proj: PROJECTS[(i + 4) % PROJECTS.length],   h: pr.load * 0.2 },
            ];
            return (
              <div key={pr.id} style={{display:'flex', alignItems:'center', gap:14, padding:'10px 0', borderTop: i ? '1px solid var(--line-2)' : '0'}}>
                <Avatar id={pr.id} size={26}/>
                <div style={{width:160, minWidth:160}}>
                  <div style={{fontSize:13, fontWeight:500}}>{pr.name}</div>
                  <div style={{fontSize:11, color:'var(--ink-3)'}}>{pr.role}</div>
                </div>
                <div style={{flex:1, height:18, display:'flex', borderRadius:6, overflow:'hidden', background:'var(--paper-2)', position:'relative'}}>
                  {allocs.map((a, ai) => (
                    <div key={ai} title={`${a.proj.code} · ${Math.round(a.h)}%`}
                      style={{width:`${a.h}%`, background:`oklch(${0.55 + ai*0.05} 0.14 ${a.proj.hue})`}}/>
                  ))}
                  <div style={{position:'absolute', top:0, bottom:0, left:'100%', marginLeft:-1, width:1, background:'var(--ink)'}}/>
                </div>
                <span style={{fontSize:12, fontFamily:'var(--font-mono)', fontWeight:600,
                  color: pr.load > 100 ? 'var(--risk)' : pr.load > 85 ? 'var(--warn)' : 'var(--ink-2)', width:44, textAlign:'right'}}>
                  {pr.load}%
                </span>
              </div>
            );
          })}
        </div>
      </Card>
      <div style={{display:'flex',flexDirection:'column',gap:18}}>
        <Card title="Overloaded">
          {PEOPLE.filter(p => p.load > 85).map((p, i) => (
            <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderTop: i ? '1px solid var(--line-2)' : '0'}}>
              <Avatar id={p.id} size={24}/>
              <span style={{flex:1, fontSize:13}}>{p.name}</span>
              <span style={{fontSize:12, fontFamily:'var(--font-mono)', color: p.load > 100 ? 'var(--risk)' : 'var(--warn)', fontWeight:600}}>{p.load}%</span>
            </div>
          ))}
        </Card>
        <Card title="Underbooked · can take work">
          {PEOPLE.filter(p => p.load <= 66).map((p, i) => (
            <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderTop: i ? '1px solid var(--line-2)' : '0'}}>
              <Avatar id={p.id} size={24}/>
              <span style={{flex:1, fontSize:13}}>{p.name}</span>
              <span style={{fontSize:12, fontFamily:'var(--font-mono)', color:'var(--ok)', fontWeight:600}}>{p.load}%</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  </div>
);

export const ExecView = () => (
  <div style={{padding:'20px 28px', maxWidth:1280, margin:'0 auto'}}>
    <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:14}}>
      <div>
        <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:600}}>Week 16 · for leadership</div>
        <h1 style={{fontFamily:'var(--font-serif)', fontWeight:500, fontSize:28, letterSpacing:'-0.01em', margin:'4px 0 0'}}>Exec status</h1>
      </div>
      <div style={{display:'flex',gap:8}}>
        <Btn size="sm" variant="outline" icon={<Icons.doc size={13}/>}>Export PDF</Btn>
        <Btn size="sm" variant="accent" icon={<Icons.zap size={13}/>}>Draft with Harvey IA</Btn>
      </div>
    </div>

    <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:18}}>
      {[
        { v:'6',   l:'Active projects', c:'var(--ink)' },
        { v:'62%', l:'Avg progress',    c:'var(--accent)' },
        { v:'2',   l:'At risk',         c:'var(--warn)' },
        { v:'1',   l:'Blocked',         c:'var(--risk)' },
      ].map((k, i) => (
        <Card key={i} pad={16}>
          <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.04em', textTransform:'uppercase', fontWeight:600}}>{k.l}</div>
          <div style={{fontSize:34, fontFamily:'var(--font-serif)', fontWeight:500, letterSpacing:'-0.02em', color:k.c, marginTop:4}}>{k.v}</div>
        </Card>
      ))}
    </div>

    <Card title="Narrative" pad={20} style={{marginBottom:18}}>
      <div style={{fontSize:14, lineHeight:1.65, textWrap:'pretty', color:'var(--ink-2)', maxWidth:820} as any}>
        <p style={{margin:'0 0 12px'}}>
          The Grid team held the SE-07 cutover window this week despite the ABB relay shipment slipping three weeks. Andrea has drafted runbook v3 and we're on track to hit the Q2 milestone if procurement resolves the delay by Apr 24. <b>This is the single biggest schedule risk in the portfolio.</b>
        </p>
        <p style={{margin:'0 0 12px'}}>
          Harvey IA v2 is at risk — the MAPE regression on cohort B is under review by Valentina and Lucía. We still expect Q2 shadow deploy, but confidence is medium.
        </p>
        <p style={{margin:0}}>
          Residential rollout in Maracaibo is 78% complete and ahead of plan; we'll likely beat the 4,000-meter target by two weeks.
        </p>
      </div>
    </Card>

    <Card pad={0}>
      <div style={{padding:'12px 14px', borderBottom:'1px solid var(--line)', fontSize:12, fontWeight:600, color:'var(--ink-2)', textTransform:'uppercase', letterSpacing:'.04em'}}>Per-project health</div>
      {PROJECTS.map((p, i) => (
        <div key={p.id} style={{display:'grid', gridTemplateColumns:'220px 1fr 120px 100px', padding:'12px 14px', borderTop: i ? '1px solid var(--line-2)' : '0', gap:14, alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <HealthOrb health={p.health} progress={p.progress}/>
            <div>
              <div style={{fontSize:13, fontWeight:500}}>{p.name.split('·')[0]}</div>
              <div style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)'}}>{p.code} · {p.q}</div>
            </div>
          </div>
          <div style={{fontSize:12.5, color:'var(--ink-2)', textWrap:'pretty'} as any}>
            {p.blockers ? p.blockers[0] : p.summary}
          </div>
          <StatusPill s={p.health}/>
          <div style={{display:'flex',alignItems:'center',gap:8,justifyContent:'flex-end'}}>
            <div style={{width:60}}><ProgressBar v={p.progress} c={p.health === 'at-risk' ? 'var(--warn)' : p.health === 'blocked' ? 'var(--risk)' : 'var(--accent)'}/></div>
            <span style={{fontFamily:'var(--font-mono)', fontSize:12, width:32, textAlign:'right'}}>{p.progress}%</span>
          </div>
        </div>
      ))}
    </Card>
  </div>
);

export const InboxView = () => (
  <div style={{padding:'20px 28px', maxWidth:860, margin:'0 auto'}}>
    <div style={{marginBottom:14}}>
      <h1 style={{fontFamily:'var(--font-serif)', fontWeight:500, fontSize:26, letterSpacing:'-0.01em', margin:0}}>Inbox</h1>
    </div>
    <Card pad={0}>
      {[...NOTIFICATIONS, ...NOTIFICATIONS].map((n, i) => {
        const p = n.who === 'sys' ? null : PEOPLE.find(x => x.id === n.who);
        return (
          <div key={i} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'14px 16px',borderBottom: i < 9 ? '1px solid var(--line-2)' : '0'}}>
            {p ? <Avatar id={n.who} size={28}/> : (
              <span style={{width:28,height:28,borderRadius:28,background:'var(--navy-100)',display:'inline-flex',alignItems:'center',justifyContent:'center',color:'var(--navy-600)',flex:'none'}}>
                <Icons.zap size={13}/>
              </span>
            )}
            <div style={{flex:1, fontSize:13}}>
              <div>
                <b>{p ? p.name : 'System'}</b>{' '}
                <span style={{color:'var(--ink-3)'}}>{n.text}</span>{' '}
                <b>{n.what}</b>
              </div>
              <div style={{fontSize:11, color:'var(--ink-4)', marginTop:3}}>{n.t} ago</div>
            </div>
            {i < 3 && <Dot c="var(--accent)"/>}
          </div>
        );
      })}
    </Card>
  </div>
);
