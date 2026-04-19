// Home screen + Profile screen

function BullseyeMark({ size = 52, style }) {
  // Dartboard-style glyph with alternating red/green wedge hints
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" style={style}>
      <defs>
        <radialGradient id="bullGlow">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.5"/>
          <stop offset="60%" stopColor={GREEN} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="26" cy="26" r="24" fill="url(#bullGlow)"/>
      {/* double ring – alternating wedges */}
      <circle cx="26" cy="26" r="22" fill="none" stroke={ACCENT_DIM} strokeWidth="2.4" strokeOpacity="0.5" strokeDasharray="5 5"/>
      <circle cx="26" cy="26" r="22" fill="none" stroke={GREEN_DIM} strokeWidth="2.4" strokeOpacity="0.5" strokeDasharray="5 5" strokeDashoffset="5"/>
      {/* mid ring */}
      <circle cx="26" cy="26" r="15" fill="none" stroke="rgba(244,236,224,0.18)" strokeWidth="1"/>
      {/* bullseye core */}
      <circle cx="26" cy="26" r="8" fill={GREEN} opacity="0.8"/>
      <circle cx="26" cy="26" r="4" fill={ACCENT}/>
      <circle cx="26" cy="26" r="1.6" fill="#fff"/>
    </svg>
  );
}

