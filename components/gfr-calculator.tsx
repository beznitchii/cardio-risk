"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"
import GFRGauge from "./gfr-gauge"
import { calculateGFR, type GFRParams } from "@/lib/gfr-calculator"
import { getTranslation, type Language } from "@/lib/i18n/translations"
import LanguageSwitcher from "./language-switcher"

interface GFRCalculatorProps {
  language: Language
  onLanguageChange: (language: Language) => void
}

export default function GFRCalculator({ language, onLanguageChange }: GFRCalculatorProps) {
  const t = getTranslation(language)

  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    creatinine: "",
    unit: "umoll" as "mgdl" | "umoll",
  })

  const [result, setResult] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)

  // Auto-calculate age from birth year
  const handleAgeChange = (value: string) => {
    const numValue = Number.parseInt(value)
    const currentYear = new Date().getFullYear()

    // Check if it's a birth year (between 1900 and current year)
    if (numValue >= 1900 && numValue <= currentYear) {
      const calculatedAge = currentYear - numValue
      setFormData((prev) => ({ ...prev, age: calculatedAge.toString() }))

      // Track the automatic age calculation
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "age_auto_calculation", {
          event_category: "gfr_calculator",
          event_label: "birth_year_to_age",
          birth_year: numValue,
          calculated_age: calculatedAge,
          calculator_type: "gfr",
          anonymized: true,
        })
      }
    } else {
      setFormData((prev) => ({ ...prev, age: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCalculating(true)

    try {
      // Track calculation start
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "gfr_calculation_started", {
          event_category: "gfr_calculator",
          event_label: "calculation_initiated",
          age: Number.parseInt(formData.age),
          gender: formData.gender,
          anonymized: true,
        })
      }

      const gfrParams: GFRParams = {
        age: Number.parseInt(formData.age),
        gender: formData.gender as "male" | "female",
        creatinine: Number.parseFloat(formData.creatinine),
        unit: formData.unit,
      }

      const gfrResult = calculateGFR(gfrParams)

      const result = {
        gfr: gfrResult.gfr,
        stage: gfrResult.stage,
        recommendations: gfrResult.recommendations,
        formData,
      }

      setResult(result)

      // Track successful calculation
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "gfr_calculation_completed", {
          event_category: "gfr_calculator",
          event_label: `stage_${gfrResult.stage.stage}`,
          gfr_value: gfrResult.gfr,
          gfr_stage: gfrResult.stage.stage,
          stage_description: gfrResult.stage.description,
          anonymized: true,
        })
      }
    } catch (error) {
      console.error("GFR calculation error:", error)

      // Track calculation error
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "gfr_calculation_error", {
          event_category: "gfr_calculator",
          event_label: "calculation_failed",
          error: error instanceof Error ? error.message : "Unknown error",
          anonymized: true,
        })
      }
    } finally {
      setIsCalculating(false)
    }
  }

  const handleExportPDF = () => {
    if (!result || !canvasRef) {
      alert(
        language === "ru"
          ? "Недостаточно данных для экспорта"
          : language === "en"
            ? "Insufficient data for export"
            : language === "ro"
              ? "Date insuficiente pentru export"
              : "Eksport için yetersiz veri",
      )
      return
    }

    const startTime = performance.now()

    // Track PDF export start
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "pdf_export_gfr_started", {
        event_category: "gfr_calculator",
        event_label: `gfr_${result.stage.stage}`,
        gfr_value: result.gfr,
        gfr_stage: result.stage.stage,
        anonymized: true,
      })
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

      const gaugeImageData = canvasRef.toDataURL("image/png")
      const stageName = t.gfrCalculator.stages[result.stage.stage as keyof typeof t.gfrCalculator.stages] || ""
      const interpretation =
        t.gfrCalculator.interpretations[result.stage.stage as keyof typeof t.gfrCalculator.interpretations] || ""

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
            .recommendations-section {
              margin-top: 15px;
            }
            .recommendation-item {
              margin-bottom: 10px;
              padding: 8px;
              background-color: #eff6ff;
              border: 1px solid #bfdbfe;
              border-radius: 4px;
            }
            .recommendation-text {
              font-size: 14px;
              line-height: 1.4;
              white-space: pre-line;
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
                  <div class="section-title">${
                    language === "ru"
                      ? "Данные пациента"
                      : language === "en"
                        ? "Patient Data"
                        : language === "ro"
                          ? "Date pacient"
                          : "Hasta verileri"
                  }</div>
                  <p><strong>${t.gfrCalculator.age}:</strong> ${formData.age}</p>
                  <p><strong>${t.gfrCalculator.gender}:</strong> ${
                    formData.gender === "male" ? t.gfrCalculator.male : t.gfrCalculator.female
                  }</p>
                  <p><strong>${t.gfrCalculator.creatinine}:</strong> ${formData.creatinine} ${
                    formData.unit === "umoll" ? t.gfrCalculator.umoll : t.gfrCalculator.mgdl
                  }</p>
              </div>
              <div class="gauge-container-pdf">
                   <img src="${gaugeImageData}" alt="GFR Gauge" class="gauge-image-pdf">
              </div>
          </div>
          <div style="clear: both;"></div>

          <div class="section-title">${
            language === "ru"
              ? "Результаты"
              : language === "en"
                ? "Results"
                : language === "ro"
                  ? "Rezultate"
                  : "Sonuçlar"
          }</div>
          <div class="results-text-content">
              <p style="font-weight: bold; font-size: 16px;">
                <strong>${t.gfrCalculator.gfrValue}:</strong> ${result.gfr} mL/min/1.73m²
              </p>
              <p style="font-weight: bold; font-size: 16px; margin-top: 8px;">
                <strong>${t.gfrCalculator.ckdStage}:</strong> ${stageName}
              </p>
              <p style="margin-top: 5px; color: #6b7280;">
                <strong>${t.gfrCalculator.interpretation}:</strong> ${interpretation}
              </p>
              <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">
                ${t.gfrCalculator.calculationMethod}
              </p>
          </div>

          <div class="recommendations-section">
            <div class="section-title">${t.gfrCalculator.recommendations}</div>
            ${result.recommendations
              .map(
                (recKey: string) => `
              <div class="recommendation-item">
                <div class="recommendation-text">${
                  t.gfrCalculator.recommendationTexts[recKey as keyof typeof t.gfrCalculator.recommendationTexts]
                }</div>
              </div>
            `,
              )
              .join("")}
          </div>

          <div class="footer">
            ${new Date().toLocaleDateString(
              language === "ru" ? "ru-RU" : language === "ro" ? "ro-RO" : language === "gag" ? "tr-TR" : "en-US",
            )}
          </div>

          <script>
            setTimeout(() => {
              window.print();
            }, 1000);
          </script>
        </body>
        </html>
      `)

      // Track successful PDF export
      if (typeof window !== "undefined" && window.gtag) {
        const exportTime = performance.now() - startTime

        window.gtag("event", "pdf_export_gfr_completed", {
          event_category: "gfr_calculator",
          event_label: `gfr_${result.stage.stage}_success`,
          gfr_value: result.gfr,
          gfr_stage: result.stage.stage,
          language: language,
          export_time_ms: Math.round(exportTime),
          anonymized: true,
          value: 1,
        })
      }

      printWindow.document.close()
    } catch (error) {
      // Track PDF export error
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "pdf_export_gfr_error", {
          event_category: "gfr_calculator",
          event_label: "pdf_export_failed",
          error: error instanceof Error ? error.message : "unknown_error",
          gfr_stage: result.stage.stage,
          language: language,
          anonymized: true,
        })
      }
      console.error("Error generating GFR PDF:", error)
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

  const isFormValid = () => {
    return formData.age && formData.gender && formData.creatinine
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header with language switcher */}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Age and Gender inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gfr-age">{t.gfrCalculator.age}</Label>
                  <Input
                    id="gfr-age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleAgeChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.gfrCalculator.gender}</Label>
                  <div className="grid grid-cols-2 gap-1 border rounded-md overflow-hidden">
                    <button
                      type="button"
                      className={`py-2 px-2 text-sm font-medium transition-colors ${
                        formData.gender === "male" ? "bg-blue-600 text-white" : "bg-background hover:bg-gray-50"
                      }`}
                      onClick={() => setFormData({ ...formData, gender: "male" })}
                    >
                      {t.gfrCalculator.male}
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-2 text-sm font-medium transition-colors ${
                        formData.gender === "female" ? "bg-blue-600 text-white" : "bg-background hover:bg-gray-50"
                      }`}
                      onClick={() => setFormData({ ...formData, gender: "female" })}
                    >
                      {t.gfrCalculator.female}
                    </button>
                  </div>
                </div>
              </div>

              {/* Creatinine input only */}
              <div className="space-y-2">
                <Label htmlFor="creatinine">{t.gfrCalculator.creatinine}</Label>
                <Input
                  id="creatinine"
                  type="number"
                  step="0.01"
                  value={formData.creatinine}
                  onChange={(e) => setFormData((prev) => ({ ...prev, creatinine: e.target.value }))}
                  required
                />
              </div>

              {/* Units selection with button style */}
              <div className="space-y-2">
                <Label>{t.gfrCalculator.units}</Label>
                <div className="grid grid-cols-2 gap-1 border rounded-md overflow-hidden">
                  <button
                    type="button"
                    className={`py-2 px-2 text-sm font-medium transition-colors ${
                      formData.unit === "umoll" ? "bg-blue-600 text-white" : "bg-background hover:bg-gray-50"
                    }`}
                    onClick={() => setFormData({ ...formData, unit: "umoll" })}
                  >
                    {t.gfrCalculator.umoll}
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-2 text-sm font-medium transition-colors ${
                      formData.unit === "mgdl" ? "bg-blue-600 text-white" : "bg-background hover:bg-gray-50"
                    }`}
                    onClick={() => setFormData({ ...formData, unit: "mgdl" })}
                  >
                    {t.gfrCalculator.mgdl}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!isFormValid() || isCalculating}
              >
                {isCalculating ? (language === "ru" ? "Расчет..." : "Calculating...") : t.gfrCalculator.calculate}
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
                    setCanvasRef={setCanvasRef}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4 border-t">
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
                      <p className="text-lg font-semibold">
                        {t.gfrCalculator.stages[result.stage.stage as keyof typeof t.gfrCalculator.stages]}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {
                          t.gfrCalculator.interpretations[
                            result.stage.stage as keyof typeof t.gfrCalculator.interpretations
                          ]
                        }
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center pt-4 border-t">
                  <Button
                    onClick={handleExportPDF}
                    variant="outline"
                    className="bg-transparent flex items-center gap-1"
                    disabled={isExporting}
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? (language === "ru" ? "Создание..." : "Generating...") : t.gfrCalculator.exportPDF}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center text-muted-foreground text-sm leading-relaxed space-y-3">
                  <p className="font-medium text-base mb-4">{t.gfrCalculator.calculationMethod}</p>
                  <p>{language === "ru" ? "Введите данные для расчета СКФ" : "Enter data to calculate GFR"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card className="w-full mt-6">
          <CardHeader>
            <CardTitle>{t.gfrCalculator.recommendations}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.recommendations.map((recKey: string, index: number) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg">
                  <div className="whitespace-pre-line">
                    {t.gfrCalculator.recommendationTexts[recKey as keyof typeof t.gfrCalculator.recommendationTexts]}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
