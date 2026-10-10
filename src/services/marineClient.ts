import { GeoPoint, MarineForecast } from '../types/marine';

const MAX_RETRIES = 3;
const TIMEOUT_MS = 10000;

async function fetchWithTimeout(url: string, timeoutMs: number = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function fetchJsonWithRetry<T>(url: string, retries = MAX_RETRIES): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) {
        throw new Error(`Errore HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.reason || 'Errore Open-Meteo');
      }
      return data as T;
    } catch (err: any) {
      lastError = err;
      if (attempt < retries) {
        const backoffMs = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw lastError || new Error('Impossibile completare la richiesta di rete');
}

export const MarineForecastClient = {
  buildMarineUrl(point: GeoPoint): string {
    const lat = point.latitude.toFixed(5);
    const lon = point.longitude.toFixed(5);
    return (
      `https://marine-api.open-meteo.com/v1/marine` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=wave_height,wave_period,swell_wave_height,swell_wave_period,ocean_current_velocity` +
      `&hourly=wave_height` +
      `&forecast_hours=6` +
      `&timezone=auto` +
      `&cell_selection=sea`
    );
  },

  buildWeatherUrl(point: GeoPoint): string {
    const lat = point.latitude.toFixed(5);
    const lon = point.longitude.toFixed(5);
    return (
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=wind_speed_10m,wind_gusts_10m` +
      `&timezone=auto`
    );
  },

  async fetch(point: GeoPoint): Promise<MarineForecast> {
    const marineUrl = this.buildMarineUrl(point);
    const weatherUrl = this.buildWeatherUrl(point);

    const [marineJson, weatherJson] = await Promise.all([
      fetchJsonWithRetry<any>(marineUrl),
      fetchJsonWithRetry<any>(weatherUrl),
    ]);

    const marineCurrent = marineJson.current || {};
    const hourlyWaveHeights: number[] = marineJson.hourly?.wave_height || [];

    const currentWaveHeight = Number(marineCurrent.wave_height ?? 0);
    const validHeights = hourlyWaveHeights.filter((h) => h != null && !isNaN(h));
    const maxWaveHeight =
      validHeights.length > 0 ? Math.max(...validHeights, currentWaveHeight) : currentWaveHeight;

    const weatherCurrent = weatherJson.current || {};

    return {
      waveHeightMeters: currentWaveHeight,
      wavePeriodSeconds: Number(marineCurrent.wave_period ?? 0),
      swellHeightMeters: Number(marineCurrent.swell_wave_height ?? 0),
      swellPeriodSeconds: Number(marineCurrent.swell_wave_period ?? 0),
      currentVelocityKmh: Number(marineCurrent.ocean_current_velocity ?? 0),
      maxWaveHeightNextHoursMeters: maxWaveHeight,
      modelLatitude: Number(marineJson.latitude ?? point.latitude),
      modelLongitude: Number(marineJson.longitude ?? point.longitude),
      windSpeedKmh: Number(weatherCurrent.wind_speed_10m ?? 0),
      windGustKmh: Number(weatherCurrent.wind_gusts_10m ?? 0),
    };
  },
};
