import React from 'react';
import { MarineForecast, NavigationAssessment } from '../types/marine';
import { RefreshCw, ExternalLink } from 'lucide-react';

interface WidgetCardProps {
  forecast: MarineForecast | null;
  assessment: NavigationAssessment | null;
  locationName: string | null;
  updatedAtText: string;
  loading: boolean;
  onRefresh: () => void;
  onOpenDetail: () => void;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  forecast,
  assessment,
  locationName,
  updatedAtText,
  loading,
  onRefresh,
  onOpenDetail,
}) => {
  const level = assessment?.level || 'Good';

  // Sfondo corrispondente
  const bgImage =
    level === 'Good'
      ? '/images/calmo.jpg'
      : level === 'Caution'
      ? '/images/agitato.jpg'
      : '/images/grosso.jpg';

  const iconSrc =
    level === 'Good'
      ? '/icons/ic_calm_sea.svg'
      : level === 'Caution'
      ? '/icons/ic_caution_sea.svg'
      : '/icons/ic_unsafe_sea.svg';

  const statusColor =
    level === 'Good' ? '#7CFFB2' : level === 'Caution' ? '#FFD369' : '#FF7676';

  const detailText =
    forecast && assessment
      ? forecast.maxWaveHeightNextHoursMeters > forecast.waveHeightMeters
        ? `${assessment.details}. Picco 6h ${forecast.maxWaveHeightNextHoursMeters.toFixed(1)} m`
        : assessment.details
      : 'In attesa dati meteorologici';

  return (
    <div
      className="widget-root"
      style={{ backgroundImage: `url(${bgImage})` }}
      onClick={onOpenDetail}
    >
      <div className="widget-overlay">
        {/* Intestazione widget */}
        <div className="widget-header">
          <div className="widget-title-area">
            <span className="widget-app-tag">WIDGET</span>
            <h3 className="widget-title">
              {locationName ? `Meteo mare - ${locationName}` : 'Meteo mare'}
            </h3>
          </div>
          <button
            className={`widget-refresh-btn ${loading ? 'spinning' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onRefresh();
            }}
            title="Aggiorna previsioni"
            aria-label="Aggiorna"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Corpo principale widget: stato ed icona */}
        <div className="widget-body">
          <div className="widget-status-col">
            <div
              className="widget-status"
              style={{ color: statusColor }}
            >
              {loading ? 'Aggiornamento...' : assessment?.status || 'In attesa dati'}
            </div>
            <div className="widget-details">{detailText}</div>
          </div>
          <div className="widget-icon-container">
            <img src={iconSrc} alt="Condizione mare" className="widget-condition-icon" />
          </div>
        </div>

        {/* Piede del widget */}
        <div className="widget-footer">
          <span className="widget-updated-at">{updatedAtText}</span>
          <div className="widget-touch-hint">
            <span>Dettagli</span>
            <ExternalLink size={13} />
          </div>
        </div>
      </div>
    </div>
  );
};
