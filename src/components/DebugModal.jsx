// src/components/DebugModal.jsx
import React, { useEffect } from 'react';

export default function DebugModal({ debugData, onClose }) {
  // ESC 키로 닫기 지원
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!debugData) return null;

  return (
    <div className="debug-overlay" onClick={onClose}>
      <div className="debug-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔍 프롬프트 디버그 정보</h2>
          <button className="close-x" onClick={onClose}>&times;</button>
        </div>
        
        <div className="debug-body">
          <div className="debug-section">
            <label>📡 최종 시스템 지침 (System Instruction)</label>
            <div className="code-container">
              <pre className="code-block prompt-text">{debugData.sentPrompt || "정보 없음"}</pre>
            </div>
          </div>
          
          <div className="debug-section">
            <label>📦 전송된 전체 데이터 구조 (Raw Parts)</label>
            <div className="code-container json-container">
              <pre className="code-block json-text">
                {JSON.stringify(debugData.parts, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="primary-btn">확인 및 닫기</button>
        </div>
      </div>
      
      <style>{`
        .debug-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .debug-modal {
          width: 800px;
          max-width: 90vw;
          max-height: 85vh;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-backdrop);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          padding: 30px;
          display: flex;
          flex-direction: column;
          border-radius: 20px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 15px;
        }
        .modal-header h2 {
          font-size: 1.25rem;
          color: var(--accent-neon);
          letter-spacing: -0.5px;
        }
        .close-x {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 1.8rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .close-x:hover {
          color: #ff6b6b;
        }
        .debug-body {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 20px;
          padding-right: 10px;
        }
        .debug-section {
          margin-bottom: 25px;
        }
        .debug-section label {
          display: block;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .code-container {
          background: #0d0d0d;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
        }
        .code-block {
          margin: 0;
          padding: 20px;
          font-family: 'Fira Code', 'Consolas', monospace;
          font-size: 0.85rem;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .prompt-text {
          color: #4ade80; /* 초록색 포인트 */
        }
        .json-text {
          color: #60a5fa; /* 파란색 포인트 */
        }
        .debug-body::-webkit-scrollbar {
          width: 5px;
        }
        .debug-body::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}
