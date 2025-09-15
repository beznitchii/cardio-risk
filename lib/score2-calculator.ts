// SCORE2 и SCORE2-OP калькулятор риска
// На основе официальных таблиц из протокола МЗ РМ №1 от 2022

export interface Score2Params {
  age: number
  gender: string
  smoker: boolean
  systolicBP: number
  totalCholesterol?: number // Общий холестерин
  hdlCholesterol?: number // Холестерин ЛПВП
  ldlCholesterol?: number // Холестерин ЛНП
  diabetic: boolean
  country: string
  myocardialInfarction: boolean
  stroke: boolean
  chronicKidneyDisease: boolean
  familyHistory: boolean
  obesity: boolean
}

export type CalculationMethod = "official" | "simplified" | null

export interface RiskCalculationResult {
  riskScore: number | null
  calculationMethod: CalculationMethod
}

// Официальные таблицы SCORE2 из протокола (очень высокий риск - Молдова)
// Структура: [Non-HDL:  3.0-3.9, 4.0-4.9, 5.0-5.9, 6.0-6.9, 7.0-7.9]

// SCORE2 таблица (40-69 лет) - точно по изображению
const SCORE2_TABLE = {
  // Женщины, некурящие
  female_nonsmoker: {
    "40-44": {
      "100-119": [2, 2, 2, 3, 3],
      "120-139": [3, 3, 3, 4, 4],
      "140-159": [4, 4, 5, 6, 6],
      "160-179": [5, 6, 7, 8, 8],
    },
    "45-49": {
      "100-119": [3, 3, 4, 4, 4],
      "120-139": [4, 4, 5, 6, 6],
      "140-159": [5, 6, 7, 8, 8],
      "160-179": [7, 8, 9, 10, 10],
    },
    "50-54": {
      "100-119": [4, 5, 5, 6, 6],
      "120-139": [6, 6, 7, 8, 8],
      "140-159": [8, 9, 9, 11, 11],
      "160-179": [10, 11, 12, 14, 14],
    },
    "55-59": {
      "100-119": [7, 7, 8, 9, 9],
      "120-139": [8, 9, 10, 11, 11],
      "140-159": [11, 12, 13, 14, 14],
      "160-179": [14, 15, 17, 18, 18],
    },
    "60-64": {
      "100-119": [10, 11, 11, 12, 12],
      "120-139": [12, 13, 14, 15, 15],
      "140-159": [16, 17, 18, 19, 19],
      "160-179": [20, 21, 22, 24, 24],
    },
    "65-69": {
      "100-119": [15, 16, 16, 17, 17],
      "120-139": [18, 19, 20, 21, 21],
      "140-159": [22, 23, 24, 26, 26],
      "160-179": [27, 28, 30, 31, 31],
    },
  },
  // Женщины, курящие
  female_smoker: {
    "40-44": {
      "100-119": [5, 6, 6, 7, 7],
      "120-139": [7, 8, 9, 10, 10],
      "140-159": [9, 11, 12, 14, 14],
      "160-179": [13, 15, 17, 19, 19],
    },
    "45-49": {
      "100-119": [7, 8, 9, 10, 10],
      "120-139": [9, 10, 12, 13, 13],
      "140-159": [12, 14, 15, 17, 17],
      "160-179": [16, 18, 21, 23, 23],
    },
    "50-54": {
      "100-119": [9, 10, 11, 13, 13],
      "120-139": [12, 13, 15, 17, 17],
      "140-159": [16, 18, 19, 22, 22],
      "160-179": [21, 23, 25, 28, 28],
    },
    "55-59": {
      "100-119": [13, 14, 15, 16, 16],
      "120-139": [16, 18, 19, 21, 21],
      "140-159": [21, 23, 24, 26, 26],
      "160-179": [26, 28, 31, 33, 33],
    },
    "60-64": {
      "100-119": [17, 18, 20, 21, 21],
      "120-139": [22, 23, 25, 26, 26],
      "140-159": [27, 29, 30, 32, 32],
      "160-179": [33, 35, 37, 39, 39],
    },
    "65-69": {
      "100-119": [23, 24, 26, 27, 27],
      "120-139": [28, 30, 31, 33, 33],
      "140-159": [34, 36, 37, 39, 39],
      "160-179": [41, 42, 44, 46, 46],
    },
  },
  // Мужчины, некурящие
  male_nonsmoker: {
    "40-44": {
      "100-119": [3, 4, 4, 5, 5],
      "120-139": [4, 5, 6, 7, 7],
      "140-159": [5, 6, 8, 10, 10],
      "160-179": [7, 9, 11, 13, 13],
    },
    "45-49": {
      "100-119": [4, 5, 6, 7, 7],
      "120-139": [5, 6, 8, 9, 9],
      "140-159": [7, 8, 10, 12, 12],
      "160-179": [9, 11, 13, 16, 16],
    },
    "50-54": {
      "100-119": [6, 7, 8, 9, 9],
      "120-139": [7, 9, 10, 12, 12],
      "140-159": [10, 11, 13, 15, 15],
      "160-179": [12, 14, 16, 19, 19],
    },
    "55-59": {
      "100-119": [8, 9, 10, 12, 12],
      "120-139": [10, 11, 13, 15, 15],
      "140-159": [13, 14, 16, 18, 18],
      "160-179": [16, 18, 20, 23, 23],
    },
    "60-64": {
      "100-119": [11, 12, 14, 15, 15],
      "120-139": [14, 15, 17, 18, 18],
      "140-159": [17, 19, 20, 22, 22],
      "160-179": [20, 23, 25, 27, 27],
    },
    "65-69": {
      "100-119": [15, 17, 18, 19, 19],
      "120-139": [18, 20, 21, 23, 23],
      "140-159": [22, 24, 26, 27, 27],
      "160-179": [26, 28, 30, 32, 32],
    },
  },
  // Мужчины, курящие
  male_smoker: {
    "40-44": {
      "100-119": [6, 7, 9, 11, 11],
      "120-139": [8, 10, 12, 14, 14],
      "140-159": [11, 13, 16, 19, 19],
      "160-179": [14, 17, 20, 24, 24],
    },
    "45-49": {
      "100-119": [8, 9, 11, 13, 13],
      "120-139": [10, 12, 14, 17, 17],
      "140-159": [13, 16, 18, 22, 22],
      "160-179": [17, 20, 24, 28, 28],
    },
    "50-54": {
      "100-119": [10, 12, 14, 16, 16],
      "120-139": [13, 15, 17, 20, 20],
      "140-159": [17, 19, 22, 25, 25],
      "160-179": [21, 25, 28, 31, 31],
    },
    "55-59": {
      "100-119": [13, 15, 17, 19, 19],
      "120-139": [17, 19, 21, 24, 24],
      "140-159": [21, 23, 26, 29, 29],
      "160-179": [25, 28, 32, 35, 35],
    },
    "60-64": {
      "100-119": [17, 19, 21, 23, 23],
      "120-139": [21, 23, 25, 28, 28],
      "140-159": [25, 28, 31, 33, 33],
      "160-179": [31, 33, 36, 40, 40],
    },
    "65-69": {
      "100-119": [22, 24, 26, 28, 28],
      "120-139": [26, 28, 30, 33, 33],
      "140-159": [31, 33, 36, 38, 38],
      "160-179": [36, 39, 42, 44, 44],
    },
  },
}

