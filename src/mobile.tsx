// Mobile companion — iOS-style frame with Today and Project views.
import { createElement, type CSSProperties, type ReactNode } from 'react';
import { PEOPLE, PRIO_META, PROJECTS, TASKS, TASK_STATUS_META, TODAY } from './data';
import { Icons } from './icons';
import { Avatar, AvatarStack, HealthOrb, Pill, StatusPill } from './ui';
import { fmtTime } from './views/today';

const MobileFrame = ({ children }: { children: ReactNode }) => (
  <div style={{
    width:390, height:810, background:'#000', borderRadius:44, padding:10,
    boxShadow:'0 30px 80px -20px rgba(10,20,40,.35), 0 0 0 1px rgba(0,0,0,.4)',
    position:'relative',
  }}>
    <div style={{width:'100%', height:'100%', background:'var(--paper)', borderRadius:34, overflow:'hidden', position:'relative', display:'flex', flexDirection:'column'}}>
      {/* status bar */}
      <div style={{height:44, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', fontSize:14, fontWeight:600, flex:'none'}}>
        <span style={{fontFamily:'var(--font-mono)'}}>9:41</span>
        <div style={{position:'absolute',left:'50%',transform:'translateX(-50%)',top:12,width:112,height:28,background:'#000',borderRadius:20}}/>
        <div style={{display:'flex', gap:5, alignItems:'center'}}>
          <svg width="16" height="10" viewBox="0 0 16 10"><path d="M1 9h1M4 7h1M7 5h1M10 3h1M13 1h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <svg width="14" height="10" viewBox="0 0 14 10"><rect x=".5" y="2.5" width="11" height="5" rx="1.3" stroke="currentColor" fill="none"/><rect x="2" y="4" width="8" height="2" fill="currentColor"/></svg>
        </div>
      </div>
      {children}
    </div>
  </div>
);

const MobileToday = () => (
  <div style={{flex:1, overflow:'hidden', display:'flex', flexDirection:'column'}}>
    <div style={{padding:'10px 20px 6px'}}>
      <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:600}}>Friday Apr 17</div>
      <div style={{fontFamily:'var(--font-serif)', fontSize:26, fontWeight:500, letterSpacing:'-0.01em', marginTop:2}}>Morning, Andrea</div>
    </div>

    {/* mini strip */}
    <div style={{padding:'0 16px 10px'}}>
      <div style={{background:'var(--paper-2)', borderRadius:12, padding:12, position:'relative'}}>
        <div style={{fontSize:11, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.04em', fontWeight:600}}>Now</div>
        <div style={{fontSize:15, fontWeight:600, marginTop:3}}>Runbook v3 — SE-07</div>
        <div style={{fontSize:11, color:'var(--ink-3)', marginTop:2}}>9:00a–11:30a · deep focus</div>
        <div style={{marginTop:10, height:4, borderRadius:4, background:'var(--line)', overflow:'hidden'}}>
          <div style={{width:'62%', height:'100%', background:'var(--accent)'}}/>
        </div>
        <div style={{fontSize:10, color:'var(--ink-4)', marginTop:4, fontFamily:'var(--font-mono)'}}>1h 35m remaining</div>
      </div>
    </div>

    <div style={{padding:'4px 20px', fontSize:11, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.04em', fontWeight:600}}>Up next</div>
    <div style={{padding:'0 16px', overflowY:'auto', flex:1}}>
      {TODAY.blocks.filter(b => b.t > 11.4 && b.kind !== 'break').map((b, i) => (
        <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 4px', borderBottom:'1px solid var(--line-2)'}}>
          <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)', width:48}}>{fmtTime(b.t)}</span>
          <span style={{width:3, height:24, borderRadius:2, background: b.kind==='focus'?'var(--accent)':b.kind==='review'?'#7a52c0':'var(--ink-4)'}}/>
          <span style={{fontSize:13, fontWeight:500, flex:1}}>{b.label}</span>
          {b.proj && <Pill small>{PROJECTS.find(p => p.id === b.proj)?.code}</Pill>}
        </div>
      ))}
      <div style={{padding:'12px 4px 4px', fontSize:11, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.04em', fontWeight:600}}>Pulled tasks</div>
      {TODAY.pull.map(id => {
        const t = TASKS.find(x => x.id === id); if (!t) return null;
        const st = TASK_STATUS_META[t.status];
        return (
          <div key={t.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 4px', borderBottom:'1px solid var(--line-2)'}}>
            <span style={{width:14,height:14,border:`1.5px solid ${st.c}`, borderRadius:4, flex:'none'}}/>
            <span style={{fontSize:12.5, flex:1, textWrap:'pretty'} as CSSProperties}>{t.title}</span>
            <Pill small c={PRIO_META[t.prio].c}>{PRIO_META[t.prio].label}</Pill>
          </div>
        );
      })}
    </div>

    {/* bottom tab bar */}
    <div style={{height:70, borderTop:'1px solid var(--line)', display:'flex', alignItems:'flex-start', justifyContent:'space-around', paddingTop:8, background:'var(--paper)', flex:'none'}}>
      {[
        { i:'today',  l:'Today',    a:true },
        { i:'kanban', l:'Board' },
        { i:'bell',   l:'Inbox',    badge:true },
        { i:'folder', l:'Projects' },
      ].map(t => (
        <div key={t.l} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3, color: t.a ? 'var(--accent)' : 'var(--ink-3)', fontSize:10, position:'relative'}}>
          {createElement(Icons[t.i] || Icons.dot, { size:20 })}
          {t.badge && <span style={{position:'absolute',top:-2,right:18,width:7,height:7,borderRadius:7,background:'var(--accent)'}}/>}
          {t.l}
        </div>
      ))}
    </div>
  </div>
);

const MobileProject = () => {
  const p = PROJECTS[2]; // SE-07
  return (
    <div style={{flex:1, overflow:'auto', display:'flex', flexDirection:'column'}}>
      <div style={{padding:'14px 20px 18px', background:`linear-gradient(160deg, oklch(0.92 0.04 ${p.hue}), var(--paper))`}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <Icons.chev size={18} style={{transform:'rotate(180deg)'}}/>
          <span style={{fontFamily:'var(--font-mono)', fontSize:11, color:'var(--ink-3)'}}>{p.code}</span>
          <span style={{flex:1}}/>
          <Icons.more size={16}/>
        </div>
        <h2 style={{fontFamily:'var(--font-serif)', fontSize:22, fontWeight:500, letterSpacing:'-0.01em', margin:'10px 0 6px'}}>{p.name}</h2>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <StatusPill s={p.status} small/>
          <Pill small>{p.q}</Pill>
        </div>
        <div style={{display:'flex', gap:8, alignItems:'center', marginTop:14}}>
          <HealthOrb health={p.health} progress={p.progress} size={18}/>
          <span style={{fontSize:22, fontFamily:'var(--font-serif)', fontWeight:600}}>{p.progress}%</span>
          <span style={{flex:1}}/>
          <AvatarStack ids={p.team} size={22}/>
        </div>
      </div>
      <div style={{padding:'6px 16px 12px'}}>
        <div style={{display:'flex', gap:6, overflowX:'auto'}}>
          {['Overview','Tasks','Docs','Activity'].map((t, i) => (
            <span key={t} style={{padding:'6px 12px', borderRadius:20, fontSize:12, fontWeight:500, background: i === 1 ? 'var(--ink)' : 'var(--paper-2)', color: i === 1 ? 'white' : 'var(--ink-2)'}}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{padding:'0 16px 16px'}}>
        {TASKS.filter(t => t.proj === p.id).map(t => {
          return (
            <div key={t.id} style={{padding:'12px 12px', background:'var(--paper)', border:'1px solid var(--line)', borderRadius:10, marginBottom:8}}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--ink-4)'}}>{t.id}</span>
                <StatusPill s={t.status} small/>
                <span style={{flex:1}}/>
                <Pill small c={PRIO_META[t.prio].c}>{PRIO_META[t.prio].label}</Pill>
              </div>
              <div style={{fontSize:13, fontWeight:500, lineHeight:1.35, textWrap:'pretty'} as CSSProperties}>{t.title}</div>
              <div style={{display:'flex', alignItems:'center', gap:8, marginTop:10}}>
                <Avatar id={t.owner} size={18}/>
                <span style={{fontSize:11, color:'var(--ink-3)'}}>{PEOPLE.find(pp => pp.id === t.owner)!.name.split(' ')[0]}</span>
                <span style={{flex:1}}/>
                <span style={{fontSize:11, color:'var(--ink-3)', fontFamily:'var(--font-mono)'}}>{t.due.slice(5)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MobileShowcase = () => (
  <div style={{padding:'36px 24px', minHeight:'100vh', background:'radial-gradient(ellipse at top, var(--navy-100), var(--paper) 60%)'}}>
    <div style={{maxWidth:1000, margin:'0 auto'}}>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:600}}>On the go</div>
        <h1 style={{fontFamily:'var(--font-serif)', fontWeight:500, fontSize:28, letterSpacing:'-0.01em', margin:'4px 0 0'}}>Mobile companion</h1>
        <div style={{fontSize:14, color:'var(--ink-3)', marginTop:4}}>Field-engineer view. Check your day, triage, and unblock from the site.</div>
      </div>
      <div style={{display:'flex', gap:40, justifyContent:'center', alignItems:'flex-start', flexWrap:'wrap'}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
          <MobileFrame><MobileToday/></MobileFrame>
          <div style={{fontSize:12, color:'var(--ink-3)'}}>Today</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
          <MobileFrame><MobileProject/></MobileFrame>
          <div style={{fontSize:12, color:'var(--ink-3)'}}>Project detail</div>
        </div>
      </div>
    </div>
  </div>
);
