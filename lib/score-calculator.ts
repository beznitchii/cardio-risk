// SCORE (Systematic COronary Risk Evaluation) risk calculator
// Based on the European Society of Cardiology guidelines

interface ScoreParams {
  age: number
  gender: string
  smoker: boolean
  systolicBP: number
  totalCholesterol: number
  hdlCholesterol?: number // для SCORE2
  diabetic?: boolean // для SCORE2-Diabetes
  country?: string // для региональной калибровки
}

// Таблицы риска SCORE для стран с высоким риском
// Значения представляют 10-летний риск фатального сердечно-сосудистого заболевания в %
const maleHighRiskTable: Record<string, Record<string, number[]>> = {
  // Возраст: 40, 45, 50, 55, 60, 65
  "non-smoker": {
    "4": [0, 0, 1, 1, 1, 2],
    "5": [0, 0, 1, 1, 2, 2],
    "6": [0, 0, 1, 2, 2, 3],
    "7": [0, 1, 1, 2, 3, 4],
    "8": [0, 1, 1, 2, 4, 5],
  },
  smoker: {
    "4": [0, 1, 1, 2, 3, 4],
    "5": [0, 1, 2, 3, 4, 5],
    "6": [1, 1, 2, 3, 5, 7],
    "7": [1, 2, 3, 4, 6, 8],
    "8": [1, 2, 3, 5, 7, 10],
  },
}

const femaleHighRiskTable: Record<string, Record<string, number[]>> = {
  // Возраст: 40, 45, 50, 55, 60, 65
  "non-smoker": {
    "4": [0, 0, 0, 0, 1, 1],
    "5": [0, 0, 0, 0, 1, 1],
    "6": [0, 0, 0, 1, 1, 2],
    "7": [0, 0, 0, 1, 1, 2],
    "8": [0, 0, 1, 1, 2, 2],
  },
  smoker: {
    "4": [0, 0, 0, 1, 1, 2],
    "5": [0, 0, 1, 1, 2, 2],
    "6": [0, 0, 1, 1, 2, 3],
    "7": [0, 0, 1, 2, 2, 4],
    "8": [0, 1, 1, 2, 3, 4],
  },
}

// Таблицы риска SCORE для стран с низким риском
const maleLowRiskTable: Record<string, Record<string, number[]>> = {
  // Возраст: 40, 45, 50, 55, 60, 65
  "non-smoker": {
    "4": [0, 0, 0, 0, 1, 1],
    "5": [0, 0, 0, 1, 1, 1],
    "6": [0, 0, 1, 1, 1, 2],
    "7": [0, 0, 1, 1, 2, 2],
    "8": [0, 0, 1, 1, 2, 3],
  },
  smoker: {
    "4": [0, 0, 1, 1, 2, 2],
    "5": [0, 1, 1, 2, 3, 3],
    "6": [0, 1, 2, 2, 3, 4],
    "7": [0, 1, 2, 3, 4, 5],
    "8": [1, 1, 2, 3, 5, 6],
  },
}

const femaleLowRiskTable: Record<string, Record<string, number[]>> = {
  // Возраст: 40, 45, 50, 55, 60, 65
  "non-smoker": {
    "4": [0, 0, 0, 0, 0, 0],
    "5": [0, 0, 0, 0, 0, 1],
    "6": [0, 0, 0, 0, 1, 1],
    "7": [0, 0, 0, 0, 1, 1],
    "8": [0, 0, 0, 1, 1, 1],
  },
  smoker: {
    "4": [0, 0, 0, 0, 1, 1],
    "5": [0, 0, 0, 1, 1, 1],
    "6": [0, 0, 0, 1, 1, 2],
    "7": [0, 0, 1, 1, 1, 2],
    "8": [0, 0, 1, 1, 2, 2],
  },
}

// Страны с высоким риском
const highRiskCountries = [
  "armenia",
  "azerbaijan",
  "belarus",
  "bulgaria",
  "georgia",
  "kazakhstan",
  "kyrgyzstan",
  "moldova",
  "russia",
  "ukraine",
  "uzbekistan",
  "albania",
  "bosnia",
  "croatia",
  "czechia",
  "estonia",
  "hungary",
  "latvia",
  "lithuania",
  "montenegro",
  "poland",
  "romania",
  "serbia",
  "slovakia",
  "slovenia",
  "turkey",
]

