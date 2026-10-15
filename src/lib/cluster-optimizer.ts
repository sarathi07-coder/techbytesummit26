/**
 * REAGENTWATCH AI - PERI-URBAN CLUSTER DISPOSAL OPTIMIZER
 * Solves the high-cost logistics barrier by grouping isolated schools into pooled Hazmat collection circuits.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Calculates Great-Circle distance between two coordinates in kilometers (Haversine formula)
 */
export function calculateHaversineDistanceKm(coord1: LatLng, coord2: LatLng): number {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export interface ClusterRouteResult {
  orderedSchoolNames: string[];
  totalCircuitDistanceKm: number;
  totalBottlesCollected: number;
  standaloneCostInr: number;
  pooledCostInr: number;
  savingsPercentage: number;
}

/**
 * Computes optimized nearest-neighbor route for hazardous waste truck
 */
export function optimizeClusterRoute(
  schools: Array<{ name: string; lat: number; lng: number; bottleCount: number }>
): ClusterRouteResult {
  if (schools.length === 0) {
    return {
      orderedSchoolNames: [],
      totalCircuitDistanceKm: 0,
      totalBottlesCollected: 0,
      standaloneCostInr: 0,
      pooledCostInr: 0,
      savingsPercentage: 0,
    };
  }

  const unvisited = [...schools];
  const route: Array<{ name: string; lat: number; lng: number; bottleCount: number }> = [];
  
  // Start with highest bottle count school as depot hub
  unvisited.sort((a, b) => b.bottleCount - a.bottleCount);
  let current = unvisited.shift()!;
  route.push(current);

  let totalDistance = 0;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateHaversineDistanceKm(
        { lat: current.lat, lng: current.lng },
        { lat: unvisited[i].lat, lng: unvisited[i].lng }
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    totalDistance += minDistance;
    current = unvisited.splice(nearestIdx, 1)[0];
    route.push(current);
  }

  const totalBottles = route.reduce((sum, s) => sum + s.bottleCount, 0);

  // Financial model:
  // Standalone dispatch = ₹35,000 per school
  // Pooled circuit dispatch = ₹20,000 base + (₹450 per km)
  const standaloneCostInr = schools.length * 35000;
  const pooledCostInr = 20000 + Math.round(totalDistance * 450);
  const savingsPct = Math.round(((standaloneCostInr - pooledCostInr) / standaloneCostInr) * 100);

  return {
    orderedSchoolNames: route.map(s => s.name),
    totalCircuitDistanceKm: parseFloat(totalDistance.toFixed(1)),
    totalBottlesCollected: totalBottles,
    standaloneCostInr,
    pooledCostInr,
    savingsPercentage: Math.max(10, Math.min(90, savingsPct)),
  };
}
