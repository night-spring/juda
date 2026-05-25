import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Trash2, Bot, User, CornerDownLeft, AlertCircle, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api, getApiBaseUrl } from '../services/api';

// --- MOCK SANDBOX VISUALIZATION COMPONENTS (SVG) ---
function MockCorrelationHeatmap() {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="auto" style={{ maxHeight: '280px', borderRadius: '8px', background: '#FCFCFB', display: 'block', margin: '0 auto' }}>
      <rect width="400" height="300" rx="8" fill="#F8FAFC" />
      <text x="200" y="25" textAnchor="middle" fill="#0F172A" fontWeight="bold" fontSize="13">Correlation Heatmap (Mock Sandbox Mode)</text>
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

        <text x="-10" y="135" textAnchor="end" fill="#475569" fontSize="10" fontWeight="500">Spend</text>
        <rect x="0" y="110" width="50" height="50" fill="#FEE2E2" rx="4" />
        <text x="25" y="138" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">-0.15</text>
        
        <rect x="55" y="110" width="50" height="50" fill="#C7D2FE" rx="4" />
        <text x="80" y="138" textAnchor="middle" fill="#4338CA" fontSize="10" fontWeight="bold">0.42</text>
        
        <rect x="110" y="110" width="50" height="50" fill="#4F46E5" rx="4" />
        <text x="135" y="138" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">1.00</text>
        
        <rect x="165" y="110" width="50" height="50" fill="#FEF2F2" rx="4" />
        <text x="190" y="138" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">-0.09</text>

        <text x="-10" y="190" textAnchor="end" fill="#475569" fontSize="10" fontWeight="500">Churn</text>
        <rect x="0" y="165" width="50" height="50" fill="#FEF2F2" rx="4" />
        <text x="25" y="193" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">-0.05</text>
        
        <rect x="55" y="165" width="50" height="50" fill="#FEE2E2" rx="4" />
        <text x="80" y="193" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">-0.21</text>
        
        <rect x="110" y="165" width="50" height="50" fill="#FEF2F2" rx="4" />
        <text x="135" y="193" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">-0.09</text>
        
        <rect x="165" y="165" width="50" height="50" fill="#4F46E5" rx="4" />
        <text x="190" y="193" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">1.00</text>
        
        <text x="25" y="-10" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="500">Age</text>
        <text x="80" y="-10" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="500">Income</text>
        <text x="135" y="-10" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="500">Spend</text>
        <text x="190" y="-10" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="500">Churn</text>
      </g>
      
      <g transform="translate(305, 50)">
        <text x="15" y="10" fill="#475569" fontSize="9" fontWeight="bold">Legend</text>
        <rect x="15" y="20" width="12" height="12" fill="#4F46E5" rx="2" />
        <text x="32" y="29" fill="#475569" fontSize="9">1.0 (Pos)</text>
        <rect x="15" y="40" width="12" height="12" fill="#EEF2FF" rx="2" />
        <text x="32" y="49" fill="#475569" fontSize="9">0.0 (None)</text>
        <rect x="15" y="60" width="12" height="12" fill="#EF4444" rx="2" />
        <text x="32" y="69" fill="#475569" fontSize="9">-1.0 (Neg)</text>
      </g>
    </svg>
  );
}

