"use client"

import { useState } from "react"
import CardioRiskCalculator from "@/components/cardio-risk-calculator"
import GFRCalculator from "@/components/gfr-calculator"
import { getTranslation, type Language } from "@/lib/i18n/translations"
import MedicalProfessionalDisclaimer from "@/components/medical-professional-disclaimer"
import { useEffect } from "react"

type CalculatorType = "cardio" | "gfr"

export default function Home() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>("cardio")
  const [language, setLanguage] = useState<Language>("ro")
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const [isDisclaimerConfirmed, setIsDisclaimerConfirmed] = useState(false)

  const t = getTranslation(language)

  // Check medical professional status
  useEffect(() => {
    const checkMedicalProfessionalStatus = () => {
      const confirmed = localStorage.getItem("medical_professional_confirmed")
      const confirmedDate = localStorage.getItem("medical_professional_confirmed_date")

      if (confirmed === "true" && confirmedDate) {
        const confirmDate = new Date(confirmedDate)
        const now = new Date()
        const daysDiff = (now.getTime() - confirmDate.getTime()) / (1000 * 3600 * 24)

        if (daysDiff < 30) {
          setIsDisclaimerConfirmed(true)
          setShowDisclaimer(false)
        } else {
          localStorage.removeItem("medical_professional_confirmed")
          localStorage.removeItem("medical_professional_confirmed_date")
        }
      }
    }

    checkMedicalProfessionalStatus()
  }, [])

  const handleDisclaimerConfirm = () => {
    setIsDisclaimerConfirmed(true)
    setShowDisclaimer(false)
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
  }

  // Show disclaimer if not confirmed
  if (showDisclaimer && !isDisclaimerConfirmed) {
    return (
      <MedicalProfessionalDisclaimer
        onConfirm={handleDisclaimerConfirm}
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation Tabs only */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeCalculator === "cardio"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveCalculator("cardio")}
        >
          {language === "ru"
            ? "Расчет сердечно-сосудистого риска (SCORE2)"
            : language === "en"
              ? "Cardiovascular Risk (SCORE2)"
              : language === "ro"
                ? "Risc cardiovascular (SCORE2)"
                : "Kardiyovasküler risk (SCORE2)"}
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeCalculator === "gfr"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveCalculator("gfr")}
        >
          {t.gfrCalculator.title}
        </button>
      </div>

      {/* Calculator Content */}
      {activeCalculator === "cardio" ? (
        <CardioRiskCalculator language={language} onLanguageChange={handleLanguageChange} />
      ) : (
        <GFRCalculator language={language} onLanguageChange={handleLanguageChange} />
      )}
    </div>
  )
}
