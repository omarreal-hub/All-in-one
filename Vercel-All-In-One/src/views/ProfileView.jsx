import { useState, useEffect } from 'react';
import Accordion from '@/components/Accordion';
import { FileText, X, Archive, Clock } from 'lucide-react';
import * as Icons from 'lucide-react';

// ─── Note Preview Modal Component ──────────────────────────
function NoteModal({ noteId, onClose, onArchive }) {
  const [content, setContent] = useState([]);
  const [fullTitle, setFullTitle] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch('/api/get-note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page_id: noteId })
        });
        const data = await res.json();
        if (data.success) {
          setContent(data.blocks);
          setFullTitle(data.title);
          setMetadata(data.metadata);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to load note content');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [noteId]);

  const handleCopyUrl = () => {
    if (metadata?.url) {
      navigator.clipboard.writeText(metadata.url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
      zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, animation: 'fadeIn 0.2s ease'
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: 480, maxHeight: '85vh',
        background: 'var(--bg-card)', border: '1px solid var(--border-strong)',
        borderRadius: 28, padding: 0, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.01)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <FileText size={20} color="var(--aura)" style={{ flexShrink: 0 }} />
            <span style={{
              fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {fullTitle || 'Note Review'}
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--bg-elevated)', border: 'none',
            width: 34, height: 34, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', cursor: 'pointer',
            transition: 'all 0.2s ease', marginLeft: 12
          }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}>
            <X size={20} />
          </button>
        </div>

        {/* Content & Metadata */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 24px 0' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '60px 40px' }}>
              <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Retrieving from Notion...</span>
            </div>
          ) : error ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--red)', fontSize: 14, fontWeight: 500 }}>
              {error}
            </div>
          ) : (
            <>
              {/* Metadata Row: Single Compact Line */}
              <div style={{
                padding: '14px 24px', background: 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid var(--border-strong)',
                display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20
              }}>
                {metadata?.type && (
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 8,
                    background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)',
                    textTransform: 'uppercase', letterSpacing: '0.04em'
                  }}>{metadata.type}</span>
                )}

                {metadata?.zones && (
                  <>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.3 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Archive size={12} style={{ opacity: 0.5 }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {metadata.zones}
                      </span>
                    </div>
                  </>
                )}

                {metadata?.url && (
                  <>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.3 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <a href={metadata.url} target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px',
                        borderRadius: 10, background: 'rgba(139, 92, 246, 0.15)',
                        color: 'var(--aura)', textDecoration: 'none', fontSize: 12, fontWeight: 700,
                        border: '1px solid rgba(139, 92, 246, 0.2)', transition: 'all 0.2s ease'
                      }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)'}>
                        <Clock size={12} />
                        Source
                      </a>
                      <button onClick={handleCopyUrl} style={{
                        background: 'transparent', border: 'none',
                        color: copySuccess ? 'var(--green)' : 'var(--text-secondary)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px', transition: 'all 0.2s ease'
                      }}>
                        <FileText size={14} />
                        <span style={{ fontSize: 11, fontWeight: 700 }}>{copySuccess ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Note Body with explicit RTL / Right Alignment */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 24px' }}>
                {content.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 20 }}>Empty note.</div>
                ) : content.map(block => {
                  const isArabic = /[\u0600-\u06FF]/.test(block.text);
                  return (
                    <div key={block.id} style={{
                      fontSize: 15.5, lineHeight: 1.7, color: 'var(--text-primary)',
                      direction: isArabic ? 'rtl' : 'ltr',
                      textAlign: isArabic ? 'right' : 'left',
                      unicodeBidi: 'plaintext',
                      width: '100%'
                    }}>
                      {block.type.startsWith('heading') && (
                        <div style={{ fontWeight: 800, fontSize: block.type.endsWith('1') ? 22 : 18, marginTop: 10, marginBottom: 4, color: 'var(--aura)' }}>
                          {block.text}
                        </div>
                      )}
                      {block.type === 'paragraph' && <div>{block.text}</div>}
                      {block.type === 'bulleted_list_item' && (
                        <div style={{ display: 'flex', gap: 12 }}>
                          <span style={{ color: 'var(--aura)', fontWeight: 900, flexShrink: 0 }}>•</span>
                          <span>{block.text}</span>
                        </div>
                      )}
                      {block.type === 'to_do' && (
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <div style={{
                            width: 20, height: 20, border: '2px solid var(--border-strong)',
                            borderRadius: 7, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: 12, flexShrink: 0,
                            background: block.checked ? 'var(--aura)' : 'transparent',
                            borderColor: block.checked ? 'var(--aura)' : 'rgba(255,255,255,0.2)',
                            color: 'white', transition: 'all 0.2s ease'
                          }}>
                            {block.checked ? '✓' : ''}
                          </div>
                          <span style={{
                            textDecoration: block.checked ? 'line-through' : 'none',
                            opacity: block.checked ? 0.5 : 1,
                            fontWeight: block.checked ? 400 : 500
                          }}>
                            {block.text}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '24px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
          <button
            onClick={() => onArchive(noteId)}
            style={{
              width: '100%', padding: '16px', borderRadius: 16,
              background: 'var(--aura)', color: 'white', fontWeight: 800, fontSize: 14,
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)', transition: 'transform 0.2s ease'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Archive size={18} />
            Archive Note
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SVG Donut ring (used inside Identity Card) ───────────────────
function DonutRing({ pct, color, size = 48 }) {
  const r = 17, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 42 42" style={{ flexShrink: 0 }}>
      <circle cx="21" cy="21" r={r} fill="none" stroke="var(--border)" strokeWidth="4.5" />
      <circle cx="21" cy="21" r={r} fill="none"
        stroke={color} strokeWidth="4.5"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x="21" y="25" textAnchor="middle"
        fill={color} fontSize="8.5" fontWeight="700" fontFamily="Inter, sans-serif">
        {pct}%
      </text>
    </svg>
  );
}

// ─── Stat Ring card (identity card row) ──────────────────────────
function StatRing({ label, done, total, color }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      padding: '12px 8px',
      borderRadius: 12,
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-subtle)',
    }}>
      <DonutRing pct={pct} color={color} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color }}>
          {done}<span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>/{total}</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 700, marginTop: 2, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ─── Time Grid card ───────────────────────────────────────────────
function TimeCard({ label, pct, color }) {
  const r = 18, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{
      flex: 1, padding: '14px 14px 12px', borderRadius: 12,
      background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    }}>
      <svg width="52" height="52" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
        <circle cx="22" cy="22" r={r} fill="none"
          stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x="22" y="26" textAnchor="middle"
          fill={color} fontSize="9" fontWeight="700" fontFamily="Inter, sans-serif">
          {pct}%
        </text>
      </svg>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// ─── SVG Donut ring (used inside Identity Card) ───────────────────
export default function ProfileView({ habits, projects, stats, user, onArchiveNote }) {
  const profileStats = {
    aura: user.auraTotal || 0,
    overdue: projects.reduce((a, p) => a + p.tasks.filter(t => t.isOverdue && !t.completed).length, 0),
    rank: user.level || 1,
    joinDate: user.joinDate || 'Oct 2023',
    streak: user.streak || 0,
    longestStreak: user.longestStreak || 0
  };

  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [hoveredNote, setHoveredNote] = useState(null);

  const { habitsDone, totalHabits, tasksDone, totalTasks, projectsDone, totalProjects } = stats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 16 }}>

      {/* ── User Identity Card ────────────────────────────── */}
      <div style={{
        padding: '20px',
        borderRadius: 24,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-strong)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        {/* Avatar + Name + Level bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <img
            src={user.avatar}
            alt={user.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=7c3aed&color=fff&size=200`;
            }}
            style={{ width: 56, height: 56, borderRadius: '50%', border: '2.5px solid var(--border-strong)', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{user.name}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                background: 'var(--aura-dim)', color: 'var(--aura)',
                border: '1px solid rgba(167,139,250,0.3)', letterSpacing: '0.04em',
              }}>LVL {user.level}</span>
            </div>
            {/* Level progress bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="progress-bar" style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.05)' }}>
                <div className="progress-bar-fill" style={{ width: `${user.levelPct}%`, borderRadius: 2.5 }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {user.levelPct}%
              </span>
            </div>

            {/* Extremely compact inline Aura stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>
                Total: <span style={{ color: 'var(--aura)' }}>{user.auraTotal} ✦</span>
              </span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-strong)' }}></span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Earned: <span style={{ color: 'var(--green)' }}>+{user.auraToday}</span>
              </span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-strong)' }}></span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Spent: <span style={{ color: 'var(--red)' }}>{-Math.abs(user.auraSpentToday)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 3 Stat rings — beautifully integrated */}
        <div style={{
          display: 'flex', gap: 12,
          paddingTop: 18,
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <StatRing label="Habits" done={habitsDone} total={totalHabits} color="var(--aura)" />
          <StatRing label="Tasks" done={tasksDone} total={totalTasks} color="var(--blue)" />
          <StatRing label="Projects" done={projectsDone} total={totalProjects} color="var(--green)" />
        </div>
      </div>

      {/* ── Overdue Alerts (List format) ──────────── */}
      <div style={{ padding: '2px 0 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingLeft: 4 }}>
          <span style={{ fontSize: 15, lineHeight: 1 }}>⚠️</span>
          <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>Overdue Alerts</span>
        </div>
        <div style={{
          background: 'var(--bg-elevated)',
          borderRadius: 14,
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>📁</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Overdue Projects</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--yellow)' }}>
              {user.overdueProjects || 0}
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>📌</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Overdue Tasks</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--red)' }}>
              {user.overdueTasks || 0}
            </span>
          </div>
        </div>
      </div>

      {/* ── Notes to Review ───────────────────────────────── */}
      <Accordion title="Notes to Review" icon="📝" badge={user.notesToReviewCount || 0} defaultOpen={false}>
        <div style={{ padding: '0px 0px 8px 0px', display: 'flex', flexDirection: 'column' }}>
          {user.notesToReviewCount === 0 ? (
            <div style={{ padding: '16px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
              No new notes to review! Great job.
            </div>
          ) : (
            (user.notesToReviewItems || []).map(note => (
              <div key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', gap: 14,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {note.title}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>
                    {new Date(note.created_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchiveNote(note.id);
                  }}
                  style={{
                    padding: '7px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                    background: 'var(--aura-dim)', color: 'var(--aura)',
                    border: '1px solid rgba(167,139,250,0.3)', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Archive
                </button>
              </div>
            ))
          )}
        </div>
      </Accordion>

      {/* ── Recent Rewards (Purchase History) ───────────────── */}
      <Accordion title="Recent Rewards" icon="🎁" badge={user.recentPurchases?.length || 0} defaultOpen={false}>
        <div style={{ padding: '0px 0px 8px 0px', display: 'flex', flexDirection: 'column' }}>
          {(!user.recentPurchases || user.recentPurchases.length === 0) ? (
            <div style={{ padding: '16px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
              No rewards claimed today yet.
            </div>
          ) : (
            user.recentPurchases.map(item => {
              const titleLower = (item.title || '').toLowerCase();
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
                <div key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', gap: 14,
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 14,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border-strong)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-primary)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <IconComponent size={20} strokeWidth={2.2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--red)' }}>
                    -{item.price} ✦
                  </span>
                </div>
              );
            })
          )}
        </div>
      </Accordion>

      {/* ── Note Preview Modal ───────────────────────── */}
      {selectedNoteId && (
        <NoteModal
          noteId={selectedNoteId}
          onClose={() => setSelectedNoteId(null)}
          onArchive={(id) => {
            onArchiveNote(id);
            setSelectedNoteId(null);
          }}
        />
      )}

      {/* ── Time Progress — at the bottom, collapsed by default ─ */}
      <Accordion title="Time Progress" icon="📅" defaultOpen={false}>
        <div style={{ display: 'flex', gap: 10, padding: '14px' }}>
          <TimeCard label="Year 2026" pct={user.yearProgress} color="var(--blue)" />
          <TimeCard label="This Month" pct={user.monthProgress} color="var(--aura)" />
        </div>
      </Accordion>
    </div>
  );
}
