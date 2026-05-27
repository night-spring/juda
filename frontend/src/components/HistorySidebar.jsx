import React, { useState } from 'react';
import { Database, Plus, ShieldCheck, PanelLeftClose, Trash2, Check, X, Home, LogOut } from 'lucide-react';

export default function HistorySidebar({ isOpen, onToggle, activeSessionId, onSelectSession, onResetSession, onDeleteSession, onBackToLanding, sessions = [], user = null, onSignOut }) {
  const [deletingSessionId, setDeletingSessionId] = useState(null); // Track session pending deletion

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
      background: 'rgba(255, 255, 255, 0.45)',
      backdropFilter: 'blur(20px)',
      color: 'var(--text-primary)',
      overflowY: 'auto',
      fontFamily: 'var(--font-sans)',
      borderRight: '1px solid rgba(255, 255, 255, 0.3)',
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
          background: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(4px)',
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
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
          e.currentTarget.style.borderColor = 'var(--primary-accent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.55)';
          e.currentTarget.style.borderColor = 'var(--border-color)';
        }}
      >
        <Plus size={16} style={{ color: 'var(--primary-accent)' }} />
        New CSV Profile
      </button>

      {/* Back to Landing Page Button */}
      <button 
        onClick={onBackToLanding}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          background: 'transparent',
          border: '1px dashed var(--border-color)',
          color: 'var(--text-secondary)',
          padding: '10px 14px',
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '0.85rem',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          marginBottom: '20px',
          textAlign: 'left'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--primary-accent-light)';
          e.currentTarget.style.borderColor = 'var(--primary-accent-border)';
          e.currentTarget.style.color = 'var(--primary-accent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        <Home size={16} />
        Back to Landing Page
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

      {/* User Profile Card (if authenticated) */}
      {user && (
        <>
          <div style={{ height: '1px', background: 'var(--border-color)', margin: '12px 0 8px' }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 10px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(4px)',
            border: '1px solid var(--border-color)',
            marginBottom: '4px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Avatar" 
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--primary-accent-light)',
                color: 'var(--primary-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: '700'
              }}>
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user.displayName || user.email.split('@')[0]}
              </span>
              <span style={{
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user.email}
              </span>
            </div>

            <button
              onClick={onSignOut}
              title="Sign Out"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                e.currentTarget.style.color = 'var(--color-danger)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </>
      )}

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border-color)', margin: '12px 0' }} />

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
