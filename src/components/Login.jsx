import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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

  return (
    <div className="flex h-screen items-center justify-center p-4" style={{ background: 'var(--bg-surface)' }}>
      <div className="w-full max-w-md rounded-2xl shadow-xl overflow-hidden" style={{ background: '#fff', border: '1px solid var(--border)' }}>
        <div className="px-6 py-8 flex flex-col items-center border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
          <div className="w-12 h-12 mb-4 rounded-xl flex items-center justify-center text-lg font-bold" 
            style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>BDT</div>
          <h1 className="text-xl font-bold mb-1" style={{ color: '#fff', fontFamily: 'Inter, sans-serif' }}>BDT-Collect</h1>
          <p className="text-sm" style={{ color: 'var(--sidebar-text)' }}>Dataset Collection Manager</p>
        </div>
        
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
