interface RiskFactors {
  age: string
  gender: string
  smoker: string
  diabetic: string
  systolicBP: string
  diastolicBP: string
  totalCholesterol: string
  hdlCholesterol: string
  ldlCholesterol: string
  triglycerides: string
  height: string
  weight: string
  familyHistory: string
  physicalActivity: string
}

export function calculateRisk(data: RiskFactors): number {
  // This is a simplified risk calculation algorithm
  // In a real application, this would implement an established
  // cardiovascular risk algorithm like Framingham, SCORE, or ASCVD

  let riskScore = 0

  // Age factor (0-20 points)
  const age = Number.parseInt(data.age) || 0
  if (age < 40) riskScore += 0
  else if (age < 50) riskScore += 5
  else if (age < 60) riskScore += 10
  else if (age < 70) riskScore += 15
  else riskScore += 20

  // Gender factor (0-2 points)
  if (data.gender === "male") riskScore += 2

  // Smoking factor (0-8 points)
  if (data.smoker === "yes") riskScore += 8

  // Diabetes factor (0-6 points)
  if (data.diabetic === "yes") riskScore += 6

  // Blood pressure factor (0-10 points)
  const systolic = Number.parseInt(data.systolicBP) || 0
  if (systolic >= 140) riskScore += 10
  else if (systolic >= 130) riskScore += 7
  else if (systolic >= 120) riskScore += 3

  // Cholesterol factors (0-10 points)
  const totalChol = Number.parseInt(data.totalCholesterol) || 0
  const hdl = Number.parseInt(data.hdlCholesterol) || 0

  if (totalChol > 240) riskScore += 6
  else if (totalChol >= 200) riskScore += 3

  if (hdl < 40) riskScore += 4
  else if (hdl < 60) riskScore += 1

  // BMI factor (0-5 points)
  const height = Number.parseFloat(data.height) || 0
  const weight = Number.parseFloat(data.weight) || 0

  if (height && weight) {
    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)

    if (bmi >= 30) riskScore += 5
    else if (bmi >= 25) riskScore += 3
  }

  // Family history factor (0-5 points)
  if (data.familyHistory === "yes") riskScore += 5

  // Physical activity factor (0-4 points)
  if (data.physicalActivity === "low") riskScore += 4
  else if (data.physicalActivity === "moderate") riskScore += 2

  // Ensure the score is between 0-100
  return Math.min(Math.max(riskScore, 0), 100)
}

export function getRiskCategory(score: number): string {
  if (score < 10) return "Low"
  if (score < 20) return "Moderate"
  if (score < 40) return "High"
  return "Very High"
}

export function getRiskColor(score: number): string {
  if (score < 10) return "#10b981" // Green
  if (score < 20) return "#f59e0b" // Amber
  if (score < 40) return "#ef4444" // Red
  return "#7f1d1d" // Dark red
}
