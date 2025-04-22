import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  ru: { translation: { age: "Возраст", sbp: "Систолическое давление", calculate: "Рассчитать", risk: "Риск" }},
  ro: { translation: { age: "Vârsta", sbp: "Tensiunea sistolică", calculate: "Calculează", risk: "Risc" }},
};

i18n.use(initReactI18next).init({
  resources,
  lng: "ru",
  interpolation: { escapeValue: false },
});

export default i18n;