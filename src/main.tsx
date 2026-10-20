import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import App from "./App";
import "./styles/globals.css";
import "./styles/forms.css";
import "./styles/auth.css";
import "./styles/dashboard.css";
import "./styles/modals.css";
import "./styles/motion.css";
import "./styles/responsive.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);