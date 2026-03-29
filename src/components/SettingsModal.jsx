// src/components/SettingsModal.jsx
import React, { useState } from 'react';

export default function SettingsModal({ settings, setSettings, onClose }) {
  const [localKey, setLocalKey] = useState(settings.apiKey);
  const [localModel, setLocalModel] = useState(settings.model);
  const [localSearch, setLocalSearch] = useState(settings.useSearch);

  const handleSave = () => {
    setSettings({
      apiKey: localKey,
      model: localModel,
      useSearch: localSearch
    });
    onClose();
  };

  return (
    <dialog open className="glass-modal" style={{ position: 'absolute', zIndex: 9999 }}>
      <div className="modal-content">
        <h2>환경 설정</h2>
        <div className="form-group">
          <label>Google Gemini API Key</label>
          <input 
            type="password" 
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            placeholder="AI Studio에서 발급받은 키 입력" 
          />
        </div>
        <div className="form-group">
          <label>모델 선택 (3.1 전용)</label>
          <select value={localModel} onChange={(e) => setLocalModel(e.target.value)}>
            <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite</option>
            <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (고급)</option>
          </select>
        </div>
        <div className="form-group row">
          <label>Google Search Retrieval 사용</label>
          <input 
            type="checkbox" 
            checked={localSearch}
            onChange={(e) => setLocalSearch(e.target.checked)}
          />
        </div>
        <div className="modal-actions">
          <button onClick={handleSave} className="primary-btn">저장 및 닫기</button>
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
          width: 350px;
        }
        .form-group {
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .form-group.row {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
        .form-group input[type="password"],
        .form-group select {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          padding: 8px 12px;
          border-radius: 6px;
          outline: none;
        }
        .modal-actions {
          margin-top: 25px;
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </dialog>
  );
}
