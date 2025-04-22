import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function RiskForm() {
  const { t } = useTranslation();
  const [age, setAge] = useState(50);
  const [ldl, setLDL] = useState(3.2);
  const [hdl, setHDL] = useState(1.0);
  const [sbp, setSBP] = useState(140);
  const [risk, setRisk] = useState(null);

  const calculateRisk = () => {
    const result = Math.min(20, Math.round((age / 100 + ldl - hdl + sbp / 200) * 2));
    setRisk(result);
  };

  return (
    <div>
      <div>
        <label>{t("age")}: <input type="number" value={age} onChange={e => setAge(+e.target.value)} /></label>
      </div>
      <div>
        <label>LDL: <input type="number" value={ldl} onChange={e => setLDL(+e.target.value)} /></label>
      </div>
      <div>
        <label>HDL: <input type="number" value={hdl} onChange={e => setHDL(+e.target.value)} /></label>
      </div>
      <div>
        <label>{t("sbp")}: <input type="number" value={sbp} onChange={e => setSBP(+e.target.value)} /></label>
      </div>
      <button onClick={calculateRisk}>{t("calculate")}</button>
      {risk !== null && <div>{t("risk")}: <strong>{risk}%</strong></div>}
    </div>
  );
}
export default RiskForm;