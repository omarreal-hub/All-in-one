import * as Icons from 'lucide-react';
import { Sparkles, ShoppingCart } from 'lucide-react';

// ─── Shop Item Card (Inspired by HabitCard) ──────────────────────────
function ShopItemCard({ item, balance, onBuy }) {
  const isAffordable = balance >= item.price;

  // Dynamic icon mapping based on item title
  const titleLower = (item.name || '').toLowerCase();
  let iconName = 'Package';
  if (titleLower.includes('youtube') || titleLower.includes('netflix') || titleLower.includes('watch') || titleLower.includes('movie')) iconName = 'Tv';
  else if (titleLower.includes('pizza') || titleLower.includes('food') || titleLower.includes('takeout') || titleLower.includes('order')) iconName = 'Pizza';
  else if (titleLower.includes('coffee') || titleLower.includes('drink') || titleLower.includes('latte')) iconName = 'Coffee';
  else if (titleLower.includes('game') || titleLower.includes('play')) iconName = 'Gamepad2';
  else if (titleLower.includes('social') || titleLower.includes('scroll')) iconName = 'Smartphone';
  else if (titleLower.includes('nap') || titleLower.includes('rest') || titleLower.includes('sleep')) iconName = 'Bed';
  else if (titleLower.includes('dessert') || titleLower.includes('sugar') || titleLower.includes('cake')) iconName = 'IceCream';
  else if (titleLower.includes('gym') || titleLower.includes('workout') || titleLower.includes('skip')) iconName = 'Dumbbell';

  const IconComponent = Icons[iconName] || Icons.ShoppingCart;

  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 22,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-strong)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Soft Glowing Icon Box (Matches HabitCard) */}
        <div style={{
          width: 42, height: 42, borderRadius: 14,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid var(--border-strong)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isAffordable ? 'var(--text-primary)' : 'var(--text-muted)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <IconComponent size={20} strokeWidth={2.2} />
        </div>

        {/* Item Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {item.name}
          </div>
          {item.description && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>
              {item.description}
            </div>
          )}
        </div>

        {/* Price Badge (Matches HabitCard Aura Badge style) */}
        <div style={{
          width: 42, height: 42, borderRadius: 14,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1
        }}>
          <Sparkles size={10} style={{ color: isAffordable ? 'var(--aura)' : 'var(--text-muted)', opacity: 0.6 }} />
          <span style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: isAffordable ? 'var(--aura)' : 'var(--text-muted)'
          }}>
            {item.price}
          </span>
        </div>
      </div>

      {/* Buy Button Container */}
      <button
        onClick={() => onBuy(item)}
        disabled={!isAffordable}
        style={{
          width: '100%',
          height: 38,
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: !isAffordable ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          background: isAffordable ? 'var(--bg-elevated)' : 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-strong)',
          color: isAffordable ? 'var(--text-secondary)' : 'var(--text-muted)',
          filter: !isAffordable ? 'grayscale(1)' : 'none',
        }}
      >
        Buy Item
      </button>
    </div>
  );
}

export default function ShopView({ user, shopItems = [], onBuyItem }) {
  const aura = user.auraTotal || 0;

  const handleBuy = (item) => {
    if (aura < item.price) return;
    if (onBuyItem) onBuyItem(item);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Aura balance banner */}
      <div style={{
        padding: '20px 24px',
        borderRadius: 28,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-strong)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.06em' }}>YOUR BALANCE</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--aura)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} /> {aura}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Available</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)' }}>
            {shopItems.length} Rewards
          </div>
        </div>
      </div>

      {/* Grid Store items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, px: 4 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
            textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap',
          }}>
            REWARDS CATALOG
          </span>
          <div style={{ height: 1, flex: 1, background: 'var(--border-subtle)' }} />
        </div>

        {shopItems.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            No rewards available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {shopItems.map(item => (
              <ShopItemCard
                key={item.id}
                item={item}
                balance={aura}
                onBuy={handleBuy}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer note */}
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '10px 20px', lineHeight: 1.6, opacity: 0.7 }}>
        Spending Aura on temptations is part of the system.
        <br />Stay balanced. You've earned it. 🙏
      </p>
    </div>
  );
}
