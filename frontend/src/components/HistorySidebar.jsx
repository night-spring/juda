import React, { useState, useEffect } from 'react';
import { Database, Plus, Settings, RefreshCw, Server, ShieldCheck, ChevronDown, PanelLeftClose, Trash2, Check, X } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';

export default function HistorySidebar({ isOpen, onToggle, activeSessionId, onSelectSession, onResetSession, onDeleteSession, sessions = [] }) {
  const [hostUrl, setHostUrl] = useState(getApiBaseUrl());
  const [isTestingStatus, setIsTestingStatus] = useState(false);
  const [serverStatus, setServerStatus] = useState('unknown'); // 'online', 'offline', 'unknown'
  const [showSettings, setShowSettings] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState(null); // Track session pending deletion

  // Ping check to test server status on mount
  const checkServerStatus = async (urlToCheck = hostUrl) => {
    setIsTestingStatus(true);
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2500);

      await fetch(`${urlToCheck}/api/v1/eda/summary/ping_test`, { 
        method: 'GET',
        signal: controller.signal
      }).catch(e => {
        if (e.name === 'AbortError') throw e;
        return { status: 404 }; 
      });
      
      clearTimeout(id);
      setServerStatus('online');
    } catch (e) {
      setServerStatus('offline');
    } finally {
      setIsTestingStatus(false);
    }
  };

  useEffect(() => {
    checkServerStatus();
  }, []);

  const handleHostSave = (e) => {
    e.preventDefault();
    setApiBaseUrl(hostUrl);
    checkServerStatus(hostUrl);
    setShowSettings(false);
  };

  const startDeleteFlow = (e, sessionId) => {
    e.stopPropagation(); // Avoid triggering session selection
    setDeletingSessionId(sessionId);
  };

  const cancelDeleteFlow = (e) => {
    e.stopPropagation();
    setDeletingSessionId(null);
  };

  const confirmDelete = (e, sessionId) => {
    e.stopPropagation();
    onDeleteSession(sessionId);
    setDeletingSessionId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="chatgpt-sidebar-white" style={{
      width: '260px',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      padding: '16px 12px',
      background: '#F9F9FB',
      color: 'var(--text-primary)',
      overflowY: 'auto',
      fontFamily: 'var(--font-sans)',
      borderRight: '1px solid var(--border-color)',
      boxShadow: 'none',
      flexShrink: 0,
      position: 'relative',
      zIndex: 100,
      animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        padding: '0 4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'var(--accent-gradient)',
            borderRadius: '6px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            color: '#FFFFFF',
            fontSize: '0.85rem'
          }}>
            J
          </div>
          <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Juda Workspace
          </span>
        </div>

        {/* Sidebar Close Button */}
        <button 
          onClick={onToggle}
          title="Collapse Sidebar"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ECECEF';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* New CSV Button */}
      <button 
        onClick={onResetSession}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          background: '#FFFFFF',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          padding: '10px 14px',
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '0.85rem',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          marginBottom: '20px',
          textAlign: 'left',
          boxShadow: 'var(--shadow-sm)'
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
        <Plus size={16} style={{ color: 'var(--primary-accent)' }} />
        New CSV Profile
      </button>

      {/* Middle: Session History Stream */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {sessions.length > 0 && (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: '600',
            textTransform: 'none',
            color: 'var(--text-muted)',
            padding: '0 8px 8px',
            display: 'block'
          }}>
            Recent Datasets
          </span>
        )}

        {sessions.length === 0 ? (
          <div style={{
            padding: '24px 12px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
            lineHeight: '1.4',
            background: '#FFFFFF',
            border: '1px dashed var(--border-color)',
            borderRadius: '8px'
          }}>
            No history found. Click the button above to upload a spreadsheet!
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            overflowY: 'auto',
            flex: 1,
            paddingRight: '2px'
          }}>
            {sessions.map((sess) => {
              const isActive = sess.session_id === activeSessionId;
              const isDeleting = sess.session_id === deletingSessionId;

              return (
                <div 
                  key={sess.session_id}
                  className="history-item-container"
                  style={{ position: 'relative' }}
                >
                  {isDeleting ? (
                    /* sleeker inline deletion prompt (ChatGPT Style) */
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      color: 'var(--color-danger)',
                      fontSize: '0.78rem',
                      fontWeight: '500',
                      animation: 'fadeIn 0.15s ease-out'
                    }}>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Confirm Delete?
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={(e) => confirmDelete(e, sess.session_id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-success)',
                            display: 'flex',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={cancelDeleteFlow}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Regular history item */
                    <button
                      onClick={() => onSelectSession(sess)}
                      className="history-item-row"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        textAlign: 'left',
                        background: isActive ? '#ECECEF' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 32px 8px 10px', // Extra right padding for floating trash icon
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        fontWeight: isActive ? '600' : '400',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#ECECEF';
                        }
                        const trash = e.currentTarget.querySelector('.trash-icon-btn');
                        if (trash) trash.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                        const trash = e.currentTarget.querySelector('.trash-icon-btn');
                        if (trash) trash.style.opacity = '0';
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>📄</span>
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1
                      }}>
                        {sess.filename || 'Unnamed CSV'}
                      </div>
                      
                      {/* Floating Trash can (ChatGPT style - visible on hover) */}
                      <button
                        className="trash-icon-btn"
                        onClick={(e) => startDeleteFlow(e, sess.session_id)}
                        title="Delete Session"
                        style={{
                          position: 'absolute',
                          right: '8px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          opacity: 0,
                          transition: 'opacity 0.15s, color 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px',
                          borderRadius: '4px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--color-danger)';
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-muted)';
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <Trash2 size={13} />
                      </button>

                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          left: '0',
                          top: '25%',
                          bottom: '25%',
                          width: '3px',
                          background: 'var(--accent-gradient)',
                          borderRadius: '0 4px 4px 0'
                        }} />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border-color)', margin: '12px 0' }} />

      {/* Bottom Connection Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        {/* Host Status Widget */}
        <div 
          onClick={() => setShowSettings(!showSettings)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ECECEF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 
              serverStatus === 'online' ? 'rgba(16, 185, 129, 0.15)' :
              serverStatus === 'offline' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 
              serverStatus === 'online' ? 'var(--color-success)' :
              serverStatus === 'offline' ? 'var(--color-danger)' : 'var(--color-warning)',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {serverStatus === 'online' ? '●' : '○'}
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '500', color: 'var(--text-primary)' }}>
              FastAPI Status
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {serverStatus === 'online' ? 'Connected' : 'Offline'}
            </div>
          </div>
          <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
        </div>

        {/* Change Host Drawer */}
        {showSettings && (
          <form 
            onSubmit={handleHostSave} 
            style={{ 
              padding: '8px', 
              background: '#FFFFFF', 
              border: '1px solid var(--border-color)',
              borderRadius: '6px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <label style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              API Base URL
            </label>
            <input 
              type="text" 
              value={hostUrl} 
              onChange={(e) => setHostUrl(e.target.value)}
              placeholder="e.g. http://127.0.0.1:8000"
              style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '6px 8px',
                color: 'var(--text-primary)',
                fontSize: '0.72rem',
                outline: 'none',
                width: '100%'
              }}
            />
            <button 
              type="submit"
              className="btn-primary"
              style={{
                padding: '6px',
                fontSize: '0.72rem',
                fontWeight: '600',
                justifyContent: 'center'
              }}
            >
              Save Address
            </button>
          </form>
        )}

        {/* In-Memory Policy Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 10px',
          fontSize: '0.65rem',
          color: 'var(--text-muted)'
        }}>
          <ShieldCheck size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
          <span>Zero-Disk Memory active</span>
        </div>

      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-16px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

    </div>
  );
}
