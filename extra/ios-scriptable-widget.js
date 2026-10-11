// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: water;
/**
 * SeaWidget per Scriptable (iOS Home Screen Widget)
 * Replica esatta del widget Android con sfondo fotografico dinamico del mare!
 */

// Coordinate di default (se il GPS non è disponibile o in attesa del primo fix)
const DEFAULT_LAT = 40.5507; // Capri / Golfo di Napoli
const DEFAULT_LON = 14.2426;

// Funzione per scaricare e memorizzare in cache locale le immagini (funziona anche offline!)
async function getCachedImage(filename) {
  const fm = FileManager.local();
  const dir = fm.documentsDirectory();
  const path = fm.joinPath(dir, filename);
  if (fm.fileExists(path)) {
    return fm.readImage(path);
  }
  try {
    const url = `https://raw.githubusercontent.com/vanhelsing71/seawidget-web/main/public/images/${filename}`;
    const req = new Request(url);
    const img = await req.loadImage();
    if (img) {
      fm.writeImage(path, img);
      return img;
    }
  } catch (e) {
    console.log('Impossibile scaricare ' + filename + ': ' + e);
  }
  return null;
}

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

  // Calcolo Navigabilità (algoritmo SeaWidget)
  const limitingWave = Math.max(waveH, maxWaveH);
  const period = Math.max(waveP, 1.0);
  const steepness = limitingWave / period;
  const isVerySteep = steepness > 0.35 && limitingWave > 1.8;
  const isSteep = steepness > 0.25 && limitingWave > 1.2;

  let statusText = 'Navigabile';
  let statusColor = new Color('#7CFFB2');
  let bgFilename = 'calmo.jpg';

  if (limitingWave > 2.5 || currentV > 8.0 || isVerySteep || windS > 55.0) {
    statusText = 'Non consigliato';
    statusColor = new Color('#FF7676');
    bgFilename = 'grosso.jpg';
  } else if (limitingWave > 1.5 || currentV > 5.0 || isSteep || windS > 40.0) {
    statusText = 'Prudenza';
    statusColor = new Color('#FFD369');
    bgFilename = 'agitato.jpg';
  }

  // Impostazione sfondo fotografico dinamico
  const bgImage = await getCachedImage(bgFilename);
  if (bgImage) {
    widget.backgroundImage = bgImage;
  }

  // Costruzione Grafica Widget con ombre per massima leggibilità
  const headerStack = widget.addStack();
  headerStack.layoutHorizontally();

  const titleText = headerStack.addText(locName);
  titleText.font = Font.boldSystemFont(13);
  titleText.textColor = Color.white();
  titleText.shadowColor = new Color('#000000', 0.9);
  titleText.shadowOffset = new Point(1, 1);
  titleText.shadowRadius = 3;

  headerStack.addSpacer();

  const now = new Date();
  const timeText = headerStack.addText(
    `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  );
  timeText.font = Font.systemFont(11);
  timeText.textColor = new Color('#ffffff', 0.85);
  timeText.shadowColor = new Color('#000000', 0.9);
  timeText.shadowOffset = new Point(1, 1);
  timeText.shadowRadius = 3;

  widget.addSpacer(8);

  const statusEl = widget.addText(statusText);
  statusEl.font = Font.boldSystemFont(22);
  statusEl.textColor = statusColor;
  statusEl.shadowColor = new Color('#000000', 0.95);
  statusEl.shadowOffset = new Point(1, 2);
  statusEl.shadowRadius = 4;

  widget.addSpacer(4);

  const detailText = `Onda ${waveH.toFixed(1)} m, periodo ${waveP.toFixed(0)} s\nVento ${windS.toFixed(0)} km/h, corr. ${currentV.toFixed(1)} km/h${
    maxWaveH > waveH ? `\nPicco 6h ${maxWaveH.toFixed(1)} m` : ''
  }`;
  const detailsEl = widget.addText(detailText);
  detailsEl.font = Font.systemFont(12);
  detailsEl.textColor = new Color('#ffffff', 0.95);
  detailsEl.shadowColor = new Color('#000000', 0.9);
  detailsEl.shadowOffset = new Point(1, 1);
  detailsEl.shadowRadius = 3;

  // Al tocco apre direttamente l'app SeaWidget
  widget.url = 'https://vanhelsing71.github.io/seawidget-web/';

  return widget;
}

const widget = await createWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}
Script.complete();
