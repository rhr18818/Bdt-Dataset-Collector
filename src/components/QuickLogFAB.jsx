import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const CATEGORIES = ['A', 'B', 'C', 'D'];

export default function QuickLogFAB({ team, currentUser, onLog }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [subtask, setSubtask] = useState('');
  const [count, setCount] = useState('');
  const [memberId, setMemberId] = useState(currentUser?.id || team[0]?.id || '');

  function reset() { setStep(1); setCategory(''); setSubtask(''); setCount(''); setMemberId(currentUser?.id || team[0]?.id || ''); }
  function close() { setOpen(false); reset(); }

  function submit() {
    if (!category || !count || !memberId) return;
    
    let denoms = [];
    let sum = 0;
    let envs = [];
    let lights = [];

    if (category === 'A' && subtask) {
      const match = subtask.match(/single:(\d+)tk/);
      if (match) denoms = [parseInt(match[1], 10)];
    } else if (category === 'B' && subtask && subtask !== 'random') {
      denoms = subtask.split('+').map(d => parseInt(d, 10));
      sum = denoms.reduce((a, b) => a + b, 0);
    } else if (category === 'D' && subtask && subtask.includes('||')) {
      const parts = subtask.split('||');
      if (parts.length === 2) {
        envs = [parts[0]];
        lights = [parts[1]];
      }
    }

    onLog({
      category,
      subcategory: subtask || `quick:${category}`,
      denominations: denoms,
      groundTruthSum: sum,
      conditions: [],
      environments: envs,
      lighting: lights,
      arrangements: [],
      imageCount: parseInt(count),
      memberId,
      notes: '(quick log)',
    });
    close();
  }

  const CAT_COLORS = { A: '#2563eb', B: '#d97706', C: '#7c3aed', D: '#0891b2' };
  const CAT_SUBTASKS = {
    A: ['single:2tk','single:5tk','single:10tk','single:20tk','single:50tk','single:100tk','single:200tk','single:500tk','single:1000tk'],
    B: ['100+50','500+100','1000+500','100+50+20','5+2','10+5+2','random'],
    C: ['note-overlap','fingers','folded','frame-edge'],
    D: ['desk||daylight','desk||dim','hand||daylight','market||fluorescent'],
  };

  return (
    <>
      {/* FAB Button */}
      <button onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
        style={{ background: 'var(--accent)' }}
        title="Quick Log">
        <Plus size={26} color="#fff" />
      </button>

      {/* Quick Log Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden" style={{ background: '#fff' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ background: 'var(--bg-primary)' }}>
              <div>
                <p className="font-bold text-white text-sm">Quick Log</p>
                <p className="text-xs" style={{ color: 'var(--sidebar-text)' }}>Fast field entry — Step {step} of 3</p>
              </div>
              <button onClick={close} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"><X size={18} color="#94a3b8" /></button>
            </div>

            {/* Step indicator */}
            <div className="flex gap-0.5 px-5 pt-4">
              {[1,2,3].map(i => <div key={i} className="flex-1 h-1 rounded-full" style={{ background: i <= step ? 'var(--accent)' : '#e5e7eb' }} />)}
            </div>

            <div className="px-5 py-4">
              {step === 1 && (
                <div>
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>1. Which category?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(c => (
                      <button key={c} type="button" onClick={() => { setCategory(c); setSubtask(''); setStep(2); }}
                        className="py-4 rounded-xl font-bold text-lg border-2 transition-all"
                        style={{ background: category === c ? CAT_COLORS[c] : '#fff', color: category === c ? '#fff' : CAT_COLORS[c], borderColor: CAT_COLORS[c] }}>
                        {c}
                        <p className="text-xs font-normal mt-0.5 opacity-80">{{ A:'Single', B:'Multi-Note', C:'Occlusion', D:'Env/Light' }[c]}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>2. Sub-task (optional)</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(CAT_SUBTASKS[category] || []).map(s => (
                      <button key={s} type="button" onClick={() => setSubtask(s)}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono border transition-all"
                        style={{ background: subtask === s ? 'var(--accent)' : '#fff', color: subtask === s ? '#fff' : 'var(--text-muted)', borderColor: subtask === s ? 'var(--accent)' : 'var(--border)' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setStep(3)} className="w-full py-2 rounded-xl font-medium text-sm"
                    style={{ background: 'var(--accent)', color: '#fff' }}>Next →</button>
                </div>
              )}

              {step === 3 && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>3. Count & Name</p>
                  <input type="number" min="1" value={count} onChange={e => setCount(e.target.value)} autoFocus
                    className="w-full border rounded-xl px-4 py-3 text-2xl font-mono text-center focus:outline-none mb-3"
                    style={{ borderColor: 'var(--border)' }} placeholder="# images" />
                  {team.length > 1 ? (
                    <select value={memberId} onChange={e => setMemberId(e.target.value)}
                      className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none mb-4"
                      style={{ borderColor: 'var(--border)' }}>
                      {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  ) : (
                    <div className="w-full border rounded-xl px-4 py-2 text-sm mb-4 bg-gray-50 flex items-center gap-2" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: team[0]?.color || '#ccc' }}></div>
                      <span>Logging as <strong>{team[0]?.name}</strong></span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setStep(2)} className="flex-1 py-2 rounded-xl text-sm border" style={{ borderColor: 'var(--border)' }}>← Back</button>
                    <button type="button" onClick={submit} disabled={!count}
                      className="flex-1 py-2 rounded-xl text-sm font-bold text-white"
                      style={{ background: count ? 'var(--success)' : '#d1d5db' }}>✓ Log</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
