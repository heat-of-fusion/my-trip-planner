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

// 패널 리사이징 시 Leaflet 맵 타일 깨짐 방지 훅
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    const container = map.getContainer();
    if(container) observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

// 클러스터 줌인 및 마커 렌더링을 위한 서브 컴포넌트
function ClusterMarker({ cluster }) {
  const map = useMap();
  
  const handleClusterClick = () => {
    if (cluster.points.length > 0) {
      const bounds = L.latLngBounds(cluster.points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
    }
  };

  const createCenterIcon = (count) => L.divIcon({
    html: `
      <div style="
        background: var(--accent-purple); 
        width: 24px; 
        height: 24px; 
        border-radius: 50%; 
        border: 2px solid white; 
        box-shadow: 0 0 15px rgba(189, 0, 255, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 11px;
        font-weight: bold;
        font-family: sans-serif;
        cursor: pointer;
      ">
        ${count}
      </div>
    `,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <React.Fragment>
      <Marker 
        position={[cluster.centroid.lat, cluster.centroid.lng]} 
        icon={createCenterIcon(cluster.points.length)}
        eventHandlers={{ click: handleClusterClick }}
      >
        <Popup><b>클러스터 중심 (Click to Zoom)</b><br/>포함 장소: {cluster.points.length}개</Popup>
      </Marker>
      
      {cluster.points.length > 1 && (
        <Polygon 
          positions={[...cluster.points.map(p => [p.lat, p.lng]), [cluster.centroid.lat, cluster.centroid.lng]]}
          pathOptions={{ color: '#bd00ff', weight: 1, fillOpacity: 0.1, dashArray: '5, 5' }}
        />
      )}
    </React.Fragment>
  );
}

export default function MapSection({ places, onOpenSettings, onDeletePlace, onLocatePlace }) {
  const [clusters, setClusters] = useState([]);
  const [activeK, setActiveK] = useState(3);
  const [elbowData, setElbowData] = useState([]);

  useEffect(() => {
    if (places.length > 0) {
      // 1. 현재 선택된 k값으로 클러스터링 실행
      const result = runWeightedKMeans(places, activeK);
      setClusters(result.clusters);

      // 2. 엘보우 데이터를 위한 k=1~10 계산
      const data = [];
      const maxK = Math.min(places.length, 10);
      for (let i = 1; i <= maxK; i++) {
        const r = runWeightedKMeans(places, i);
        data.push({ k: i, inertia: r.inertia });
      }
      setElbowData(data);
    } else {
      setClusters([]);
      setElbowData([]);
    }
  }, [places, activeK]);

  const createCenterIcon = (count) => L.divIcon({
    html: `
      <div style="
        background: var(--accent-purple); 
        width: 24px; 
        height: 24px; 
        border-radius: 50%; 
        border: 2px solid white; 
        box-shadow: 0 0 15px rgba(189, 0, 255, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 11px;
        font-weight: bold;
        font-family: sans-serif;
      ">
        ${count}
      </div>
    `,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  // SVG 엘보우 플롯 렌더링 함수
  const renderElbowPlot = () => {
    if (elbowData.length < 2) return null;
    const padding = 20;
    const width = 260;
    const height = 120;
    const maxInertia = Math.max(...elbowData.map(d => d.inertia));
    const minInertia = Math.min(...elbowData.map(d => d.inertia));
    
    // 좌표 변환 함수
    const getX = (k) => padding + ((k - 1) / (elbowData.length - 1)) * (width - 2 * padding);
    const getY = (ine) => {
        if (maxInertia === minInertia) return height / 2;
        return height - padding - ((ine - minInertia) / (maxInertia - minInertia)) * (height - 2 * padding);
    };

    const points = elbowData.map(d => `${getX(d.k)},${getY(d.inertia)}`).join(' ');

    return (
      <div className="elbow-analysis">
        <h4>📊 클러스터 최적화 (Elbow Plot)</h4>
        <div className="chart-container">
          <svg width={width} height={height}>
            {/* 배경 가이드 라인 */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" />
            
            {/* 데이터 라인 */}
            <polyline points={points} fill="none" stroke="var(--accent-purple)" strokeWidth="2" strokeLinejoin="round" />
            
            {/* 데이터 포인트 */}
            {elbowData.map(d => (
              <g key={d.k} style={{cursor: 'pointer'}} onClick={() => setActiveK(d.k)}>
                <circle 
                  cx={getX(d.k)} 
                  cy={getY(d.inertia)} 
                  r={activeK === d.k ? 5 : 3} 
                  fill={activeK === d.k ? "var(--accent-neon)" : "white"} 
                />
                {activeK === d.k && (
                   <text x={getX(d.k)} y={getY(d.inertia) - 8} fontSize="10" fill="var(--accent-neon)" textAnchor="middle">
                     k={d.k}
                   </text>
                )}
              </g>
            ))}
          </svg>
        </div>
        <div className="plot-info">
          현재 중심점: <span className="highlight">{activeK}개</span> | 
          Inertia: <span className="highlight">{elbowData.find(d => d.k === activeK)?.inertia.toFixed(2)}</span>
        </div>
      </div>
    );
  };

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
            <Popup className="marker-popup-v2">
              <div className="marker-popup-content">
                <div className="popup-info">
                  <strong>{p.name}</strong>
                  <span>{p.category}</span>
                </div>
                <div className="popup-actions">
                  <button className="popup-btn locate" onClick={() => onLocatePlace(p.id)}>
                    📍 목록에서 찾기
                  </button>
                  <button className="popup-btn delete" onClick={() => onDeletePlace(p.id)}>
                    🗑️ 삭제
                  </button>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* 클러스터 중심점 및 폴리곤 */}
        {clusters.map((c, idx) => (
          <ClusterMarker key={idx} cluster={c} />
        ))}

        <FitBounds places={places} />
        <MapResizer />
      </MapContainer>

      {/* 오버레이 뷰 (좌상단 표 + 엘보우 플롯) */}
      <div className="map-overlay-panel glass-panel">
        <div className="summary-section">
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
                <tr key={`tbl-${p.id}`} style={{cursor: 'pointer'}} onClick={() => onLocatePlace(p.id)}>
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

        {places.length > 0 && renderElbowPlot()}
      </div>

      {/* 우상단 버튼 */}
      <button className="glass-btn floating-btn" onClick={onOpenSettings}>
        ⚙️ 설정
      </button>

      <style>{`
        .map-overlay-panel {
          position: absolute;
          top: 20px;
          left: 20px; 
          z-index: 1000;
          padding: 20px;
          width: 300px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
          pointer-events: auto;
          border-radius: 20px;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-backdrop);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
        }
        .map-overlay-panel::-webkit-scrollbar { width: 4px; }
        .map-overlay-panel::-webkit-scrollbar-thumb { background: rgba(0, 240, 255, 0.3); border-radius: 10px; }

        .summary-section {
          max-height: 250px; /* 목록 최대 높이 제한 */
          overflow-y: auto;
          margin-bottom: 10px;
          padding-right: 5px;
        }
        .summary-section::-webkit-scrollbar { width: 3px; }
        .summary-section::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }

        .summary-section h3 { font-size: 0.95rem; margin-bottom: 12px; color: var(--accent-neon); position: sticky; top: 0; background: var(--glass-bg); z-index: 1; }
        table { width: 100%; border-collapse: collapse; font-size: 0.8rem; color: var(--text-primary); }
        th, td { text-align: left; padding: 6px 4px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        th { color: var(--text-secondary); font-weight: 600; }

        .elbow-analysis {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 15px;
        }
        .elbow-analysis h4 { font-size: 0.85rem; margin-bottom: 10px; color: var(--accent-purple); }
        .chart-container {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 12px;
          padding: 10px;
          margin-bottom: 10px;
          display: flex;
          justify-content: center;
        }
        .plot-info {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-align: center;
        }
        .highlight {
          color: var(--accent-neon);
          font-weight: bold;
        }

        /* 마커 팝업 리뉴얼 스타일 */
        .marker-popup-v2 .leaflet-popup-content {
          margin: 12px;
          min-width: 180px;
        }
        .marker-popup-content {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .popup-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .popup-info strong {
          font-size: 1.05rem;
          color: var(--accent-neon);
          display: block;
        }
        .popup-info span {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .popup-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .popup-btn {
          width: 100%;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: #eee;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .popup-btn:hover {
          background: rgba(0, 240, 255, 0.1);
          border-color: var(--accent-neon);
          color: var(--accent-neon);
        }
        .popup-btn.delete:hover {
          background: rgba(255, 107, 107, 0.1);
          border-color: #ff6b6b;
          color: #ff6b6b;
        }

        .summary-section tr:hover td {
          background: rgba(0, 240, 255, 0.05);
          color: var(--accent-neon) !important;
        }

        .floating-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 1000;
        }
        /* Leaflet internal override */
        .leaflet-popup-content-wrapper {
            background: rgba(20, 20, 20, 0.9) !important;
            backdrop-filter: blur(10px) !important;
            color: var(--text-primary) !important;
            border: 1px solid rgba(0, 240, 255, 0.2);
            border-radius: 12px !important;
        }
        .leaflet-popup-tip { background: rgba(20, 20, 20, 0.9) !important; }
      `}</style>
    </section>
  );
}