function MockMissingValues() {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="auto" style={{ maxHeight: '280px', borderRadius: '8px', background: '#FCFCFB', display: 'block', margin: '0 auto' }}>
      <rect width="400" height="300" rx="8" fill="#F8FAFC" />
      <text x="200" y="25" textAnchor="middle" fill="#0F172A" fontWeight="bold" fontSize="13">Missing Values Count (Mock Sandbox Mode)</text>
      <line x1="80" y1="220" x2="350" y2="220" stroke="#E2E8F0" strokeWidth="1.5" />
      <line x1="80" y1="170" x2="350" y2="170" stroke="#F1F5F9" strokeDasharray="3 3" />
      <line x1="80" y1="120" x2="350" y2="120" stroke="#F1F5F9" strokeDasharray="3 3" />
      <line x1="80" y1="70" x2="350" y2="70" stroke="#F1F5F9" strokeDasharray="3 3" />
      <g>
        <rect x="110" y="70" width="45" height="150" fill="url(#crestGradient)" rx="4" />
        <text x="132.5" y="62" textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="bold">12</text>
        <text x="132.5" y="238" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="500">age</text>

        <rect x="220" y="170" width="45" height="50" fill="url(#crestGradient2)" rx="4" />
        <text x="242.5" y="162" textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="bold">4</text>
        <text x="242.5" y="238" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="500">spend_score</text>
      </g>
      <text x="70" y="223" textAnchor="end" fill="#94A3B8" fontSize="9">0</text>
      <text x="70" y="173" textAnchor="end" fill="#94A3B8" fontSize="9">4</text>
      <text x="70" y="123" textAnchor="end" fill="#94A3B8" fontSize="9">8</text>
      <text x="70" y="73" textAnchor="end" fill="#94A3B8" fontSize="9">12</text>
      <defs>
        <linearGradient id="crestGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
        <linearGradient id="crestGradient2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#A5B4FC" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function MockDistributions() {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="auto" style={{ maxHeight: '280px', borderRadius: '8px', background: '#FCFCFB', display: 'block', margin: '0 auto' }}>
      <rect width="400" height="300" rx="8" fill="#F8FAFC" />
      <text x="200" y="25" textAnchor="middle" fill="#0F172A" fontWeight="bold" fontSize="13">Numeric Distributions (Mock Sandbox Mode)</text>
      <g transform="translate(30, 50)">
        <rect width="160" height="210" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <text x="80" y="20" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="bold">Age Distribution</text>
        <path d="M 20,180 C 40,180 50,70 80,70 C 110,70 120,180 140,180" fill="rgba(79, 70, 229, 0.08)" stroke="#4F46E5" strokeWidth="2" />
        <rect x="25" y="160" width="10" height="20" fill="rgba(79, 70, 229, 0.2)" />
        <rect x="37" y="130" width="10" height="50" fill="rgba(79, 70, 229, 0.25)" />
        <rect x="49" y="100" width="10" height="80" fill="rgba(79, 70, 229, 0.3)" />
        <rect x="61" y="80" width="10" height="100" fill="rgba(79, 70, 229, 0.4)" />
        <rect x="73" y="75" width="10" height="105" fill="rgba(79, 70, 229, 0.4)" />
        <rect x="85" y="85" width="10" height="95" fill="rgba(79, 70, 229, 0.35)" />
        <rect x="97" y="110" width="10" height="70" fill="rgba(79, 70, 229, 0.3)" />
        <rect x="109" y="140" width="10" height="40" fill="rgba(79, 70, 229, 0.25)" />
        <rect x="121" y="165" width="10" height="15" fill="rgba(79, 70, 229, 0.2)" />
        <line x1="15" y1="180" x2="145" y2="180" stroke="#CBD5E1" strokeWidth="1" />
      </g>
      <g transform="translate(210, 50)">
        <rect width="160" height="210" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <text x="80" y="20" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="bold">Annual Income Dist</text>
        <path d="M 20,180 C 35,180 40,50 65,50 C 95,50 110,180 140,180" fill="rgba(16, 185, 129, 0.08)" stroke="#10B981" strokeWidth="2" />
        <rect x="25" y="150" width="10" height="30" fill="rgba(16, 185, 129, 0.2)" />
        <rect x="37" y="110" width="10" height="70" fill="rgba(16, 185, 129, 0.25)" />
        <rect x="49" y="70" width="10" height="110" fill="rgba(16, 185, 129, 0.3)" />
        <rect x="61" y="55" width="10" height="125" fill="rgba(16, 185, 129, 0.4)" />
        <rect x="73" y="65" width="10" height="115" fill="rgba(16, 185, 129, 0.4)" />
        <rect x="85" y="90" width="10" height="90" fill="rgba(16, 185, 129, 0.35)" />
        <rect x="97" y="120" width="10" height="60" fill="rgba(16, 185, 129, 0.3)" />
        <rect x="109" y="145" width="10" height="35" fill="rgba(16, 185, 129, 0.25)" />
        <rect x="121" y="165" width="10" height="15" fill="rgba(16, 185, 129, 0.2)" />
        <line x1="15" y1="180" x2="145" y2="180" stroke="#CBD5E1" strokeWidth="1" />
      </g>
    </svg>
  );
}