// SCORE2-OP таблица (70+ лет) - точно по изображению
const SCORE2_OP_TABLE = {
  // Женщины, некурящие
  female_nonsmoker: {
    "70-74": {
      "100-119": [26, 27, 28, 29, 29],
      "120-139": [29, 30, 31, 32, 32],
      "140-159": [33, 34, 35, 36, 36],
      "160-179": [37, 38, 39, 41, 41],
    },
    "75-79": {
      "100-119": [34, 35, 36, 37, 37],
      "120-139": [37, 39, 40, 41, 41],
      "140-159": [41, 42, 43, 45, 45],
      "160-179": [44, 46, 47, 48, 48],
    },
    "80-84": {
      "100-119": [44, 45, 47, 48, 48],
      "120-139": [47, 48, 49, 51, 51],
      "140-159": [50, 51, 52, 54, 54],
      "160-179": [53, 54, 55, 57, 57],
    },
    "85-89": {
      "100-119": [56, 57, 58, 60, 60],
      "120-139": [58, 59, 60, 61, 61],
      "140-159": [60, 61, 62, 63, 63],
      "160-179": [62, 63, 64, 65, 65],
    },
    "90+": {
      "100-119": [57, 59, 61, 63, 65],
      "120-139": [60, 62, 64, 66, 68],
      "140-159": [63, 65, 67, 69, 71],
      "160-179": [66, 68, 70, 72, 74],
    },
  },
  // Женщины, курящие
  female_smoker: {
    "70-74": {
      "100-119": [34, 36, 37, 38, 38],
      "120-139": [39, 40, 41, 43, 43],
      "140-159": [43, 44, 46, 47, 47],
      "160-179": [48, 49, 51, 52, 52],
    },
    "75-79": {
      "100-119": [42, 43, 44, 46, 46],
      "120-139": [46, 47, 48, 49, 49],
      "140-159": [49, 51, 52, 53, 53],
      "160-179": [53, 55, 56, 58, 58],
    },
    "80-84": {
      "100-119": [50, 51, 53, 54, 54],
      "120-139": [53, 54, 56, 57, 57],
      "140-159": [56, 57, 59, 60, 60],
      "160-179": [59, 60, 62, 63, 63],
    },
    "85-89": {
      "100-119": [59, 60, 61, 63, 63],
      "120-139": [61, 62, 63, 65, 65],
      "140-159": [63, 64, 65, 66, 66],
      "160-179": [65, 66, 67, 68, 68],
    },
    "90+": {
      "100-119": [70, 72, 74, 76, 78],
      "120-139": [73, 75, 77, 79, 81],
      "140-159": [76, 78, 80, 82, 84],
      "160-179": [79, 81, 83, 85, 87],
    },
  },
  // Мужчины, некурящие
  male_nonsmoker: {
    "70-74": {
      "100-119": [25, 26, 28, 29, 29],
      "120-139": [28, 30, 31, 33, 33],
      "140-159": [32, 33, 35, 36, 36],
      "160-179": [35, 37, 39, 40, 40],
    },
    "75-79": {
      "100-119": [31, 33, 36, 38, 38],
      "120-139": [34, 36, 39, 41, 41],
      "140-159": [37, 39, 42, 44, 44],
      "160-179": [40, 42, 45, 48, 48],
    },
    "80-84": {
      "100-119": [38, 41, 45, 48, 48],
      "120-139": [40, 43, 47, 51, 51],
      "140-159": [42, 46, 49, 53, 53],
      "160-179": [44, 48, 52, 56, 56],
    },
    "85-89": {
      "100-119": [46, 50, 55, 60, 60],
      "120-139": [47, 52, 56, 61, 61],
      "140-159": [48, 53, 58, 63, 63],
      "160-179": [49, 54, 59, 64, 64],
    },
    "90+": {
      "100-119": [68, 70, 72, 74, 76],
      "120-139": [71, 73, 75, 77, 79],
      "140-159": [74, 76, 78, 80, 82],
      "160-179": [77, 79, 81, 83, 85],
    },
  },
  // Мужчины, курящие
  male_smoker: {
    "70-74": {
      "100-119": [31, 33, 34, 36, 36],
      "120-139": [35, 36, 38, 40, 40],
      "140-159": [39, 41, 42, 44, 44],
      "160-179": [43, 45, 47, 49, 49],
    },
    "75-79": {
      "100-119": [36, 38, 41, 43, 43],
      "120-139": [39, 41, 44, 47, 47],
      "140-159": [42, 44, 47, 50, 50],
      "160-179": [45, 48, 51, 54, 54],
    },
    "80-84": {
      "100-119": [40, 44, 48, 51, 51],
      "120-139": [43, 46, 50, 54, 54],
      "140-159": [45, 49, 52, 56, 56],
      "160-179": [47, 51, 55, 59, 59],
    },
    "85-89": {
      "100-119": [46, 50, 55, 60, 60],
      "120-139": [47, 52, 56, 61, 61],
      "140-159": [48, 53, 58, 53, 63],
      "160-179": [49, 54, 59, 64, 64],
    },
    "90+": {
      "100-119": [81, 83, 85, 87, 89],
      "120-139": [84, 86, 88, 90, 92],
      "140-159": [87, 89, 91, 93, 95],
      "160-179": [90, 92, 94, 96, 98],
    },
  },
}

