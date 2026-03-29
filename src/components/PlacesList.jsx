import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlacesList({ places, updateWeight, onDelete, locatedPlaceId }) {
  // 특정 장소로 스크롤 이동 로직 추가
  useEffect(() => {
    if (locatedPlaceId) {
      const element = document.getElementById(`place-card-${locatedPlaceId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [locatedPlaceId]);
  if (places.length === 0) {
    return (
      <section className="places-list-section glass-panel">
        <h2>📍 추천 장소 리스트</h2>
        <div id="placesList">
          <p className="empty-state text-muted" style={{color: 'var(--text-secondary)'}}>
            AI 채팅을 통해 장소를 추천받아 보세요.
          </p>
        </div>
        <style>{`
          .places-list-section {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            display: flex;
            flex-direction: column;
            min-height: 0;
            margin-bottom: 0px;
          }
          .places-list-section h2 {
            font-size: 1.1rem;
            margin-bottom: 15px;
            color: var(--accent-purple);
          }
        `}</style>
      </section>
    );
  }

  return (
    <section className="places-list-section glass-panel">
      <h2>📍 여행지 목록 ({places.length})</h2>
      <div className="list-scroll-area">
        <AnimatePresence mode="popLayout">
          {places.map((p) => (
            <motion.div
              key={p.id}
              id={`place-card-${p.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                // 커지지 않고 테두리 광만 부드럽게 추가
                boxShadow: locatedPlaceId === p.id 
                  ? '0 0 15px rgba(0, 240, 255, 0.4)' 
                  : '0 0 0px rgba(0,240,255,0)'
              }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
              transition={{ duration: 0.25 }}
              className={`place-card ${locatedPlaceId === p.id ? 'highlighted' : ''}`}
            >
              <div className="card-header">
                <div className="title-group">
                  <h4>{p.name}</h4>
                  <div className="compact-info">
                    <span className="cat">{p.category}</span>
                    <div className="weight-control-slim">
                      <input 
                        type="range" 
                        min="1" max="10" 
                        value={p.weight}
                        onChange={(e) => updateWeight(p.id, parseInt(e.target.value))}
                      />
                      <span className="w-val">
                        {p.weight}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  className="delete-card-btn" 
                  onClick={() => onDelete(p.id)}
                  title="목록에서 삭제"
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style>{`
        .places-list-section {
          flex: 1;
          overflow: hidden;
          padding: 15px;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .places-list-section h2 {
          font-size: 1.1rem;
          margin-bottom: 20px;
          color: var(--accent-purple);
        }
        .list-scroll-area {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-right: 5px;
        }
        .list-scroll-area::-webkit-scrollbar { width: 4px; }
        .list-scroll-area::-webkit-scrollbar-thumb { background: rgba(189, 0, 255, 0.2); border-radius: 10px; }
        .place-card {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-backdrop);
          border: 1px solid var(--glass-border);
          padding: 10px 14px;
          border-radius: 12px;
          transition: all 0.3s ease;
          position: relative;
          box-shadow: var(--glass-shadow);
        }
        .place-card.highlighted {
          border-color: var(--accent-neon) !important;
          background: rgba(0, 240, 255, 0.1) !important;
          animation: pulseHighlight 2.5s ease;
        }
        @keyframes pulseHighlight {
          0% { border-color: var(--accent-neon); box-shadow: 0 0 0px var(--accent-neon); }
          30% { border-color: var(--accent-neon); box-shadow: 0 0 20px var(--accent-neon); }
          100% { border-color: var(--glass-border); box-shadow: 0 0 0px var(--accent-neon); }
        }
        .place-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(0, 240, 255, 0.3);
          transform: translateX(4px);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .title-group {
          flex: 1;
        }
        .place-card h4 {
          font-size: 0.95rem;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .compact-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .place-card span.cat {
          font-size: 0.72rem;
          color: var(--text-secondary);
          white-space: nowrap;
        }
        .weight-control-slim {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .delete-card-btn {
          background: none;
          border: none;
          color: rgba(255, 107, 107, 0.4);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
          margin-left: 10px;
        }
        .delete-card-btn:hover {
          background: rgba(255, 107, 107, 0.15);
          color: #ff6b6b;
        }
        .w-val {
          color: var(--accent-neon);
          font-weight: 700;
          font-size: 0.8rem;
          min-width: 14px;
          text-align: center;
        }
        input[type=range] {
          flex: 1;
          accent-color: var(--accent-neon);
          height: 3px;
          cursor: pointer;
        }
      `}</style>
    </section>
  );
}
