import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Получаем заголовки запроса
  const userAgent = request.headers.get("user-agent") || ""

  // Проверяем, не является ли запрос от веб-скрапера или бота
  const isScraper =
    userAgent.toLowerCase().includes("scraper") ||
    userAgent.toLowerCase().includes("crawler") ||
    userAgent.toLowerCase().includes("headless") ||
    userAgent.toLowerCase().includes("puppeteer") ||
    userAgent.toLowerCase().includes("selenium")

  // Если это скрапер, блокируем доступ
  if (isScraper) {
    return new NextResponse("Доступ запрещен", { status: 403 })
  }

  // Добавляем заголовки безопасности
  const response = NextResponse.next()

  // Content Security Policy для защиты от XSS и других атак
  // Обновлено для поддержки Google Analytics
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; " +
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://region1.analytics.google.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob: https://www.google-analytics.com; " +
      "font-src 'self'; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';",
  )

  // Запрещаем встраивание сайта в iframe для предотвращения кликджекинга
  response.headers.set("X-Frame-Options", "SAMEORIGIN")

  // Защита от MIME-sniffing
  response.headers.set("X-Content-Type-Options", "nosniff")

  // Включаем защиту от XSS в старых браузерах
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // Добавляем заголовок для указания владельца
  response.headers.set("X-Powered-By", "STADA Health Solutions")

  return response
}

// Указываем, для каких путей применять middleware
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
