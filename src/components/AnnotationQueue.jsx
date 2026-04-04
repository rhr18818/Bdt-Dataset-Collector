import { useState } from 'react';
import { Tag, Filter, ChevronDown } from 'lucide-react';
import { Badge, EmptyState, Avatar, ProgressBar } from './ui/index.jsx';

const STATUS_ORDER = ['collected', 'annotated', 'reviewed', 'approved'];
const STATUS_COLORS = {
  collected: 'default',
  annotated: 'warning',
  reviewed: 'blue',
  approved: 'success',
};

function PipelineBar({ computed }) {
  const { pendingAnnotation, pendingReview, pendingApproval, approved, totalCollected } = computed;
  const stages = [
    { label: 'Collected', count: totalCollected, color: 'var(--accent)' },
    { label: 'Pending Annotation', count: pendingAnnotation.reduce((s, r) => s + r.imageCount, 0), color: 'var(--accent-warm)' },
    { label: 'Pending Review', count: pendingReview.reduce((s, r) => s + r.imageCount, 0), color: '#7c3aed' },
    { label: 'Approved', count: computed.totalApproved, color: 'var(--success)' },
  ];
  return (
    <div className="rounded-xl p-5 shadow-sm mb-5" style={{ background: '#fff', border: '1px solid var(--border)' }}>
      <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Annotation Pipeline</p>
      <div className="flex items-center gap-2 overflow-x-auto">
        {stages.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="flex flex-col items-center px-4 py-3 rounded-xl text-center flex-shrink-0" style={{ border: `2px solid ${s.color}`, minWidth: 110 }}>
              <p className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.count.toLocaleString()}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>{s.label}</p>
            </div>
            {i < stages.length - 1 && <span className="text-lg" style={{ color: '#d1d5db' }}>→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnnotationQueue({ state, computed, currentUser, dispatch }) {
  const { sessions, team } = state;
  const isLead = currentUser?.role === 'lead';
  
  const [filterMember, setFilterMember] = useState(isLead ? 'all' : currentUser.id);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat, setFilterCat] = useState('all');

  const memberById = {};
  for (const m of team) memberById[m.id] = m;

  const filtered = sessions.filter(s => {
    if (filterMember !== 'all' && s.memberId !== filterMember) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (filterCat !== 'all' && s.category !== filterCat) return false;
    return true;
  }).slice().reverse();

  function changeStatus(sessionId, newStatus) {
    dispatch({ type: 'UPDATE_SESSION_STATUS', payload: { id: sessionId, status: newStatus } });
  }

  const { memberStats } = computed;

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5">
      <PipelineBar computed={computed} />

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter size={14} style={{ color: 'var(--text-muted)' }} />
        {isLead && (
          <select value={filterMember} onChange={e => setFilterMember(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none" style={{ borderColor: 'var(--border)' }}>
            <option value="all">All Members</option>
            {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        )}
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none" style={{ borderColor: 'var(--border)' }}>
          <option value="all">All Status</option>
          {STATUS_ORDER.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none" style={{ borderColor: 'var(--border)' }}>
          <option value="all">All Categories</option>
          {['A','B','C','D'].map(c => <option key={c} value={c}>Category {c}</option>)}
        </select>
        <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{filtered.length} sessions</span>
      </div>

      {/* SESSION TABLE */}
      <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--border)', background: '#fff' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9ff' }}>
              <tr>
                {['Session ID','Date','Collector','Category','Sub / Denom','Images','Status','Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <EmptyState icon={Tag} title="No sessions match your filters" description="Try adjusting the filter dropdowns above." />
                </td></tr>
              ) : filtered.map(s => {
                const member = memberById[s.memberId];
                return (
                  <tr key={s.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{s.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 font-mono whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{s.timestamp.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {member && <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: member.color, fontSize: 8 }}>{member.initials}</div>}
                        <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{member?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-1.5 py-0.5 rounded font-bold text-white text-xs" style={{ background: { A:'#2563eb', B:'#d97706', C:'#7c3aed', D:'#0891b2' }[s.category] }}>{s.category}</span>
                    </td>
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-primary)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.subcategory || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{s.imageCount.toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_COLORS[s.status]}>{s.status}</Badge></td>
                    <td className="px-4 py-3">
                      {isLead || s.memberId === currentUser.id ? (
                        <select value={s.status} onChange={e => changeStatus(s.id, e.target.value)}
                          className="border rounded-lg px-2 py-1 text-xs focus:outline-none" style={{ borderColor: 'var(--border)' }}>
                          {STATUS_ORDER.map(st => <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>)}
                        </select>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ANNOTATOR STATS */}
      <div>
        <p className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Annotator Statistics</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(isLead ? team : [currentUser]).map(m => {
            const stats = memberStats[m.id] || {};
            const lastActive = stats.lastActive ? new Date(stats.lastActive).toLocaleDateString() : 'Never';
            return (
              <div key={m.id} className="rounded-xl p-4 shadow-sm" style={{ background: '#fff', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: m.color }}>{m.initials}</div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
                    <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{m.role}</p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant={stats.lastActive && (Date.now() - new Date(stats.lastActive)) < 86400000 ? 'success' : 'muted'}>
                      {stats.lastActive && (Date.now() - new Date(stats.lastActive)) < 86400000 ? 'Active' : 'Offline'}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg p-2" style={{ background: '#f8f9ff' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Collected</p>
                    <p className="font-bold font-mono" style={{ color: 'var(--accent)' }}>{(stats.collected || 0).toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg p-2" style={{ background: '#f0fdf4' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Annotated</p>
                    <p className="font-bold font-mono" style={{ color: 'var(--success)' }}>{(stats.annotated || 0).toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg p-2 col-span-2" style={{ background: '#fafafa' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Last Active: <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{lastActive}</span></p>
                    {stats.avgAccuracy && <p style={{ color: 'var(--text-muted)' }}>Avg Accuracy: <span className="font-mono font-semibold" style={{ color: stats.avgAccuracy >= 95 ? 'var(--success)' : 'var(--danger)' }}>{stats.avgAccuracy.toFixed(1)}%</span></p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
