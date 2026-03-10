import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Accordion({ title, icon, defaultOpen = false, children, badge }) {
  const [open, setOpen] = useState(defaultOpen);
// No ref or JS height measurement needed for grid transition

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'border-color 0.2s ease',
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 18px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          outline: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {icon && <span style={{ fontSize: '18px', lineHeight: 1 }}>{icon}</span>}
          <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '0.01em' }}>
            {title}
          </span>
          {badge !== undefined && (
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}>{badge}</span>
          )}
        </div>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--text-muted)',
            transition: 'transform 0.3s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {/* Collapsible Content */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.3s ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: '4px 0 8px',
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
