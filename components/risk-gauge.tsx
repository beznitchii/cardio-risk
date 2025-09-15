"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { getTranslation, type Language } from "@/lib/i18n/translations"

interface RiskGaugeProps {
  riskValue: number
  riskCategory: string
  language: Language
  canvasRef?: React.RefObject<HTMLDivElement>
  setCanvasRef?: (canvas: HTMLCanvasElement | null) => void
}

export default function RiskGauge({ riskValue, riskCategory, language, canvasRef, setCanvasRef }: RiskGaugeProps) {
  const canvasRefInternal = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [currentNeedleAngle, setCurrentNeedleAngle] = useState<number>(Math.PI)
  const [targetNeedleAngle, setTargetNeedleAngle] = useState<number>(Math.PI)
  const [isFirstRender, setIsFirstRender] = useState(true)

  // Передаем ссылку на canvas родительскому компоненту
  useEffect(() => {
    if (setCanvasRef && canvasRefInternal.current) {
      setCanvasRef(canvasRefInternal.current)
    }
  }, [setCanvasRef])

  // Вернуть исходное визуальное отображение с 4 категориями
  // Определяем целевой угол для стрелки на основе категории риска
  useEffect(() => {
    let newTargetAngle: number
    switch (riskCategory) {
      case "low":
        newTargetAngle = Math.PI + 0.25 * Math.PI
        break
      case "moderate":
        newTargetAngle = Math.PI + 0.5 * Math.PI
        break
      case "high":
        newTargetAngle = Math.PI + 0.75 * Math.PI
        break
      case "veryHigh":
        newTargetAngle = Math.PI + 0.95 * Math.PI
        break
      default:
        newTargetAngle = Math.PI + 0.5 * Math.PI
    }

    // При первом рендере устанавливаем текущий угол равным целевому
    if (isFirstRender) {
      setCurrentNeedleAngle(newTargetAngle)
      setIsFirstRender(false)
    }

    setTargetNeedleAngle(newTargetAngle)
  }, [riskCategory, isFirstRender])

  // Функция для анимации стрелки
  useEffect(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current)
    }

    // Если текущий угол уже равен целевому, не запускаем анимацию
    if (Math.abs(currentNeedleAngle - targetNeedleAngle) < 0.001) {
      return
    }

    const startTime = performance.now()
    const startAngle = currentNeedleAngle
    const angleDiff = targetNeedleAngle - startAngle
    const duration = 800 // Длительность анимации в миллисекундах

    // Функция для анимации
    const animateNeedle = (timestamp: number) => {
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Функция плавности (easing) для более естественного движения
      const easeOutQuad = (t: number) => t * (2 - t)
      const easedProgress = easeOutQuad(progress)

      const newAngle = startAngle + angleDiff * easedProgress
      setCurrentNeedleAngle(newAngle)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateNeedle)
      }
    }

    animationRef.current = requestAnimationFrame(animateNeedle)

    // Очистка анимации при размонтировании компонента
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [targetNeedleAngle, currentNeedleAngle])

  // Рисуем спидометр
  useEffect(() => {
    if (!canvasRefInternal.current) return

    const canvas = canvasRefInternal.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Получаем переводы
    const t = getTranslation(language)

    // Очистка холста
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Определяем размер холста на основе его отображаемого размера
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight

    // Устанавливаем размер холста равным его отображаемому размеру для четкости
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth
      canvas.height = displayHeight
    }

    // Параметры спидометра - адаптируем под размер экрана
    const centerX = canvas.width / 2
    const centerY = canvas.height / 1.5 // Поднимаем спидометр выше для места под результатом
    const radius = Math.min(canvas.width / 2.2, canvas.height / 2.5) // Адаптивный радиус

    // Добавляем белый фон для всего холста
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // В функции рисования спидометра - вернуть исходные цвета и логику
    // Определяем цвета для сегментов (исходные цвета)
    const segmentColors = [
      "#10b981", // Низкий риск - зеленый
      "#f59e0b", // Умеренный риск - желтый
      "#ef4444", // Высокий риск - красный
      "#7f1d1d", // Очень высокий риск - темно-красный
    ]

    // Определяем количество активных сегментов на основе категории риска
    let activeSegments = 0
    switch (riskCategory) {
      case "low":
        activeSegments = 1
        break
      case "moderate":
        activeSegments = 2
        break
      case "high":
        activeSegments = 3
        break
      case "veryHigh":
        activeSegments = 4
        break
      default:
        activeSegments = 0
    }

    // Рисуем сегменты спидометра
    const totalSegments = 8 // Всего сегментов (4 категории по 2 сегмента)
    const segmentAngle = Math.PI / totalSegments
    const arcWidth = Math.max(15, radius * 0.15) // Адаптивная ширина дуги

    // Рисуем неактивные сегменты (серые)
    for (let i = 0; i < totalSegments; i++) {
      const startAngle = Math.PI + i * segmentAngle
      const endAngle = startAngle + segmentAngle * 0.8 // Промежуток между сегментами для четких границ

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, startAngle, endAngle, false)
      ctx.lineWidth = arcWidth
      ctx.strokeStyle = "#e5e7eb" // Серый цвет для неактивных сегментов
      ctx.stroke()
    }

    // Рисуем активные сегменты (цветные)
    // Распределяем активные сегменты по цветам
    const segmentsPerColor = totalSegments / segmentColors.length

    for (let i = 0; i < activeSegments * segmentsPerColor; i++) {
      const startAngle = Math.PI + i * segmentAngle
      const endAngle = startAngle + segmentAngle * 0.8 // Промежуток между сегментами для четких границ

      const colorIndex = Math.min(Math.floor(i / segmentsPerColor), segmentColors.length - 1)

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, startAngle, endAngle, false)
      ctx.lineWidth = arcWidth
      ctx.strokeStyle = segmentColors[colorIndex]
      ctx.stroke()
    }

    // Рисуем стрелку с текущим углом анимации
    const needleLength = radius - 10

    // Основание стрелки (круг)
    ctx.beginPath()
    ctx.arc(centerX, centerY, Math.max(6, radius * 0.06), 0, 2 * Math.PI) // Адаптивный размер основания
    ctx.fillStyle = "#1f2937"
    ctx.fill()

    // Сама стрелка
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(
      centerX + needleLength * Math.cos(currentNeedleAngle),
      centerY + needleLength * Math.sin(currentNeedleAngle),
    )
    ctx.lineWidth = Math.max(3, radius * 0.03) // Адаптивная толщина стрелки
    ctx.lineCap = "round"
    ctx.strokeStyle = "#1f2937"
    ctx.stroke()

    // Адаптивный размер шрифта
    const fontSize = Math.max(10, Math.min(16, radius * 0.08))

    // Устанавливаем строгий и стильный шрифт
    const fontFamily = "'Montserrat', 'Roboto', 'Helvetica Neue', sans-serif"

    // Добавляем метки на соответствующем языке (исходная логика)
    ctx.font = `500 ${fontSize}px ${fontFamily}`
    ctx.fillStyle = "#1f2937"

    // Единый отступ для всех меток от шкалы
    const labelOffset = radius * 0.35

    // Низкий риск (слева)
    ctx.textAlign = "right"
    ctx.fillText(t.riskCategories.low, centerX - radius - labelOffset / 2, centerY + 5)

    // Умеренный риск (левый центр)
    ctx.textAlign = "center"
    const moderateAngle = Math.PI + 0.5 * Math.PI
    const moderateX = centerX + (radius + labelOffset) * Math.cos(moderateAngle)
    const moderateY = centerY + (radius + labelOffset) * Math.sin(moderateAngle)
    ctx.fillText(t.riskCategories.moderate, moderateX, moderateY)

    // Высокий риск (правый центр)
    ctx.textAlign = "center"
    const highAngle = Math.PI + 0.75 * Math.PI
    const highX = centerX + (radius + labelOffset) * Math.cos(highAngle)
    const highY = centerY + (radius + labelOffset) * Math.sin(highAngle)
    ctx.fillText(t.riskCategories.high, highX, highY)

    // Очень высокий риск (справа) - разбиваем на две строки
    ctx.textAlign = "left"

    // Получаем текст "Очень высокий" и разбиваем его
    const veryHighText = t.riskCategories.veryHigh
    let firstLine, secondLine

    // Проверяем, содержит ли текст пробел для разделения
    if (veryHighText.includes(" ")) {
      const spaceIndex = veryHighText.indexOf(" ")
      firstLine = veryHighText.substring(0, spaceIndex)
      secondLine = veryHighText.substring(spaceIndex + 1)
    } else {
      // Если нет пробела, делим текст примерно пополам
      const midPoint = Math.floor(veryHighText.length / 2)
      firstLine = veryHighText.substring(0, midPoint)
      secondLine = veryHighText.substring(midPoint)
    }

    // Рисуем двустрочный текст
    const veryHighX = centerX + radius + labelOffset / 2 + 20
    const lineHeight = fontSize * 1.2
    ctx.textAlign = "center"
    ctx.fillText(firstLine, veryHighX, centerY - lineHeight / 2)
    ctx.fillText(secondLine, veryHighX, centerY + lineHeight / 2)

    // Получаем цвет для текущей категории риска
    let riskColor
    switch (riskCategory) {
      case "veryHigh":
        riskColor = "#7f1d1d" // Темно-красный
        break
      case "high":
        riskColor = "#ef4444" // Красный
        break
      case "moderate":
        riskColor = "#f59e0b" // Желтый
        break
      case "low":
      default:
        riskColor = "#10b981" // Зеленый
    }

    // Получаем название категории риска на выбранном языке
    let categoryName = ""
    switch (riskCategory) {
      case "low":
        categoryName = t.riskCategories.low
        break
      case "moderate":
        categoryName = t.riskCategories.moderate
        break
      case "high":
        categoryName = t.riskCategories.high
        break
      case "veryHigh":
        categoryName = t.riskCategories.veryHigh
        break
      default:
        categoryName = t.riskCategories.moderate
    }

    // Выводим значение риска и категорию под индикатором
    // Создаем прямоугольник с фоном для лучшей читаемости
    const textY = centerY + radius * 0.3 // Адаптивное положение текста
    const resultFontSize = Math.max(16, Math.min(28, radius * 0.14))
    const text = `${categoryName} - ${riskValue.toFixed(1)}%`

    ctx.font = `600 ${resultFontSize}px ${fontFamily}`
    const textWidth = ctx.measureText(text).width

    // Фон для текста
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
    ctx.fillRect(centerX - textWidth / 2 - 10, textY - resultFontSize, textWidth + 20, resultFontSize * 1.4)

    // Текст категории и значения риска
    ctx.textAlign = "center"
    ctx.fillStyle = riskColor
    ctx.fillText(text, centerX, textY)
  }, [riskValue, riskCategory, language, currentNeedleAngle])

  return (
    <div className="w-full flex flex-col items-center" ref={canvasRef}>
      <canvas
        ref={canvasRefInternal}
        width={650}
        height={500}
        className="w-full max-w-full h-auto max-h-[400px] md:max-h-[500px]"
        style={{ backgroundColor: "white" }}
      />
    </div>
  )
}
