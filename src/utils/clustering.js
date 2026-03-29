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

export function runWeightedKMeans(places) {
  if (!places || places.length === 0) return [];

  let k = Math.min(5, Math.max(1, Math.floor(places.length / 4)));
  if (places.length <= 2) k = 1;

  let centroids = [];
  const shuffled = [...places].sort(() => 0.5 - Math.random());
  for (let i = 0; i < k; i++) {
      centroids.push({ lat: shuffled[i].lat, lng: shuffled[i].lng });
  }

  let clusters = [];
  const MAX_ITERATIONS = 20;

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

  return clusters.map((c, idx) => ({
      id: `cluster-${idx}`,
      centroid: centroids[idx],
      points: c.points
  }));
}
