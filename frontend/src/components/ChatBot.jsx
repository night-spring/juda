import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Trash2, Bot, User, CornerDownLeft, AlertCircle, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../services/api';

export default function ChatBot({ sessionId, datasetInfo, onDeleteSession }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
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
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
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
      `}</style>

    </div>
  );
}
