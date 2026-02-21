import { useState, useEffect } from "react";

export type GeolocationStatus = "idle" | "detecting" | "success" | "denied" | "unavailable" | "error";

export interface GeolocationState {
  status: GeolocationStatus;
  stateCode: string | null;
  stateName: string | null;
  error: string | null;
  detect: () => void;
}

// Reverse geocoding using browser coordinates → US state code
// Uses a simple lat/lng bounding box lookup for all 50 states
const STATE_BOUNDS: Array<{ code: string; name: string; latMin: number; latMax: number; lonMin: number; lonMax: number }> = [
  { code: "AL", name: "Alabama", latMin: 30.1, latMax: 35.0, lonMin: -88.5, lonMax: -84.9 },
  { code: "AK", name: "Alaska", latMin: 54.0, latMax: 71.5, lonMin: -180.0, lonMax: -130.0 },
  { code: "AZ", name: "Arizona", latMin: 31.3, latMax: 37.0, lonMin: -114.8, lonMax: -109.0 },
  { code: "AR", name: "Arkansas", latMin: 33.0, latMax: 36.5, lonMin: -94.6, lonMax: -89.6 },
  { code: "CA", name: "California", latMin: 32.5, latMax: 42.0, lonMin: -124.5, lonMax: -114.1 },
  { code: "CO", name: "Colorado", latMin: 36.9, latMax: 41.0, lonMin: -109.1, lonMax: -102.0 },
  { code: "CT", name: "Connecticut", latMin: 40.9, latMax: 42.1, lonMin: -73.7, lonMax: -71.8 },
  { code: "DE", name: "Delaware", latMin: 38.4, latMax: 39.8, lonMin: -75.8, lonMax: -75.0 },
  { code: "FL", name: "Florida", latMin: 24.4, latMax: 31.0, lonMin: -87.6, lonMax: -80.0 },
  { code: "GA", name: "Georgia", latMin: 30.4, latMax: 35.0, lonMin: -85.6, lonMax: -80.8 },
  { code: "HI", name: "Hawaii", latMin: 18.9, latMax: 22.2, lonMin: -160.2, lonMax: -154.8 },
  { code: "ID", name: "Idaho", latMin: 41.9, latMax: 49.0, lonMin: -117.2, lonMax: -111.0 },
  { code: "IL", name: "Illinois", latMin: 36.9, latMax: 42.5, lonMin: -91.5, lonMax: -87.0 },
  { code: "IN", name: "Indiana", latMin: 37.8, latMax: 41.8, lonMin: -88.1, lonMax: -84.8 },
  { code: "IA", name: "Iowa", latMin: 40.4, latMax: 43.5, lonMin: -96.6, lonMax: -90.1 },
  { code: "KS", name: "Kansas", latMin: 36.9, latMax: 40.0, lonMin: -102.1, lonMax: -94.6 },
  { code: "KY", name: "Kentucky", latMin: 36.5, latMax: 39.1, lonMin: -89.6, lonMax: -81.9 },
  { code: "LA", name: "Louisiana", latMin: 28.9, latMax: 33.0, lonMin: -94.0, lonMax: -88.8 },
  { code: "ME", name: "Maine", latMin: 43.1, latMax: 47.5, lonMin: -71.1, lonMax: -67.0 },
  { code: "MD", name: "Maryland", latMin: 37.9, latMax: 39.7, lonMin: -79.5, lonMax: -75.0 },
  { code: "MA", name: "Massachusetts", latMin: 41.2, latMax: 42.9, lonMin: -73.5, lonMax: -69.9 },
  { code: "MI", name: "Michigan", latMin: 41.7, latMax: 48.3, lonMin: -90.4, lonMax: -82.4 },
  { code: "MN", name: "Minnesota", latMin: 43.5, latMax: 49.4, lonMin: -97.2, lonMax: -89.5 },
  { code: "MS", name: "Mississippi", latMin: 30.2, latMax: 35.0, lonMin: -91.7, lonMax: -88.1 },
  { code: "MO", name: "Missouri", latMin: 35.9, latMax: 40.6, lonMin: -95.8, lonMax: -89.1 },
  { code: "MT", name: "Montana", latMin: 44.4, latMax: 49.0, lonMin: -116.1, lonMax: -104.0 },
  { code: "NE", name: "Nebraska", latMin: 40.0, latMax: 43.0, lonMin: -104.1, lonMax: -95.3 },
  { code: "NV", name: "Nevada", latMin: 35.0, latMax: 42.0, lonMin: -120.0, lonMax: -114.0 },
  { code: "NH", name: "New Hampshire", latMin: 42.7, latMax: 45.3, lonMin: -72.6, lonMax: -70.6 },
  { code: "NJ", name: "New Jersey", latMin: 38.9, latMax: 41.4, lonMin: -75.6, lonMax: -73.9 },
  { code: "NM", name: "New Mexico", latMin: 31.3, latMax: 37.0, lonMin: -109.1, lonMax: -103.0 },
  { code: "NY", name: "New York", latMin: 40.5, latMax: 45.0, lonMin: -79.8, lonMax: -71.8 },
  { code: "NC", name: "North Carolina", latMin: 33.8, latMax: 36.6, lonMin: -84.3, lonMax: -75.5 },
  { code: "ND", name: "North Dakota", latMin: 45.9, latMax: 49.0, lonMin: -104.1, lonMax: -96.6 },
  { code: "OH", name: "Ohio", latMin: 38.4, latMax: 42.3, lonMin: -84.8, lonMax: -80.5 },
  { code: "OK", name: "Oklahoma", latMin: 33.6, latMax: 37.0, lonMin: -103.0, lonMax: -94.4 },
  { code: "OR", name: "Oregon", latMin: 41.9, latMax: 46.3, lonMin: -124.6, lonMax: -116.5 },
  { code: "PA", name: "Pennsylvania", latMin: 39.7, latMax: 42.3, lonMin: -80.5, lonMax: -74.7 },
  { code: "RI", name: "Rhode Island", latMin: 41.1, latMax: 42.0, lonMin: -71.9, lonMax: -71.1 },
  { code: "SC", name: "South Carolina", latMin: 32.0, latMax: 35.2, lonMin: -83.4, lonMax: -78.5 },
  { code: "SD", name: "South Dakota", latMin: 42.5, latMax: 45.9, lonMin: -104.1, lonMax: -96.4 },
  { code: "TN", name: "Tennessee", latMin: 34.9, latMax: 36.7, lonMin: -90.3, lonMax: -81.6 },
  { code: "TX", name: "Texas", latMin: 25.8, latMax: 36.5, lonMin: -106.6, lonMax: -93.5 },
  { code: "UT", name: "Utah", latMin: 36.9, latMax: 42.0, lonMin: -114.1, lonMax: -109.0 },
  { code: "VT", name: "Vermont", latMin: 42.7, latMax: 45.0, lonMin: -73.4, lonMax: -71.5 },
  { code: "VA", name: "Virginia", latMin: 36.5, latMax: 39.5, lonMin: -83.7, lonMax: -75.2 },
  { code: "WA", name: "Washington", latMin: 45.5, latMax: 49.0, lonMin: -124.8, lonMax: -116.9 },
  { code: "WV", name: "West Virginia", latMin: 37.2, latMax: 40.6, lonMin: -82.6, lonMax: -77.7 },
  { code: "WI", name: "Wisconsin", latMin: 42.5, latMax: 47.1, lonMin: -92.9, lonMax: -86.2 },
  { code: "WY", name: "Wyoming", latMin: 40.9, latMax: 45.0, lonMin: -111.1, lonMax: -104.1 },
];

