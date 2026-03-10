import { Sparkles, TrendingUp, ShoppingBag } from 'lucide-react';

// Tiny inline stat chip (replaces the 2nd-row rings)
function StatChip({ icon, done, total, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3.5,
      fontSize: 10, fontWeight: 700,
      padding: '3px 8px', borderRadius: 10,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--border-subtle)',
      color: done === total && total > 0 ? color : 'var(--text-secondary)',
      whiteSpace: 'nowrap',
      transition: 'all 0.3s ease',
    }}>
      <span style={{ fontSize: 10 }}>{icon}</span>
      <span style={{ color: done > 0 ? color : 'var(--text-muted)' }}>{done}</span>
      <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>/{total}</span>
    </span>
  );
}

export default function Header({ habitsDone, totalHabits, tasksDone, totalTasks, projectsDone, totalProjects, user }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'rgba(9,9,11,0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '8px 16px 6px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }}>
      {/* Row 1: Identity & Quick Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Left: User Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src={user.avatar}
            alt={user.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=7c3aed&color=fff&size=150`;
            }}
            style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--border-strong)', flexShrink: 0, objectFit: 'cover' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {user.name}
            </span>
            <span style={{
              fontSize: 7.5, fontWeight: 900, padding: '0px 4px', borderRadius: 4,
              background: 'var(--aura-dim)', color: 'var(--aura)',
              border: '1px solid rgba(167,139,250,0.1)', letterSpacing: '0.04em', textTransform: 'uppercase'
            }}>
              LVL {user.level}
            </span>
          </div>
        </div>

        {/* Right: Activity Chips */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <StatChip icon="⚡" done={habitsDone} total={totalHabits} color="var(--aura)" />
          <StatChip icon="✓" done={tasksDone} total={totalTasks} color="var(--blue)" />
          <StatChip icon="📁" done={projectsDone} total={totalProjects} color="var(--green)" />
        </div>
      </div>

      {/* Row 2: Level Progress (Minimal) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', marginTop: -2 }}>
        <div className="progress-bar" style={{ flex: 1, height: 3.5 }}>
          <div className="progress-bar-fill" style={{ width: `${user.levelPct}%` }} />
        </div>
        <span style={{ fontSize: 8.5, fontWeight: 700, color: 'var(--text-muted)', minWidth: 20, textAlign: 'right' }}>
          {user.levelPct}%
        </span>
      </div>

      {/* Row 3: Aura Economy Stats (Premium Horizontal Strip) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.015)',
        borderRadius: 8,
        padding: '3px 12px',
        border: '1px solid rgba(255,255,255,0.03)'
      }}>
        {/* Total Aura */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Sparkles size={10} style={{ color: 'var(--aura)', opacity: 0.8 }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 8, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)' }}>{user.auraTotal}</span>
          </div>
        </div>

        <div style={{ width: 1, height: 12, background: 'var(--border-subtle)', opacity: 0.3 }} />

        {/* Earned Today */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <TrendingUp size={10} style={{ color: 'var(--green)', opacity: 0.8 }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 8, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Earned</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)' }}>+{user.auraToday}</span>
          </div>
        </div>

        <div style={{ width: 1, height: 12, background: 'var(--border-subtle)', opacity: 0.3 }} />

        {/* Spent Today */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ShoppingBag size={10} style={{ color: 'var(--red)', opacity: 0.8 }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 8, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Spent</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', opacity: 0.9 }}>-{user.auraSpentToday}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
