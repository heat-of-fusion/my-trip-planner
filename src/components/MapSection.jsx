// src/components/MapSection.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Marker, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { runWeightedKMeans } from '../utils/clustering';

// 마커 바운더리 자동 피팅 훅
function FitBounds({ places }) {
  const map = useMap();
  useEffect(() => {
    if (places.length > 0) {
      const group = new L.featureGroup();
      places.forEach(p => {
        group.addLayer(L.marker([p.lat, p.lng]));
      });
      if (group.getBounds().isValid()) {
        map.flyToBounds(group.getBounds(), { padding: [50, 50], duration: 1.5 });
      }
    }
  }, [places, map]);
  return null;
}

export default function MapSection({ places, onOpenSettings }) {
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    if (places.length > 0) {
      setClusters(runWeightedKMeans(places));
    } else {
      setClusters([]);
    }
  }, [places]);

  const centerIcon = L.divIcon({
    html: `<div style="background:var(--accent-purple); width:20px; height:20px; border-radius:50%; border:2px solid white; box-shadow: 0 0 10px var(--accent-purple);"></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  return (
    <section className="map-section" style={{ position: 'relative', height: '100%' }}>
      <MapContainer 
        center={[37.5665, 126.9780]} 
        zoom={11} 
        zoomControl={false}
        style={{ height: '100%', width: '100%', background: '#242424' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />
        
        {/* 장소 개별 마커 */}
        {places.map(p => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={Math.max(5, p.weight * 1.5)}
            pathOptions={{ color: '#00f0ff', fillColor: '#00f0ff', fillOpacity: 0.6, weight: 2 }}
          >
            <Popup>
              <b>{p.name}</b><br/>카테고리: {p.category}<br/>가중치: {p.weight}
            </Popup>
          </CircleMarker>
        ))}

        {/* 클러스터 중심점 및 폴리곤 */}
        {clusters.map((c, idx) => (
          <React.Fragment key={idx}>
            <Marker position={[c.centroid.lat, c.centroid.lng]} icon={centerIcon}>
              <Popup><b>클러스터 중심</b><br/>포함 장소: {c.points.length}개</Popup>
            </Marker>
            
            {c.points.length > 1 && (
              <Polygon 
                positions={[...c.points.map(p => [p.lat, p.lng]), [c.centroid.lat, c.centroid.lng]]}
                pathOptions={{ color: '#bd00ff', weight: 1, fillOpacity: 0.1, dashArray: '5, 5' }}
              />
            )}
          </React.Fragment>
        ))}

        <FitBounds places={places} />
      </MapContainer>

      {/* 오버레이 뷰 (좌상단 표) */}
      <div className="map-overlay-table glass-panel">
        <h3>📌 장소 요약 ({places.length}개)</h3>
        <table>
          <thead>
            <tr>
              <th>장소명</th>
              <th>카테고리</th>
              <th>가중치</th>
            </tr>
          </thead>
          <tbody>
            {places.map(p => (
              <tr key={`tbl-${p.id}`}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td style={{color: 'var(--accent-neon)', fontWeight: 'bold'}}>{p.weight}</td>
              </tr>
            ))}
            {places.length === 0 && (
              <tr>
                <td colSpan="3" style={{textAlign: 'center', opacity: 0.5}}>장소가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 우상단 버튼 */}
      <button className="glass-btn floating-btn" onClick={onOpenSettings}>
        ⚙️ 설정
      </button>

      <style>{`
        .map-overlay-table {
          position: absolute;
          top: 20px;
          left: 60px; /* To avoid Leaflet zoom controls if enabled */
          z-index: 1000;
          padding: 15px;
          width: 320px;
          max-height: 40vh;
          overflow-y: auto;
          pointer-events: auto;
        }
        .map-overlay-table h3 { font-size: 1rem; margin-bottom: 10px; color: var(--accent-neon); }
        table { width: 100%; border-collapse: collapse; font-size: 0.85rem; color: var(--text-primary); }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
        th { color: var(--text-secondary); font-weight: 600; }
        .floating-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 1000;
        }
        /* Leaflet internal override */
        .leaflet-popup-content-wrapper {
            background: var(--glass-bg) !important;
            backdrop-filter: var(--glass-backdrop) !important;
            color: var(--text-primary) !important;
            border: 1px solid var(--glass-border);
            border-radius: 10px !important;
        }
        .leaflet-popup-tip { background: var(--glass-bg) !important; }
      `}</style>
    </section>
  );
}
