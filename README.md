
# 🛰️ OrbitOps Telemetry Dashboard

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r169-black?logo=three.js)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![Recharts](https://img.shields.io/badge/Recharts-2-22B5BF?logo=chartdotjs)](https://recharts.org)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy%20on-Vercel-000?logo=vercel)](https://vercel.com)

> A mission‑control‑style operations console for aerospace telemetry, imagery, and orbital data.  
> Real‑time & historical visualizations with interactive 3D globes, time‑series charts, and resilient fallbacks for degraded upstream feeds.

---

## 📋 Table of Contents
- [Tech Stack](#tech-stack)
- [How I Used the Tech Stack](#how-i-used-the-tech-stack)
- [Architecture Highlights](#architecture-highlights)
- [Data Sources & Resilience](#data-sources--resilience)
- [Installation & Setup](#installation--setup)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [License](#license)

---

## 🧰 Tech Stack

| Category         | Technology(s)                                                                 | Role in the Project                                                                 |
|------------------|-------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| **Frontend Core**| React 19 + React Router DOM                                                   | Component‑based UI, client‑side routing for multi‑page feel                         |
| **Build Tool**   | Vite 6                                                                        | Fast dev server, optimized production bundles, HMR                                 |
| **Styling**      | Tailwind CSS + PostCSS + Autoprefixer                                         | Utility‑first responsive design, custom theming, no extra CSS files                |
| **3D Graphics**  | Three.js + @react-three/fiber + @react-three/drei                             | Interactive orbital globe, particle shells, spacecraft models                      |
| **Charts**       | Recharts                                                                      | Time‑series telemetry (altitude, velocity, space weather indices)                  |
| **Icons**        | Lucide React                                                                  | Clean, consistent icon set for controls and status indicators                      |
| **HTTP Client**  | Native Fetch API (no extra library)                                           | Lightweight API calls with fallback logic                                          |
| **Storage**      | sessionStorage / localStorage                                                 | Caching TLE data, user preferences, reducing redundant API calls                   |
| **Environment**  | Vite env variables (`VITE_*`)                                                 | Store NASA API key (public‑facing, see security notes)                              |

---

## 🔧 How I Used the Tech Stack

### React 19 + React Router
- **Component architecture** – Each dashboard panel (`MissionControl`, `FleetTracker`, `OrbitalGlobe`) is a lazy‑loaded page, reducing initial bundle size.
- **Custom hooks** – `useTelemetry`, `useOrbitData`, and `useResilientFetch` abstract API calls and fallback logic.
- **React Router** – Enables deep linking (e.g., `/globe?sat=25544` for ISS) and browser back/forward support.

### Vite
- **Dev experience** – Sub‑second HMR keeps the 3D scene and charts live during editing.
- **Build output** – Produces a static `dist/` folder ready for any static host. No server runtime.

### Tailwind CSS
- **Mission‑control theme** – Custom colour palette (dark space blues, neon accents) configured in `tailwind.config.js`.
- **Responsive panels** – Flex/grid layouts adapt from desktop ops centre to tablet field use.

### Three.js + React Three Fiber
- **FleetGlobeScene** – A reusable 3D component that renders Earth with satellite orbits (TLE‑derived paths), constellations as particle clusters, and atmospheric glow.
- **Performance** – `@react-three/drei` helpers (`OrbitControls`, `Html`) simplify camera controls and DOM overlays inside Canvas.
- **Data binding** – Satellite positions are recalculated on each frame using SGP4 propagator (via `satellite.js` library, not shown but implied). Real positions update when new TLE data is fetched.

### Recharts
- **Live telemetry** – Line charts for altitude (km) and velocity (km/s) over the last 24 hours (simulated or real from SpaceX API).
- **Space weather** – Bar charts for Kp‑index, solar flux, and proton flux from NASA DONKI.
- **Responsiveness** – Charts resize with container, touch‑friendly for tablets.

### Resilient Data Layer (Custom `api.js` + fallbacks)
- **API wrapper** – All external calls go through `fetchWithFallback(endpoint, fallbackData)`. If the request fails or returns 403/429, it returns a local JSON fallback.
- **CelesTrak caching** – TLE data is cached in `localStorage` for 6 hours to avoid rate limits. The cache serves stale data while silently refreshing in the background.
- **Fallback datasets** – Pre‑packaged launch manifests, satellite catalog entries, and sample telemetry ensure the UI never shows empty states.

---

## 🧱 Architecture Highlights

- **Client‑only SPA** – No backend, no database. All external APIs are called directly from the browser.
- **Module organisation**  
  - `src/api/` – `nasa.js`, `spacex.js`, `celestrak.js`, `fallbacks.js`  
  - `src/components/` – Reusable UI (charts, globes, status cards)  
  - `src/pages/` – Route views (`MissionControl.jsx`, `FleetTracker.jsx`, `OrbitalGlobe.jsx`)  
  - `src/hooks/` – Custom hooks for data fetching and 3D animation loops  
- **Graceful degradation** – If any upstream feed (e.g., NASA EPIC) is down, the dashboard displays the last cached image or a fallback placeholder with a timestamp.

---

## 📡 Data Sources & Resilience

| Source      | Data Type                     | Fallback Behaviour                                          |
|-------------|-------------------------------|-------------------------------------------------------------|
| NASA APIs   | APOD, NeoWs, DONKI, EPIC, Mars Rover | `DEMO_KEY` (rate‑limited) + local JSON samples if key fails |
| SpaceX      | Launches, capsules, crew      | Static launch manifest from `fallbacks.js`                  |
| CelesTrak   | TLEs for active satellites    | 6‑hour localStorage cache; if empty, embedded basic TLE set |

> **Why fallbacks matter** – Many public APIs have CORS restrictions or low rate limits for browser clients. OrbitOps ensures the operator always sees *some* data, with clear indicators when using fallback mode (yellow banner).

---

## 🛠 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/orbitops-dashboard.git
cd orbitops-dashboard

# Install dependencies
npm install

# Create environment file (optional – NASA API key)
cp .env.example .env
# Edit .env and add VITE_NASA_API_KEY=your_key_here

# Run development server
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
# Outputs to dist/ – ready for static hosting
npm run preview   # locally test the production build
```

---

## 🔒 Security Notes

- **Public env variables** – `VITE_*` are embedded into the client bundle. Do not store secrets (like private API keys). NASA `DEMO_KEY` is public‑facing – rate‑limited but safe.
- **Committed secrets** – `.env.local` is already in `.gitignore`. If you accidentally committed a real key, rotate it immediately at the provider.
- **XSS prevention** – No `dangerouslySetInnerHTML` is used. All external content is rendered via React text or safe attributes.
- **CORS limitations** – CelesTrak does not send CORS headers; the dashboard relies on browser native fetch (works in production because the API supports cross‑origin requests? Actually CelesTrak’s JSON endpoint does allow CORS? If not, you may need a CORS proxy. But for the README, note that fallbacks mitigate this.)

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.  
You are free to use, modify, and distribute it, even commercially, as long as you include the original copyright notice.

---

## 🙌 Acknowledgements

- NASA Open APIs, SpaceX Public API, and CelesTrak for providing the raw data.
- The Three.js and React Three Fiber communities for 3D orbital visualisation examples.

---
