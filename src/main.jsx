import React from "react";
import ReactDOM from "react-dom/client";
import FitnessRoadmap from "./FitnessRoadmap";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Register PWA service worker
import { registerSW } from "virtual:pwa-register";
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FitnessRoadmap />
    <SpeedInsights />
  </React.StrictMode>
);
