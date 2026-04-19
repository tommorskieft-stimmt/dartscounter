// Shared UI primitives for One·Two·One
// Palette: pub/cafe vibe — warm brown-black base, dartboard red + green accents, cream text
const ACCENT = 'oklch(0.62 0.22 25)';         // bullseye red
const ACCENT_DIM = 'oklch(0.48 0.18 25)';
const ACCENT_GLOW = 'oklch(0.62 0.22 25 / 0.35)';
const GREEN = 'oklch(0.62 0.14 155)';          // dartboard green
const GREEN_DIM = 'oklch(0.48 0.12 155)';
const GREEN_GLOW = 'oklch(0.62 0.14 155 / 0.3)';
const BG = '#14100D';                          // warm brown-black (cafe)
const BG_2 = '#1D1814';                        // walnut
const BG_3 = '#26201B';                        // leather
const BORDER = 'rgba(220,190,160,0.09)';       // warm translucent
const BORDER_2 = 'rgba(220,190,160,0.18)';
const TEXT = '#F4ECE0';                        // cream
const MUTED = 'rgba(244,236,224,0.6)';
const DIM = 'rgba(244,236,224,0.35)';
const BRASS = 'oklch(0.75 0.12 75)';           // warm highlight

const FONT_DISPLAY = '"Archivo", -apple-system, system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", "SF Mono", ui-monospace, monospace';

function Eyebrow({ children, style }) {
  return (
    <div style={{
      fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 2.5,
      textTransform: 'uppercase', color: MUTED, fontWeight: 500,
      ...style,
    }}>{children}</div>
  );
}

function Heading({ children, size = 32, style }) {
  return (
    <div style={{
      fontFamily: FONT_DISPLAY, fontSize: size, fontWeight: 800,
      lineHeight: 1.02, letterSpacing: -0.8, color: TEXT,
      ...style,
    }}>{children}</div>
  );
}

function Body({ children, style }) {
  return (
    <div style={{
      fontFamily: FONT_DISPLAY, fontSize: 15, lineHeight: 1.45,
      color: MUTED, fontWeight: 400, ...style,
    }}>{children}</div>
  );
}

// Primary red button with optional glow
function PrimaryBtn({ children, onClick, disabled, style, glow = true }) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: '100%', height: 56, border: 'none',
        borderRadius: 14, cursor: disabled ? 'not-allowed' : 'pointer',
        background: disabled ? '#28282C' : ACCENT,
        color: disabled ? DIM : '#fff',
        fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 800,
        letterSpacing: 2, textTransform: 'uppercase',
        boxShadow: disabled ? 'none'
          : (glow ? `0 0 30px ${ACCENT_GLOW}, inset 0 1px 0 rgba(255,255,255,0.2)` : 'inset 0 1px 0 rgba(255,255,255,0.2)'),
        transform: pressed && !disabled ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform 0.12s, background 0.2s',
        ...style,
      }}
    >{children}</button>
  );
}

function SecondaryBtn({ children, onClick, style }) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: '100%', height: 56, border: `1px solid ${BORDER_2}`,
        borderRadius: 14, cursor: 'pointer', background: 'transparent',
        color: TEXT, fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700,
        letterSpacing: 2, textTransform: 'uppercase',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform 0.12s, background 0.2s',
        ...style,
      }}
    >{children}</button>
  );
}

function TextField({ label, value, onChange, placeholder, type = 'text', maxLength, autoFocus }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div>
      {label && (
        <div style={{
          fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 2,
          textTransform: 'uppercase', color: MUTED, marginBottom: 8,
        }}>{label}</div>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: 52, boxSizing: 'border-box',
          background: BG_2, border: `1px solid ${focused ? ACCENT : BORDER}`,
          borderRadius: 12, padding: '0 16px', color: TEXT,
          fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 500,
          outline: 'none', transition: 'border 0.15s',
          caretColor: ACCENT,
        }}
      />
    </div>
  );
}

function SegmentGroup({ options, value, onChange, disabledValues = [] }) {
  return (
    <div style={{
      display: 'flex', gap: 6, background: BG_2, padding: 4,
      borderRadius: 12, border: `1px solid ${BORDER}`,
    }}>
      {options.map(opt => {
        const isSel = value === opt;
        const isDisabled = disabledValues.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => !isDisabled && onChange(opt)}
            disabled={isDisabled}
            style={{
              flex: 1, height: 44, border: 'none', borderRadius: 9,
              background: isSel ? ACCENT : 'transparent',
              color: isDisabled ? DIM : (isSel ? '#fff' : TEXT),
              fontFamily: FONT_MONO, fontSize: 16, fontWeight: 600,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              boxShadow: isSel ? `0 0 16px ${ACCENT_GLOW}` : 'none',
            }}
          >{opt}</button>
        );
      })}
    </div>
  );
}

// Back chevron button (top-left of screens)
function BackBtn({ label = 'BACK', onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', border: 'none', padding: 0,
      display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
      color: MUTED, fontFamily: FONT_MONO, fontSize: 11,
      letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600,
    }}>
      <span style={{ fontSize: 14, lineHeight: 1 }}>◂</span>
      <span>{label}</span>
    </button>
  );
}

// "•" divider
const Dot = () => (
  <span style={{ color: DIM, margin: '0 8px' }}>·</span>
);

Object.assign(window, {
  ACCENT, ACCENT_DIM, ACCENT_GLOW,
  GREEN, GREEN_DIM, GREEN_GLOW, BRASS,
  BG, BG_2, BG_3,
  BORDER, BORDER_2, TEXT, MUTED, DIM,
  FONT_DISPLAY, FONT_MONO,
  Eyebrow, Heading, Body, PrimaryBtn, SecondaryBtn,
  TextField, SegmentGroup, BackBtn, Dot,
});
