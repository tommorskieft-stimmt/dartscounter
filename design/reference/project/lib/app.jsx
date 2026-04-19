// Main App

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "startScreen": "auto",
  "accentHue": 25,
  "seedSampleStats": false
}/*EDITMODE-END*/;

// Aggregate career stats from saved matches
function computeCareerStats(matches) {
  if (matches.length === 0) {
    return {
      matches: 0, rounds: 0, checkouts: 0, checkoutRate: 0,
      highestOut: null, fewestDarts: null, bestStreak: 0,
      highestTarget: 121,
    };
  }
  const rounds = matches.reduce((a, m) => a + m.history.length, 0);
  const checkouts = matches.reduce((a, m) => a + m.history.filter(r => r.success).length, 0);
  const highestOuts = matches.flatMap(m => m.history.filter(r => r.success).map(r => r.target));
  const fewestArr = matches.flatMap(m => m.history.filter(r => r.success).map(r => r.darts));
  const highestTargets = matches.flatMap(m => m.history.map(r => r.target));

  // Best streak across all matches (chronological)
  let cur = 0, best = 0;
  matches.forEach(m => m.history.forEach(r => {
    if (r.success) { cur++; best = Math.max(best, cur); }
    else cur = 0;
  }));

  return {
    matches: matches.length,
    rounds,
    checkouts,
    checkoutRate: rounds ? Math.round((checkouts / rounds) * 100) : 0,
    highestOut: highestOuts.length ? Math.max(...highestOuts) : null,
    fewestDarts: fewestArr.length ? Math.min(...fewestArr) : null,
    bestStreak: best,
    highestTarget: highestTargets.length ? Math.max(...highestTargets) : 121,
  };
}

function TweaksPanel({ tweaks, setTweaks, onJumpScreen }) {
  const [open, setOpen] = React.useState(true);
  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
      fontFamily: FONT_DISPLAY, color: '#fff',
    }}>
      {open ? (
        <div style={{
          width: 240, background: 'rgba(20,20,24,0.92)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${BORDER_2}`, borderRadius: 14,
          padding: 14, boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 2,
              textTransform: 'uppercase', color: ACCENT, fontWeight: 700,
            }}>Tweaks</div>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', color: MUTED, cursor: 'pointer',
              fontSize: 16, padding: 0, lineHeight: 1,
            }}>✕</button>
          </div>

          <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: MUTED, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Jump to screen</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 12 }}>
            {['onboarding','home','profile','setup','play','over'].map(s => (
              <button key={s} onClick={() => onJumpScreen(s)} style={{
                height: 30, background: BG_3, border: `1px solid ${BORDER}`,
                borderRadius: 6, color: TEXT, cursor: 'pointer',
                fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600,
                textTransform: 'capitalize',
              }}>{s}</button>
            ))}
          </div>

          <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: MUTED, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
            Accent hue · <span style={{ color: TEXT }}>{tweaks.accentHue}°</span>
          </div>
          <input type="range" min="0" max="360" value={tweaks.accentHue}
            onChange={e => setTweaks({ ...tweaks, accentHue: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: ACCENT, marginBottom: 10 }}/>

          <button onClick={() => {
            localStorage.clear();
            location.reload();
          }} style={{
            width: '100%', height: 30, background: 'transparent',
            border: `1px solid ${BORDER_2}`, borderRadius: 6,
            color: MUTED, cursor: 'pointer',
            fontFamily: FONT_MONO, fontSize: 10, fontWeight: 600,
            letterSpacing: 1.5, textTransform: 'uppercase',
          }}>Reset all data</button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} style={{
          width: 40, height: 40, borderRadius: 20,
          background: ACCENT, border: 'none', cursor: 'pointer',
          color: '#fff', fontSize: 18, fontWeight: 700,
          boxShadow: `0 0 20px ${ACCENT_GLOW}`,
        }}>⚙</button>
      )}
    </div>
  );
}

