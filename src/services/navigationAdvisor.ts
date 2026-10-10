import { MarineForecast, NavigationAssessment, NavigationLevel } from '../types/marine';

export const MarineNavigationAdvisor = {
  assess(forecast: MarineForecast): NavigationAssessment {
    const limitingWave = Math.max(forecast.waveHeightMeters, forecast.maxWaveHeightNextHoursMeters);

    // Calcolo della ripidezza dell'onda (Steepness)
    // Evitiamo divisioni per zero impostando un periodo minimo di 1 secondo
    const period = Math.max(forecast.wavePeriodSeconds, 1.0);
    const steepness = limitingWave / period;

    // Se l'onda supera 1.2m e la ripidezza è alta, può creare problemi di comfort
    // a un catamarano di 33m costringendolo a ridurre la velocità.
    const isVerySteep = steepness > 0.35 && limitingWave > 1.8;
    const isSteep = steepness > 0.25 && limitingWave > 1.2;

    let level: NavigationLevel;
    if (
      limitingWave > 2.5 ||
      forecast.currentVelocityKmh > 8.0 ||
      isVerySteep ||
      forecast.windSpeedKmh > 55.0 ||
      forecast.windGustKmh > 75.0
    ) {
      level = 'Unsafe';
    } else if (
      limitingWave > 1.5 ||
      forecast.currentVelocityKmh > 5.0 ||
      isSteep ||
      forecast.windSpeedKmh > 40.0 ||
      forecast.windGustKmh > 55.0
    ) {
      level = 'Caution';
    } else {
      level = 'Good';
    }

    const status =
      level === 'Good' ? 'Navigabile' : level === 'Caution' ? 'Prudenza' : 'Non consigliato';

    const details = `Onda ${forecast.waveHeightMeters.toFixed(1)} m, periodo ${forecast.wavePeriodSeconds.toFixed(0)} s\nVento ${forecast.windSpeedKmh.toFixed(0)} km/h, corr. ${forecast.currentVelocityKmh.toFixed(1)} km/h`;

    return {
      level,
      status,
      details,
      steepness,
    };
  },
};
