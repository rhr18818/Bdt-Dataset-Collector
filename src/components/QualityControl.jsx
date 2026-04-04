import { useState } from 'react';
import { ShieldCheck, AlertTriangle, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Modal, Badge, EmptyState, Btn } from './ui/index.jsx';

const ERROR_TYPES = [
  'wrong class', 'box too loose', 'missing annotation',
  'wrong denomination', 'overlapping boxes not separated'
];
const QC_ACTIONS = ['none', 're-annotate batch', 'discuss with annotator'];

function AddQCModal({ team, onSubmit, onClose }) {
  const [reviewerId, setReviewerId] = useState(team[0]?.id || '');
  const [annotatorId, setAnnotatorId] = useState(team[0]?.id || '');
  const [batchSize, setBatchSize] = useState('');
  const [errors, setErrors] = useState('');
  const [errorTypes, setErrorTypes] = useState([]);
  const [action, setAction] = useState('none');
  const [notes, setNotes] = useState('');

  const bs = parseInt(batchSize) || 0;
  const er = parseInt(errors) || 0;
  const agreement = bs > 0 ? ((bs - er) / bs * 100).toFixed(1) : '—';
  const agrNum = parseFloat(agreement);
  const agrColor = agrNum >= 95 ? 'var(--success)' : agrNum >= 90 ? 'var(--accent-warm)' : 'var(--danger)';

  function toggle(arr, val) {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
  }

  function handleSubmit() {
    if (!bs || er < 0) return;
    onSubmit({ reviewerId, annotatorId, batchSize: bs, errorsFound: er, errorTypes, action, notes });
  }

  return (
    <Modal title="Add QC Check" onClose={onClose} size="md" footer={<span>Escape to cancel · Enter to submit</span>}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs font-semibold mb-1 uppercase" style={{ color: 'var(--text-muted)' }}>Reviewer</p>
          <select value={reviewerId} onChange={e => setReviewerId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ borderColor: 'var(--border)' }}>
            {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs font-semibold mb-1 uppercase" style={{ color: 'var(--text-muted)' }}>Annotator Being Reviewed</p>
          <select value={annotatorId} onChange={e => setAnnotatorId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ borderColor: 'var(--border)' }}>
            {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs font-semibold mb-1 uppercase" style={{ color: 'var(--text-muted)' }}>Batch Size (images)</p>
          <input type="number" min="1" value={batchSize} onChange={e => setBatchSize(e.target.value)} autoFocus
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none" style={{ borderColor: 'var(--border)' }} placeholder="10" />
        </div>
        <div>
          <p className="text-xs font-semibold mb-1 uppercase" style={{ color: 'var(--text-muted)' }}>Errors Found</p>
          <input type="number" min="0" value={errors} onChange={e => setErrors(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none" style={{ borderColor: 'var(--border)' }} placeholder="0" />
        </div>
      </div>

      {bs > 0 && (
        <div className="rounded-xl p-3 mb-4 flex items-center gap-3" style={{ border: `2px solid ${agrColor}`, background: `${agrColor}11` }}>
          <p className="text-3xl font-bold font-mono" style={{ color: agrColor }}>{agreement}%</p>
          <p className="text-sm" style={{ color: agrColor }}>Agreement Rate</p>
        </div>
      )}

      <div className="mb-4">
        <p className="text-xs font-semibold mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>Error Types</p>
        <div className="flex flex-wrap gap-2">
          {ERROR_TYPES.map(et => {
            const active = errorTypes.includes(et);
            return (
              <button key={et} type="button" onClick={() => setErrorTypes(toggle(errorTypes, et))}
                className="px-3 py-1.5 rounded-lg text-xs border transition-all"
                style={{ background: active ? 'var(--danger)' : '#fff', color: active ? '#fff' : 'var(--text-muted)', borderColor: active ? 'var(--danger)' : 'var(--border)' }}>
                {et}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>Action Taken</p>
        <div className="flex gap-2">
          {QC_ACTIONS.map(a => (
            <button key={a} type="button" onClick={() => setAction(a)}
              className="px-3 py-1.5 rounded-lg text-xs border transition-all capitalize"
              style={{ background: action === a ? 'var(--accent)' : '#fff', color: action === a ? '#fff' : 'var(--text-muted)', borderColor: action === a ? 'var(--accent)' : 'var(--border)' }}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none mb-4"
        style={{ borderColor: 'var(--border)' }} placeholder="Notes..." />

      <div className="flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={handleSubmit} disabled={!bs}>Submit QC Check</Btn>
      </div>
    </Modal>
  );
}

export default function QualityControl({ state, computed, dispatch }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const { qcChecks, team } = state;
  const { iaaScore, qcAlerts, qcByAnnotator } = computed;

  const memberById = {};
  for (const m of team) memberById[m.id] = m;

  const iaaColor = iaaScore === null ? 'var(--text-muted)' : iaaScore >= 95 ? 'var(--success)' : iaaScore >= 90 ? 'var(--accent-warm)' : 'var(--danger)';

  // Chart: avg accuracy per annotator
  const chartData = team.map(m => {
    const checks = qcByAnnotator[m.id] || [];
    const avg = checks.length ? checks.reduce((s, q) => s + q.agreementPct, 0) / checks.length : null;
    return { name: m.name, avg, color: m.color, count: checks.length };
  }).filter(d => d.avg !== null);

  function handleAdd(payload) {
    dispatch({ type: 'ADD_QC_CHECK', payload });
    setShowAddModal(false);
  }

  const sortedChecks = [...qcChecks].reverse();

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5">
      {/* QC Alert Banner */}
      {qcAlerts.length > 0 && (
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: '#fef2f2', border: '2px solid var(--danger)' }}>
          <AlertTriangle size={20} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--danger)' }}>Quality Alert</p>
            {qcAlerts.map(a => (
              <p key={a.member.id} className="text-sm" style={{ color: '#7f1d1d' }}>
                ⚠ <strong>{a.member.name}</strong>'s recent annotation quality is below threshold ({a.avg}% avg). Review required.
              </p>
            ))}
          </div>
        </div>
      )}

      {/* IAA Score */}
      <div className="rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm" style={{ background: '#fff', border: '1px solid var(--border)' }}>
        <div className="text-center">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Overall IAA Score</p>
          <p className="text-6xl font-bold font-mono" style={{ color: iaaColor }}>
            {iaaScore !== null ? `${iaaScore.toFixed(1)}%` : '—'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Target: ≥95%</p>
        </div>
        <div className="flex-1 flex flex-col gap-2 w-full">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#e5e7eb' }}>
            <div className="h-full rounded-full progress-bar" style={{ width: `${Math.min(100, iaaScore || 0)}%`, background: iaaColor }} />
          </div>
          <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>0%</span><span className="font-semibold" style={{ color: 'var(--danger)' }}>90%</span><span className="font-semibold" style={{ color: 'var(--success)' }}>95%</span><span>100%</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="rounded-lg p-2 text-center" style={{ background: '#f8f9ff' }}>
              <p className="font-bold font-mono text-base" style={{ color: 'var(--accent)' }}>{qcChecks.length}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>QC Checks</p>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: '#f0fdf4' }}>
              <p className="font-bold font-mono text-base" style={{ color: 'var(--success)' }}>{qcChecks.filter(q => q.agreementPct >= 95).length}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>≥95%</p>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: '#fef2f2' }}>
              <p className="font-bold font-mono text-base" style={{ color: 'var(--danger)' }}>{qcChecks.filter(q => q.agreementPct < 90).length}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>&lt;90%</p>
            </div>
          </div>
        </div>
        <Btn variant="primary" onClick={() => setShowAddModal(true)}><Plus size={15} /> Add QC Check</Btn>
      </div>

      {/* Per-Annotator Chart */}
      {chartData.length > 0 && (
        <div className="rounded-xl p-5 shadow-sm" style={{ background: '#fff', border: '1px solid var(--border)' }}>
          <p className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Per-Annotator Accuracy</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v.toFixed(1)}%`, 'Avg Agreement']} contentStyle={{ borderRadius: 8, fontSize: 12, fontFamily: 'Inter' }} />
              <ReferenceLine y={95} stroke="var(--success)" strokeDasharray="4 2" label={{ value: '95% target', fill: 'var(--success)', fontSize: 10, position: 'right' }} />
              <ReferenceLine y={90} stroke="var(--danger)" strokeDasharray="4 2" label={{ value: '90% min', fill: 'var(--danger)', fontSize: 10, position: 'right' }} />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]} name="Avg Agreement">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.avg >= 95 ? 'var(--success)' : entry.avg >= 90 ? 'var(--accent-warm)' : 'var(--danger)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* QC Log Table */}
      <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--border)', background: '#fff' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>QC Check Log</p>
          <Btn variant="secondary" size="sm" onClick={() => setShowAddModal(true)}><Plus size={13} /> Add Check</Btn>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9ff' }}>
              <tr>
                {['Date','Reviewer','Annotator','Batch','Errors','Agreement %','Action','Notes'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedChecks.length === 0 ? (
                <tr><td colSpan={8}>
                  <EmptyState icon={ShieldCheck} title="No QC checks logged yet"
                    description="Add your first QC check to start tracking inter-annotator agreement."
                    action={<Btn variant="primary" onClick={() => setShowAddModal(true)}><Plus size={13} /> Add First QC Check</Btn>} />
                </td></tr>
              ) : sortedChecks.map(q => {
                const reviewer = memberById[q.reviewerId];
                const annotator = memberById[q.annotatorId];
                const agrColor2 = q.agreementPct >= 95 ? 'var(--success)' : q.agreementPct >= 90 ? 'var(--accent-warm)' : 'var(--danger)';
                return (
                  <tr key={q.id} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3 font-mono whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{q.timestamp.slice(0, 10)}</td>
                    <td className="px-4 py-3">{reviewer?.name || '—'}</td>
                    <td className="px-4 py-3">{annotator?.name || '—'}</td>
                    <td className="px-4 py-3 font-mono">{q.batchSize}</td>
                    <td className="px-4 py-3 font-mono">{q.errorsFound}</td>
                    <td className="px-4 py-3 font-mono font-bold" style={{ color: agrColor2 }}>{q.agreementPct.toFixed(1)}%</td>
                    <td className="px-4 py-3 capitalize">{q.action}</td>
                    <td className="px-4 py-3 max-w-xs truncate" style={{ color: 'var(--text-muted)' }}>{q.notes || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && <AddQCModal team={team} onSubmit={handleAdd} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
