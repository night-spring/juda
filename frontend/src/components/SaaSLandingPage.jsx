import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Code, 
  BarChart, 
  MessageSquare, 
  Terminal, 
  ArrowUpRight, 
  Database,
  Layers,
  ChevronRight
} from 'lucide-react';

// --- CUSTOM SOCIAL ICON COMPONENTS (SVG) ---
function GitHubIcon({ size = 16, className }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedInIcon({ size = 16, className }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function MailIcon({ size = 16, className }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function MockCorrelationHeatmap() {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="auto" style={{ maxHeight: '180px', borderRadius: '4px', background: '#FCFCFB', display: 'block', margin: '0 auto' }}>
      <rect width="400" height="300" rx="8" fill="#F8FAFC" />
      <g transform="translate(80, 50)">
        <text x="-10" y="25" textAnchor="end" fill="#475569" fontSize="10" fontWeight="500">Age</text>
        <rect x="0" y="0" width="50" height="50" fill="#4F46E5" rx="4" />
        <text x="25" y="28" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">1.00</text>
        
        <rect x="55" y="0" width="50" height="50" fill="#EEF2FF" rx="4" />
        <text x="80" y="28" textAnchor="middle" fill="#4F46E5" fontSize="10" fontWeight="bold">0.08</text>
        
        <rect x="110" y="0" width="50" height="50" fill="#FEE2E2" rx="4" />
        <text x="135" y="28" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">-0.15</text>
        
        <rect x="165" y="0" width="50" height="50" fill="#FEF2F2" rx="4" />
        <text x="190" y="28" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">-0.05</text>

        <text x="-10" y="80" textAnchor="end" fill="#475569" fontSize="10" fontWeight="500">Income</text>
        <rect x="0" y="55" width="50" height="50" fill="#EEF2FF" rx="4" />
        <text x="25" y="83" textAnchor="middle" fill="#4F46E5" fontSize="10" fontWeight="bold">0.08</text>
        
        <rect x="55" y="55" width="50" height="50" fill="#4F46E5" rx="4" />
        <text x="80" y="83" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">1.00</text>
        
        <rect x="110" y="55" width="50" height="50" fill="#C7D2FE" rx="4" />
        <text x="135" y="83" textAnchor="middle" fill="#4338CA" fontSize="10" fontWeight="bold">0.42</text>
        
        <rect x="165" y="55" width="50" height="50" fill="#FEE2E2" rx="4" />
        <text x="190" y="83" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">-0.21</text>

        <text x="25" y="-10" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="500">Age</text>
        <text x="80" y="-10" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="500">Income</text>
        <text x="135" y="-10" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="500">Spend</text>
        <text x="190" y="-10" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="500">Churn</text>
      </g>
    </svg>
  );
}

export default function SaaSLandingPage({ onLaunchWorkspace }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('eda');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <ShieldCheck size={20} className="feature-icon-purple" />,
      title: "Zero-Disk Privacy Policy",
      description: "We never write your spreadsheet data to server disk or database. CSV is parsed strictly in-memory, summarized, and instantly garbage collected.",
      badge: "Privacy First"
    },
    {
      icon: <MessageSquare size={20} className="feature-icon-purple" />,
      title: "Interactive AI Chatbot",
      description: "Chat natively with an intelligent dataset-aware assistant. Ask about trends, anomalies, or request tailored pandas code snippets.",
      badge: "Llama-Powered"
    },
    {
      icon: <BarChart size={20} className="feature-icon-purple" />,
      title: "Inline Visualizations",
      description: "Pearson correlation heatmaps, missing value counts, and numerical distributions generated on-the-fly and rendered directly in chat.",
      badge: "Seaborn / Matplotlib"
    },
    {
      icon: <Code size={20} className="feature-icon-purple" />,
      title: "Automated Profiling Reports",
      description: "Generate beautifully formatted, clinical Markdown reports outlining data health, quality metrics, and machine learning recommendations.",
      badge: "1-Click PDF"
    }
  ];

  return (
    <div className="landing-page-container" style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      color: 'var(--text-secondary)',
      fontFamily: 'var(--font-sans)',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Cool Dot-Mesh Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        opacity: 0.5,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Header / Navbar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '72px',
        background: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        zIndex: 100,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{
            background: 'var(--primary-accent-light)',
            border: '1px solid var(--primary-accent-border)',
            borderRadius: '8px',
            padding: '6px',
            color: 'var(--primary-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={18} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Juda<span style={{ color: 'var(--primary-accent)' }}>.ai</span>
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#architecture" className="nav-link">Architecture</a>
          <a href="#creator" className="nav-link">Founder</a>
          <button 
            onClick={onLaunchWorkspace}
            className="btn-primary" 
            style={{
              padding: '8px 18px',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.12)'
            }}
          >
            Launch Workspace <ArrowRight size={14} />
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '160px 40px 100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Gradient Promo Badge */}
        <div className="gradient-badge" style={{ marginBottom: '24px', animation: 'fadeInUp 0.6s ease' }}>
          ✨ In-Memory Analytics &amp; Chat Intelligence
        </div>

        {/* Hero Title */}
        <h1 style={{
          fontSize: '3.6rem',
          fontWeight: '900',
          color: 'var(--text-primary)',
          letterSpacing: '-0.04em',
          lineHeight: '1.15',
          maxWidth: '860px',
          marginBottom: '24px',
          animation: 'fadeInUp 0.8s ease'
        }}>
          Exploratory Data Analysis <br/>
          <span style={{
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Meets AI-Powered Insight</span>
        </h1>

        {/* Hero Subtitle */}
        <p style={{
          fontSize: '1.15rem',
          lineHeight: '1.6',
          color: 'var(--text-secondary)',
          maxWidth: '640px',
          marginBottom: '40px',
          animation: 'fadeInUp 1s ease'
        }}>
          Upload spreadsheets, automatically calculate profile statistics, generate clinical analytical reports, and query correlations via a context-aware conversational agent.
        </p>

        {/* Hero Action CTA */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          marginBottom: '64px',
          animation: 'fadeInUp 1.2s ease'
        }}>
          <button 
            onClick={onLaunchWorkspace}
            className="btn-primary" 
            style={{
              padding: '14px 28px',
              fontSize: '0.95rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.2)'
            }}
          >
            Launch Free Workspace <ArrowRight size={16} />
          </button>
          <a 
            href="https://github.com/night-spring" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-secondary" 
            style={{
              padding: '14px 28px',
              fontSize: '0.95rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '8px',
              background: '#FFFFFF'
            }}
          >
            <GitHubIcon size={16} /> View GitHub
          </a>
        </div>

        {/* Interactive Dashboard Preview Frame (Clinical B2B) */}
        <div 
          className="dashboard-preview-card"
          style={{
            width: '100%',
            maxWidth: '1000px',
            background: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '8px',
            boxShadow: '0 30px 60px -15px rgba(15, 23, 42, 0.08)',
            position: 'relative',
            animation: 'fadeInUp 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
            transformStyle: 'preserve-3d',
            perspective: '1000px'
          }}
        >
          {/* Header Bar Mock */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            background: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px 10px 0 0',
            borderBottom: 'none'
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', background: '#FFFFFF', padding: '4px 16px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              📄 customer_profiling_matrix.csv
            </div>
            <div style={{ width: '30px' }} />
          </div>

          {/* Body Dashboard View Mock */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            height: '420px',
            background: '#FFFFFF',
            borderRadius: '0 0 10px 10px',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}>
            {/* Sidebar Mock */}
            <div style={{
              background: '#F8FAFC',
              borderRight: '1px solid var(--border-color)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Session Summary</span>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-primary)', fontWeight: '600' }}>1,420 rows</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>8 columns indexed</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Columns Map</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {['customer_id', 'age', 'annual_income', 'spending_score'].map((c, i) => (
                    <div key={c} style={{ background: '#FFFFFF', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-primary)', fontWeight: '500' }}>{c}</span>
                      <span style={{ fontSize: '0.55rem', padding: '2px 4px', background: i === 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)', color: i === 0 ? 'var(--color-warning)' : 'var(--primary-accent)', borderRadius: '3px' }}>
                        {i === 0 ? 'index' : 'float'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Workspace Mock */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              background: '#FCFCFB'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border-color)', background: '#FFFFFF' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>Juda AI Workspace</span>
                <span style={{ fontSize: '0.65rem', padding: '3px 8px', background: 'var(--primary-accent-light)', color: 'var(--primary-accent)', borderRadius: '20px', fontWeight: '600' }}>Live Chat</span>
              </div>

              {/* Message Log Mock */}
              <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'hidden', textAlign: 'left' }}>
                {/* User Message */}
                <div style={{ alignSelf: 'flex-end', background: 'var(--primary-accent-light)', border: '1px solid var(--primary-accent-border)', padding: '8px 12px', borderRadius: '12px 0 12px 12px', maxWidth: '70%' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)' }}>Show me the numeric correlations heatmap!</span>
                </div>
                
                {/* Assistant Message */}
                <div style={{ alignSelf: 'flex-start', background: '#FFFFFF', border: '1px solid var(--border-color)', padding: '10px 12px', borderRadius: '0 12px 12px 12px', maxWidth: '80%', display: 'flex', gap: '8px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '4px', background: 'var(--primary-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-accent)', flexShrink: 0 }}>
                    <Sparkles size={10} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Certainly! Below is the pre-generated Pearson correlation matrix for the numeric features:</span>
                    
                    {/* Inline SVG Heatmap Mock */}
                    <div style={{ width: '220px', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', background: '#FFFFFF' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px', marginBottom: '6px', fontWeight: 'bold' }}>
                        <span>📊 CORRELATION MATRIX</span>
                        <span style={{ color: 'var(--primary-accent)' }}>CLICK TO ZOOM</span>
                      </div>
                      <MockCorrelationHeatmap />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Floating Glass Card */}
          <div 
            className="floating-glass-card"
            style={{
              position: 'absolute',
              bottom: '-25px',
              right: '-30px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(79, 70, 229, 0.15)',
              borderRadius: '12px',
              padding: '14px 18px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'left'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>Zero-Disk Active</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Raw records purged from RAM.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Features Section */}
      <section id="features" style={{
        padding: '100px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-accent)' }}>Interactive Architecture</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px', letterSpacing: '-0.03em' }}>Engineered for High Performance</h2>
        </div>

        {/* Feature Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {features.map((feat, i) => (
            <div 
              key={i} 
              className="glass-panel feature-card"
              style={{
                padding: '28px',
                background: '#FFFFFF',
                borderRadius: '12px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'default',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = 'var(--primary-accent-border)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <div style={{
                background: 'var(--primary-accent-light)',
                border: '1px solid var(--primary-accent-border)',
                borderRadius: '8px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-accent)'
              }}>
                {feat.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>{feat.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{feat.description}</p>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.65rem', padding: '3px 8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  {feat.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Architecture Map (Interactive Node visualization) */}
      <section id="architecture" style={{
        padding: '80px 40px 100px',
        background: '#FFFFFF',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-accent)' }}>Secure Execution Pipeline</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px', marginBottom: '48px', letterSpacing: '-0.03em' }}>Cohesive Architecture Map</h2>

          {/* Flow Diagram */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            alignItems: 'center',
            padding: '20px 0'
          }}>
            {/* Row 1: CSV Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div className="flow-node" style={{ background: '#FCFCFB', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px 20px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={16} style={{ color: 'var(--primary-accent)' }} />
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>Spreadsheet Upload</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Raw CSV (e.g. 50MB max)</span>
                </div>
              </div>

              <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />

              <div className="flow-node" style={{ background: '#FCFCFB', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px 20px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Terminal size={16} style={{ color: 'var(--primary-accent)' }} />
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>React Single Page App</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Vite / Tailwind / Fetch API</span>
                </div>
              </div>

              <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />

              <div className="flow-node" style={{ background: '#FCFCFB', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px 20px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cpu size={16} style={{ color: 'var(--primary-accent)' }} />
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>FastAPI REST API</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Uvicorn ASGI Engine</span>
                </div>
              </div>
            </div>

            {/* Glowing Down arrow */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div style={{ width: '2px', height: '20px', background: 'var(--primary-accent-border)' }} />
              <ChevronRight size={18} style={{ transform: 'rotate(90deg)', color: 'var(--primary-accent)' }} />
            </div>

            {/* Row 2: Backend Engines */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
              
              {/* Pandas block */}
              <div className="flow-node" style={{ background: 'var(--primary-accent-light)', border: '1px solid var(--primary-accent-border)', borderRadius: '8px', padding: '14px 20px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={16} style={{ color: 'var(--primary-accent)' }} />
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>In-Memory Pandas Engine</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--primary-accent)' }}>No Disk Storage / Immediate GC</span>
                </div>
              </div>

              {/* Llama block */}
              <div className="flow-node" style={{ background: 'var(--primary-accent-light)', border: '1px solid var(--primary-accent-border)', borderRadius: '8px', padding: '14px 20px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={16} style={{ color: 'var(--primary-accent)' }} />
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>Llama 3.1 LLM Service</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--primary-accent)' }}>LangChain / Context-Aware Chat</span>
                </div>
              </div>

              {/* Firestore block */}
              <div className="flow-node" style={{ background: 'var(--primary-accent-light)', border: '1px solid var(--primary-accent-border)', borderRadius: '8px', padding: '14px 20px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={16} style={{ color: 'var(--primary-accent)' }} />
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>Firebase Cloud Firestore</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--primary-accent)' }}>Metadata Summaries / Chat Trails</span>
                </div>
              </div>

            </div>

            <div style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '520px', fontStyle: 'italic' }}>
              &ldquo;Juda operates under a clinical <strong>Zero-Disk Policy</strong>&mdash;datasets are aggregated for statistical summaries and visualizations, then discarded completely from memory, maintaining client privacy.&rdquo;
            </div>
          </div>
        </div>
      </section>

      {/* Creator / Social Section */}
      <section id="creator" style={{
        padding: '100px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-accent)' }}>Core Architect</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px', letterSpacing: '-0.03em' }}>Meet the Developer</h2>
        </div>

        {/* Premium Profile Card */}
        <div className="glass-panel" style={{
          maxWidth: '560px',
          margin: '0 auto',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '40px',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle profile gradient background */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'var(--accent-gradient)'
          }} />

          {/* Avatar frame */}
          <div>
            <img 
              src="https://avatars.githubusercontent.com/u/139033817?v=4" 
              alt="Debojit Roy Avatar"
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                border: '3px solid var(--primary-accent-light)',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.1)',
                objectFit: 'cover',
                marginBottom: '16px'
              }}
            />
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '6px' }}>Debojit Roy</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--primary-accent)', fontWeight: '600', marginBottom: '16px' }}>Applied AIML Engineer &amp; Full Stack Developer</p>
          
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '440px', margin: '0 auto 28px' }}>
            An Applied AI/ML Engineer focused on developing intelligent agents, data-driven tools, and backend systems that make models reliable and usable in real-world scenarios.
          </p>

          {/* Dynamic Social Badge Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {/* Email link */}
            <a 
              href="mailto:debojit94333@gmail.com"
              className="social-badge"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-accent)';
                e.currentTarget.style.background = 'var(--primary-accent-light)';
                e.currentTarget.style.color = 'var(--primary-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.background = 'var(--bg-main)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <MailIcon size={14} /> debojit94333@gmail.com
            </a>

            {/* LinkedIn link */}
            <a 
              href="https://www.linkedin.com/in/debojitroy001/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-badge"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-accent)';
                e.currentTarget.style.background = 'var(--primary-accent-light)';
                e.currentTarget.style.color = 'var(--primary-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.background = 'var(--bg-main)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <LinkedInIcon size={14} /> LinkedIn <ArrowUpRight size={12} style={{ opacity: 0.6 }} />
            </a>

            {/* GitHub link */}
            <a 
              href="https://github.com/night-spring"
              target="_blank"
              rel="noopener noreferrer"
              className="social-badge"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-accent)';
                e.currentTarget.style.background = 'var(--primary-accent-light)';
                e.currentTarget.style.color = 'var(--primary-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.background = 'var(--bg-main)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <GitHubIcon size={14} /> GitHub <ArrowUpRight size={12} style={{ opacity: 0.6 }} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer style={{
        background: '#FFFFFF',
        borderTop: '1px solid var(--border-color)',
        padding: '48px 40px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={16} style={{ color: 'var(--primary-accent)' }} />
              <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Juda.ai</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>© 2026 Juda.ai. All rights reserved. Zero-Disk in-memory privacy policy.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '24px', fontSize: '0.8rem', fontWeight: '500' }}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#architecture" className="nav-link">Architecture</a>
            <a href="#creator" className="nav-link">Developer</a>
          </div>
        </div>
      </footer>

      {/* Animation rules and local modifications styles */}
      <style>{`
        .nav-link {
          color: var(--text-secondary);
          font-size: 0.88rem;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .nav-link:hover {
          color: var(--text-primary);
        }
        .feature-icon-purple {
          color: var(--primary-accent);
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .flow-node {
          transition: all 0.2s ease-in-out;
        }
        .flow-node:hover {
          transform: scale(1.02);
          border-color: var(--primary-accent-border) !important;
          box-shadow: var(--shadow-md) !important;
        }
        .dashboard-preview-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 40px 80px -20px rgba(15, 23, 42, 0.12) !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .floating-glass-card {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
