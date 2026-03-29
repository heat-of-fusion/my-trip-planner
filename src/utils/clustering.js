// src/utils/clustering.js

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function calculateWeightedCentroid(clusterPoints) {
  if (clusterPoints.length === 0) return null;
  let sumLat = 0;
  let sumLng = 0;
  let sumWeight = 0;

  clusterPoints.forEach(p => {
      const w = parseFloat(p.weight) || 1;
      sumLat += p.lat * w;
      sumLng += p.lng * w;
      sumWeight += w;
  });

  return {
      lat: sumLat / sumWeight,
      lng: sumLng / sumWeight
  };
}

export function runWeightedKMeans(places, kInput) {
  if (!places || places.length === 0) return { clusters: [], inertia: 0 };

  // k값이 주어지지 않으면 기존의 자동 계산 로직 사용
  let k = kInput || Math.min(5, Math.max(1, Math.floor(places.length / 4)));
  if (places.length <= 2 && !kInput) k = 1;
  
  // k는 장소 개수보다 많을 수 없음
  k = Math.min(k, places.length);

  let centroids = [];
  const shuffled = [...places].sort(() => 0.5 - Math.random());
  for (let i = 0; i < k; i++) {
      centroids.push({ lat: shuffled[i].lat, lng: shuffled[i].lng });
  }

  let clusters = [];
  const MAX_ITERATIONS = 15; // 연산 속도를 위해 약간 조정

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
      clusters = centroids.map(c => ({ centroid: c, points: [] }));

      places.forEach(place => {
          let minCId = 0;
          let minDist = Infinity;
          
          centroids.forEach((c, idx) => {
              const dist = getDistanceFromLatLonInKm(place.lat, place.lng, c.lat, c.lng);
              if (dist < minDist) {
                  minDist = dist;
                  minCId = idx;
              }
          });
          clusters[minCId].points.push(place);
      });

      clusters = clusters.filter(c => c.points.length > 0);

      let changed = false;
      const newCentroids = clusters.map(c => {
          const newCenter = calculateWeightedCentroid(c.points);
          if (Math.abs(newCenter.lat - c.centroid.lat) > 0.0001 || 
              Math.abs(newCenter.lng - c.centroid.lng) > 0.0001) {
              changed = true;
          }
          return newCenter;
      });

      centroids = newCentroids;
      if (!changed) break;
  }

  // 최종 Inertia 계산 (각 포인트와 중심점 사이의 거리 제곱 합)
  let totalInertia = 0;
  clusters.forEach(c => {
    c.points.forEach(p => {
      const d = getDistanceFromLatLonInKm(p.lat, p.lng, c.centroid.lat, c.centroid.lng);
      totalInertia += d * d; 
    });
  });

  // 시각적 오프셋 적용: 중심점이 장소를 가리지 않도록 살짝 이동
  return {
    clusters: clusters.map((c, idx) => {
      let finalCentroid = { ...c.centroid };
      
      // 장소가 1개이거나, 중심점이 어떤 장소와 너무 가까우면 살짝 북동쪽으로 오프셋 (약 200~300m 수준)
      const OFFSET_VAL = 0.0025; 
      let needOffset = c.points.length === 1;
      
      if (!needOffset) {
        for (const p of c.points) {
          const dist = getDistanceFromLatLonInKm(p.lat, p.lng, finalCentroid.lat, finalCentroid.lng);
          if (dist < 0.1) { // 100m 이내로 너무 가까우면
            needOffset = true;
            break;
          }
        }
      }

      if (needOffset) {
        finalCentroid.lat += OFFSET_VAL;
        finalCentroid.lng += OFFSET_VAL;
      }

      return {
        id: `cluster-${idx}`,
        centroid: finalCentroid,
        points: c.points
      };
    }),
    inertia: totalInertia
  };
}
