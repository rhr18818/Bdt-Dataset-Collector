import { useState } from 'react';
import {
  LayoutDashboard, Camera, Tag, ShieldCheck, Users, Download,
  Settings, Menu, X, ChevronRight, LogOut, UploadCloud, ExternalLink
} from 'lucide-react';

const MAIN_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'collection', label: 'Collection Tasks', icon: Camera },
  { id: 'review', label: 'Review Queue', icon: Tag },
];

const ADMIN_NAV = [
  { id: 'qc', label: 'Quality Control', icon: ShieldCheck },
  { id: 'team', label: 'Team & Sessions', icon: Users },
  { id: 'export', label: 'Export & Report', icon: Download },
];

export default function Layout({ activeView, setActiveView, totalCollected, targets, onAddImages, currentUser, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const totalTarget = targets ? (targets.A || 0) + (targets.B || 0) + (targets.C || 0) + (targets.D || 0) : 26000;
  const pct = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;
  const isLead = currentUser?.role === 'lead';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR — desktop & mobile drawer */}
      <aside className={`fixed md:relative z-50 h-full flex flex-col sidebar-transition flex-shrink-0 
        ${sidebarOpen ? 'w-56' : 'w-16'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ background: 'var(--bg-primary)', borderRight: '1px solid #1e2333' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: '#1e2333' }}>
          {sidebarOpen ? (
            <>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>BDT</div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--sidebar-active)', fontFamily: 'Inter, sans-serif' }}>BDT-Collect</p>
                <p className="text-xs" style={{ color: 'var(--sidebar-text)' }}>v1.0</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="ml-auto rounded p-1 hover:bg-white/10 transition-colors">
                <ChevronRight size={14} style={{ color: 'var(--sidebar-text)' }} />
              </button>
            </>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mx-auto"
              style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>B</button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 flex flex-col gap-0.5 overflow-y-auto px-2">
          {MAIN_NAV.map(({ id, label, icon: Icon }) => {
            const active = activeView === id;
            const btn = (
              <button key={id} onClick={() => { setActiveView(id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 rounded-lg px-2 py-2.5 w-full text-left transition-all ${active ? 'font-semibold' : 'hover:bg-white/5'}`}
                style={{
                  background: active ? 'rgba(37,99,235,0.25)' : 'transparent',
                  color: active ? 'var(--sidebar-active)' : 'var(--sidebar-text)',
                  borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                }}>
                <Icon size={17} />
                {sidebarOpen && <span className="text-sm whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</span>}
              </button>
            );

            if (id === 'collection') {
              return (
                <div key={`${id}-wrapper`} className="flex flex-col gap-0.5">
                  {btn}
                  <a href={currentUser?.driveLink || "#"} 
                    target="_blank" rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!currentUser?.driveLink) e.preventDefault();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 w-full text-left transition-all hover:bg-white/5"
                    style={{
                      color: currentUser?.driveLink ? '#0ea5e9' : 'gray',
                      opacity: currentUser?.driveLink ? 1 : 0.6,
                      borderLeft: '3px solid transparent'
                    }}>
                    <UploadCloud size={17} className={currentUser?.driveLink ? "text-cyan-500" : ""} />
                    {sidebarOpen && (
                      <span className="text-sm whitespace-nowrap flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Upload to Drive {currentUser?.driveLink && <ExternalLink size={12} className="opacity-70" />}
                      </span>
                    )}
                  </a>
                </div>
              );
            }
            return btn;
          })}
          
          {isLead && (
            <>
              {sidebarOpen && <p className="text-xs font-semibold uppercase mt-4 mb-1 pl-2" style={{ color: 'var(--sidebar-text)', opacity: 0.7 }}>Admin</p>}
              {ADMIN_NAV.map(({ id, label, icon: Icon }) => {
                const active = activeView === id;
                return (
                  <button key={id} onClick={() => { setActiveView(id); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 rounded-lg px-2 py-2.5 w-full text-left transition-all ${active ? 'font-semibold' : 'hover:bg-white/5'}`}
                    style={{
                      background: active ? 'rgba(37,99,235,0.25)' : 'transparent',
                      color: active ? 'var(--sidebar-active)' : 'var(--sidebar-text)',
                      borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                    }}>
                    <Icon size={17} />
                    {sidebarOpen && <span className="text-sm whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</span>}
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* Settings and user at bottom */}
        <div className="px-2 py-3 border-t flex flex-col gap-1" style={{ borderColor: '#1e2333' }}>
          {sidebarOpen && (
            <div className="mb-2 px-2 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase" style={{ background: currentUser?.color || 'var(--text-muted)' }}>
                {currentUser?.initials}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--sidebar-active)' }}>{currentUser?.name}</p>
              </div>
              <button onClick={onLogout} title="Logout" className="p-1 hover:bg-white/10 rounded">
                <X size={14} style={{ color: 'var(--sidebar-text)' }} />
              </button>
            </div>
          )}
          
          {isLead && (
            <button onClick={() => { setActiveView('settings'); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 w-full rounded-lg px-2 py-2.5 hover:bg-white/5 transition-colors"
              style={{ color: activeView === 'settings' ? 'var(--sidebar-active)' : 'var(--sidebar-text)' }}>
              <Settings size={17} />
              {sidebarOpen && <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Settings</span>}
            </button>
          )}
          
          {!sidebarOpen && (
            <button onClick={onLogout} title="Logout"
              className="mt-2 flex items-center justify-center w-full rounded-lg px-2 py-2.5 hover:bg-white/5 transition-colors">
               <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0" style={{ background: currentUser?.color || 'var(--text-muted)' }}>
                {currentUser?.initials}
              </div>
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP BAR */}
        <header className="flex items-center gap-3 px-4 md:px-6 py-3 border-b flex-shrink-0"
          style={{ background: '#fff', borderColor: 'var(--border)', zIndex: 10 }}>
          <button className="md:hidden rounded-lg p-1.5 hover:bg-gray-100 transition-colors" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={20} style={{ color: 'var(--text-muted)' }} />
          </button>
          <div className="flex-1 flex items-center gap-3">
            {/* Mobile logo */}
            <div className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>BDT</div>
            <span className="text-sm hidden md:block" style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>{today}</span>
          </div>
          {/* Progress pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: '#f0f4ff', border: '1px solid #c7d7fe' }}>
            <span className="text-xs font-semibold font-mono" style={{ color: 'var(--accent)' }}>{totalCollected.toLocaleString()} / {totalTarget.toLocaleString()}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({pct}%)</span>
          </div>
          <button onClick={onAddImages}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ background: 'var(--accent)', fontFamily: 'Inter, sans-serif' }}>
            <Camera size={15} />
            <span className="hidden sm:inline">Add Images</span>
            <span className="sm:hidden">+</span>
          </button>
        </header>

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM TAB BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-2 border-t"
        style={{ background: 'var(--bg-primary)', borderColor: '#1e2333' }}>
        {[...MAIN_NAV, ...(isLead ? ADMIN_NAV : [])].slice(0, 5).map(({ id, icon: Icon }) => {
          const active = activeView === id;
          const btn = (
            <button key={id} onClick={() => setActiveView(id)}
              className="flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all"
              style={{ color: active ? 'var(--accent)' : 'var(--sidebar-text)' }}>
              <Icon size={20} />
            </button>
          );

          if (id === 'collection') {
            return [
              btn,
              <a key={`${id}-mobile-drive`} href={currentUser?.driveLink || "#"}
                target="_blank" rel="noopener noreferrer"
                onClick={(e) => {
                  if (!currentUser?.driveLink) e.preventDefault();
                }}
                className="flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all"
                style={{
                  color: currentUser?.driveLink ? '#0ea5e9' : 'gray',
                  opacity: currentUser?.driveLink ? 1 : 0.6
                }}>
                <UploadCloud size={20} className={currentUser?.driveLink ? "text-cyan-500" : ""} />
              </a>
            ];
          }
          return btn;
        })}
        {isLead && ADMIN_NAV.length + MAIN_NAV.length <= 5 && (
          <button onClick={() => setActiveView('settings')} className="flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all"
            style={{ color: activeView === 'settings' ? 'var(--accent)' : 'var(--sidebar-text)' }}>
            <Settings size={20} />
          </button>
        )}
      </nav>
    </div>
  );
}
