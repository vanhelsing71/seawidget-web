import React, { useState } from 'react';
import { MarineForecast } from '../types/marine';
import { Sliders, X, Check, RotateCcw } from 'lucide-react';

interface TestModePanelProps {
  initialForecast?: MarineForecast | null;
  onApply: (forecast: MarineForecast) => void;
  onDisable: () => void;
  onClose: () => void;
}

export const TestModePanel: React.FC<TestModePanelProps> = ({
  initialForecast,
  onApply,
  onDisable,
  onClose,
}) => {
  const [waveHeight, setWaveHeight] = useState<number>(initialForecast?.waveHeightMeters ?? 0.6);
  const [maxWaveHeight, setMaxWaveHeight] = useState<number>(
    initialForecast?.maxWaveHeightNextHoursMeters ?? 0.8
  );
  const [wavePeriod, setWavePeriod] = useState<number>(initialForecast?.wavePeriodSeconds ?? 4);
  const [windSpeed, setWindSpeed] = useState<number>(initialForecast?.windSpeedKmh ?? 12);
  const [windGust, setWindGust] = useState<number>(initialForecast?.windGustKmh ?? 18);
  const [currentVel, setCurrentVel] = useState<number>(initialForecast?.currentVelocityKmh ?? 0.5);
  const [swellHeight, setSwellHeight] = useState<number>(initialForecast?.swellHeightMeters ?? 0.3);
  const [swellPeriod, setSwellPeriod] = useState<number>(initialForecast?.swellPeriodSeconds ?? 3);

  const applyPreset = (preset: 'calmo' | 'agitato' | 'grosso') => {
    if (preset === 'calmo') {
      setWaveHeight(0.6);
      setMaxWaveHeight(0.8);
      setWavePeriod(4);
      setWindSpeed(12);
      setWindGust(18);
      setCurrentVel(0.5);
      setSwellHeight(0.3);
      setSwellPeriod(3);
    } else if (preset === 'agitato') {
      setWaveHeight(1.8);
      setMaxWaveHeight(2.0);
      setWavePeriod(6);
      setWindSpeed(30);
      setWindGust(40);
      setCurrentVel(3.5);
      setSwellHeight(1.2);
      setSwellPeriod(5);
    } else {
      setWaveHeight(4.0);
      setMaxWaveHeight(4.5);
      setWavePeriod(8);
      setWindSpeed(50);
      setWindGust(65);
      setCurrentVel(7.0);
      setSwellHeight(2.5);
      setSwellPeriod(7);
    }
  };

  const handleApply = () => {
    const customForecast: MarineForecast = {
      waveHeightMeters: waveHeight,
      maxWaveHeightNextHoursMeters: maxWaveHeight,
      wavePeriodSeconds: wavePeriod,
      windSpeedKmh: windSpeed,
      windGustKmh: windGust,
      currentVelocityKmh: currentVel,
      swellHeightMeters: swellHeight,
      swellPeriodSeconds: swellPeriod,
      modelLatitude: 0,
      modelLongitude: 0,
    };
    onApply(customForecast);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="test-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="test-modal-header">
          <div className="test-title-row">
            <Sliders size={20} className="test-header-icon" />
            <h3>Simulatore / Modalità Test</h3>
          </div>
          <button className="test-close-btn" onClick={onClose} aria-label="Chiudi">
            <X size={20} />
          </button>
        </div>

        <p className="test-modal-desc">
          Inietta previsioni personalizzate per testare l’aspetto del widget e le soglie di sicurezza della navigazione.
        </p>

        {/* Pulsanti Rapidi Preset */}
        <div className="preset-buttons-row">
          <button className="preset-btn calm" onClick={() => applyPreset('calmo')}>
            Calmo
          </button>
          <button className="preset-btn caution" onClick={() => applyPreset('agitato')}>
            Agitato
          </button>
          <button className="preset-btn unsafe" onClick={() => applyPreset('grosso')}>
            Grosso
          </button>
        </div>

        {/* Sliders */}
        <div className="test-sliders-list">
          <div className="slider-item">
            <div className="slider-label-row">
              <span>Altezza onda</span>
              <strong>{waveHeight.toFixed(1)} m</strong>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={waveHeight}
              onChange={(e) => setWaveHeight(parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-item">
            <div className="slider-label-row">
              <span>Picco a 6 ore</span>
              <strong>{maxWaveHeight.toFixed(1)} m</strong>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={maxWaveHeight}
              onChange={(e) => setMaxWaveHeight(parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-item">
            <div className="slider-label-row">
              <span>Periodo onda</span>
              <strong>{wavePeriod.toFixed(0)} s</strong>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={wavePeriod}
              onChange={(e) => setWavePeriod(parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-item">
            <div className="slider-label-row">
              <span>Vento</span>
              <strong>{windSpeed.toFixed(0)} km/h</strong>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="1"
              value={windSpeed}
              onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-item">
            <div className="slider-label-row">
              <span>Raffiche</span>
              <strong>{windGust.toFixed(0)} km/h</strong>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="1"
              value={windGust}
              onChange={(e) => setWindGust(parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-item">
            <div className="slider-label-row">
              <span>Corrente</span>
              <strong>{currentVel.toFixed(1)} km/h</strong>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={currentVel}
              onChange={(e) => setCurrentVel(parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-item">
            <div className="slider-label-row">
              <span>Mareggiata (Swell)</span>
              <strong>{swellHeight.toFixed(1)} m</strong>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={swellHeight}
              onChange={(e) => setSwellHeight(parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-item">
            <div className="slider-label-row">
              <span>Periodo mareggiata</span>
              <strong>{swellPeriod.toFixed(0)} s</strong>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={swellPeriod}
              onChange={(e) => setSwellPeriod(parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Footer azioni */}
        <div className="test-modal-actions">
          <button className="apply-btn" onClick={handleApply}>
            <Check size={18} />
            <span>Applica e apri</span>
          </button>
          <button className="disable-btn" onClick={onDisable}>
            <RotateCcw size={18} />
            <span>Disattiva test</span>
          </button>
        </div>
      </div>
    </div>
  );
};
