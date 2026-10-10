// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: water;
/**
 * SeaWidget per Scriptable (iOS Home Screen Widget)
 * Replica esatta del widget Android di SeaWidget direttamente sulla Home Screen di iOS!
 *
 * Requisiti:
 * 1. Scarica l'app gratuita "Scriptable" da App Store.
 * 2. Crea un nuovo script, incolla questo codice e nominalo "SeaWidget".
 * 3. Aggiungi un widget Scriptable (Medio) alla schermata Home del tuo iPhone.
 */

// Imposta qui le coordinate di default (o lascia vuoto per usare il GPS del telefono)
const DEFAULT_LAT = 40.5507; // Capri / Golfo di Napoli
const DEFAULT_LON = 14.2426;

async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = new Color('#063247');

  let lat = DEFAULT_LAT;
  let lon = DEFAULT_LON;
  let locName = 'Meteo mare';

  try {
    Location.setAccuracyToHundredMeters();
    const loc = await Location.current();
    if (loc) {
      lat = loc.latitude;
      lon = loc.longitude;
    }
  } catch (e) {
    console.log('GPS non disponibile, uso coordinate predefinite');
  }

  // Chiamate API Open-Meteo
  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=wave_height,wave_period,ocean_current_velocity&hourly=wave_height&forecast_hours=6&timezone=auto&cell_selection=sea`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=wind_speed_10m,wind_gusts_10m&timezone=auto`;

  let waveH = 0, waveP = 0, currentV = 0, windS = 0, maxWaveH = 0;

  try {
    const reqM = new Request(marineUrl);
    const resM = await reqM.loadJSON();
    const curM = resM.current || {};
    waveH = curM.wave_height || 0;
    waveP = curM.wave_period || 0;
    currentV = curM.ocean_current_velocity || 0;

    const hourly = resM.hourly?.wave_height || [];
    maxWaveH = hourly.length > 0 ? Math.max(...hourly, waveH) : waveH;

    const reqW = new Request(weatherUrl);
    const resW = await reqW.loadJSON();
    const curW = resW.current || {};
    windS = curW.wind_speed_10m || 0;
  } catch (e) {
    console.log('Errore di rete: ' + e);
  }

  // Calcolo Navigabilità
  const limitingWave = Math.max(waveH, maxWaveH);
  const period = Math.max(waveP, 1.0);
  const steepness = limitingWave / period;
  const isVerySteep = steepness > 0.35 && limitingWave > 1.8;
  const isSteep = steepness > 0.25 && limitingWave > 1.2;

  let statusText = 'Navigabile';
  let statusColor = new Color('#7CFFB2');

  if (limitingWave > 2.5 || currentV > 8.0 || isVerySteep || windS > 55.0) {
    statusText = 'Non consigliato';
    statusColor = new Color('#FF7676');
  } else if (limitingWave > 1.5 || currentV > 5.0 || isSteep || windS > 40.0) {
    statusText = 'Prudenza';
    statusColor = new Color('#FFD369');
  }

  // Costruzione Grafica Widget
  const headerStack = widget.addStack();
  headerStack.layoutHorizontally();

  const titleText = headerStack.addText(locName);
  titleText.font = Font.boldSystemFont(13);
  titleText.textColor = Color.white();
  headerStack.addSpacer();

  const now = new Date();
  const timeText = headerStack.addText(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
  timeText.font = Font.systemFont(11);
  timeText.textColor = new Color('#B9D6E8', 0.7);

  widget.addSpacer(8);

  const statusEl = widget.addText(statusText);
  statusEl.font = Font.boldSystemFont(22);
  statusEl.textColor = statusColor;

  widget.addSpacer(4);

  const detailText = `Onda ${waveH.toFixed(1)} m, periodo ${waveP.toFixed(0)} s\nVento ${windS.toFixed(0)} km/h, corr. ${currentV.toFixed(1)} km/h${maxWaveH > waveH ? `\nPicco 6h ${maxWaveH.toFixed(1)} m` : ''}`;
  const detailsEl = widget.addText(detailText);
  detailsEl.font = Font.systemFont(12);
  detailsEl.textColor = new Color('#ffffff', 0.9);

  return widget;
}

const widget = await createWidget();
if (config.runsInWidget) {
  Scriptable.setWidget(widget);
} else {
  widget.presentMedium();
}
Scriptable.complete();
