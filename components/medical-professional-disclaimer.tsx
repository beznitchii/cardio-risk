"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LanguageSwitcher from "./language-switcher"
import { getTranslation, type Language } from "@/lib/i18n/translations"

interface MedicalProfessionalDisclaimerProps {
  onConfirm: () => void
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
}

export default function MedicalProfessionalDisclaimer({
  onConfirm,
  currentLanguage,
  onLanguageChange,
}: MedicalProfessionalDisclaimerProps) {
  const [t, setT] = useState(getTranslation(currentLanguage))

  useEffect(() => {
    setT(getTranslation(currentLanguage))
  }, [currentLanguage])

  const handleConfirm = () => {
    // Сохраняем подтверждение в localStorage на 30 дней
    localStorage.setItem("medical_professional_confirmed", "true")
    localStorage.setItem("medical_professional_confirmed_date", new Date().toISOString())
    onConfirm()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <CardTitle className="text-lg sm:text-xl font-bold text-left sm:text-center">
                {t.disclaimerTitle}
              </CardTitle>
            </div>
            <div className="self-start sm:self-auto">
              <LanguageSwitcher currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-base leading-relaxed text-gray-700">
            <p>{t.medicalProfessionalDisclaimer}</p>
          </div>
          <Button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium"
          >
            {t.confirmButton}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
