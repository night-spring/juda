import React, { useState } from 'react';
import { Mail, Lock, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  isConfigured 
} from '../services/firebase';

export default function Auth({ onAuthSuccess, onActivateSandbox }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    if (activeTab === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    if (!isConfigured) {
      // Mock Fallback Auth mode when Firebase is not configured
      setTimeout(() => {
        const mockUser = {
          uid: 'mock-user-123',
          email: email,
          displayName: activeTab === 'signup' ? name || 'Guest User' : 'Mock Dev User',
          photoURL: null
        };
        onAuthSuccess(mockUser, 'mock-token-123');
        setIsLoading(false);
      }, 800);
      return;
    }

    try {
      if (activeTab === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        onAuthSuccess(userCredential.user, token);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Note: For custom display names, one would normally call updateProfile,
        // but to keep it simple, we retrieve the token and authenticate the user.
        const token = await userCredential.user.getIdToken();
        const updatedUser = {
          ...userCredential.user,
          displayName: name || userCredential.user.email.split('@')[0]
        };
        onAuthSuccess(updatedUser, token);
      }
    } catch (err) {
      console.error(err);
      let errMsg = 'Failed to authenticate. Please check your credentials.';
      if (err.code === 'auth/email-already-in-use') errMsg = 'This email is already registered.';
      else if (err.code === 'auth/invalid-credential') errMsg = 'Invalid email or password.';
      else if (err.code === 'auth/weak-password') errMsg = 'Password is too weak.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    if (!isConfigured) {
      // Mock Google Login Fallback
      setTimeout(() => {
        const mockUser = {
          uid: 'mock-google-456',
          email: 'google-dev@juda.ai',
          displayName: 'Google Partner Developer',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80'
        };
        onAuthSuccess(mockUser, 'mock-token-google');
        setIsLoading(false);
      }, 800);
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      onAuthSuccess(result.user, token);
    } catch (err) {
      console.error(err);
      setError('Google Sign-In was cancelled or failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'var(--bg-main)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Absolute Decorative dots */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(#E2E8F0 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
        opacity: 0.5,
        zIndex: 0
      }} />

      <div style={{
        width: '100%',
        maxWidth: '440px',
        zIndex: 1,
        animation: 'fadeInAuth 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Logo and branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="gradient-badge" style={{ marginBottom: '16px', display: 'inline-flex' }}>
            🔒 Clinical Privacy Standards
          </div>
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            letterSpacing: '-0.04em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <Sparkles style={{ color: 'var(--primary-accent)', width: '28px', height: '28px' }} />
            Juda Analytics Workspace
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Exploratory profiling & chatbot memory spaces.
          </p>
        </div>

        {/* Unconfigured Warning Alert */}
        {!isConfigured && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.05)',
            border: '1px solid rgba(245, 158, 11, 0.15)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '0.82rem',
            color: 'var(--color-warning)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '2px' }}>⚠️ Developer Mock Mode Active</strong>
              VITE_FIREBASE_API_KEY is not set in `.env`. Entering local simulation mode. Any credentials will log in successfully.
            </div>
          </div>
        )}

        {/* Core Card */}
        <div className="glass-panel" style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '36px',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Tab Selector */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-main)',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '28px'
          }}>
            <button
              onClick={() => { setActiveTab('login'); setError(null); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                background: activeTab === 'login' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'login' ? '600' : '500',
                fontSize: '0.85rem',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: activeTab === 'login' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(null); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                background: activeTab === 'signup' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'signup' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'signup' ? '600' : '500',
                fontSize: '0.85rem',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: activeTab === 'signup' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Feedback message banner */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.04)',
              border: '1px solid rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: 'var(--color-danger)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Auth form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {activeTab === 'signup' && (
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      transition: 'all 0.15s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary-accent)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  placeholder="jane@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-accent)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-accent)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: '0.88rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px'
              }}
            >
              {isLoading ? (
                <div className="spinner" style={{ borderTopColor: '#FFFFFF', width: '16px', height: '16px' }} />
              ) : (
                <>
                  {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '24px 0',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            <span style={{ padding: '0 12px' }}>Or continue with</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
              width: '100%',
              background: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '0.88rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
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
            <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.258-3.133C18.29 1.258 15.426 0 12.24 0 5.58 0 .24 5.34.24 12s5.34 12 12 12c6.958 0 11.573-4.887 11.573-11.785 0-.792-.086-1.396-.189-1.93H12.24z"/>
            </svg>
            Google Identity Sign-In
          </button>
        </div>

        {/* Bottom Sandbox Shortcut */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={onActivateSandbox}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-accent)',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
          >
            🚀 Or skip directly to High-Fidelity Sandbox Simulator
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInAuth {
          from {
            opacity: 0;
            transform: scale(0.98) translateY(5px);
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
