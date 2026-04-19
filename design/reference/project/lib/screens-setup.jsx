// Game Setup screen

function OptionGroup({ options, value, onChange }) {
  return (
    <div style={{
      display: 'grid', gap: 8,
      gridTemplateColumns: `repeat(${options.length}, 1fr)`,
    }}>
      {options.map(opt => {
        const isSel = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              height: 64, border: `1px solid ${isSel ? ACCENT : BORDER}`,
              background: isSel ? 'rgba(229,50,40,0.1)' : BG_2,
              borderRadius: 12, cursor: 'pointer',
              color: isSel ? '#fff' : TEXT,
              fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700,
              transition: 'all 0.15s',
              boxShadow: isSel ? `0 0 16px ${ACCENT_GLOW}` : 'none',
              letterSpacing: -0.5,
            }}>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function GameSetup({ onHome, onStart }) {
  const [maxDarts, setMaxDarts] = React.useState(9);
  const [rounds, setRounds] = React.useState(10);

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      padding: '60px 24px 32px', boxSizing: 'border-box',
      position: 'relative', overflow: 'auto',
    }}>
      <div style={{ marginBottom: 24 }}>
        <BackBtn label="Home" onClick={onHome}/>
      </div>

      <Eyebrow style={{ marginBottom: 14 }}>Practice · 121 Checkout</Eyebrow>
      <Heading size={52} style={{ letterSpacing: -2, lineHeight: 0.95 }}>
        One<span style={{ color: ACCENT }}>·</span>Two<span style={{ color: GREEN }}>·</span>One
      </Heading>
      <Body style={{ marginTop: 14, fontSize: 15, lineHeight: 1.5 }}>
        Start at 121. Check it out, the target climbs. Miss it, the target drops.
      </Body>

      <div style={{ marginTop: 36 }}>
        <Eyebrow style={{ marginBottom: 10 }}>Max darts per checkout</Eyebrow>
        <div style={{
          display: 'grid', gap: 8,
          gridTemplateColumns: 'repeat(6, 1fr)',
        }}>
          {[3,6,9,12,15,18].map(n => {
            const sel = maxDarts === n;
            return (
              <button key={n} onClick={() => setMaxDarts(n)} style={{
                height: 56, border: `1px solid ${sel ? ACCENT : BORDER}`,
                background: sel ? 'rgba(229,50,40,0.1)' : BG_2,
                borderRadius: 10, cursor: 'pointer',
                color: sel ? '#fff' : TEXT,
                fontFamily: FONT_MONO, fontSize: 17, fontWeight: 700,
                transition: 'all 0.15s',
                boxShadow: sel ? `0 0 14px ${ACCENT_GLOW}` : 'none',
              }}>{n}</button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <Eyebrow style={{ marginBottom: 10 }}>Rounds</Eyebrow>
        <OptionGroup
          value={rounds}
          onChange={setRounds}
          options={[
            { value: 10, label: '10' },
            { value: 25, label: '25' },
            { value: Infinity, label: '∞' },
          ]}
        />
      </div>

      <div style={{ flex: 1, minHeight: 32 }}/>

      <PrimaryBtn onClick={() => onStart({ maxDarts, rounds })}>
        ▸ Throw First Dart
      </PrimaryBtn>
    </div>
  );
}

Object.assign(window, { GameSetup });
