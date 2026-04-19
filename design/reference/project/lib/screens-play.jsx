// Game Play screen

function DartsBar({ used, max }) {
  return (
    <div style={{ display: 'flex', gap: 3, width: '100%', height: 6 }}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < used;
        // alternate red/green like a board
        const c = i % 2 === 0 ? ACCENT : GREEN;
        const g = i % 2 === 0 ? ACCENT_GLOW : GREEN_GLOW;
        return (
          <div key={i} style={{
            flex: 1, height: '100%', borderRadius: 2,
            background: filled ? c : 'rgba(244,236,224,0.08)',
            boxShadow: filled ? `0 0 6px ${g}` : 'none',
            transition: 'background 0.3s',
          }}/>
        );
      })}
    </div>
  );
}

function RouteDart({ label }) {
  const isDouble = label.startsWith('D') || label === 'BULL';
  const isTreble = label.startsWith('T');
  const bg = isDouble ? 'rgba(70,160,110,0.14)' : isTreble ? 'rgba(229,50,40,0.14)' : 'rgba(244,236,224,0.05)';
  const border = isDouble ? GREEN_DIM : isTreble ? ACCENT_DIM : BORDER_2;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 48, height: 38, padding: '0 10px',
      borderRadius: 9, background: bg,
      border: `1px solid ${border}`,
      fontFamily: FONT_MONO, fontSize: 15, fontWeight: 700,
      color: '#fff', letterSpacing: 0.5,
    }}>{label}</div>
  );
}

function FlipNumber({ value, size = 88, color = '#fff' }) {
  const [display, setDisplay] = React.useState(value);
  const [flipping, setFlipping] = React.useState(false);
  React.useEffect(() => {
    if (value !== display) {
      setFlipping(true);
      const t = setTimeout(() => {
        setDisplay(value);
        setFlipping(false);
      }, 120);
      return () => clearTimeout(t);
    }
  }, [value]);
  return (
    <div style={{
      fontFamily: FONT_MONO, fontSize: size, fontWeight: 700,
      color, lineHeight: 1, letterSpacing: -3,
      transform: flipping ? 'translateY(-6px) scale(0.95)' : 'translateY(0)',
      opacity: flipping ? 0.4 : 1,
      transition: 'all 0.12s ease',
    }}>{display}</div>
  );
}

function ConfettiBurst({ active }) {
  // Minimalistic: 14 tiny red/white bits fly outward briefly
  if (!active) return null;
  const bits = React.useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      angle: (i / 14) * 360 + Math.random() * 20,
      dist: 80 + Math.random() * 60,
      color: i % 3 === 0 ? '#fff' : (i % 2 === 0 ? ACCENT : GREEN),
      delay: Math.random() * 100,
      size: 4 + Math.random() * 4,
    }));
  }, [active]);
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 30,
    }}>
      {bits.map(b => (
        <div key={b.id} style={{
          position: 'absolute', width: b.size, height: b.size,
          background: b.color, borderRadius: '50%',
          animation: `confettiFly 700ms ease-out ${b.delay}ms forwards`,
          ['--angle']: `${b.angle}deg`,
          ['--dist']: `${b.dist}px`,
          opacity: 0,
        }}/>
      ))}
    </div>
  );
}

function TurnLogLine({ turn }) {
  const isBust = turn.bust;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 0',
      background: 'rgba(255,255,255,0.02)',
      borderRadius: 6,
      paddingLeft: 10, paddingRight: 10,
      marginBottom: 4,
      fontFamily: FONT_MONO, fontSize: 13,
    }}>
      <div style={{ color: DIM, width: 24 }}>#{turn.n}</div>
      <div style={{ color: MUTED, width: 28 }}>{turn.darts}d</div>
      <div style={{
        flex: 1, color: isBust ? ACCENT : TEXT, fontWeight: 600,
      }}>
        {isBust ? `BUST (${turn.score})` : `−${turn.score}`}
      </div>
      <div style={{ color: MUTED }}>→ {turn.remaining}</div>
    </div>
  );
}

