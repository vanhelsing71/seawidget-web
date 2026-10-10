export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface MarineForecast {
  waveHeightMeters: number;
  wavePeriodSeconds: number;
  swellHeightMeters: number;
  swellPeriodSeconds: number;
  currentVelocityKmh: number;
  maxWaveHeightNextHoursMeters: number;
  modelLatitude: number;
  modelLongitude: number;
  windSpeedKmh: number;
  windGustKmh: number;
}

export type NavigationLevel = 'Good' | 'Caution' | 'Unsafe';

export interface NavigationAssessment {
  level: NavigationLevel;
  status: string; // "Navigabile" | "Prudenza" | "Non consigliato"
  details: string;
  steepness: number;
}

export interface CachedForecastData {
  forecast: MarineForecast;
  timestamp: number;
  locationName: string;
  point: GeoPoint;
}
