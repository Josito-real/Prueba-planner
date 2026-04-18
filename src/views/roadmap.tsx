// Roadmap — quarters with swimlanes + novel capacity heat columns + cross-project dep threads.
import { Fragment, useState } from 'react';
import { DEPS, PEOPLE, QUARTERS } from '../data';
import { Icons } from '../icons';
import { actions, useAppState, type Scale } from '../store';
import { Btn, Card, DepThread, HealthOrb } from '../ui';

export const Roadmap = ({ openProject }: { openProject: (id: string) => void }) => {
  const allProjects = useAppState(s => s.projects);
  const scale = useAppState(s => s.roadmapScale);
  const hiddenDepts = useAppState(s => s.roadmapDepts);
  const hiddenOwners = useAppState(s => s.roadmapOwners);

  const projects = allProjects.filter(p => !hiddenDepts.includes(p.dept) && !hiddenOwners.includes(p.owner));

  // Scale controls visible range: year = 2026 full, quarter = Q2 only (Apr–Jun), month = April only
  const range = scaleRange(scale);
  const startDate = new Date(range.start).getTime();
  const endDate   = new Date(range.end).getTime();
  const span = endDate - startDate;
  const laneH = 44;
  const headerH = 48;
  const width = 1060;
  const pctX = (iso: string) => {
    const t = new Date(iso).getTime();
    const clamped = Math.max(startDate, Math.min(endDate, t));
    return ((clamped - startDate) / span) * width;
  };

  const boxes = projects.map((p, i) => {
    const x1 = pctX(p.start), x2 = pctX(p.end);
    return { p, x: x1, w: Math.max(4, x2 - x1), y: headerH + i * laneH + 8, h: laneH - 16 };
  });

  // lookup for deps
  const boxOf = (id: string) => boxes.find(b => b.p.id === id);

  return (
    <div style={{padding:'20px 28px', maxWidth:1280, margin:'0 auto'}}>
      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:14}}>
        <div>
          <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:600}}>2026 · company</div>
          <h1 style={{fontFamily:'var(--font-serif)', fontWeight:500, fontSize:28, letterSpacing:'-0.01em', margin:'4px 0 0'}}>Roadmap</h1>
        </div>
        <div style={{display:'flex', gap:8}}>
          {(['year','quarter','month'] as Scale[]).map(s => (
            <Btn key={s} size="sm" variant={scale === s ? 'subtle' : 'ghost'} onClick={() => actions.setRoadmapScale(s)}>
              {s[0].toUpperCase() + s.slice(1)}
            </Btn>
          ))}
          <span style={{width:12}}/>
          <FilterPopover
            label="Dept"
            icon={<Icons.filter size={13}/>}
            options={['Grid','Solar','Residential','Harvey IA','Ops'].map(d => ({ value: d, label: d }))}
            hidden={hiddenDepts}
            toggle={actions.toggleRoadmapDept}
          />
          <FilterPopover
            label="Owner"
            icon={<Icons.team size={13}/>}
            options={PEOPLE.map(p => ({ value: p.id, label: p.name }))}
            hidden={hiddenOwners}
            toggle={actions.toggleRoadmapOwner}
          />
        </div>
      </div>

      <Card pad={0}>
        <div style={{display:'flex'}}>
          <div style={{width:200, borderRight:'1px solid var(--line)', flex:'none'}}>
            <div style={{height:headerH, borderBottom:'1px solid var(--line)', padding:'0 14px', display:'flex', alignItems:'center', fontSize:11, color:'var(--ink-3)', letterSpacing:'.04em', textTransform:'uppercase', fontWeight:600}}>Project</div>
            {projects.map((p, i) => (
              <div key={p.id} onClick={() => openProject(p.id)} style={{
                height:laneH, borderBottom: i < projects.length - 1 ? '1px solid var(--line-2)' : '0',
                padding:'0 14px', display:'flex', alignItems:'center', gap:10, cursor:'pointer',
              }}>
                <HealthOrb health={p.health} progress={p.progress} size={12}/>
                <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-4)'}}>{p.code}</span>
                <span style={{fontSize:12.5, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{p.name.split('·')[0]}</span>
              </div>
            ))}
          </div>
          <div style={{flex:1, overflow:'auto'}}>
            <div style={{position:'relative', width:width, minWidth:width}}>
              <svg width={width} height={headerH + projects.length * laneH}>
                {/* scale headers */}
                {scale === 'year' && QUARTERS.map((q, i) => {
                  const qx = (width / 4) * i;
                  return (
                    <g key={q.id}>
                      <rect x={qx} y={0} width={width/4} height={headerH} fill={i % 2 ? 'transparent' : 'var(--paper-2)'}/>
                      <text x={qx+12} y={18} fontSize="11" fill="var(--ink-3)" fontWeight="600" style={{letterSpacing:'.04em'}}>{q.label.toUpperCase()}</text>
                      {q.months.map((m, mi) => (
                        <text key={mi} x={qx + (width/12) * mi + 8} y={38} fontSize="10" fontFamily="var(--font-mono)" fill="var(--ink-4)">{m}</text>
                      ))}
                      {i > 0 && <line x1={qx} x2={qx} y1={0} y2={headerH + projects.length * laneH} stroke="var(--line)"/>}
                    </g>
                  );
                })}
                {scale === 'quarter' && range.months.map((m, i) => {
                  const mx = (width / range.months.length) * i;
                  return (
                    <g key={m}>
                      <rect x={mx} y={0} width={width/range.months.length} height={headerH} fill={i % 2 ? 'transparent' : 'var(--paper-2)'}/>
                      <text x={mx+12} y={22} fontSize="12" fill="var(--ink-3)" fontWeight="600" style={{letterSpacing:'.04em'}}>{m.toUpperCase()}</text>
                      {i > 0 && <line x1={mx} x2={mx} y1={0} y2={headerH + projects.length * laneH} stroke="var(--line)"/>}
                    </g>
                  );
                })}
                {scale === 'month' && range.weeks.map((w, i) => {
                  const wx = (width / range.weeks.length) * i;
                  return (
                    <g key={w}>
                      <rect x={wx} y={0} width={width/range.weeks.length} height={headerH} fill={i % 2 ? 'transparent' : 'var(--paper-2)'}/>
                      <text x={wx+8} y={22} fontSize="11" fontFamily="var(--font-mono)" fill="var(--ink-3)">{w}</text>
                      {i > 0 && <line x1={wx} x2={wx} y1={0} y2={headerH + projects.length * laneH} stroke="var(--line)"/>}
                    </g>
                  );
                })}
                {/* lane separators */}
                {projects.map((_, i) => (
                  <line key={i} x1={0} x2={width} y1={headerH + (i+1) * laneH} y2={headerH + (i+1) * laneH} stroke="var(--line-2)"/>
                ))}
                {/* now line */}
                <line x1={pctX('2026-04-17')} x2={pctX('2026-04-17')} y1={headerH-8} y2={headerH + projects.length * laneH} stroke="var(--accent)" strokeWidth="1.2" strokeDasharray="4 3"/>
                <circle cx={pctX('2026-04-17')} cy={headerH-8} r="3" fill="var(--accent)"/>

                {/* bars */}
                {boxes.map(b => {
                  const c = `oklch(0.72 0.09 ${b.p.hue})`;
                  const c2 = `oklch(0.55 0.14 ${b.p.hue})`;
                  const fill = b.p.health === 'at-risk' ? 'var(--warn)' : b.p.health === 'blocked' ? 'var(--risk)' : c2;
                  return (
                    <g key={b.p.id} style={{cursor:'pointer'}} onClick={() => openProject(b.p.id)}>
                      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="6" fill={c} opacity=".35"/>
                      <rect x={b.x} y={b.y} width={b.w * (b.p.progress/100)} height={b.h} rx="6" fill={fill}/>
                      <text x={b.x+10} y={b.y+b.h/2+4} fontSize="11" fontWeight="600" fill="white" style={{pointerEvents:'none'}}>
                        {b.p.progress}% · {b.p.name.split('·')[0].trim()}
                      </text>
                    </g>
                  );
                })}

                {/* Dep threads */}
                {DEPS.map((d, i) => {
                  const a = boxOf(d.from), b = boxOf(d.to);
                  if (!a || !b) return null;
                  return <DepThread key={i} x1={a.x+a.w} y1={a.y+a.h/2} x2={b.x} y2={b.y+b.h/2} kind={d.kind}/>;
                })}
              </svg>
            </div>
          </div>
        </div>
      </Card>

      {/* Capacity heat columns — novel */}
      <div style={{marginTop:20}}>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:12}}>
          <div style={{fontSize:12, fontWeight:600, color:'var(--ink-2)', letterSpacing:'.02em', textTransform:'uppercase'}}>Capacity heat · by month</div>
          <span style={{fontSize:11, color:'var(--ink-4)'}}>warmer = more overload</span>
        </div>
        <CapacityHeatBand/>
      </div>

      {/* Dep legend */}
      <div style={{display:'flex', gap:16, marginTop:14, fontSize:11, color:'var(--ink-3)'}}>
        <span style={{display:'flex', alignItems:'center', gap:6}}><span style={{width:16,height:1.5,background:'var(--risk)',display:'inline-block',borderTop:'1px dashed var(--risk)'}}/> blocks</span>
        <span style={{display:'flex', alignItems:'center', gap:6}}><span style={{width:16,height:1.5,background:'var(--accent)'}}/> feeds</span>
        <span style={{display:'flex', alignItems:'center', gap:6}}><span style={{width:16,height:1.5,background:'#7a52c0'}}/> enables</span>
      </div>
    </div>
  );
};

