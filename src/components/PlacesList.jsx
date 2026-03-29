// src/components/PlacesList.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlacesList({ places, updateWeight }) {
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
            margin-bottom: 15px;
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
      <h2>📍 추천 장소 리스트</h2>
      <div id="placesList" style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
        <AnimatePresence>
          {places.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="place-card"
            >
              <h4>{p.name}</h4>
              <p className="cat">{p.category}</p>
              <div className="weight-control">
                <label>가중치:</label>
                <input 
                  type="range" 
                  min="1" max="10" 
                  value={p.weight}
                  onChange={(e) => updateWeight(p.id, parseInt(e.target.value))}
                />
                <span className="w-val" style={{color: 'var(--accent-neon)', fontWeight: 'bold'}}>
                  {p.weight}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style>{`
        .places-list-section {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          display: flex;
          flex-direction: column;
          min-height: 0;
          margin-bottom: 15px;
        }
        .places-list-section h2 {
          font-size: 1.1rem;
          margin-bottom: 15px;
          color: var(--accent-purple);
        }
        .place-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          padding: 12px;
          border-radius: 10px;
          transition: var(--transition-smooth);
        }
        .place-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(0, 240, 255, 0.3);
        }
        .place-card h4 {
          margin-bottom: 5px;
          font-size: 1rem;
        }
        .place-card p.cat {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .weight-control {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
        }
        input[type=range] {
          flex: 1;
          accent-color: var(--accent-neon);
        }
      `}</style>
    </section>
  );
}
