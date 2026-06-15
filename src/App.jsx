import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import MissionControl from './pages/MissionControl.jsx';
import DeepSpace from './pages/DeepSpace.jsx';
import SpaceWeather from './pages/SpaceWeather.jsx';
import OrbitalGlobe from './pages/OrbitalGlobe.jsx';
import FleetTracker from './pages/FleetTracker.jsx';
import { TimelineProvider } from './context/TimelineContext.jsx';

export default function App() {
  return (
    <TimelineProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/mission-control" replace />} />
          <Route path="/mission-control" element={<MissionControl />} />
          <Route path="/deep-space" element={<DeepSpace />} />
          <Route path="/space-weather" element={<SpaceWeather />} />
          <Route path="/orbital-globe" element={<OrbitalGlobe />} />
          <Route path="/fleet-tracker" element={<FleetTracker />} />
        </Route>
      </Routes>
    </TimelineProvider>
  );
}
