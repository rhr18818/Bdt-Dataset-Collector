import { useState, useEffect } from 'react';
import { Eye, EyeOff, Download } from 'lucide-react';
import { Btn } from './ui/index.jsx';

export default function Login({ team, onLogin }) {
  const [accessId, setAccessId] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e) {
    if (e) e.preventDefault();
    const cleanInput = accessId.trim().toLowerCase();
    const member = team.find(m => m.accessId?.toLowerCase() === cleanInput);
    if (member) {
      onLogin(member);
    } else {
      setError('Invalid Access ID. Please check with your team lead.');
    }
  }

  // PWA Install Prompt Logic
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!localStorage.getItem('bdt_pwa_declined')) {
        setShowInstall(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  }

  function handleDecline() {
    setShowInstall(false);
    localStorage.setItem('bdt_pwa_declined', 'true');
  }

  return (
    <div className="flex h-screen items-center justify-center p-4" style={{ background: 'var(--bg-surface)' }}>
      <div className="w-full max-w-md rounded-2xl shadow-xl overflow-hidden" style={{ background: '#fff', border: '1px solid var(--border)' }}>
        <div className="px-6 py-8 flex flex-col items-center border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
          <div className="w-12 h-12 mb-4 rounded-xl flex items-center justify-center text-lg font-bold" 
            style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>BDT</div>
          <h1 className="text-xl font-bold mb-1" style={{ color: '#fff', fontFamily: 'Inter, sans-serif' }}>BDT-Collect</h1>
          <p className="text-sm" style={{ color: 'var(--sidebar-text)' }}>Dataset Collection Manager</p>
        </div>
        
        {/* PWA Install Promo */}
        {showInstall && (
          <div className="mx-6 mt-6 p-4 rounded-xl shadow-sm" style={{ background: '#f0f4ff', border: '1px solid #c7d7fe' }}>
            <div className="flex gap-3 items-start">
              <div className="mt-0.5 rounded-lg p-1.5 flex-shrink-0" style={{ background: 'var(--accent)' }}>
                <Download size={18} color="white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: '#1e3a8a' }}>Install App for Offline Use</p>
                <p className="text-xs mt-1" style={{ color: '#1e40af' }}>Get the BDT-Collect mobile app! It runs completely offline and saves battery.</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={handleInstall} className="px-3 py-1.5 text-xs font-semibold rounded hover:opacity-90 text-white" style={{ background: 'var(--accent)' }}>Install Now</button>
                  <button onClick={handleDecline} className="px-3 py-1.5 text-xs font-semibold rounded hover:bg-white/50" style={{ color: '#1e3a8a' }}>Not now</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Access ID</p>
          <div className="relative mb-4">
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={accessId} 
              onChange={e => { setAccessId(e.target.value); setError(''); }}
              placeholder="Enter your unique ID"
              className="w-full border rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none"
              style={{ borderColor: error ? 'var(--danger)' : 'var(--border)' }}
              autoFocus 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <p className="text-xs mb-4" style={{ color: 'var(--danger)' }}>{error}</p>}
          
          <Btn variant="primary" type="submit" className="w-full justify-center" disabled={!accessId.trim()}>
            Login to Workspace
          </Btn>
          
        </form>
      </div>
    </div>
  );
}
