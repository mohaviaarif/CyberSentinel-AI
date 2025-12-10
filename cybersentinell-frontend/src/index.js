import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

/* -------------------------------------------------------
    🌟 GLOBAL THEME CONTEXT (Dark/Light Mode Ready)
------------------------------------------------------- */
const ThemeContext = React.createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState("dark");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    document.body.setAttribute("data-theme", theme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* -------------------------------------------------------
    🌟 GLOBAL TOAST (Notifications)
------------------------------------------------------- */
const ToastContext = React.createContext();

function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const notify = (msg, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}

      <div className="global-toast-wrapper">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-item toast-${t.type}`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* -------------------------------------------------------
    🌟 ERROR BOUNDARY (Protect UI from crashes)
------------------------------------------------------- */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, info: error };
  }

  componentDidCatch(error, info) {
    console.error("❌ UI Crash Detected:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            color: "white",
            padding: "2em",
          }}
        >
          <h1>⚠️ Something went wrong</h1>
          <p>The UI recovered safely. Check console for details.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

/* -------------------------------------------------------
    🌟 GLOBAL LOADING FALLBACK
------------------------------------------------------- */
function LoadingScreen() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#A4C7EC",
        fontSize: "1.4em",
        fontWeight: 600,
      }}
    >
      Booting Cyber Sentinel…
    </div>
  );
}

/* -------------------------------------------------------
    🌟 PERFORMANCE METRICS (Optional)
------------------------------------------------------- */
function reportVitals(metric) {
  console.log("📈 Performance Metric:", metric);
}

/* -------------------------------------------------------
    🌟 RENDER ROOT
------------------------------------------------------- */
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <React.Suspense fallback={<LoadingScreen />}>
            <App />
          </React.Suspense>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Optional: Track performance
reportVitals();
