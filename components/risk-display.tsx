"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getScoreRiskCategory, getScoreRiskColor, getScoreRiskDescription } from "@/lib/score-calculator"

interface RiskDisplayProps {
  riskScore: number
}

export default function RiskDisplay({ riskScore }: RiskDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw gauge background
    const centerX = canvas.width / 2
    const centerY = canvas.height - 20
    const radius = canvas.width / 2 - 20

    // Draw gauge background
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 0, false)
    ctx.lineWidth = 20
    ctx.strokeStyle = "#e5e7eb"
    ctx.stroke()

    // Draw risk level
    const startAngle = Math.PI
    const endAngle = Math.PI - Math.PI * (riskScore / 100)

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, true)
    ctx.lineWidth = 20
    ctx.strokeStyle = getScoreRiskColor(riskScore)
    ctx.stroke()

    // Draw needle
    const needleAngle = Math.PI - Math.PI * (riskScore / 100)
    const needleLength = radius - 10

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(centerX + needleLength * Math.cos(needleAngle), centerY + needleLength * Math.sin(needleAngle))
    ctx.lineWidth = 3
    ctx.strokeStyle = "#374151"
    ctx.stroke()

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI, false)
    ctx.fillStyle = "#374151"
    ctx.fill()

    // Draw percentage text
    ctx.font = "bold 24px Arial"
    ctx.fillStyle = "#111827"
    ctx.textAlign = "center"
    ctx.fillText(`${riskScore.toFixed(1)}%`, centerX, centerY - radius / 2)

    // Draw risk category
    ctx.font = "16px Arial"
    ctx.fillStyle = "#4b5563"
    ctx.fillText(getScoreRiskCategory(riskScore), centerX, centerY - radius / 4)
  }, [riskScore])

  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle>Результаты оценки риска</CardTitle>
        <CardDescription>На основе предоставленной вами информации</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <canvas ref={canvasRef} width={300} height={200} className="w-full max-w-xs" />

        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium">{getScoreRiskCategory(riskScore)} риск</h3>
          <p className="text-sm text-gray-600 mt-1">{getScoreRiskDescription(riskScore)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