function GamePlay({ settings, onQuit, onGameOver, profile }) {
  const { maxDarts, rounds } = settings;
  const [target, setTarget] = React.useState(121);
  const [remaining, setRemaining] = React.useState(121);
  const [dartsUsed, setDartsUsed] = React.useState(0);
  const [roundIdx, setRoundIdx] = React.useState(0); // 0-based completed count
  const [turns, setTurns] = React.useState([]);
  const [history, setHistory] = React.useState([]); // completed rounds
  const [status, setStatus] = React.useState(null); // {type, text}
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);

  // input
  const [dartsThrown, setDartsThrown] = React.useState(3);
  const [scoreInput, setScoreInput] = React.useState('');

  const dartsLeft = maxDarts - dartsUsed;
  const effDarts = Math.min(dartsThrown, dartsLeft);
  const maxScore = 60 * effDarts;
  const scoreNum = scoreInput === '' ? NaN : parseInt(scoreInput, 10);
  const scoreValid = !isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= maxScore;
  const canSubmit = scoreValid && effDarts > 0 && effDarts <= dartsLeft;

  const route = React.useMemo(() => window.getRoute(remaining), [remaining]);

  const undoTurn = () => {
    if (turns.length === 0) return;
    const last = turns[turns.length - 1];
    const prevRemaining = last.bust ? remaining : last.remaining + last.score;
    // If last turn was a bust, remaining was already reverted to pre-turn, so prevRemaining = remaining.
    // But we still need to subtract the darts that were used.
    setTurns(turns.slice(0, -1));
    setDartsUsed(Math.max(0, dartsUsed - last.darts));
    setRemaining(prevRemaining);
    setStatus(null);
  };

  const finishMatch = (finalHistory, finalTarget) => {
    const completed = finalHistory.length;
    if (completed === 0) {
      onQuit();
      return;
    }
    onGameOver({
      history: finalHistory,
      finalTarget,
      settings,
    });
  };

  const nextRound = (success, newTarget, usedThisRound, turnsThisRound) => {
    const record = {
      roundN: roundIdx + 1,
      target, success,
      darts: usedThisRound,
      turns: turnsThisRound,
    };
    const newHistory = [...history, record];
    setHistory(newHistory);
    const nextIdx = roundIdx + 1;

    // Check for match end
    if (rounds !== Infinity && nextIdx >= rounds) {
      finishMatch(newHistory, newTarget);
      return;
    }
    // Advance round after a beat
    setTimeout(() => {
      setRoundIdx(nextIdx);
      setTarget(newTarget);
      setRemaining(newTarget);
      setDartsUsed(0);
      setTurns([]);
      setStatus(null);
      setScoreInput('');
      setDartsThrown(3);
    }, 1500);
  };

  const submitTurn = () => {
    if (!canSubmit) return;
    const s = scoreNum;
    const d = effDarts;
    const newDartsUsed = dartsUsed + d;
    const turnN = turns.length + 1;

    const tentative = remaining - s;
    const isBust = tentative < 0 || tentative === 1;

    if (isBust) {
      const newTurns = [...turns, {
        n: turnN, darts: d, score: s, remaining,
        bust: true,
      }];
      setTurns(newTurns);
      setDartsUsed(newDartsUsed);

      if (newDartsUsed >= maxDarts) {
        setStatus({ type: 'fail', text: `Out of darts — ${newDartsUsed} used` });
        const newTarget = Math.max(target - 1, 121);
        nextRound(false, newTarget, newDartsUsed, newTurns);
      } else {
        setStatus({ type: 'bust', text: `Bust — score stays at ${remaining}` });
        setTimeout(() => setStatus(null), 1800);
      }
    } else if (tentative === 0) {
      // Checkout!
      const newTurns = [...turns, {
        n: turnN, darts: d, score: s, remaining: 0, bust: false,
      }];
      setTurns(newTurns);
      setDartsUsed(newDartsUsed);
      setRemaining(0);
      setStatus({ type: 'success', text: `Checked out in ${newDartsUsed} darts` });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 900);
      nextRound(true, target + 1, newDartsUsed, newTurns);
    } else {
      // Ordinary turn
      const newTurns = [...turns, {
        n: turnN, darts: d, score: s, remaining: tentative, bust: false,
      }];
      setTurns(newTurns);
      setDartsUsed(newDartsUsed);
      setRemaining(tentative);
      setStatus(null);

      if (newDartsUsed >= maxDarts) {
        setStatus({ type: 'fail', text: `Out of darts — ${newDartsUsed} used` });
        const newTarget = Math.max(target - 1, 121);
        nextRound(false, newTarget, newDartsUsed, newTurns);
      }
    }
    setScoreInput('');
  };

  const handleQuit = () => {
    if (history.length === 0) onQuit();
    else finishMatch(history, target);
  };

  const routeLabel = (() => {
    if (route.kind === 'done') return '— checked out —';
    if (route.kind === 'bust') return 'must be ≥ 2';
    if (route.kind === 'none') return 'no out shot';
    return null;
  })();

  const disabledDartOpts = [1,2,3].filter(n => n > dartsLeft);

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      padding: '56px 20px 24px', boxSizing: 'border-box',
      position: 'relative', overflow: 'auto',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <BackBtn label="Quit" onClick={handleQuit}/>
        <div style={{ textAlign: 'center' }}>
          <Eyebrow style={{ marginBottom: 4 }}>Round</Eyebrow>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 17, fontWeight: 700,
            color: TEXT, letterSpacing: -0.5, whiteSpace: 'nowrap',
          }}>
            {roundIdx + 1}{rounds !== Infinity && ` / ${rounds}`}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Eyebrow style={{ marginBottom: 4 }}>Target</Eyebrow>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700,
            color: GREEN, letterSpacing: -0.5,
            textShadow: `0 0 14px ${GREEN_GLOW}`,
          }}>{target}</div>
        </div>
      </div>

      {/* Scoreboard */}
      <div style={{
        position: 'relative',
        background: BG_2, border: `1px solid ${BORDER}`,
        borderRadius: 18, padding: '20px 20px 16px',
        marginBottom: 10,
      }}>
        <ConfettiBurst active={showConfetti}/>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Eyebrow>Remaining</Eyebrow>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1.5,
            color: MUTED, fontWeight: 600,
          }}>Darts {dartsUsed}/{maxDarts}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '8px 0 4px' }}>
          <FlipNumber value={remaining} size={88}
            color={remaining === 0 ? GREEN : TEXT}/>
        </div>
        {status && (
          <div style={{
            textAlign: 'center', marginBottom: 10,
            fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.5,
            textTransform: 'uppercase', fontWeight: 600,
            color: status.type === 'success' ? GREEN
              : status.type === 'bust' ? BRASS
              : ACCENT,
          }}>{status.text}</div>
        )}
        <div style={{ marginTop: status ? 0 : 10 }}>
          <DartsBar used={dartsUsed} max={maxDarts}/>
        </div>
      </div>

      {/* Undo + Help row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={undoTurn} disabled={turns.length === 0} style={{
          flex: 1, height: 36, border: `1px solid ${BORDER_2}`,
          background: turns.length === 0 ? 'transparent' : 'rgba(244,236,224,0.04)',
          borderRadius: 9, cursor: turns.length === 0 ? 'not-allowed' : 'pointer',
          color: turns.length === 0 ? DIM : TEXT,
          fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700,
          letterSpacing: 1.5, textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 13 }}>↶</span> Undo
        </button>
        <button onClick={() => setShowHelp(true)} style={{
          flex: 1, height: 36, border: `1px solid ${GREEN_DIM}`,
          background: 'rgba(70,160,110,0.06)',
          borderRadius: 9, cursor: 'pointer',
          color: GREEN,
          fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700,
          letterSpacing: 1.5, textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 13 }}>?</span> Help
        </button>
      </div>

      {/* Checkout route */}
      <div style={{
        background: BG_2, border: `1px solid ${BORDER}`,
        borderRadius: 14, padding: '12px 14px', marginBottom: 14,
      }}>
        <Eyebrow style={{ marginBottom: 8 }}>Checkout Route</Eyebrow>
        {routeLabel ? (
          <div style={{
            fontFamily: FONT_MONO, fontSize: 14, color: MUTED,
            fontStyle: 'italic', padding: '4px 0',
          }}>{routeLabel}</div>
        ) : (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {route.darts.map((d, i) => (
              <React.Fragment key={i}>
                <RouteDart label={d}/>
                {i < route.darts.length - 1 && (
                  <div style={{
                    color: DIM, alignSelf: 'center',
                    fontFamily: FONT_MONO, fontSize: 14,
                  }}>›</div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        background: BG_2, border: `1px solid ${BORDER}`,
        borderRadius: 14, padding: '14px', marginBottom: 14,
      }}>
        <Eyebrow style={{ marginBottom: 10 }}>Enter Turn</Eyebrow>

        <div style={{
          fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 1.5,
          textTransform: 'uppercase', color: DIM, marginBottom: 6,
        }}>Darts Thrown</div>
        <SegmentGroup
          options={[1,2,3]}
          value={dartsThrown}
          onChange={setDartsThrown}
          disabledValues={disabledDartOpts}
        />

        <div style={{
          fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 1.5,
          textTransform: 'uppercase', color: DIM, margin: '14px 0 6px',
        }}>Score Thrown <span style={{ color: MUTED }}>(max {maxScore})</span></div>

        <input
          type="text" inputMode="numeric" pattern="[0-9]*"
          value={scoreInput}
          onChange={e => setScoreInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
          onKeyDown={e => { if (e.key === 'Enter' && canSubmit) submitTurn(); }}
          placeholder="0"
          style={{
            width: '100%', height: 56, boxSizing: 'border-box',
            background: BG_3, border: `1px solid ${scoreValid ? ACCENT_DIM : BORDER}`,
            borderRadius: 10, padding: '0 16px', color: TEXT,
            fontFamily: FONT_MONO, fontSize: 24, fontWeight: 700,
            outline: 'none', textAlign: 'center',
            caretColor: ACCENT, letterSpacing: -1,
          }}
        />

        <div style={{ marginTop: 12 }}>
          <PrimaryBtn onClick={submitTurn} disabled={!canSubmit}>
            Submit Turn
          </PrimaryBtn>
        </div>
      </div>

      {/* Turn log */}
      {turns.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <Eyebrow style={{ marginBottom: 6 }}>This Round</Eyebrow>
          <div>
            {turns.map(t => <TurnLogLine key={t.n} turn={t}/>)}
          </div>
        </div>
      )}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} maxDarts={maxDarts}/>}
    </div>
  );
}

function HelpModal({ onClose, maxDarts }) {
  const [rem, setRem] = React.useState('');
  const [darts, setDarts] = React.useState(3);
  const remNum = rem === '' ? NaN : parseInt(rem, 10);
  const valid = !isNaN(remNum) && remNum >= 0 && remNum <= 170;
  const route = valid ? window.getRoute(remNum) : null;
  const label = route && (
    route.kind === 'done' ? '— checked out —' :
    route.kind === 'bust' ? 'must be ≥ 2' :
    route.kind === 'none' ? 'no out shot' : null
  );

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
      zIndex: 200, display: 'flex', alignItems: 'flex-end',
      backdropFilter: 'blur(8px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: BG_2,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '18px 20px 26px',
        borderTop: `1px solid ${GREEN_DIM}`,
        animation: 'slideUp 0.25s ease',
        boxShadow: `0 -10px 40px ${GREEN_GLOW}`,
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 2, background: BORDER_2,
          margin: '0 auto 16px',
        }}/>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Eyebrow style={{ color: GREEN }}>Checkout Helper</Eyebrow>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: MUTED, cursor: 'pointer',
            fontSize: 18, lineHeight: 1, padding: 4,
          }}>✕</button>
        </div>
        <Body style={{ fontSize: 13, marginBottom: 14 }}>
          Enter your current score and how many darts you've thrown — we'll show the best route.
        </Body>

        <div style={{
          fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 1.5,
          textTransform: 'uppercase', color: DIM, marginBottom: 6,
        }}>Remaining score</div>
        <input
          type="text" inputMode="numeric" pattern="[0-9]*"
          value={rem} autoFocus
          onChange={e => setRem(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
          placeholder="e.g. 80"
          style={{
            width: '100%', height: 52, boxSizing: 'border-box',
            background: BG_3, border: `1px solid ${valid ? GREEN_DIM : BORDER}`,
            borderRadius: 10, padding: '0 16px', color: TEXT,
            fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700,
            outline: 'none', textAlign: 'center',
            caretColor: GREEN, letterSpacing: -1, marginBottom: 12,
          }}
        />

        <div style={{
          fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 1.5,
          textTransform: 'uppercase', color: DIM, marginBottom: 6,
        }}>Darts thrown this round</div>
        <SegmentGroup
          options={[1,2,3,4,5,6,7,8,9].filter(n => n <= maxDarts).slice(0, 6)}
          value={darts}
          onChange={setDarts}
        />

        {/* Result */}
        <div style={{
          marginTop: 18, padding: '14px 16px',
          background: BG_3, borderRadius: 12,
          border: `1px solid ${GREEN_DIM}`,
          minHeight: 68,
        }}>
          <Eyebrow style={{ marginBottom: 8, color: GREEN }}>Suggested route</Eyebrow>
          {!valid ? (
            <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: MUTED, fontStyle: 'italic' }}>
              Enter a score between 0 and 170.
            </div>
          ) : label ? (
            <div style={{ fontFamily: FONT_MONO, fontSize: 14, color: MUTED, fontStyle: 'italic' }}>
              {label}
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {route.darts.map((d, i) => (
                  <React.Fragment key={i}>
                    <RouteDart label={d}/>
                    {i < route.darts.length - 1 && (
                      <div style={{ color: DIM, alignSelf: 'center', fontFamily: FONT_MONO, fontSize: 14 }}>›</div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div style={{
                fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1,
                color: DIM, textTransform: 'uppercase',
              }}>
                Finish in {route.darts.length} dart{route.darts.length === 1 ? '' : 's'}
                {darts > 0 && ` · ${darts} already thrown`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { GamePlay });
