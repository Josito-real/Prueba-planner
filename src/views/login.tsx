// Login screen. Client-only demo auth — credentials come from auth.DEMO_USERS.
import { useState } from 'react';
import { authProvider, DEMO_USERS } from '../auth';
import { useT, useLang } from '../i18n';
import { actions } from '../store';
import { Btn, Card, TextInput } from '../ui';

export const LoginScreen = () => {
  const t = useT();
  const lang = useLang();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    const user = await authProvider.login(username, password);
    setBusy(false);
    if (!user) { setError(t('login.error')); return; }
    actions.setSession(user);
  };

  return (
    <div style={{
      minHeight:'100vh', width:'100%',
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(160deg, var(--paper-2) 0%, var(--paper) 70%)',
      padding:24,
    }}>
      <Card pad={0} style={{width:380, maxWidth:'100%', overflow:'hidden'}}>
        <div style={{padding:'22px 24px 14px', borderBottom:'1px solid var(--line-2)'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{
              width:32, height:32, borderRadius:8, background:'var(--accent)',
              color:'white', display:'inline-flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--font-mono)', fontWeight:700,
            }}>K</div>
            <div>
              <div style={{fontFamily:'var(--font-serif)', fontWeight:500, fontSize:20, letterSpacing:'-0.01em'}}>
                {t('login.title')}
              </div>
              <div style={{fontSize:12, color:'var(--ink-3)', marginTop:2}}>{t('login.subtitle')}</div>
            </div>
          </div>
        </div>
        <form onSubmit={submit} style={{padding:'18px 24px', display:'flex', flexDirection:'column', gap:12}}>
          <div>
            <label style={{display:'block', fontSize:11, fontWeight:600, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4}}>
              {t('login.username')}
            </label>
            <TextInput value={username} onChange={setUsername} placeholder="andrea" autoFocus/>
          </div>
          <div>
            <label style={{display:'block', fontSize:11, fontWeight:600, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4}}>
              {t('login.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="demo"
              style={{
                width:'100%', height:32, padding:'0 10px',
                border:'1px solid var(--line)', borderRadius:8,
                fontSize:13, fontFamily:'var(--font-sans)',
                background:'var(--paper)', color:'var(--ink)', outline:'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
            />
          </div>
          {error && (
            <div style={{fontSize:12, color:'var(--risk)', background:'color-mix(in oklab, var(--risk) 8%, white)', padding:'8px 10px', borderRadius:6}}>
              {error}
            </div>
          )}
          <Btn variant="accent" onClick={submit} disabled={busy}>
            {busy ? t('common.loading') : t('login.submit')}
          </Btn>
          <div style={{fontSize:11, color:'var(--ink-4)', textAlign:'center', marginTop:4}}>
            {t('login.demoHint')}
          </div>
          <div style={{fontSize:11, color:'var(--ink-4)', borderTop:'1px solid var(--line-2)', paddingTop:10, marginTop:4}}>
            <div style={{marginBottom:4, fontWeight:600, color:'var(--ink-3)'}}>
              {lang === 'es' ? 'Usuarios de ejemplo' : 'Demo users'}
            </div>
            {Object.values(DEMO_USERS).slice(0, 4).map(({ user }) => (
              <div key={user.username} style={{display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)'}}>
                <span>{user.username}</span>
                <span>{user.role} · {user.dept}</span>
              </div>
            ))}
          </div>
        </form>
        <div style={{padding:'10px 24px 16px', textAlign:'center'}}>
          <button
            onClick={() => actions.setLang(lang === 'en' ? 'es' : 'en')}
            style={{background:'transparent', border:0, cursor:'pointer', fontSize:12, color:'var(--ink-3)'}}>
            {lang === 'en' ? 'Español' : 'English'}
          </button>
        </div>
      </Card>
    </div>
  );
};
