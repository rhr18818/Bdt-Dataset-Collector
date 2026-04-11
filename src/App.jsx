import { useReducer, useCallback, useState, useEffect } from 'react';
import { loadState, reducer } from './data/reducer.js';
import { INITIAL_STATE } from './data/seedData.js';
import { useComputed } from './hooks/useComputed.js';
import Layout from './components/Layout.jsx';
import Dashboard from './components/Dashboard.jsx';
import CollectionTasks from './components/CollectionTasks.jsx';
import ReviewQueue from './components/ReviewQueue.jsx';
import QualityControl from './components/QualityControl.jsx';
import TeamSessions from './components/TeamSessions.jsx';
import ExportReport from './components/ExportReport.jsx';
import SettingsPanel from './components/Settings.jsx';
import QuickLogFAB from './components/QuickLogFAB.jsx';
import Login from './components/Login.jsx';
import { ToastContainer } from './components/ui/index.jsx';

import { db } from './data/firebase.js';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';

let toastId = 0;

export default function App() {
  const [state, dispatch] = useReducer(reducer, null, loadState);
  const computed = useComputed(state);
  const [activeView, setActiveView] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  // Firestore Synchronization
  useEffect(() => {
    // 1. Sync global metadata
    const unsubMeta = onSnapshot(doc(db, "bdt_db", "metaState"), snap => {
      if (snap.exists()) {
        dispatch({ type: 'HYDRATE_META', payload: snap.data() });
        setDbConnected(true);
      } else {
        // First ever launch — initialize the cloud DB
        const { sessions, ...metaState } = INITIAL_STATE;
        setDoc(doc(db, "bdt_db", "metaState"), metaState);
      }
    });

    // 2. Sync all collection sessions (scalable to thousands of docs)
    const unsubSessions = onSnapshot(collection(db, "bdt_sessions"), snap => {
      const allSessions = snap.docs.map(d => d.data());
      // Optional: Sort by timestamp if necessary
      allSessions.sort((a,b) => a.timestamp.localeCompare(b.timestamp));
      dispatch({ type: 'HYDRATE_SESSIONS', payload: allSessions });
    });

    return () => { unsubMeta(); unsubSessions(); };
  }, []);
  
  // Auth state
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem('bdt_currentUser'));
  const currentUser = state.team.find(m => m.id === currentUserId);

  // Auto-logout if user is deleted remotely/by reset
  useEffect(() => {
    if (currentUserId && !currentUser) {
      setCurrentUserId(null);
      localStorage.removeItem('bdt_currentUser');
    }
  }, [currentUserId, currentUser]);

  function handleLogin(member) {
    setCurrentUserId(member.id);
    localStorage.setItem('bdt_currentUser', member.id);
    setActiveView('dashboard');
  }

  function handleLogout() {
    setCurrentUserId(null);
    localStorage.removeItem('bdt_currentUser');
  }

  // Toast management
  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // Handle "Add Images" button in topbar → go to collection view
  const handleAddImages = useCallback(() => setActiveView('collection'), []);

  // Handle settings nav item → show settings panel instead of switching view
  const handleSetView = useCallback((view) => {
    if (view === 'settings') { setShowSettings(true); return; }
    setActiveView(view);
  }, []);

  // Log session handler — used by CollectionTasks and QuickLogFAB
  const handleLog = useCallback((payload) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const timestamp = new Date().toISOString();
    const finalPayload = { ...payload, id, timestamp };
    
    dispatch({ type: 'ADD_SESSION', payload: finalPayload });
    const catLabels = { A: 'Single Note', B: 'Multi-Note', C: 'Occlusion', D: 'Env/Light' };
    const newTotal = computed.totalCollected + (Number(payload.imageCount) || 0);
    addToast(`✓ Logged ${payload.imageCount} images — ${catLabels[payload.category]} · ${payload.subcategory || ''} — Total: ${newTotal.toLocaleString()}`);
  }, [computed.totalCollected, addToast]);

  // Onboarding card (first launch)
  const [showOnboarding, setShowOnboarding] = useState(!state.meta.onboardingDismissed);
  function dismissOnboarding() {
    dispatch({ type: 'DISMISS_ONBOARDING' });
    setShowOnboarding(false);
  }

  const viewProps = { state, computed, dispatch, currentUser };

  if (!currentUser) {
    return <Login team={state.team} onLogin={handleLogin} />;
  }

  const isLead = currentUser.role === 'lead';

  return (
    <>
      <Layout
        activeView={activeView}
        setActiveView={handleSetView}
        totalCollected={computed.totalCollected}
        targets={state.targets}
        onAddImages={handleAddImages}
        currentUser={currentUser}
        onLogout={handleLogout}>

        {/* Onboarding Banner */}
        {showOnboarding && activeView === 'dashboard' && (
          <div className="mx-4 md:mx-6 mt-4 rounded-xl p-4 flex items-start gap-4 shadow-sm"
            style={{ background: '#f0f4ff', border: '2px solid #c7d7fe' }}>
            <div className="text-2xl flex-shrink-0">👋</div>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: 'var(--accent)' }}>Welcome to BDT-Collect!</p>
              <p className="text-xs mt-1" style={{ color: '#1e40af' }}>
                <strong>3-step workflow:</strong> (1) Go to <em>Collection Tasks</em> → click <em>Log Images</em> to record your session.
                (2) Go to <em>Review Queue</em> → update status after dataset review & annotating.
                (3) Team lead reviews → marks as <em>Approved</em> in <em>Quality Control</em>.
              </p>
              <p className="text-xs mt-1" style={{ color: '#1e40af' }}>
                Use the <strong>+ Quick Log button</strong> (bottom-right) for fast field logging from your phone.
              </p>
            </div>
            <button onClick={dismissOnboarding} className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: 'var(--accent)', color: '#fff' }}>Got it</button>
          </div>
        )}

        {/* View Router */}
        {activeView === 'dashboard' && <Dashboard {...viewProps} />}
        {activeView === 'collection' && <CollectionTasks {...viewProps} onLog={handleLog} />}
        {activeView === 'review' && <ReviewQueue {...viewProps} />}
        {activeView === 'qc' && isLead ? <QualityControl {...viewProps} /> : null}
        {activeView === 'team' && isLead ? <TeamSessions {...viewProps} /> : null}
        {activeView === 'export' && isLead ? <ExportReport {...viewProps} /> : null}
      </Layout>

      {/* Quick Log FAB — visible on all views */}
      <QuickLogFAB team={isLead ? state.team : [currentUser]} onLog={handleLog} />

      {/* Settings Panel */}
      {showSettings && <SettingsPanel state={state} dispatch={dispatch} onClose={() => setShowSettings(false)} />}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} />
    </>
  );
}