// Диапазоны Non-HDL холестерина (ммоль/л)
const NON_HDL_RANGES = [3.45, 4.45, 5.45, 6.45, 7.45] // Средние значения диапазонов
const NON_HDL_BOUNDARIES = [3.0, 4.0, 5.0, 6.0, 7.0] // Границы диапазонов

function getAgeGroup(age: number, isOP: boolean): string {
  if (isOP) {
    // SCORE2-OP (70+ лет)
    if (age < 75) return "70-74"
    if (age < 80) return "75-79"
    if (age < 85) return "80-84"
    if (age < 90) return "85-89"
    return "90+"
  } else {
    // SCORE2 (40-69 лет)
    if (age < 45) return "40-44"
    if (age < 50) return "45-49"
    if (age < 55) return "50-54"
    if (age < 60) return "55-59"
    if (age < 65) return "60-64"
    return "65-69"
  }
}

function getBPGroup(systolicBP: number): string {
  if (systolicBP < 120) return "100-119"
  if (systolicBP < 140) return "120-139"
  if (systolicBP < 160) return "140-159"
  return "160-179"
}

function getNonHDLIndex(nonHDL: number): { index: number; weight: number } {
  // Найти индекс и вес для интерполяции
  if (nonHDL <= NON_HDL_BOUNDARIES[0]) return { index: 0, weight: 0 }
  if (nonHDL >= NON_HDL_BOUNDARIES[NON_HDL_BOUNDARIES.length - 1])
    return { index: NON_HDL_RANGES.length - 1, weight: 0 }

  for (let i = 0; i < NON_HDL_BOUNDARIES.length - 1; i++) {
    if (nonHDL >= NON_HDL_BOUNDARIES[i] && nonHDL < NON_HDL_BOUNDARIES[i + 1]) {
      const weight = (nonHDL - NON_HDL_BOUNDARIES[i]) / (NON_HDL_BOUNDARIES[i + 1] - NON_HDL_BOUNDARIES[i])
      return { index: i, weight }
    }
  }

  return { index: NON_HDL_RANGES.length - 1, weight: 0 }
}

