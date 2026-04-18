// Shared UI primitives: Avatar, Pill, Dot, Chip, HealthOrb, Progress, Thread, etc.
import type { CSSProperties, ReactNode } from 'react';
import { PEOPLE, STATUS_META } from './data';

export const Avatar = ({ id, size = 22, ring = false }: { id: string; size?: number; ring?: boolean }) => {
  const p = PEOPLE.find(x => x.id === id);
  if (!p) return null;
  const hue = (id.charCodeAt(2) * 37) % 360;
  const bg = `oklch(0.72 0.08 ${hue})`;
  return (
    <span
      title={p.name}
      style={{
        width:size, height:size, borderRadius:size,
        background:bg, color:'white', display:'inline-flex',
        alignItems:'center', justifyContent:'center',
        fontSize:size*0.42, fontWeight:600, letterSpacing:'-0.02em',
        boxShadow: ring ? '0 0 0 2px var(--paper), 0 0 0 3px var(--line)' : 'none',
        flex:'none',
      }}>
      {p.init}
    </span>
  );
};

export const AvatarStack = ({ ids, size = 22, max = 4 }: { ids: string[]; size?: number; max?: number }) => {
  const show = ids.slice(0, max);
  const extra = ids.length - show.length;
  return (
    <span style={{display:'inline-flex'}}>
      {show.map((id, i) => (
        <span key={id} style={{ marginLeft: i === 0 ? 0 : -size * 0.32 }}>
          <Avatar id={id} size={size} ring/>
        </span>
      ))}
      {extra > 0 && (
        <span style={{
          marginLeft:-size*0.32, width:size, height:size, borderRadius:size,
          background:'var(--navy-100)', color:'var(--ink-2)',
          display:'inline-flex',alignItems:'center',justifyContent:'center',
          fontSize:size*0.36, fontWeight:600, boxShadow:'0 0 0 2px var(--paper)'
        }}>+{extra}</span>
      )}
    </span>
  );
};

export const Dot = ({ c = 'var(--ink-4)', size = 6 }: { c?: string; size?: number }) => (
  <span style={{
    width:size, height:size, borderRadius:size, background:c, display:'inline-block',
    verticalAlign:'middle', flex:'none',
  }}/>
);

export const Pill = ({ children, c = 'var(--ink-3)', bg = 'transparent', bold = false, small = false }: {
  children: ReactNode; c?: string; bg?: string; bold?: boolean; small?: boolean;
}) => (
  <span style={{
    display:'inline-flex', alignItems:'center', gap:6,
    padding: small ? '2px 7px' : '3px 9px',
    borderRadius: 999,
    border:'1px solid var(--line)',
    background:bg, color:c,
    fontSize: small? 11 : 12, fontWeight: bold? 600: 500,
    fontFeatureSettings:'"tnum"',
    whiteSpace:'nowrap',
    lineHeight:1.2,
  }}>{children}</span>
);

export const StatusPill = ({ s, small }: { s: string; small?: boolean }) => {
  const m = STATUS_META[s] || STATUS_META.active;
  return <Pill small={small} c="var(--ink-2)"><Dot c={m.dot}/>{m.label}</Pill>;
};

