import { CachedForecastData, GeoPoint, MarineForecast } from '../types/marine';

const CACHE_KEY = 'seawidget_marine_cache';
const TEST_STORE_KEY = 'seawidget_test_forecast';
const TEST_ENABLED_KEY = 'seawidget_test_enabled';

export const CacheService = {
  save(point: GeoPoint, locationName: string, forecast: MarineForecast): void {
    try {
      const data: CachedForecastData = {
        forecast,
        locationName,
        point,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (_) {}
  },

  load(): CachedForecastData | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as CachedForecastData;
    } catch (_) {
      return null;
    }
  },

  getAgeText(timestamp: number): string {
    const elapsedMs = Date.now() - timestamp;
    const minutes = Math.floor(elapsedMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'meno di 1 min fa';
    if (minutes < 60) return `${minutes} min fa`;
    if (hours === 1) return '1 ora fa';
    if (hours < 24) return `${hours} ore fa`;
    if (days === 1) return '1 giorno fa';
    return `${days} giorni fa`;
  },

  // Modalità Test
  isTestMode(): boolean {
    try {
      return localStorage.getItem(TEST_ENABLED_KEY) === 'true';
    } catch (_) {
      return false;
    }
  },

  setTestMode(enabled: boolean): void {
    try {
      localStorage.setItem(TEST_ENABLED_KEY, enabled ? 'true' : 'false');
    } catch (_) {}
  },

  saveTestForecast(forecast: MarineForecast): void {
    try {
      localStorage.setItem(TEST_STORE_KEY, JSON.stringify(forecast));
    } catch (_) {}
  },

  loadTestForecast(): MarineForecast | null {
    try {
      const raw = localStorage.getItem(TEST_STORE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as MarineForecast;
    } catch (_) {
      return null;
    }
  },
};
