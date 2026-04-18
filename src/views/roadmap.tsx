// Roadmap — quarters with swimlanes + novel capacity heat columns + cross-project dep threads.
import { Fragment } from 'react';
import { DEPS, PROJECTS, QUARTERS } from '../data';
import { Icons } from '../icons';
import { Btn, Card, DepThread, HealthOrb } from '../ui';

export const Roadmap = ({ openProject }: { openProject: (id: string) => void }) => {
  const startDate = new Date('2026-01-01').getTime();
  const endDate   = new Date('2026-12-31').getTime();
  const span = endDate - startDate;
  const laneH = 44;
  const headerH = 48;
  const width = 1060;
  const pctX = (iso: string) => ((new Date(iso).getTime() - startDate) / span) * width;

  const boxes = PROJECTS.map((p, i) => {
    const x1 = pctX(p.start), x2 = pctX(p.end);
    return { p, x: x1, w: x2 - x1, y: headerH + i * laneH + 8, h: laneH - 16 };
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
          <Btn size="sm" variant="subtle">Year</Btn>
          <Btn size="sm" variant="ghost">Quarter</Btn>
          <Btn size="sm" variant="ghost">Month</Btn>
          <span style={{width:12}}/>
          <Btn size="sm" variant="outline" icon={<Icons.filter size={13}/>}>Dept</Btn>
          <Btn size="sm" variant="outline" icon={<Icons.team size={13}/>}>Owner</Btn>
        </div>
      </div>

      <Card pad={0}>
        <div style={{display:'flex'}}>
          <div style={{width:200, borderRight:'1px solid var(--line)', flex:'none'}}>
            <div style={{height:headerH, borderBottom:'1px solid var(--line)', padding:'0 14px', display:'flex', alignItems:'center', fontSize:11, color:'var(--ink-3)', letterSpacing:'.04em', textTransform:'uppercase', fontWeight:600}}>Project</div>
            {PROJECTS.map((p, i) => (
              <div key={p.id} onClick={() => openProject(p.id)} style={{
                height:laneH, borderBottom: i < PROJECTS.length - 1 ? '1px solid var(--line-2)' : '0',
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
              <svg width={width} height={headerH + PROJECTS.length * laneH}>
                {/* quarter headers */}
                {QUARTERS.map((q, i) => {
                  const qx = (width / 4) * i;
                  return (
                    <g key={q.id}>
                      <rect x={qx} y={0} width={width/4} height={headerH} fill={i % 2 ? 'transparent' : 'var(--paper-2)'}/>
                      <text x={qx+12} y={18} fontSize="11" fill="var(--ink-3)" fontWeight="600" style={{letterSpacing:'.04em'}}>{q.label.toUpperCase()}</text>
                      {q.months.map((m, mi) => (
                        <text key={mi} x={qx + (width/12) * mi + 8} y={38} fontSize="10" fontFamily="var(--font-mono)" fill="var(--ink-4)">{m}</text>
                      ))}
                      {i > 0 && <line x1={qx} x2={qx} y1={0} y2={headerH + PROJECTS.length * laneH} stroke="var(--line)"/>}
                    </g>
                  );
                })}
                {/* month grid */}
                {Array.from({ length: 11 }, (_, i) => i + 1).map(i => (
                  <line key={i} x1={(width/12) * i} x2={(width/12) * i} y1={headerH} y2={headerH + PROJECTS.length * laneH} stroke="var(--line-2)"/>
                ))}
                {/* lane separators */}
                {PROJECTS.map((_, i) => (
                  <line key={i} x1={0} x2={width} y1={headerH + (i+1) * laneH} y2={headerH + (i+1) * laneH} stroke="var(--line-2)"/>
                ))}
                {/* now line */}
                <line x1={pctX('2026-04-17')} x2={pctX('2026-04-17')} y1={headerH-8} y2={headerH + PROJECTS.length * laneH} stroke="var(--accent)" strokeWidth="1.2" strokeDasharray="4 3"/>
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
