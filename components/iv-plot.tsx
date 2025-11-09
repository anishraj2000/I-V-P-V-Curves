"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

interface IVPlotProps {
  data: { voltage: number[]; current: number[] }
  results: any
}

const KeyPointDot = (props: any) => {
  const { cx, cy, payload } = props

  if (payload.isKeyPoint) {
    return <circle cx={cx} cy={cy} r={5} fill="#dc2626" stroke="#fff" strokeWidth={2} />
  }
  return null
}

export default function IVPlot({ data, results }: IVPlotProps) {
  const chartData = useMemo(() => {
    const maxPower = Math.max(...data.voltage.map((v, i) => v * data.current[i]))
    const maxPowerIndex = data.voltage.findIndex((v, i) => v * data.current[i] === maxPower)

    return data.voltage
      .map((v, i) => ({
        voltage: Number.parseFloat(v.toFixed(4)),
        current: Number.parseFloat(data.current[i].toFixed(5)),
        power: Number.parseFloat((v * data.current[i]).toFixed(5)),
        isMaxPower: i === maxPowerIndex,
      }))
      .sort((a, b) => a.voltage - b.voltage)
  }, [data])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-slate-300 rounded shadow-lg text-sm">
          <p className="font-semibold text-slate-900">V: {data.voltage.toFixed(4)} V</p>
          <p className="text-blue-600">I: {data.current.toFixed(5)} A</p>
          {data.power && <p className="text-red-600">P: {data.power.toFixed(5)} W</p>}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* I-V Curve */}
      <Card className="shadow-lg border border-slate-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
          <CardTitle className="text-lg text-blue-900">I-V Characteristic Curve</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" vertical={false} />
              <XAxis
                dataKey="voltage"
                label={{ value: "Voltage (V)", position: "bottom", offset: 10, fill: "#475569" }}
                stroke="#94a3b8"
              />
              <YAxis
                label={{ value: "Current (A)", angle: -90, position: "insideLeft", offset: 10, fill: "#475569" }}
                stroke="#94a3b8"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <ReferenceLine
                x={results?.Voc?.toFixed(4)}
                stroke="#94a3b8"
                strokeDasharray="5 5"
                label={{ value: `Voc: ${results?.Voc?.toFixed(3)} V`, position: "top" }}
              />
              <Line
                type="monotone"
                dataKey="current"
                stroke="#2563eb"
                dot={<KeyPointDot />}
                isAnimationActive={false}
                name="Current (A)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded p-3 border border-blue-200">
              <p className="text-xs text-blue-600 font-semibold">ISC</p>
              <p className="text-lg font-bold text-blue-900">{results.Isc?.toFixed(4)} A</p>
            </div>
            <div className="bg-slate-50 rounded p-3 border border-slate-200">
              <p className="text-xs text-slate-600 font-semibold">VOC</p>
              <p className="text-lg font-bold text-slate-900">{results.Voc?.toFixed(4)} V</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* P-V Curve */}
      <Card className="shadow-lg border border-slate-200">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b">
          <CardTitle className="text-lg text-red-900">P-V Characteristic Curve</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fee2e2" vertical={false} />
              <XAxis
                dataKey="voltage"
                label={{ value: "Voltage (V)", position: "bottom", offset: 10, fill: "#475569" }}
                stroke="#94a3b8"
              />
              <YAxis
                label={{ value: "Power (W)", angle: -90, position: "insideLeft", offset: 10, fill: "#475569" }}
                stroke="#94a3b8"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <ReferenceLine
                x={results?.Vmpp?.toFixed(4)}
                stroke="#94a3b8"
                strokeDasharray="5 5"
                label={{ value: `VMPP: ${results?.Vmpp?.toFixed(3)} V`, position: "top" }}
              />
              <Line
                type="monotone"
                dataKey="power"
                stroke="#dc2626"
                dot={<KeyPointDot />}
                isAnimationActive={false}
                name="Power (W)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-red-50 rounded p-3 border border-red-200">
              <p className="text-xs text-red-600 font-semibold">PMAX</p>
              <p className="text-lg font-bold text-red-900">{results.Pmax?.toFixed(4)} W</p>
            </div>
            <div className="bg-slate-50 rounded p-3 border border-slate-200">
              <p className="text-xs text-slate-600 font-semibold">FF</p>
              <p className="text-lg font-bold text-slate-900">{(results.FF * 100)?.toFixed(2)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