function interpolateRisk(
  table: any,
  gender: string,
  smoker: boolean,
  ageGroup: string,
  bpGroup: string,
  nonHDL: number,
): number {
  const smokingStatus = smoker ? "smoker" : "nonsmoker"
  const key = `${gender}_${smokingStatus}`

  if (!table[key] || !table[key][ageGroup] || !table[key][ageGroup][bpGroup]) {
    return 0
  }

  const riskArray = table[key][ageGroup][bpGroup]
  const { index, weight } = getNonHDLIndex(nonHDL)

  if (weight === 0 || index >= riskArray.length - 1) {
    return riskArray[Math.min(index, riskArray.length - 1)]
  }

  // Линейная интерполяция между двумя значениями
  const risk1 = riskArray[index]
  const risk2 = riskArray[index + 1]
  return risk1 + (risk2 - risk1) * weight
}

function getBaseScore2Risk_NonHDL(params: Score2Params): number {
  const { age, gender, smoker, systolicBP, totalCholesterol = 0, hdlCholesterol = 0 } = params

  const nonHDL = totalCholesterol - hdlCholesterol
  if (nonHDL <= 0) return 0

  const ageGroup = getAgeGroup(age, false)
  const bpGroup = getBPGroup(systolicBP)

  return interpolateRisk(SCORE2_TABLE, gender, smoker, ageGroup, bpGroup, nonHDL)
}