// Страны с низким риском
const lowRiskCountries = [
  "andorra",
  "austria",
  "belgium",
  "cyprus",
  "denmark",
  "finland",
  "france",
  "germany",
  "greece",
  "iceland",
  "ireland",
  "israel",
  "italy",
  "luxembourg",
  "malta",
  "monaco",
  "netherlands",
  "norway",
  "portugal",
  "san marino",
  "spain",
  "sweden",
  "switzerland",
  "united kingdom",
]

export function calculateSCORERisk(params: ScoreParams): number {
  const { age, gender, smoker, systolicBP, totalCholesterol, country } = params

  // Определяем, относится ли страна к группе высокого или низкого риска
  let isHighRisk = true // По умолчанию высокий риск

  if (country) {
    const normalizedCountry = country.toLowerCase().trim()
    if (lowRiskCountries.includes(normalizedCountry)) {
      isHighRisk = false
    } else if (highRiskCountries.includes(normalizedCountry)) {
      isHighRisk = true
    }
  }

  // Выбираем соответствующую таблицу риска
  let riskTable
  if (gender === "male") {
    riskTable = isHighRisk ? maleHighRiskTable : maleLowRiskTable
  } else {
    riskTable = isHighRisk ? femaleHighRiskTable : femaleLowRiskTable
  }

  // Определяем индекс возраста (40, 45, 50, 55, 60, 65)
  let ageIndex = Math.floor((age - 40) / 5)
  if (ageIndex < 0) ageIndex = 0
  if (ageIndex > 5) ageIndex = 5

  // Определяем ближайшее значение систолического давления (4-8 mmol/L)
  let cholBand = Math.round(totalCholesterol)
  if (cholBand < 4) cholBand = 4
  if (cholBand > 8) cholBand = 8

  // Получаем риск из таблицы
  const smokerStatus = smoker ? "smoker" : "non-smoker"
  const risk = riskTable[smokerStatus][cholBand.toString()][ageIndex]

  // Корректировка для систолического давления
  // В таблицах SCORE используются стандартные значения 120, 140, 160, 180
  let bpFactor = 1.0
  if (systolicBP < 120) bpFactor = 0.8
  else if (systolicBP < 140) bpFactor = 1.0
  else if (systolicBP < 160) bpFactor = 1.3
  else if (systolicBP < 180) bpFactor = 1.6
  else bpFactor = 1.9

  // Применяем корректировку для давления
  let adjustedRisk = risk * bpFactor

  // Дополнительные корректировки для SCORE2 (если доступны HDL и диабет)
  if (params.hdlCholesterol && params.hdlCholesterol > 0) {
    const hdlRatio = params.hdlCholesterol / totalCholesterol
    if (hdlRatio > 0.3) adjustedRisk *= 0.8
    else if (hdlRatio < 0.2) adjustedRisk *= 1.2
  }

  if (params.diabetic) {
    adjustedRisk *= gender === "male" ? 2.0 : 2.5
  }

  // Возвращаем риск в процентах (0-100)
  return Math.min(Math.max(adjustedRisk, 0), 100)
}

export function getScoreRiskCategory(risk: number): string {
  if (risk < 1) return "Низкий"
  if (risk < 5) return "Умеренный"
  if (risk < 10) return "Высокий"
  return "Очень высокий"
}

export function getScoreRiskColor(risk: number): string {
  if (risk < 1) return "#10b981" // Зеленый
  if (risk < 5) return "#f59e0b" // Желтый
  if (risk < 10) return "#ef4444" // Красный
  return "#7f1d1d" // Темно-красный
}

export function getScoreRiskDescription(risk: number): string {
  if (risk < 1) {
    return "Низкий риск сердечно-сосудистых заболеваний. Рекомендуется поддерживать здоровый образ жизни."
  } else if (risk < 5) {
    return "Умеренный риск. Рекомендуется контролировать факторы риска и вести здоровый образ жизни."
  } else if (risk < 10) {
    return "Высокий риск. Рекомендуется активное изменение образа жизни и консультация с врачом."
  } else {
    return "Очень высокий риск. Необходима срочная консультация с врачом и возможно медикаментозное лечение."
  }
}
