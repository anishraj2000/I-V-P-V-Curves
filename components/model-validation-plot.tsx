"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ModelValidationPlotProps {
  data: { voltage: number[]; current: number[] }
  results: any
}

export default function ModelValidationPlot({ data, results }: ModelValidationPlotProps) {
  const chartData = useMemo(() => {
    return data.voltage
      .map((v, i) => ({
        voltage: Number.parseFloat(v.toFixed(4)),
        measured: Number.parseFloat(data.current[i].toFixed(5)),
        modeled: calculateModelCurrent(v, results),
      }))
      .sort((a, b) => a.voltage - b.voltage)
  }, [data, results])

  // Model function
  function calculateModelCurrent(V: number, params: any): number {
    const K_B = 1.380649e-23
    const Q = 1.602176634e-19
    const TEMP = 300

    try {
      const arg = (Q * (V + data.voltage[0] * 0.1 * params.Rs)) / (params.n * K_B * TEMP)
      const expTerm = arg < 100 ? Math.exp(arg) : Number.POSITIVE_INFINITY

      return params.Isc - params.Io * (expTerm - 1) - (V + data.voltage[0] * 0.1 * params.Rs) / params.Rsh
    } catch {
      return 0
    }
  }

  return (
    <Card className="shadow-lg border border-slate-200">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 border-b">
        <CardTitle className="text-lg text-amber-900">Model Validation</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" vertical={false} />
            <XAxis
              dataKey="voltage"
              label={{ value: "Voltage (V)", position: "bottom", offset: 10, fill: "#475569" }}
              stroke="#94a3b8"
            />
            <YAxis
              label={{ value: "Current (A)", angle: -90, position: "insideLeft", offset: 10, fill: "#475569" }}
              stroke="#94a3b8"
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
              formatter={(value: any) => value.toFixed(5)}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Line
              type="monotone"
              dataKey="measured"
              stroke="#2563eb"
              dot={false}
              isAnimationActive={false}
              name="Measured Data"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="modeled"
              stroke="#dc2626"
              dot={false}
              isAnimationActive={false}
              name="Single-Diode Model"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-6 bg-amber-50 rounded p-4 border border-amber-200">
          <p className="text-sm font-semibold text-amber-900 mb-2">Model Fit Quality (R²)</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-amber-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-600 h-full transition-all"
                style={{ width: `${Math.max(0, Math.min(100, (results.fitQuality || 0) * 100))}%` }}
              />
            </div>
            <span className="text-lg font-bold text-amber-900 w-12 text-right">{results.fitQuality?.toFixed(4)}</span>
          </div>
          <p className="text-xs text-amber-700 mt-2">
            {results.fitQuality > 0.95 ? "✓ Excellent fit" : results.fitQuality > 0.8 ? "✓ Good fit" : "⚠ Fair fit"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
