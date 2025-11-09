"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ManualDataInputProps {
  onDataSubmit: (data: { voltage: number[]; current: number[] }) => void
}

const SAMPLE_DATASETS = {
  realistic: {
    name: "Realistic Solar Cell",
    voltage: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6],
    current: [-0.5, -0.495, -0.485, -0.47, -0.45, -0.425, -0.395, -0.36, -0.32, -0.27, -0.2, -0.1, 0],
  },
  ideal: {
    name: "Ideal Solar Cell",
    voltage: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
    current: [-1, -0.95, -0.88, -0.78, -0.65, -0.45, 0],
  },
  experimental: {
    name: "Experimental Data",
    voltage: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55],
    current: [-0.48, -0.46, -0.44, -0.42, -0.39, -0.36, -0.32, -0.27, -0.2, -0.1, -0.01],
  },
}

export default function ManualDataInput({ onDataSubmit }: ManualDataInputProps) {
  const [inputMode, setInputMode] = useState<"table" | "raw" | "sample">("table")
  const [voltage, setVoltage] = useState<string[]>(["0", "0.1", "0.2"])
  const [current, setCurrent] = useState<string[]>(["-0.5", "-0.48", "-0.45"])
  const [rawData, setRawData] = useState("0, -0.5\n0.1, -0.48\n0.2, -0.45")
  const [selectedSample, setSelectedSample] = useState<"realistic" | "ideal" | "experimental">("realistic")
  const [error, setError] = useState<string | null>(null)

  const handleAddRow = () => {
    setVoltage([...voltage, ""])
    setCurrent([...current, ""])
  }

  const handleRemoveRow = (index: number) => {
    setVoltage(voltage.filter((_, i) => i !== index))
    setCurrent(current.filter((_, i) => i !== index))
  }

  const validateData = (v: number[], i: number[]) => {
    if (v.length === 0 || i.length === 0) {
      setError("Please enter at least one voltage-current pair")
      return false
    }
    if (v.length !== i.length) {
      setError("Voltage and current arrays must have the same length")
      return false
    }
    if (v.some((n) => isNaN(n))) {
      setError("Invalid voltage values")
      return false
    }
    if (i.some((n) => isNaN(n))) {
      setError("Invalid current values")
      return false
    }
    return true
  }

  const handleTableSubmit = () => {
    setError(null)
    const v = voltage.map((v) => Number.parseFloat(v)).filter((v) => !isNaN(v))
    const i = current.map((c) => Number.parseFloat(c)).filter((c) => !isNaN(c))

    if (validateData(v, i)) {
      onDataSubmit({ voltage: v, current: i })
    }
  }

  const handleRawSubmit = () => {
    setError(null)
    const lines = rawData.split("\n").filter((line) => line.trim())
    const v: number[] = []
    const i: number[] = []

    lines.forEach((line) => {
      const parts = line
        .split(/[,\s]+/)
        .map((p) => Number.parseFloat(p.trim()))
        .filter((p) => !isNaN(p))
      if (parts.length >= 2) {
        v.push(parts[0])
        i.push(parts[1])
      }
    })

    if (validateData(v, i)) {
      onDataSubmit({ voltage: v, current: i })
    }
  }

  const handleLoadSample = (sampleKey: "realistic" | "ideal" | "experimental") => {
    const sample = SAMPLE_DATASETS[sampleKey]
    setVoltage(sample.voltage.map((v) => v.toString()))
    setCurrent(sample.current.map((c) => c.toString()))
    setSelectedSample(sampleKey)
    setError(null)
  }

  const handleSampleSubmit = () => {
    const sample = SAMPLE_DATASETS[selectedSample]
    onDataSubmit({
      voltage: sample.voltage,
      current: sample.current,
    })
  }

  return (
    <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "table" | "raw" | "sample")}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="table">Table Input</TabsTrigger>
        <TabsTrigger value="raw">Raw Data</TabsTrigger>
        <TabsTrigger value="sample">Sample Data</TabsTrigger>
      </TabsList>

      <TabsContent value="table" className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left p-2 font-semibold">Voltage (V)</th>
                <th className="text-left p-2 font-semibold">Current (A)</th>
                <th className="text-left p-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {voltage.map((_, index) => (
                <tr key={index} className="border-b hover:bg-slate-50">
                  <td className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={voltage[index]}
                      onChange={(e) => {
                        const newVoltage = [...voltage]
                        newVoltage[index] = e.target.value
                        setVoltage(newVoltage)
                      }}
                      placeholder="0.0"
                      className="w-full"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      step="0.001"
                      value={current[index]}
                      onChange={(e) => {
                        const newCurrent = [...current]
                        newCurrent[index] = e.target.value
                        setCurrent(newCurrent)
                      }}
                      placeholder="0.0"
                      className="w-full"
                    />
                  </td>
                  <td className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRow(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={handleAddRow} variant="outline" className="flex-1 bg-transparent">
            + Add Row
          </Button>
          <Button onClick={handleTableSubmit} className="flex-1">
            Analyze Data
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="raw" className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Enter data (Voltage, Current pairs per line)
          </label>
          <Textarea
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            placeholder="0, -0.5&#10;0.1, -0.48&#10;0.2, -0.45"
            rows={8}
            className="font-mono text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">Supports comma or space-separated values</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleRawSubmit} className="w-full">
          Analyze Data
        </Button>
      </TabsContent>

      <TabsContent value="sample" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(
            Object.entries(SAMPLE_DATASETS) as Array<[keyof typeof SAMPLE_DATASETS, typeof SAMPLE_DATASETS.realistic]>
          ).map(([key, dataset]) => (
            <Card
              key={key}
              className={`cursor-pointer transition-all ${
                selectedSample === key ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"
              }`}
              onClick={() => handleLoadSample(key as "realistic" | "ideal" | "experimental")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{dataset.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                <p>{dataset.voltage.length} data points</p>
                <p>
                  V: {dataset.voltage[0]} to {dataset.voltage[dataset.voltage.length - 1]} V
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSampleSubmit} className="w-full">
          Use {SAMPLE_DATASETS[selectedSample].name}
        </Button>
      </TabsContent>
    </Tabs>
  )
}
