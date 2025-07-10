"use client";

export default function InfoBox() {
  const infoBoxStyle = {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: '1.2rem',
    display: 'flex',
    background: 'linear-gradient(135deg, #f8fafc 60%, #e2e8f0 100%)',
    color: '#222',
    borderRadius: '1.2rem',
    boxShadow: '0 6px 24px 0 rgba(0,0,0,0.18), 0 2px 0 #fff inset, 0 1.5px 0 #e0e0e0 inset',
    border: '2px solid #d1d5db',
    padding: '0.18em 0.8em',
    position: 'relative',
    overflow: 'hidden',
    maxWidth: '90vw',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    minWidth: '260px',
    minHeight: '2.6em',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  } as React.CSSProperties;
  return (
    <span style={infoBoxStyle}>
      <span style={{ position: 'relative', zIndex: 2 }}>現在表示中</span>
      <button
        style={{
          marginTop: '0.5em',
          fontSize: '1rem',
          fontWeight: 'bold',
          background: '#f1f5f9',
          border: '1.5px solid #d1d5db',
          borderRadius: '0.8rem',
          padding: '0.3em 1.2em',
          cursor: 'pointer',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
          transition: 'background 0.2s',
        }}
        onClick={() => window.location.reload()}
      >
        リロード
      </button>
    </span>
  );
} 