import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthModalProvider } from "./context/AuthModalContext.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthModalProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthModalProvider>
  </StrictMode>,
);
