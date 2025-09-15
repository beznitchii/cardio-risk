"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Компонент для отладки Google Analytics
export default function AnalyticsDebug() {
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Проверяем загрузку Google Analytics
    const checkGA = () => {
      const info: string[] = []

      // Проверяем наличие gtag
      if (typeof window !== "undefined") {
        if (window.gtag) {
          info.push("✅ gtag функция загружена")
        } else {
          info.push("❌ gtag функция не найдена")
        }

        // Проверяем dataLayer
        if (window.dataLayer) {
          info.push(`✅ dataLayer существует (${window.dataLayer.length} элементов)`)
        } else {
          info.push("❌ dataLayer не найден")
        }

        // Проверяем наличие скрипта Google Analytics
        const gaScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]')
        if (gaScript) {
          info.push("✅ Скрипт Google Analytics загружен")
        } else {
          info.push("❌ Скрипт Google Analytics не найден")
        }

        // Проверяем текущий URL
        info.push(`📍 Текущий URL: ${window.location.href}`)

        // Проверяем домен
        info.push(`🌐 Домен: ${window.location.hostname}`)

        // Проверяем протокол
        info.push(`🔒 Протокол: ${window.location.protocol}`)

        // Проверяем User Agent
        info.push(`🖥️ User Agent: ${navigator.userAgent.substring(0, 50)}...`)
      }

      setDebugInfo(info)
    }

    // Проверяем сразу и через 2 секунды
    checkGA()
    const timer = setTimeout(checkGA, 2000)

    return () => clearTimeout(timer)
  }, [])

  const testEvent = () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "debug_test", {
        event_category: "debug",
        event_label: "manual_test",
        value: 1,
      })

      const newInfo = [...debugInfo, `🧪 Тестовое событие отправлено в ${new Date().toLocaleTimeString()}`]
      setDebugInfo(newInfo)
    } else {
      const newInfo = [...debugInfo, `❌ Не удалось отправить тестовое событие - gtag не доступен`]
      setDebugInfo(newInfo)
    }
  }

  const testPageView = () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "G-0603XM5Z1H", {
        page_title: "Debug Test Page",
        page_location: window.location.href,
        send_page_view: true,
      })

      const newInfo = [...debugInfo, `📄 Тестовый просмотр страницы отправлен в ${new Date().toLocaleTimeString()}`]
      setDebugInfo(newInfo)
    }
  }

  if (!isVisible) {
    return (
      <Button onClick={() => setIsVisible(true)} variant="outline" size="sm" className="fixed bottom-4 right-4 z-50">
        🔍 Debug GA
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto z-50 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          Google Analytics Debug
          <Button onClick={() => setIsVisible(false)} variant="ghost" size="sm" className="h-6 w-6 p-0">
            ✕
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-xs">
          {debugInfo.map((info, index) => (
            <div key={index} className="font-mono">
              {info}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={testEvent} size="sm" variant="outline">
            Тест События
          </Button>
          <Button onClick={testPageView} size="sm" variant="outline">
            Тест Просмотра
          </Button>
        </div>

        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          <strong>Инструкции:</strong>
          <br />
          1. Проверьте все ✅ отметки выше
          <br />
          2. Нажмите "Тест События" и "Тест Просмотра"
          <br />
          3. Откройте Google Analytics → Отчеты → Реальное время
          <br />
          4. Должны появиться данные в течение 1-2 минут
        </div>
      </CardContent>
    </Card>
  )
}
