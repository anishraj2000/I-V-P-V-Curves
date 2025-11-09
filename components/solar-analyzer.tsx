"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import IVPlot from "@/components/iv-plot"
import ModelValidationPlot from "@/components/model-validation-plot"
import ResultsDisplay from "@/components/results-display"
import { calculateSolarParameters, extractSingleDiodeParameters } from "@/lib/solar-calculations"

interface SolarAnalyzerProps {
  data: { voltage: number[]; current: number[] }
}

export default function SolarAnalyzer({ data }: SolarAnalyzerProps) {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setLoading(true)

      // Validate input data
      if (!data.voltage || !data.current || data.voltage.length < 2) {
        throw new Error("Insufficient data points. At least 2 voltage-current pairs are required.")
      }

      if (data.voltage.length !== data.current.length) {
        throw new Error("Voltage and current arrays must have the same length")
      }

      // Calculate performance parameters
      const params = calculateSolarParameters(data.voltage, data.current)

      // Validate performance parameters
      if (params.Isc <= 0 || params.Voc <= 0) {
        throw new Error("Invalid I-V data: Unable to determine Isc and Voc")
      }

      // Extract single-diode model parameters
      const singleDiodeParams = extractSingleDiodeParameters(data.voltage, data.current, params)

      setResults({
        ...params,
        ...singleDiodeParams,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error analyzing data")
      console.error("[v0] Analysis error:", err)
    } finally {
      setLoading(false)
    }
  }, [data])

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <p className="text-slate-600 font-medium">Analyzing solar cell characteristics...</p>
          <p className="text-slate-500 text-sm mt-2">This may take a moment</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-6">
        <AlertDescription className="text-base">{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* I-V and P-V Plots */}
      <IVPlot data={data} results={results} />

      {/* Model Validation */}
      <ModelValidationPlot data={data} results={results} />

      {/* Results Dashboard */}
      {results && <ResultsDisplay results={results} />}

      {/* Export Options */}
      <Card className="shadow-lg border border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <CardTitle className="text-lg">Export Results</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Button
            onClick={() => {
              const resultText = `Solar Cell Analysis Results
=================================

PERFORMANCE PARAMETERS:
- Short-Circuit Current (Isc): ${results.Isc?.toFixed(6)} A
- Open-Circuit Voltage (Voc): ${results.Voc?.toFixed(6)} V
- Maximum Power (Pmax): ${results.Pmax?.toFixed(6)} W
- Fill Factor (FF): ${(results.FF * 100)?.toFixed(2)}%
- Efficiency (η): ${(results.Efficiency * 100)?.toFixed(2)}%
- Voltage at Max Power (Vmpp): ${results.Vmpp?.toFixed(6)} V
- Current at Max Power (Impp): ${results.Impp?.toFixed(6)} A

SINGLE-DIODE MODEL PARAMETERS:
- Series Resistance (Rs): ${results.Rs?.toFixed(4)} Ω
- Shunt Resistance (Rsh): ${results.Rsh?.toFixed(2)} Ω
- Ideality Factor (n): ${results.n?.toFixed(4)}
- Reverse Saturation Current (I₀): ${results.Io?.toExponential(3)} A

MODEL FIT QUALITY:
- R² Value: ${results.fitQuality?.toFixed(6)}`

              const blob = new Blob([resultText], { type: "text/plain" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = "solar-cell-analysis.txt"
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="w-full"
          >
            Export as Text
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
