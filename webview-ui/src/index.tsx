import React from "react";
import ReactDOM from "react-dom/client";
import "@vscode/codicons/dist/codicon.css";
import App from "./App";
import "./App.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
