"use client"

import { useEffect } from "react"

export function CodeProtection() {
  useEffect(() => {
    // Защита от копирования исходного кода без блокировки функциональности
    const protectCode = () => {
      // Обфускация консоли для затруднения отладки
      const originalConsoleLog = console.log
      const originalConsoleError = console.error
      const originalConsoleWarn = console.warn
      const originalConsoleInfo = console.info

      // Перехватываем только вызовы, связанные с отладкой
      console.log = (...args) => {
        if (args.some((arg) => typeof arg === "string" && arg.includes("react-dev"))) {
          return undefined
        }
        return originalConsoleLog.apply(console, args)
      }

      console.error = (...args) => {
        if (args.some((arg) => typeof arg === "string" && arg.includes("react-dev"))) {
          return undefined
        }
        return originalConsoleError.apply(console, args)
      }

      console.warn = (...args) => {
        if (args.some((arg) => typeof arg === "string" && arg.includes("react-dev"))) {
          return undefined
        }
        return originalConsoleWarn.apply(console, args)
      }

      console.info = (...args) => {
        if (args.some((arg) => typeof arg === "string" && arg.includes("react-dev"))) {
          return undefined
        }
        return originalConsoleInfo.apply(console, args)
      }

      // Добавляем водяной знак в консоль
      const styles = [
        "color: #e11d48",
        "font-size: 18px",
        "font-weight: bold",
        "text-shadow: 1px 1px 0 rgb(0,0,0,0.3)",
        "padding: 10px",
      ].join(";")

      console.log("Cardio Risk Calculator - Все права защищены", styles)
      console.log(
        "Это приложение защищено авторским правом. Несанкционированное копирование или использование кода запрещено.",
      )
    }

    // Добавляем атрибуцию при копировании текста
    const addAttributionToCopiedText = () => {
      document.addEventListener("copy", (e) => {
        // Не блокируем копирование, а добавляем атрибуцию
        const selection = document.getSelection()
        if (selection && selection.toString().length > 100) {
          const copiedText = selection.toString()
          const attribution = "\n\n--\nИсточник: STADA Cardio Risk Calculator\nhttps://cardio-risk.stada.com"
          e.clipboardData?.setData("text/plain", copiedText + attribution)
          e.preventDefault()
        }
      })
    }

    // Защита от автоматического скрапинга
    const protectFromScraping = () => {
      // Добавляем случайные невидимые элементы для запутывания скраперов
      const addHoneypotElements = () => {
        const container = document.createElement("div")
        container.style.position = "absolute"
        container.style.left = "-9999px"
        container.style.top = "-9999px"
        container.innerHTML = `
          <a href="https://trap-for-scrapers.com">Important Link</a>
          <div class="user-data">admin@example.com</div>
          <input type="text" name="honeypot" value="do-not-fill">
        `
        document.body.appendChild(container)
      }

      addHoneypotElements()
    }

    // Применяем защиту
    protectCode()
    addAttributionToCopiedText()
    protectFromScraping()

    // Очистка при размонтировании
    return () => {
      document.removeEventListener("copy", () => {})
    }
  }, [])

  return null
}
