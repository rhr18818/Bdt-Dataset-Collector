import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { Btn } from './ui/index.jsx';

export default function SettingsPanel({ state, dispatch, onClose }) {
  const { meta, targets } = state;
  const [deadline, setDeadline] = useState(meta.deadline ? meta.deadline.slice(0, 10) : '');
  const [targetA, setTargetA] = useState(targets.A);
  const [targetB, setTargetB] = useState(targets.B);
  const [targetC, setTargetC] = useState(targets.C);
  const [targetD, setTargetD] = useState(targets.D);

  function save() {
    if (deadline) dispatch({ type: 'SET_DEADLINE', payload: { deadline: new Date(deadline).toISOString() } });
    if (targetA !== targets.A) dispatch({ type: 'SET_TARGET', payload: { key: 'A', value: parseInt(targetA) } });
    if (targetB !== targets.B) dispatch({ type: 'SET_TARGET', payload: { key: 'B', value: parseInt(targetB) } });
    if (targetC !== targets.C) dispatch({ type: 'SET_TARGET', payload: { key: 'C', value: parseInt(targetC) } });
    if (targetD !== targets.D) dispatch({ type: 'SET_TARGET', payload: { key: 'D', value: parseInt(targetD) } });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="h-full w-full max-w-sm flex flex-col shadow-2xl" style={{ background: '#fff' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Settings size={18} style={{ color: 'var(--accent)' }} />
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Settings</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
          {/* Deadline */}
          <div>
            <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Project Deadline</p>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none"
              style={{ borderColor: 'var(--border)', fontFamily: 'JetBrains Mono, monospace' }} />
          </div>

          {/* Category Targets */}
          <div>
            <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Image Targets</p>
            <div className="flex flex-col gap-2">
              {[
                { label: 'A — Single Note', value: targetA, set: setTargetA },
                { label: 'B — Multi-Note', value: targetB, set: setTargetB },
                { label: 'C — Occlusion', value: targetC, set: setTargetC },
                { label: 'D — Env/Lighting', value: targetD, set: setTargetD },
              ].map(({ label, value, set }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{label}</span>
                  <input type="number" min="100" value={value} onChange={e => set(parseInt(e.target.value))}
                    className="w-24 border rounded-lg px-3 py-1.5 text-sm font-mono text-right focus:outline-none"
                    style={{ borderColor: 'var(--border)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Project Info */}
          <div>
            <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Project Info</p>
            <div className="rounded-xl p-3 text-xs" style={{ background: '#f8f9ff', border: '1px solid #e0e7ff' }}>
              <p style={{ color: 'var(--text-muted)' }}>Project: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{state.meta.projectName}</span></p>
              <p style={{ color: 'var(--text-muted)' }}>Version: <span className="font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{state.meta.version}</span></p>
              <p style={{ color: 'var(--text-muted)' }}>Created: <span className="font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{state.meta.created?.slice(0, 10)}</span></p>
              <p style={{ color: 'var(--text-muted)' }}>Data key: <span className="font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>bdtcollect_v1</span></p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
          <Btn variant="ghost" onClick={onClose} className="flex-1 justify-center">Cancel</Btn>
          <Btn variant="primary" onClick={save} className="flex-1 justify-center">Save Settings</Btn>
        </div>
      </div>
    </div>
  );
}
