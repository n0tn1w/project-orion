"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, File, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setError(null)
      setUploadResult(null)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append("FileStream", file, file.name)

      const response = await fetch("api/files/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Upload failed: ${response.status} - ${errorText}`)
      }

      const result = await response.text()
      setUploadResult(result)
      setFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black">Upload File</h1>
        <p className="mt-2 text-gray-600">Select or drag and drop a file to upload to Project Orion</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload
          </CardTitle>
          <CardDescription>Choose a file from your device or drag and drop it here</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragActive ? "border-black bg-gray-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <div className="space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Upload className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop your file here, or <span className="text-black underline">browse</span>
                </p>
                <p className="text-sm text-gray-500">Any file type is supported</p>
              </div>
            </div>
          </div>

          {/* Selected File Display */}
          {file && (
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
              <File className="h-5 w-5 text-gray-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFile(null)
                  setError(null)
                  setUploadResult(null)
                }}
                disabled={uploading}
              >
                Remove
              </Button>
            </div>
          )}

          {/* Upload Button */}
          <Button onClick={handleUpload} disabled={!file || uploading} className="w-full" size="lg">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Success Result */}
      {uploadResult && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <p className="font-medium">Upload successful!</p>
              <div className="rounded bg-white p-3 border border-green-200">
                <p className="text-sm text-gray-600 mb-1">File ID:</p>
                <p className="font-mono text-lg font-bold text-black">{uploadResult}</p>
              </div>
              <p className="text-sm">Save this ID to download your file later.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <p className="font-medium">Upload failed</p>
            <p className="text-sm mt-1">{error}</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