function detectStateFromCoords(lat: number, lon: number): { code: string; name: string } | null {
  // Find the best matching state (smallest bounding box that contains the point)
  const matches = STATE_BOUNDS.filter(
    (s) => lat >= s.latMin && lat <= s.latMax && lon >= s.lonMin && lon <= s.lonMax
  );

  if (matches.length === 0) return null;
  if (matches.length === 1) return { code: matches[0].code, name: matches[0].name };

  // Pick the smallest bounding box (most precise match)
  const best = matches.reduce((a, b) => {
    const areaA = (a.latMax - a.latMin) * (a.lonMax - a.lonMin);
    const areaB = (b.latMax - b.latMin) * (b.lonMax - b.lonMin);
    return areaA < areaB ? a : b;
  });

  return { code: best.code, name: best.name };
}

export function useGeolocation(): GeolocationState {
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const [stateCode, setStateCode] = useState<string | null>(null);
  const [stateName, setStateName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function detect() {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setStatus("detecting");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const detected = detectStateFromCoords(latitude, longitude);

        if (detected) {
          setStateCode(detected.code);
          setStateName(detected.name);
          setStatus("success");
        } else {
          setStatus("error");
          setError("Could not determine your state from your location. Please select manually.");
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setError("Location access was denied. Please select your state manually.");
        } else {
          setStatus("error");
          setError("Unable to detect your location. Please select your state manually.");
        }
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  }

  return { status, stateCode, stateName, error, detect };
}
