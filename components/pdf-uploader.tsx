"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PdfUploaderProps {
  onDataSubmit: (data: { voltage: number[]; current: number[] }) => void
}

export default function PdfUploader({ onDataSubmit }: PdfUploaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const extractDataFromText = (text: string): { voltage: number[]; current: number[] } | null => {
    // Look for common table patterns
    const lines = text.split("\n").filter((line) => line.trim())
    const voltage: number[] = []
    const current: number[] = []

    for (const line of lines) {
      // Try to extract comma-separated values
      const commaSeparated = line
        .split(",")
        .map((v) => Number.parseFloat(v.trim()))
        .filter((v) => !isNaN(v))
      if (commaSeparated.length >= 2) {
        voltage.push(commaSeparated[0])
        current.push(commaSeparated[1])
      }
      // Try space-separated values
      else {
        const spaceSeparated = line
          .trim()
          .split(/\s+/)
          .map((v) => Number.parseFloat(v))
          .filter((v) => !isNaN(v))
        if (spaceSeparated.length >= 2) {
          voltage.push(spaceSeparated[0])
          current.push(spaceSeparated[1])
        }
      }
    }

    if (voltage.length > 0 && current.length > 0) {
      return { voltage, current }
    }
    return null
  }

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      const fileName = file.name.toLowerCase()

      if (fileName.endsWith(".csv") || fileName.endsWith(".txt")) {
        const text = await file.text()
        const result = extractDataFromText(text)

        if (result && result.voltage.length > 0) {
          onDataSubmit(result)
        } else {
          setError("No valid voltage-current pairs found in file. Expected columns: Voltage, Current")
        }
      } else if (fileName.endsWith(".pdf")) {
        try {
          const arrayBuffer = await file.arrayBuffer()

          // Try using the built-in fetch API with PDF.js from CDN
          const response = await fetch("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js")

          if (!response.ok) {
            throw new Error("Could not load PDF parser")
          }

          // Fallback: extract numbers from PDF text representation
          const text = new TextDecoder().decode(arrayBuffer)
          const numberPattern = /-?\d+\.?\d*([eE][+-]?\d+)?/g
          const matches = text.match(numberPattern)

          if (matches && matches.length >= 4) {
            const voltage: number[] = []
            const current: number[] = []

            for (let i = 0; i < matches.length - 1; i += 2) {
              const v = Number.parseFloat(matches[i])
              const c = Number.parseFloat(matches[i + 1])
              if (!isNaN(v) && !isNaN(c)) {
                voltage.push(v)
                current.push(c)
              }
            }

            if (voltage.length > 0) {
              onDataSubmit({ voltage, current })
            } else {
              setError("Could not extract valid voltage-current data from PDF")
            }
          } else {
            setError("PDF does not contain enough numerical data")
          }
        } catch (pdfErr) {
          setError("Error processing PDF. Please use CSV or TXT format instead.")
        }
      } else {
        setError("Please upload a PDF, CSV, or TXT file")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error processing file")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.csv,.txt"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="hidden"
          disabled={isLoading}
        />
        <div className="text-4xl mb-2">📤</div>
        <p className="text-sm text-slate-600 mb-2">Click to browse or drag and drop</p>
        <p className="text-xs text-slate-500">PDF, CSV, or TXT files supported</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="w-full" size="lg">
        {isLoading ? "Processing..." : "Select File"}
      </Button>

      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
        <p className="font-semibold mb-1">File Format Tips:</p>
        <ul className="list-disc list-inside text-xs space-y-1">
          <li>CSV: Each line should have Voltage, Current values separated by comma</li>
          <li>TXT: Space or comma separated values work</li>
          <li>PDF: Must contain numerical data in tabular format</li>
        </ul>
      </div>
    </div>
  )
}
