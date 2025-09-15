"use client"

import { useEffect, useRef } from "react"
import { getTranslation, type Language } from "@/lib/i18n/translations"

interface GFRGaugeProps {
  gfrValue: number
  stage: { stage: string; description: string }
  language: Language
  setCanvasRef: (canvas: HTMLCanvasElement | null) => void
}

export default function GFRGauge({ gfrValue, stage, language, setCanvasRef }: GFRGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const t = getTranslation(language)

  useEffect(() => {
    if (setCanvasRef && canvasRef.current) {
      setCanvasRef(canvasRef.current)
    }
  }, [setCanvasRef])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 300
    canvas.height = 200

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Define colors for each stage
    const stageColors = {
      G1: "#22c55e", // Green
      G2: "#84cc16", // Light green
      G3a: "#eab308", // Yellow
      G3b: "#f97316", // Orange
      G4: "#ef4444", // Red
      G5: "#991b1b", // Dark red
    }

    const color = stageColors[stage.stage as keyof typeof stageColors] || "#6b7280"

    // Draw gauge background
    const centerX = canvas.width / 2
    const centerY = canvas.height - 20
    const radius = 120

    // Background arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 0)
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 20
    ctx.stroke()

    // Calculate angle for GFR value (0-150 range)
    const maxGFR = 150
    const normalizedGFR = Math.min(gfrValue, maxGFR)
    const angle = (normalizedGFR / maxGFR) * Math.PI

    // Draw GFR arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + angle)
    ctx.strokeStyle = color
    ctx.lineWidth = 20
    ctx.stroke()

    // Draw stage markers
    const stages = [
      { value: 90, label: "90" },
      { value: 60, label: "60" },
      { value: 45, label: "45" },
      { value: 30, label: "30" },
      { value: 15, label: "15" },
    ]

    stages.forEach(({ value, label }) => {
      const stageAngle = (value / maxGFR) * Math.PI
      const x = centerX + Math.cos(Math.PI + stageAngle) * (radius + 30)
      const y = centerY + Math.sin(Math.PI + stageAngle) * (radius + 30)

      ctx.fillStyle = "#6b7280"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText(label, x, y)
    })

    // Draw center text
    ctx.fillStyle = color
    ctx.font = "bold 24px Arial"
    ctx.textAlign = "center"
    ctx.fillText(gfrValue.toString(), centerX, centerY - 10)

    ctx.fillStyle = "#374151"
    ctx.font = "14px Arial"
    ctx.fillText("mL/min/1.73m²", centerX, centerY + 10)

    // Draw stage label
    const stageName = t.gfrCalculator.stages[stage.stage as keyof typeof t.gfrCalculator.stages] || stage.stage
    ctx.fillStyle = color
    ctx.font = "bold 16px Arial"
    ctx.fillText(stageName, centerX, centerY + 35)
  }, [gfrValue, stage, language, t])

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} className="max-w-full h-auto" />
    </div>
  )
}
