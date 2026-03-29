// src/components/PlaceConfirmModal.jsx
import React, { useState, useEffect } from 'react';

export default function PlaceConfirmModal({ pendingPlaces, onConfirm }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [hoveredPlace, setHoveredPlace] = useState(null);

  useEffect(() => {
    setSelectedIds([]);
    setHoveredPlace(null);
  }, [pendingPlaces]);

  if (!pendingPlaces || pendingPlaces.length === 0) return null;

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleConfirm = () => {
    const selected = pendingPlaces.filter(p => selectedIds.includes(p.id));
    const rejected = pendingPlaces.filter(p => !selectedIds.includes(p.id));
    onConfirm(selected, rejected);
  };

  const handleRejectAll = () => {
    onConfirm([], pendingPlaces);
  };

  return (
    <dialog open className="glass-modal">
      <div className="modal-header">
        <h2>📍 추천 장소 확인</h2>
        <p className="subtitle">
          추가할 장소를 선택해 주세요.
        </p>
      </div>

      <div className="modal-body">
        {/* 리스트 패널 (좌측) */}
        <div className="list-pane">
          <ul className="confirm-list">
            {pendingPlaces.map(p => (
              <li 
                key={p.id} 
                className={`confirm-item ${selectedIds.includes(p.id) ? 'selected' : ''}`}
                onMouseEnter={() => setHoveredPlace(p)}
                onMouseLeave={() => setHoveredPlace(null)}
              >
                <label>
                  <div className="checkbox-wrapper">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(p.id)} 
                      onChange={() => toggleSelection(p.id)}
                    />
                  </div>
                  <div className="info">
                    <strong>{p.name}</strong>
                    <span className="cat">{p.category}</span>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* 상세 설명 뷰어 패널 (우측 팝업 느낌 고정 공간) */}
        <div className="detail-pane">
          {hoveredPlace ? (
            <div className="detail-content fade-in">
              <h3>{hoveredPlace.name}</h3>
              <span className="cat-badge">{hoveredPlace.category}</span>
              <p className="desc-text">{hoveredPlace.description || '상세 설명이 추가되지 않은 장소입니다.'}</p>
            </div>
          ) : (
            <div className="empty-detail fade-in">
              장소 목록에 마우스를<br/>올려 상세 정보를 확인하세요.
            </div>
          )}
        </div>
      </div>

      <div className="modal-actions">
        <button onClick={handleRejectAll} className="glass-btn" style={{marginRight: '10px'}}>
          모두 버리기
        </button>
        <button onClick={handleConfirm} className="primary-btn">
          선택한 장소 추가
        </button>
      </div>
      
      <style>{`
        .glass-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9999;
          margin: 0;
          background: rgba(22, 22, 25, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          border-radius: 16px;
          color: #f0f0f0;
          padding: 30px;
          width: 700px; /* 기존보다 넓게 2분할 레이아웃 적용 */
          max-width: 95vw;
        }

        .modal-header h2 {
          margin-top: 0;
          margin-bottom: 8px;
          font-size: 1.3rem;
          color: var(--accent-neon);
          text-align: center;
        }

        .subtitle {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        /* 2-Pane 레이아웃 구성 */
        .modal-body {
          display: flex;
          gap: 20px;
          margin-bottom: 25px;
        }

        /* 좌측 리스트 공간 */
        .list-pane {
          flex: 1.2;
        }

        .confirm-list {
          list-style: none;
          max-height: 40vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-right: 8px;
        }

        .confirm-list::-webkit-scrollbar { width: 6px; }
        .confirm-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }

        .confirm-item {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        
        .confirm-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .confirm-item.selected {
          background: rgba(0, 240, 255, 0.1);
          border-color: rgba(0, 240, 255, 0.4);
        }

        .confirm-item label {
          display: flex;
          align-items: center;
          gap: 15px;
          cursor: pointer;
          padding: 12px 16px;
          width: 100%;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* 커스텀 체크박스 스타일링 */
        .checkbox-wrapper input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          background-color: transparent;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .checkbox-wrapper input[type="checkbox"]:hover {
          border-color: rgba(255, 255, 255, 0.6);
        }

        .checkbox-wrapper input[type="checkbox"]:checked {
          background-color: var(--accent-neon);
          border-color: var(--accent-neon);
        }

        /* 체크 표시 (CSS 드로잉) */
        .checkbox-wrapper input[type="checkbox"]:checked::after {
          content: '';
          position: absolute;
          width: 4px;
          height: 10px;
          border: solid #000;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
          margin-top: -3px;
        }

        .confirm-item .info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .confirm-item strong {
          font-size: 1rem;
          color: #fff;
        }

        .confirm-item .cat {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        /* 우측 상세정보 뷰어 공간 */
        .detail-pane {
          flex: 0.8;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .fade-in {
          animation: fadeIn 0.3s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .empty-detail {
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .detail-content h3 {
          margin-top: 0;
          color: var(--accent-neon);
          margin-bottom: 8px;
          font-size: 1.15rem;
        }

        .cat-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          margin-bottom: 12px;
        }

        .desc-text {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.6;
        }

        .modal-actions {
          display: flex;
          justify-content: center;
        }
      `}</style>
    </dialog>
  );
}
