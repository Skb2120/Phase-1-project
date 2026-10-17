import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { BackupRecoveryPage } from '@/pages/BackupRecoveryPage';
import { CanMonitorPage } from '@/pages/CanMonitorPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EventsPage } from '@/pages/EventsPage';
import { FaultsPage } from '@/pages/FaultsPage';
import { NodesPage } from '@/pages/NodesPage';
import { SensorsPage } from '@/pages/SensorsPage';
import { RelayPage } from '@/pages/RelayPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { TopologyPage } from '@/pages/TopologyPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/nodes" element={<NodesPage />} />
          <Route path="/sensors" element={<SensorsPage />} />
          <Route path="/can-monitor" element={<CanMonitorPage />} />
          <Route path="/faults" element={<FaultsPage />} />
          <Route path="/backup" element={<BackupRecoveryPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/topology" element={<TopologyPage />} />
          <Route path="/relay" element={<RelayPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
