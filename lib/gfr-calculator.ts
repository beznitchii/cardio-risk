export interface GFRParams {
  age: number
  gender: "male" | "female"
  creatinine: number
  unit: "mgdl" | "umoll"
}

export interface GFRResult {
  gfr: number
  stage: string
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
  const { age, gender, creatinine, unit } = params

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
  const interpretation = getGFRInterpretation(roundedGfr, stage)
  const recommendations = getGFRRecommendations(stage)

  return {
    gfr: roundedGfr,
    stage,
    interpretation,
    recommendations,
  }
}

function getGFRStage(gfr: number): string {
  if (gfr >= 90) return "G1"
  if (gfr >= 60) return "G2"
  if (gfr >= 45) return "G3a"
  if (gfr >= 30) return "G3b"
  if (gfr >= 15) return "G4"
  return "G5"
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

function getGFRRecommendations(stage: string): string[] {
  const recommendations = {
    G1: ["lifestyle", "monitoring"],
    G2: ["lifestyle", "monitoring", "riskFactors"],
    G3a: ["lifestyle", "monitoring", "riskFactors", "specialist"],
    G3b: ["lifestyle", "monitoring", "riskFactors", "specialist", "complications"],
    G4: ["lifestyle", "specialist", "complications", "preparation"],
    G5: ["specialist", "replacement"],
  }

  return recommendations[stage as keyof typeof recommendations] || []
}