function App() {
  const [profile, setProfile] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('o21_profile')); } catch { return null; }
  });
  const [matches, setMatches] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('o21_matches')) || []; } catch { return []; }
  });
  const [screen, setScreen] = React.useState(() => {
    const saved = localStorage.getItem('o21_screen');
    if (saved) return saved;
    try {
      const p = JSON.parse(localStorage.getItem('o21_profile'));
      return p ? 'home' : 'onboarding';
    } catch { return 'onboarding'; }
  });
  const [onboardStep, setOnboardStep] = React.useState(1);
  const [draftProfile, setDraftProfile] = React.useState({});
  const [gameSettings, setGameSettings] = React.useState(null);
  const [gameResult, setGameResult] = React.useState(null);
  const [tweaks, setTweaks] = React.useState(TWEAK_DEFAULTS);

  // Persist
  React.useEffect(() => {
    if (profile) localStorage.setItem('o21_profile', JSON.stringify(profile));
  }, [profile]);
  React.useEffect(() => {
    localStorage.setItem('o21_matches', JSON.stringify(matches));
  }, [matches]);
  React.useEffect(() => {
    localStorage.setItem('o21_screen', screen);
  }, [screen]);

  const stats = React.useMemo(() => computeCareerStats(matches), [matches]);

  // Finish onboarding
  const finishOnboarding = () => {
    setProfile(draftProfile);
    setScreen('home');
  };

  // Save match
  const onGameOver = (result) => {
    setGameResult(result);
    setMatches(prev => [...prev, {
      at: Date.now(),
      history: result.history,
      finalTarget: result.finalTarget,
      settings: result.settings,
    }]);
    setScreen('over');
  };

  // Tweaks protocol
  React.useEffect(() => {
    const listener = (e) => {
      if (e.data?.type === '__activate_edit_mode') setEditMode(true);
      if (e.data?.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', listener);
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch {}
    return () => window.removeEventListener('message', listener);
  }, []);
  const [editMode, setEditMode] = React.useState(false);

  const jumpScreen = (s) => {
    if (s === 'onboarding') {
      setOnboardStep(1);
      setDraftProfile({});
      setScreen('onboarding');
    } else if (s === 'over' && !gameResult) {
      // Fabricate a sample result
      const sample = {
        settings: { maxDarts: 9, rounds: 10 },
        finalTarget: 125,
        history: [
          { roundN: 1, target: 121, success: true,  darts: 6, turns: [] },
          { roundN: 2, target: 122, success: true,  darts: 9, turns: [] },
          { roundN: 3, target: 123, success: false, darts: 9, turns: [] },
          { roundN: 4, target: 122, success: true,  darts: 7, turns: [] },
          { roundN: 5, target: 123, success: true,  darts: 5, turns: [] },
          { roundN: 6, target: 124, success: false, darts: 9, turns: [] },
          { roundN: 7, target: 123, success: true,  darts: 8, turns: [] },
          { roundN: 8, target: 124, success: false, darts: 9, turns: [] },
          { roundN: 9, target: 123, success: true,  darts: 6, turns: [] },
          { roundN: 10, target: 124, success: true, darts: 9, turns: [] },
        ],
      };
      setGameResult(sample);
      setScreen('over');
    } else if (s === 'play') {
      if (!gameSettings) setGameSettings({ maxDarts: 9, rounds: 10 });
      setScreen('play');
    } else {
      setScreen(s);
    }
  };

  let content;
  if (screen === 'onboarding') {
    if (onboardStep === 1) {
      content = <ProfileStep1 profile={draftProfile} setProfile={setDraftProfile}
        onNext={() => setOnboardStep(2)}/>;
    } else if (onboardStep === 2) {
      content = <ProfileStep2 profile={draftProfile} setProfile={setDraftProfile}
        onNext={() => setOnboardStep(3)} onBack={() => setOnboardStep(1)}/>;
    } else {
      content = <ProfileStep3 profile={draftProfile} setProfile={setDraftProfile}
        onFinish={finishOnboarding} onBack={() => setOnboardStep(2)}/>;
    }
  } else if (screen === 'home') {
    content = <Home profile={profile || { firstName: 'Player' }} stats={stats}
      onPlay={() => setScreen('setup')}
      onProfile={() => setScreen('profile')}/>;
  } else if (screen === 'profile') {
    content = <ProfileScreen profile={profile || { firstName: '', lastName: '', birthday: '', level: 'Beginner' }}
      stats={stats}
      onSave={(p) => setProfile(p)}
      onHome={() => setScreen('home')}
      onPlay={() => setScreen('setup')}/>;
  } else if (screen === 'setup') {
    content = <GameSetup
      onHome={() => setScreen('home')}
      onStart={(s) => { setGameSettings(s); setScreen('play'); }}/>;
  } else if (screen === 'play') {
    content = <GamePlay settings={gameSettings || { maxDarts: 9, rounds: 10 }}
      profile={profile}
      onQuit={() => setScreen('home')}
      onGameOver={onGameOver}/>;
  } else if (screen === 'over') {
    content = <GameOver result={gameResult}
      onPlayAgain={() => { setGameResult(null); setScreen('play'); }}
      onHome={() => { setGameResult(null); setScreen('home'); }}/>;
  }

  // Accent live-override
  const accentStyle = {
    '--accent': `oklch(0.64 0.22 ${tweaks.accentHue})`,
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'radial-gradient(ellipse at top, #2A1A12 0%, #150E09 45%, #080503 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, boxSizing: 'border-box',
      ...accentStyle,
    }}>
      <IOSDevice width={402} height={874} dark>
        <div style={{ height: '100%', background: BG, position: 'relative', overflow: 'hidden' }}>
          {content}
        </div>
      </IOSDevice>

      {editMode && <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} onJumpScreen={jumpScreen}/>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
