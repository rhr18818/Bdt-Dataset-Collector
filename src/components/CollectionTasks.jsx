import { useState, useEffect } from 'react';
import { Camera, ChevronDown, ChevronRight, CheckCircle, Plus, Fingerprint, Layers, FileSymlink, Maximize } from 'lucide-react';
import { Modal, ProgressBar, Badge, EmptyState, Btn, RingProgress } from './ui/index.jsx';
import {
  DENOMINATIONS, CONDITIONS, ENVIRONMENTS, LIGHTING, ARRANGEMENTS, BG_TYPES,
  B_COMBINATIONS, C_SUBTASKS, CATEGORY_LABELS
} from '../data/seedData.js';

// ── Helpers ──────────────────────────────────────────────────────────────
function toggle(arr, val) {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

function CheckGroup({ label, options, selected, onChange }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = selected.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => onChange(toggle(selected, opt))}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={{
                background: active ? 'var(--accent)' : '#fff',
                color: active ? '#fff' : 'var(--text-muted)',
                borderColor: active ? 'var(--accent)' : 'var(--border)',
              }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Single-Note Logging Modal ─────────────────────────────────────────────
function SingleNoteModal({ denom, team, onSubmit, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedDenom, setSelectedDenom] = useState(denom || null);
  const [conditions, setConditions] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [lighting, setLighting] = useState([]);
  const [count, setCount] = useState('');
  const [memberId, setMemberId] = useState(team[0]?.id || '');
  const [notes, setNotes] = useState('');

  const canNext = {
    1: !!selectedDenom,
    2: conditions.length > 0,
    3: environments.length > 0,
    4: lighting.length > 0,
    5: count > 0,
    6: !!memberId,
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' && canNext[step]) {
        if (step < 7) setStep(s => s + 1);
        else handleSubmit();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [step, canNext, selectedDenom, conditions, environments, lighting, count, memberId]);

  function handleSubmit() {
    if (!selectedDenom || !count) return;
    onSubmit({
      category: 'A',
      subcategory: `single:${selectedDenom}tk`,
      denominations: [selectedDenom],
      groundTruthSum: 0,
      conditions,
      environments,
      lighting,
      arrangements: [],
      imageCount: parseInt(count),
      memberId,
      notes,
    });
  }

  const steps = ['Denomination', 'Condition', 'Environment', 'Lighting', 'Count', 'Annotator', 'Confirm'];

  return (
    <Modal title="Log Single Note Session" onClose={onClose} size="md"
      footer={<><span>Press Enter to advance · Escape to close</span><span>Step {step} of 7</span></>}>
      {/* Progress steps */}
      <div className="flex gap-1 mb-5">
        {steps.map((s, i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-colors"
            style={{ background: i + 1 <= step ? 'var(--accent)' : '#e5e7eb' }} />
        ))}
      </div>

      {step === 1 && (
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Select denomination</p>
          <div className="grid grid-cols-4 gap-2">
            {DENOMINATIONS.map(d => (
              <button key={d} type="button" onClick={() => setSelectedDenom(d)}
                className="py-3 rounded-xl font-bold text-sm font-mono border-2 transition-all"
                style={{
                  background: selectedDenom === d ? 'var(--accent)' : '#fff',
                  color: selectedDenom === d ? '#fff' : 'var(--text-primary)',
                  borderColor: selectedDenom === d ? 'var(--accent)' : 'var(--border)',
                }}>
                ৳{d}
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 2 && <CheckGroup label="Note Condition" options={CONDITIONS} selected={conditions} onChange={setConditions} />}
      {step === 3 && <CheckGroup label="Environment / Location" options={ENVIRONMENTS} selected={environments} onChange={setEnvironments} />}
      {step === 4 && <CheckGroup label="Lighting Condition" options={LIGHTING} selected={lighting} onChange={setLighting} />}
      {step === 5 && (
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Number of images collected this session</p>
          <input type="number" min="1" value={count} onChange={e => setCount(e.target.value)} autoFocus
            className="w-full border rounded-xl px-4 py-3 text-2xl font-mono text-center focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--border)', fontFamily: 'JetBrains Mono, monospace', '--tw-ring-color': 'var(--accent)' }}
            placeholder="0" />
          <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>Running total after save: live preview above</p>
        </div>
      )}
      {step === 6 && (
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Your name</p>
          {team.length > 1 ? (
            <select value={memberId} onChange={e => setMemberId(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none"
              style={{ borderColor: 'var(--border)', fontFamily: 'Inter, sans-serif' }}>
              {team.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
            </select>
          ) : (
            <div className="w-full border rounded-xl px-4 py-3 text-sm bg-gray-50 flex items-center gap-2" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: team[0]?.color || '#ccc' }}></div>
              <span>Logging as <strong>{team[0]?.name}</strong></span>
            </div>
          )}
          <div className="mt-3">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Notes (optional)</p>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
              style={{ borderColor: 'var(--border)' }} placeholder="Any special conditions, issues to flag..." />
          </div>
        </div>
      )}
      {step === 7 && (
        <div className="rounded-xl p-4" style={{ background: '#f8f9ff', border: '1px solid #c7d7fe' }}>
          <p className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Review & Confirm</p>
          {[
            ['Denomination', `৳${selectedDenom}`],
            ['Conditions', conditions.join(', ')],
            ['Environments', environments.join(', ')],
            ['Lighting', lighting.join(', ')],
            ['Images', count],
            ['Annotator', team.find(m => m.id === memberId)?.name || '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm py-1 border-b last:border-0" style={{ borderColor: '#e0e7ff' }}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span className="font-medium font-mono" style={{ color: 'var(--text-primary)' }}>{v || '—'}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-5">
        <Btn variant="ghost" onClick={() => step > 1 ? setStep(s => s - 1) : onClose()} size="sm">
          {step > 1 ? '← Back' : 'Cancel'}
        </Btn>
        {step < 7 ? (
          <Btn variant="primary" onClick={() => setStep(s => s + 1)} disabled={!canNext[step]} size="sm">Next →</Btn>
        ) : (
          <Btn variant="success" onClick={handleSubmit} size="sm">✓ Log Session</Btn>
        )}
      </div>
    </Modal>
  );
}

// ── Multi-Note Logging Modal ──────────────────────────────────────────────
function MultiNoteModal({ combo, team, onSubmit, onClose }) {
  const [arrangements, setArrangements] = useState([]);
  const [count, setCount] = useState('');
  const [background, setBackground] = useState('');
  const [memberId, setMemberId] = useState(team[0]?.id || '');
  const [notes, setNotes] = useState('');

  function handleSubmit() {
    if (!count || !memberId) return;
    onSubmit({
      category: 'B',
      subcategory: combo.key,
      denominations: combo.denoms,
      groundTruthSum: combo.sum,
      conditions: [],
      environments: [],
      lighting: [],
      arrangements,
      imageCount: parseInt(count),
      memberId,
      notes,
      background,
    });
  }

  return (
    <Modal title={`Log Multi-Note: ${combo.denoms.map(d => `৳${d}`).join(' + ')} = ৳${combo.sum}`} onClose={onClose} size="md"
      footer={<><span>Press Escape to close</span></>}>
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ background: '#fef3c7' }}>
        <span className="text-2xl font-bold font-mono" style={{ color: 'var(--accent-warm)' }}>৳{combo.sum}</span>
        <div>
          <p className="text-xs font-medium" style={{ color: '#92400e' }}>Ground truth sum</p>
          <p className="text-xs" style={{ color: '#92400e' }}>{combo.denoms.map(d => `৳${d}`).join(' + ')} = ৳{combo.sum}</p>
        </div>
      </div>

      <CheckGroup label="Physical Arrangements (select all covered)" options={ARRANGEMENTS} selected={arrangements} onChange={setArrangements} />

      <div className="mb-4">
        <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Background Type</p>
        <div className="flex flex-wrap gap-2">
          {BG_TYPES.map(bg => (
            <button key={bg} type="button" onClick={() => setBackground(bg)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={{ background: background === bg ? 'var(--accent)' : '#fff', color: background === bg ? '#fff' : 'var(--text-muted)', borderColor: background === bg ? 'var(--accent)' : 'var(--border)' }}>
              {bg}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Number of Images</p>
        <input type="number" min="1" value={count} onChange={e => setCount(e.target.value)} autoFocus
          className="w-full border rounded-xl px-4 py-3 text-xl font-mono text-center focus:outline-none"
          style={{ borderColor: 'var(--border)', fontFamily: 'JetBrains Mono, monospace' }} placeholder="0" />
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Collected By</p>
        {team.length > 1 ? (
          <select value={memberId} onChange={e => setMemberId(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none" style={{ borderColor: 'var(--border)' }}>
            {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        ) : (
           <div className="w-full border rounded-xl px-4 py-2 text-sm bg-gray-50 flex items-center gap-2" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: team[0]?.color || '#ccc' }}></div>
              <span>Logging as <strong>{team[0]?.name}</strong></span>
            </div>
        )}
      </div>

      <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
        className="w-full border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none mb-4"
        style={{ borderColor: 'var(--border)' }} placeholder="Optional notes..." />

      <div className="flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="success" onClick={handleSubmit} disabled={!count || !memberId}>✓ Log Session</Btn>
      </div>
    </Modal>
  );
}

// ── Random B Logging Modal ────────────────────────────────────────────────
function RandomBModal({ team, onSubmit, onClose }) {
  const [denomInput, setDenomInput] = useState('');
  const [count, setCount] = useState('');
  const [memberId, setMemberId] = useState(team[0]?.id || '');
  const denomNums = denomInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && DENOMINATIONS.includes(n));
  const sum = denomNums.reduce((a, b) => a + b, 0);

  function handleSubmit() {
    if (!count || !memberId || denomNums.length < 2) return;
    onSubmit({
      category: 'B',
      subcategory: 'random',
      denominations: denomNums,
      groundTruthSum: sum,
      conditions: [],
      environments: [],
      lighting: [],
      arrangements: [],
      imageCount: parseInt(count),
      memberId,
      notes: '',
    });
  }

  return (
    <Modal title="Log Random/Diverse Multi-Note" onClose={onClose} size="sm" footer={<span>Escape to cancel</span>}>
      <div className="mb-4">
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Denominations (comma-separated)</p>
        <input type="text" value={denomInput} onChange={e => setDenomInput(e.target.value)}
          className="w-full border rounded-xl px-4 py-2 text-sm font-mono focus:outline-none"
          style={{ borderColor: 'var(--border)' }} placeholder="e.g. 100, 50, 20" />
        {denomNums.length >= 2 && (
          <p className="text-xs mt-1 font-mono font-semibold" style={{ color: 'var(--success)' }}>Sum: ৳{sum}</p>
        )}
      </div>
      <div className="mb-4">
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Number of Images</p>
        <input type="number" min="1" value={count} onChange={e => setCount(e.target.value)}
          className="w-full border rounded-xl px-4 py-2 text-sm font-mono focus:outline-none"
          style={{ borderColor: 'var(--border)' }} />
      </div>
      <div className="mb-4">
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Collected By</p>
        {team.length > 1 ? (
          <select value={memberId} onChange={e => setMemberId(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none" style={{ borderColor: 'var(--border)' }}>
            {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        ) : (
           <div className="w-full border rounded-xl px-4 py-2 text-sm bg-gray-50 flex items-center gap-2" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: team[0]?.color || '#ccc' }}></div>
              <span>Logging as <strong>{team[0]?.name}</strong></span>
            </div>
        )}
      </div>
      <div className="flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="success" onClick={handleSubmit} disabled={denomNums.length < 2 || !count}>✓ Log</Btn>
      </div>
    </Modal>
  );
}

// ── Category C Modal ──────────────────────────────────────────────────────
function CategoryCModal({ subtask, team, onSubmit, onClose }) {
  const [count, setCount] = useState('');
  const [memberId, setMemberId] = useState(team[0]?.id || '');
  const [notes, setNotes] = useState('');

  function handleSubmit() {
    if (!count || !memberId) return;
    onSubmit({
      category: 'C',
      subcategory: subtask.key,
      denominations: [],
      groundTruthSum: 0,
      conditions: [],
      environments: [],
      lighting: [],
      arrangements: [],
      imageCount: parseInt(count),
      memberId,
      notes,
    });
  }

  return (
    <Modal title={`Log Occlusion: ${subtask.label}`} onClose={onClose} size="sm" footer={<span>Escape to cancel</span>}>
      <div className="mb-4">
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Number of Images</p>
        <input type="number" min="1" value={count} onChange={e => setCount(e.target.value)} autoFocus
          className="w-full border rounded-xl px-4 py-3 text-xl font-mono text-center focus:outline-none"
          style={{ borderColor: 'var(--border)', fontFamily: 'JetBrains Mono, monospace' }} />
      </div>
      <div className="mb-4">
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Collected By</p>
        {team.length > 1 ? (
          <select value={memberId} onChange={e => setMemberId(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none" style={{ borderColor: 'var(--border)' }}>
            {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        ) : (
           <div className="w-full border rounded-xl px-4 py-2 text-sm bg-gray-50 flex items-center gap-2" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: team[0]?.color || '#ccc' }}></div>
              <span>Logging as <strong>{team[0]?.name}</strong></span>
            </div>
        )}
      </div>
      <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
        className="w-full border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none mb-4"
        style={{ borderColor: 'var(--border)' }} placeholder="Optional notes..." />
      <div className="flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="success" onClick={handleSubmit} disabled={!count}>✓ Log Session</Btn>
      </div>
    </Modal>
  );
}

// ── Category D Matrix Modal ───────────────────────────────────────────────
function CategoryDModal({ env, light, team, onSubmit, onClose }) {
  const [count, setCount] = useState('');
  const [memberId, setMemberId] = useState(team[0]?.id || '');

  function handleSubmit() {
    if (!count || !memberId) return;
    onSubmit({
      category: 'D',
      subcategory: `${env}||${light}`,
      denominations: [],
      groundTruthSum: 0,
      conditions: [],
      environments: [env],
      lighting: [light],
      arrangements: [],
      imageCount: parseInt(count),
      memberId,
      notes: '',
    });
  }

  return (
    <Modal title={`Log D-Matrix: ${env} × ${light}`} onClose={onClose} size="sm" footer={<span>Escape to cancel</span>}>
      <div className="p-3 rounded-xl mb-4 text-sm" style={{ background: '#f0f4ff' }}>
        <p style={{ color: 'var(--accent)' }}>Environment: <strong>{env}</strong></p>
        <p style={{ color: 'var(--accent)' }}>Lighting: <strong>{light}</strong></p>
      </div>
      <div className="mb-4">
        <p className="text-sm font-medium mb-1">Number of Images</p>
        <input type="number" min="1" value={count} onChange={e => setCount(e.target.value)} autoFocus
          className="w-full border rounded-xl px-4 py-3 text-xl font-mono text-center focus:outline-none"
          style={{ borderColor: 'var(--border)', fontFamily: 'JetBrains Mono, monospace' }} />
      </div>
      <div className="mb-4">
        <p className="text-sm font-medium mb-1">Collected By</p>
        {team.length > 1 ? (
          <select value={memberId} onChange={e => setMemberId(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none" style={{ borderColor: 'var(--border)' }}>
            {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        ) : (
           <div className="w-full border rounded-xl px-4 py-2 text-sm bg-gray-50 flex items-center gap-2" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: team[0]?.color || '#ccc' }}></div>
              <span>Logging as <strong>{team[0]?.name}</strong></span>
            </div>
        )}
      </div>
      <div className="flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="success" onClick={handleSubmit} disabled={!count}>✓ Log Session</Btn>
      </div>
    </Modal>
  );
}

// ── Category A Section ────────────────────────────────────────────────────
function CategoryASection({ computed, targets, team, onLog }) {
  const [openModal, setOpenModal] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const { collectedByADenom } = computed;
  const total = computed.collectedByCategory.A;
  const target = targets.A;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: '#fff' }}>
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ background: '#2563eb' }}>A</div>
        <div className="flex-1">
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Single Note Images</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Target: {target.toLocaleString()} · Collected: <span className="font-mono font-semibold">{total.toLocaleString()}</span></p>
        </div>
        <ProgressBar value={total} max={target} color="#2563eb" height={6} />
        <span className="w-10 text-right text-sm font-mono font-bold" style={{ color: '#2563eb' }}>{Math.round(total/target*100)}%</span>
        {expanded ? <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
      </button>
      {expanded && (
        <div className="border-t px-5 py-4" style={{ borderColor: 'var(--border)' }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {DENOMINATIONS.map(d => {
              const cnt = collectedByADenom[d] || 0;
              const tgt = targets.A_denominations?.[d] || Math.round(10000/7);
              const pct = Math.round(cnt / tgt * 100);
              return (
                <div key={d} className="rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-shadow"
                  style={{ border: '1px solid var(--border)' }} onClick={() => setOpenModal(d)}>
                  <RingProgress value={cnt} max={tgt} size={56} strokeWidth={6} color="#2563eb" />
                  <p className="font-bold text-xs font-mono" style={{ color: 'var(--text-primary)' }}>৳{d}</p>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{cnt}/{tgt}</p>
                  <Btn variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); setOpenModal(d); }} className="w-full justify-center text-xs">Log</Btn>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {openModal && (
        <SingleNoteModal denom={openModal} team={team} onClose={() => setOpenModal(null)}
          onSubmit={(data) => { onLog(data); setOpenModal(null); }} />
      )}
    </div>
  );
}

// ── Category B Section ────────────────────────────────────────────────────
function CategoryBSection({ computed, targets, team, onLog, currentUser, dispatch }) {
  const [openCombo, setOpenCombo] = useState(null);
  const [showRandom, setShowRandom] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [activeNoteCount, setActiveNoteCount] = useState(2);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [toast, setToast] = useState(null);
  const [prevCollected, setPrevCollected] = useState(computed.collectedByCombination);
  const [animatingKeys, setAnimatingKeys] = useState({});

  const isAdmin = currentUser?.accessId === 'admin' || currentUser?.role === 'lead';

  const handleTargetEdit = (combo) => {
    if (!isAdmin) return;
    const currentTgt = targets.B_combinations?.[combo.key] || combo.target;
    // Format combination string like "100+50" nicely
    const comboStr = combo.denoms.join('+');
    const val = window.prompt(`Edit target amount for [${comboStr}]:`, currentTgt);
    
    if (val !== null) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed > 0) {
        dispatch({
          type: 'SET_TARGET',
          payload: {
            key: 'B_combinations',
            value: {
              ...(targets.B_combinations || {}),
              [combo.key]: parsed
            }
          }
        });
      } else {
        alert("Please enter a valid positive number.");
      }
    }
  };

  const { collectedByCombination, bRandomCollected } = computed;
  const total = computed.collectedByCategory.B;

  useEffect(() => {
    const newlyCompleted = [];
    B_COMBINATIONS.forEach(combo => {
      const prevCnt = prevCollected[combo.key] || 0;
      const currCnt = collectedByCombination[combo.key] || 0;
      const tgt = targets.B_combinations?.[combo.key] || combo.target;
      if (prevCnt < tgt && currCnt >= tgt) newlyCompleted.push(combo);
    });

    if (newlyCompleted.length > 0) {
      const newest = newlyCompleted[newlyCompleted.length - 1];
      const tgt = targets.B_combinations?.[newest.key] || newest.target;
      setToast(`✓ Combination [${newest.key.replace(/\+/g, '+')}] completed! ${collectedByCombination[newest.key]}/${tgt} images logged.`);
      setTimeout(() => setToast(null), 3000);

      const newAnimInfos = {};
      newlyCompleted.forEach(c => newAnimInfos[c.key] = true);
      setAnimatingKeys(prev => ({ ...prev, ...newAnimInfos }));
      
      setTimeout(() => {
        setAnimatingKeys(prev => {
          const next = { ...prev };
          newlyCompleted.forEach(c => delete next[c.key]);
          return next;
        });
      }, 800);
    }
    setPrevCollected(collectedByCombination);
  }, [collectedByCombination, prevCollected, targets]);

  const currentCombos = B_COMBINATIONS.filter(c => c.notes === activeNoteCount);
  
  const todoCombos = [];
  const completedCombos = [];

  currentCombos.forEach(combo => {
    const cnt = collectedByCombination[combo.key] || 0;
    const tgt = targets.B_combinations?.[combo.key] || combo.target;
    // Keep in ToDo if animating
    if (cnt >= tgt && !animatingKeys[combo.key]) {
      completedCombos.push({ combo, cnt, tgt });
    } else {
      todoCombos.push({ combo, cnt, tgt });
    }
  });

  const remainingImages = todoCombos.reduce((sum, item) => sum + Math.max(0, item.tgt - item.cnt), 0);

  const renderTable = (items, isCompleted) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr style={{ background: isCompleted ? 'transparent' : '#f8f9ff' }}>
            {['Notes','Denominations','Sum','Target','Collected','Done',''].map(h => (
              <th key={h} className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--text-muted)', borderBottom: `1px solid ${isCompleted ? '#dcfce7' : 'var(--border)'}`, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(({ combo, cnt, tgt }) => {
            const pct = Math.round(cnt / tgt * 100);
            const done = cnt >= tgt && !animatingKeys[combo.key];
            const isAnim = animatingKeys[combo.key];
            const rowStyle = { 
              transition: 'all 0.8s ease',
              background: isAnim ? '#bbf7d0' : isCompleted ? '#f0fdf4' : 'transparent',
              borderColor: isCompleted ? '#dcfce7' : 'var(--border)',
            };

            return (
              <tr key={combo.key} className={`${!isCompleted && !isAnim ? 'hover:bg-gray-50' : ''} border-b`} style={rowStyle}>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {isCompleted && <span style={{ color: '#22c55e', fontSize: '10px' }}>●</span>}
                    <span className="px-1.5 py-0.5 rounded text-xs font-mono font-bold" style={{ background: isCompleted ? '#dcfce7' : '#f0f4ff', color: isCompleted ? '#166534' : 'var(--accent)' }}>{combo.notes}</span>
                  </div>
                </td>
                <td className="px-3 py-2 font-mono" style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {combo.denoms.map(d => `৳${d}`).join('+')}
                </td>
                <td className="px-3 py-2 font-mono font-bold" style={{ color: 'var(--accent-warm)' }}>৳{combo.sum}</td>
                <td className="px-3 py-2 font-mono group" style={{ color: 'var(--text-muted)' }}>
                  {isAdmin ? (
                    <button
                      onClick={() => handleTargetEdit(combo)}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      title="Edit Target"
                    >
                      {tgt} <span className="opacity-0 group-hover:opacity-100 text-[10px]">✎</span>
                    </button>
                  ) : (
                    tgt
                  )}
                </td>
                <td className="px-3 py-2 font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{cnt}</td>
                <td className="px-3 py-2">
                  {done ? (
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--success)' }}><CheckCircle size={14} />Done</span>
                  ) : (
                    <div style={{ minWidth: 80 }}>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isCompleted ? '#bbf7d0' : '#e5e7eb' }}>
                        <div className="h-full rounded-full progress-bar" style={{ width: `${pct}%`, background: pct >= 80 ? 'var(--success)' : pct >= 40 ? 'var(--accent-warm)' : 'var(--danger)' }} />
                      </div>
                      <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>{pct}%</p>
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <Btn variant={isCompleted ? "secondary" : "primary"} size="sm" onClick={() => setOpenCombo(combo)}>Log</Btn>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="rounded-xl overflow-hidden relative" style={{ border: '1px solid var(--border)', background: '#fff' }}>
      {toast && (
        <div className="absolute top-4 right-4 z-10 px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-fade-in" style={{ background: '#22c55e', color: '#fff' }}>
          {toast}
        </div>
      )}

      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ background: '#d97706' }}>B</div>
        <div className="flex-1">
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Multi-Note Scenes <span className="ml-1 text-xs px-1.5 py-0.5 rounded" style={{ background: '#fef3c7', color: '#92400e' }}>THE NOVELTY</span></p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Target: 8,000 · Collected: <span className="font-mono font-semibold">{total.toLocaleString()}</span></p>
        </div>
        {expanded ? <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
      </button>

      {expanded && (
        <div className="border-t" style={{ borderColor: 'var(--border)' }}>
          {/* Note Count Selector Tabs */}
          <div className="px-5 py-3 border-b overflow-x-auto whitespace-nowrap" style={{ borderColor: 'var(--border)', background: '#fafafa' }}>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => setActiveNoteCount(num)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
                  style={{
                    background: activeNoteCount === num ? '#2563eb' : 'transparent',
                    color: activeNoteCount === num ? '#fff' : '#4b5563',
                    border: `1px solid ${activeNoteCount === num ? '#2563eb' : '#d1d5db'}`
                  }}
                >
                  {num} Notes
                </button>
              ))}
            </div>
          </div>

          {/* B1: Defined Combinations */}
          <div className="px-5 py-4">
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>B1 — Defined Combinations ({activeNoteCount} Notes)</p>
            <p className="text-xs mb-3 font-medium" style={{ color: 'var(--text-muted)' }}>
              {completedCombos.length} of {currentCombos.length} combinations complete — {remainingImages} images remaining to target
            </p>
            
            {/* To Do Section */}
            {todoCombos.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>To Do — {todoCombos.length} combinations remaining</p>
                {renderTable(todoCombos, false)}
              </div>
            )}

            {/* Completed Section */}
            {completedCombos.length > 0 && (
              <div className="rounded-lg overflow-hidden transition-all text-sm mb-2" style={{ border: '1px solid #dcfce7', background: '#f0fdf4' }}>
                <button onClick={() => setCompletedExpanded(e => !e)} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-green-50 transition-colors text-left">
                  <CheckCircle size={16} style={{ color: '#22c55e' }} />
                  <span className="font-semibold text-green-800 flex-1">Completed — {completedCombos.length} combinations ✓</span>
                  {completedExpanded ? <ChevronDown size={14} style={{ color: '#166534' }} /> : <ChevronRight size={14} style={{ color: '#166534' }} />}
                </button>
                {completedExpanded && (
                  <div className="border-t px-4 pb-4 pt-2" style={{ borderColor: '#dcfce7' }}>
                    {renderTable(completedCombos, true)}
                  </div>
                )}
              </div>
            )}
            
            {todoCombos.length === 0 && completedCombos.length === 0 && (
               <div className="py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                 No {activeNoteCount}-note combinations defined.
               </div>
            )}
          </div>

          {/* B2: Random combinations */}
          <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--border)', background: '#fafafa' }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>B2 — Random / Diverse Combinations</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ad-hoc multi-note combinations for diversity</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{bRandomCollected} images</span>
                <Btn variant="secondary" size="sm" onClick={() => setShowRandom(true)}><Plus size={13} /> Log Random</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {openCombo && (
        <MultiNoteModal combo={openCombo} team={team} onClose={() => setOpenCombo(null)}
          onSubmit={(data) => { onLog(data); setOpenCombo(null); }} />
      )}
      {showRandom && (
        <RandomBModal team={team} onClose={() => setShowRandom(false)}
          onSubmit={(data) => { onLog(data); setShowRandom(false); }} />
      )}
    </div>
  );
}

// ── Category C Section ────────────────────────────────────────────────────
function CategoryCSection({ computed, targets, team, onLog, currentUser, dispatch }) {
  const [openTask, setOpenTask] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const { collectedByCSubtask } = computed;
  const total = computed.collectedByCategory.C;

  const isAdmin = currentUser?.accessId === 'admin' || currentUser?.role === 'lead';

  const handleTargetEdit = (task) => {
    if (!isAdmin) return;
    const currentTgt = targets.C_subtasks?.[task.key] || task.target;
    const val = window.prompt(`Edit target amount for [${task.label}]:`, currentTgt);
    
    if (val !== null) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed > 0) {
        dispatch({
          type: 'SET_TARGET',
          payload: {
            key: 'C_subtasks',
            value: {
              ...(targets.C_subtasks || {}),
              [task.key]: parsed
            }
          }
        });
      } else {
        alert("Please enter a valid positive number.");
      }
    }
  };

  const getTaskIcon = (key) => {
    switch (key) {
      case 'note-overlap': return <Layers size={20} strokeWidth={1.5} style={{ color: '#4b5563' }} />;
      case 'fingers': return <Fingerprint size={20} strokeWidth={1.5} style={{ color: '#eab308' }} />;
      case 'folded': return <FileSymlink size={20} strokeWidth={1.5} style={{ color: '#3b82f6' }} />;
      case 'frame-edge': return <Maximize size={20} strokeWidth={1.5} style={{ color: '#14b8a6' }} />;
      default: return <span>{task.icon}</span>;
    }
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: '#fff' }}>
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ background: '#7c3aed' }}>C</div>
        <div className="flex-1">
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Occlusion Images</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Target: 4,000 · Collected: <span className="font-mono font-semibold">{total.toLocaleString()}</span></p>
        </div>
        {expanded ? <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
      </button>
      {expanded && (
        <div className="border-t px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ borderColor: 'var(--border)' }}>
          {C_SUBTASKS.map(task => {
            const cnt = collectedByCSubtask[task.key] || 0;
            const tgt = targets.C_subtasks?.[task.key] || task.target;
            const pct = Math.round(cnt / tgt * 100);
            return (
              <div key={task.key} className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border">
                      {getTaskIcon(task.key)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{task.label}</p>
                      <div className="flex items-center text-xs font-mono group" style={{ color: 'var(--text-muted)' }}>
                        {cnt} / 
                        {isAdmin ? (
                          <button
                            onClick={() => handleTargetEdit(task)}
                            className="ml-1 inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
                            title="Edit Target"
                          >
                            {tgt} <span className="opacity-0 group-hover:opacity-100 text-[10px]">✎</span>
                          </button>
                        ) : (
                          <span className="ml-1">{tgt}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Btn variant="primary" size="sm" onClick={() => setOpenTask(task)}>Log</Btn>
                </div>
                <ProgressBar value={cnt} max={tgt} color="#7c3aed" height={6} />
                <p className="text-xs font-mono mt-1" style={{ color: '#7c3aed' }}>{pct}%</p>
              </div>
            );
          })}
        </div>
      )}
      {openTask && (
        <CategoryCModal subtask={openTask} team={team} onClose={() => setOpenTask(null)}
          onSubmit={(data) => { onLog(data); setOpenTask(null); }} />
      )}
    </div>
  );
}

// ── Category D Section (Matrix) ───────────────────────────────────────────
function CategoryDSection({ computed, targets, team, onLog }) {
  const [openCell, setOpenCell] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const { collectedByDCell } = computed;
  const total = computed.collectedByCategory.D;

  function cellColor(cnt, tgt) {
    const pct = tgt > 0 ? cnt / tgt : 0;
    if (cnt === 0) return { background: '#f3f4f6', color: '#9ca3af' };
    if (pct >= 0.8) return { background: '#dcfce7', color: '#15803d' };
    if (pct >= 0.4) return { background: '#fef3c7', color: '#b45309' };
    return { background: '#fee2e2', color: '#b91c1c' };
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: '#fff' }}>
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ background: '#0891b2' }}>D</div>
        <div className="flex-1">
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Lighting & Environment Matrix</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Target: 4,000 (35 cells × 40) · Collected: <span className="font-mono font-semibold">{total.toLocaleString()}</span></p>
        </div>
        {expanded ? <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
      </button>
      {expanded && (
        <div className="border-t px-5 py-4 overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
          <table className="text-xs w-full" style={{ borderCollapse: 'separate', borderSpacing: 4, minWidth: 480 }}>
            <thead>
              <tr>
                <th className="text-left pb-2 pr-3 text-xs font-semibold" style={{ color: 'var(--text-muted)', minWidth: 80 }}>Environment ↓ / Lighting →</th>
                {LIGHTING.map(l => (
                  <th key={l} className="pb-2 text-center font-medium" style={{ color: 'var(--text-muted)', minWidth: 72, fontSize: 10 }}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ENVIRONMENTS.map(env => (
                <tr key={env}>
                  <td className="pr-3 font-medium text-xs" style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{env}</td>
                  {LIGHTING.map(light => {
                    const k = `${env}||${light}`;
                    const cnt = collectedByDCell[k] || 0;
                    const tgt = targets.D_matrix?.[k] || 40;
                    const style = cellColor(cnt, tgt);
                    return (
                      <td key={light} className="text-center">
                        <button onClick={() => setOpenCell({ env, light })}
                          className="w-full py-2 rounded-lg font-mono font-bold text-xs transition-all hover:opacity-80 hover:shadow-sm"
                          style={{ ...style, minWidth: 64 }}>
                          {cnt}/{tgt}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#dcfce7', display: 'inline-block' }} /> ≥80%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#fef3c7', display: 'inline-block' }} /> 40-80%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#fee2e2', display: 'inline-block' }} /> &lt;40%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: '#f3f4f6', display: 'inline-block' }} /> 0</span>
          </div>
        </div>
      )}
      {openCell && (
        <CategoryDModal env={openCell.env} light={openCell.light} team={team} onClose={() => setOpenCell(null)}
          onSubmit={(data) => { onLog(data); setOpenCell(null); }} />
      )}
    </div>
  );
}

// ── Main CollectionTasks View ─────────────────────────────────────────────
export default function CollectionTasks({ state, computed, currentUser, onLog, dispatch }) {
  const [selectedMember, setSelectedMember] = useState('all');
  const isLead = currentUser?.role === 'lead';
  const team = isLead ? state.team : [currentUser];

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4">
      {/* Team member selector */}
      {isLead && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button onClick={() => setSelectedMember('all')}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
            style={{ background: selectedMember === 'all' ? 'var(--accent)' : '#fff', color: selectedMember === 'all' ? '#fff' : 'var(--text-muted)', borderColor: selectedMember === 'all' ? 'var(--accent)' : 'var(--border)' }}>
            All
          </button>
          {team.map(m => (
            <button key={m.id} onClick={() => setSelectedMember(m.id)}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
              style={{ background: selectedMember === m.id ? m.color : '#fff', color: selectedMember === m.id ? '#fff' : 'var(--text-primary)', borderColor: selectedMember === m.id ? m.color : 'var(--border)' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: selectedMember === m.id ? 'rgba(255,255,255,0.3)' : m.color, color: '#fff', fontSize: 9 }}>{m.initials}</span>
              {m.name}
            </button>
          ))}
        </div>
      )}

      {/* Category sections */}
      <CategoryASection computed={computed} targets={state.targets} team={team} onLog={onLog} />
      <CategoryBSection computed={computed} targets={state.targets} team={team} onLog={onLog} currentUser={currentUser} dispatch={dispatch} />
      <CategoryCSection computed={computed} targets={state.targets} team={team} onLog={onLog} currentUser={currentUser} dispatch={dispatch} />
      <CategoryDSection computed={computed} targets={state.targets} team={team} onLog={onLog} />
    </div>
  );
}
