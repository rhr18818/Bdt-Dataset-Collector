import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Target, CheckCircle, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { StatCard, ProgressBar, Badge, EmptyState } from './ui/index.jsx';
import { CATEGORY_LABELS, CATEGORY_DESCRIPTIONS } from '../data/seedData.js';

const CATEGORY_COLORS = { A: '#2563eb', B: '#d97706', C: '#7c3aed', D: '#0891b2' };

function getStatusBadge(collected, target) {
  const pct = target > 0 ? collected / target : 0;
  if (pct >= 1) return <Badge variant="blue">Complete</Badge>;
  if (pct >= 0.5) return <Badge variant="success">On Track</Badge>;
  return <Badge variant="danger">Behind</Badge>;
}

function CategoryRow({ cat, collected, targets, sessions }) {
  const [expanded, setExpanded] = useState(false);
  const target = targets[cat] || 0;
  const pct = target > 0 ? Math.round((collected / target) * 100) : 0;

  // Build subcategory breakdown from sessions
  const subMap = {};
  for (const s of sessions.filter(s => s.category === cat)) {
    const key = s.subcategory || 'Unknown';
    subMap[key] = (subMap[key] || 0) + s.imageCount;
  }
  const subs = Object.entries(subMap);

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
        style={{ background: '#fff' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
          style={{ background: CATEGORY_COLORS[cat] }}>{cat}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{CATEGORY_LABELS[cat]}</p>
            {getStatusBadge(collected, target)}
          </div>
          <p className="text-xs mt-0.5 mb-2" style={{ color: 'var(--text-muted)' }}>{CATEGORY_DESCRIPTIONS[cat]}</p>
          <ProgressBar value={collected} max={target} color={CATEGORY_COLORS[cat]} height={6} />
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <p className="font-bold font-mono text-base" style={{ color: 'var(--text-primary)' }}>{collected.toLocaleString()}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>/ {target.toLocaleString()}</p>
          <p className="text-xs font-mono" style={{ color: CATEGORY_COLORS[cat] }}>{pct}%</p>
        </div>
        {expanded ? <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
      </button>
      {expanded && (
        <div className="border-t px-5 py-3" style={{ borderColor: 'var(--border)', background: '#fafafa' }}>
          {subs.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No sessions logged for this category yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {subs.map(([sub, cnt]) => (
                <div key={sub} className="flex items-center gap-3">
                  <p className="text-xs w-40 truncate flex-shrink-0" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{sub}</p>
                  <div className="flex-1"><ProgressBar value={cnt} max={Math.max(cnt, 100)} height={5} /></div>
                  <p className="text-xs font-mono w-12 text-right" style={{ color: 'var(--text-primary)' }}>{cnt}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ state, computed }) {
  const { totalCollected, collectedByCategory, dailyActivity, todayFeed, totalAnnotated, totalApproved } = computed;
  const { meta, sessions, team } = state;

  // Days remaining
  const daysLeft = meta.deadline
    ? Math.max(0, Math.ceil((new Date(meta.deadline) - new Date()) / 86400000))
    : '—';

  // Chart data for category progress
  const catChartData = ['A', 'B', 'C', 'D'].map(cat => ({
    name: cat,
    collected: collectedByCategory[cat],
    remaining: Math.max(0, state.targets[cat] - collectedByCategory[cat]),
    target: state.targets[cat],
  }));

  // Find member by id
  const memberById = {};
  for (const m of team) memberById[m.id] = m;

  // Total Target 
  const totalTarget = (state.targets.A || 0) + (state.targets.B || 0) + (state.targets.C || 0) + (state.targets.D || 0);

  // Auto-refresh every 30 seconds
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Collected"
          value={totalCollected.toLocaleString()}
          sub={`of ${totalTarget.toLocaleString()} target images`}
          icon={Target}
          accentColor="var(--accent)"
          progress={{ value: totalCollected, max: totalTarget }}
          progressColor="var(--accent)"
        />
        <StatCard
          label="Annotated"
          value={totalAnnotated.toLocaleString()}
          sub={`of ${totalCollected.toLocaleString()} collected`}
          icon={CheckCircle}
          accentColor="var(--success)"
          progress={{ value: totalAnnotated, max: Math.max(totalCollected, 1) }}
          progressColor="var(--success)"
        />
        <StatCard
          label="Approved"
          value={totalApproved.toLocaleString()}
          sub="fully reviewed & approved"
          icon={TrendingUp}
          accentColor={totalApproved / Math.max(totalCollected, 1) >= 0.9 ? 'var(--success)' : 'var(--accent-warm)'}
          badge={totalApproved / Math.max(totalCollected, 1) >= 0.9 ? <Badge variant="success">≥90%</Badge> : null}
        />
        <StatCard
          label="Days Remaining"
          value={daysLeft}
          sub={meta.deadline ? `Deadline: ${new Date(meta.deadline).toLocaleDateString()}` : 'No deadline set'}
          icon={Clock}
          accentColor={daysLeft < 14 ? 'var(--danger)' : daysLeft < 30 ? 'var(--accent-warm)' : 'var(--success)'}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category progress bar chart */}
        <div className="rounded-xl p-5 shadow-sm" style={{ background: '#fff', border: '1px solid var(--border)' }}>
          <p className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>Collection Progress by Category</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={catChartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => v.toLocaleString()} contentStyle={{ borderRadius: 8, fontSize: 12, fontFamily: 'Inter' }} />
              <Bar dataKey="collected" stackId="a" name="Collected" radius={[0, 0, 0, 0]}>
                {catChartData.map((entry, i) => <Cell key={i} fill={CATEGORY_COLORS[entry.name]} />)}
              </Bar>
              <Bar dataKey="remaining" stackId="a" name="Remaining" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily activity line chart */}
        <div className="rounded-xl p-5 shadow-sm" style={{ background: '#fff', border: '1px solid var(--border)' }}>
          <p className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>Daily Images Added (Last 14 Days)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [v.toLocaleString(), 'Images']} contentStyle={{ borderRadius: 8, fontSize: 12, fontFamily: 'Inter' }} />
              <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--accent)' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CATEGORY PROGRESS GRID */}
      <div>
        <p className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>Category Breakdown <span className="font-normal text-xs ml-1" style={{ color: 'var(--text-muted)' }}>(click to expand subcategories)</span></p>
        <div className="flex flex-col gap-3">
          {['A', 'B', 'C', 'D'].map(cat => (
            <CategoryRow key={cat} cat={cat} collected={collectedByCategory[cat]} targets={state.targets} sessions={sessions} />
          ))}
        </div>
      </div>

      {/* TODAY'S ACTIVITY FEED */}
      <div className="rounded-xl shadow-sm" style={{ background: '#fff', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>Today's Activity</p>
        </div>
        <div className="divide-y max-h-72 overflow-y-auto" style={{ divideColor: 'var(--border)' }}>
          {todayFeed.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No activity today yet" description="Logged sessions will appear here in real-time." />
          ) : (
            todayFeed.map(s => {
              const member = memberById[s.memberId];
              return (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--text-muted)', minWidth: 50 }}>
                    {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                    style={{ background: member?.color || '#6b7280', fontSize: 9 }}>
                    {member?.initials || '?'}
                  </div>
                  <p className="text-xs flex-1 min-w-0" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                    <span className="font-medium">{member?.name || 'Unknown'}</span> added{' '}
                    <span className="font-mono font-semibold">{s.imageCount}</span> images to{' '}
                    <span style={{ color: CATEGORY_COLORS[s.category] }}>{s.subcategory || s.category}</span>
                    {s.groundTruthSum > 0 && <span style={{ color: 'var(--text-muted)' }}> — ৳{s.groundTruthSum} total</span>}
                  </p>
                  <span className="flex-shrink-0" style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[s.category], display: 'inline-block' }} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
