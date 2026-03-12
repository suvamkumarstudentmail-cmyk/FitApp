import React from "react";
import ReactDOM from "react-dom/client";
import FitnessRoadmap from "./FitnessRoadmap";

// Register PWA service worker
import { registerSW } from "virtual:pwa-register";
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FitnessRoadmap />
  </React.StrictMode>
);
