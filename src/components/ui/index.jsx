import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

// ─────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────
export function Modal({ title, onClose, children, size = 'md', footer }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const sizeClass = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' }[size] || 'max-w-2xl';

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal-content bg-white rounded-xl shadow-2xl w-full ${sizeClass} flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
        {footer && (
          <div className="px-6 py-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: '#fafafa', borderRadius: '0 0 12px 12px' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
export function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 360 }}>
      {toasts.map(t => (
        <div key={t.id} className="toast-item pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium"
          style={{ background: t.type === 'error' ? '#dc2626' : '#111827', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
          <span style={{ fontSize: 16 }}>{t.type === 'error' ? '✗' : '✓'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────
export function ProgressBar({ value, max, color, height = 8, showLabel = false }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const barColor = color || (pct >= 80 ? 'var(--success)' : pct >= 40 ? 'var(--accent-warm)' : 'var(--danger)');
  return (
    <div>
      <div className="rounded-full overflow-hidden" style={{ height, background: '#e5e7eb' }}>
        <div className="progress-bar h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      {showLabel && <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>{value.toLocaleString()} / {max.toLocaleString()} ({pct.toFixed(1)}%)</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────
export function Badge({ children, variant = 'default' }) {
  const styles = {
    default: { background: '#f3f4f6', color: '#374151' },
    success: { background: '#dcfce7', color: '#15803d' },
    warning: { background: '#fef3c7', color: '#b45309' },
    danger: { background: '#fee2e2', color: '#b91c1c' },
    blue: { background: '#dbeafe', color: '#1d4ed8' },
    muted: { background: '#f9fafb', color: '#6b7280' },
  };
  const s = styles[variant] || styles.default;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ ...s, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────
// AVATAR
// ─────────────────────────────────────────────
export function Avatar({ member, size = 32 }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-center rounded-full font-semibold"
      style={{ width: size, height: size, background: member?.color || '#6b7280', color: '#fff', fontSize: size * 0.38, fontFamily: 'Inter, sans-serif' }}>
      {member?.initials || '?'}
    </div>
  );
}

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────
export function StatCard({ label, value, sub, progress, progressColor, badge, icon: Icon, accentColor }) {
  return (
    <div className="rounded-xl p-5 flex flex-col gap-3 shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>{label}</p>
        {Icon && <div className="rounded-lg p-2" style={{ background: accentColor ? `${accentColor}18` : '#f3f4f6' }}><Icon size={18} style={{ color: accentColor || 'var(--text-muted)' }} /></div>}
        {badge && badge}
      </div>
      <div>
        <p className="text-3xl font-bold font-mono" style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>{sub}</p>}
      </div>
      {progress !== undefined && (
        <ProgressBar value={progress.value} max={progress.max} color={progressColor} height={6} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// CONFIRM MODAL
// ─────────────────────────────────────────────
export function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal title={title} onClose={onCancel} size="sm" footer={<span className="text-xs text-gray-400">Press Escape to cancel</span>}>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--border)' }}>Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg font-medium text-white transition-colors"
          style={{ background: danger ? 'var(--danger)' : 'var(--accent)' }}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && <div className="rounded-full p-4 mb-4" style={{ background: '#f3f4f6' }}><Icon size={28} style={{ color: 'var(--text-muted)' }} /></div>}
      <p className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{description}</p>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────
export function SectionHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>{title}</h2>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// BTN (primary button)
// ─────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, className = '', type = 'button' }) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-colors focus:outline-none';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' };
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff', border: 'none' },
    secondary: { background: '#f3f4f6', color: 'var(--text-primary)', border: '1px solid var(--border)' },
    danger: { background: 'var(--danger)', color: '#fff', border: 'none' },
    ghost: { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' },
    success: { background: 'var(--success)', color: '#fff', border: 'none' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{ fontFamily: 'Inter, sans-serif', ...(variants[variant] || variants.primary) }}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// RING PROGRESS (mini donut)
// ─────────────────────────────────────────────
export function RingProgress({ value, max, size = 64, strokeWidth = 7, color }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct);
  const barColor = color || (pct >= 0.8 ? 'var(--success)' : pct >= 0.4 ? 'var(--accent-warm)' : pct > 0 ? 'var(--danger)' : '#e5e7eb');
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={barColor} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={dashOffset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.4s cubic-bezier(0.4,0,0.2,1)' }} />
    </svg>
  );
}
