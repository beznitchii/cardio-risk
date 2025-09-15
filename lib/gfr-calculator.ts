export interface GFRParams {
  age: number
  gender: "male" | "female"
  creatinine: number
  unit?: "mgdl" | "umoll"
}

export interface GFRResult {
  gfr: number
  stage: { stage: string; description: string }
  interpretation: string
  recommendations: string[]
}

// Convert creatinine between units
export function convertCreatinine(value: number, fromUnit: "mgdl" | "umoll", toUnit: "mgdl" | "umoll"): number {
  if (fromUnit === toUnit) return value

  if (fromUnit === "mgdl" && toUnit === "umoll") {
    // mg/dL to μmol/L: multiply by 88.4
    return value * 88.4
  } else if (fromUnit === "umoll" && toUnit === "mgdl") {
    // μmol/L to mg/dL: divide by 88.4
    return value / 88.4
  }

  return value
}

// CKD-EPI 2021 formula (race-free)
export function calculateGFR(params: GFRParams): GFRResult {
  const { age, gender, creatinine, unit = "mgdl" } = params

  // Convert creatinine to mg/dL if needed
  let creatinineMgDl = creatinine
  if (unit === "umoll") {
    creatinineMgDl = convertCreatinine(creatinine, "umoll", "mgdl")
  }

  // CKD-EPI 2021 coefficients
  const kappa = gender === "female" ? 0.7 : 0.9
  const alpha = gender === "female" ? -0.241 : -0.302
  const genderMultiplier = gender === "female" ? 1.012 : 1.0

  // Calculate GFR using CKD-EPI 2021 formula
  const creatinineRatio = creatinineMgDl / kappa
  const minValue = Math.min(creatinineRatio, 1)
  const maxValue = Math.max(creatinineRatio, 1)

  const gfr = 142 * Math.pow(minValue, alpha) * Math.pow(maxValue, -1.2) * Math.pow(0.9938, age) * genderMultiplier

  // Round to nearest integer
  const roundedGfr = Math.round(gfr)

  // Determine stage and recommendations
  const stage = getGFRStage(roundedGfr)
  const interpretation = getGFRInterpretation(roundedGfr, stage.stage)
  const recommendations = getGFRRecommendations(stage.stage, "en")

  return {
    gfr: roundedGfr,
    stage,
    interpretation,
    recommendations,
  }
}

export function getGFRStage(gfr: number): { stage: string; description: string } {
  if (gfr >= 90) return { stage: "G1", description: "Normal or high kidney function" }
  if (gfr >= 60) return { stage: "G2", description: "Mildly decreased kidney function" }
  if (gfr >= 45) return { stage: "G3a", description: "Mild to moderately decreased kidney function" }
  if (gfr >= 30) return { stage: "G3b", description: "Moderately to severely decreased kidney function" }
  if (gfr >= 15) return { stage: "G4", description: "Severely decreased kidney function" }
  return { stage: "G5", description: "Kidney failure" }
}

function getGFRInterpretation(gfr: number, stage: string): string {
  const interpretations = {
    G1: "Normal or high kidney function",
    G2: "Mildly decreased kidney function",
    G3a: "Mild to moderately decreased kidney function",
    G3b: "Moderately to severely decreased kidney function",
    G4: "Severely decreased kidney function",
    G5: "Kidney failure",
  }

  return interpretations[stage as keyof typeof interpretations] || ""
}

export function getGFRRecommendations(stage: string, language = "en"): string[] {
  const recommendations = {
    G1: ["lifestyle", "monitoring"],
    G2: ["lifestyle", "monitoring", "riskFactors"],
    G3a: ["lifestyle", "monitoring", "riskFactors", "specialist"],
    G3b: ["lifestyle", "monitoring", "riskFactors", "specialist", "complications"],
    G4: ["lifestyle", "specialist", "complications", "preparation"],
    G5: ["specialist", "replacement"],
  }

  const stageRecs = recommendations[stage as keyof typeof recommendations] || []

  // Return translated recommendations based on language
  const translations = {
    en: {
      lifestyle: "Maintain healthy lifestyle with balanced diet and regular exercise",
      monitoring: "Regular monitoring of kidney function and blood pressure",
      riskFactors: "Control diabetes, hypertension, and other cardiovascular risk factors",
      specialist: "Consult with nephrologist for specialized care",
      complications: "Monitor and treat complications of chronic kidney disease",
      preparation: "Prepare for renal replacement therapy",
      replacement: "Consider dialysis or kidney transplantation",
    },
    ru: {
      lifestyle: "Поддерживайте здоровый образ жизни со сбалансированной диетой и регулярными упражнениями",
      monitoring: "Регулярный мониторинг функции почек и артериального давления",
      riskFactors: "Контролируйте диабет, гипертонию и другие сердечно-сосудистые факторы риска",
      specialist: "Консультация с нефрологом для специализированной помощи",
      complications: "Мониторинг и лечение осложнений хронической болезни почек",
      preparation: "Подготовка к заместительной почечной терапии",
      replacement: "Рассмотрите диализ или трансплантацию почки",
    },
    ro: {
      lifestyle: "Mențineți un stil de viață sănătos cu dietă echilibrată și exerciții regulate",
      monitoring: "Monitorizarea regulată a funcției renale și a tensiunii arteriale",
      riskFactors: "Controlați diabetul, hipertensiunea și alți factori de risc cardiovascular",
      specialist: "Consultați cu nefrologul pentru îngrijire specializată",
      complications: "Monitorizați și tratați complicațiile bolii cronice de rinichi",
      preparation: "Pregătiți-vă pentru terapia de înlocuire renală",
      replacement: "Luați în considerare dializa sau transplantul de rinichi",
    },
    gag: {
      lifestyle: "Dengeli diyet ve düzenli egzersiz ile sağlıklı yaşam tarzını koruyun",
      monitoring: "Böbrek fonksiyonu ve kan basıncının düzenli izlenmesi",
      riskFactors: "Diyabet, hipertansiyon ve diğer kardiyovasküler risk faktörlerini kontrol edin",
      specialist: "Uzman bakım için nefroloğa danışın",
      complications: "Kronik böbrek hastalığının komplikasyonlarını izleyin ve tedavi edin",
      preparation: "Böbrek replasman tedavisine hazırlanın",
      replacement: "Diyaliz veya böbrek nakli düşünün",
    },
  }

  const langTranslations = translations[language as keyof typeof translations] || translations.en

  return stageRecs.map((rec) => langTranslations[rec as keyof typeof langTranslations] || rec)
}
