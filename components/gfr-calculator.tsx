"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"
import { calculateGFR, convertCreatinine, type GFRParams } from "@/lib/gfr-calculator"
import GFRGauge from "./gfr-gauge"
import LanguageSwitcher from "./language-switcher"
import { getTranslation, type Language } from "@/lib/i18n/translations"

// Объявляем типы для глобальных функций Google Analytics
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

interface GFRCalculatorProps {
  language: Language
  onLanguageChange: (language: Language) => void
}

export default function GFRCalculator({ language, onLanguageChange }: GFRCalculatorProps) {
  const [t, setT] = useState(getTranslation(language))
  const [isExporting, setIsExporting] = useState(false)
  const gaugeCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [sessionStartTime] = useState(Date.now())

  const [formData, setFormData] = useState({
    age: "",
    gender: "male" as "male" | "female",
    creatinine: "",
    unit: "umoll" as "mgdl" | "umoll",
  })

  const [result, setResult] = useState<{
    gfr: number
    stage: string
    interpretation: string
    recommendations: string[]
  } | null>(null)

  useEffect(() => {
    setT(getTranslation(language))
  }, [language])

  // Отслеживание загрузки GFR калькулятора
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkGA = () => {
        if (window.gtag && window.dataLayer) {
          console.log("✅ Google Analytics загружен для GFR калькулятора")

          // Отправляем событие загрузки GFR калькулятора
          window.gtag("event", "calculator_loaded", {
            event_category: "gfr_calculator",
            event_label: "page_load",
            calculator_type: "gfr_ckd_epi",
            page_title: "GFR Calculator",
            page_location: window.location.href,
            language: language,
            anonymized: true,
          })

          // Отправляем событие начала сессии
          window.gtag("event", "session_start", {
            event_category: "gfr_calculator",
            event_label: "user_session",
            calculator_type: "gfr_ckd_epi",
            session_id: sessionStartTime.toString(),
            anonymized: true,
          })

          console.log("📊 GFR calculator events отправлены")
        }
      }

      checkGA()
      const timer = setTimeout(checkGA, 2000)

      // Отслеживаем время, проведенное на странице GFR калькулятора
      const trackTimeSpent = () => {
        const timeSpent = Math.round((Date.now() - sessionStartTime) / 1000)
        if (window.gtag && timeSpent > 10) {
          window.gtag("event", "time_spent", {
            event_category: "gfr_calculator",
            event_label: "session_duration",
            value: timeSpent,
            calculator_type: "gfr_ckd_epi",
            anonymized: true,
          })
        }
      }

      window.addEventListener("beforeunload", trackTimeSpent)

      return () => {
        clearTimeout(timer)
        window.removeEventListener("beforeunload", trackTimeSpent)
        trackTimeSpent()
      }
    }
  }, [sessionStartTime, language])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Отслеживаем взаимодействие с формой GFR калькулятора
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "form_interaction", {
        event_category: "gfr_calculator",
        event_label: `field_${name}`,
        calculator_type: "gfr_ckd_epi",
        field_name: name,
        anonymized: true,
      })
    }
  }

  const handleUnitChange = (newUnit: "mgdl" | "umoll") => {
    if (formData.unit !== newUnit && formData.creatinine) {
      const convertedValue = convertCreatinine(Number.parseFloat(formData.creatinine), formData.unit, newUnit)
      setFormData((prev) => ({
        ...prev,
        unit: newUnit,
        creatinine: convertedValue.toFixed(newUnit === "umoll" ? 0 : 2),
      }))
    } else {
      setFormData((prev) => ({ ...prev, unit: newUnit }))
    }

    // Отслеживаем смену единиц измерения
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "unit_change", {
        event_category: "gfr_calculator",
        event_label: `unit_${newUnit}`,
        calculator_type: "gfr_ckd_epi",
        new_unit: newUnit,
        previous_unit: formData.unit,
        anonymized: true,
      })
    }
  }

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()

    const startTime = performance.now()

    try {
      const params: GFRParams = {
        age: Number.parseInt(formData.age) || 0,
        gender: formData.gender,
        creatinine: Number.parseFloat(formData.creatinine) || 0,
        unit: formData.unit,
      }

      const gfrResult = calculateGFR(params)
      setResult(gfrResult)

      // Отслеживаем успешный расчет GFR
      if (typeof window !== "undefined" && window.gtag) {
        const calculationTime = performance.now() - startTime

        window.gtag("event", "gfr_calculation_completed", {
          event_category: "gfr_calculator",
          event_label: `${gfrResult.stage}_stage`,
          calculator_type: "gfr_ckd_epi",
          gfr_value: Math.round(gfrResult.gfr),
          ckd_stage: gfrResult.stage,
          patient_age: params.age,
          patient_gender: params.gender,
          creatinine_unit: params.unit,
          calculation_time_ms: Math.round(calculationTime),
          language: language,
          anonymized: true,
          value: Math.round(gfrResult.gfr), // Для метрик
        })

        console.log(
          `📊 GFR calculation tracked: ${gfrResult.stage}, GFR: ${gfrResult.gfr}, время: ${Math.round(calculationTime)}ms`,
        )
      }
    } catch (error) {
      // Отслеживаем ошибки расчета GFR
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "calculation_error", {
          event_category: "gfr_calculator",
          event_label: "calculation_failed",
          calculator_type: "gfr_ckd_epi",
          error_message: error instanceof Error ? error.message : "unknown_error",
          anonymized: true,
        })
      }
      console.error("GFR calculation error:", error)
    }
  }

  const setGaugeCanvasRef = (canvas: HTMLCanvasElement | null) => {
    gaugeCanvasRef.current = canvas
  }

  const handleExportPDF = () => {
    if (!result || !gaugeCanvasRef.current) {
      alert("Insufficient data for export")
      return
    }

    const startTime = performance.now()

    // Отслеживаем начало экспорта PDF для GFR
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "pdf_export_GFR_started", {
        event_category: "gfr_calculator",
        event_label: `${result.stage}_stage_pdf`,
        calculator_type: "gfr_ckd_epi",
        ckd_stage: result.stage,
        gfr_value: Math.round(result.gfr),
        language: language,
        anonymized: true,
      })
      console.log(`📊 GFR PDF export started: ${result.stage}`)
    }

    setIsExporting(true)

    try {
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        alert("Please allow pop-ups for this site.")
        setIsExporting(false)
        return
      }

      const gaugeImageData = gaugeCanvasRef.current.toDataURL("image/png")
      const stageName = t.gfrCalculator.stages[result.stage as keyof typeof t.gfrCalculator.stages] || ""
      const interpretation =
        t.gfrCalculator.interpretations[result.stage as keyof typeof t.gfrCalculator.interpretations] || ""

      // Get recommendations HTML
      const getRecommendationsHTML = () => {
        let recommendationsHTML = `
          <div class="recommendations-section">
            <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 10px; margin-top: 15px; color: #1f2937;">${t.gfrCalculator.recommendations}</h2>
        `

        result.recommendations.forEach((rec) => {
          const recommendationText =
            t.gfrCalculator.recommendationTexts[rec as keyof typeof t.gfrCalculator.recommendationTexts]
          if (recommendationText) {
            recommendationsHTML += `
              <div class="recommendation-item" style="margin-bottom: 10px; padding: 10px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <div style="font-size: 14px; line-height: 1.4; white-space: pre-line;">${recommendationText}</div>
              </div>
            `
          }
        })

        recommendationsHTML += `</div>`
        return recommendationsHTML
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${t.gfrCalculator.title}</title>
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
            .section-title { 
              font-size: 18px; 
              font-weight: bold; 
              margin-top: 15px; 
              margin-bottom: 8px; 
              color: #1f2937;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 3px;
            }
            .patient-info-and-gauge-container {
                overflow: hidden;
                margin-bottom: 15px;
            }
            .patient-data-block {
                float: left;
                width: calc(100% - 300px);
            }
            .gauge-container-pdf {
                float: right;
                width: 282px;
                margin-left: 15px;
            }
            .gauge-image-pdf {
                width: 100%;
                height: auto;
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
            h2 {
              font-size: 18px;
              font-weight: bold;
              margin-top: 12px;
              margin-bottom: 6px;
            }
            .recommendations-section {
              margin-top: 15px;
            }
            .recommendation-item {
              margin-bottom: 10px;
            }
            .interpretation-box {
              margin-top: 10px; 
              padding: 10px; 
              background-color: #f9fafb; 
              border: 1px solid #e5e7eb; 
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title-main">${t.gfrCalculator.title}</div>
            </div>
          </div>

          <div class="patient-info-and-gauge-container">
              <div class="patient-data-block">
                  <div class="section-title">${language === "ru" ? "Данные пациента" : language === "en" ? "Patient Data" : language === "ro" ? "Date pacient" : "Hasta verileri"}</div>
                  <p><strong>${t.gfrCalculator.age}:</strong> ${formData.age}</p>
                  <p><strong>${t.gfrCalculator.gender}:</strong> ${formData.gender === "male" ? t.gfrCalculator.male : t.gfrCalculator.female}</p>
                  <p><strong>${t.gfrCalculator.creatinine}:</strong> ${formData.creatinine} ${formData.unit === "mgdl" ? t.gfrCalculator.mgdl : t.gfrCalculator.umoll}</p>
                  <p><strong>${t.gfrCalculator.calculationMethod}</strong></p>
              </div>
              <div class="gauge-container-pdf">
                   <img src="${gaugeImageData}" alt="GFR Gauge" class="gauge-image-pdf">
              </div>
          </div>
          <div style="clear: both;"></div>

          <div class="section-title">${language === "ru" ? "Результаты" : language === "en" ? "Results" : language === "ro" ? "Rezultate" : "Sonuçlar"}</div>
          <div>
              <p style="font-weight: bold; font-size: 16px; color: #1f2937;">
                <strong>${t.gfrCalculator.gfrValue}:</strong> ${result.gfr} mL/min/1.73m²
              </p>
              <p style="margin-top: 5px;"><strong>${t.gfrCalculator.ckdStage}:</strong> ${stageName}</p>
          </div>

          <div class="section-title">${t.gfrCalculator.interpretation}</div>
          <div class="interpretation-box">
            <p>${interpretation}</p>
          </div>

          ${getRecommendationsHTML()}

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

      printWindow.document.close()

      // Отслеживаем успешный экспорт PDF для GFR
      if (typeof window !== "undefined" && window.gtag && result) {
        const exportTime = performance.now() - startTime

        window.gtag("event", "pdf_export_GFR_completed", {
          event_category: "gfr_calculator",
          event_label: `${result.stage}_stage_pdf_success`,
          calculator_type: "gfr_ckd_epi",
          ckd_stage: result.stage,
          gfr_value: Math.round(result.gfr),
          language: language,
          export_time_ms: Math.round(exportTime),
          anonymized: true,
          value: 1, // Успешный экспорт
        })

        console.log(`📊 GFR PDF export completed: ${result.stage}, время: ${Math.round(exportTime)}ms`)
      }
    } catch (error) {
      // Отслеживаем ошибки экспорта PDF для GFR
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "pdf_export_GFR_error", {
          event_category: "gfr_calculator",
          event_label: "pdf_export_failed",
          calculator_type: "gfr_ckd_epi",
          error_message: error instanceof Error ? error.message : "unknown_error",
          ckd_stage: result?.stage || "unknown",
          language: language,
          anonymized: true,
        })
      }
      console.error("Error generating GFR PDF:", error)
      alert("Error creating PDF.")
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
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-tight">
              {t.gfrCalculator.title}
            </h1>
          </div>
          <div className="self-start sm:self-auto">
            <LanguageSwitcher currentLanguage={language} onLanguageChange={onLanguageChange} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="w-full">
          <CardContent className="pt-6">
            <form onSubmit={handleCalculate} className="space-y-4">
              {/* Age and Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">{t.gfrCalculator.age}</Label>
                  <Input id="age" name="age" type="number" value={formData.age} onChange={handleInputChange} required />
                </div>

                <div className="space-y-2">
                  <Label>{t.gfrCalculator.gender}</Label>
                  <div className="grid grid-cols-2 gap-1 border rounded-md overflow-hidden">
                    <button
                      type="button"
                      className={`py-2 px-2 text-sm font-medium transition-colors ${
                        formData.gender === "male" ? "bg-blue-600 text-white" : "bg-background hover:bg-gray-50"
                      }`}
                      onClick={() => setFormData((prev) => ({ ...prev, gender: "male" }))}
                    >
                      {t.gfrCalculator.male}
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-2 text-sm font-medium transition-colors ${
                        formData.gender === "female" ? "bg-blue-600 text-white" : "bg-background hover:bg-gray-50"
                      }`}
                      onClick={() => setFormData((prev) => ({ ...prev, gender: "female" }))}
                    >
                      {t.gfrCalculator.female}
                    </button>
                  </div>
                </div>
              </div>

              {/* Creatinine */}
              <div className="space-y-2">
                <Label htmlFor="creatinine">{t.gfrCalculator.creatinine}</Label>
                <Input
                  id="creatinine"
                  name="creatinine"
                  type="number"
                  step="0.1"
                  value={formData.creatinine}
                  onChange={handleInputChange}
                  required
                />

                {/* Units switcher */}
                <div className="space-y-2">
                  <Label>{t.gfrCalculator.units}</Label>
                  <div className="grid grid-cols-2 gap-1 border rounded-md overflow-hidden">
                    <button
                      type="button"
                      className={`py-2 px-2 text-sm font-medium transition-colors ${
                        formData.unit === "umoll" ? "bg-blue-600 text-white" : "bg-background hover:bg-gray-50"
                      }`}
                      onClick={() => handleUnitChange("umoll")}
                    >
                      {t.gfrCalculator.umoll}
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-2 text-sm font-medium transition-colors ${
                        formData.unit === "mgdl" ? "bg-blue-600 text-white" : "bg-background hover:bg-gray-50"
                      }`}
                      onClick={() => handleUnitChange("mgdl")}
                    >
                      {t.gfrCalculator.mgdl}
                    </button>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {t.gfrCalculator.calculate}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="pt-6">
            {result ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-4">{t.gfrCalculator.result}</h2>
                  <GFRGauge
                    gfrValue={result.gfr}
                    stage={result.stage}
                    language={language}
                    setCanvasRef={setGaugeCanvasRef}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="bg-gray-50">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{t.gfrCalculator.gfrValue}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-4 px-4">
                        <p className="text-xl font-semibold">{result.gfr} mL/min/1.73m²</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{t.gfrCalculator.ckdStage}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-4 px-4">
                        <p className="text-xl font-semibold">
                          {t.gfrCalculator.stages[result.stage as keyof typeof t.gfrCalculator.stages]}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    className="flex items-center gap-1 bg-transparent"
                    disabled={isExporting}
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? "Generating..." : t.gfrCalculator.exportPDF}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium mb-2">{t.gfrCalculator.title}</p>
                  <p className="text-xs mt-4">{t.gfrCalculator.calculationMethod}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full-width interpretation and recommendations sections */}
      {result && (
        <div className="mt-6 space-y-6">
          {/* Interpretation section */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t.gfrCalculator.interpretation}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {t.gfrCalculator.interpretations[result.stage as keyof typeof t.gfrCalculator.interpretations]}
              </p>
            </CardContent>
          </Card>

          {/* Recommendations section */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t.gfrCalculator.recommendations}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {language === "ru"
                  ? "Основано на рекомендациях KDIGO и ESC"
                  : language === "en"
                    ? "Based on KDIGO and ESC guidelines"
                    : language === "ro"
                      ? "Bazat pe ghidurile KDIGO și ESC"
                      : "KDIGO ve ESC kılavuzlarına dayanmaktadır"}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.recommendations.map((rec, index) => {
                  const recommendationText =
                    t.gfrCalculator.recommendationTexts[rec as keyof typeof t.gfrCalculator.recommendationTexts]
                  return recommendationText ? (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <div className="whitespace-pre-line text-sm leading-relaxed">{recommendationText}</div>
                    </div>
                  ) : null
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
