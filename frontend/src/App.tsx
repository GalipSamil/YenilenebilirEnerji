import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SolarPage from './pages/SolarPage';
import WindPage from './pages/WindPage';
import GeothermalPage from './pages/GeothermalPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <div className="App bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/*" element={
            <>
              <Navbar />
              <div style={{ paddingTop: '80px' }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/solar" element={<SolarPage />} />
                  <Route path="/wind" element={<WindPage />} />
                  <Route path="/geothermal" element={<GeothermalPage />} />
                </Routes>
              </div>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
