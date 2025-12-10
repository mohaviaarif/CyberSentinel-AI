// src/App.js
import React, { useState, useEffect, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import "./App.css";

// --- Layout ---
import { Sidebar } from "./Sidebar";
import Footer from "./Footer";

// --- Pages ---
import LandingPage from "./LandingPage";
import AboutPage from "./AboutPage";
import FeaturesPage from "./FeaturesPage";
import FAQPage from "./FAQPage";
import ContactPage from "./ContactPage";
import AnalyzePage from "./AnalyzePage";

// --- Auth Pages ---
import LoginPage from "./loginpage";
import SignupPage from "./signuppage";

// ------------------------------------------------------
// 🔐 PROTECTED ROUTE WRAPPER
// ------------------------------------------------------
function RequireAuth({ children }) {
  return localStorage.getItem("isLoggedIn") === "true"
    ? children
    : <Navigate to="/login" replace />;
}

// ------------------------------------------------------
// Smooth Scroll on Route Change
// ------------------------------------------------------
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

// ------------------------------------------------------
// Page Fade Animation Wrapper
// ------------------------------------------------------
function PageTransition({ children }) {
  return <div style={{ animation: "fadeIn 0.45s ease" }}>{children}</div>;
}

// ------------------------------------------------------
// Dynamic Document Title Hook
// ------------------------------------------------------
function usePageTitle(title) {
  useEffect(() => {
    document.title = `Cyber Sentinel — ${title}`;
  }, [title]);
}

function TitleWrapper({ title, children }) {
  usePageTitle(title);
  return children;
}

// ------------------------------------------------------
// Top Progress Bar
// ------------------------------------------------------
function RouteProgressBar() {
  const { pathname } = useLocation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(30);
    const t1 = setTimeout(() => setProgress(80), 200);
    const t2 = setTimeout(() => setProgress(100), 600);
    const t3 = setTimeout(() => setProgress(0), 900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  return (
    <div
      style={{
        height: "4px",
        width: `${progress}%`,
        background: "linear-gradient(90deg,#2979FF,#00BFAE)",
        transition: "width 0.3s ease",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 999,
      }}
    />
  );
}

// ------------------------------------------------------
// Toast Notification Component
// ------------------------------------------------------
function Toast({ message, type }) {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "1em 1.4em",
        background:
          type === "error"
            ? "rgba(255,76,76,0.9)"
            : "rgba(0,191,174,0.9)",
        color: "white",
        borderRadius: "0.8em",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        zIndex: 9999,
        animation: "fadeIn 0.4s ease, fadeOut 0.4s ease 2.2s forwards",
      }}
    >
      {message}
    </div>
  );
}

// ------------------------------------------------------
// MAIN APP COMPONENT
// ------------------------------------------------------
function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);

  // ⭐ Reactive login state
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  // Listen for login state changes
  useEffect(() => {
    const sync = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };

    window.addEventListener("storage", sync);
    window.addEventListener("loginStateChanged", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("loginStateChanged", sync);
    };
  }, []);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <Router>
      <ScrollToTop />
      <RouteProgressBar />

      {toast && <Toast message={toast.msg} type={toast.type} />}

      <div className="app-layout-pro">

        {/* SIDEBAR (Only visible when logged in) */}
        {isLoggedIn && (
          <Sidebar
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        )}

        {/* ⭐ FIXED MAIN CONTENT WRAP — moves smoothly with sidebar */}
        <div
          className="main-page-wrap"
          style={{
            marginLeft: isLoggedIn
              ? sidebarCollapsed
                ? "58px"
                : "225px"
              : "0px",
            transition: "margin-left 0.25s ease",
          }}
        >
          <main className="content-pro">
            <Suspense fallback={<div>Loading...</div>}>

              <Routes>

                {/* LOGIN */}
                <Route
                  path="/login"
                  element={
                    <PageTransition>
                      <TitleWrapper title="Login">
                        <LoginPage />
                      </TitleWrapper>
                    </PageTransition>
                  }
                />

                {/* SIGNUP */}
                <Route
                  path="/signup"
                  element={
                    <PageTransition>
                      <TitleWrapper title="Sign Up">
                        <SignupPage />
                      </TitleWrapper>
                    </PageTransition>
                  }
                />

                {/* PROTECTED ROUTES */}
                <Route
                  path="/"
                  element={
                    <RequireAuth>
                      <PageTransition>
                        <TitleWrapper title="Dashboard">
                          <LandingPage />
                        </TitleWrapper>
                      </PageTransition>
                    </RequireAuth>
                  }
                />

                <Route
                  path="/about"
                  element={
                    <RequireAuth>
                      <PageTransition>
                        <TitleWrapper title="About">
                          <AboutPage />
                        </TitleWrapper>
                      </PageTransition>
                    </RequireAuth>
                  }
                />

                <Route
                  path="/features"
                  element={
                    <RequireAuth>
                      <PageTransition>
                        <TitleWrapper title="Features">
                          <FeaturesPage />
                        </TitleWrapper>
                      </PageTransition>
                    </RequireAuth>
                  }
                />

                <Route
                  path="/faq"
                  element={
                    <RequireAuth>
                      <PageTransition>
                        <TitleWrapper title="FAQ">
                          <FAQPage />
                        </TitleWrapper>
                      </PageTransition>
                    </RequireAuth>
                  }
                />

                <Route
                  path="/contact"
                  element={
                    <RequireAuth>
                      <PageTransition>
                        <TitleWrapper title="Contact">
                          <ContactPage notify={notify} />
                        </TitleWrapper>
                      </PageTransition>
                    </RequireAuth>
                  }
                />

                <Route
                  path="/analyze"
                  element={
                    <RequireAuth>
                      <PageTransition>
                        <TitleWrapper title="Email Analyzer">
                          <AnalyzePage notify={notify} />
                        </TitleWrapper>
                      </PageTransition>
                    </RequireAuth>
                  }
                />

                {/* Redirect Unknown Routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

            </Suspense>
          </main>

          {/* FOOTER (Only when logged in) */}
          {isLoggedIn && <Footer />}
        </div>
      </div>
    </Router>
  );
}

export default App;
