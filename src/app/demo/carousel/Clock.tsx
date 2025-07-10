"use client";
import { useEffect, useState } from "react";

export default function Clock() {
  const [dateTime, setDateTime] = useState("");
  useEffect(() => {
    let raf: number | undefined;
    const updateDateTime = () => {
      const now = new Date();
      const formatted = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setDateTime(formatted);
      raf = requestAnimationFrame(updateDateTime);
    };
    updateDateTime();
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, []);
  return (
    <span
      style={{
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
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '45%',
          background: 'linear-gradient(90deg,rgba(255,255,255,0.45),rgba(255,255,255,0.05) 80%)',
          borderTopLeftRadius: '1.2rem',
          borderTopRightRadius: '1.2rem',
          pointerEvents: 'none',
          content: '""',
          zIndex: 1,
        }}
      />
      <span style={{ position: 'relative', zIndex: 2 }}>{dateTime}</span>
    </span>
  );
} 