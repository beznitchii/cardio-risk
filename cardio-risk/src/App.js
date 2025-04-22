import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import RiskForm from "./components/RiskForm";

function App() {
  const { i18n } = useTranslation();
  const changeLanguage = (lng) => i18n.changeLanguage(lng);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ textAlign: "right" }}>
        <button onClick={() => changeLanguage("ru")}>Рус</button>
        <button onClick={() => changeLanguage("ro")}>Rom</button>
      </div>
      <h1>Cardiovascular Risk Calculator</h1>
      <RiskForm />
    </div>
  );
}
export default App;