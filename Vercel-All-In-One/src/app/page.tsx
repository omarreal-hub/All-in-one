'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import FAB from '@/components/FAB';
import HomeView from '@/views/HomeView';
import ShopView from '@/views/ShopView';
import ProfileView from '@/views/ProfileView';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Undo Snackbar State
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', onUndo: null, submitRef: null });
  const snackbarTimer = useRef(null);

  // Real data state
  const [user, setUser] = useState({});
  const [habits, setHabits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [shopItems, setShopItems] = useState([]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/get-dashboard', { method: 'POST' });
      if (!res.ok) throw new Error('Dashboard fetch failed');
      const data = await res.json();

      const profile = data.profile || {};
      const mappedUser = {
        name: profile.name || 'Hero',
        avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Hero')}&background=7c3aed&color=fff&size=256`,
        level: profile.level?.num || 1,
        levelPct: parseInt(profile.level?.bar) || 0,
        auraTotal: profile.points?.total || 0,
        auraToday: profile.points?.today || 0,
        auraSpentToday: profile.points?.spent || 0,
        recentPurchases: profile.recentPurchases || [],
        joinDate: 'Oct 2023',
        streak: 0,
        longestStreak: 0,
        overdueProjects: profile.overdue?.projects || 0,
        overdueTasks: profile.overdue?.tasks || 0,
        notesToReviewCount: profile.reviewNotes?.count || 0,
        notesToReviewItems: profile.reviewNotes?.items || [],
        yearProgress: parseInt(profile.time?.yearBar) || 0,
        monthProgress: parseInt(profile.time?.monthBar) || 0
      };
      setUser(mappedUser);
      setHabits(data.habits || []);

      const rawTasks = data.tasks || [];
      const mappedProjects = (data.projects || []).map(p => {
        const projectTasks = rawTasks.filter(t => {
          for (const key in t.raw) {
            if (t.raw[key]?.type === 'relation' && t.raw[key].relation.some(r => r.id === p.id)) return true;
          }
          return false;
        }).map(t => ({
          id: t.id,
          title: t.title,
          completed: t.raw.Status?.status?.name === 'Completed'
        }));

        return {
          id: p.id,
          title: p.title,
          name: p.name,
          type: p.type,
          importance: p.importance,
          aura: p.aura,
          tasks: projectTasks
        };
      });

      setProjects(mappedProjects);
      setShopItems(data.shop || []);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedTab = typeof window !== 'undefined' ? localStorage.getItem('activeTab') : null;
    if (savedTab) setActiveTab(savedTab);
  }, []);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const showSnackbar = useCallback((message, executionFn, rollbackFn) => {
    if (snackbarTimer.current) {
      clearTimeout(snackbarTimer.current);
      if (snackbar.submitRef) snackbar.submitRef();
    }

    const wrappedExecution = async () => {
      try {
        await executionFn();
        fetchData();
      } catch (e) { console.error('Silent execution failed', e); }
    };

    setSnackbar({ visible: true, message, onUndo: rollbackFn, submitRef: wrappedExecution });

    snackbarTimer.current = setTimeout(() => {
      wrappedExecution();
      setSnackbar(s => ({ ...s, visible: false, submitRef: null }));
      snackbarTimer.current = null;
    }, 4000);
  }, [snackbar.submitRef]);

  const handleUndo = useCallback(() => {
    if (snackbarTimer.current) clearTimeout(snackbarTimer.current);
    snackbarTimer.current = null;
    if (snackbar.onUndo) snackbar.onUndo();
    setSnackbar(s => ({ ...s, visible: false, submitRef: null }));
  }, [snackbar]);

  const toggleHabit = (id) => {
    setHabits(h => h.map(x => x.id === id ? { ...x, completed: !x.completed } : x));
    const habit = habits.find(x => x.id === id);
    if (!habit) return;
    const isNowCompleted = !habit.completed;

    const executionFn = async () => {
      await fetch('/api/toggle-habit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit_id: id, action: 'toggle' })
      });
    };

    const rollbackFn = () => {
      setHabits(h => h.map(x => x.id === id ? { ...x, completed: !x.completed } : x));
    };

    showSnackbar(isNowCompleted ? 'Habit marked as done' : 'Habit unchecked', executionFn, rollbackFn);
  };

  const toggleTask = (projectId, taskId) => {
    let task = null;
    for (const p of projects) {
      if (p.id === projectId) {
        task = p.tasks.find(t => t.id === taskId);
        break;
      }
    }
    if (!task) return;

    const isNowCompleted = !task.completed;

    setProjects(ps => ps.map(p =>
      p.id === projectId
        ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, completed: isNowCompleted } : t) }
        : p
    ));

    const executionFn = async () => {
      const res = await fetch('/api/complete-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_id: taskId })
      });
      if (!res.ok) throw new Error('Failed to toggle task');
    };

    const rollbackFn = () => {
      setProjects(ps => ps.map(p =>
        p.id === projectId
          ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, completed: !isNowCompleted } : t) }
          : p
      ));
    };

    showSnackbar(isNowCompleted ? 'Task marked as completed' : 'Task unchecked', executionFn, rollbackFn);
  };

  const handleArchiveNote = async (noteId) => {
    setUser(u => ({
      ...u,
      notesToReviewCount: Math.max(0, u.notesToReviewCount - 1),
      notesToReviewItems: u.notesToReviewItems.filter(n => n.id !== noteId)
    }));
    try {
      const res = await fetch('/api/archive-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId })
      });
      if (!res.ok) throw new Error('API failed');
      setTimeout(() => fetchData(), 500);
    } catch (e) {
      console.error('Failed to archive note', e);
      fetchData();
    }
  };

  const handleBuyItem = (item) => {
    setUser(u => {
      const newAuraTotal = Math.max(0, u.auraTotal - item.price);
      return {
        ...u,
        auraTotal: newAuraTotal,
        auraSpentToday: u.auraSpentToday + item.price,
        recentPurchases: [{
          id: item.id,
          title: item.title,
          price: item.price,
          date: new Date().toISOString()
        }, ...(u.recentPurchases || [])]
      };
    });

    const executionFn = async () => {
      const res = await fetch('/api/buy-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id })
      });
      if (!res.ok) throw new Error('API failed');
    };

    const rollbackFn = () => {
      setUser(u => {
        const revertAuraTotal = u.auraTotal + item.price;
        return {
          ...u,
          auraTotal: revertAuraTotal,
          auraSpentToday: Math.max(0, u.auraSpentToday - item.price),
          recentPurchases: (u.recentPurchases || []).filter(x => x.id !== item.id)
        };
      });
    };

    showSnackbar(`Purchased ${item.title}!`, executionFn, rollbackFn);
  };

  if (loading && !user.name) {
    return (
      <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const habitsDone = habits.filter(h => h.completed).length;
  const totalHabits = habits.length;
  const tasksDone = projects.reduce((a, p) => a + p.tasks.filter(t => t.completed).length, 0);
  const totalTasks = projects.reduce((a, p) => a + p.tasks.length, 0);
  const projectsDone = projects.filter(p => p.tasks.length > 0 && p.tasks.every(t => t.completed)).length;
  const totalProjects = projects.length;

  const showHeader = activeTab !== 'profile';
  const stats = { habitsDone, totalHabits, tasksDone, totalTasks, projectsDone, totalProjects };

  const renderView = () => {
    if (activeTab === 'home') return <HomeView habits={habits} projects={projects} user={user} onToggleHabit={toggleHabit} onToggleTask={toggleTask} />;
    if (activeTab === 'shop') return <ShopView user={user} shopItems={shopItems} onBuyItem={handleBuyItem} />;
    if (activeTab === 'profile') return <ProfileView habits={habits} projects={projects} stats={stats} user={user} onArchiveNote={handleArchiveNote} />;
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {showHeader && <Header {...stats} user={user} />}
      <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '128px' }}>
        <div style={{ padding: '0 14px' }}>
          {renderView()}
        </div>
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
      <FAB showSnackbar={showSnackbar} onProjectGenerated={() => fetchData()} />

      {snackbar.visible && (
        <div style={{
          position: 'fixed', bottom: 90, left: 20, right: 20,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14,
          padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          <span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}>{snackbar.message}</span>
          <button onClick={handleUndo} style={{ background: 'transparent', border: 'none', color: 'var(--aura)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>UNDO</button>
        </div>
      )}
    </div>
  );
}
