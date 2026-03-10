import { Home, ShoppingBag, User } from 'lucide-react';

const TABS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'shop', label: 'Shop', Icon: ShoppingBag },
  { id: 'profile', label: 'Profile', Icon: User },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 30,
      display: 'flex',
      background: 'rgba(0,0,0,0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--border-subtle)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`nav-tab ${active === id ? 'active' : ''}`}
          onClick={() => onChange(id)}
          style={{ color: active === id ? 'var(--aura)' : 'var(--text-muted)' }}
        >
          <Icon size={20} strokeWidth={active === id ? 2.5 : 1.5} />
          {label}
        </button>
      ))}
    </nav>
  );
}
