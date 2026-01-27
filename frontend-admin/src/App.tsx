import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PostsPage from './pages/PostsPage';
import PostEditorPage from './pages/PostEditorPage';
import CarsPage from './pages/CarsPage';
import CarEditorPage from './pages/CarEditorPage';
import BrandsPage from './pages/BrandsPage';
import CarTypesPage from './pages/CarTypesPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import FacebookImportPage from './pages/FacebookImportPage';
import AIConfigPage from './pages/AIConfigPage';
import FacebookSyncPage from './pages/FacebookSyncPage';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/posts/new" element={<PostEditorPage />} />
        <Route path="/posts/:id" element={<PostEditorPage />} />
        <Route path="/cars" element={<CarsPage />} />
        <Route path="/cars/new" element={<CarEditorPage />} />
        <Route path="/cars/:id" element={<CarEditorPage />} />
        <Route path="/brands" element={<BrandsPage />} />
        <Route path="/car-types" element={<CarTypesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/facebook-sync" element={<FacebookSyncPage />} />
        <Route path="/ai-test" element={<FacebookImportPage />} />
        <Route path="/ai-config" element={<AIConfigPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export default App;
