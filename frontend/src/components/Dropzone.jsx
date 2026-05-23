import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function Dropzone({ onUploadSuccess, onActivateSandbox }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setUploadError('Only standard tabular CSV (.csv) files are supported for exploratory data profiling.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const response = await api.uploadCSV(file);
      onUploadSuccess(response);
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Server connection timed out or rejected file format.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{
      maxWidth: '640px',
      width: '100%',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Drop Zone Box */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className="glass-panel"
        style={{
          border: `2px dashed ${isDragActive ? 'var(--primary-accent)' : 'var(--border-color)'}`,
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragActive ? 'var(--primary-accent-light)' : 'var(--bg-card)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: 'var(--shadow-sm)'
        }}
        onMouseEnter={(e) => {
          if (!isUploading) {
            e.currentTarget.style.borderColor = 'var(--primary-accent)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isDragActive ? 'var(--primary-accent)' : 'var(--border-color)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }} 
          disabled={isUploading}
        />

        {isUploading ? (
          <div style={{ padding: '20px 0' }}>
            <div style={{
              position: 'relative',
              width: '64px',
              height: '64px',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-accent)'
            }}>
              <RefreshCw size={36} className="spin" style={{
                animation: 'spin 1.5s linear infinite'
              }} />
            </div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '8px', fontWeight: '600' }}>
              Parsing Dataset Summary Profile...
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '320px', margin: '0 auto' }}>
              Extracting columns, identifying data types, and plotting correlations in-memory.
            </p>
          </div>
        ) : (
          <div>
            {/* Minimal Icon */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-accent)'
            }}>
              <UploadCloud size={26} />
            </div>

            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '10px', fontWeight: '600' }}>
              Upload your CSV dataset
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
              Drag and drop your spreadsheet file here, or click to browse your local computer.
            </p>

            <span className="btn-secondary">
              Select CSV Spreadsheet
            </span>
          </div>
        )}
      </div>

      {/* Upload Error Display */}
      {uploadError && (
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          background: 'rgba(239, 68, 68, 0.04)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          padding: '16px 20px',
          borderRadius: '12px',
          color: 'var(--color-danger)',
          fontSize: '0.88rem',
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.92rem' }}>Failed to Profile CSV</strong>
            {uploadError}
          </div>
        </div>
      )}

      {/* Sandbox Entry and Quick-start Demo */}
      <div 
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          animation: 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{
            background: 'var(--primary-accent-light)',
            borderRadius: '8px',
            padding: '6px',
            color: 'var(--primary-accent)',
            display: 'flex'
          }}>
            <Sparkles size={16} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '2px' }}>
              Want to see the chat workspace immediately?
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Launch in simulated Sandbox Mode to experience all high-fidelity dialog structures.
            </p>
          </div>
        </div>
        <button 
          onClick={onActivateSandbox}
          className="btn-primary"
          style={{
            padding: '8px 16px',
            fontSize: '0.82rem',
            background: 'var(--primary-accent-light)',
            border: '1px solid var(--primary-accent-border)',
            color: 'var(--primary-accent)',
            boxShadow: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--primary-accent-light)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Activate Sandbox Mode
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
