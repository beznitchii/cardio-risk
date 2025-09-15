"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    gender: "",
    creatinine: "",
    unit: "umoll" as "mgdl" | "umoll",
  })

  const [result, setResult] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
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

  const handleExportPDF = async () => {
    if (!result) return

    try {
      // Track PDF export start with specific GFR event
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "pdf_export_gfr_started", {
          event_category: "gfr_calculator",
          event_label: `gfr_${result.stage.stage}`,
          gfr_value: result.gfr,
          gfr_stage: result.stage.stage,
          anonymized: true,
        })
      }

      // Simple print functionality for now
      window.print()

      // Track successful PDF export with specific GFR event
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "pdf_export_gfr_completed", {
          event_category: "gfr_calculator",
          event_label: `gfr_${result.stage.stage}`,
          gfr_value: result.gfr,
          gfr_stage: result.stage.stage,
          anonymized: true,
        })
      }
    } catch (error) {
      console.error("PDF export error:", error)

      // Track PDF export error
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "pdf_export_gfr_error", {
          event_category: "gfr_calculator",
          event_label: "pdf_export_failed",
          error: error instanceof Error ? error.message : "Unknown error",
          anonymized: true,
        })
      }
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

              {/* Creatinine and Units */}
              <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label>{t.gfrCalculator.units}</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value: "mgdl" | "umoll") => setFormData((prev) => ({ ...prev, unit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="umoll">{t.gfrCalculator.umoll}</SelectItem>
                      <SelectItem value="mgdl">{t.gfrCalculator.mgdl}</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <p className="text-sm text-gray-600 mt-1">{result.stage.description}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center pt-4 border-t">
                  <Button onClick={handleExportPDF} variant="outline" className="bg-transparent">
                    {t.gfrCalculator.exportPDF}
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
              {result.recommendations.map((rec: string, index: number) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg">
                  <p>{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
