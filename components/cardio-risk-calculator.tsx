"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  calculateScore2Risk,
  getRiskCategory,
  getTargetLDL,
  calculateLDLReduction,
  getRecommendations,
  type CalculationMethod,
} from "@/lib/score2-calculator"
import RiskGauge from "./risk-gauge"
import LanguageSwitcher from "./language-switcher"
import { getTranslation, type Language } from "@/lib/i18n/translations"
import { Download } from "lucide-react"
import DetailedRecommendations from "./detailed-recommendations"

// Объявляем типы для глобальных функций Google Analytics
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
    trackEvent: (action: string, category: string, label?: string, value?: number) => void
    trackRiskCalculation: (
      riskCategory: string,
      calculationMethod: string,
      riskScore: number,
      calculatorType?: string,
    ) => void
    trackPDFExport: (riskCategory: string, language: string, calculatorType?: string) => void
    trackLanguageChange: (fromLanguage: string, toLanguage: string) => void
    trackCalculatorUsage: (interactionType: string, details: string, calculatorType?: string) => void
    trackTimeSpent: (timeInSeconds: number) => void
    trackError: (errorType: string, errorMessage: string) => void
    trackPerformance: (metricName: string, value: number) => void
  }
}

interface CardioRiskCalculatorProps {
  language: Language
  onLanguageChange: (language: Language) => void
}

// Функция для расчета возраста из года рождения
const calculateAgeFromBirthYear = (input: string): string => {
  const numericInput = Number.parseInt(input)

  // Если введено число больше текущего года или меньше 1900, считаем это возрастом
  const currentYear = new Date().getFullYear()
  if (numericInput > currentYear || numericInput < 1900) {
    return input
  }

  // Если введено число от 1900 до текущего года, считаем это годом рождения
  if (numericInput >= 1900 && numericInput <= currentYear) {
    const age = currentYear - numericInput
    return age.toString()
  }

  return input
}

