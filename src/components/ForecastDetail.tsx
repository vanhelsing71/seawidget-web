import React from 'react';
import { MarineForecast, NavigationAssessment } from '../types/marine';
import { MetricBar } from './MetricBar';
import { RefreshCw, ArrowLeft, MapPin, Compass, AlertCircle } from 'lucide-react';

interface ForecastDetailProps {
  forecast: MarineForecast;
  assessment: NavigationAssessment;
  locationName: string | null;
  updatedAtText: string;
  loading: boolean;
  onRefresh: () => void;
  onBack: () => void;
  onOpenLocationPicker: () => void;
}

export const ForecastDetail: React.FC<ForecastDetailProps> = ({
  forecast,
  assessment,
  locationName,
  updatedAtText,
  loading,
  onRefresh,
  onBack,
  onOpenLocationPicker,
}) => {
  const level = assessment.level;

  const bgImage =
    level === 'Good'
      ? '/images/calmo.jpg'
      : level === 'Caution'
      ? '/images/agitato.jpg'
      : '/images/grosso.jpg';

  const statusColor =
    level === 'Good' ? '#7CFFB2' : level === 'Caution' ? '#FFD369' : '#FF7676';

  const isSteep = assessment.steepness > 0.25;
  const isVerySteep = assessment.steepness > 0.35;

  return (
    <div className="forecast-detail-root" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="detail-dark-gradient" />

      {/* Navigazione superiore */}
      <header className="detail-top-nav">
        <button className="nav-icon-btn" onClick={onBack} aria-label="Torna indietro">
          <ArrowLeft size={22} />
        </button>
        <div className="location-pill" onClick={onOpenLocationPicker}>
          <MapPin size={16} />
          <span className="location-name-text">
            {locationName || 'Posizione marittima'}
          </span>
        </div>
        <button
          className={`nav-icon-btn ${loading ? 'spinning' : ''}`}
          onClick={onRefresh}
          aria-label="Aggiorna"
        >
          <RefreshCw size={20} />
        </button>
      </header>

      {/* Contenuto scrollabile */}
      <main className="detail-scroll-area">
        <div className="detail-content-card">
          <div className="detail-header-block">
            <span className="detail-subheading">CONDIZIONE MARE</span>
            <h1 className="detail-status" style={{ color: statusColor }}>
              {assessment.status}
            </h1>
            <p className="detail-summary-line">{assessment.details}</p>

            {/* Avviso ripidezza d'onda per catamarano / scafo */}
            {isSteep && (
              <div className={`steepness-badge ${isVerySteep ? 'very-steep' : ''}`}>
                <AlertCircle size={16} />
                <span>
                  {isVerySteep
                    ? 'Onda molto ripida (rapporto H/T elevato) - Forte impatto sulla velocità!'
                    : 'Ripidezza moderata dell’onda - Possibile riduzione comfort di navigazione.'}
                </span>
              </div>
            )}
          </div>

          {/* Griglia delle metriche principali */}
          <section className="metric-bars-container">
            <MetricBar
              label="Altezza onda"
              value={forecast.waveHeightMeters}
              unit="m"
              max={5.0}
              goodThreshold={1.5}
              cautionThreshold={2.5}
            />

            <MetricBar
              label="Picco a 6 ore"
              value={forecast.maxWaveHeightNextHoursMeters}
              unit="m"
              max={5.0}
              goodThreshold={1.5}
              cautionThreshold={2.5}
            />

            <MetricBar
              label="Periodo onda"
              value={forecast.wavePeriodSeconds}
              unit="s"
              max={15.0}
              neutral={true}
            />

            <MetricBar
              label="Vento (10m)"
              value={forecast.windSpeedKmh}
              unit="km/h"
              max={60.0}
              goodThreshold={40.0}
              cautionThreshold={55.0}
            />

            <MetricBar
              label="Raffiche"
              value={forecast.windGustKmh}
              unit="km/h"
              max={80.0}
              goodThreshold={55.0}
              cautionThreshold={75.0}
            />

            <MetricBar
              label="Corrente oceanica"
              value={forecast.currentVelocityKmh}
              unit="km/h"
              max={10.0}
              goodThreshold={5.0}
              cautionThreshold={8.0}
            />

            <MetricBar
              label="Mareggiata (Swell)"
              value={forecast.swellHeightMeters}
              unit="m"
              max={5.0}
              goodThreshold={1.5}
              cautionThreshold={2.5}
            />

            <MetricBar
              label="Periodo mareggiata"
              value={forecast.swellPeriodSeconds}
              unit="s"
              max={20.0}
              neutral={true}
            />
          </section>

          {/* Info aggiuntive su modello e disclaimer */}
          <footer className="detail-meta-footer">
            <div className="meta-coords">
              <Compass size={14} />
              <span>
                Cella meteo: {forecast.modelLatitude.toFixed(3)}°N, {forecast.modelLongitude.toFixed(3)}°E
              </span>
            </div>
            <div className="meta-timestamp">{updatedAtText}</div>
            <div className="meta-disclaimer">
              Fonte dati: Open-Meteo Marine. Non sostituisce bollettini ufficiali della Guardia Costiera, ordinanze di capitaneria o prudente perizia nautica.
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};
