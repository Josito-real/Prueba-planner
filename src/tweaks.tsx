// Tweaks panel — accent, density, hero variant, mobile toggle.
import type { ReactNode } from 'react';
import { ACCENTS } from './data';
import { KrillMark } from './icons';

export type Tweaks = {
  accent: string;
  density: 'compact' | 'comfortable' | 'spacious';
  heroVariant: 'classic' | 'strip' | 'focus';
  mobile: boolean;
};

type TweaksPanelProps = {
  active: boolean;
  tweaks: Tweaks;
  setTweaks: (t: Tweaks) => void;
};

export const TweaksPanel = ({ active, tweaks, setTweaks }: TweaksPanelProps) => {
  if (!active) return null;
  const set = <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    try { window.parent.postMessage({ type:'__edit_mode_set_keys', edits:{ [k]: v } }, '*'); } catch {}
  };
  return (
    <div style={{
      position:'fixed', right:18, bottom:18, zIndex:60,
      width:280, background:'var(--paper)', border:'1px solid var(--line)', borderRadius:14,
      boxShadow:'0 12px 40px -8px rgba(6,14,31,.22)', overflow:'hidden',
    }}>
      <div style={{padding:'12px 14px', borderBottom:'1px solid var(--line)', display:'flex',alignItems:'center',gap:8}}>
        <KrillMark size={16}/>
        <span style={{fontSize:13, fontWeight:600}}>Tweaks</span>
        <span style={{flex:1}}/>
        <span style={{fontSize:10, color:'var(--ink-4)'}}>persist on save</span>
      </div>
      <div style={{padding:14, display:'flex', flexDirection:'column', gap:16}}>
        <Section label="Accent color">
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {Object.entries(ACCENTS).map(([k, v]) => (
              <button key={k} onClick={() => set('accent', k)} title={v.label}
                style={{
                  width:28, height:28, borderRadius:8, cursor:'pointer',
                  background:`linear-gradient(135deg, ${v.c}, ${v.c2})`,
                  border: tweaks.accent === k ? '2px solid var(--ink)' : '1px solid var(--line)',
                }}/>
            ))}
          </div>
        </Section>
        <Section label="Density">
          <Seg options={[['compact','Compact'],['comfortable','Comfy'],['spacious','Airy']]} value={tweaks.density} onChange={(v) => set('density', v as Tweaks['density'])}/>
        </Section>
        <Section label="Hero view">
          <Seg options={[['strip','Time strip'],['classic','Agenda'],['focus','Focus']]} value={tweaks.heroVariant} onChange={(v) => set('heroVariant', v as Tweaks['heroVariant'])}/>
        </Section>
        <Section label="Show mobile screens">
          <Seg options={[[false,'Off'],[true,'On']]} value={tweaks.mobile} onChange={(v) => set('mobile', v as boolean)}/>
        </Section>
      </div>
    </div>
  );
};

const Section = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <div style={{fontSize:11, color:'var(--ink-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em', marginBottom:6}}>{label}</div>
    {children}
  </div>
);

type SegValue = string | boolean;
const Seg = ({ options, value, onChange }: { options: [SegValue, string][]; value: SegValue; onChange: (v: SegValue) => void }) => (
  <div style={{display:'inline-flex', padding:2, background:'var(--paper-2)', borderRadius:8, border:'1px solid var(--line)'}}>
    {options.map(([v, l]) => (
      <button key={String(v)} onClick={() => onChange(v)} style={{
        padding:'5px 10px', fontSize:12, fontWeight:500, border:0, borderRadius:6, cursor:'pointer',
        background: value === v ? 'var(--paper)' : 'transparent',
        color: value === v ? 'var(--ink)' : 'var(--ink-3)',
        boxShadow: value === v ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
      }}>{l}</button>
    ))}
  </div>
);