export default function CardioRiskCalculator({ language, onLanguageChange }: CardioRiskCalculatorProps) {
  const [t, setT] = useState(getTranslation(language))
  const resultContainerRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const gaugeCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [calculationCount, setCalculationCount] = useState(0)
  const [sessionStartTime] = useState(Date.now())

  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    systolicBP: "",
    totalCholesterol: "",
    hdlCholesterol: "",
    ldlCholesterol: "",
    country: "moldova",
    smoking: false,
    diabetes: false,
    myocardialInfarction: false,
    stroke: false,
    geneticPredisposition: false,
    obesity: false,
    chronicKidneyDisease: false,
    sedentaryLifestyle: false,
  })

  const [results, setResults] = useState<{
    riskScore: number | null
    riskCategory: string | null
    targetLDL: number | null
    ldlReduction: number | null
    recommendations: string[]
    calculationMethod: CalculationMethod
    nonHDLCholesterol?: number
  }>({
    riskScore: null,
    riskCategory: null,
    targetLDL: null,
    ldlReduction: null,
    recommendations: [],
    calculationMethod: null,
  })

  useEffect(() => {
    setT(getTranslation(language))
  }, [language])

  // Отслеживание загрузки приложения и проверка Google Analytics
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Проверяем загрузку Google Analytics
      const checkGA = () => {
        if (window.gtag && window.dataLayer) {
          console.log("✅ Google Analytics загружен успешно")

          // Отправляем событие загрузки калькулятора
          window.gtag("event", "calculator_loaded", {
            event_category: "cardiovascular_calculator",
            event_label: "page_load",
            calculator_type: "cardiovascular_risk",
            page_title: "Cardio Risk Calculator",
            page_location: window.location.href,
            language: language,
            anonymized: true,
          })

          // Отправляем событие начала сессии
          window.gtag("event", "session_start", {
            event_category: "cardiovascular_calculator",
            event_label: "user_session",
            calculator_type: "cardiovascular_risk",
            session_id: sessionStartTime.toString(),
            anonymized: true,
          })

          console.log("📊 Cardiovascular calculator events отправлены")

          // Отслеживаем производительность загрузки
          if (window.trackPerformance) {
            const loadTime = performance.now()
            window.trackPerformance("cardio_calculator_load_time", loadTime)
          }
        } else {
          console.log("❌ Google Analytics не загружен")
        }

        // Проверяем dataLayer
        if (window.dataLayer) {
          console.log(`✅ dataLayer доступен (${window.dataLayer.length} элементов)`)
        } else {
          console.log("❌ dataLayer не найден")
        }
      }

      // Проверяем сразу и через 2 секунды
      checkGA()
      const timer = setTimeout(checkGA, 2000)

      // Отслеживаем время, проведенное на странице
      const trackTimeSpent = () => {
        const timeSpent = Math.round((Date.now() - sessionStartTime) / 1000)
        if (window.gtag && timeSpent > 10) {
          // Отслеживаем только если пользователь провел больше 10 секунд
          window.gtag("event", "time_spent", {
            event_category: "cardiovascular_calculator",
            event_label: "session_duration",
            value: timeSpent,
            calculator_type: "cardiovascular_risk",
            anonymized: true,
          })
        }
      }

      // Отслеживаем время при закрытии страницы
      window.addEventListener("beforeunload", trackTimeSpent)

      return () => {
        clearTimeout(timer)
        window.removeEventListener("beforeunload", trackTimeSpent)
        trackTimeSpent() // Отслеживаем время при размонтировании компонента
      }
    }
  }, [sessionStartTime, language])

  // Получаем ссылку на canvas из компонента RiskGauge
  const setGaugeCanvasRef = (canvas: HTMLCanvasElement | null) => {
    gaugeCanvasRef.current = canvas
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Специальная обработка для поля возраста
    if (name === "age") {
      const processedAge = calculateAgeFromBirthYear(value)
      setFormData({ ...formData, [name]: processedAge })

      // Отслеживаем использование автоматического расчета возраста
      if (processedAge !== value && value.length >= 4) {
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "age_auto_calculation", {
            event_category: "cardiovascular_calculator",
            event_label: "birth_year_to_age",
            calculator_type: "cardiovascular_risk",
            birth_year: Number.parseInt(value),
            calculated_age: Number.parseInt(processedAge),
            anonymized: true,
          })
        }
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }

    // Отслеживаем взаимодействие с формой (анонимно)
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "form_interaction", {
        event_category: "cardiovascular_calculator",
        event_label: `field_${name}`,
        calculator_type: "cardiovascular_risk",
        field_name: name,
        anonymized: true,
      })
    }
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked })

    // Отслеживаем изменения факторов риска (анонимно)
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "risk_factor_toggle", {
        event_category: "cardiovascular_calculator",
        event_label: `${name}_${checked ? "enabled" : "disabled"}`,
        calculator_type: "cardiovascular_risk",
        risk_factor: name,
        risk_factor_enabled: checked,
        anonymized: true,
      })
    }
  }

  // Функция смены языка с отслеживанием
  const handleLanguageChange = (newLanguage: Language) => {
    const oldLanguage = language
    onLanguageChange(newLanguage)

    // Отслеживаем смену языка
    if (typeof window !== "undefined" && window.gtag && oldLanguage !== newLanguage) {
      window.gtag("event", "language_change", {
        event_category: "cardiovascular_calculator",
        event_label: `${oldLanguage}_to_${newLanguage}`,
        calculator_type: "cardiovascular_risk",
        previous_language: oldLanguage,
        new_language: newLanguage,
        anonymized: true,
      })
      console.log(`📊 Cardiovascular language change tracked: ${oldLanguage} → ${newLanguage}`)
    }
  }

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()

    const startTime = performance.now()

    try {
      const age = Number.parseInt(formData.age) || 0
      const totalCholesterol = formData.totalCholesterol ? Number.parseFloat(formData.totalCholesterol) : undefined
      const hdlCholesterol = formData.hdlCholesterol ? Number.parseFloat(formData.hdlCholesterol) : undefined
      const ldlCholesterol = formData.ldlCholesterol ? Number.parseFloat(formData.ldlCholesterol) : undefined

      let ageForCalc = age
      if (age < 40 && age > 0) ageForCalc = 40

      const score2Params = {
        age: ageForCalc,
        gender: formData.gender,
        smoker: formData.smoking,
        systolicBP: Number.parseInt(formData.systolicBP) || 0,
        totalCholesterol: totalCholesterol,
        hdlCholesterol: hdlCholesterol,
        ldlCholesterol: ldlCholesterol,
        diabetic: formData.diabetes,
        country: formData.country,
        myocardialInfarction: formData.myocardialInfarction,
        stroke: formData.stroke,
        chronicKidneyDisease: formData.chronicKidneyDisease,
        familyHistory: formData.geneticPredisposition,
        obesity: formData.obesity,
      }

      const { riskScore: risk, calculationMethod } = calculateScore2Risk(score2Params)

      let calculatedNonHDL: number | undefined = undefined
      if (calculationMethod === "official" && totalCholesterol && hdlCholesterol) {
        calculatedNonHDL = totalCholesterol - hdlCholesterol
      }

      const category = getRiskCategory(risk ?? 0, score2Params)
      const targetLDLValue = getTargetLDL(category)

      let currentLDLForReductionCalc = 0
      if (ldlCholesterol && ldlCholesterol > 0) {
        currentLDLForReductionCalc = ldlCholesterol
      } else if (calculatedNonHDL && calculatedNonHDL > 0 && category !== "low" && category !== "veryLow") {
        currentLDLForReductionCalc = Math.max(0, calculatedNonHDL - 0.8)
      }

      const ldlReduction =
        currentLDLForReductionCalc > 0 && targetLDLValue > 0
          ? calculateLDLReduction(currentLDLForReductionCalc, targetLDLValue)
          : 0

      const recommendations = getRecommendations(score2Params, category)

      setResults({
        riskScore: risk,
        riskCategory: category,
        targetLDL: targetLDLValue,
        ldlReduction: ldlReduction,
        recommendations: recommendations,
        calculationMethod: calculationMethod,
        nonHDLCholesterol: calculatedNonHDL,
      })

      // Увеличиваем счетчик расчетов
      setCalculationCount((prev) => prev + 1)

      // Отслеживаем успешный расчет риска
      if (typeof window !== "undefined" && window.gtag && risk !== null) {
        // Собираем активные факторы риска
        const activeRiskFactors = Object.entries(formData)
          .filter(([key, value]) => typeof value === "boolean" && value)
          .map(([key]) => key)

        window.gtag("event", "cardiovascular_calculation_completed", {
          event_category: "cardiovascular_calculator",
          event_label: `${category}_risk`,
          calculator_type: "cardiovascular_risk",
          risk_category: category,
          risk_score: Math.round(risk * 10) / 10, // Округляем до 1 знака
          calculation_method: calculationMethod || "unknown",
          calculation_attempt: calculationCount + 1,
          patient_age: age,
          patient_gender: formData.gender,
          active_risk_factors_count: activeRiskFactors.length,
          active_risk_factors: activeRiskFactors.join(","),
          language: language,
          anonymized: true,
          value: Math.round(risk), // Для метрик
        })

        console.log(
          `📊 Cardiovascular risk calculation tracked: ${category}, метод: ${calculationMethod}, риск: ${risk}%, попытка: ${calculationCount + 1}`,
        )
      }

      // Отслеживаем производительность расчета
      const calculationTime = performance.now() - startTime
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "calculation_performance", {
          event_category: "cardiovascular_calculator",
          event_label: "calculation_time",
          calculator_type: "cardiovascular_risk",
          value: Math.round(calculationTime),
          anonymized: true,
        })
      }
    } catch (error) {
      // Отслеживаем ошибки расчета
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "calculation_error", {
          event_category: "cardiovascular_calculator",
          event_label: "calculation_failed",
          calculator_type: "cardiovascular_risk",
          error_message: error instanceof Error ? error.message : "unknown_error",
          anonymized: true,
        })
      }
      console.error("Cardiovascular calculation error:", error)
    }
  }

  const handleExportPDF = () => {
    if (!results.riskScore || !gaugeCanvasRef.current) {
      alert(t.insufficientData)
      return
    }

    const startTime = performance.now()

    // Отслеживаем начало экспорта PDF
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "pdf_export_started", {
        event_category: "cardiovascular_calculator",
        event_label: `${results.riskCategory}_risk_pdf`,
        calculator_type: "cardiovascular_risk",
        risk_category: results.riskCategory || "unknown",
        language: language,
        anonymized: true,
      })
      console.log(`📊 Cardiovascular PDF export started: ${results.riskCategory}`)
    }

    setIsExporting(true)

    try {
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        alert(
          language === "ru"
            ? "Пожалуйста, разрешите всплывающие окна для этого сайта."
            : language === "en"
              ? "Please allow pop-ups for this site."
              : language === "ro"
                ? "Vă rugăm să permiteți ferestrele pop-up pentru acest site."
                : "Bu site için açılır pencerelere izin verin.",
        )
        setIsExporting(false)
        return
      }

      const gaugeImageData = gaugeCanvasRef.current.toDataURL("image/png")
      const categoryName = t.riskCategories[results.riskCategory as keyof typeof t.riskCategories] || ""

      // Получаем детальные рекомендации на текущем языке
      const getDetailedRecommendationsHTML = () => {
        const translations = {
          ru: {
            title: "Детальные рекомендации",
            subtitle: "Базируются на рекомендациях Европейского общества кардиологии (ESC)",
            diet: {
              title: "Диета",
              content: `
            <p><strong>Рекомендуется:</strong></p>
            <ul>
              <li>Увеличить потребление фруктов (≥200 г/день, 2-3 порции) и овощей (≥200 г/день, 2-3 порции)</li>
              <li>Употреблять рыбу 1-2 раза в неделю, особенно жирные сорта</li>
              <li>Ограничить потребление красного мяса до 350-500 г/неделю</li>
              <li>Выбирать нежирные молочные продукты</li>
              <li>Использовать цельнозерновые продукты</li>
              <li>Заменить насыщенные жиры (сливочное масло, жирное мясо) на ненасыщенные (оливковое масло, орехи)</li>
            </ul>
            <p><strong>Ограничить:</strong></p>
            <ul>
              <li>Потребление соли до &lt;5 г/день</li>
              <li>Алкоголь (&lt;100 г/неделю)</li>
              <li>Сахар и сладкие напитки</li>
              <li>Обработанные мясные продукты</li>
            </ul>
            <p><em>Источник: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
          `,
            },
            physicalActivity: {
              title: "Физическая активность",
              content: `
            <p><strong>Общие рекомендации:</strong></p>
            <ul>
              <li>Минимум 150-300 минут аэробной активности умеренной интенсивности в неделю</li>
              <li>ИЛИ 75-150 минут интенсивной аэробной активности в неделю</li>
              <li>ИЛИ эквивалентная комбинация</li>
              <li>Дополнительно: силовые упражнения 2 и более дней в неделю</li>
            </ul>
            <p><strong>Практические советы:</strong></p>
            <ul>
              <li>Ходьба не менее 30 минут в день (около 3 км) или 7000-10000 шагов</li>
              <li>Подъем по лестнице вместо лифта</li>
              <li>Активный отдых (плавание, велосипед, танцы)</li>
              <li>Уменьшение времени, проводимого сидя</li>
            </ul>
            <p><em>Источник: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
          `,
            },
            smokingCessation: {
              title: "Отказ от курения",
              content: `
            <p><strong>Рекомендации:</strong></p>
            <ul>
              <li>Полный отказ от всех форм табака</li>
              <li>Избегание пассивного курения</li>
              <li>Для курильщиков: обратиться за профессиональной помощью для отказа от курения</li>
              <li>Рассмотреть никотинзаместительную терапию и/или медикаментозную поддержку</li>
            </ul>
            <p><strong>Польза отказа от курения:</strong></p>
            <ul>
              <li>Снижение риска ИБС на 50% через 1 год</li>
              <li>Снижение риска инсульта до уровня некурящих через 5-15 лет</li>
            </ul>
            <p><em>Источник: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
          `,
            },
            weightReduction: {
              title: "Снижение массы тела",
              content: `
            <p><strong>Целевые показатели:</strong></p>
            <ul>
              <li>ИМТ 20-25 кг/м²</li>
              <li>Окружность талии &lt;94 см для мужчин и &lt;80 см для женщин</li>
            </ul>
            <p><strong>Рекомендации:</strong></p>
            <ul>
              <li>Снижение веса на 5-10% от исходного уже приносит пользу для здоровья</li>
              <li>Сочетание диеты с ограничением калорий и увеличением физической активности</li>
              <li>Постепенное снижение веса (0.5-1 кг в неделю)</li>
              <li>Долгосрочное изменение пищевых привычек</li>
            </ul>
            <p><em>Источник: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
          `,
            },
            bloodPressureControl: {
              title: "Контроль артериального давления",
              content: `
            <p><strong>Целевые показатели:</strong></p>
            <ul>
              <li>Для большинства пациентов: &lt;140/90 мм рт.ст.</li>
              <li>При хорошей переносимости: &lt;130/80 мм рт.ст.</li>
              <li>Для пациентов &gt;65 лет: систолическое АД 130-139 мм рт.ст.</li>
            </ul>
            <p><strong>Немедикаментозные меры:</strong></p>
            <ul>
              <li>Ограничение потребления соли (&lt;5 г/день)</li>
              <li>Увеличение потребления фруктов и овощей</li>
              <li>Регулярная физическая активность</li>
              <li>Поддержание нормального веса</li>
              <li>Ограничение алкоголя</li>
            </ul>
            <p><em>Источник: ESC Guidelines on arterial hypertension (2018) и ESC Guidelines on cardiovascular disease prevention (2021)</em></p>
          `,
            },
            glucoseControl: {
              title: "Контроль глюкозы",
              content: `
            <p><strong>Целевые показатели для пациентов с диабетом:</strong></p>
            <ul>
              <li>HbA1c &lt;7% (53 ммоль/моль) для большинства пациентов</li>
              <li>Глюкоза натощак 4.4-7.2 ммоль/л</li>
              <li>Постпрандиальная глюкоза &lt;10 ммоль/л</li>
            </ul>
            <p><strong>Рекомендации:</strong></p>
            <ul>
              <li>Регулярный мониторинг уровня глюкозы</li>
              <li>Диета с низким гликемическим индексом</li>
              <li>Регулярная физическая активность</li>
              <li>Поддержание нормального веса</li>
              <li>Прием назначенных препаратов</li>
            </ul>
            <p><em>Источник: ESC Guidelines on diabetes, pre-diabetes, and cardiovascular diseases (2019)</em></p>
          `,
            },
            highRiskWarning: {
              title: "Важное предупреждение",
              content: `
            <p>При высоком или очень высоком сердечно-сосудистом риске настоятельно рекомендуется:</p>
            <ul>
              <li>Консультация кардиолога</li>
              <li>Регулярный контроль факторов риска</li>
              <li>Рассмотрение медикаментозной терапии для снижения уровня холестерина и артериального давления</li>
            </ul>
            <p><em>Источник: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
          `,
            },
          },
          en: {
            title: "Detailed Recommendations",
            subtitle: "Based on European Society of Cardiology (ESC) guidelines",
            diet: {
              title: "Diet",
              content: `
            <p><strong>Recommended:</strong></p>
            <ul>
              <li>Increase consumption of fruits (≥200 g/day, 2-3 servings) and vegetables (≥200 g/day, 2-3 servings)</li>
              <li>Consume fish 1-2 times per week, especially fatty fish</li>
              <li>Limit red meat consumption to 350-500 g/week</li>
              <li>Choose low-fat dairy products</li>
              <li>Use whole grain products</li>
              <li>Replace saturated fats (butter, fatty meat) with unsaturated fats (olive oil, nuts)</li>
            </ul>
            <p><strong>Limit:</strong></p>
            <ul>
              <li>Salt intake to &lt;5 g/day</li>
              <li>Alcohol (&lt;100 g/week)</li>
              <li>Sugar and sweetened beverages</li>
              <li>Processed meat products</li>
            </ul>
            <p><em>Source: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
          `,
            },
            physicalActivity: {
              title: "Physical Activity",
              content: `
            <p><strong>General recommendations:</strong></p>
            <ul>
              <li>At least 150-300 minutes of moderate-intensity aerobic activity per week</li>
              <li>OR 75-150 minutes of vigorous aerobic activity per week</li>
              <li>OR an equivalent combination</li>
              <li>Additionally: muscle-strengthening activities on 2 or more days per week</li>
            </ul>
            <p><strong>Practical advice:</strong></p>
            <ul>
              <li>Walking at least 30 minutes per day (about 3 km) or 7,000-10,000 steps</li>
              <li>Taking stairs instead of elevators</li>
              <li>Active leisure activities (swimming, cycling, dancing)</li>
              <li>Reducing sitting time</li>
            </ul>
            <p><em>Source: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
          `,
            },
            smokingCessation: {
              title: "Smoking Cessation",
              content: `
            <p><strong>Recommendations:</strong></p>
            <ul>
              <li>Complete cessation of all forms of tobacco</li>
              <li>Avoiding passive smoking</li>
              <li>For smokers: seek professional help for smoking cessation</li>
              <li>Consider nicotine replacement therapy and/or medication support</li>
            </ul>
            <p><strong>Benefits of quitting:</strong></p>
            <ul>
              <li>50% reduction in CHD risk after 1 year</li>
              <li>Stroke risk reduced to that of non-smokers after 5-15 years</li>
            </ul>
            <p><em>Source: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
          `,
            },
            weightReduction: {
              title: "Weight Reduction",
              content: `
            <p><strong>Target indicators:</strong></p>
            <ul>
              <li>BMI 20-25 kg/m²</li>
              <li>Waist circumference &lt;94 cm for men and &lt;80 cm for women</li>
            </ul>
            <p><strong>Recommendations:</strong></p>
            <ul>
              <li>Weight reduction of 5-10% from baseline already provides health benefits</li>
              <li>Combination of calorie-restricted diet and increased physical activity</li>
              <li>Gradual weight loss (0.5-1 kg per week)</li>
              <li>Long-term change in eating habits</li>
            </ul>
            <p><em>Source: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
          `,
            },
            bloodPressureControl: {
              title: "Blood Pressure Control",
              content: `
            <p><strong>Target indicators:</strong></p>
            <ul>
              <li>For most patients: &lt;140/90 mmHg</li>
              <li>If well tolerated: &lt;130/80 mmHg</li>
              <li>For patients &gt;65 years: systolic BP 130-139 mmHg</li>
            </ul>
            <p><strong>Non-pharmacological measures:</strong></p>
            <ul>
              <li>Limit salt intake (&lt;5 g/day)</li>
              <li>Increase consumption of fruits and vegetables</li>
              <li>Regular physical activity</li>
              <li>Maintain normal weight</li>
              <li>Limit alcohol consumption</li>
            </ul>
            <p><em>Source: ESC Guidelines on arterial hypertension (2018) and ESC Guidelines on cardiovascular disease prevention (2021)</em></p>
          `,
            },
            glucoseControl: {
              title: "Glucose Control",
              content: `
            <p><strong>Target indicators for patients with diabetes:</strong></p>
            <ul>
              <li>HbA1c &lt;7% (53 mmol/mol) for most patients</li>
              <li>Fasting glucose 4.4-7.2 mmol/L</li>
              <li>Postprandial glucose &lt;10 mmol/L</li>
            </ul>
            <p><strong>Recommendations:</strong></p>
            <ul>
              <li>Regular monitoring of glucose levels</li>
              <li>Diet with low glycemic index</li>
              <li>Regular physical activity</li>
              <li>Maintain normal weight</li>
              <li>Take prescribed medications</li>
            </ul>
            <p><em>Source: ESC Guidelines on diabetes, pre-diabetes, and cardiovascular diseases (2019)</em></p>
          `,
            },
            highRiskWarning: {
              title: "Important Warning",
              content: `
            <p>For high or very high cardiovascular risk, it is strongly recommended to:</p>
            <ul>
              <li>Consult a cardiologist</li>
              <li>Regular monitoring of risk factors</li>
              <li>Consider medication therapy to reduce cholesterol levels and blood pressure</li>
            </ul>
            <p><em>Source: ESC Guidelines on cardiovascular disease prevention in clinical practice (2021)</em></p>
          `,
            },
          },
          ro: {
            title: "Recomandări detaliate",
            subtitle: "Bazate pe ghidurile Societății Europene de Cardiologie (ESC)",
            diet: {
              title: "Dietă",
              content: `
            <p><strong>Recomandat:</strong></p>
            <ul>
              <li>Creșterea consumului de fructe (≥200 g/zi, 2-3 porții) și legume (≥200 g/zi, 2-3 porții)</li>
              <li>Consumul de pește de 1-2 ori pe săptămână, în special pește gras</li>
              <li>Limitarea consumului de carne roșie la 350-500 g/săptămână</li>
              <li>Alegerea produselor lactate cu conținut scăzut de grăsimi</li>
              <li>Utilizarea produselor din cereale integrale</li>
              <li>Înlocuirea grăsimilor saturate (unt, carne grasă) cu grăsimi nesaturate (ulei de măsline, nuci)</li>
            </ul>
            <p><strong>Limitați:</strong></p>
            <ul>
              <li>Consumul de sare la &lt;5 g/zi</li>
              <li>Alcoolul (&lt;100 g/săptămână)</li>
              <li>Zahărul și băuturile îndulcite</li>
              <li>Produsele din carne procesată</li>
            </ul>
            <p><em>Sursă: Ghidurile ESC privind prevenția bolilor cardiovasculare în practica clinică (2021)</em></p>
          `,
            },
            physicalActivity: {
              title: "Activitate fizică",
              content: `
            <p><strong>Recomandări generale:</strong></p>
            <ul>
              <li>Minimum 150-300 minute de activitate aerobică de intensitate moderată pe săptămână</li>
              <li>SAU 75-150 minute de activitate aerobică intensă pe săptămână</li>
              <li>SAU o combinație echivalentă</li>
              <li>Suplimentar: exerciții de întărire musculară în 2 sau mai multe zile pe săptămână</li>
            </ul>
            <p><strong>Sfaturi practice:</strong></p>
            <ul>
              <li>Mers pe jos cel puțin 30 de minute pe zi (aproximativ 3 km) sau 7.000-10.000 de pași</li>
              <li>Utilizarea scărilor în loc de ascensor</li>
              <li>Activități de agrement active (înot, ciclism, dans)</li>
              <li>Reducerea timpului petrecut în poziția șezut</li>
            </ul>
            <p><em>Sursă: Ghidurile ESC privind prevenția bolilor cardiovasculare în practica clinică (2021)</em></p>
          `,
            },
            smokingCessation: {
              title: "Renunțarea la fumat",
              content: `
            <p><strong>Recomandări:</strong></p>
            <ul>
              <li>Renunțarea completă la toate formele de tutun</li>
              <li>Evitarea fumatului pasiv</li>
              <li>Pentru fumători: solicitați ajutor profesional pentru renunțarea la fumat</li>
              <li>Luați în considerare terapia de înlocuire a nicotinei și/sau suportul medicamentos</li>
            </ul>
            <p><strong>Beneficiile renunțării:</strong></p>
            <ul>
              <li>Reducerea cu 50% a riscului de boală coronariană după 1 an</li>
              <li>Riscul de accident vascular cerebral redus la cel al nefumătorilor după 5-15 ani</li>
            </ul>
            <p><em>Sursă: Ghidurile ESC privind prevenția bolilor cardiovasculare în practica clinică (2021)</em></p>
          `,
            },
            weightReduction: {
              title: "Reducerea greutății",
              content: `
            <p><strong>Indicatori țintă:</strong></p>
            <ul>
              <li>IMC 20-25 kg/m²</li>
              <li>Circumferința taliei &lt;94 cm pentru bărbați și &lt;80 cm pentru femei</li>
            </ul>
            <p><strong>Recomandări:</strong></p>
            <ul>
              <li>Reducerea greutății cu 5-10% față de valoarea inițială oferă deja beneficii pentru sănătate</li>
              <li>Combinația dintre dieta cu restricție calorică și creșterea activității fizice</li>
              <li>Pierdere graduală în greutate (0,5-1 kg pe săptămână)</li>
              <li>Schimbarea pe termen lung a obiceiurilor alimentare</li>
            </ul>
            <p><em>Sursă: Ghidurile ESC privind prevenția bolilor cardiovasculare în practica clinică (2021)</em></p>
          `,
            },
            bloodPressureControl: {
              title: "Controlul tensiunii arteriale",
              content: `
            <p><strong>Indicatori țintă:</strong></p>
            <ul>
              <li>Pentru majoritatea pacienților: &lt;140/90 mmHg</li>
              <li>Dacă este bine tolerată: &lt;130/80 mmHg</li>
              <li>Pentru pacienții &gt;65 ani: TA sistolică 130-139 mmHg</li>
            </ul>
            <p><strong>Măsuri nefarmacologice:</strong></p>
            <ul>
              <li>Limitarea consumului de sare (&lt;5 g/zi)</li>
              <li>Creșterea consumului de fructe și legume</li>
              <li>Activitate fizică regulată</li>
              <li>Menținerea greutății normale</li>
              <li>Limitarea consumului de alcool</li>
            </ul>
            <p><em>Sursă: Ghidurile ESC privind hipertensiunea arterială (2018) și Ghidurile ESC privind prevenția bolilor cardiovasculare (2021)</em></p>
          `,
            },
            glucoseControl: {
              title: "Controlul glicemiei",
              content: `
            <p><strong>Indicatori țintă pentru pacienții cu diabet:</strong></p>
            <ul>
              <li>HbA1c &lt;7% (53 mmol/mol) pentru majoritatea pacienților</li>
              <li>Glicemia à jeun 4,4-7,2 mmol/L</li>
              <li>Glicemia postprandială &lt;10 mmol/L</li>
            </ul>
            <p><strong>Recomandări:</strong></p>
            <ul>
              <li>Monitorizarea regulată a nivelurilor de glucoză</li>
              <li>Dietă cu indice glicemic scăzut</li>
              <li>Activitate fizică regulată</li>
              <li>Menținerea greutății normale</li>
              <li>Administrarea medicamentelor prescrise</li>
            </ul>
            <p><em>Sursă: Ghidurile ESC privind diabetul, pre-diabetul și bolile cardiovasculare (2019)</em></p>
          `,
            },
            highRiskWarning: {
              title: "Avertisment important",
              content: `
            <p>Pentru risc cardiovascular ridicat sau foarte ridicat, se recomandă cu tărie:</p>
            <ul>
              <li>Consultarea unui cardiolog</li>
              <li>Monitorizarea regulată a factorilor de risc</li>
              <li>Luarea în considerare a terapiei medicamentoase pentru reducerea nivelurilor de colesterol și a tensiunii arteriale</li>
            </ul>
            <p><em>Sursă: Ghidurile ESC privind prevenția bolilor cardiovasculare în practica clinică (2021)</em></p>
          `,
            },
          },
          gag: {
            title: "Detaylı tavsiyeler",
            subtitle: "Evropa Kardioloji Cemiyetinin (ESC) kılavuzlarına dayanarak",
            diet: {
              title: "Diyet",
              content: `
            <p><strong>Tavsiye edilir:</strong></p>
            <ul>
              <li>Meyva (günde ≥200 g, 2-3 porsiyon) ve sebze (günde ≥200 g, 2-3 porsiyon) tüketimini artırmak</li>
              <li>Haftada 1-2 kere balık tüketmek, özellikle yağlı balık</li>
              <li>Kırmızı et tüketimini haftada 350-500 g'a sınırlamak</li>
            </ul>
            <p><strong>Sınırlamak:</strong></p>
            <ul>
              <li>Tuz tüketimini günde &lt;5 g'a</li>
              <li>Alkol (haftada &lt;100 g)</li>
              <li>Şeker ve tatlı içecekler</li>
              <li>İşlenmiş et ürünleri</li>
            </ul>
            <p><em>Kaynak: ESC Klinik pratikte kardiyovasküler hastalık önleme kılavuzları (2021)</em></p>
          `,
            },
            physicalActivity: {
              title: "Fizik aktivlik",
              content: `
            <p><strong>Genel tavsiyeler:</strong></p>
            <ul>
              <li>Haftada en az 150-300 dakika orta yoğunlukta aerobik aktivite</li>
              <li>VEYA haftada 75-150 dakika yoğun aerobik aktivite</li>
              <li>VEYA eşdeğer bir kombinasyon</li>
              <li>Ek olarak: haftada 2 veya daha fazla gün kas güçlendirme aktiviteleri</li>
            </ul>
            <p><strong>Praktik tavsiyeler:</strong></p>
            <ul>
              <li>Günde en az 30 dakika yürüyüş (yaklaşık 3 km) veya 7.000-10.000 adım</li>
              <li>Asansör yerine merdiven kullanmak</li>
              <li>Aktif boş zaman aktiviteleri (yüzme, bisiklet, dans)</li>
              <li>Oturma süresini azaltmak</li>
            </ul>
            <p><em>Kaynak: ESC Klinik pratikte kardiyovasküler hastalık önleme kılavuzları (2021)</em></p>
          `,
            },
            smokingCessation: {
              title: "Tütün içmektän vazgeçmäk",
              content: `
            <p><strong>Tavsiyeler:</strong></p>
            <ul>
              <li>Tüm tütün formlarından tamamen vazgeçmek</li>
              <li>Pasif tütün içmekten kaçınmak</li>
              <li>Tütün içenler için: tütün içmekten vazgeçmek için profesyonel yardım almak</li>
              <li>Nikotin replasman tedavisi ve/veya ilaç desteğini düşünmek</li>
            </ul>
            <p><strong>Vazgeçmenin faydaları:</strong></p>
            <ul>
              <li>1 yıl sonra koroner kalp hastalığı riskinde %50 azalma</li>
              <li>5-15 yıl sonra inme riskinin tütün içmeyenlerin seviyesine düşmesi</li>
            </ul>
            <p><em>Kaynak: ESC Klinik pratikte kardiyovasküler hastalık önleme kılavuzları (2021)</em></p>
          `,
            },
            weightReduction: {
              title: "Kilo kaybı",
              content: `
            <p><strong>Hedef göstergeler:</strong></p>
            <ul>
              <li>VKİ 20-25 kg/m²</li>
              <li>Bel çevresi erkekler için &lt;94 cm ve kadınlar için &lt;80 cm</li>
            </ul>
            <p><strong>Tavsiyeler:</strong></p>
            <ul>
              <li>Başlangıç ağırlığından %5-10 kilo kaybı bile sağlık için fayda sağlar</li>
              <li>Kalori kısıtlamalı diyet ve artan fiziksel aktivite kombinasyonu</li>
              <li>Kademeli kilo kaybı (haftada 0,5-1 kg)</li>
              <li>Yeme alışkanlıklarında uzun vadeli değişiklik</li>
            </ul>
            <p><em>Kaynak: ESC Klinik pratikte kardiyovasküler hastalık önleme kılavuzları (2021)</em></p>
          `,
            },
            bloodPressureControl: {
              title: "Kan basıncı kontrolü",
              content: `
            <p><strong>Hedef göstergeler:</strong></p>
            <ul>
              <li>Çoğu hasta için: &lt;140/90 mmHg</li>
              <li>İyi tolere edilirse: &lt;130/80 mmHg</li>
              <li>&gt;65 yaş üstü hastalar için: sistolik KB 130-139 mmHg</li>
            </ul>
            <p><strong>İlaç dışı önlemler:</strong></p>
            <ul>
              <li>Tuz alımını sınırlamak (günde &lt;5 g)</li>
              <li>Meyve ve sebze tüketimini artırmak</li>
              <li>Düzenli fiziksel aktivite</li>
              <li>Normal kilonun korunması</li>
              <li>Alkol tüketiminin sınırlanması</li>
            </ul>
            <p><em>Kaynak: ESC Arteriyel hipertansiyon kılavuzları (2018) ve ESC Kardiyovasküler hastalık önleme kılavuzları (2021)</em></p>
          `,
            },
            glucoseControl: {
              title: "Glükoz kontrolü",
              content: `
            <p><strong>Diyabetli hastalar için hedef göstergeler:</strong></p>
            <ul>
              <li>Çoğu hasta için HbA1c &lt;7% (53 mmol/mol)</li>
              <li>Açlık glukozu 4,4-7,2 mmol/L</li>
              <li>Yemek sonrası glukoz &lt;10 mmol/L</li>
            </ul>
            <p><strong>Tavsiyeler:</strong></p>
            <ul>
              <li>Glukoz seviyelerinin düzenli izlenmesi</li>
              <li>Düşük glisemik indeksli diyet</li>
              <li>Düzenli fiziksel aktivite</li>
              <li>Normal kilonun korunması</li>
              <li>Reçete edilen ilaçların alınması</li>
            </ul>
            <p><em>Kaynak: ESC Diyabet, pre-diyabet ve kardiyovasküler hastalıklar kılavuzları (2019)</em></p>
          `,
            },
            highRiskWarning: {
              title: "Önemli uyarı",
              content: `
            <p>Yüksek veya çok yüksek kardiyovasküler risk için şunlar şiddetle tavsiye edilir:</p>
            <ul>
              <li>Bir kardiyoloğa danışmak</li>
              <li>Risk faktörlerinin düzenli izlenmesi</li>
              <li>Kolesterol seviyelerini ve kan basıncını düşürmek için ilaç tedavisini düşünmek</li>
            </ul>
            <p><em>Kaynak: ESC Klinik pratikte kardiyovasküler hastalık önleme kılavuzları (2021)</em></p>
          `,
            },
          },
        }

        const currentTranslations = translations[language] || translations.en
        let recommendationsHTML = `
      <div class="recommendations-section">
      <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 5px; margin-top: 15px; color: #1f2937;">${currentTranslations.title}</h2>
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">${currentTranslations.subtitle}</p>
      `

        // Добавляем каждую рекомендацию
        results.recommendations.forEach((rec) => {
          if (currentTranslations[rec as keyof typeof currentTranslations]) {
            const section = currentTranslations[rec as keyof typeof currentTranslations] as any
            recommendationsHTML += `
          <div class="recommendation-item">
            <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 5px; color: #1f2937;">${section.title}</h3>
            <div style="font-size: 14px; line-height: 1.3;">${section.content}</div>
          </div>
          `
          }
        })

        // Добавляем предупреждение для высокого риска
        if (results.riskCategory === "high" || results.riskCategory === "veryHigh") {
          recommendationsHTML += `
        <div class="recommendation-item">
          <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 5px; color: #dc2626;">${currentTranslations.highRiskWarning.title}</h3>
          <div style="font-size: 14px; line-height: 1.3;">${currentTranslations.highRiskWarning.content}</div>
        </div>
        `
        }

        recommendationsHTML += `</div>`
        return recommendationsHTML
      }

      // Получаем данные для отображения
      const nonHDLCholesterolDisplay = results.nonHDLCholesterol
        ? `<p><strong>${t.nonHDLCholesterolResult}:</strong> ${results.nonHDLCholesterol.toFixed(1)} ${t.mmolL}</p>`
        : ""

      const calculationMethodText = results.calculationMethod
        ? `${t.calculationMethodLabel} ${
            results.calculationMethod === "official"
              ? t.officialMethodUsed
              : results.calculationMethod === "simplified"
                ? t.simplifiedMethodUsed
                : t.insufficientData
          }`
        : ""

      // Собираем факторы риска
      const riskFactors = []
      if (formData.smoking) riskFactors.push(`• ${t.smoking}`)
      if (formData.diabetes) riskFactors.push(`• ${t.diabetes}`)
      if (formData.myocardialInfarction) riskFactors.push(`• ${t.myocardialInfarction}`)
      if (formData.stroke) riskFactors.push(`• ${t.stroke}`)
      if (formData.chronicKidneyDisease) riskFactors.push(`• ${t.chronicKidneyDisease}`)
      if (formData.geneticPredisposition) riskFactors.push(`• ${t.geneticPredisposition}`)
      if (formData.obesity) riskFactors.push(`• ${t.obesity}`)
      if (formData.sedentaryLifestyle) riskFactors.push(`• ${t.sedentaryLifestyle}`)

      printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${t.title}</title>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          font-size: 14px; 
          line-height: 1.3;
          margin: 15px;
          color: #1f2937;
        }
        .header { 
          display: flex; 
          align-items: center; 
          margin-bottom: 15px; 
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .title-main { 
          font-size: 24px; 
          font-weight: bold; 
          color: #1f2937;
          margin-bottom: 2px;
        }
        .title-sub { 
          font-size: 18px; 
          color: #6b7280;
        }
        .section-title { 
          font-size: 18px; 
          font-weight: bold; 
          margin-top: 15px; 
          margin-bottom: 8px; 
          color: #1f2937;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 3px;
        }
        .patient-results-grid { 
          position: relative;
          margin-top: 10px;
        }
        .gauge-container { 
          position: absolute;
          top: 50px;
          right: 0;
          text-align: center;
          margin-top: 0;
        }
        .gauge-image { 
          width: 282px; 
          height: auto;
          max-width: 100%;
        }
        .patient-data {
          padding-right: 0;
        }
        p { 
          margin: 3px 0; 
        }
        .footer { 
          margin-top: 20px; 
          font-size: 12px; 
          text-align: center; 
          border-top: 1px solid #ccc; 
          padding-top: 8px; 
          color: #6b7280;
        }
        .risk-factors {
          margin-left: 0;
          padding-left: 0;
        }
        .risk-factors p {
          margin: 2px 0;
        }
        ul {
          margin: 5px 0;
          padding-left: 18px;
        }
        li {
          margin: 2px 0;
        }
        h2 {
          font-size: 18px;
          font-weight: bold;
          margin-top: 12px;
          margin-bottom: 6px;
        }
        h3 {
          font-size: 15px;
          font-weight: bold;
          margin-top: 10px;
          margin-bottom: 5px;
        }
        .recommendations-section {
          margin-top: 15px;
        }
        .recommendation-item {
          margin-bottom: 10px;
        }
        .drug-therapy-box {
          margin-top: 10px; 
          padding: 8px; 
          background-color: #fef2f2; 
          border: 1px solid #fecaca; 
          border-radius: 4px;
          width: 100%;
          grid-column: 1 / -1;
        }
        .drug-therapy-title {
          font-weight: bold; 
          color: #dc2626; 
          margin-bottom: 3px;
          font-size: 15px;
        }
        .drug-therapy-text {
          font-size: 14px;
          margin: 0;
        }
        .patient-data {
          padding-right: 0;
        }
        .patient-info-and-gauge-container {
            overflow: hidden; /* Contains floats */
            margin-bottom: 15px;
        }
        .patient-data-block {
            float: left;
            width: calc(100% - 300px); /* Adjust width based on gauge width + margin */
        }
        .gauge-container-pdf {
            float: right;
            width: 282px; /* Reduced size */
            margin-left: 15px; /* Space between patient data and gauge */
        }
        .gauge-image-pdf {
            width: 100%;
            height: auto;
        }
        .results-text-content {
            /* This section is now below the patient data and gauge */
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title-main">${t.title}</div>
        </div>
      </div>

      <div class="patient-info-and-gauge-container">
          <div class="patient-data-block">
              <div class="section-title">${language === "ru" ? "Данные пациента" : language === "en" ? "Patient Data" : language === "ro" ? "Date pacient" : "Hasta verileri"}</div>
              <p><strong>${t.age}:</strong> ${formData.age}</p>
              <p><strong>${t.gender}:</strong> ${formData.gender === "male" ? t.male : t.female}</p>
              <p><strong>${t.systolicBP}:</strong> ${formData.systolicBP} ${t.mmHg}</p>
              ${formData.ldlCholesterol ? `<p><strong>${t.ldlCholesterol}:</strong> ${formData.ldlCholesterol} ${t.mmolL}</p>` : ""}
              ${formData.hdlCholesterol ? `<p><strong>${t.hdlCholesterol}:</strong> ${formData.hdlCholesterol} ${t.mmolL}</p>` : ""}
              ${formData.totalCholesterol ? `<p><strong>${t.totalCholesterol}:</strong> ${formData.totalCholesterol} ${t.mmolL}</p>` : ""}
              ${nonHDLCholesterolDisplay}

              ${
                riskFactors.length > 0
                  ? `
                <div class="section-title">${t.riskFactors}</div>
                <div class="risk-factors">
                  ${riskFactors.map((factor) => `<p>${factor}</p>`).join("")}
                </div>
              `
                  : ""
              }
          </div>
          <div class="gauge-container-pdf">
               <img src="${gaugeImageData}" alt="Risk Gauge" class="gauge-image-pdf">
          </div>
      </div>
      <div style="clear: both;"></div>

      <div class="section-title">${language === "ru" ? "Результаты" : language === "en" ? "Results" : language === "ro" ? "Rezultate" : "Sonuçlar"}</div>
      <div class="results-text-content">
          <p style="color: ${results.riskCategory ? "#dc2626" : "#1f2937"}; font-weight: bold; font-size: 16px;">
            <strong>${t.riskLevel}:</strong> ${categoryName} - ${results.riskScore?.toFixed(1)}%
          </p>
          ${calculationMethodText ? `<p style="font-size: 12px; color: #6b7280; margin-top: 3px;">${calculationMethodText}</p>` : ""}
          <p style="margin-top: 8px;"><strong>${t.targetLDL}:</strong> ≤ ${results.targetLDL?.toFixed(1)} ${t.mmolL}</p>
          ${results.ldlReduction && results.ldlReduction > 0 ? `<p><strong>${t.reductionRequired}:</strong> ${results.ldlReduction}%</p>` : ""}
           
            <div class="drug-therapy-box">
              <p class="drug-therapy-}
           
            <div class="drug-therapy-box">
              <p class="drug-therapy-title"></p>
            </div>
            
      </div>

      ${getDetailedRecommendationsHTML()}

      <div class="footer">
        ${new Date().toLocaleDateString(language === "ru" ? "ru-RU" : language === "ro" ? "ro-RO" : language === "gag" ? "tr-TR" : "en-US")}
      </div>

      <script>
        setTimeout(() => {
          window.print();
        }, 1000);
      </script>
    </body>
    </html>
  `)

      // Отслеживаем успешный экспорт PDF
      if (typeof window !== "undefined" && window.gtag && results.riskCategory) {
        const exportTime = performance.now() - startTime

        window.gtag("event", "pdf_export_completed", {
          event_category: "cardiovascular_calculator",
          event_label: `${results.riskCategory}_risk_pdf_success`,
          calculator_type: "cardiovascular_risk",
          risk_category: results.riskCategory,
          language: language,
          export_time_ms: Math.round(exportTime),
          anonymized: true,
          value: 1, // Успешный экспорт
        })

        console.log(
          `📊 Cardiovascular PDF export completed: ${results.riskCategory}, время: ${Math.round(exportTime)}ms`,
        )
      }

      printWindow.document.close()
    } catch (error) {
      // Отслеживаем ошибки экспорта
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "pdf_export_error", {
          event_category: "cardiovascular_calculator",
          event_label: "pdf_export_failed",
          calculator_type: "cardiovascular_risk",
          error_message: error instanceof Error ? error.message : "unknown_error",
          risk_category: results.riskCategory || "unknown",
          language: language,
          anonymized: true,
        })
      }
      console.error("Error generating cardiovascular PDF:", error)
      alert(
        language === "ru"
          ? "Ошибка при создании PDF."
          : language === "en"
            ? "Error creating PDF."
            : language === "ro"
              ? "Eroare la crearea PDF-ului."
              : "PDF oluşturma hatası.",
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header with title, language switcher */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-tight">{t.title}</h1>
          </div>
          <div className="self-start sm:self-auto">
            <LanguageSwitcher currentLanguage={language} onLanguageChange={handleLanguageChange} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="w-full">
          <CardContent className="pt-6">
            <form onSubmit={handleCalculate} className="space-y-4">
              {/* Age and Gender inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">{t.age}</Label>
                  <Input id="age" name="age" type="number" value={formData.age} onChange={handleInputChange} required />
                </div>

                <div className="space-y-2">
                  <Label>{t.gender}</Label>
                  <div className="grid grid-cols-2 gap-1 border rounded-md overflow-hidden">
                    <button
                      type="button"
                      className={`py-2 px-2 text-sm font-medium transition-colors ${
                        formData.gender === "male" ? "bg-rose-600 text-white" : "bg-background hover:bg-gray-50"
                      }`}
                      onClick={() => setFormData({ ...formData, gender: "male" })}
                    >
                      {t.male}
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-2 text-sm font-medium transition-colors ${
                        formData.gender === "female" ? "bg-rose-600 text-white" : "bg-background hover:bg-gray-50"
                      }`}
                      onClick={() => setFormData({ ...formData, gender: "female" })}
                    >
                      {t.female}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="systolicBP">
                  {t.systolicBP} ({t.mmHg})
                </Label>
                <Input
                  id="systolicBP"
                  name="systolicBP"
                  type="number"
                  value={formData.systolicBP}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Cholesterol fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ldlCholesterol" className="text-sm leading-tight">
                    {t.ldlCholesterol} ({t.mmolL})
                  </Label>
                  <Input
                    id="ldlCholesterol"
                    name="ldlCholesterol"
                    type="number"
                    step="0.1"
                    value={formData.ldlCholesterol}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hdlCholesterol" className="text-sm leading-tight">
                    {t.hdlCholesterol} ({t.mmolL})
                  </Label>
                  <Input
                    id="hdlCholesterol"
                    name="hdlCholesterol"
                    type="number"
                    step="0.1"
                    value={formData.hdlCholesterol}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalCholesterol" className="text-sm leading-tight">
                    {t.totalCholesterol} ({t.mmolL})
                  </Label>
                  <Input
                    id="totalCholesterol"
                    name="totalCholesterol"
                    type="number"
                    step="0.1"
                    value={formData.totalCholesterol}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Risk factor checkboxes - симметричное расположение */}
              <div className="space-y-3">
                <Label className="block mb-3 text-base font-medium">{t.riskFactors}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Левая колонка - обычные факторы риска */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="smoking"
                        checked={formData.smoking}
                        onCheckedChange={(checked) => handleCheckboxChange("smoking", checked === true)}
                      />
                      <Label htmlFor="smoking" className="font-normal text-sm leading-tight cursor-pointer">
                        {t.smoking}
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="geneticPredisposition"
                        checked={formData.geneticPredisposition}
                        onCheckedChange={(checked) => handleCheckboxChange("geneticPredisposition", checked === true)}
                      />
                      <Label
                        htmlFor="geneticPredisposition"
                        className="font-normal text-sm leading-tight cursor-pointer"
                      >
                        {t.geneticPredisposition}
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="obesity"
                        checked={formData.obesity}
                        onCheckedChange={(checked) => handleCheckboxChange("obesity", checked === true)}
                      />
                      <Label htmlFor="obesity" className="font-normal text-sm leading-tight cursor-pointer">
                        {t.obesity}
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="sedentaryLifestyle"
                        checked={formData.sedentaryLifestyle}
                        onCheckedChange={(checked) => handleCheckboxChange("sedentaryLifestyle", checked === true)}
                      />
                      <Label htmlFor="sedentaryLifestyle" className="font-normal text-sm leading-tight cursor-pointer">
                        {t.sedentaryLifestyle}
                      </Label>
                    </div>
                  </div>

                  {/* Правая колонка - серьезные факторы риска с розовым фоном */}
                  <div className="space-y-3 p-4 bg-rose-50 rounded-lg border border-rose-200">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="diabetes"
                        checked={formData.diabetes}
                        onCheckedChange={(checked) => handleCheckboxChange("diabetes", checked === true)}
                      />
                      <Label htmlFor="diabetes" className="font-normal text-sm leading-tight cursor-pointer">
                        {t.diabetes}
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="myocardialInfarction"
                        checked={formData.myocardialInfarction}
                        onCheckedChange={(checked) => handleCheckboxChange("myocardialInfarction", checked === true)}
                      />
                      <Label
                        htmlFor="myocardialInfarction"
                        className="font-normal text-sm leading-tight cursor-pointer"
                      >
                        {t.myocardialInfarction}
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="stroke"
                        checked={formData.stroke}
                        onCheckedChange={(checked) => handleCheckboxChange("stroke", checked === true)}
                      />
                      <Label htmlFor="stroke" className="font-normal text-sm leading-tight cursor-pointer">
                        {t.stroke}
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="chronicKidneyDisease"
                        checked={formData.chronicKidneyDisease}
                        onCheckedChange={(checked) => handleCheckboxChange("chronicKidneyDisease", checked === true)}
                      />
                      <Label
                        htmlFor="chronicKidneyDisease"
                        className="font-normal text-sm leading-tight cursor-pointer"
                      >
                        {t.chronicKidneyDisease}
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700">
                {t.calculate}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="pt-6">
            {results.riskScore !== null ? (
              <div className="space-y-6" ref={resultContainerRef}>
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-4">{t.riskLevel}</h2>
                  <RiskGauge
                    riskValue={results.riskScore}
                    riskCategory={results.riskCategory || "low"}
                    language={language}
                    canvasRef={canvasRef}
                    setCanvasRef={setGaugeCanvasRef}
                  />
                </div>

                {results.calculationMethod && (
                  <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                    <p>
                      <strong>{t.calculationMethodLabel}</strong>{" "}
                      {results.calculationMethod === "official"
                        ? t.officialMethodUsed
                        : results.calculationMethod === "simplified"
                          ? t.simplifiedMethodUsed
                          : t.insufficientData}
                    </p>
                    {results.calculationMethod === "official" && results.nonHDLCholesterol !== undefined && (
                      <p>
                        <strong>{t.nonHDLCholesterolResult}:</strong> {results.nonHDLCholesterol.toFixed(1)} {t.mmolL}
                      </p>
                    )}
                  </div>
                )}

                {/* Target LDL, Non-HDL Cholesterol, Reduction Required cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                  <Card className="bg-gray-50">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{t.targetLDL}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4 px-4">
                      <p className="text-xl font-semibold">
                        ≤ {results.targetLDL?.toFixed(1)} {t.mmolL}
                      </p>
                    </CardContent>
                  </Card>

                  {results.nonHDLCholesterol !== undefined && (
                    <Card className="bg-gray-50">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{t.nonHDLCholesterolResult}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-4 px-4">
                        <p className="text-xl font-semibold">
                          {results.nonHDLCholesterol.toFixed(1)} {t.mmolL}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-gray-50">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{t.reductionRequired}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4 px-4">
                      <p className="text-xl font-semibold">
                        {results.ldlReduction && results.ldlReduction > 0 ? `${results.ldlReduction}%` : "-"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    className="flex items-center gap-1 bg-transparent"
                    disabled={isExporting}
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? (language === "ru" ? "Создание..." : "Generating...") : t.exportPDF}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center text-muted-foreground text-sm leading-relaxed space-y-3">
                  <p className="font-medium text-base mb-4">{t.disclaimerTitle}</p>
                  <p>{t.disclaimerSimplified}</p>
                  <p>{t.disclaimerOfficial}</p>
                  <p>{t.disclaimerRecommendation}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {results.riskScore !== null && (
        <DetailedRecommendations
          recommendations={results.recommendations}
          language={language}
          riskCategory={results.riskCategory || "low"}
        />
      )}
    </div>
  )
}
