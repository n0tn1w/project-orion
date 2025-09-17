"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, FileText, CheckCircle, AlertCircle, Loader2, Search, Calendar } from "lucide-react"

interface FileMetadata {
  fileName: string
  fileId: string
  lastModified: string
}

export default function DownloadPage() {
  const [fileId, setFileId] = useState("")
  const [downloading, setDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [files, setFiles] = useState<FileMetadata[]>([])
  const [filteredFiles, setFilteredFiles] = useState<FileMetadata[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingFiles, setLoadingFiles] = useState(true)
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null)

  useEffect(() => {
    fetchFileMetadata()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFiles(files)
    } else {
      setFilteredFiles(files.filter((file) => file.fileName.toLowerCase().includes(searchQuery.toLowerCase())))
    }
  }, [files, searchQuery])

  const fetchFileMetadata = async () => {
    try {
      setLoadingFiles(true)
      const response = await fetch("api/files/get-metadata")

      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.status}`)
      }

      const data: FileMetadata[] = await response.json()
      setFiles(data)
    } catch (err) {
      console.error("Error fetching file metadata:", err)
      setError(err instanceof Error ? err.message : "Failed to load files")
    } finally {
      setLoadingFiles(false)
    }
  }

  const handleDownload = async (downloadFileId?: string) => {
    const targetFileId = downloadFileId || fileId.trim()

    if (!targetFileId) {
      setError("Please enter a file ID")
      return
    }

    setDownloading(true)
    if (downloadFileId) {
      setDownloadingFileId(downloadFileId)
    }
    setError(null)
    setDownloadSuccess(null)

    try {
      const response = await fetch(`api/files/download/${targetFileId}`, {
        method: "GET",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Download failed: ${response.status} - ${errorText}`)
      }

      // Get filename from Content-Disposition header
      let filename = targetFileId
      const contentDisposition =
        response.headers.get("Content-Disposition") || response.headers.get("content-disposition")
      
      if (contentDisposition) {
        const matchStar = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
        const match = contentDisposition.match(/filename\s*=\s*("?)([^";]+)\1/);

        if (matchStar) {
          filename = decodeURIComponent(matchStar[1]);
        } else if (match) {
        }
      }

      // Get the file data as blob
      const blob = await response.blob()

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setDownloadSuccess(filename)
      if (!downloadFileId) {
        setFileId("")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed")
    } finally {
      setDownloading(false)
      setDownloadingFileId(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleDownload()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black">Download Files</h1>
        <p className="mt-2 text-gray-600">Browse and download your files from Project Orion</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Files
          </CardTitle>
          <CardDescription>Search through your uploaded files by name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search files by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Files
          </CardTitle>
          <CardDescription>
            {loadingFiles ? "Loading files..." : `${filteredFiles.length} file(s) found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingFiles ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading files...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "No files match your search" : "No files uploaded yet"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.fileId}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-black truncate">{file.fileName}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>ID: {file.fileId}</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(file.lastModified)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(file.fileId)}
                    disabled={downloadingFileId === file.fileId}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    {downloadingFileId === file.fileId ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-3 w-3" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Manual Download
          </CardTitle>
          <CardDescription>Enter a specific file ID to download</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fileId" className="text-sm font-medium text-gray-900">
              File ID
            </Label>
            <Input
              id="fileId"
              type="text"
              placeholder="Enter your file ID (e.g., 4027)"
              value={fileId}
              onChange={(e) => setFileId(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={downloading}
              className="text-lg"
            />
            <p className="text-sm text-gray-500">This is the ID you received when you uploaded your file</p>
          </div>

          <Button onClick={handleDownload} disabled={!fileId.trim() || downloading} className="w-full" size="lg">
            {downloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download File
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Success Message */}
      {downloadSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <p className="font-medium">Download successful!</p>
              <div className="flex items-center gap-2 rounded bg-white p-3 border border-green-200">
                <FileText className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Downloaded file:</p>
                  <p className="font-medium text-black">{downloadSuccess}</p>
                </div>
              </div>
              <p className="text-sm">The file has been saved to your downloads folder.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <p className="font-medium">Download failed</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-sm mt-2 text-gray-600">Please check that the file ID is correct and try again.</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">How to download:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Enter the file ID you received after uploading</li>
              <li>Click the "Download File" button</li>
              <li>The file will be automatically downloaded to your device</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
