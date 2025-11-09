"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ResultsDisplayProps {
  results: any
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency > 0.2) return { label: "Excellent", color: "bg-green-100 text-green-800" }
    if (efficiency > 0.15) return { label: "Good", color: "bg-blue-100 text-blue-800" }
    if (efficiency > 0.1) return { label: "Fair", color: "bg-yellow-100 text-yellow-800" }
    return { label: "Poor", color: "bg-red-100 text-red-800" }
  }

  const getFFFitBadge = (ff: number) => {
    if (ff > 0.8) return { label: "Excellent", color: "bg-green-100 text-green-800" }
    if (ff > 0.6) return { label: "Good", color: "bg-blue-100 text-blue-800" }
    if (ff > 0.4) return { label: "Fair", color: "bg-yellow-100 text-yellow-800" }
    return { label: "Poor", color: "bg-red-100 text-red-800" }
  }

  const getModelFitBadge = (r2: number) => {
    if (r2 > 0.95) return { label: "Excellent", color: "bg-green-100 text-green-800" }
    if (r2 > 0.8) return { label: "Good", color: "bg-blue-100 text-blue-800" }
    if (r2 > 0.5) return { label: "Fair", color: "bg-yellow-100 text-yellow-800" }
    return { label: "Poor", color: "bg-red-100 text-red-800" }
  }

  const efficiencyBadge = getEfficiencyBadge(results.Efficiency)
  const ffBadge = getFFFitBadge(results.FF)
  const modelFitBadge = getModelFitBadge(results.fitQuality)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Performance Parameters */}
      <Card className="shadow-lg border border-slate-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-blue-900">Performance Parameters</CardTitle>
            <Badge className={`${ffBadge.color} border-0`}>FF: {ffBadge.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {/* Short-Circuit Current */}
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-200">
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase">Short-Circuit Current</p>
                <p className="text-sm text-blue-700">Isc</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">{results.Isc?.toFixed(4)}</p>
              <p className="text-sm text-blue-600">A</p>
            </div>

            {/* Open-Circuit Voltage */}
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Open-Circuit Voltage</p>
                <p className="text-sm text-slate-700">Voc</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{results.Voc?.toFixed(4)}</p>
              <p className="text-sm text-slate-600">V</p>
            </div>

            {/* Maximum Power */}
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Maximum Power</p>
                <p className="text-sm text-slate-700">Pmax</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{results.Pmax?.toFixed(4)}</p>
              <p className="text-sm text-slate-600">W</p>
            </div>

            {/* Fill Factor */}
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded border border-amber-200">
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase">Fill Factor</p>
                <p className="text-sm text-amber-700">FF</p>
              </div>
              <p className="text-2xl font-bold text-amber-900">{(results.FF * 100)?.toFixed(2)}</p>
              <p className="text-sm text-amber-600">%</p>
            </div>

            {/* Efficiency */}
            <div className="flex justify-between items-center p-4 bg-green-50 rounded border-2 border-green-200">
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase">Efficiency</p>
                <p className="text-sm text-green-700">η</p>
              </div>
              <p className="text-3xl font-bold text-green-900">{(results.Efficiency * 100)?.toFixed(2)}</p>
              <p className="text-lg text-green-600">%</p>
            </div>

            {/* Maximum Power Point */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <p className="text-xs text-slate-600">Vmpp</p>
                <p className="font-bold text-slate-900">{results.Vmpp?.toFixed(4)} V</p>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <p className="text-xs text-slate-600">Impp</p>
                <p className="font-bold text-slate-900">{results.Impp?.toFixed(4)} A</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Single-Diode Model Parameters */}
      <Card className="shadow-lg border border-slate-200">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-amber-900">Single-Diode Model</CardTitle>
            <Badge className={`${modelFitBadge.color} border-0`}>Fit: {modelFitBadge.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {/* Series Resistance */}
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded border border-amber-200">
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase">Series Resistance</p>
                <p className="text-sm text-amber-700">Rs</p>
              </div>
              <p className="text-2xl font-bold text-amber-900">{results.Rs?.toFixed(4)}</p>
              <p className="text-sm text-amber-600">Ω</p>
            </div>

            {/* Shunt Resistance */}
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Shunt Resistance</p>
                <p className="text-sm text-slate-700">Rsh</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{results.Rsh?.toFixed(2)}</p>
              <p className="text-sm text-slate-600">Ω</p>
            </div>

            {/* Ideality Factor */}
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Ideality Factor</p>
                <p className="text-sm text-slate-700">n</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{results.n?.toFixed(4)}</p>
              <p className="text-sm text-slate-600"></p>
            </div>

            {/* Reverse Saturation Current */}
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Reverse Saturation</p>
                <p className="text-sm text-slate-700">I₀</p>
              </div>
              <p className="text-lg font-bold text-slate-900">{results.Io?.toExponential(2)}</p>
              <p className="text-sm text-slate-600">A</p>
            </div>

            {/* Model Fit Quality */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-amber-600 uppercase mb-2">Model Fit Quality (R²)</p>
              <div className="relative h-8 bg-amber-100 rounded border border-amber-300 flex items-center">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-amber-600 rounded transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, (results.fitQuality || 0) * 100))}%` }}
                />
                <p className="relative z-10 w-full text-center font-bold text-amber-900">
                  {results.fitQuality?.toFixed(4)}
                </p>
              </div>
              <p className="text-xs text-amber-700 mt-2">
                {results.fitQuality > 0.95
                  ? "✓ Excellent match between model and data"
                  : results.fitQuality > 0.8
                    ? "✓ Good match between model and data"
                    : results.fitQuality > 0.5
                      ? "⚠ Moderate match between model and data"
                      : "⚠ Poor match between model and data"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
