// Minimal line icons, 20px grid. Never decorative — always functional.
import type { ComponentType, ReactNode, SVGProps } from 'react';

type IcProps = Omit<SVGProps<SVGSVGElement>, 'd' | 'stroke' | 'fill'> & {
  d: string | ReactNode;
  size?: number;
  stroke?: number;
  fill?: string;
};

const Ic = ({ d, size = 16, stroke = 1.6, fill = 'none', ...p }: IcProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill={fill} stroke="currentColor"
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {typeof d === 'string' ? <path d={d}/> : d}
  </svg>
);

export type IconProps = Omit<IcProps, 'd'>;
export type IconComponent = ComponentType<IconProps>;

export const Icons: Record<string, IconComponent> = {
  search:   (p)=> <Ic {...p} d={<><circle cx="9" cy="9" r="5.2"/><path d="m13 13 3.2 3.2"/></>}/>,
  plus:     (p)=> <Ic {...p} d="M10 4v12M4 10h12"/>,
  check:    (p)=> <Ic {...p} d="m4.5 10.5 3.2 3.2L15.5 6"/>,
  chev:     (p)=> <Ic {...p} d="m7 5 5 5-5 5"/>,
  chevDn:   (p)=> <Ic {...p} d="m5 7 5 5 5-5"/>,
  arrow:    (p)=> <Ic {...p} d="M4 10h12m-4-4 4 4-4 4"/>,
  flag:     (p)=> <Ic {...p} d="M5 3v14M5 3h9l-2 3 2 3H5"/>,
  dot:      (p)=> <Ic {...p} d={<circle cx="10" cy="10" r="3" fill="currentColor"/>}/>,
  orb:      (p)=> <Ic {...p} d={<><circle cx="10" cy="10" r="6.5"/><path d="M10 3.5a6.5 6.5 0 0 0 0 13"/></>}/>,
  today:    (p)=> <Ic {...p} d={<><rect x="3" y="4" width="14" height="13" rx="2"/><path d="M3 8h14M7 2v4M13 2v4"/></>}/>,
  kanban:   (p)=> <Ic {...p} d={<><rect x="3" y="3" width="4" height="14" rx="1"/><rect x="9" y="3" width="4" height="10" rx="1"/><rect x="15" y="3" width="2" height="7" rx="1"/></>}/>,
  list:     (p)=> <Ic {...p} d="M5 5h12M5 10h12M5 15h12"/>,
  gantt:    (p)=> <Ic {...p} d={<><path d="M3 5h7M3 10h10M3 15h6"/><path d="M7 5v10" strokeDasharray="1.5 2"/></>}/>,
  table:    (p)=> <Ic {...p} d={<><rect x="3" y="3" width="14" height="14" rx="1"/><path d="M3 8h14M3 13h14M8 3v14M13 3v14"/></>}/>,
  cal:      (p)=> <Ic {...p} d={<><rect x="3" y="4" width="14" height="13" rx="2"/><path d="M3 8h14M7 2v4M13 2v4"/></>}/>,
  map:      (p)=> <Ic {...p} d={<><path d="M3 5v12l4-2 6 2 4-2V3l-4 2-6-2-4 2Z"/><path d="M7 3v12M13 5v12"/></>}/>,
  folder:   (p)=> <Ic {...p} d="M3 6a2 2 0 0 1 2-2h3l2 2h5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"/>,
  team:     (p)=> <Ic {...p} d={<><circle cx="7" cy="8" r="2.5"/><circle cx="14" cy="8" r="2"/><path d="M3 16c0-2.5 2-4 4-4s4 1.5 4 4M11 16c0-2 1.6-3.2 3-3.2s3 1.2 3 3.2"/></>}/>,
  capacity: (p)=> <Ic {...p} d={<><path d="M3 17h14"/><path d="M5 14v3M9 10v7M13 12v5M17 6v11"/></>}/>,
  bell:     (p)=> <Ic {...p} d="M6 15h8m-6 0a2 2 0 0 0 4 0M5 13V9a5 5 0 0 1 10 0v4l1 2H4l1-2Z"/>,
  cmd:      (p)=> <Ic {...p} d="M7 3a2 2 0 1 0 0 4h6a2 2 0 1 0 0-4m0 14a2 2 0 1 1 0-4h6a2 2 0 1 1 0 4M13 7H7m0 6h6M3 5a2 2 0 0 1 4 0v10a2 2 0 0 1-4 0m14 0a2 2 0 0 1-4 0V5a2 2 0 0 1 4 0"/>,
  filter:   (p)=> <Ic {...p} d="M3 5h14l-5 6v4l-4 1v-5L3 5Z"/>,
  more:     (p)=> <Ic {...p} d={<><circle cx="5" cy="10" r="1" fill="currentColor"/><circle cx="10" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></>}/>,
  zap:      (p)=> <Ic {...p} d="M11 2 4 12h4l-1 6 7-10h-4l1-6Z"/>,
  link:     (p)=> <Ic {...p} d={<><path d="M8 12 12 8m-2-4 2-2a3 3 0 0 1 4 4l-2 2M4 10l-2 2a3 3 0 0 0 4 4l2-2"/></>}/>,
  doc:      (p)=> <Ic {...p} d="M5 3h7l4 4v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 0v4h4M7 10h6M7 13h6M7 7h3"/>,
  close:    (p)=> <Ic {...p} d="m5 5 10 10M15 5 5 15"/>,
  menu:     (p)=> <Ic {...p} d="M3 5h14M3 10h14M3 15h14"/>,
  grip:     (p)=> <Ic {...p} d={<><circle cx="8" cy="6" r=".8" fill="currentColor"/><circle cx="12" cy="6" r=".8" fill="currentColor"/><circle cx="8" cy="10" r=".8" fill="currentColor"/><circle cx="12" cy="10" r=".8" fill="currentColor"/><circle cx="8" cy="14" r=".8" fill="currentColor"/><circle cx="12" cy="14" r=".8" fill="currentColor"/></>}/>,
  clock:    (p)=> <Ic {...p} d={<><circle cx="10" cy="10" r="6.5"/><path d="M10 6v4l2.5 2"/></>}/>,
  settings: (p)=> <Ic {...p} d={<><circle cx="10" cy="10" r="2.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.5 4.5l1.4 1.4M14.1 14.1l1.4 1.4M4.5 15.5l1.4-1.4M14.1 5.9l1.4-1.4"/></>}/>,
  star:     (p)=> <Ic {...p} d="m10 3 2.2 4.5 5 .7-3.6 3.5.9 5L10 14.3 5.5 16.7l.9-5L2.8 8.2l5-.7L10 3Z"/>,
  warn:     (p)=> <Ic {...p} d="m10 3 8 14H2L10 3Zm0 5v5m0 1.5v.5"/>,
  block:    (p)=> <Ic {...p} d={<><circle cx="10" cy="10" r="6.5"/><path d="m5.5 5.5 9 9"/></>}/>,
};

// Krill-spiral mark — the app's identity glyph
export const KrillMark = ({ size = 20, c1 = 'var(--accent)', c2 = 'var(--accent-2)' }: { size?: number; c1?: string; c2?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <defs>
      <linearGradient id="krillg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor={c1}/>
        <stop offset="1" stopColor={c2}/>
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10.5" fill="url(#krillg)"/>
    <path d="M7.5 12a4.5 4.5 0 1 1 4.5 4.5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="1.6" fill="white"/>
  </svg>
);