function scaleRange(scale: Scale): { start: string; end: string; months: string[]; weeks: string[] } {
  if (scale === 'quarter') {
    return { start:'2026-04-01', end:'2026-06-30', months:['Apr','May','Jun'], weeks:[] };
  }
  if (scale === 'month') {
    return { start:'2026-04-01', end:'2026-04-30', months:['Apr'], weeks:['Apr 1','Apr 8','Apr 15','Apr 22','Apr 29'] };
  }
  return { start:'2026-01-01', end:'2026-12-31', months:[], weeks:[] };
}

const FilterPopover = ({ label, icon, options, hidden, toggle }: {
  label: string; icon?: React.ReactNode;
  options: { value: string; label: string }[];
  hidden: string[];
  toggle: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const activeCount = options.length - hidden.length;
  const allActive = hidden.length === 0;
  return (
    <div style={{position:'relative'}}>
      <Btn size="sm" variant={allActive ? 'outline' : 'accent'} icon={icon} onClick={() => setOpen(v => !v)}>
        {label}{allActive ? '' : ` · ${activeCount}/${options.length}`}
      </Btn>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{position:'fixed', inset:0, zIndex:29}}/>
          <div style={{position:'absolute', top:34, right:0, minWidth:200, background:'var(--paper)', border:'1px solid var(--line)', borderRadius:8, boxShadow:'0 8px 24px -8px rgba(6,14,31,.2)', zIndex:30, padding:4, maxHeight:320, overflowY:'auto'}}>
            {options.map(o => {
              const visible = !hidden.includes(o.value);
              return (
                <button key={o.value} onClick={() => toggle(o.value)}
                  style={{display:'flex', alignItems:'center', gap:10, width:'100%', padding:'7px 10px', border:0, borderRadius:6, background:'transparent', cursor:'pointer', fontSize:13, color:'var(--ink)', textAlign:'left'}}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <span style={{width:14, height:14, border:'1.5px solid var(--line)', borderRadius:4, display:'inline-flex', alignItems:'center', justifyContent:'center', background: visible ? 'var(--accent)' : 'transparent', borderColor: visible ? 'var(--accent)' : 'var(--line)'}}>
                    {visible && <Icons.check size={10}/>}
                  </span>
                  {o.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export const CapacityHeatBand = () => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const depts = ['Grid','Solar','Residential','Harvey IA','Ops'];
  // synth data
  const rng = (i: number, j: number) => ((i*7 + j*13 + 3) % 11) / 10;
  return (
    <Card pad={0}>
      <div style={{display:'grid', gridTemplateColumns:'140px repeat(12, 1fr)'}}>
        <div style={{padding:'10px 14px', fontSize:11, color:'var(--ink-3)', borderBottom:'1px solid var(--line)', fontWeight:600, letterSpacing:'.04em', textTransform:'uppercase'}}>Dept / month</div>
        {months.map((m, i) => (
          <div key={m} style={{padding:'10px 0', fontSize:11, color:'var(--ink-4)', borderBottom:'1px solid var(--line)', textAlign:'center', fontFamily:'var(--font-mono)', background: i === 3 ? 'var(--paper-2)' : 'transparent'}}>{m}</div>
        ))}
        {depts.map((d, di) => (
          <Fragment key={d}>
            <div style={{padding:'10px 14px', fontSize:12.5, fontWeight:500, borderBottom: di < depts.length - 1 ? '1px solid var(--line-2)' : '0'}}>{d}</div>
            {months.map((m, mi) => {
              const v = 0.3 + rng(di, mi) * 0.9;
              const h = v > 1.0 ? 'var(--risk)' : v > 0.85 ? 'var(--warn)' : 'var(--accent)';
              const op = v > 1.0 ? 1 : v;
              return (
                <div key={mi} title={`${d} · ${m} · ${Math.round(v*100)}%`}
                  style={{
                    borderBottom: di < depts.length - 1 ? '1px solid var(--line-2)' : '0',
                    padding:6, background: mi === 3 ? 'color-mix(in oklab, var(--paper-2) 60%, white)' : 'transparent',
                  }}>
                  <div style={{height:24, borderRadius:4, background:h, opacity: op*.85}}/>
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </Card>
  );
};
