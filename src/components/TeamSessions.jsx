import { useState } from 'react';
import { Users, Plus, Trash2, Clock, Edit2, ExternalLink, AlertTriangle } from 'lucide-react';
import { Modal, Badge, EmptyState, Btn, ConfirmModal } from './ui/index.jsx';
import { AVATAR_COLORS } from '../data/seedData.js';

const ROLES = ['lead', 'collector', 'annotator', 'both'];
const ROLE_LABELS = { lead: 'Team Lead', collector: 'Collector', annotator: 'Annotator', both: 'Collector & Annotator' };

function AddMemberModal({ onSubmit, onClose }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('collector');
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [accessId, setAccessId] = useState('');

  const initials = name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';

  function handleSubmit() {
    if (!name.trim() || !accessId.trim()) return;
    onSubmit({ name: name.trim(), initials, role, color, accessId: accessId.trim() });
  }

  return (
    <Modal title="Add Team Member" onClose={onClose} size="sm" footer={<span>Escape to cancel</span>}>
      <div className="mb-4">
        <p className="text-xs font-semibold mb-1 uppercase" style={{ color: 'var(--text-muted)' }}>Full Name</p>
        <input type="text" value={name} onChange={e => setName(e.target.value)} autoFocus
          className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none"
          style={{ borderColor: 'var(--border)' }} placeholder="e.g. Junior C" />
      </div>
      <div className="mb-4">
        <p className="text-xs font-semibold mb-1 uppercase" style={{ color: 'var(--text-muted)' }}>Access ID</p>
        <input type="text" value={accessId} onChange={e => setAccessId(e.target.value)}
          className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none"
          style={{ borderColor: 'var(--border)' }} placeholder="e.g. junior_c" />
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Used by this member to log in.</p>
      </div>
      <div className="mb-4">
        <p className="text-xs font-semibold mb-1 uppercase" style={{ color: 'var(--text-muted)' }}>Role</p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map(r => (
            <button key={r} type="button" onClick={() => setRole(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={{ background: role === r ? 'var(--accent)' : '#fff', color: role === r ? '#fff' : 'var(--text-muted)', borderColor: role === r ? 'var(--accent)' : 'var(--border)' }}>
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <p className="text-xs font-semibold mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>Avatar Color</p>
        <div className="flex gap-2 flex-wrap">
          {AVATAR_COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full transition-all hover:scale-110"
              style={{ background: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: 2 }} />
          ))}
        </div>
      </div>
      <div className="mb-5 flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f8f9ff' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
          style={{ background: color }}>{initials}</div>
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{name || 'Your Name'}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ROLE_LABELS[role]}</p>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={handleSubmit} disabled={!name.trim() || !accessId.trim()}>Add Member</Btn>
      </div>
    </Modal>
  );
}

function EditSessionModal({ session, onSubmit, onClose }) {
  const [category, setCategory] = useState(session.category || 'A');
  const [subcategory, setSubcategory] = useState(session.subcategory || '');
  const [imageCount, setImageCount] = useState(session.imageCount || 0);
  const [notes, setNotes] = useState(session.notes || '');

  function handleSubmit() {
    onSubmit(session.id, {
      category,
      subcategory,
      imageCount: parseInt(imageCount, 10) || 0,
      notes
    });
  }

  return (
    <Modal title="Edit Session Log" onClose={onClose} size="sm">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Category</p>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none" style={{ borderColor: 'var(--border)' }}>
            <option value="A">A - Single Denomination</option>
            <option value="B">B - Multiple Denominations</option>
            <option value="C">C - Difficult Conditions</option>
            <option value="D">D - Difficult Environments</option>
          </select>
        </div>
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Subcategory / Notes</p>
          <input type="text" value={subcategory} onChange={e => setSubcategory(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none" style={{ borderColor: 'var(--border)' }} />
        </div>
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Images Count</p>
          <input type="number" min="0" value={imageCount} onChange={e => setImageCount(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none" style={{ borderColor: 'var(--border)' }} />
        </div>
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Notes</p>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none" style={{ borderColor: 'var(--border)' }} />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={handleSubmit}>Save Changes</Btn>
      </div>
    </Modal>
  );
}

function DriveCard({ member, isMain, onSave }) {
  const isEditingInitial = isMain ? !member?.meta?.mainDriveLink : !member?.driveLink;
  const initialUrl = isMain ? member?.meta?.mainDriveLink || '' : member?.driveLink || '';
  const updatedAt = isMain ? member?.meta?.mainDriveLinkUpdated : member?.driveLinkUpdated;
  
  const [isEditing, setIsEditing] = useState(isEditingInitial);
  const [url, setUrl] = useState(initialUrl);
  
  const isGoogleDrive = url && url.includes('drive.google.com');

  function handleSave() {
    onSave(url.trim());
    setIsEditing(false);
  }

  const initials = isMain ? '★' : member.initials;
  const color = isMain ? '#2563eb' : member.color;
  const name = isMain ? 'Main Dataset Folder (Team Lead)' : member.name;
  const roleLabel = isMain ? 'Central Storage' : (ROLE_LABELS[member.role] || member.role);

  return (
    <div className="rounded-xl p-4 shadow-sm flex flex-col gap-3 transition-colors" 
      style={{ background: '#fff', border: '1px solid var(--border)', borderLeft: '3px solid #2563eb' }}>
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: color }}>{initials}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{name}</p>
            {isMain && <Badge variant="primary" style={{ background: '#dbeafe', color: '#1e40af' }}>★ Main</Badge>}
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{roleLabel}</p>
        </div>
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2 mt-1">
          <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Drive folder URL</p>
          <div className="flex items-center gap-2">
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} 
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: 'var(--border)' }} placeholder="Paste Google Drive folder link here..." />
            <Btn variant="primary" size="sm" onClick={handleSave} disabled={!url.trim()}>Save</Btn>
            {initialUrl && <Btn variant="ghost" size="sm" onClick={() => { setUrl(initialUrl); setIsEditing(false); }}>Cancel</Btn>}
          </div>
          {url && !isGoogleDrive && (
             <p className="text-xs flex items-center gap-1 mt-1" style={{ color: '#d97706' }}>
               <AlertTriangle size={12} /> ⚠ This doesn't look like a Drive link
             </p>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-1 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
           <a href={url} target="_blank" rel="noopener noreferrer" 
              className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border"
              style={{ borderColor: '#2563eb', color: '#2563eb', background: '#eff6ff' }}>
              <ExternalLink size={14} /> Open Drive Folder ↗
           </a>
           <div className="flex flex-col items-end">
             <button onClick={() => setIsEditing(true)}
                className="text-xs flex items-center gap-1 hover:underline px-2 py-1 rounded" style={{ color: 'var(--text-muted)' }}>
                <Edit2 size={12} /> Edit Link
             </button>
             {updatedAt && <p className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Updated {new Date(updatedAt).toLocaleDateString()}</p>}
           </div>
        </div>
      )}
    </div>
  );
}