function getBaseScore2OPRisk_NonHDL(params: Score2Params): number {
  const { age, gender, smoker, systolicBP, totalCholesterol = 0, hdlCholesterol = 0 } = params

  const nonHDL = totalCholesterol - hdlCholesterol
  if (nonHDL <= 0) return 0

  const ageGroup = getAgeGroup(age, true)
  const bpGroup = getBPGroup(systolicBP)

  return interpolateRisk(SCORE2_OP_TABLE, gender, smoker, ageGroup, bpGroup, nonHDL)
}

// Упрощенные функции для LDL (оставляем как есть для совместимости)
function getBaseScore2Risk_LDL(params: Score2Params): number {
  const { age, gender, smoker, systolicBP, ldlCholesterol = 0, diabetic } = params

  let baseRisk = 0
  if (gender === "male") {
    if (age < 50) baseRisk = 1.5
    else if (age < 60) baseRisk = 4.0
    else baseRisk = 9.0
  } else {
    if (age < 50) baseRisk = 0.8
    else if (age < 60) baseRisk = 2.5
    else baseRisk = 6.0
  }

  const smokerCoefficient = smoker ? 1.8 : 1.0
  let bpCoefficient = 1.0
  if (systolicBP < 120) bpCoefficient = 0.8
  else if (systolicBP < 140) bpCoefficient = 1.0
  else if (systolicBP < 160) bpCoefficient = 1.3
  else if (systolicBP < 180) bpCoefficient = 1.6
  else bpCoefficient = 1.9

  let ldlCoefficient = 1.0
  if (ldlCholesterol < 1.8) ldlCoefficient = 0.8
  else if (ldlCholesterol < 2.6) ldlCoefficient = 1.0
  else if (ldlCholesterol < 3.0) ldlCoefficient = 1.2
  else if (ldlCholesterol < 4.1) ldlCoefficient = 1.4
  else if (ldlCholesterol < 4.9) ldlCoefficient = 1.6
  else ldlCoefficient = 1.8

  let risk = baseRisk * smokerCoefficient * bpCoefficient * ldlCoefficient * 1.3 // Молдова - очень высокий риск
  if (diabetic) risk *= 1.5
  return Math.min(Math.max(risk, 0), 100)
}

function getBaseScore2OPRisk_LDL(params: Score2Params): number {
  const { age, gender, smoker, systolicBP, ldlCholesterol = 0, diabetic } = params

  let baseRisk = 0
  if (gender === "male") {
    if (age < 75) baseRisk = 12.0
    else if (age < 80) baseRisk = 16.0
    else baseRisk = 21.0
  } else {
    if (age < 75) baseRisk = 9.0
    else if (age < 80) baseRisk = 12.0
    else baseRisk = 15.0
  }

  const smokerCoefficient = smoker ? 1.5 : 1.0
  let bpCoefficient = 1.0
  if (systolicBP < 140) bpCoefficient = 0.9
  else if (systolicBP < 160) bpCoefficient = 1.0
  else if (systolicBP < 180) bpCoefficient = 1.2
  else bpCoefficient = 1.4

  let ldlCoefficient = 1.0
  if (ldlCholesterol < 2.6) ldlCoefficient = 0.9
  else if (ldlCholesterol < 3.4) ldlCoefficient = 1.0
  else if (ldlCholesterol < 4.1) ldlCoefficient = 1.1
  else if (ldlCholesterol < 4.9) ldlCoefficient = 1.2
  else ldlCoefficient = 1.3

  let risk = baseRisk * smokerCoefficient * bpCoefficient * ldlCoefficient * 1.2 // Молдова - очень высокий риск
  if (diabetic) risk *= 1.3
  return Math.min(Math.max(risk, 0), 100)
}

