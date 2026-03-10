import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, SendHorizonal, Settings2, ChevronDown, Check, Zap } from 'lucide-react';

export default function FAB({ showSnackbar, onProjectGenerated }) {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [models, setModels] = useState([]);

  // Persisted Settings
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('ai_selected_model') || 'smart');
  const [primaryModel, setPrimaryModel] = useState(() => localStorage.getItem('ai_primary_model') || 'google:gemini-2.5-flash');
  const [fallbackModel, setFallbackModel] = useState(() => localStorage.getItem('ai_fallback_model') || 'groq:llama3-8b-8192');
  const [visibleModelIds, setVisibleModelIds] = useState(() => {
    const saved = localStorage.getItem('ai_visible_models');
    return saved ? JSON.parse(saved) : ['groq:llama3-8b-8192', 'google:gemini-2.5-flash', 'groq:deepseek-r1-distill-llama-70b'];
  });

  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        if (data.models) setModels(data.models);
      })
      .catch(err => console.error("Failed to fetch AI models", err));
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_selected_model', selectedModel);
    localStorage.setItem('ai_primary_model', primaryModel);
    localStorage.setItem('ai_fallback_model', fallbackModel);
    localStorage.setItem('ai_visible_models', JSON.stringify(visibleModelIds));
  }, [selectedModel, primaryModel, fallbackModel, visibleModelIds]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (type) => {
    if (!text.trim()) return;
    setSubmitted('success');

    const url = type === 'note' ? '/api/add-note' : '/api/generate-tasks';

    const executionFn = async () => {
      setSubmitted('loading');
      const payload = type === 'project'
        ? {
          prompt: text,
          modelId: selectedModel,
          primaryModelId: primaryModel,
          fallbackModelId: fallbackModel
        }
        : { message: { text } };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to create via API');

      const data = await res.json();
      if (type === 'project' && onProjectGenerated && data.ai_plan) {
        onProjectGenerated(data.ai_plan);
      }
    };

    const rollbackFn = () => setSubmitted(false);

    if (showSnackbar) {
      showSnackbar(`Added ${type === 'note' ? 'Note' : 'Project'}`, executionFn, rollbackFn);
    } else {
      executionFn();
    }

    setTimeout(() => {
      setText('');
      setOpen(false);
      setSubmitted(false);
    }, 300);
  };

  const currentModelData = models.find(m => m.id === selectedModel);
  const filteredModels = models.filter(m => visibleModelIds.includes(m.id));

  return (
    <>
      <button className="fab" onClick={() => setOpen(true)} aria-label="Smart Capture">
        <Sparkles size={22} color="white" />
      </button>

      {open && (
        <>
          <div className="backdrop" onClick={() => { setOpen(false); setSettingsOpen(false); }} />
          <div className="bottom-sheet">
            <div style={{
              background: 'var(--bg-card)',
              borderTopLeftRadius: 28, borderTopRightRadius: 28,
              border: '1.5px solid var(--border-strong)', borderBottom: 'none',
              padding: '8px 20px 36px', boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
              position: 'relative'
            }}>
              <div style={{ width: 40, height: 5, borderRadius: 2.5, background: 'var(--border-strong)', margin: '12px auto 24px' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 12,
                    background: 'linear-gradient(135deg, var(--accent), #4f46e5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Sparkles size={18} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Smart Capture</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>AI categorized entry</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setSettingsOpen(!settingsOpen)} style={{
                    width: 32, height: 32, borderRadius: '50%', background: settingsOpen ? 'var(--aura)' : 'var(--bg-elevated)',
                    border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: settingsOpen ? 'white' : 'var(--text-secondary)'
                  }}>
                    <Settings2 size={16} />
                  </button>
                  <button onClick={() => setOpen(false)} style={{
                    width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-secondary)'
                  }}>
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Model Selector UI */}
              {!settingsOpen && (
                <div style={{ position: 'relative', marginBottom: 16 }} ref={dropdownRef}>
                  <div
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 14,
                      background: 'var(--bg-elevated)', border: '1.5px solid var(--border-strong)',
                      color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {selectedModel === 'smart' ? <Sparkles size={14} color="var(--aura)" /> : currentModelData?.provider === 'Google' ? <Sparkles size={14} color="#4285F4" /> : <Zap size={14} color="#f59e0b" />}
                      <span>{selectedModel === 'smart' ? 'Smart Routing (Hybrid)' : (currentModelData?.name || selectedModel)}</span>
                    </div>
                    <ChevronDown size={14} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </div>

                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 8,
                      background: 'var(--bg-card)', border: '1.5px solid var(--border-strong)',
                      borderRadius: 16, padding: '8px 6px', boxShadow: '0 12px 48px rgba(0,0,0,0.6)', zIndex: 100,
                      maxHeight: 280, overflowY: 'auto'
                    }}>
                      <div
                        onClick={() => { setSelectedModel('smart'); setDropdownOpen(false); }}
                        style={{
                          padding: '10px 12px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                          background: selectedModel === 'smart' ? 'rgba(167, 139, 250, 0.1)' : 'transparent'
                        }}
                      >
                        <Sparkles size={14} color="var(--aura)" />
                        <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>Smart Routing (Hybrid)</div>
                        {selectedModel === 'smart' && <Check size={14} color="var(--aura)" />}
                      </div>
                      <div style={{ height: 1, background: 'var(--border-strong)', margin: '6px 8px' }} />
                      {filteredModels.map(m => (
                        <div
                          key={m.id}
                          onClick={() => { setSelectedModel(m.id); setDropdownOpen(false); }}
                          style={{
                            padding: '10px 12px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                            background: selectedModel === m.id ? 'rgba(167, 139, 250, 0.1)' : 'transparent'
                          }}
                        >
                          {m.provider === 'Google' ? <Sparkles size={14} color="#4285F4" /> : <Zap size={14} color="#f59e0b" />}
                          <div style={{
                            flex: 1, fontSize: 13, fontWeight: 500,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                          }} title={m.name}>
                            {m.name}
                          </div>
                          {selectedModel === m.id && <Check size={14} color="var(--aura)" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Overlay */}
              {settingsOpen && (
                <div style={{
                  marginBottom: 16, padding: 16, borderRadius: 16,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-strong)'
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--aura)', textTransform: 'uppercase', marginBottom: 12 }}>Smart Configuration</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Primary Model</span>
                      <select value={primaryModel} onChange={e => setPrimaryModel(e.target.value)} style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 11, padding: '4px 8px' }}>
                        {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Fallback Model</span>
                      <select value={fallbackModel} onChange={e => setFallbackModel(e.target.value)} style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 11, padding: '4px 8px' }}>
                        {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ height: 1, background: 'var(--border-strong)', margin: '14px 0' }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Curation (Show in List)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 120, overflowY: 'auto', padding: 2 }}>
                    {models.map(m => {
                      const isVisible = visibleModelIds.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => {
                            if (isVisible) setVisibleModelIds(visibleModelIds.filter(id => id !== m.id));
                            else setVisibleModelIds([...visibleModelIds, m.id]);
                          }}
                          style={{
                            fontSize: 10, padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                            background: isVisible ? 'var(--aura)' : 'var(--bg-elevated)',
                            color: isVisible ? 'white' : 'var(--text-muted)',
                            border: '1px solid var(--border-strong)', transition: '0.2s'
                          }}
                        >
                          {m.name}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <textarea
                className="smart-textarea" rows={4} value={text} onChange={e => setText(e.target.value)}
                placeholder="Type a task, habit, idea, or note..."
                style={{ marginBottom: 16, border: '1.5px solid var(--border-strong)', fontSize: '15px' }}
              />

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="submit-btn" onClick={() => handleSubmit('project')}
                  disabled={!text.trim() || submitted !== false}
                  style={{
                    flex: 1, height: 48, borderRadius: 14, opacity: submitted === 'loading' ? 0.7 : 1,
                    background: submitted === 'success' ? 'var(--green)' : 'var(--aura)', color: 'white',
                    border: 'none', fontSize: 14.5, fontWeight: 600, boxShadow: submitted === 'success' ? 'none' : '0 4px 15px rgba(167, 139, 250, 0.3)'
                  }}
                >
                  {submitted === 'loading' ? 'Sharing...' : submitted === 'success' ? '✓ Done' : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <SendHorizonal size={16} strokeWidth={2.5} /> Project
                    </span>
                  )}
                </button>
                <button
                  className="submit-btn" onClick={() => handleSubmit('note')}
                  disabled={!text.trim() || submitted !== false}
                  style={{
                    flex: 1, height: 48, borderRadius: 14, opacity: submitted === 'loading' ? 0.7 : 1,
                    background: submitted === 'success' ? 'var(--green)' : 'var(--bg-elevated)',
                    border: '1.5px solid var(--border-strong)', color: submitted === 'success' ? 'white' : 'var(--text-primary)',
                    fontSize: 14.5, fontWeight: 600
                  }}
                >
                  {submitted === 'loading' ? 'Saving...' : submitted === 'success' ? '✓ Saved' : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <SendHorizonal size={16} strokeWidth={2.5} /> Note
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

