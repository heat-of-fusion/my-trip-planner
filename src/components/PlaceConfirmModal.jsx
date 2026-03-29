// src/components/PlaceConfirmModal.jsx (REFRESHED V2)
import React, { useState, useEffect } from 'react';

export default function PlaceConfirmModal({ pendingPlaces, onConfirm }) {
  const [placeStates, setPlaceStates] = useState({});
  const [hoveredPlace, setHoveredPlace] = useState(null);

  useEffect(() => {
    const initialStates = {};
    pendingPlaces.forEach(p => { initialStates[p.id] = 'ignore'; });
    setPlaceStates(initialStates);
    setHoveredPlace(null);
  }, [pendingPlaces]);

  if (!pendingPlaces || pendingPlaces.length === 0) return null;

  const handleStateChange = (id, newState) => {
    setPlaceStates(prev => ({
      ...prev,
      [id]: prev[id] === newState ? 'ignore' : newState
    }));
  };

  const handleSubmit = () => {
    const confirmed = pendingPlaces.filter(p => placeStates[p.id] === 'confirm');
    const rejected = pendingPlaces.filter(p => placeStates[p.id] === 'reject');
    onConfirm(confirmed, rejected);
  };

  const handleRejectAll = () => {
    const allRejected = {};
    pendingPlaces.forEach(p => { allRejected[p.id] = 'reject'; });
    setPlaceStates(allRejected);
  };

  return (
    <div className="modal-overlay-v2" onClick={handleSubmit}>
      <div className="confirm-modal-premium" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="v-label">V.2.0</span>
          <h2>📍 추천 장소 정밀 결정</h2>
          <p className="subtitle">
            <b>체크박스는 삭제되었습니다.</b> 각 장소 우측의 <b>V(확정)</b> 또는 <b>X(거부)</b>를 눌러주세요.
          </p>
        </div>

        <div className="modal-body">
          <div className="list-container">
            <ul className="place-selection-list">
              {pendingPlaces.map(p => {
                const state = placeStates[p.id] || 'ignore';
                return (
                  <li 
                    key={p.id} 
                    className={`selection-item state-${state}`}
                    onMouseEnter={() => setHoveredPlace(p)}
                  >
                    <div className="item-content">
                      <div className="place-info">
                        <span className="name">{p.name}</span>
                        <span className="category">{p.category}</span>
                      </div>
                      <div className="button-group">
                        <button 
                          className={`btn-state btn-v ${state === 'confirm' ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); handleStateChange(p.id, 'confirm'); }}
                        >
                          V
                        </button>
                        <button 
                          className={`btn-state btn-x ${state === 'reject' ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); handleStateChange(p.id, 'reject'); }}
                        >
                          X
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="detail-preview">
            {hoveredPlace ? (
              <div className="detail-box fade-in">
                <h3>{hoveredPlace.name}</h3>
                <span className="badge">{hoveredPlace.category}</span>
                <p>{hoveredPlace.description}</p>
                <div className="current-status">
                  결정: <span className={`status-${placeStates[hoveredPlace.id]}`}>
                    {placeStates[hoveredPlace.id] === 'confirm' ? '확제(Confirm)' : 
                     placeStates[hoveredPlace.id] === 'reject' ? '거절(Reject)' : '미정(Ignore)'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="empty-preview">장소에 마우스를 올리세요.</div>
            )}
          </div>
        </div>

        <div className="modal-bottom-actions">
          <button onClick={handleRejectAll} className="secondary-action">전체 거부 (Discard All)</button>
          <button onClick={handleSubmit} className="primary-action pulse">선택 사항 적용</button>
        </div>

        <style>{`
          .modal-overlay-v2 {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
          }
          .confirm-modal-premium {
            background: var(--glass-bg); 
            backdrop-filter: var(--glass-backdrop);
            border: 1px solid var(--glass-border); 
            border-radius: 24px;
            padding: 30px; width: 850px; max-width: 95vw; display: flex; flex-direction: column;
            box-shadow: var(--glass-shadow); position: relative;
          }
          .v-label { position: absolute; top: 15px; left: 20px; font-size: 0.6rem; color: rgba(255,255,255,0.2); letter-spacing: 2px; }
          .modal-header h2 { text-align: center; color: var(--accent-neon); margin-bottom: 8px; font-size: 1.6rem; }
          .subtitle { text-align: center; font-size: 0.85rem; color: #888; margin-bottom: 25px; }
          .modal-body { display: flex; gap: 20px; margin-bottom: 25px; height: 450px; }
          .list-container { flex: 1.3; overflow-y: auto; padding-right: 10px; }
          .list-container::-webkit-scrollbar { width: 4px; }
          .list-container::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.2); border-radius: 10px; }
          .place-selection-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
          .selection-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 12px 18px; transition: 0.2s; }
          .selection-item.state-confirm { border-color: var(--accent-neon); background: rgba(0,240,255,0.05); }
          .selection-item.state-reject { border-color: #ff6b6b; background: rgba(255,107,107,0.05); }
          .item-content { display: flex; justify-content: space-between; align-items: center; }
          .place-info { display: flex; flex-direction: column; }
          .place-info .name { font-weight: 700; font-size: 1rem; color: #eee; }
          .place-info .category { font-size: 0.75rem; color: #666; }
          .button-group { display: flex; gap: 10px; }
          .btn-state { width: 38px; height: 38px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: #222; color: #888; cursor: pointer; font-weight: 800; transition: 0.2s; }
          .btn-v:hover, .btn-v.active { border-color: var(--accent-neon); color: var(--accent-neon); background: rgba(0,240,255,0.1); }
          .btn-v.active { background: var(--accent-neon) !important; color: #000 !important; }
          .btn-x:hover, .btn-x.active { border-color: #ff6b6b; color: #ff6b6b; background: rgba(255,107,107,0.1); }
          .btn-x.active { background: #ff6b6b !important; color: #000 !important; }
          .detail-preview { flex: 0.7; background: rgba(0,0,0,0.2); border-radius: 18px; padding: 25px; display: flex; align-items: center; justify-content: center; text-align: center; }
          .detail-box h3 { color: var(--accent-neon); margin-bottom: 10px; }
          .badge { display: inline-block; padding: 4px 10px; background: rgba(255,255,255,0.05); border-radius: 6px; font-size: 0.7rem; color: #888; margin-bottom: 15px; }
          .detail-box p { font-size: 0.9rem; line-height: 1.6; color: #bbb; }
          .current-status { margin-top: 20px; font-size: 0.8rem; color: #666; }
          .status-confirm { color: var(--accent-neon); font-weight: 900; }
          .status-reject { color: #ff6b6b; font-weight: 900; }
          .modal-bottom-actions { display: flex; justify-content: space-between; align-items: center; }
          .secondary-action { background: none; border: 1px solid #444; color: #888; padding: 12px 25px; border-radius: 12px; cursor: pointer; transition: 0.2s; }
          .secondary-action:hover { border-color: #ff6b6b; color: #ff6b6b; }
          .primary-action { background: var(--accent-neon); color: #000; border: none; padding: 12px 40px; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 1rem; }
          .pulse { animation: pulseGlow 2s infinite; }
          @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(0,240,255,0.4); } 70% { box-shadow: 0 0 20px 10px rgba(0,240,255,0); } 100% { box-shadow: 0 0 0 0 rgba(0,240,255,0); } }
        `}</style>
      </div>
    </div>
  );
}
