"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PdfUploader from "@/components/pdf-uploader"
import ManualDataInput from "@/components/manual-data-input"
import SolarAnalyzer from "@/components/solar-analyzer"

export default function Home() {
  const [inputMode, setInputMode] = useState<"upload" | "manual">("upload")
  const [solarData, setSolarData] = useState<{ voltage: number[]; current: number[] } | null>(null)
  const [showAnalyzer, setShowAnalyzer] = useState(false)

  const handleDataSubmit = (data: { voltage: number[]; current: number[] }) => {
    setSolarData(data)
    setShowAnalyzer(true)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Solar Cell Analysis Tool</h1>
          <p className="text-lg text-slate-600">Interactive analysis of I-V characteristics and parameter extraction</p>
        </div>

        {showAnalyzer && solarData ? (
          <div className="space-y-6">
            <Button
              onClick={() => {
                setShowAnalyzer(false)
                setSolarData(null)
              }}
              variant="outline"
              className="mb-4"
            >
              ← Back to Data Input
            </Button>
            <SolarAnalyzer data={solarData} />
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-slate-800 text-white rounded-t-lg">
              <CardTitle className="text-2xl">Upload or Input Solar Cell Data</CardTitle>
              <CardDescription className="text-blue-100">Provide I-V characteristic data for analysis</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "upload" | "manual")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="upload">Upload PDF/CSV</TabsTrigger>
                  <TabsTrigger value="manual">Manual Input</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                  <PdfUploader onDataSubmit={handleDataSubmit} />
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <ManualDataInput onDataSubmit={handleDataSubmit} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
