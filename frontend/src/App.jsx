import React, { useState, useEffect } from 'react';
import { Sparkles, Database, FileSpreadsheet, Bot, HelpCircle, Layers, ChevronRight, Terminal, PanelLeftOpen } from 'lucide-react';
import HistorySidebar from './components/HistorySidebar';
import Dropzone from './components/Dropzone';
import ChatBot from './components/ChatBot';
import SaaSLandingPage from './components/SaaSLandingPage';
import Auth from './components/Auth';
import { api } from './services/api';
import { auth, onAuthStateChanged, signOut } from './services/firebase';

export default function App() {
  const [session, setSession] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [sessionsHistory, setSessionsHistory] = useState([]);
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'auth', or 'workspace'
  
  // Authentication states
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Monitor Firebase Auth State Changes on mount
  useEffect(() => {
    if (!auth) {
      // Mock Client mode: restore session user if cached
      const savedUser = localStorage.getItem('juda_firebase_user');
      const savedToken = localStorage.getItem('juda_firebase_token');
      if (savedUser && savedToken) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        } catch (e) {
          setUser(null);
          setToken(null);
        }
      }
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthLoading(true);
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          setUser(currentUser);
          setToken(idToken);
          localStorage.setItem('juda_firebase_token', idToken);
          localStorage.setItem('juda_firebase_user', JSON.stringify({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL
          }));
        } catch (e) {
          console.error("Failed to acquire Firebase Token:", e);
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('juda_firebase_token');
        localStorage.removeItem('juda_firebase_user');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load history from backend whenever token or sandbox state changes
  useEffect(() => {
    if (!token && !isSandboxMode) {
      setSessionsHistory([]);
      return;
    }

    const loadHistory = async () => {
      try {
        const backendSessions = await api.getSessions();
        if (backendSessions && Array.isArray(backendSessions)) {
          setSessionsHistory(backendSessions);
          localStorage.setItem(`juda_saved_sessions_${user?.uid || 'guest'}`, JSON.stringify(backendSessions));
          return;
        }
      } catch (err) {
        console.warn("Failed to fetch sessions from backend on startup, falling back to localStorage:", err);
      }

      // Fallback to localStorage if backend fetch fails or is offline
      const savedSessions = localStorage.getItem(`juda_saved_sessions_${user?.uid || 'guest'}`);
      if (savedSessions) {
        try {
          setSessionsHistory(JSON.parse(savedSessions));
        } catch (e) {
          setSessionsHistory([]);
        }
      }
    };

    loadHistory();
  }, [token, isSandboxMode]);

  const fetchDatasetDetails = async (sessionId, activeSession) => {
    setIsLoadingSummary(true);
    setSummaryError(null);
    try {
      const summary = await api.getSummary(sessionId);
      setDatasetInfo({
        ...summary,
        filename: activeSession?.filename || 'Dataset'
      });
    } catch (err) {
      console.error(err);
      setSummaryError('Failed to fetch dataset summary profiling. Server may be in fallback mock mode.');
      setDatasetInfo({
        filename: activeSession?.filename || 'Dataset',
        row_count: activeSession?.row_count || 100,
        col_count: activeSession?.columns?.length || 5,
        columns: activeSession?.columns || ['id', 'feature_a', 'feature_b', 'target'],
        numerical_columns: ['feature_a', 'feature_b'],
        categorical_columns: ['target'],
        not_useful_columns: ['id'],
        missing_values: { id: 0, feature_a: 5, feature_b: 0, target: 0 },
        duplicates: 0
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Restore active session whenever user changes (e.g. login or reload)
  useEffect(() => {
    if (user) {
      setCurrentView('workspace');
      const savedActiveSession = localStorage.getItem(`juda_active_session_${user.uid}`);
      if (savedActiveSession) {
        try {
          const activeSession = JSON.parse(savedActiveSession);
          setSession(activeSession);
          fetchDatasetDetails(activeSession.session_id, activeSession);
        } catch (e) {
          console.warn("Failed to parse saved active session:", e);
        }
      }
    }
  }, [user]);

  const handleUploadSuccess = (uploadData) => {
    const newSession = {
      session_id: uploadData.session_id,
      filename: uploadData.filename,
      row_count: uploadData.row_count,
      columns: uploadData.columns
    };

    const updatedHistory = [
      newSession,
      ...sessionsHistory.filter(s => s.session_id !== uploadData.session_id)
    ].slice(0, 15);

    setSessionsHistory(updatedHistory);
    localStorage.setItem(`juda_saved_sessions_${user?.uid || 'guest'}`, JSON.stringify(updatedHistory));
    
    setIsSandboxMode(false);
    setSession(newSession);
    if (user) {
      localStorage.setItem(`juda_active_session_${user.uid}`, JSON.stringify(newSession));
    }
    setCurrentView('workspace');
    fetchDatasetDetails(uploadData.session_id, newSession);
  };

  const handleSelectSession = (selectedSession) => {
    setIsSandboxMode(false);
    setSession(selectedSession);
    if (user) {
      localStorage.setItem(`juda_active_session_${user.uid}`, JSON.stringify(selectedSession));
    }
    setCurrentView('workspace');
    fetchDatasetDetails(selectedSession.session_id, selectedSession);
  };

  const handleReset = () => {
    setSession(null);
    setDatasetInfo(null);
    setIsSandboxMode(false);
    if (user) {
      localStorage.removeItem(`juda_active_session_${user.uid}`);
    }
  };

  const handleDeleteSession = async (sessionIdToDelete) => {
    // 1. Optimistic UI Update: remove from session history array & localStorage instantly
    const updatedHistory = sessionsHistory.filter(s => s.session_id !== sessionIdToDelete);
    setSessionsHistory(updatedHistory);
    localStorage.setItem(`juda_saved_sessions_${user?.uid || 'guest'}`, JSON.stringify(updatedHistory));

    // 2. Clear cached chat messages in browser for this user
    localStorage.removeItem(`juda_chat_${user?.uid || 'guest'}_${sessionIdToDelete}`);

    // 3. Reset active workspace if we deleted the current active session
    if (session?.session_id === sessionIdToDelete) {
      handleReset();
    }

    // 4. Async sync deletion with Firebase database
    try {
      await api.deleteSession(sessionIdToDelete);
      console.log(`Successfully synced deletion for session ${sessionIdToDelete} with Firestore.`);
    } catch (err) {
      console.error(`Failed to delete session ${sessionIdToDelete} from Firebase:`, err);
    }
  };

  const handleActivateSandbox = () => {
    setIsSandboxMode(true);
    setSession(null);
    setCurrentView('workspace');
    setDatasetInfo({
      filename: 'synthetic_marketing_data.csv',
      row_count: 1420,
      col_count: 8,
      columns: ['customer_id', 'age', 'annual_income', 'spending_score', 'gender', 'membership_years', 'preferred_category', 'churned'],
      numerical_columns: ['age', 'annual_income', 'spending_score', 'membership_years'],
      categorical_columns: ['gender', 'preferred_category', 'churned'],
      not_useful_columns: ['customer_id'],
      missing_values: { customer_id: 0, age: 12, annual_income: 0, spending_score: 4, gender: 0, membership_years: 0, preferred_category: 0, churned: 0 },
      duplicates: 3
    });
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleAuthSuccess = (authUser, userToken) => {
    setUser(authUser);
    setToken(userToken);
    localStorage.setItem('juda_firebase_token', userToken);
    localStorage.setItem('juda_firebase_user', JSON.stringify({
      uid: authUser.uid,
      email: authUser.email,
      displayName: authUser.displayName,
      photoURL: authUser.photoURL
    }));
    setCurrentView('workspace');
    
    // Restore active session if any
    const savedActiveSession = localStorage.getItem(`juda_active_session_${authUser.uid}`);
    if (savedActiveSession) {
      try {
        const activeSession = JSON.parse(savedActiveSession);
        setSession(activeSession);
        fetchDatasetDetails(activeSession.session_id, activeSession);
      } catch (e) {
        console.warn("Failed to parse saved active session:", e);
      }
    }
  };

  const handleSignOut = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Firebase Sign-Out failure:", err);
      }
    }
    if (user) {
      localStorage.removeItem(`juda_saved_sessions_${user.uid}`);
      localStorage.removeItem(`juda_active_session_${user.uid}`);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('juda_firebase_token');
    localStorage.removeItem('juda_firebase_user');
    setSessionsHistory([]);
    setSession(null);
    setDatasetInfo(null);
    setIsSandboxMode(false);
    setCurrentView('landing');
  };

  if (currentView === 'landing') {
    return (
      <SaaSLandingPage 
        onLaunchWorkspace={() => {
          if (user || isSandboxMode) {
            setCurrentView('workspace');
          } else {
            setCurrentView('auth');
          }
        }} 
        onLogin={() => {
          setCurrentView('auth');
        }}
        isLoggedIn={!!user}
      />
    );
  }

  if (currentView === 'auth') {
    return (
      <Auth 
        onAuthSuccess={handleAuthSuccess}
        onActivateSandbox={() => {
          setIsSandboxMode(true);
          setCurrentView('workspace');
          setDatasetInfo({
            filename: 'synthetic_marketing_data.csv',
            row_count: 1420,
            col_count: 8,
            columns: ['customer_id', 'age', 'annual_income', 'spending_score', 'gender', 'membership_years', 'preferred_category', 'churned'],
            numerical_columns: ['age', 'annual_income', 'spending_score', 'membership_years'],
            categorical_columns: ['gender', 'preferred_category', 'churned'],
            not_useful_columns: ['customer_id'],
            missing_values: { customer_id: 0, age: 12, annual_income: 0, spending_score: 4, gender: 0, membership_years: 0, preferred_category: 0, churned: 0 },
            duplicates: 3
          });
        }}
      />
    );
  }

  return (
    <div className="app-container workspace-container-backdrop" style={{
      display: 'flex',
      flexDirection: 'row',
      minHeight: '100vh',
      zIndex: 1
    }}>
      
      {/* Soft floating aurora blobs in workspace background for premium cohesive SaaS visual style */}
      <div className="bg-gradient-blobs" style={{ opacity: 0.7, zIndex: 0 }}>
        <div className="blob blob-1" style={{ top: '-10%', right: '10%' }}></div>
        <div className="blob blob-3" style={{ bottom: '10%', left: '10%' }}></div>
      </div>
      
      {/* Sidebar Controls (White, ChatGPT-style, full height) */}
      <HistorySidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(false)}
        activeSessionId={session?.session_id}
        sessions={sessionsHistory}
        onSelectSession={handleSelectSession}
        onResetSession={handleReset}
        onDeleteSession={handleDeleteSession}
        onBackToLanding={handleBackToLanding}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Floating Expand Sidebar Button (ChatGPT style, visible only when collapsed) */}
      {!sidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          title="Expand Sidebar"
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            background: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '8px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
            e.currentTarget.style.borderColor = 'var(--border-color-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          <PanelLeftOpen size={16} />
        </button>
      )}

      {/* Main Workspace Area (takes 100% width if sidebar collapsed) */}
      <main style={{
        flex: 1,
        padding: sidebarOpen ? '36px 40px' : '36px 40px 36px 76px', // Expand padding slightly when collapsed to clear float button
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: (session || isSandboxMode) ? 'hidden' : 'auto',
        position: 'relative',
        transition: 'padding 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* Welcome Phase / Dashboard Portal */}
        {!session && !isSandboxMode ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '960px',
            margin: '0 auto',
            width: '100%',
            padding: '20px 0'
          }}>
            {/* Header info */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div className="gradient-badge" style={{ marginBottom: '16px' }}>
                ⚡ Privacy-First In-Memory Profiler
              </div>
              <h1 style={{
                fontSize: '2.8rem',
                fontWeight: '800',
                color: 'var(--text-primary)',
                letterSpacing: '-0.04em',
                marginBottom: '16px',
                lineHeight: '1.2'
              }}>
                Exploratory Data Analysis <br/>
                <span style={{
                  background: 'var(--accent-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Meets Smarter Automation</span>
              </h1>
              <p style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                maxWidth: '520px',
                margin: '0 auto',
                lineHeight: '1.5'
              }}>
                Upload any CSV spreadsheet to generate data quality profiles, correlation matrices, and chat natively with our secure, context-aware AI.
              </p>
            </div>

            {/* Drop Zone Box */}
            <Dropzone 
              onUploadSuccess={handleUploadSuccess}
              onActivateSandbox={handleActivateSandbox}
            />
          </div>
        ) : (
          /* Active Interactive Workspace Phase */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            animation: 'fadeInWorkspace 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            
            {/* Top Workspace Bar */}
            <div className="workspace-glass-panel" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px'
            }}>
              <div>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--primary-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Database size={10} />
                  Active Dataset Workspace
                </span>
                <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: '700', marginTop: '4px' }}>
                  📄 {datasetInfo?.filename || 'sandbox_simulation_data.csv'}
                </h2>
              </div>
              
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Row Count</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {datasetInfo?.row_count?.toLocaleString() || '---'}
                  </strong>
                </div>
                <div style={{ height: '20px', width: '1px', background: 'var(--border-color)' }} />
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Features</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {datasetInfo?.col_count || datasetInfo?.columns?.length || '---'}
                  </strong>
                </div>
                <div style={{ height: '20px', width: '1px', background: 'var(--border-color)' }} />
                <button 
                  onClick={handleReset}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  Close Dataset
                </button>
              </div>
            </div>

            {/* Split Workspace Layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '320px minmax(0, 1fr)',
              gap: '24px',
              flex: 1,
              minHeight: 0
            }}>
              
              {/* Left Column: Data Catalog Quick Overview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', height: '100%', minHeight: 0 }}>
                
                {/* Profile Summary Card */}
                <div className="workspace-glass-panel" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={14} style={{ color: 'var(--primary-accent)' }} />
                    Data Profiler Summary
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Numerical Columns</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                        {datasetInfo?.numerical_columns?.length || 0}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Categorical Columns</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                        {datasetInfo?.categorical_columns?.length || 0}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Duplicate Records</span>
                      <span style={{ 
                        color: datasetInfo?.duplicates > 0 ? 'var(--color-warning)' : 'var(--color-success)', 
                        fontWeight: '600' 
                      }}>
                        {datasetInfo?.duplicates || 0}
                      </span>
                    </div>
                    {datasetInfo?.not_useful_columns?.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Uninformative (ID) Columns</span>
                        <span style={{ color: 'var(--color-warning)', fontWeight: '600' }}>
                           {datasetInfo?.not_useful_columns?.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Columns List Card */}
                <div className="workspace-glass-panel" style={{
                  padding: '20px', 
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: '280px'
                }}>
                  <h3 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Terminal size={14} style={{ color: 'var(--primary-accent)' }} />
                    Columns Index Catalog
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    overflowY: 'auto',
                    flex: 1
                  }}>
                    {datasetInfo?.columns?.map((col) => {
                      const isNum = datasetInfo?.numerical_columns?.includes(col);
                      const isCat = datasetInfo?.categorical_columns?.includes(col);
                      const isId = datasetInfo?.not_useful_columns?.includes(col);
                      const nullCount = datasetInfo?.missing_values?.[col] || 0;

                      return (
                        <div key={col} style={{
                          background: 'rgba(255, 255, 255, 0.45)',
                          backdropFilter: 'blur(4px)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                            <span style={{ color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: '500' }}>
                              {col}
                            </span>
                            {nullCount > 0 && (
                              <span style={{
                                color: 'var(--color-danger)',
                                fontSize: '0.62rem',
                                display: 'block',
                                marginTop: '2px'
                              }}>
                                ⚠️ {nullCount} missing cells
                              </span>
                            )}
                          </div>
                          
                          <span style={{
                            fontSize: '0.62rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: '600',
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase',
                            background: 
                              isId ? 'rgba(245, 158, 11, 0.1)' :
                              isNum ? 'rgba(99, 102, 241, 0.08)' : 'rgba(16, 185, 129, 0.1)',
                            color: 
                              isId ? 'var(--color-warning)' :
                              isNum ? 'var(--primary-accent)' : 'var(--color-success)',
                            border: `1px solid ${
                              isId ? 'rgba(245, 158, 11, 0.15)' :
                              isNum ? 'var(--primary-accent-border)' : 'rgba(16, 185, 129, 0.15)'
                            }`
                          }}>
                            {isId ? 'index' : isNum ? 'float/int' : 'string'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Hero Chat Space */}
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
                <ChatBot 
                  sessionId={session?.session_id}
                  datasetInfo={datasetInfo}
                  onDeleteSession={handleDeleteSession}
                  user={user}
                />
              </div>

            </div>

          </div>
        )}

      </main>

      <style>{`
        @keyframes fadeInWorkspace {
          from {
            opacity: 0;
            transform: scale(0.995) translateY(3px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

    </div>
  );
}