export default function ChatBot({ sessionId, datasetInfo, onDeleteSession }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const userQueryRef = useRef(null);
  const lastScrolledSessionIdRef = useRef(null);
  const loadedSessionIdRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const streamRef = useRef(null);

  // Scroll statically to bottom when switching sessions or when a new user query is added
  useEffect(() => {
    const currentSession = sessionId || 'sandbox';
    if (messages.length > 0 && streamRef.current && loadedSessionIdRef.current === currentSession) {
      const isSessionSwitch = lastScrolledSessionIdRef.current !== currentSession;
      
      // Only auto-scroll on new message addition if the message is from the human user
      const lastMessage = messages[messages.length - 1];
      const isNewHumanMessage = (messages.length > prevMessagesLengthRef.current) && (lastMessage?.role === 'human');

      if (isSessionSwitch || isNewHumanMessage) {
        const timer = setTimeout(() => {
          if (streamRef.current) {
            streamRef.current.scrollTop = streamRef.current.scrollHeight;
          }
        }, 100); // Small layout render delay to ensure images/plots have fully loaded
        
        if (isSessionSwitch) {
          lastScrolledSessionIdRef.current = currentSession;
        }
        prevMessagesLengthRef.current = messages.length;
        return () => clearTimeout(timer);
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, sessionId]);

  useEffect(() => {
    setShowConfirmClear(false);
    const loadChatHistory = async () => {
      if (sessionId) {
        setError(null);
        try {
          const history = await api.getChatHistory(sessionId);
          if (history && Array.isArray(history) && history.length > 0) {
            const formattedHistory = history.map(msg => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp || ''
            }));
            setMessages(formattedHistory);
            loadedSessionIdRef.current = sessionId;
            localStorage.setItem(`juda_chat_${sessionId}`, JSON.stringify(formattedHistory));
            return;
          }
        } catch (err) {
          console.warn("Failed to fetch chat history from backend, falling back to localStorage:", err);
        }

        // Fallback to localStorage or welcome message
        const savedHistory = localStorage.getItem(`juda_chat_${sessionId}`);
        if (savedHistory) {
          try {
            setMessages(JSON.parse(savedHistory));
          } catch (e) {
            setMessages([]);
          }
        } else {
          setMessages([
            {
              role: 'assistant',
              content: `👋 **Welcome to Juda AI Assistant!** I have successfully analyzed and indexed the metadata for \`${datasetInfo?.filename || 'your dataset'}\`. \n\nI operate under a strict **Zero-Disk Privacy Policy**—meaning your raw data was discarded immediately after computing summary statistics, and I only read the safe aggregated stats context. \n\nAsk me anything! For example, you can ask about correlations, missing values, data anomalies, or request clean-up code.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
        loadedSessionIdRef.current = sessionId;
      } else {
        setMessages([
          {
            role: 'assistant',
            content: `🤖 **Juda Sandbox Mode Active.** \n\nYou can upload a CSV to start analyzing your own data. In the meantime, feel free to ask me general questions about Exploratory Data Analysis (EDA), pandas data-cleaning patterns, or play with this mock interface!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        loadedSessionIdRef.current = 'sandbox';
      }
    };

    loadChatHistory();
  }, [sessionId, datasetInfo]);

  const saveChatHistory = (updatedMessages) => {
    if (sessionId) {
      localStorage.setItem(`juda_chat_${sessionId}`, JSON.stringify(updatedMessages));
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    if (!textToSend) setInput('');
    setError(null);

    const userMessage = {
      role: 'human',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveChatHistory(newMessages);
    setIsLoading(true);

    try {
      let replyText = '';
      
      if (sessionId) {
        const response = await api.chatWithData(sessionId, text);
        replyText = response.response;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        
        if (text.toLowerCase().includes('clean') || text.toLowerCase().includes('code')) {
          replyText = `Here is a premium Python snippet utilizing \`pandas\` to handle common data cleaning operations based on standard practices:
  
\`\`\`python
import pandas as pd
import numpy as np

def clean_dataset(df):
    # 1. Fill numeric missing values with median
    num_cols = df.select_dtypes(include=[np.number]).columns
    for col in num_cols:
        df[col].fillna(df[col].median(), inplace=True)
        
    # 2. Fill categorical missing values with mode
    cat_cols = df.select_dtypes(include=['object', 'category']).columns
    for col in cat_cols:
        df[col].fillna(df[col].mode()[0], inplace=True)
        
    # 3. Drop absolute duplicate rows
    df.drop_duplicates(inplace=True)
    
    return df
\`\`\`
  
In active mode, I would tailor this specifically to the column names and high-null rates detected in your custom uploaded dataset! Let me know if you would like me to explain any step.`;
        } else if (text.toLowerCase().includes('correlation') || text.toLowerCase().includes('relationship')) {
          replyText = `Analyzing correlations in a dataset helps identify linear associations between variables. 

In a real session, I scan the calculated **Pearson Correlation Matrix** and highlight:
1. **Strong Positive Associations** (value close to \`+1.0\`)
2. **Strong Negative Associations** (value close to \`-1.0\`)
3. **Multicollinearity Warnings** (features that correlate too highly, which might skew predictive models)

*Try uploading a CSV file to generate your customized correlation heatmap instantly!*`;
        } else {
          replyText = `🤖 **Greetings from the Juda AI Sandbox!** 
          
I received your query: *"${text}"*. 

To unlock full interactive analytics, upload a CSV dataset in the panel. This will let me read calculated profiles, summary stats, duplicate counts, and provide highly-personalized answers.

Is there any specific data science or machine learning question I can help you with in the meantime?`;
        }
      }

      const aiMessage = {
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedHistory = [...newMessages, aiMessage];
      setMessages(updatedHistory);
      saveChatHistory(updatedHistory);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to communicate with Juda AI assistant.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = async () => {
    setShowConfirmClear(false);

    if (sessionId) {
      if (onDeleteSession) {
        onDeleteSession(sessionId);
      } else {
        // Fallback
        setMessages([]);
        localStorage.removeItem(`juda_chat_${sessionId}`);
        try {
          await api.clearChatHistory(sessionId);
        } catch (err) {
          console.error("Failed to clear chat history:", err);
        }
      }
    } else {
      // Sandbox mode
      setMessages([]);
    }
  };

  const presetChips = [
    { label: '📊 Summarize Findings', text: 'Please summarize the most important insights and findings from this dataset summary.' },
    { label: '🔍 Quality & Missing Data', text: 'Are there any data quality issues, missing values, or duplicate records I should know about?' },
    { label: '📈 Major Correlations', text: 'Which columns share the strongest correlations or relationships, and what do they mean?' },
    { label: '🧹 Recommendation to Clean', text: 'Provide a step-by-step recommendation and Python script to clean and prepare this dataset.' }
  ];

  return (
    <div className="glass-panel chat-container" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden',
      position: 'relative',
      background: 'var(--bg-card)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      
      {/* Header */}
      <div className="chat-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        background: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'var(--primary-accent-light)',
            border: '1px solid var(--primary-accent-border)',
            borderRadius: '8px',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-accent)'
          }}>
            <Sparkles size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Juda AI Workspace
              {sessionId && <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--color-success)',
                boxShadow: '0 0 4px var(--color-success)'
              }} />}
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {sessionId ? `Active Session: ${sessionId.substring(0, 8)}...` : 'Sandbox Simulator Mode'}
            </p>
          </div>
        </div>

        {showConfirmClear ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-danger)', fontWeight: '600' }}>
              Delete chat from history?
            </span>
            <button 
              onClick={handleClearHistory}
              style={{
                background: 'var(--color-danger)',
                color: '#FFFFFF',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.95)'}
              onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
            >
              Confirm
            </button>
            <button 
              onClick={() => setShowConfirmClear(false)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-main)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          messages.length > 0 && (
            <button 
              onClick={() => setShowConfirmClear(true)}
              title="Clear Chat Logs"
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
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                e.currentTarget.style.color = 'var(--color-danger)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <Trash2 size={16} />
            </button>
          )
        )}
      </div>

      {/* Message Stream */}
      <div 
        ref={streamRef}
        className="chat-messages-stream" 
        style={{
        flex: 1,
        minHeight: 0,
        padding: '24px 20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        background: '#FCFCFB'
      }}>
        {messages.map((msg, index) => {
          const isAI = msg.role === 'assistant';
          const isUserQuery = !isAI && index === messages.length - 2;
          return (
            <div 
              key={index}
              ref={isUserQuery ? userQueryRef : null}
              style={{
                display: 'flex',
                gap: '12px',
                flexDirection: isAI ? 'row' : 'row-reverse',
                alignItems: 'flex-start',
                maxWidth: '85%',
                alignSelf: isAI ? 'flex-start' : 'flex-end',
                animation: 'fadeIn 0.3s ease-out'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: isAI ? 'var(--primary-accent-light)' : 'rgba(0, 0, 0, 0.02)',
                border: `1px solid ${isAI ? 'var(--primary-accent-border)' : 'var(--border-color)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isAI ? 'var(--primary-accent)' : 'var(--text-primary)',
                flexShrink: 0
              }}>
                {isAI ? <Bot size={14} /> : <User size={14} />}
              </div>

              {/* Bubble Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{
                  background: isAI ? 'var(--bg-card)' : 'var(--primary-accent-light)',
                  border: `1px solid ${isAI ? 'var(--border-color)' : 'var(--primary-accent-border)'}`,
                  padding: '12px 16px',
                  borderRadius: isAI ? '0px 12px 12px 12px' : '12px 0px 12px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div className="markdown-content">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: ({ src, alt, ...props }) => {
                          const isViz = src && (src.includes('/viz/image/') || src.includes('viz/image/'));
                          if (isViz) {
                            let plotType = '';
                            if (src.includes('correlation')) plotType = 'correlation';
                            else if (src.includes('missing_values')) plotType = 'missing_values';
                            else if (src.includes('distributions')) plotType = 'distributions';

                            const isMock = !sessionId || sessionId === 'sandbox';

                            if (isMock) {
                              return (
                                <div 
                                  className="viz-card"
                                  style={{
                                    background: '#FFFFFF',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    margin: '12px 0',
                                    boxShadow: 'var(--shadow-sm)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease-in-out'
                                  }}
                                  onClick={() => setLightboxImage({ isMock: true, mockType: plotType, alt })}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    e.currentTarget.style.borderColor = 'var(--primary-accent-border)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      📊 Sandbox Visualization
                                    </span>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                      Click to Zoom
                                    </span>
                                  </div>
                                  {plotType === 'correlation' && <MockCorrelationHeatmap />}
                                  {plotType === 'missing_values' && <MockMissingValues />}
                                  {plotType === 'distributions' && <MockDistributions />}
                                  <div style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                                    *Showing high-fidelity synthetic marketing data overview. Upload your CSV to see live data.*
                                  </div>
                                </div>
                              );
                            }

                            const baseUrl = getApiBaseUrl();
                            const relativePath = src.startsWith('/') ? src : `/${src}`;
                            const fullSrc = `${baseUrl}/api/v1${relativePath}`;

                            return (
                              <div 
                                className="viz-card"
                                style={{
                                  background: '#FFFFFF',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '8px',
                                  padding: '16px',
                                  margin: '12px 0',
                                  boxShadow: 'var(--shadow-sm)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease-in-out'
                                }}
                                onClick={() => setLightboxImage({ isMock: false, src: fullSrc, alt })}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                  e.currentTarget.style.borderColor = 'var(--primary-accent-border)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                  e.currentTarget.style.borderColor = 'var(--border-color)';
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    📈 Live Visualization
                                  </span>
                                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                    Click to Zoom
                                  </span>
                                </div>
                                <img 
                                  src={fullSrc} 
                                  alt={alt} 
                                  style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: '260px',
                                    borderRadius: '6px',
                                    objectFit: 'contain',
                                    background: '#F8FAFC'
                                  }} 
                                />
                              </div>
                            );
                          }
                          return <img src={src} alt={alt} {...props} />;
                        }
                      }}
                    >
                      {msg.content.replace(/{session_id}/g, sessionId || 'sandbox')}
                    </ReactMarkdown>
                  </div>
                </div>
                <span style={{ 
                  fontSize: '0.68rem', 
                  color: 'var(--text-muted)', 
                  alignSelf: isAI ? 'flex-start' : 'flex-end',
                  marginTop: '2px'
                }}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading / Typing Indicator */}
        {isLoading && (
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            alignSelf: 'flex-start',
            maxWidth: '85%'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              background: 'var(--primary-accent-light)',
              border: '1px solid var(--primary-accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-accent)'
            }}>
              <Bot size={14} />
            </div>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              padding: '10px 14px',
              borderRadius: '0px 12px 12px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span className="typing-dot" style={{ animationDelay: '0s' }} />
              <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
              <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
            background: 'rgba(239, 68, 68, 0.04)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            padding: '12px 16px',
            borderRadius: '10px',
            color: 'var(--color-danger)',
            fontSize: '0.88rem',
            margin: '10px 0'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Server Communication Error</strong>
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length <= 1 && (
        <div style={{
          padding: '12px 20px',
          background: '#FCFCFB',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <HelpCircle size={12} />
            Quick Exploration Chips
          </span>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {presetChips.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSend(chip.text)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-sans)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-accent)';
                  e.currentTarget.style.color = 'var(--primary-accent)';
                  e.currentTarget.style.background = 'var(--primary-accent-light)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'var(--bg-card)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Action Panel */}
      <div style={{
        padding: '16px 20px 20px',
        borderTop: '1px solid var(--border-color)',
        background: '#FFFFFF',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '10px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '8px 12px',
          position: 'relative',
          zIndex: 1,
          transition: 'all 0.25s',
          boxShadow: 'var(--shadow-sm)'
        }}
        onFocusCapture={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary-accent)';
          e.currentTarget.style.boxShadow = '0 0 0 1px var(--primary-accent-light)';
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={sessionId ? "Ask a question about this dataset..." : "Ask sandbox AI assistant a question..."}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              lineHeight: '1.4',
              padding: '6px 0',
              fontFamily: 'var(--font-sans)',
              maxHeight: '160px'
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 6px',
              background: 'var(--bg-main)',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              opacity: input.trim() ? 0.7 : 0
            }}>
              Enter <CornerDownLeft size={10} />
            </span>
            
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: input.trim() ? 'var(--primary-accent)' : 'rgba(0, 0, 0, 0.03)',
                color: input.trim() ? '#FFFFFF' : 'var(--text-muted)',
                border: 'none',
                cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: input.trim() ? '0 1px 2px rgba(79, 70, 229, 0.15)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (input.trim()) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.background = 'var(--primary-accent-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                if (input.trim()) {
                  e.currentTarget.style.background = 'var(--primary-accent)';
                }
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Instructions foot-info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          fontSize: '0.68rem',
          color: 'var(--text-muted)',
          padding: '0 4px'
        }}>
          <span>Shift + Enter for new line</span>
          <span>Privacy Guaranteed: Zero-Disk</span>
        </div>
      </div>

      {lightboxImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setLightboxImage(null)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%',
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              animation: 'zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#F1F5F9',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#F1F5F9'}
            >
              &times;
            </button>
            <div style={{ padding: '10px 0 0 0', width: '100%', display: 'flex', justifyContent: 'center' }}>
              {lightboxImage.isMock ? (
                <div style={{ width: '500px', maxWidth: '100%', height: 'auto' }}>
                  {lightboxImage.mockType === 'correlation' && <MockCorrelationHeatmap />}
                  {lightboxImage.mockType === 'missing_values' && <MockMissingValues />}
                  {lightboxImage.mockType === 'distributions' && <MockDistributions />}
                </div>
              ) : (
                <img 
                  src={lightboxImage.src} 
                  alt={lightboxImage.alt} 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    borderRadius: '8px',
                    objectFit: 'contain'
                  }} 
                />
              )}
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600', marginTop: '4px' }}>
              {lightboxImage.alt || 'Data Visualization'}
            </span>
          </div>
        </div>
      )}

      <style>{`
        .typing-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: var(--primary-accent);
          display: inline-block;
          animation: wave 1.2s infinite ease-in-out;
        }
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

    </div>
  );
}
