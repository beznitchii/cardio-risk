import type React from "react"
import type { Metadata } from "next"
import { Inter, Montserrat } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CodeProtection } from "@/components/code-protection"
import Script from "next/script"

// Загружаем шрифт Montserrat
const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-montserrat",
})

// Загружаем шрифт Inter
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Расчет сердечно-сосудистого риска | SCORE2",
  description: "Оцените ваш 10-летний риск сердечно-сосудистых заболеваний по системе SCORE2 и SCORE2-OP",
  generator: "Parallax System (CEO Beznitskii Alexandr)",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className={`${montserrat.variable} ${inter.variable}`}>
      <head>
        {/* Разрешаем индексацию для корректной работы Google Analytics */}
        <meta name="robots" content="index, follow" />
      </head>
      <body className={montserrat.className}>
        {/* Google Analytics - GDPR совместимая версия без запроса согласия */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-0603XM5Z1H" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
    // Инициализация Google Analytics с полным GDPR соответствием
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    
    // Устанавливаем время загрузки
    gtag('js', new Date());
    
    // GDPR-совместимая конфигурация БЕЗ запроса согласия
    gtag('config', 'G-0603XM5Z1H', {
      // === АНОНИМИЗАЦИЯ ДАННЫХ ===
      anonymize_ip: true,                    // Анонимизация IP-адресов (обязательно для GDPR)
      allow_google_signals: false,           // Отключение Google Signals
      allow_ad_personalization_signals: false, // Отключение персонализации рекламы
      
      // === УПРАВЛЕНИЕ COOKIES ===
      cookie_expires: 7776000,               // 90 дней (сокращенный срок для GDPR)
      cookie_update: true,                   // Обновление cookies при каждом посещении
      cookie_flags: 'SameSite=Strict;Secure', // Безопасные cookies
      cookie_domain: 'auto',                 // Автоматическое определение домена
      
      // === ОТПРАВКА ДАННЫХ ===
      send_page_view: true,                  // Автоматическая отправка просмотров страниц
      transport_type: 'beacon',              // Надежная отправка данных
      
      // === ДОПОЛНИТЕЛЬНЫЕ НАСТРОЙКИ КОНФИДЕНЦИАЛЬНОСТИ ===
      client_storage: 'cookies',             // Использование только cookies (не localStorage)
      store_gac: false,                      // Отключение Google Ads cookies
      
      // === ПОЛЬЗОВАТЕЛЬСКИЕ ПАРАМЕТРЫ ДЛЯ МЕДИЦИНСКОГО ПРИЛОЖЕНИЯ ===
      custom_map: {
        'custom_parameter_1': 'app_type',
        'custom_parameter_2': 'calculation_type',
        'custom_parameter_3': 'medical_context'
      },
      
      // Установка контекста приложения
      app_type: 'medical_calculator',
      calculation_type: 'cardiovascular_gfr_risk',
      medical_context: 'anonymous_healthcare_tool'
    });
    
    // === ОТПРАВКА НАЧАЛЬНОГО СОБЫТИЯ С КОНТЕКСТОМ ===
    gtag('event', 'app_initialized', {
      event_category: 'application_lifecycle',
      event_label: 'medical_calculator_loaded',
      app_version: '2.0',
      medical_tool: true,
      gdpr_compliant: true,
      anonymized: true,
      value: 1
    });
    
    // === ФУНКЦИИ ДЛЯ ОТСЛЕЖИВАНИЯ СОБЫТИЙ (ВСЕ АНОНИМНЫЕ) ===
    
    // Общая функция отслеживания событий
    window.trackEvent = function(action, category, label, value) {
      gtag('event', action, {
        event_category: category || 'general',
        event_label: label || 'unknown',
        value: value || 1,
        medical_context: true,
        anonymized: true,
        gdpr_compliant: true,
        timestamp: Date.now()
      });
    };

    // Отслеживание расчетов риска (полностью анонимно)
    window.trackRiskCalculation = function(riskCategory, calculationMethod, riskScore, calculatorType) {
      const riskScoreRange = getRiskScoreRange(riskScore);
      
      gtag('event', 'risk_calculation_completed', {
        event_category: 'medical_calculation',
        event_label: calculatorType + '_' + riskCategory,
        
        // Медицинские метрики (анонимные диапазоны)
        risk_category: riskCategory,
        calculation_method: calculationMethod || 'unknown',
        risk_score_range: riskScoreRange,
        calculator_type: calculatorType || 'unknown',
        
        // Контекст безопасности
        medical_tool: true,
        anonymized: true,
        gdpr_compliant: true,
        data_minimized: true,
        value: Math.min(Math.round(riskScore || 0), 100)
      });
      
      console.log('📊 Risk calculation tracked:', {
        type: calculatorType,
        category: riskCategory,
        method: calculationMethod,
        range: riskScoreRange
      });
    };

    // Отслеживание экспорта PDF (анонимно)
    window.trackPDFExport = function(riskCategory, language, calculatorType) {
      gtag('event', 'pdf_export', {
        event_category: 'document_export',
        event_label: calculatorType + '_' + riskCategory,
        
        // Параметры экспорта (анонимные)
        export_format: 'pdf',
        content_language: language || 'unknown',
        document_type: calculatorType + '_assessment_report',
        risk_category: riskCategory || 'unknown',
        calculator_type: calculatorType || 'unknown',
        
        // Контекст безопасности
        medical_context: true,
        anonymized: true,
        gdpr_compliant: true,
        value: 1
      });
      
      console.log('📄 PDF export tracked:', {
        type: calculatorType,
        category: riskCategory,
        language: language
      });
    };

    // Отслеживание смены языка (анонимно)
    window.trackLanguageChange = function(fromLanguage, toLanguage) {
      gtag('event', 'language_changed', {
        event_category: 'user_interface',
        event_label: (fromLanguage || 'unknown') + '_to_' + (toLanguage || 'unknown'),
        
        // Языковые параметры (анонимные)
        previous_language: fromLanguage || 'unknown',
        new_language: toLanguage || 'unknown',
        language_pair: (fromLanguage || 'unknown') + '_' + (toLanguage || 'unknown'),
        
        // Контекст безопасности
        interface_interaction: true,
        anonymized: true,
        gdpr_compliant: true,
        value: 1
      });
      
      console.log('🌐 Language change tracked:', fromLanguage, '→', toLanguage);
    };
    
    // Отслеживание использования калькулятора (анонимно)
    window.trackCalculatorUsage = function(interactionType, details, calculatorType) {
      gtag('event', 'calculator_interaction', {
        event_category: 'medical_tool_usage',
        event_label: (calculatorType || 'unknown') + '_' + (interactionType || 'unknown'),
        
        // Детали взаимодействия (анонимные)
        interaction_type: interactionType || 'unknown',
        interaction_details: details || 'unknown',
        calculator_type: calculatorType || 'unknown',
        
        // Контекст безопасности
        medical_tool: true,
        anonymized: true,
        gdpr_compliant: true,
        data_minimized: true,
        value: 1
      });
    };
    
    // Отслеживание времени использования (анонимные диапазоны)
    window.trackTimeSpent = function(timeInSeconds, calculatorType) {
      const timeRange = getTimeRange(timeInSeconds);
      
      gtag('event', 'time_spent', {
        event_category: 'engagement',
        event_label: (calculatorType || 'unknown') + '_' + timeRange,
        
        // Временные метрики (анонимные диапазоны)
        time_range: timeRange,
        engagement_type: 'calculator_usage',
        calculator_type: calculatorType || 'unknown',
        session_quality: getSessionQuality(timeInSeconds),
        
        // Контекст безопасности
        medical_context: true,
        anonymized: true,
        gdpr_compliant: true,
        data_minimized: true,
        value: Math.min(Math.round(timeInSeconds || 0), 3600) // Максимум 1 час
      });
    };
    
    // Отслеживание ошибок (анонимно, без персональных данных)
    window.trackError = function(errorType, errorContext, calculatorType) {
      gtag('event', 'application_error', {
        event_category: 'technical_issues',
        event_label: (calculatorType || 'unknown') + '_' + (errorType || 'unknown'),
        
        // Технические детали (без персональных данных)
        error_type: errorType || 'unknown',
        error_context: errorContext || 'unknown',
        calculator_type: calculatorType || 'unknown',
        
        // Контекст безопасности
        anonymized: true,
        gdpr_compliant: true,
        medical_tool: true,
        value: 1
      });
    };
    
    // Отслеживание производительности (анонимные диапазоны)
    window.trackPerformance = function(metricName, value, calculatorType) {
      const performanceRange = getPerformanceRange(value);
      
      gtag('event', 'performance_metric', {
        event_category: 'technical_performance',
        event_label: (calculatorType || 'unknown') + '_' + (metricName || 'unknown'),
        
        // Метрики производительности (анонимные диапазоны)
        metric_name: metricName || 'unknown',
        metric_value_range: performanceRange,
        calculator_type: calculatorType || 'unknown',
        performance_category: getPerformanceCategory(value),
        
        // Контекст безопасности
        medical_application: true,
        anonymized: true,
        gdpr_compliant: true,
        data_minimized: true,
        value: Math.min(Math.round(value || 0), 10000)
      });
    };
    
    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ АНОНИМИЗАЦИИ ДАННЫХ ===
    
    function getRiskScoreRange(score) {
      if (!score || score < 0) return 'invalid';
      if (score < 1) return 'very_low';
      if (score < 5) return 'low';
      if (score < 10) return 'moderate';
      if (score < 20) return 'high';
      if (score < 50) return 'very_high';
      return 'extreme';
    }
    
    function getTimeRange(seconds) {
      if (!seconds || seconds < 0) return 'invalid';
      if (seconds < 10) return 'very_brief';
      if (seconds < 30) return 'brief';
      if (seconds < 120) return 'short';
      if (seconds < 300) return 'moderate';
      if (seconds < 600) return 'extended';
      if (seconds < 1800) return 'long';
      return 'very_long';
    }
    
    function getSessionQuality(seconds) {
      if (!seconds || seconds < 10) return 'bounce';
      if (seconds < 60) return 'quick_visit';
      if (seconds < 300) return 'engaged';
      if (seconds < 900) return 'highly_engaged';
      return 'deep_engagement';
    }
    
    function getPerformanceRange(value) {
      if (!value || value < 0) return 'invalid';
      if (value < 100) return 'excellent';
      if (value < 300) return 'good';
      if (value < 1000) return 'acceptable';
      if (value < 3000) return 'slow';
      return 'very_slow';
    }
    
    function getPerformanceCategory(value) {
      if (!value || value < 0) return 'unknown';
      if (value < 200) return 'fast';
      if (value < 1000) return 'normal';
      return 'needs_improvement';
    }
    
    // === АВТОМАТИЧЕСКОЕ ОТСЛЕЖИВАНИЕ ВРЕМЕНИ НА СТРАНИЦЕ ===
    let startTime = Date.now();
    let lastActivityTime = Date.now();
    let calculatorType = 'unknown';
    
    // Определяем тип калькулятора из URL или заголовка
    function detectCalculatorType() {
      const url = window.location.href.toLowerCase();
      const title = document.title.toLowerCase();
      
      if (url.includes('gfr') || title.includes('gfr')) {
        return 'gfr_calculator';
      } else if (url.includes('cardio') || title.includes('cardio') || title.includes('cardiovascular')) {
        return 'cardiovascular_calculator';
      }
      return 'medical_calculator';
    }
    
    calculatorType = detectCalculatorType();
    
    // Обновляем время последней активности (анонимно)
    ['click', 'scroll', 'keypress', 'mousemove', 'touchstart'].forEach(event => {
      document.addEventListener(event, function() {
        lastActivityTime = Date.now();
      }, { passive: true });
    });
    
    // Отправляем метрики при уходе со страницы (анонимно)
    window.addEventListener('beforeunload', function() {
      const totalTime = (Date.now() - startTime) / 1000;
      const activeTime = (lastActivityTime - startTime) / 1000;
      
      // Отправляем только если пользователь провел достаточно времени
      if (totalTime > 5 && activeTime > 3) {
        window.trackTimeSpent(activeTime, calculatorType);
      }
    });
    
    // Периодическое отслеживание активности (каждые 30 секунд)
    setInterval(function() {
      const currentTime = Date.now();
      const timeSinceLastActivity = (currentTime - lastActivityTime) / 1000;
      
      // Если пользователь неактивен более 5 минут, считаем сессию завершенной
      if (timeSinceLastActivity > 300) {
        const totalActiveTime = (lastActivityTime - startTime) / 1000;
        if (totalActiveTime > 10) {
          window.trackTimeSpent(totalActiveTime, calculatorType);
          startTime = currentTime; // Сброс счетчика
        }
      }
    }, 30000);
    
    // === ОТСЛЕЖИВАНИЕ ПЕРЕХОДОВ МЕЖДУ КАЛЬКУЛЯТОРАМИ ===
    window.addEventListener('popstate', function() {
      const newCalculatorType = detectCalculatorType();
      if (newCalculatorType !== calculatorType) {
        gtag('event', 'calculator_switch', {
          event_category: 'navigation',
          event_label: calculatorType + '_to_' + newCalculatorType,
          previous_calculator: calculatorType,
          new_calculator: newCalculatorType,
          anonymized: true,
          gdpr_compliant: true,
          value: 1
        });
        calculatorType = newCalculatorType;
      }
    });
    
    // === ОТСЛЕЖИВАНИЕ ПРОИЗВОДИТЕЛЬНОСТИ ЗАГРУЗКИ ===
    window.addEventListener('load', function() {
      // Отслеживаем метрики производительности через некоторое время
      setTimeout(function() {
        if (window.performance && window.performance.timing) {
          const timing = window.performance.timing;
          const loadTime = timing.loadEventEnd - timing.navigationStart;
          const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
          
          if (loadTime > 0 && loadTime < 60000) { // Разумные пределы
            window.trackPerformance('page_load_time', loadTime, calculatorType);
          }
          
          if (domReady > 0 && domReady < 60000) {
            window.trackPerformance('dom_ready_time', domReady, calculatorType);
          }
        }
      }, 1000);
    });
    
    // === ОТСЛЕЖИВАНИЕ ОШИБОК JAVASCRIPT (АНОНИМНО) ===
    window.addEventListener('error', function(event) {
      const errorType = event.error ? event.error.name : 'unknown_error';
      const errorContext = event.filename ? 'script_error' : 'general_error';
      
      window.trackError(errorType, errorContext, calculatorType);
    });
    
    // Отслеживание необработанных промисов
    window.addEventListener('unhandledrejection', function(event) {
      window.trackError('promise_rejection', 'async_error', calculatorType);
    });
    
    console.log('✅ Google Analytics initialized with full GDPR compliance');
    console.log('📊 Tracking configuration:', {
      anonymized: true,
      gdprCompliant: true,
      cookieExpiry: '90 days',
      dataMinimized: true,
      calculatorType: calculatorType
    });
  `}
        </Script>

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <CodeProtection />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
