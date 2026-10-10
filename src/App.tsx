import { useState, useEffect, useCallback } from 'react';
import { GeoPoint, MarineForecast, NavigationAssessment } from './types/marine';
import { MarineForecastClient } from './services/marineClient';
import { MarineNavigationAdvisor } from './services/navigationAdvisor';
import { LocationService } from './services/locationService';
import { CacheService } from './services/cacheService';
import { WidgetCard } from './components/WidgetCard';
import { ForecastDetail } from './components/ForecastDetail';
import { TestModePanel } from './components/TestModePanel';
import { LocationPicker } from './components/LocationPicker';
import { Sliders, MapPin, Smartphone, Maximize2 } from 'lucide-react';
import './styles/app.css';

export function App() {
  const [forecast, setForecast] = useState<MarineForecast | null>(null);
  const [assessment, setAssessment] = useState<NavigationAssessment | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [currentPoint, setCurrentPoint] = useState<GeoPoint | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatedAtText, setUpdatedAtText] = useState<string>('Caricamento...');
  const [viewMode, setViewMode] = useState<'home' | 'detail'>('home');
  const [showTestModal, setShowTestModal] = useState<boolean>(false);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [isTestMode, setIsTestMode] = useState<boolean>(false);

  const formatTimestamp = (date: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `Aggiornato ${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  };

  // Carica i dati per un determinato punto geografico
  const loadForecastForPoint = useCallback(
    async (point: GeoPoint, customName?: string) => {
      setLoading(true);
      try {
        setCurrentPoint(point);
        LocationService.saveLastLocation(point);

        // Risolvi il nome se non specificato
        let resolvedName = customName;
        if (!resolvedName) {
          resolvedName = await LocationService.resolveLocationName(point);
        }
        setLocationName(resolvedName);

        // Chiama le API Open-Meteo
        const freshForecast = await MarineForecastClient.fetch(point);
        const evalResult = MarineNavigationAdvisor.assess(freshForecast);

        setForecast(freshForecast);
        setAssessment(evalResult);
        const stamp = formatTimestamp(new Date());
        setUpdatedAtText(stamp);

        // Salva in cache
        CacheService.save(point, resolvedName, freshForecast);
      } catch (err: any) {
        console.error('Errore nel recupero previsioni:', err);
        // Fallback a dati in cache se disponibili
        const cached = CacheService.load();
        if (cached) {
          setForecast(cached.forecast);
          setAssessment(MarineNavigationAdvisor.assess(cached.forecast));
          setLocationName(cached.locationName);
          setCurrentPoint(cached.point);
          const age = CacheService.getAgeText(cached.timestamp);
          setUpdatedAtText(`Dati di ${age} (cache)`);
        } else {
          setUpdatedAtText('Dati non disponibili. Controlla connessione.');
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Rilevamento GPS
  const handleRequestGps = useCallback(async () => {
    setLoading(true);
    try {
      const gpsPoint = await LocationService.getCurrentPosition();
      await loadForecastForPoint(gpsPoint);
    } catch (err: any) {
      console.warn('GPS fallback:', err.message);
      // Se il GPS fallisce, prova l'ultima posizione salvata o un default marittimo (Capri / Golfo di Napoli)
      const lastPoint = LocationService.getLastLocation() || {
        latitude: 40.5507,
        longitude: 14.2426,
      };
      await loadForecastForPoint(lastPoint, 'Capri / Golfo di Napoli');
    }
  }, [loadForecastForPoint]);

  // Avvio iniziale dell'applicazione
  useEffect(() => {
    // 1. Controllo se è attiva la modalità test
    if (CacheService.isTestMode()) {
      const testData = CacheService.loadTestForecast();
      if (testData) {
        setForecast(testData);
        setAssessment(MarineNavigationAdvisor.assess(testData));
        setLocationName('TEST (Simulazione)');
        setIsTestMode(true);
        setUpdatedAtText('Simulazione Attiva');
        setLoading(false);
        return;
      }
    }

    // 2. Precarica istantaneamente dalla cache per evitare flash di caricamento
    const cached = CacheService.load();
    if (cached) {
      setForecast(cached.forecast);
      setAssessment(MarineNavigationAdvisor.assess(cached.forecast));
      setLocationName(cached.locationName);
      setCurrentPoint(cached.point);
      setUpdatedAtText(`Dati di ${CacheService.getAgeText(cached.timestamp)}`);
      setLoading(false);
    }

    // 3. Esegui refresh su posizione GPS o salvata
    handleRequestGps();
  }, [handleRequestGps]);

  // Gestione applicazione modalità test
  const handleApplyTestForecast = (testForecast: MarineForecast) => {
    CacheService.setTestMode(true);
    CacheService.saveTestForecast(testForecast);
    setIsTestMode(true);
    setForecast(testForecast);
    setAssessment(MarineNavigationAdvisor.assess(testForecast));
    setLocationName('TEST');
    setUpdatedAtText('Simulazione');
    setShowTestModal(false);
    setViewMode('detail'); // Apri direttamente il dettaglio come nell'app Android
  };

  // Disattivazione test
  const handleDisableTest = () => {
    CacheService.setTestMode(false);
    setIsTestMode(false);
    setShowTestModal(false);
    handleRequestGps();
  };

  // Refresh
  const handleRefresh = () => {
    if (isTestMode && forecast) {
      setAssessment(MarineNavigationAdvisor.assess(forecast));
      setUpdatedAtText('Simulazione Attiva');
      return;
    }
    if (currentPoint) {
      loadForecastForPoint(currentPoint, locationName || undefined);
    } else {
      handleRequestGps();
    }
  };

  return (
    <>
      {/* VISTA DETTAGLIO A SCHERMO INTERO */}
      {viewMode === 'detail' && forecast && assessment && (
        <ForecastDetail
          forecast={forecast}
          assessment={assessment}
          locationName={locationName}
          updatedAtText={updatedAtText}
          loading={loading}
          onRefresh={handleRefresh}
          onBack={() => setViewMode('home')}
          onOpenLocationPicker={() => setShowLocationPicker(true)}
        />
      )}

      {/* VISTA HOME / WIDGET */}
      <div className="app-container">
        {/* Intestazione Brand */}
        <header className="app-header">
          <div className="app-branding">
            <div className="brand-left">
              <img src="/icons/icon.svg" alt="SeaWidget" className="app-logo" />
              <h1 className="app-title">SeaWidget</h1>
            </div>
            {isTestMode && <span className="test-pill-badge">Test Mode</span>}
          </div>
          <p className="app-subtitle">
            Widget meteo marino con indicazione prudenziale di navigabilità vicino alla tua posizione.
          </p>
        </header>

        {/* Replica Widget Android */}
        <section className="app-widget-wrapper">
          <WidgetCard
            forecast={forecast}
            assessment={assessment}
            locationName={locationName}
            updatedAtText={updatedAtText}
            loading={loading}
            onRefresh={handleRefresh}
            onOpenDetail={() => setViewMode('detail')}
          />
        </section>

        {/* Scheda Azioni e Controllo */}
        <section className="app-controls-card">
          <h2 className="card-title">Opzioni & Navigazione</h2>
          <p className="card-desc">
            Tocca il widget per aprire l’analisi dettagliata con le barre delle condizioni marine o seleziona una specifica area nautica.
          </p>

          <div className="card-buttons-row">
            <button
              className="btn-primary"
              onClick={() => setViewMode('detail')}
              disabled={!forecast}
            >
              <Maximize2 size={16} />
              <span>Apri Schermata Dettaglio</span>
            </button>

            <button
              className="btn-outline"
              onClick={() => setShowLocationPicker(true)}
            >
              <MapPin size={16} />
              <span>Cambia Località</span>
            </button>

            <button
              className="btn-outline"
              onClick={() => setShowTestModal(true)}
            >
              <Sliders size={16} />
              <span>Modalità Test</span>
            </button>
          </div>

          {/* Istruzioni PWA per iPhone */}
          <div className="pwa-instruction-box">
            <Smartphone size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Installazione su iPhone:</strong> In Safari, tocca il tasto Condividi{' '}
              <span style={{ fontSize: '14px' }}>⎋</span> in basso e seleziona{' '}
              <strong>"Aggiungi a schermata Home"</strong> per avviarla a schermo intero come una vera app nativa!
            </div>
          </div>
        </section>

        <footer className="app-footer-disclaimer">
          Fonte dati: Open-Meteo Marine. Non sostituisce bollettini ufficiali, ordinanze o valutazioni nautiche.
        </footer>
      </div>

      {/* MODALE TEST */}
      {showTestModal && (
        <TestModePanel
          initialForecast={forecast}
          onApply={handleApplyTestForecast}
          onDisable={handleDisableTest}
          onClose={() => setShowTestModal(false)}
        />
      )}

      {/* MODALE LOCATION PICKER */}
      {showLocationPicker && (
        <LocationPicker
          currentPoint={currentPoint}
          currentLocationName={locationName}
          onSelectPoint={(point, name) => loadForecastForPoint(point, name)}
          onRequestGps={handleRequestGps}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </>
  );
}
export default App;