function Home({ profile, stats, onPlay, onProfile }) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      padding: '72px 24px 40px', boxSizing: 'border-box',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient red+green glow behind the hero */}
      <div style={{
        position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
        width: 460, height: 460, borderRadius: '50%', pointerEvents: 'none',
        background: `radial-gradient(circle, ${ACCENT_GLOW} 0%, ${GREEN_GLOW} 40%, transparent 70%)`,
        filter: 'blur(30px)', opacity: 0.55,
      }}/>

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Eyebrow>One<span style={{ color: ACCENT }}>·</span>Two<span style={{ color: GREEN }}>·</span>One</Eyebrow>
        <div style={{ height: 10 }}/>
        <Heading size={44} style={{ letterSpacing: -1.5 }}>
          Hi, <span style={{ color: ACCENT }}>{profile.firstName}</span>.
        </Heading>
        <Body style={{ marginTop: 8, fontSize: 17 }}>Ready to practice?</Body>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BullseyeMark size={200}/>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PrimaryBtn onClick={onPlay}>▸ Play</PrimaryBtn>
          <SecondaryBtn onClick={onProfile}>Profile</SecondaryBtn>
        </div>

        {stats.matches > 0 && (
          <div style={{
            textAlign: 'center', marginTop: 20,
            fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.5,
            textTransform: 'uppercase', color: MUTED,
          }}>
            {stats.matches} match{stats.matches === 1 ? '' : 'es'} played
            <span style={{ color: DIM, margin: '0 8px' }}>·</span>
            <span style={{ color: GREEN }}>{stats.checkoutRate}%</span> checkout rate
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({ label, value, mono = true }) {
  return (
    <div style={{
      background: BG_2, border: `1px solid ${BORDER}`,
      borderRadius: 12, padding: '14px 14px 16px',
    }}>
      <div style={{
        fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 1.5,
        textTransform: 'uppercase', color: MUTED, marginBottom: 6,
      }}>{label}</div>
      <div style={{
        fontFamily: mono ? FONT_MONO : FONT_DISPLAY,
        fontSize: 22, fontWeight: 700, color: TEXT,
        letterSpacing: -0.5, lineHeight: 1,
      }}>{value}</div>
    </div>
  );
}

function LevelSheet({ current, onSelect, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
      zIndex: 100, display: 'flex', alignItems: 'flex-end',
      backdropFilter: 'blur(8px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: BG_2,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '20px 20px 30px',
        borderTop: `1px solid ${BORDER_2}`,
        animation: 'slideUp 0.25s ease',
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 2, background: BORDER_2,
          margin: '0 auto 18px',
        }}/>
        <Eyebrow style={{ marginBottom: 14 }}>Select level</Eyebrow>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {LEVELS.map(l => (
            <LevelCard key={l.id} level={l}
              selected={current === l.id}
              onClick={() => { onSelect(l.id); onClose(); }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({ profile, stats, onSave, onHome, onPlay }) {
  const [draft, setDraft] = React.useState(profile);
  const [levelSheet, setLevelSheet] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);

  const handleSave = () => {
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleBack = () => {
    if (dirty) setConfirmDiscard(true);
    else onHome();
  };

  const fmtDate = (s) => {
    if (!s) return '—';
    const d = new Date(s);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{
      height: '100%', overflow: 'auto',
      padding: '60px 24px 40px', boxSizing: 'border-box',
      position: 'relative',
    }}>
      <div style={{ marginBottom: 20 }}>
        <BackBtn label="Home" onClick={handleBack}/>
      </div>

      <Heading size={36} style={{ marginBottom: 28 }}>Profile</Heading>

      {/* DETAILS */}
      <Eyebrow style={{ marginBottom: 12 }}>Details</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 8 }}>
        <TextField label="First name" value={draft.firstName}
          onChange={v => setDraft({ ...draft, firstName: v })} maxLength={30}/>
        <TextField label="Last name" value={draft.lastName}
          onChange={v => setDraft({ ...draft, lastName: v })} maxLength={30}/>
        <div>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 2,
            textTransform: 'uppercase', color: MUTED, marginBottom: 8,
          }}>Birthday</div>
          <DateInput value={draft.birthday}
            onChange={v => setDraft({ ...draft, birthday: v })}/>
        </div>
        <div>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 2,
            textTransform: 'uppercase', color: MUTED, marginBottom: 8,
          }}>Level</div>
          <button onClick={() => setLevelSheet(true)} style={{
            width: '100%', height: 52, boxSizing: 'border-box',
            background: BG_2, border: `1px solid ${BORDER}`,
            borderRadius: 12, padding: '0 16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 500,
            color: TEXT,
          }}>
            <span>{draft.level}</span>
            <span style={{ color: DIM, fontSize: 14 }}>▸</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, marginBottom: 8 }}>
        <PrimaryBtn onClick={handleSave} disabled={!dirty} style={{ flex: 1 }} glow={dirty}>
          Save Changes
        </PrimaryBtn>
        {dirty && (
          <button onClick={() => setDraft(profile)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: MUTED, fontFamily: FONT_MONO, fontSize: 11,
            letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600,
            padding: '10px 4px',
          }}>Discard</button>
        )}
      </div>
      {saved && (
        <div style={{
          fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.5,
          textTransform: 'uppercase', color: ACCENT, marginTop: 4,
          textAlign: 'center',
        }}>✓ Profile updated</div>
      )}

      {/* OVERALL STATS */}
      <div style={{ marginTop: 36 }}>
        <Eyebrow style={{ marginBottom: 14 }}>Overall stats</Eyebrow>
        {stats.matches === 0 ? (
          <div style={{
            padding: '32px 20px', borderRadius: 12,
            background: BG_2, border: `1px dashed ${BORDER_2}`,
            textAlign: 'center', fontFamily: FONT_DISPLAY, fontSize: 14,
            color: MUTED, lineHeight: 1.45,
          }}>
            No matches played yet — hit{' '}
            <button onClick={onPlay} style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              color: ACCENT, fontWeight: 700, fontFamily: 'inherit', fontSize: 'inherit',
              textDecoration: 'underline', textDecorationColor: 'rgba(229,50,40,0.4)',
              textUnderlineOffset: 3,
            }}>PLAY</button>{' '}to start.
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
          }}>
            <StatTile label="Matches played" value={stats.matches}/>
            <StatTile label="Rounds played" value={stats.rounds}/>
            <StatTile label="Checkouts" value={stats.checkouts}/>
            <StatTile label="Checkout rate" value={`${stats.checkoutRate}%`}/>
            <StatTile label="Highest out" value={stats.highestOut ?? '—'}/>
            <StatTile label="Fewest darts" value={stats.fewestDarts ?? '—'}/>
            <StatTile label="Best streak" value={stats.bestStreak}/>
            <StatTile label="Highest target" value={stats.highestTarget}/>
          </div>
        )}
      </div>

      {levelSheet && (
        <LevelSheet
          current={draft.level}
          onSelect={l => setDraft({ ...draft, level: l })}
          onClose={() => setLevelSheet(false)}
        />
      )}

      {confirmDiscard && (
        <div onClick={() => setConfirmDiscard(false)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, backdropFilter: 'blur(8px)',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', background: BG_2, borderRadius: 18,
            padding: '22px 22px 16px', border: `1px solid ${BORDER_2}`,
          }}>
            <Heading size={22} style={{ marginBottom: 8 }}>Discard changes?</Heading>
            <Body style={{ fontSize: 14, marginBottom: 18 }}>
              Your edits will be lost.
            </Body>
            <div style={{ display: 'flex', gap: 10 }}>
              <SecondaryBtn onClick={() => setConfirmDiscard(false)} style={{ flex: 1, height: 48 }}>
                Keep Editing
              </SecondaryBtn>
              <PrimaryBtn onClick={() => { setDraft(profile); setConfirmDiscard(false); onHome(); }}
                style={{ flex: 1, height: 48 }} glow={false}>
                Discard
              </PrimaryBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Home, ProfileScreen, BullseyeMark, StatTile });