export function calculateScore2Risk(params: Score2Params): RiskCalculationResult {
  let riskScore: number | null = null
  let calculationMethod: CalculationMethod = null

  const canUseNonHDL =
    typeof params.totalCholesterol === "number" &&
    params.totalCholesterol > 0 &&
    typeof params.hdlCholesterol === "number" &&
    params.hdlCholesterol > 0 &&
    params.totalCholesterol - params.hdlCholesterol > 0

  const canUseLDL = typeof params.ldlCholesterol === "number" && params.ldlCholesterol > 0

  if (canUseNonHDL) {
    calculationMethod = "official"
    if (params.age < 70) {
      riskScore = getBaseScore2Risk_NonHDL(params)
    } else {
      riskScore = getBaseScore2OPRisk_NonHDL(params)
    }
  } else if (canUseLDL) {
    calculationMethod = "simplified"
    if (params.age < 70) {
      riskScore = getBaseScore2Risk_LDL(params)
    } else {
      riskScore = getBaseScore2OPRisk_LDL(params)
    }
  }

  return { riskScore, calculationMethod }
}

// Обновляем функцию getRiskCategory для учета возрастных групп и сахарного диабета
export function getRiskCategory(
  risk: number,
  params: Pick<Score2Params, "age" | "myocardialInfarction" | "stroke" | "chronicKidneyDisease" | "diabetic">,
): string {
  // Проверяем наличие очень высокого риска по анамнезу
  if (params.myocardialInfarction || params.stroke || params.chronicKidneyDisease) {
    return "veryHigh"
  }

  // Учитываем сахарный диабет как фактор высокого/очень высокого риска
  if (params.diabetic) {
    // Для диабетиков старше 50 лет или с риском выше 7.5% - очень высокий риск
    if (params.age >= 50 || risk >= 7.5) {
      return "veryHigh"
    }
    // Для остальных диабетиков - высокий риск
    return "high"
  }

  // Определяем категорию риска в зависимости от возраста
  if (params.age < 50) {
    // До 50 лет
    if (risk < 2.5) return "low"
    if (risk < 7.5) return "moderate"
    if (risk < 15) return "high"
    return "veryHigh"
  } else if (params.age < 70) {
    // От 50 до 69 лет
    if (risk < 5) return "low"
    if (risk < 10) return "moderate"
    if (risk < 15) return "high"
    return "veryHigh"
  } else {
    // От 70 лет и старше
    if (risk < 7.5) return "low"
    if (risk < 15) return "moderate"
    return "veryHigh" // Для 70+ лет нет категории "высокий", сразу "очень высокий"
  }
}

// Заменяем функцию getTargetLDL на исходную версию
export function getTargetLDL(riskCategory: string): number {
  switch (riskCategory) {
    case "veryHigh":
      return 1.4
    case "high":
      return 1.8
    case "moderate":
      return 2.6
    case "low":
    default:
      return 3.0
  }
}

// Заменяем функцию getRiskColor на исходную версию
export function getRiskColor(category: string): string {
  switch (category) {
    case "veryHigh":
      return "#7f1d1d" // Темно-красный
    case "high":
      return "#ef4444" // Красный
    case "moderate":
      return "#f59e0b" // Желтый
    case "low":
    default:
      return "#10b981" // Зеленый
  }
}

export function calculateLDLReduction(currentLDL: number, targetLDL: number): number {
  if (currentLDL <= targetLDL || targetLDL <= 0 || currentLDL <= 0) return 0
  const reductionPercent = ((currentLDL - targetLDL) / currentLDL) * 100
  return Math.max(0, Math.round(reductionPercent))
}

export function getRecommendations(
  params: Pick<Score2Params, "smoker" | "diabetic" | "systolicBP" | "obesity">,
  riskCategory: string,
): string[] {
  const recs: string[] = ["physicalActivity", "diet"]
  if (params.smoker) recs.push("smokingCessation")
  if (params.diabetic) recs.push("glucoseControl")
  if (params.systolicBP >= 140) recs.push("bloodPressureControl")
  if (params.obesity) recs.push("weightReduction")
  return recs
}