export default function TeamSessions({ state, computed, dispatch }) {
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [sessionToEdit, setSessionToEdit] = useState(null);
  const [logFilter, setLogFilter] = useState('all');
  const { team, sessions } = state;
  const { memberStats } = computed;

  const memberById = {};
  for (const m of team) memberById[m.id] = m;

  function handleAdd(payload) {
    dispatch({ type: 'ADD_TEAM_MEMBER', payload });
    setShowAdd(false);
  }

  function handleDelete(id) {
    dispatch({ type: 'REMOVE_TEAM_MEMBER', payload: { id } });
    setConfirmDelete(null);
  }

  function handleDeleteSession(id) {
    dispatch({ type: 'DELETE_SESSION', payload: { id } });
    setSessionToDelete(null);
  }

  function handleEditSession(id, updates) {
    dispatch({ type: 'EDIT_SESSION', payload: { id, updates } });
    setSessionToEdit(null);
  }

  const filteredLog = (logFilter === 'all' ? sessions : sessions.filter(s => s.memberId === logFilter))
    .slice().reverse().slice(0, 100);

  function exportSessionCSV() {
    const headers = ['ID','Timestamp','Member','Category','Subcategory','Denominations','Sum','Conditions','Environments','Lighting','Arrangements','ImageCount','Status','Notes'];
    const rows = sessions.map(s => [
      s.id, s.timestamp, memberById[s.memberId]?.name || s.memberId,
      s.category, s.subcategory, s.denominations.join('+'), s.groundTruthSum,
      s.conditions.join(';'), s.environments.join(';'), s.lighting.join(';'),
      s.arrangements.join(';'), s.imageCount, s.status, s.notes
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `bdt_sessions_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5">
      {/* Team Cards */}
      <div className="flex items-center justify-between mb-1">
        <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Team Members</p>
        <Btn variant="primary" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Member</Btn>
      </div>

      {team.length === 0 ? (
        <EmptyState icon={Users} title="No team members yet" description="Add your team to start assigning and tracking sessions."
          action={<Btn variant="primary" onClick={() => setShowAdd(true)}><Plus size={14} /> Add First Member</Btn>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map(m => {
            const stats = memberStats[m.id] || {};
            return (
              <div key={m.id} className="rounded-xl p-5 shadow-sm flex flex-col gap-3 relative" style={{ background: '#fff', border: '1px solid var(--border)' }}>
                <button onClick={() => setConfirmDelete(m)} className="absolute top-3 right-3 rounded-lg p-1.5 hover:bg-red-50 transition-colors">
                  <Trash2 size={14} style={{ color: '#d1d5db' }} className="hover:text-red-500" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-base flex-shrink-0" style={{ background: m.color }}>{m.initials}</div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
                    <Badge variant="default">{ROLE_LABELS[m.role] || m.role}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg p-2 text-center" style={{ background: '#f8f9ff' }}>
                    <p className="font-bold font-mono text-lg" style={{ color: 'var(--accent)' }}>{(stats.collected || 0).toLocaleString()}</p>
                    <p style={{ color: 'var(--text-muted)' }}>Collected</p>
                  </div>
                  <div className="rounded-lg p-2 text-center" style={{ background: '#f0fdf4' }}>
                    <p className="font-bold font-mono text-lg" style={{ color: 'var(--success)' }}>{(stats.annotated || 0).toLocaleString()}</p>
                    <p style={{ color: 'var(--text-muted)' }}>Annotated</p>
                  </div>
                  <div className="rounded-lg p-2 text-center col-span-2" style={{ background: '#fafafa' }}>
                    <div className="flex items-center justify-center gap-1">
                      <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                      <p style={{ color: 'var(--text-muted)' }}>
                        {stats.lastActive ? new Date(stats.lastActive).toLocaleDateString() : 'Never active'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Google Drive Folders */}
      <div className="flex flex-col gap-3 mt-2 mb-2">
        <div className="flex items-center gap-2 mb-1">
          <ExternalLink size={18} style={{ color: 'var(--text-primary)' }} />
          <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Google Drive Folders</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map(m => (
            <DriveCard 
              key={m.id} 
              member={m} 
              onSave={(link) => dispatch({ type: 'UPDATE_TEAM_MEMBER_LINK', payload: { id: m.id, driveLink: link } })}
            />
          ))}
        </div>
        <div className="mt-1 w-full lg:w-1/3 md:w-1/2">
          <DriveCard 
            isMain={true} 
            member={{ meta: state.meta }} 
            onSave={(link) => dispatch({ type: 'UPDATE_MAIN_DRIVE_LINK', payload: { driveLink: link } })}
          />
        </div>
      </div>

      {/* Session Log */}
      <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--border)', background: '#fff' }}>
        <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
          <p className="font-semibold text-sm flex-1" style={{ color: 'var(--text-primary)' }}>Session Log</p>
          <select value={logFilter} onChange={e => setLogFilter(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-xs focus:outline-none" style={{ borderColor: 'var(--border)' }}>
            <option value="all">All Members</option>
            {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <Btn variant="ghost" size="sm" onClick={exportSessionCSV}>↓ Export CSV</Btn>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9ff', position: 'sticky', top: 0 }}>
              <tr>
                {['Timestamp','Member','Category','Subcategory','Images','Status','Notes','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLog.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No sessions logged yet.</td></tr>
              ) : filteredLog.map(s => {
                const member = memberById[s.memberId];
                return (
                  <tr key={s.id} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-2 font-mono whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{new Date(s.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: member?.color || '#6b7280' }} />
                        <span>{member?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="px-1.5 py-0.5 rounded text-white font-bold text-xs" style={{ background: { A:'#2563eb', B:'#d97706', C:'#7c3aed', D:'#0891b2' }[s.category] }}>{s.category}</span>
                    </td>
                    <td className="px-4 py-2 font-mono" style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.subcategory}</td>
                    <td className="px-4 py-2 font-mono font-bold">{s.imageCount}</td>
                    <td className="px-4 py-2"><Badge variant={{ collected:'default', annotated:'warning', reviewed:'blue', approved:'success' }[s.status]}>{s.status}</Badge></td>
                    <td className="px-4 py-2 max-w-xs truncate" style={{ color: 'var(--text-muted)' }}>{s.notes || '—'}</td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <button onClick={() => setSessionToEdit(s)} className="p-1 text-gray-400 hover:text-blue-500 transition-colors" title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setSessionToDelete(s)} className="p-1 ml-1 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddMemberModal onSubmit={handleAdd} onClose={() => setShowAdd(false)} />}
      {confirmDelete && (
        <ConfirmModal title="Remove Team Member" danger
          message={`Remove "${confirmDelete.name}" from the team? Their session logs will be preserved.`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
          confirmLabel="Remove Member" />
      )}
      {sessionToDelete && (
        <ConfirmModal title="Delete Session" danger
          message="Are you sure you want to delete this session log? This action cannot be undone."
          onConfirm={() => handleDeleteSession(sessionToDelete.id)}
          onCancel={() => setSessionToDelete(null)}
          confirmLabel="Delete Session" />
      )}
      {sessionToEdit && (
        <EditSessionModal session={sessionToEdit} 
          onSubmit={handleEditSession} 
          onClose={() => setSessionToEdit(null)} />
      )}
    </div>
  );
}
