// Game Over screen

function RoundTile({ r, onTap, selected }) {
  return (
    <button onClick={() => onTap(r)} style={{
      position: 'relative',
      background: r.success ? 'rgba(70,160,110,0.12)' : 'rgba(229,50,40,0.06)',
      border: `1px solid ${selected ? BRASS : (r.success ? GREEN_DIM : ACCENT_DIM)}`,
      borderRadius: 9, padding: '8px 6px', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 2, minHeight: 48,
      boxShadow: selected ? `0 0 10px ${ACCENT_GLOW}` : 'none',
      transition: 'all 0.15s',
    }}>
      <div style={{
        fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700,
        color: TEXT, letterSpacing: -0.5,
      }}>{r.target}</div>
      <div style={{
        fontFamily: FONT_MONO, fontSize: 9, fontWeight: 600,
        color: r.success ? GREEN : ACCENT, letterSpacing: 0.5,
      }}>{r.success ? `${r.darts}d` : '✕'}</div>
    </button>
  );
}

function GameOver({ result, onPlayAgain, onHome }) {
  const { history, finalTarget, settings } = result;
  const [selectedRound, setSelectedRound] = React.useState(null);

  const successes = history.filter(r => r.success);
  const fails = history.filter(r => !r.success);
  const checkoutRate = history.length === 0 ? 0
    : Math.round((successes.length / history.length) * 100);

  const avgDarts = successes.length === 0 ? null
    : (successes.reduce((a, r) => a + r.darts, 0) / successes.length).toFixed(1);
  const fewestDarts = successes.length === 0 ? null
    : Math.min(...successes.map(r => r.darts));
  const highestOut = successes.length === 0 ? null
    : Math.max(...successes.map(r => r.target));
  const targets = history.map(r => r.target);
  const lowT = targets.length ? Math.min(...targets) : 121;
  const highT = targets.length ? Math.max(...targets) : 121;

  let bestStreak = 0, cur = 0;
  history.forEach(r => {
    if (r.success) { cur++; bestStreak = Math.max(bestStreak, cur); }
    else cur = 0;
  });

  const tooltip = selectedRound
    ? (selectedRound.success
        ? `Round ${selectedRound.roundN}: ${selectedRound.target} in ${selectedRound.darts} darts`
        : `Round ${selectedRound.roundN}: ${selectedRound.target} missed`)
    : null;

  return (
    <div style={{
      height: '100%', overflow: 'auto',
      padding: '60px 24px 32px', boxSizing: 'border-box',
      position: 'relative',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
        width: 300, height: 300, borderRadius: '50%', pointerEvents: 'none',
        background: `radial-gradient(circle, ${GREEN_GLOW} 0%, transparent 60%)`,
        filter: 'blur(30px)', opacity: 0.5, zIndex: 0,
      }}/>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Eyebrow style={{ marginBottom: 8 }}>Match Over</Eyebrow>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.5,
          color: MUTED, fontWeight: 600,
        }}>
          {history.length} ROUND{history.length === 1 ? '' : 'S'}
          <span style={{ color: DIM, margin: '0 6px' }}>·</span>
          MAX {settings.maxDarts} DARTS
        </div>

        {/* Hero stat */}
        <div style={{
          marginTop: 24, marginBottom: 24,
          padding: '24px 20px', textAlign: 'center',
          background: `linear-gradient(135deg, rgba(70,160,110,0.06) 0%, ${BG_2} 50%, rgba(229,50,40,0.08) 100%)`,
          border: `1px solid ${GREEN_DIM}`,
          borderRadius: 18,
          boxShadow: `0 0 30px ${GREEN_GLOW}, inset 0 1px 0 rgba(244,236,224,0.06)`,
        }}>
          <Eyebrow style={{ marginBottom: 10 }}>Checkout Rate</Eyebrow>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 72, fontWeight: 800,
            color: GREEN, letterSpacing: -3, lineHeight: 1,
            textShadow: `0 0 24px ${GREEN_GLOW}`,
          }}>{checkoutRate}<span style={{ fontSize: 40, opacity: 0.6 }}>%</span></div>
          <div style={{
            marginTop: 10, fontFamily: FONT_MONO, fontSize: 11,
            letterSpacing: 1.5, color: MUTED, fontWeight: 600,
          }}>
            <span style={{ color: GREEN }}>{successes.length}</span> CHECKED OUT
            <span style={{ color: DIM, margin: '0 6px' }}>·</span>
            <span style={{ color: ACCENT }}>{fails.length}</span> MISSED
          </div>
        </div>

        {/* Stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <StatTile label="Final Target" value={finalTarget}/>
          <StatTile label="Best Streak" value={bestStreak}/>
          <StatTile label="Avg Darts to Out" value={avgDarts ?? '—'}/>
          <StatTile label="Fewest Darts" value={fewestDarts ?? '—'}/>
          <StatTile label="Highest Out" value={highestOut ?? '—'}/>
          <StatTile label="Target Range" value={`${lowT}–${highT}`}/>
        </div>

        {/* Round by round */}
        <div style={{ marginTop: 28 }}>
          <Eyebrow style={{ marginBottom: 10 }}>Round by Round</Eyebrow>
          <div style={{
            display: 'grid', gap: 6,
            gridTemplateColumns: 'repeat(5, 1fr)',
          }}>
            {history.map(r => (
              <RoundTile key={r.roundN} r={r}
                selected={selectedRound?.roundN === r.roundN}
                onTap={setSelectedRound}/>
            ))}
          </div>
          <div style={{
            minHeight: 20, marginTop: 10,
            fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 0.5,
            color: MUTED, textAlign: 'center',
            opacity: tooltip ? 1 : 0,
            transition: 'opacity 0.2s',
          }}>{tooltip || 'Tap a tile for details'}</div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          <PrimaryBtn onClick={onPlayAgain}>▸ Play Again</PrimaryBtn>
          <SecondaryBtn onClick={onHome}>Home</SecondaryBtn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { GameOver, RoundTile });
