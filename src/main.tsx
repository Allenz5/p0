import "./apiShim";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./shortcutai/App.jsx";
import "./shortcutai/App.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
