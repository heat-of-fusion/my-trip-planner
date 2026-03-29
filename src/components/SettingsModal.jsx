// src/components/SettingsModal.jsx
import React, { useState, useEffect } from 'react';

export default function SettingsModal({ settings, setSettings, onClose, onResetData }) {
  const [localKey, setLocalKey] = useState(settings.apiKey);
  const [localModel, setLocalModel] = useState(settings.model);
  const [localSearch, setLocalSearch] = useState(settings.useSearch);
  const [localSplit, setLocalSplit] = useState(settings.splitDirection || 'vertical');
  
  // API 키 검증 상태
  const [keyStatus, setKeyStatus] = useState('idle'); // 'idle' | 'checking' | 'valid' | 'invalid'
  const [keyError, setKeyError] = useState('');

  // API 키 입력 시 즉시 유효성 검사 (디바운스 적용)
  useEffect(() => {
    if (!localKey) {
      setKeyStatus('idle');
      return;
    }
    if (!localKey.startsWith('AIza')) {
      setKeyStatus('invalid');
      setKeyError('올바른 Gemini API 키 형식이 아닙니다.');
      return;
    }

    const timer = setTimeout(async () => {
      setKeyStatus('checking');
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${localKey}`);
        if (res.ok) {
          setKeyStatus('valid');
          setKeyError('');
        } else {
          const err = await res.json();
          setKeyStatus('invalid');
          setKeyError(err.error?.message || '유효하지 않은 키입니다.');
        }
      } catch (e) {
        setKeyStatus('invalid');
        setKeyError('네트워크 오류가 발생했습니다.');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localKey]);

  const handleSave = () => {
    setSettings({
      apiKey: localKey,
      model: localModel,
      useSearch: localSearch,
      splitDirection: localSplit
    });
    onClose();
  };

  return (
    <dialog open className="glass-modal" style={{ position: 'absolute', zIndex: 9999 }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>⚙️ 환경 설정</h2>
          <button className="close-x" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              Google Gemini API Key
              <span className={`status-badge ${keyStatus}`}>
                {keyStatus === 'checking' && '⏳ 확인 중...'}
                {keyStatus === 'valid' && '✅ 유효함'}
                {keyStatus === 'invalid' && '❌ 불허됨'}
              </span>
            </label>
            <input 
              type="password" 
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="API 키를 입력하세요..." 
              className={keyStatus === 'invalid' ? 'error' : ''}
            />
            {keyError && <span className="error-text">{keyError}</span>}
          </div>
          <div className="form-group">
            <label>모델 선택 (3.1 전용)</label>
            <select value={localModel} onChange={(e) => setLocalModel(e.target.value)}>
              <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite</option>
              <option value="gemini-3.1-flash-preview">Gemini 3.1 Flash</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (강력 추천)</option>
            </select>
          </div>
          <div className="form-group checkbox-group">
            <label>Google Search Retrieval 사용</label>
            <input 
              type="checkbox" 
              checked={localSearch}
              onChange={(e) => setLocalSearch(e.target.checked)}
            />
          </div>
          <div className="form-group">
            <label>목록 ↔ 채팅창 분할 방향</label>
            <select value={localSplit} onChange={(e) => setLocalSplit(e.target.value)}>
              <option value="vertical">상/하 분할</option>
              <option value="horizontal">좌/우 분할</option>
            </select>
          </div>

          <div className="danger-zone">
            <p>위험 구역</p>
            <button className="reset-btn" onClick={onResetData}>
              🗑️ 모든 여행 데이터 초기화
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="glass-btn">취소</button>
          <button onClick={handleSave} className="primary-btn" disabled={keyStatus === 'invalid'}>설정 저장</button>
        </div>
      </div>
      
      <style>{`
        .glass-modal {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          margin: 0;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-backdrop);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          border-radius: 16px;
          color: var(--text-primary);
          padding: 25px;
          width: 380px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .close-x {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .form-group {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .checkbox-group {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .status-badge {
          font-size: 0.75rem;
        }
        .status-badge.valid { color: #4ade80; }
        .status-badge.invalid { color: #f87171; }
        .status-badge.checking { color: #fbbf24; }

        .form-group input[type="password"],
        .form-group select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          padding: 10px 14px;
          border-radius: 10px;
          outline: none;
          font-family: inherit;
        }
        .form-group input.error {
          border-color: #ff6b6b;
          background: rgba(255, 107, 107, 0.05);
        }
        .error-text {
          font-size: 0.7rem;
          color: #ff6b6b;
        }
        
        .danger-zone {
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
        }
        .danger-zone p {
          font-size: 0.75rem;
          color: #ff6b6b;
          margin-bottom: 10px;
          font-weight: bold;
        }
        .reset-btn {
          width: 100%;
          padding: 10px;
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          color: #ff6b6b;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .reset-btn:hover {
          background: rgba(255, 107, 107, 0.2);
        }
        
        .modal-actions {
          margin-top: 30px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
      `}</style>
    </dialog>
  );
}

