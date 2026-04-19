// Profile creation — 3 steps
const LEVELS = [
  { id: 'Beginner', desc: 'Just starting out. Still learning the board.' },
  { id: 'Intermediate', desc: 'Comfortable with scoring. Working on doubles.' },
  { id: 'Advanced', desc: 'Reliable on common finishes. Hunting consistency.' },
  { id: 'Expert', desc: 'Regularly out in 15 darts or fewer.' },
];

function StepIndicator({ n, total = 3 }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i < n ? ACCENT : 'rgba(255,255,255,0.08)',
          boxShadow: i < n ? `0 0 8px ${ACCENT_GLOW}` : 'none',
          transition: 'background 0.3s',
        }}/>
      ))}
    </div>
  );
}

function ScreenShell({ children, footer }) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      padding: '72px 24px 40px', boxSizing: 'border-box',
      color: TEXT, fontFamily: FONT_DISPLAY,
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      {footer && <div style={{ marginTop: 24 }}>{footer}</div>}
    </div>
  );
}

function ProfileStep1({ profile, setProfile, onNext }) {
  const canNext = profile.firstName?.trim() && profile.lastName?.trim();
  return (
    <ScreenShell footer={
      <PrimaryBtn onClick={onNext} disabled={!canNext}>Next</PrimaryBtn>
    }>
      <StepIndicator n={1}/>
      <Eyebrow style={{ marginBottom: 14 }}>Step 1 of 3</Eyebrow>
      <Heading size={36}>What's your name?</Heading>
      <Body style={{ marginTop: 10, marginBottom: 32 }}>
        We'll use your first name to greet you.
      </Body>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TextField
          label="First name" value={profile.firstName || ''}
          onChange={v => setProfile({ ...profile, firstName: v })}
          placeholder="Phil" maxLength={30} autoFocus
        />
        <TextField
          label="Last name" value={profile.lastName || ''}
          onChange={v => setProfile({ ...profile, lastName: v })}
          placeholder="Taylor" maxLength={30}
        />
      </div>
    </ScreenShell>
  );
}

function DateInput({ value, onChange }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <input
      type="date" value={value || ''}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      max={new Date().toISOString().split('T')[0]}
      min={new Date(Date.now() - 120*365.25*24*3600*1000).toISOString().split('T')[0]}
      style={{
        width: '100%', height: 56, boxSizing: 'border-box',
        background: BG_2, border: `1px solid ${focused ? ACCENT : BORDER}`,
        borderRadius: 12, padding: '0 16px', color: TEXT,
        fontFamily: FONT_MONO, fontSize: 18, fontWeight: 500,
        outline: 'none', transition: 'border 0.15s',
        colorScheme: 'dark',
      }}
    />
  );
}

function ProfileStep2({ profile, setProfile, onNext, onBack }) {
  const d = profile.birthday ? new Date(profile.birthday) : null;
  const valid = d && !isNaN(d) && d <= new Date()
    && d >= new Date(Date.now() - 120*365.25*24*3600*1000);
  return (
    <ScreenShell footer={
      <div style={{ display: 'flex', gap: 12 }}>
        <SecondaryBtn onClick={onBack} style={{ flex: '0 0 96px' }}>◂ Back</SecondaryBtn>
        <PrimaryBtn onClick={onNext} disabled={!valid}>Next</PrimaryBtn>
      </div>
    }>
      <StepIndicator n={2}/>
      <Eyebrow style={{ marginBottom: 14 }}>Step 2 of 3</Eyebrow>
      <Heading size={36}>When's your birthday?</Heading>
      <Body style={{ marginTop: 10, marginBottom: 32 }}>
        Optional flex stat on the profile.
      </Body>
      <DateInput
        value={profile.birthday || ''}
        onChange={v => setProfile({ ...profile, birthday: v })}
      />
    </ScreenShell>
  );
}

function LevelCard({ level, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', padding: '18px 20px',
      background: selected ? 'rgba(229, 50, 40, 0.08)' : BG_2,
      border: `1px solid ${selected ? ACCENT : BORDER}`,
      borderRadius: 14, cursor: 'pointer', color: TEXT,
      transition: 'all 0.15s',
      boxShadow: selected ? `0 0 22px ${ACCENT_GLOW}` : 'none',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 10, flexShrink: 0,
        border: `2px solid ${selected ? ACCENT : BORDER_2}`,
        background: selected ? ACCENT : 'transparent',
        position: 'relative',
      }}>
        {selected && <div style={{
          position: 'absolute', inset: 5, borderRadius: '50%',
          background: '#fff',
        }}/>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 700,
          marginBottom: 3, letterSpacing: -0.3,
        }}>{level.id}</div>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: 13, color: MUTED,
          lineHeight: 1.35,
        }}>{level.desc}</div>
      </div>
    </button>
  );
}

function ProfileStep3({ profile, setProfile, onFinish, onBack }) {
  const valid = !!profile.level;
  return (
    <ScreenShell footer={
      <div style={{ display: 'flex', gap: 12 }}>
        <SecondaryBtn onClick={onBack} style={{ flex: '0 0 96px' }}>◂ Back</SecondaryBtn>
        <PrimaryBtn onClick={onFinish} disabled={!valid}>Finish</PrimaryBtn>
      </div>
    }>
      <StepIndicator n={3}/>
      <Eyebrow style={{ marginBottom: 14 }}>Step 3 of 3</Eyebrow>
      <Heading size={36}>What's your level?</Heading>
      <Body style={{ marginTop: 10, marginBottom: 24 }}>
        Pick the one that best describes you. You can change it any time.
      </Body>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {LEVELS.map(l => (
          <LevelCard key={l.id} level={l}
            selected={profile.level === l.id}
            onClick={() => setProfile({ ...profile, level: l.id })}/>
        ))}
      </div>
    </ScreenShell>
  );
}

Object.assign(window, { LEVELS, ProfileStep1, ProfileStep2, ProfileStep3, ScreenShell, StepIndicator, LevelCard });
