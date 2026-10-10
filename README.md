# SeaWidget Web / iOS PWA 🌊⛵

Porting completo in **Progressive Web App (PWA)** dell'applicazione Android **SeaWidget**, progettata per consultare le condizioni meteo marine e ottenere un'indicazione prudenziale di navigabilità marittima (ottimizzata per imbarcazioni e catamarani).

---

## 📱 Come usarla su iPhone

### 1. Come Web App a Schermo Intero (PWA)
1. Apri l'indirizzo della web app su **Safari** sul tuo iPhone.
2. Tocca l'icona **Condividi** (il quadrato con la freccia verso l'alto ⎋ nella barra in basso di Safari).
3. Scorri verso il basso e seleziona **"Aggiungi alla schermata Home"**.
4. Tocca **"Aggiungi"** in alto a destra.
5. Ora avrai l'icona di **SeaWidget** sulla tua schermata home: toccandola si aprirà **a schermo intero senza barre del browser**, esattamente come un'app nativa di iOS!

> **Nota GPS & Cache Offline:**
> - Su iOS, per consentire al browser di leggere il GPS, l'app deve essere servita con certificato **HTTPS** (o tramite `localhost`).
> - Grazie al **Service Worker** integrato, tutti gli sfondi fotografici ad alta definizione (`calmo.jpg`, `agitato.jpg`, `grosso.jpg`) e il codice vengono salvati nella memoria del telefono. Anche se perdi la connessione internet mentre navighi in mare aperto, l'app si aprirà all'istante mostrando l'ultima previsione salvata in cache con l'indicazione temporale (es. *"Dati di 15 min fa"*).

---

### 2. Come Widget Nativo sulla Home di iPhone (Opzionale con Scriptable)
Se desideri che il widget grafico compaia direttamente tra i widget della schermata Home di iOS (come su Android):
1. Scarica l'app gratuita **[Scriptable](https://apps.apple.com/app/scriptable/id1405459188)** dall'App Store.
2. Apri Scriptable, premi il pulsante **`+`** in alto a destra per creare un nuovo script.
3. Incolla il codice presente nel file `extra/ios-scriptable-widget.js` e salva con nome "SeaWidget".
4. Torna sulla Home del tuo iPhone, tieni premuto sullo sfondo, tocca **`+`** in alto a sinistra, cerca **Scriptable**, seleziona il widget di dimensione **Media** e imposta lo script su "SeaWidget".

---

## 🚀 Esecuzione in Locale per Sviluppo

1. Installa le dipendenze:
   ```bash
   npm install
   ```

2. Avvia il server di sviluppo Vite:
   ```bash
   npm run dev
   ```

3. Per provarlo dal tuo iPhone connesso alla stessa rete Wi-Fi del PC:
   - Vite mostrerà sia l'indirizzo locale (`http://localhost:3000`) sia l'indirizzo di rete (es. `http://192.168.1.X:3000`).
   - Apri l'indirizzo `http://192.168.1.X:3000` su Safari sul tuo iPhone.

---

## 🐳 Hosting su Server Casalingo (Docker / Nginx / NAS)

Puoi ospitare SeaWidget su qualsiasi mini PC, Raspberry Pi, server Linux o NAS (Synology, QNAP, Unraid).

### Con Docker:
```bash
# Costruzione dell'immagine
docker build -t seawidget-web -f extra/Dockerfile .

# Avvio del container sulla porta 8080 (o 80)
docker run -d --name seawidget -p 8080:80 seawidget-web
```

### Configurazione HTTPS consigliata per Home Server:
Poiché iOS Safari richiede HTTPS per geolocalizzazione e PWA, se ospiti l'app sul tuo server casalingo ti consigliamo uno di questi metodi semplicissimi:
- **Cloudflare Tunnel (gratuito e sicuro)**: collega il tuo server casalingo a un tuo dominio o sottodominio gratuito fornendo HTTPS istantaneo senza aprire porte sul router.
- **Caddy Web Server**: gestisce automaticamente i certificati Let's Encrypt con una sola riga di configurazione:
  ```
  meteo.tuodominio.it {
      reverse_proxy localhost:8080
  }
  ```

---

## ☁️ Hosting Gratuito e Immediato su Cloud (Zero Manutenzione)

Se non vuoi tenere un server acceso a casa, puoi distribuire la cartella di build (`dist/`) gratuitamente con HTTPS già configurato in 1 minuto su:
1. **Cloudflare Pages**: Collega il repository o trascina la cartella `dist/`.
2. **GitHub Pages**: Carica il codice su GitHub e attiva le Pages.
3. **Vercel** o **Netlify**: Esegui `npx vercel` o carica tramite interfaccia web.

Per generare la cartella statica di produzione:
```bash
npm run build
```
I file compilati si troveranno nella cartella `dist/`, pronti per qualsiasi web server statico.

---

## ⚓ Logica Nautica & Algoritmo di Valutazione

L'applicazione riproduce fedelmente l'algoritmo di valutazione marittima calibrato per imbarcazioni da diporto e catamarani:

- **Calcolo Ripidezza Onda (Steepness):**
  $$\text{Steepness} = \frac{\text{Onda Limite}}{\max(\text{Periodo}, 1.0)}$$
- **Valutazione di Rischio:**
  - **Non Consigliato (Rosso):** Onda $> 2.5\text{ m}$, corrente oceanica $> 8\text{ km/h}$, onda molto ripida (Steepness $> 0.35$ con onda $> 1.8\text{ m}$), vento $> 55\text{ km/h}$ o raffiche $> 75\text{ km/h}$.
  - **Prudenza (Giallo):** Onda $> 1.5\text{ m}$, corrente $> 5\text{ km/h}$, onda ripida (Steepness $> 0.25$ con onda $> 1.2\text{ m}$), vento $> 40\text{ km/h}$ o raffiche $> 55\text{ km/h}$.
  - **Navigabile (Verde):** Condizioni ideali o calme entro i limiti di sicurezza.

Tutte le metriche sono consultabili tramite le barre progressive con soglie visive calibrate per:
- Altezza onda e picco a 6 ore
- Periodo onda e periodo mareggiata (Swell)
- Velocità e raffiche del vento
- Corrente superficiale oceanica
- Altezza della mareggiata residua (Swell)
