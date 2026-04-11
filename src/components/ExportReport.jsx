import { useState } from 'react';
import { Download, Copy, AlertTriangle, RotateCcw } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Btn, ConfirmModal } from './ui/index.jsx';
import { ENVIRONMENTS, LIGHTING } from '../data/seedData.js';

const DENOM_COLORS = { 2: '#64748b', 5: '#f43f5e', 10:'#2563eb', 20:'#16a34a', 50:'#d97706', 100:'#7c3aed', 200:'#0891b2', 500:'#db2777', 1000:'#65a30d' };

export default function ExportReport({ state, computed, dispatch, currentUser }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const [copied, setCopied] = useState(false);

  const { sessions, qcChecks, team, targets } = state;
  const { totalCollected, collectedByCategory, collectedByDenomination, iaaScore, totalApproved } = computed;

  const firstLog = sessions.length ? sessions.reduce((a, s) => s.timestamp < a ? s.timestamp : a, sessions[0].timestamp) : null;
  const lastLog = sessions.length ? sessions.reduce((a, s) => s.timestamp > a ? s.timestamp : a, sessions[0].timestamp) : null;
  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  // Pie chart data
  const denomPieData = Object.entries(collectedByDenomination)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: `৳${k}`, value: v, color: DENOM_COLORS[k] }));

  // Paper statistics text
  const paperText = `A total of ${totalCollected.toLocaleString()} images were collected between ${fmt(firstLog)} and ${fmt(lastLog)} by a team of ${team.length} annotators. The dataset comprises ${collectedByCategory.A.toLocaleString()} single-note images, ${collectedByCategory.B.toLocaleString()} multi-note scene images across multiple denomination combinations, ${collectedByCategory.C.toLocaleString()} occlusion scenario images, and ${collectedByCategory.D.toLocaleString()} environment-condition images. Inter-annotator agreement was assessed on ${qcChecks.length} batches with an average agreement rate of ${iaaScore ? iaaScore.toFixed(1) : 'N/A'}%. Class distribution: 2tk: ${collectedByDenomination[2] || 0}, 5tk: ${collectedByDenomination[5] || 0}, 10tk: ${collectedByDenomination[10] || 0}, 20tk: ${collectedByDenomination[20] || 0}, 50tk: ${collectedByDenomination[50] || 0}, 100tk: ${collectedByDenomination[100] || 0}, 200tk: ${collectedByDenomination[200] || 0}, 500tk: ${collectedByDenomination[500] || 0}, 1000tk: ${collectedByDenomination[1000] || 0}.`;

  function copyPaperStats() {
    navigator.clipboard.writeText(paperText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  function exportCSV(rows, filename) {
    const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  }

  const memberById = {};
  for (const m of team) memberById[m.id] = m;

  function exportProgressCSV() {
    const headers = ['ID','Timestamp','Member','Category','Subcategory','Denominations','Sum','Conditions','Environments','Lighting','Arrangements','Images','Status'];
    const rows = sessions.map(s => [
      s.id, s.timestamp, memberById[s.memberId]?.name, s.category, s.subcategory,
      s.denominations.join('+'), s.groundTruthSum, s.conditions.join(';'),
      s.environments.join(';'), s.lighting.join(';'), s.arrangements.join(';'),
      s.imageCount, s.status
    ]);
    exportCSV([headers, ...rows], 'bdt_progress');
  }

  function exportMetadataCSV() {
    const headers = ['SessionID','Date','Collector','Category','Subcategory','Denominations','GroundTruthSum','Conditions','Environment','Lighting','Arrangements','Background','ImageCount','Status','Notes'];
    const rows = sessions.map(s => [
      s.id, s.timestamp.slice(0,10), memberById[s.memberId]?.name,
      s.category, s.subcategory, s.denominations.join('+'), s.groundTruthSum,
      s.conditions.join(';'), s.environments.join(';'), s.lighting.join(';'),
      s.arrangements.join(';'), s.background || '', s.imageCount, s.status, s.notes
    ]);
    exportCSV([headers, ...rows], 'bdt_metadata');
  }

  function exportQCCSV() {
    const headers = ['ID','Date','Reviewer','Annotator','BatchSize','Errors','Agreement%','ErrorTypes','Action','Notes'];
    const rows = qcChecks.map(q => [
      q.id, q.timestamp.slice(0,10), memberById[q.reviewerId]?.name, memberById[q.annotatorId]?.name,
      q.batchSize, q.errorsFound, q.agreementPct.toFixed(1), q.errorTypes.join(';'), q.action, q.notes
    ]);
    exportCSV([headers, ...rows], 'bdt_qc_report');
  }

  function doReset() {
    if (resetInput !== 'RESET') return;
    dispatch({ type: 'RESET_ALL' });
    setConfirmReset(false);
    setResetInput('');
  }

  function cellColor(cnt, tgt) {
    const pct = tgt > 0 ? cnt / tgt : 0;
    if (cnt === 0) return '#f3f4f6';
    if (pct >= 0.8) return '#dcfce7';
    if (pct >= 0.4) return '#fef3c7';
    return '#fee2e2';
  }

  const { collectedByDCell } = computed;

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      {/* Dataset Summary Card */}
      <div className="rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid var(--border)', background: '#fff' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)', background: '#f8f9ff' }}>
          <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Dataset Summary — BDT-MultiScene</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>For Data in Brief paper specifications table</p>
        </div>
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stats table */}
          <div>
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['Total Images', totalCollected.toLocaleString()],
                  ['Category A — Single Note', collectedByCategory.A.toLocaleString()],
                  ['Category B — Multi-Note', collectedByCategory.B.toLocaleString()],
                  ['Category C — Occlusion', collectedByCategory.C.toLocaleString()],
                  ['Category D — Env/Lighting', collectedByCategory.D.toLocaleString()],
                  ['Total Approved', totalApproved.toLocaleString()],
                  ['Team Size', team.length],
                  ['QC Checks Performed', qcChecks.length],
                  ['Avg IAA Score', iaaScore ? `${iaaScore.toFixed(1)}%` : 'N/A'],
                  ['Collection Start', fmt(firstLog)],
                  ['Last Updated', fmt(lastLog)],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-2 text-sm" style={{ color: 'var(--text-muted)' }}>{k}</td>
                    <td className="py-2 font-bold font-mono text-right" style={{ color: 'var(--text-primary)' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Denomination pie chart */}
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Class Distribution</p>
            {denomPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={denomPieData} cx="50%" cy="50%" outerRadius={75} dataKey="value">
                    {denomPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => v.toLocaleString()} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend formatter={(v) => <span style={{ fontSize: 11, fontFamily: 'Inter' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No images logged yet</p>
            )}
          </div>
        </div>

        {/* Denomination table */}
        <div className="px-5 pb-5">
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Per-Denomination Count</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-9 gap-2">
            {[2,5,10,20,50,100,200,500,1000].map(d => (
              <div key={d} className="rounded-lg p-2 text-center" style={{ border: `2px solid ${DENOM_COLORS[d]}22`, background: `${DENOM_COLORS[d]}0a` }}>
                <p className="font-bold font-mono text-xs" style={{ color: DENOM_COLORS[d] }}>৳{d}</p>
                <p className="font-bold font-mono text-sm" style={{ color: 'var(--text-primary)' }}>{(collectedByDenomination[d] || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* D-matrix read-only */}
        <div className="px-5 pb-5">
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Environment × Lighting Coverage</p>
          <div className="overflow-x-auto">
            <table className="text-xs w-full" style={{ borderCollapse: 'separate', borderSpacing: 3, minWidth: 440 }}>
              <thead>
                <tr>
                  <th className="text-left pb-1 pr-3" style={{ color: 'var(--text-muted)', fontSize: 10, minWidth: 80 }}>Env \ Light</th>
                  {LIGHTING.map(l => <th key={l} className="pb-1 text-center" style={{ color: 'var(--text-muted)', fontSize: 9, minWidth: 60 }}>{l}</th>)}
                </tr>
              </thead>
              <tbody>
                {ENVIRONMENTS.map(env => (
                  <tr key={env}>
                    <td className="pr-3 font-medium text-xs" style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{env}</td>
                    {LIGHTING.map(light => {
                      const k = `${env}||${light}`;
                      const cnt = collectedByDCell[k] || 0;
                      const tgt = state.targets.D_matrix?.[k] || 40;
                      return (
                        <td key={light} className="text-center py-1">
                          <span className="px-2 py-1 rounded font-mono font-bold text-xs" style={{ background: cellColor(cnt, tgt), color: '#374151' }}>{cnt}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Paper Statistics Block */}
      <div className="rounded-xl p-5 shadow-sm" style={{ border: '1px solid var(--border)', background: '#fff' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Paper Statistics Text</p>
          <Btn variant="secondary" size="sm" onClick={copyPaperStats}>
            <Copy size={13} /> {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Btn>
        </div>
        <div className="rounded-lg p-4 text-sm leading-relaxed" style={{ background: '#f8f9ff', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', border: '1px solid #e0e7ff' }}>
          {paperText}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Export Progress CSV', sub: 'All session logs', onClick: exportProgressCSV },
          { label: 'Export Metadata CSV', sub: 'Full image metadata', onClick: exportMetadataCSV },
          { label: 'Export QC Report', sub: 'QC check history', onClick: exportQCCSV },
          { label: 'Copy Paper Statistics', sub: 'Methods section text', onClick: copyPaperStats },
        ].map(btn => (
          <button key={btn.label} onClick={btn.onClick}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all hover:shadow-md hover:border-blue-300"
            style={{ border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }}>
            <Download size={20} style={{ color: 'var(--accent)' }} />
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{btn.label}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{btn.sub}</p>
          </button>
        ))}
      </div>

      {/* Danger Zone */}
      {currentUser?.accessId === 'admin' && (
        <div className="rounded-xl p-5 mt-4" style={{ border: '2px solid var(--danger)', background: '#fef2f2' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} />
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: 'var(--danger)' }}>Danger Zone</p>
              <p className="text-xs mt-0.5 mb-3" style={{ color: '#7f1d1d' }}>
                Resetting all data is irreversible. All sessions, QC checks, and team members will be erased and replaced with seed data.
              </p>
              <Btn variant="danger" onClick={() => setConfirmReset(true)}><RotateCcw size={14} /> Reset All Data</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
              <p className="font-bold text-base" style={{ color: 'var(--danger)' }}>Confirm Reset</p>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Type <strong>RESET</strong> to confirm permanent deletion of all data.</p>
            <input type="text" value={resetInput} onChange={e => setResetInput(e.target.value)} autoFocus
              className="w-full border rounded-lg px-4 py-2 text-sm font-mono mb-4 focus:outline-none"
              style={{ borderColor: 'var(--danger)' }} placeholder="RESET" />
            <div className="flex justify-end gap-3">
              <Btn variant="ghost" onClick={() => { setConfirmReset(false); setResetInput(''); }}>Cancel</Btn>
              <Btn variant="danger" onClick={doReset} disabled={resetInput !== 'RESET'}>Confirm Reset</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
