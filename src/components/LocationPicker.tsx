import React, { useState } from 'react';
import { GeoPoint } from '../types/marine';
import {
  LocationService,
  LocationSearchResult,
  POPULAR_MARINE_PRESETS,
} from '../services/locationService';
import { MapPin, Navigation, Search, X, Anchor } from 'lucide-react';

interface LocationPickerProps {
  currentPoint: GeoPoint | null;
  currentLocationName: string | null;
  onSelectPoint: (point: GeoPoint, name: string) => void;
  onRequestGps: () => void;
  onClose: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  currentLocationName,
  onSelectPoint,
  onRequestGps,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const list = await LocationService.searchLocations(query);
      setResults(list);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="location-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="location-modal-header">
          <div className="location-title-row">
            <MapPin size={22} className="location-header-icon" />
            <h3>Seleziona Posizione Mare</h3>
          </div>
          <button className="test-close-btn" onClick={onClose} aria-label="Chiudi">
            <X size={20} />
          </button>
        </div>

        {/* Pulsante GPS Rapido */}
        <button
          className="gps-quick-btn"
          onClick={() => {
            onRequestGps();
            onClose();
          }}
        >
          <Navigation size={18} />
          <div className="gps-btn-text">
            <strong>Usa la mia posizione GPS</strong>
            <span>Rileva automaticamente la costa o il mare più vicino</span>
          </div>
        </button>

        {/* Barra di Ricerca Porto / Città */}
        <form className="location-search-bar" onSubmit={handleSearch}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Cerca porto, isola o costa (es. Capri, Elba)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="search-submit-btn" disabled={searching}>
            {searching ? '...' : 'Cerca'}
          </button>
        </form>

        {/* Risultati della ricerca */}
        {results.length > 0 && (
          <div className="search-results-list">
            <span className="section-label">Risultati:</span>
            {results.map((res, i) => (
              <div
                key={i}
                className="result-row"
                onClick={() => {
                  onSelectPoint(res.point, res.name);
                  onClose();
                }}
              >
                <Anchor size={16} />
                <div className="result-info">
                  <strong>{res.name}</strong>
                  <span>{[res.admin1, res.country].filter(Boolean).join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preset Marini Preferiti */}
        <div className="presets-section">
          <span className="section-label">Aree nautiche popolari:</span>
          <div className="presets-grid">
            {POPULAR_MARINE_PRESETS.map((preset, i) => (
              <button
                key={i}
                className="preset-chip"
                onClick={() => {
                  onSelectPoint(preset.point, preset.name);
                  onClose();
                }}
              >
                <span className="chip-name">{preset.name}</span>
                <span className="chip-desc">{preset.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {currentLocationName && (
          <div className="current-location-footer">
            Attuale: <strong>{currentLocationName}</strong>
          </div>
        )}
      </div>
    </div>
  );
};
