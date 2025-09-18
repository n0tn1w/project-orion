"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Upload, File, CheckCircle, AlertCircle, Loader2, Zap, CloudUpload } from "lucide-react"

type UploadMethod = "standard" | "tus"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>("standard")
  const [uploadProgress, setUploadProgress] = useState(0)

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
    setUploadProgress(0)

    try {
      if (uploadMethod === "standard") {
        await handleStandardUpload()
      } else {
        await handleTusUpload()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleStandardUpload = async () => {
    if (!file) return

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
  }

  const handleTusUpload = async () => {
    if (!file) return

    const chunkSize = 160 * 1024 * 1024 // 160MB chunks
    const totalSize = file.size
    let uploadedBytes = 0

    // Create upload session
    const createResponse = await fetch("/api/files/tus", {
      method: "POST",
      headers: {
        "Upload-Length": totalSize.toString(),
        "Upload-Metadata": `filename ${btoa(file.name)},contentType ${btoa(file.type || "application/octet-stream")}`,
        "Tus-Resumable": "1.0.0",
      },
    })

    if (!createResponse.ok) {
      throw new Error(`Failed to create upload session: ${createResponse.status}`)
    }

    const loc = createResponse.headers.get("Location")!
    const uploadUrl = loc.startsWith("/") ? `/api${loc}` : loc
    if (!uploadUrl) {
      throw new Error("No upload URL received")
    }

    // Upload file in chunks
    while (uploadedBytes < totalSize) {
      const chunk = file.slice(uploadedBytes, Math.min(uploadedBytes + chunkSize, totalSize))

      const patchResponse = await fetch(uploadUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/offset+octet-stream",
          "Upload-Offset": uploadedBytes.toString(),
          "Tus-Resumable": "1.0.0",
        },
        body: chunk,
      })

      if (!patchResponse.ok) {
        throw new Error(`Upload chunk failed: ${patchResponse.status}`)
      }

      uploadedBytes += chunk.size
      setUploadProgress((uploadedBytes / totalSize) * 100)
    }

    // Get the file ID from the final response
    const finalResponse = await fetch(uploadUrl, {
      method: "HEAD",
      headers: {
        "Tus-Resumable": "1.0.0",
      },
    })

    const fileId = finalResponse.headers.get("Upload-Metadata") || "Upload completed"
    setUploadResult(fileId)
    setFile(null)
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
            <CloudUpload className="h-5 w-5" />
            Upload Method
          </CardTitle>
          <CardDescription>Choose your preferred upload method</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={uploadMethod} onValueChange={(value: UploadMethod) => setUploadMethod(value)}>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="standard" id="standard" />
              <Label htmlFor="standard" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Standard Upload</p>
                    <p className="text-sm text-gray-500">Fast and reliable for most files</p>
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <RadioGroupItem value="tus" id="tus" />
              <Label htmlFor="tus" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">TUS Protocol</p>
                    <p className="text-sm text-gray-500">Resumable uploads for large files</p>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload
          </CardTitle>
          <CardDescription>
            {uploadMethod === "standard"
              ? "Choose a file from your device or drag and drop it here"
              : "Large file upload with resumable capability"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {uploading && uploadMethod === "tus" && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Upload Progress</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <Button onClick={handleUpload} disabled={!file || uploading} className="w-full" size="lg">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadMethod === "tus" ? "Uploading chunks..." : "Uploading..."}
              </>
            ) : (
              <>
                {uploadMethod === "tus" ? <Zap className="mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
                {uploadMethod === "tus" ? "Start TUS Upload" : "Upload File"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

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
