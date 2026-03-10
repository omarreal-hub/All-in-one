import { useState } from 'react';
import Accordion from '@/components/Accordion';
import * as Icons from 'lucide-react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Type badge colour map ─────────────────────────────────────────
const TYPE_COLORS = {
  'QUEST': { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: 'rgba(167,139,250,0.25)' },
  'Special Mission': { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: 'rgba(96,165,250,0.25)' },
  'Routine': { bg: 'rgba(52,211,153,0.1)', color: '#34d399', border: 'rgba(52,211,153,0.2)' },
};

// ─── Premium iOS Glassmorphic Habit Tile ───────────────────────────────
function HabitCard({ habit, onToggle }) {
  const isDone = habit.completed;

  // Try to find an icon based on words in the title, default to Circle
  const titleLower = (habit.title || '').toLowerCase();
  let iconName = 'Circle';
  if (titleLower.includes('meditate') || titleLower.includes('yoga') || titleLower.includes('breathe')) iconName = 'Wind';
  else if (titleLower.includes('workout') || titleLower.includes('gym') || titleLower.includes('exercise')) iconName = 'Dumbbell';
  else if (titleLower.includes('read') || titleLower.includes('book')) iconName = 'BookOpen';
  else if (titleLower.includes('water') || titleLower.includes('drink')) iconName = 'Droplet';
  else if (titleLower.includes('code') || titleLower.includes('program')) iconName = 'Code2';
  else if (titleLower.includes('walk') || titleLower.includes('run')) iconName = 'Footprints';
  else if (titleLower.includes('sleep') || titleLower.includes('bed')) iconName = 'Moon';

  const IconComponent = Icons[habit.icon] || Icons[iconName] || Icons.Circle;

  return (
    <div
      onClick={onToggle}
      className={`group w-full py-2 pl-3 pr-2 rounded-[20px] flex flex-row items-center justify-between transition-all duration-300 cursor-pointer border ${isDone
        ? 'bg-white/[0.03] border-white/[0.05] opacity-50 grayscale'
        : 'bg-white/[0.06] backdrop-blur-md border-white/[0.08] shadow-lg shadow-black/20 hover:bg-white/[0.09] hover:-translate-y-[1px]'
        }`}
    >
      {/* Left Group: Icon Box & Name */}
      <div className="flex flex-row items-center gap-2.5 min-w-0">
        {/* Soft Glowing Icon Box */}
        <div className={`w-[40px] h-[40px] rounded-[14px] flex shrink-0 items-center justify-center transition-all duration-300 border ${isDone
          ? 'bg-white/[0.05] border-white/[0.1]'
          : `${habit.bg || 'bg-white/[0.08]'} ${habit.border || 'border-white/[0.12]'} ${habit.color || 'text-white'} shadow-[0_0_15px_-4px_rgba(0,0,0,0.3)]`
          }`} style={{ color: isDone ? 'var(--text-muted)' : undefined }}>
          <IconComponent size={18} strokeWidth={2.5} className={isDone ? 'opacity-40' : 'drop-shadow-sm'} />
        </div>

        {/* Habit Name */}
        <span className={`text-[14px] font-medium tracking-tight transition-all duration-300 truncate`} style={{ color: isDone ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
          {habit.title}
        </span>
      </div>

      {/* Luxurious Square Aura Badge */}
      <div className={`shrink-0 ml-2 w-10 h-10 rounded-[14px] flex flex-col items-center justify-center transition-all duration-500 aura-card ${isDone
        ? 'opacity-30 grayscale border-white/5 bg-white/5'
        : ''
        }`}>
        <Icons.Sparkles
          size={11}
          className={`${isDone ? 'sparkle-done text-purple-400' : 'opacity-40 mb-0.5 text-purple-400'} transition-all`}
        />
        <span className={`text-[11px] font-bold`} style={{ color: isDone ? 'var(--text-muted)' : 'var(--aura)' }}>
          {habit.aura ?? 0}
        </span>
      </div>
    </div>
  );
}

// ─── Checkbox task row (inside project cards) ─────────────────────
function CheckItem({ label, checked, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      borderBottom: '1px solid var(--border-subtle)',
      cursor: 'pointer',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 6, flexShrink: 0,
        border: checked ? 'none' : '2px solid var(--border)',
        background: checked ? 'var(--accent)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease',
      }}>
        {checked && <Check size={11} color="white" strokeWidth={3.5} />}
      </div>
      <span style={{
        flex: 1, fontSize: 13.5, fontWeight: checked ? 400 : 500,
        color: checked ? 'var(--text-muted)' : 'var(--text-primary)',
        textDecoration: checked ? 'line-through' : 'none',
        transition: 'all 0.2s ease',
      }}>{label}</span>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────
function ProjectCard({ project, onToggleTask }) {
  const [tasksOpen, setTasksOpen] = useState(false);
  const style = TYPE_COLORS[project.type] || TYPE_COLORS['Routine'];
  const done = project.tasks.filter(t => t.completed).length;
  const pct = project.tasks.length > 0 ? Math.round((done / project.tasks.length) * 100) : 0;

  return (
    <div style={{
      borderRadius: 16, background: 'var(--bg-elevated)',
      border: '1px solid var(--border-strong)', overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px 12px' }}>
        <div style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.4 }}>
          {project.name}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <span style={{
            fontSize: 10, fontWeight: 750, letterSpacing: '0.04em',
            padding: '3px 8px', borderRadius: 7,
            background: style.bg, color: style.color, border: `1px solid ${style.border}`,
            textTransform: 'uppercase',
          }}>{project.type}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 7,
            background: 'var(--aura-dim)', color: 'var(--aura)',
            border: '1px solid rgba(167,139,250,0.25)',
          }}>✦ {project.aura} Aura</span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 7,
            background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}>{project.importance}</span>
          <button
            onClick={() => setTasksOpen(o => !o)}
            style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 10.5, fontWeight: 700, padding: '4px 12px', borderRadius: 8,
              background: done === project.tasks.length ? 'var(--green-dim)' : 'var(--bg-card)',
              color: done === project.tasks.length ? 'var(--green)' : 'var(--text-secondary)',
              border: `1px solid ${done === project.tasks.length ? 'var(--green-dim)' : 'var(--border)'}`,
              cursor: 'pointer', outline: 'none', transition: 'all 0.2s ease',
            }}
          >
            {done}/{project.tasks.length}
            <ChevronDown size={11} style={{
              transition: 'transform 0.25s ease',
              transform: tasksOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }} />
          </button>
        </div>
        {pct > 0 && (
          <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: 'var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2, width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--accent), var(--aura))',
              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </div>
        )}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: tasksOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.3s ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {project.tasks.map(task => (
              <CheckItem key={task.id} label={task.title}
                checked={task.completed} onToggle={() => onToggleTask(project.id, task.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Highlight Card (Greeting + Ring + Habits list) ───────────────
function HighlightCard({ habits, onToggleHabit, user }) {
  const [isHabitsExpanded, setIsHabitsExpanded] = useState(false);

  // 1-Column Responsive Grid Settings
  const INITIAL_SLOTS = 4;
  const uncompleted = habits.filter(h => !h.completed);
  const completed = habits.filter(h => h.completed);
  const visible = isHabitsExpanded
    ? [...uncompleted, ...completed]
    : [...uncompleted, ...completed].slice(0, INITIAL_SLOTS);
  const hiddenCount = habits.length - INITIAL_SLOTS;

  // Progress logic
  const total = habits.length;
  const done = completed.length;
  const progress = total === 0 ? 0 : (done / total) * 100;

  // SVG Ring params
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{
      borderRadius: 28,
      background: 'var(--bg-card)',
      border: '1px solid var(--border-strong)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      padding: '24px 16px 20px 16px',
    }}>
      {/* Dynamic Greeting Header (No Ring) */}
      <div className="flex flex-row items-center justify-between mb-8 px-2">
        <div className="flex flex-col gap-1.5 items-start">
          <div className="text-[17px] font-semibold tracking-tight text-white/95 leading-tight">
            Ready to conquer today, {user?.name ? user.name.split(' ')[0] : 'Hero'}?
          </div>
          {/* Spacer to maintain layout balance after removing progress text */}
          <div style={{ height: '18px' }} />
        </div>
      </div>

      {/* Habits 2-col Grid Stack with Fade-Out wrapper */}
      <div className="relative">
        <div className={`grid grid-cols-2 gap-2.5 pb-2 ${!isHabitsExpanded ? 'overflow-hidden' : ''}`}>
          {visible.map(h => (
            <HabitCard key={h.id} habit={h} onToggle={() => onToggleHabit(h.id)} />
          ))}
        </div>

        {/* The Magic Gradient fade effect */}
        {!isHabitsExpanded && habits.length > INITIAL_SLOTS && (
          <div
            className="absolute bottom-0 left-0 w-full h-24 pointer-events-none rounded-b-[32px]"
            style={{ background: 'linear-gradient(to top, rgba(11,11,14,1) 0%, rgba(11,11,14,0) 100%)' }}
          />
        )}
      </div>

      {/* Show all / collapse toggle */}
      {habits.length > INITIAL_SLOTS && (
        <div className="w-full flex justify-center items-center mt-3">
          <button
            onClick={() => setIsHabitsExpanded(!isHabitsExpanded)}
            className="group px-6 py-2 rounded-full flex items-center justify-center gap-2 text-[13.5px] font-semibold transition-all duration-300 border border-white/[0.05] hover:border-white/[0.12]"
            style={{ color: 'var(--text-secondary)', background: 'transparent' }}
          >
            {isHabitsExpanded ? 'Show less' : `Show all ${habits.length} habits`}
            <ChevronDown size={14} strokeWidth={2.5} className={`transition-transform duration-300 ${isHabitsExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Home View ────────────────────────────────────────────────────
export default function HomeView({ habits, projects, user, onToggleHabit, onToggleTask }) {
  const tasksDone = projects.reduce((a, p) => a + p.tasks.filter(t => t.completed).length, 0);
  const totalTasks = projects.reduce((a, p) => a + p.tasks.length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 14 }}>

      {/* 1. Highlight Card: Greeting + Habits */}
      <HighlightCard habits={habits} onToggleHabit={onToggleHabit} user={user} />

      {/* 2. Today date header / divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
          textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap',
        }}>
          TODAY — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
        </span>
        <div style={{ height: 1, flex: 1, background: 'var(--border-subtle)' }} />
      </div>

      {/* 3. Active Projects */}
      <Accordion title="Active Projects" icon="📁" badge={`${projects.length}`} defaultOpen={true}>
        <div style={{ padding: '8px 12px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {projects.map(p => (
            <ProjectCard key={p.id} project={p} onToggleTask={onToggleTask} />
          ))}
        </div>
      </Accordion>
    </div>
  );
}
