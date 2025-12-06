import React, { useState } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { LandingPage } from './LandingPage';
import { AboutPage } from './AboutPage';
import { FeaturesPage } from './FeaturesPage';
import { FAQPage } from './FAQPage';
import { ContactPage } from './ContactPage';
import { AnalyzePage } from './AnalyzePage';
import Footer from './Footer';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <Router>
      <div className={`app-layout-pro ${sidebarCollapsed ? 'sidebar-collapsed-pro' : ''}`}>
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="main-page-wrap">
          <main className="content-pro">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/analyze" element={<AnalyzePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