// The Krill "status orb" — a circular indicator with fill quadrant = health
export const HealthOrb = ({ health = 'on-track', progress = 0, size = 14 }: { health?: string; progress?: number; size?: number }) => {
  const c = health === 'at-risk' ? 'var(--warn)' : health === 'blocked' ? 'var(--risk)' : health === 'shipped' ? 'var(--ok)' : 'var(--accent)';
  const r = (size - 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flex:'none'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--line)" strokeWidth="1.5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth="1.5"
        strokeDasharray={`${(progress/100)*circ} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
      {health === 'at-risk' && <circle cx={size/2} cy={size/2} r={1.6} fill={c}/>}
      {health === 'blocked' && <circle cx={size/2} cy={size/2} r={1.6} fill={c}/>}
    </svg>
  );
};

export const ProgressBar = ({ v = 0, c = 'var(--accent)', h = 4 }: { v?: number; c?: string; h?: number }) => (
  <span style={{display:'block', height:h, borderRadius:h, background:'var(--line-2)', overflow:'hidden'}}>
    <span style={{display:'block', height:'100%', width:`${Math.max(2,v)}%`, background:c, borderRadius:h, transition:'width .35s ease'}}/>
  </span>
);

export const Kbd = ({ children }: { children: ReactNode }) => (
  <span style={{
    fontFamily:'var(--font-mono)', fontSize:11, padding:'1px 5px',
    borderRadius:4, border:'1px solid var(--line)', background:'var(--paper-2)', color:'var(--ink-3)',
    lineHeight:1.4, boxShadow:'0 1px 0 var(--line)',
  }}>{children}</span>
);

type BtnProps = {
  children?: ReactNode;
  onClick?: () => void;
  variant?: 'ghost' | 'outline' | 'solid' | 'accent' | 'subtle';
  size?: 'sm' | 'md';
  icon?: ReactNode;
  style?: CSSProperties;
  title?: string;
};

export const Btn = ({ children, onClick, variant = 'ghost', size = 'md', icon, style, title }: BtnProps) => {
  const base: CSSProperties = {
    display:'inline-flex', alignItems:'center', gap:8,
    height: size === 'sm' ? 26 : 32, padding: size === 'sm' ? '0 10px' : '0 12px',
    borderRadius:8, border:'1px solid transparent',
    fontSize: size === 'sm' ? 12 : 13, fontWeight:500,
    cursor:'pointer', background:'transparent', color:'var(--ink-2)',
    transition:'background .12s, border-color .12s, color .12s',
  };
  const variants: Record<string, CSSProperties> = {
    ghost:    { },
    outline:  { border:'1px solid var(--line)', background:'var(--paper)' },
    solid:    { background:'var(--ink)', color:'white' },
    accent:   { background:'var(--accent)', color:'white' },
    subtle:   { background:'var(--paper-2)', color:'var(--ink-2)' },
  };
  return (
    <button onClick={onClick} title={title} style={{...base, ...variants[variant], ...style}}
      onMouseEnter={e => { if (variant === 'ghost') e.currentTarget.style.background = 'var(--paper-2)'; }}
      onMouseLeave={e => { if (variant === 'ghost') e.currentTarget.style.background = 'transparent'; }}>
      {icon}{children}
    </button>
  );
};

export const Card = ({ children, style, pad = 16, title, right, onClick }: {
  children: ReactNode; style?: CSSProperties; pad?: number; title?: ReactNode; right?: ReactNode; onClick?: () => void;
}) => (
  <div onClick={onClick} style={{
    background:'var(--paper)', border:'1px solid var(--line)', borderRadius:'var(--radius)',
    padding:pad, ...style, cursor: onClick ? 'pointer' : 'default',
  }}>
    {(title || right) && (
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        {title && <div style={{fontSize:12, fontWeight:600, color:'var(--ink-2)', letterSpacing:'.02em', textTransform:'uppercase'}}>{title}</div>}
        {right}
      </div>
    )}
    {children}
  </div>
);

export const Sparkbars = ({ values = [], h = 22, c = 'var(--accent)' }: { values?: number[]; h?: number; c?: string }) => (
  <span style={{display:'inline-flex', gap:2, alignItems:'flex-end', height:h}}>
    {values.map((v,i) => (
      <span key={i} style={{width:4, height:`${Math.max(8,v)}%`, background: v > 85 ? 'var(--risk)' : v > 70 ? 'var(--warn)' : c, borderRadius:1, opacity:.85}}/>
    ))}
  </span>
);

// Dep thread connector — an SVG curve between two boxes
export const DepThread = ({ x1, y1, x2, y2, kind = 'blocks' }: { x1: number; y1: number; x2: number; y2: number; kind?: string }) => {
  const colors: Record<string, string> = { blocks:'var(--risk)', feeds:'var(--accent)', enables:'#7a52c0' };
  const c = colors[kind] || 'var(--accent)';
  const dx = Math.abs(x2 - x1) * 0.4;
  const d = `M${x1} ${y1} C ${x1+dx} ${y1}, ${x2-dx} ${y2}, ${x2} ${y2}`;
  return (
    <g>
      <path d={d} fill="none" stroke={c} strokeWidth="1.4" strokeDasharray="3 3" opacity=".7"/>
      <circle cx={x2} cy={y2} r="2.2" fill={c}/>
    </g>
  );
};
