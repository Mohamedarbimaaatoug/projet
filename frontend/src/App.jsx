import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Client pages
import LoginPage from './pages/LoginPage';
import ClientLayout from './layouts/ClientLayout';
import ClientDashboard from './pages/client/ClientDashboard';
import ReclamationFormPage from './pages/ReclamationFormPage';
import MyReclamationsPage from './pages/MyReclamationsPage';
import EvaluationPage from './pages/EvaluationPage';

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReclamationsPage from './pages/AdminReclamationsPage';
import AdminClientsPage from './pages/AdminClientsPage';

// Chef pages
import ChefLoginPage from './pages/chef/ChefLoginPage';
import ChefLayout from './layouts/ChefLayout';
import ChefDashboard from './pages/chef/ChefDashboard';

const CLIENT_KEY = 'hotel_paradis_client';
const ADMIN_KEY = 'hotel_paradis_admin';
const CHEF_KEY  = 'hotel_paradis_chef';

const toastStyle = {
  background: '#FFFFFF', color: '#2D2A26',
  border: '1px solid rgba(168, 143, 94, 0.15)',
  borderRadius: '12px', fontFamily: 'Outfit, sans-serif',
};

function parse(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

export default function App() {
  const [client, setClient] = useState(() => parse(CLIENT_KEY));
  const [admin, setAdmin] = useState(() => parse(ADMIN_KEY));
  const [chef,  setChef]  = useState(() => parse(CHEF_KEY));

  const loginClient  = (c) => { setClient(c); localStorage.setItem(CLIENT_KEY, JSON.stringify(c)); };
  const logoutClient = ()  => { setClient(null); localStorage.removeItem(CLIENT_KEY); };

  const loginAdmin  = (a) => { setAdmin(a); localStorage.setItem(ADMIN_KEY, JSON.stringify(a)); };
  const logoutAdmin = ()  => { setAdmin(null); localStorage.removeItem(ADMIN_KEY); };

  const loginChef  = (c) => { setChef(c); localStorage.setItem(CHEF_KEY, JSON.stringify(c)); };
  const logoutChef = ()  => { setChef(null); localStorage.removeItem(CHEF_KEY); };

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3500, style: toastStyle }} />
      <Routes>

        {/* ── CLIENT ───────────────────────────────────────── */}
        <Route
          path="/login"
          element={client ? <Navigate to="/" replace /> : <LoginPage onLogin={loginClient} />}
        />
        <Route
          path="/"
          element={client ? <ClientLayout client={client} onLogout={logoutClient} /> : <Navigate to="/login" replace />}
        >
          <Route index element={<ClientDashboard client={client} />} />
          <Route path="reclamation"    element={<ReclamationFormPage client={client} />} />
          <Route path="my-reclamations" element={<MyReclamationsPage client={client} />} />
          <Route path="evaluation"     element={<EvaluationPage client={client} />} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Route>

        {/* ── ADMIN ────────────────────────────────────────── */}
        <Route
          path="/admin"
          element={admin ? <Navigate to="/admin/dashboard" replace /> : <AdminLoginPage onLogin={loginAdmin} />}
        />
        <Route
          path="/admin/*"
          element={admin ? <AdminLayout admin={admin} onLogout={logoutAdmin} /> : <Navigate to="/admin" replace />}
        >
          <Route path="dashboard"    element={<AdminDashboard />} />
          <Route path="reclamations" element={<AdminReclamationsPage />} />
          <Route path="clients"      element={<AdminClientsPage />} />
          <Route path="*"            element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* ── CHEF ─────────────────────────────────────────── */}
        <Route
          path="/chef"
          element={chef ? <Navigate to="/chef/dashboard" replace /> : <ChefLoginPage onLogin={loginChef} />}
        />
        <Route
          path="/chef/*"
          element={chef ? <ChefLayout chef={chef} onLogout={logoutChef} /> : <Navigate to="/chef" replace />}
        >
          <Route path="dashboard" element={<ChefDashboard chef={chef} />} />
          <Route path="*"         element={<Navigate to="/chef/dashboard" replace />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
