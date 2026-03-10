// ─── Mock Data ───────────────────────────────────────────────────

export const user = {
  name: 'Omar P.',
  avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Omar&backgroundColor=1a1a2e',
  level: 10,
  levelPct: 62,       // % of current level completed
  auraToday: 17,      // total earned today (from completed habits)
  auraSpentToday: 50, // spent in the shop today
  auraTotal: 150,
};

export const habits = [
  { id: 'h1', title: 'Morning Meditation', icon: 'Sun', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', aura: 5,  completed: true },
  { id: 'h2', title: 'Drink Water', icon: 'Box', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', aura: 10, completed: false },
  { id: 'h3', title: 'Read a Book', icon: 'BookOpen', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', aura: 8,  completed: false },
  { id: 'h4', title: 'No Sugar Today', icon: 'Ban', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', aura: 12, completed: true },
  { id: 'h5', title: 'Workout', icon: 'Dumbbell', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', aura: 15, completed: false },
  { id: 'h6', title: 'Journal Entry', icon: 'PenLine', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', aura: 6,  completed: false },
];

// Projects with nested tasks (tasks grouped under a project)
export const projects = [
  {
    id: 'p1',
    name: 'YouTube Multi-Channel Content Sprint',
    type: 'QUEST',
    aura: 90,
    importance: '🔥 Important',
    tasks: [
      { id: 'pt1', title: 'Script episode #12 — Productivity deep dive', completed: false },
      { id: 'pt2', title: 'Record voiceover for short-form cuts',         completed: true },
      { id: 'pt3', title: 'Upload & schedule 3 Shorts',                   completed: false },
      { id: 'pt4', title: 'Reply to comments batch',                      completed: false },
    ],
  },
  {
    id: 'p2',
    name: 'App Backend API Refactor',
    type: 'Special Mission',
    aura: 120,
    importance: '⚡ Critical',
    tasks: [
      { id: 'pt5', title: 'Migrate habits endpoint to v2 schema',     completed: true },
      { id: 'pt6', title: 'Write integration tests for gamification', completed: false },
      { id: 'pt7', title: 'Deploy to staging & smoke-test',           completed: false },
    ],
  },
  {
    id: 'p3',
    name: 'Weekly Personal Review',
    type: 'Routine',
    aura: 30,
    importance: '📋 Normal',
    tasks: [
      { id: 'pt8',  title: "Review last week's goals",      completed: false },
      { id: 'pt9',  title: 'Set top 3 priorities for week',  completed: false },
      { id: 'pt10', title: 'Update Notion dashboard',         completed: false },
    ],
  },
];

export const shopCategories = [
  {
    id: 's1',
    label: 'Entertainment',
    emoji: '🎬',
    items: [
      { id: 'si1', title: 'Watch YouTube – 30 min',      aura: 30 },
      { id: 'si2', title: 'Netflix episode',              aura: 50 },
      { id: 'si3', title: 'Scroll social media – 15 min', aura: 20 },
      { id: 'si4', title: 'Play video games – 1 hour',   aura: 60 },
    ],
  },
  {
    id: 's2',
    label: 'Food & Treats',
    emoji: '🍕',
    items: [
      { id: 'si5', title: 'Order takeout',          aura: 80 },
      { id: 'si6', title: 'Buy a dessert',          aura: 25 },
      { id: 'si7', title: 'Coffee upgrade (latte)', aura: 15 },
    ],
  },
  {
    id: 's3',
    label: 'Rest & Comfort',
    emoji: '🛋️',
    items: [
      { id: 'si8',  title: 'Extra 30-min nap',   aura: 35 },
      { id: 'si9',  title: 'Skip gym today',     aura: 100 },
      { id: 'si10', title: 'Late night exception', aura: 45 },
    ],
  },
];

export const profileStats = {
  yearProgress: 18,
  monthProgress: 27,
  overdueProjects: 3,
  overdueTasks: 11,
  notesToReview: [
    { id: 'n1', title: 'Ideas for side project landing page' },
    { id: 'n2', title: 'Book notes – Atomic Habits' },
    { id: 'n3', title: 'Meeting takeaways 2026-03-05' },
    { id: 'n4', title: 'API design thoughts' },
    { id: 'n5', title: 'Quarterly OKRs draft' },
  ],
};
