"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

// Компонент для расширенной отладки Google Analytics
export default function AnalyticsDebugEnhanced() {
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [status, setStatus] = useState<"loading" | "success" | "error" | "warning">("loading")
  const [logs, setLogs] = useState<
    Array<{ time: string; message: string; type: "info" | "success" | "error" | "warning" }>
  >([])
  const [gaStatus, setGaStatus] = useState({
    gtag: false,
    dataLayer: false,
    script: false,
    cookies: false,
    events: 0,
  })

  // Функция для добавления логов
  const addLog = (message: string, type: "info" | "success" | "error" | "warning" = "info") => {
    const time = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, { time, message, type }])
  }

  // Проверка наличия блокировщиков рекламы
  const checkAdBlockers = () => {
    const testScript = document.createElement("script")
    testScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
    testScript.onerror = () => {
      addLog("Обнаружен блокировщик рекламы! Это может блокировать Google Analytics", "warning")
      setStatus("warning")
    }
    document.body.appendChild(testScript)
    setTimeout(() => {
      document.body.removeChild(testScript)
    }, 1000)
  }

  // Проверка наличия cookies
  const checkCookies = () => {
    try {
      document.cookie = "ga_test=1; max-age=60"
      const hasCookie = document.cookie.indexOf("ga_test=1") !== -1
      setGaStatus((prev) => ({ ...prev, cookies: hasCookie }))
      if (!hasCookie) {
        addLog("Cookies отключены или блокируются. Google Analytics требует cookies", "warning")
      } else {
        addLog("Cookies работают корректно", "success")
      }
    } catch (e) {
      addLog("Ошибка при проверке cookies", "error")
    }
  }

  // Мониторинг событий dataLayer
  const monitorDataLayer = () => {
    if (typeof window !== "undefined" && window.dataLayer) {
      const originalPush = window.dataLayer.push
      window.dataLayer.push = function (...args: any[]) {
        setGaStatus((prev) => ({ ...prev, events: prev.events + 1 }))
        addLog(`Событие dataLayer: ${JSON.stringify(args[0]).substring(0, 100)}`, "info")
        return originalPush.apply(this, args)
      }
    }
  }

  useEffect(() => {
    // Проверяем загрузку Google Analytics
    const checkGA = () => {
      const info: string[] = []
      let overallStatus: "loading" | "success" | "error" | "warning" = "loading"

      // Проверяем наличие gtag
      if (typeof window !== "undefined") {
        const hasGtag = typeof window.gtag === "function"
        setGaStatus((prev) => ({ ...prev, gtag: hasGtag }))

        if (hasGtag) {
          info.push("✅ gtag функция загружена")
          addLog("gtag функция обнаружена", "success")
        } else {
          info.push("❌ gtag функция не найдена")
          addLog("gtag функция НЕ обнаружена - критическая ошибка", "error")
          overallStatus = "error"
        }

        // Проверяем dataLayer
        if (window.dataLayer) {
          setGaStatus((prev) => ({ ...prev, dataLayer: true }))
          info.push(`✅ dataLayer существует (${window.dataLayer.length} элементов)`)
          addLog(`dataLayer обнаружен с ${window.dataLayer.length} элементами`, "success")
        } else {
          info.push("❌ dataLayer не найден")
          addLog("dataLayer НЕ обнаружен - критическая ошибка", "error")
          overallStatus = "error"
        }

        // Проверяем наличие скрипта Google Analytics
        const gaScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]')
        setGaStatus((prev) => ({ ...prev, script: !!gaScript }))

        if (gaScript) {
          info.push("✅ Скрипт Google Analytics загружен")
          addLog("Скрипт Google Analytics загружен", "success")
        } else {
          info.push("❌ Скрипт Google Analytics не найден")
          addLog("Скрипт Google Analytics НЕ найден - критическая ошибка", "error")
          overallStatus = "error"
        }

        // Проверяем текущий URL
        info.push(`📍 Текущий URL: ${window.location.href}`)

        // Проверяем домен
        const domain = window.location.hostname
        info.push(`🌐 Домен: ${domain}`)

        if (domain === "localhost" || domain === "127.0.0.1") {
          addLog("Вы используете localhost. Google Analytics может работать некорректно", "warning")
          overallStatus = overallStatus === "error" ? "error" : "warning"
        }

        // Проверяем протокол
        const protocol = window.location.protocol
        info.push(`🔒 Протокол: ${protocol}`)

        if (protocol !== "https:") {
          addLog("Вы используете небезопасный протокол. Google Analytics предпочитает HTTPS", "warning")
          overallStatus = overallStatus === "error" ? "error" : "warning"
        }

        // Проверяем User Agent
        info.push(`🖥️ User Agent: ${navigator.userAgent.substring(0, 50)}...`)

        // Если нет ошибок, устанавливаем успешный статус
        if (overallStatus !== "error" && overallStatus !== "warning") {
          overallStatus = "success"
        }
      }

      setDebugInfo(info)
      setStatus(overallStatus)
    }

    // Проверяем сразу и через 2 секунды
    checkGA()
    const timer = setTimeout(() => {
      checkGA()
      checkAdBlockers()
      checkCookies()
      monitorDataLayer()
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Отправка тестового события
  const testEvent = () => {
    if (typeof window !== "undefined" && window.gtag) {
      const eventName = "debug_test_" + new Date().getTime()
      window.gtag("event", eventName, {
        event_category: "debug",
        event_label: "manual_test",
        value: 1,
        debug_mode: true,
      })

      addLog(`Тестовое событие "${eventName}" отправлено`, "info")

      // Проверяем, было ли событие добавлено в dataLayer
      if (window.dataLayer) {
        const found = window.dataLayer.some((item: any) => item && item[0] === "event" && item[1] === eventName)

        if (found) {
          addLog("Событие успешно добавлено в dataLayer", "success")
        } else {
          addLog("Событие НЕ обнаружено в dataLayer", "warning")
        }
      }
    } else {
      addLog("Не удалось отправить тестовое событие - gtag не доступен", "error")
    }
  }

  // Отправка тестового просмотра страницы
  const testPageView = () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_view", {
        page_title: "Debug Test Page",
        page_location: window.location.href,
        send_page_view: true,
        debug_mode: true,
      })

      addLog("Тестовый просмотр страницы отправлен", "info")
    } else {
      addLog("Не удалось отправить тестовый просмотр - gtag не доступен", "error")
    }
  }

  // Проверка ID потока
  const checkMeasurementId = () => {
    const scripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]')
    let found = false

    scripts.forEach((script) => {
      const src = script.getAttribute("src") || ""
      const match = src.match(/id=([^&]+)/)
      if (match) {
        const id = match[1]
        addLog(`Обнаружен ID потока: ${id}`, "info")

        if (id === "G-0603XM5Z1H") {
          addLog("ID потока соответствует ожидаемому", "success")
        } else {
          addLog(`ID потока НЕ соответствует ожидаемому (G-0603XM5Z1H)`, "warning")
        }
        found = true
      }
    })

    if (!found) {
      addLog("ID потока не обнаружен в скрипте", "error")
    }
  }

  // Проверка наличия GA cookies
  const checkGACookies = () => {
    const cookies = document.cookie.split(";")
    let gaFound = false

    cookies.forEach((cookie) => {
      const trimmed = cookie.trim()
      if (trimmed.startsWith("_ga=") || trimmed.startsWith("_gid=")) {
        addLog(`Обнаружена cookie: ${trimmed.split("=")[0]}`, "success")
        gaFound = true
      }
    })

    if (!gaFound) {
      addLog("Cookies Google Analytics не обнаружены", "warning")
    }
  }

  // Полная проверка
  const runFullCheck = () => {
    addLog("Запуск полной проверки...", "info")
    checkMeasurementId()
    checkGACookies()
    testEvent()
    setTimeout(testPageView, 1000)
  }

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2"
      >
        {status === "loading" && "🔄"}
        {status === "success" && "✅"}
        {status === "error" && "❌"}
        {status === "warning" && "⚠️"}
        Debug GA
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-[500px] max-h-[600px] overflow-y-auto z-50 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          Google Analytics Debug
          <div className="flex gap-2">
            <Button onClick={runFullCheck} variant="ghost" size="sm" className="h-6 px-2 py-0">
              🔄 Полная проверка
            </Button>
            <Button onClick={() => setIsVisible(false)} variant="ghost" size="sm" className="h-6 w-6 p-0">
              ✕
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="status">
          <TabsList className="w-full">
            <TabsTrigger value="status" className="flex-1">
              Статус
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex-1">
              Логи ({logs.length})
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex-1">
              Тесты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="status">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <div className={`w-3 h-3 rounded-full ${gaStatus.gtag ? "bg-green-500" : "bg-red-500"}`}></div>
                  <span className="text-xs">gtag функция</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <div className={`w-3 h-3 rounded-full ${gaStatus.dataLayer ? "bg-green-500" : "bg-red-500"}`}></div>
                  <span className="text-xs">dataLayer</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <div className={`w-3 h-3 rounded-full ${gaStatus.script ? "bg-green-500" : "bg-red-500"}`}></div>
                  <span className="text-xs">GA скрипт</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <div className={`w-3 h-3 rounded-full ${gaStatus.cookies ? "bg-green-500" : "bg-red-500"}`}></div>
                  <span className="text-xs">Cookies</span>
                </div>
              </div>

              <div className="text-xs space-y-1 font-mono">
                {debugInfo.map((info, index) => (
                  <div key={index} className="p-1 border-b border-gray-100">
                    {info}
                  </div>
                ))}
              </div>

              <Alert variant={status === "error" ? "destructive" : status === "warning" ? "default" : "default"}>
                <div className="flex items-center gap-2">
                  {status === "error" && <XCircle className="h-4 w-4" />}
                  {status === "warning" && <AlertTriangle className="h-4 w-4" />}
                  {status === "success" && <CheckCircle className="h-4 w-4" />}
                  <AlertDescription>
                    {status === "error" && "Обнаружены критические проблемы с Google Analytics"}
                    {status === "warning" && "Обнаружены некритические проблемы с Google Analytics"}
                    {status === "success" && "Google Analytics настроен корректно"}
                    {status === "loading" && "Проверка Google Analytics..."}
                  </AlertDescription>
                </div>
              </Alert>

              <div className="text-xs text-gray-500">События отправлены: {gaStatus.events}</div>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <div className="space-y-1 text-xs font-mono max-h-[300px] overflow-y-auto">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-1 border-b border-gray-100 ${
                    log.type === "error"
                      ? "text-red-600"
                      : log.type === "warning"
                        ? "text-amber-600"
                        : log.type === "success"
                          ? "text-green-600"
                          : "text-gray-700"
                  }`}
                >
                  <span className="text-gray-400">[{log.time}]</span> {log.message}
                </div>
              ))}
              {logs.length === 0 && <div className="p-2 text-center text-gray-500">Нет логов</div>}
            </div>
          </TabsContent>

          <TabsContent value="tests">
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={testEvent} size="sm" variant="outline" className="w-full">
                  Тест События
                </Button>
                <Button onClick={testPageView} size="sm" variant="outline" className="w-full">
                  Тест Просмотра
                </Button>
                <Button onClick={checkMeasurementId} size="sm" variant="outline" className="w-full">
                  Проверить ID
                </Button>
                <Button onClick={checkGACookies} size="sm" variant="outline" className="w-full">
                  Проверить Cookies
                </Button>
              </div>

              <div className="p-2 bg-gray-50 rounded text-xs space-y-2">
                <p className="font-medium">Инструкции:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Проверьте все индикаторы статуса выше</li>
                  <li>Нажмите "Тест События" и "Тест Просмотра"</li>
                  <li>Откройте Google Analytics → Отчеты → Реальное время</li>
                  <li>Данные должны появиться в течение 1-2 минут</li>
                </ol>
                <div className="pt-2">
                  <a
                    href="https://analytics.google.com/analytics/web/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 flex items-center gap-1"
                  >
                    Открыть Google Analytics <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
