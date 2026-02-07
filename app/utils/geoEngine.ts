import ngeohash from 'ngeohash';

export interface GeoLocation {
    lat: number;
    lon: number;
}

export interface GeoResult {
    location: GeoLocation;
    geohash: string;
}

/**
 * Get current user location using Browser API
 * @returns Promise<{lat, lon, geohash}>
 */
export async function getCurrentLocation(): Promise<GeoResult> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Generate Geohash (Precision 5 = ~5km x 5km Blind Box)
                const hash = ngeohash.encode(latitude, longitude, 5);

                resolve({
                    location: { lat: latitude, lon: longitude },
                    geohash: hash
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
}

/**
 * Calculates distance between two points in meters (Haversine Formula)
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
}

/**
 * Calculates bearing (angle) from start point to end point (0-360 degrees)
 */
export function calculateBearing(startLat: number, startLon: number, destLat: number, destLon: number): number {
    const startLatRad = startLat * Math.PI / 180;
    const startLonRad = startLon * Math.PI / 180;
    const destLatRad = destLat * Math.PI / 180;
    const destLonRad = destLon * Math.PI / 180;

    const y = Math.sin(destLonRad - startLonRad) * Math.cos(destLatRad);
    const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
        Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLonRad - startLonRad);

    const theta = Math.atan2(y, x);
    const bearing = (theta * 180 / Math.PI + 360) % 360; // Normalize to 0-360

    return Math.round(bearing);
}

/**
 * Decode a geohash to get its center coordinates (approximate location of a peer)
 */
export function decodeGeohash(hash: string): GeoLocation {
    const { latitude, longitude } = ngeohash.decode(hash);
    return { lat: latitude, lon: longitude };
}
