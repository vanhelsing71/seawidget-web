import { GeoPoint } from '../types/marine';

const LAST_LOCATION_KEY = 'seawidget_last_location';

export interface LocationSearchResult {
  name: string;
  country: string;
  admin1?: string;
  point: GeoPoint;
}

export const POPULAR_MARINE_PRESETS: Array<{ name: string; point: GeoPoint; desc: string }> = [
  { name: 'Capri / Golfo di Napoli', point: { latitude: 40.5507, longitude: 14.2426 }, desc: 'Tirreno Centrale' },
  { name: 'Ischia / Procida', point: { latitude: 40.7438, longitude: 13.9482 }, desc: 'Isole Flegree' },
  { name: 'Portoferraio (Elba)', point: { latitude: 42.8125, longitude: 10.3150 }, desc: 'Arcipelago Toscano' },
  { name: 'La Maddalena', point: { latitude: 41.2155, longitude: 9.4042 }, desc: 'Bocche di Bonifacio' },
  { name: 'Portofino / Genova', point: { latitude: 44.3039, longitude: 9.2086 }, desc: 'Mar Ligure' },
  { name: 'Ponza / Ventotene', point: { latitude: 40.8986, longitude: 12.9628 }, desc: 'Isole Pontine' },
  { name: 'Santa Maria di Leuca', point: { latitude: 39.7972, longitude: 18.3582 }, desc: 'Canale d’Otranto' },
  { name: 'Egadi (Favignana)', point: { latitude: 37.9312, longitude: 12.3275 }, desc: 'Sicilia Occidentale' },
];

export const LocationService = {
  saveLastLocation(point: GeoPoint): void {
    try {
      localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(point));
    } catch (_) {}
  },

  getLastLocation(): GeoPoint | null {
    try {
      const data = localStorage.getItem(LAST_LOCATION_KEY);
      if (data) {
        return JSON.parse(data) as GeoPoint;
      }
    } catch (_) {}
    return null;
  },

  async getCurrentPosition(): Promise<GeoPoint> {
    if (!('geolocation' in navigator)) {
      throw new Error('Geolocalizzazione non supportata su questo browser.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const point: GeoPoint = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          this.saveLastLocation(point);
          resolve(point);
        },
        (error) => {
          let msg = 'Errore di geolocalizzazione.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Permesso posizione negato. Consenti l’accesso per rilevare la costa vicina.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Posizione GPS non disponibile.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Timeout nel rilevamento della posizione.';
          }
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 300000, // 5 minuti
        }
      );
    });
  },

  async resolveLocationName(point: GeoPoint): Promise<string> {
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${point.latitude}&longitude=${point.longitude}&localityLanguage=it`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (response.ok) {
        const data = await response.json();
        const name =
          data.locality ||
          data.city ||
          data.principalSubdivision ||
          data.countryName;
        if (name) return name;
      }
    } catch (_) {}

    return `${point.latitude.toFixed(3)}°N, ${point.longitude.toFixed(3)}°E`;
  },

  async searchLocations(query: string): Promise<LocationSearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query.trim()
      )}&count=6&language=it&format=json`;
      const response = await fetch(url);
      if (!response.ok) return [];
      const data = await response.json();
      if (!data.results) return [];

      return data.results.map((r: any) => ({
        name: r.name,
        country: r.country || '',
        admin1: r.admin1 || '',
        point: {
          latitude: r.latitude,
          longitude: r.longitude,
        },
      }));
    } catch (_) {
      return [];
    }
  },
};
