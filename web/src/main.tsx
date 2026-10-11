import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { sentenceTreeLoader } from "./api/sentenceTree.ts";
import { App } from "./app/App.tsx";
import "./styles/global.css";

// One call for the whole sentence tree, early: it is usually ready by the last question.
void sentenceTreeLoader.load();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
