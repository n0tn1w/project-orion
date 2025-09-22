"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Calendar,
  Trash2,
  ArrowUpDown,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface FileMetadata {
  fileName: string
  fileId: string
  lastModified: string
}

type SortOrder = "asc" | "desc"

export default function DownloadPage() {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [files, setFiles] = useState<FileMetadata[]>([])
  const [filteredFiles, setFilteredFiles] = useState<FileMetadata[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingFiles, setLoadingFiles] = useState(true)
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<FileMetadata | null>(null)
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null)

  useEffect(() => {
    fetchFileMetadata()
  }, [])

  useEffect(() => {
    let filtered = files

    if (searchQuery.trim() !== "") {
      filtered = files.filter((file) => file.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.lastModified).getTime()
      const dateB = new Date(b.lastModified).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })

    setFilteredFiles(filtered)
  }, [files, searchQuery, sortOrder])

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

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  const handleDeleteFile = async (file: FileMetadata) => {
    setDeletingFileId(file.fileId)
    setError(null)

    try {
      const response = await fetch(`api/files/delete/${encodeURIComponent(file.fileName)}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Delete failed: ${response.status} - ${errorText}`)
      }

      await fetchFileMetadata()
      setDownloadSuccess(`${file.fileName} deleted successfully`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed")
    } finally {
      setDeletingFileId(null)
      setDeleteDialogOpen(false)
      setFileToDelete(null)
    }
  }

  const openDeleteDialog = (file: FileMetadata) => {
    setFileToDelete(file)
    setDeleteDialogOpen(true)
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDownload = async (downloadFileId: string) => {
    setDownloadingFileId(downloadFileId)
    setError(null)
    setDownloadSuccess(null)

    try {
      const response = await fetch(`api/files/download/${downloadFileId}`, {
        method: "GET",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Download failed: ${response.status} - ${errorText}`)
      }

      // Get filename from Content-Disposition header
      let filename = downloadFileId
      const contentDisposition =
        response.headers.get("Content-Disposition") || response.headers.get("content-disposition")

      if (contentDisposition) {
        const matchStar = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
        const match = contentDisposition.match(/filename\s*=\s*("?)([^";]+)\1/)

        if (matchStar) {
          filename = decodeURIComponent(matchStar[1])
        } else if (match) {
          filename = match[2]
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed")
    } finally {
      setDownloadingFileId(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black">Your Files</h1>
        <p className="mt-2 text-gray-600">Browse and download your files from Project Orion</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Files
          </CardTitle>
          <CardDescription>Find your files quickly by searching their names</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search files by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSort}
              className="flex items-center gap-2 px-3 py-2 h-10 text-sm bg-transparent whitespace-nowrap"
            >
              <ArrowUpDown className="h-3 w-3" />
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            File Library
          </CardTitle>
          <CardDescription>
            {loadingFiles ? "Loading your files..." : `${filteredFiles.length} file(s) available`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingFiles ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">Loading your files...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? "No files match your search" : "No files uploaded yet"}
              </h3>
              <p className="text-gray-500">
                {searchQuery ? "Try adjusting your search terms" : "Upload your first file to get started"}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredFiles.map((file) => (
                <div
                  key={file.fileId}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 gap-3 sm:gap-4 w-full overflow-hidden"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0 overflow-hidden">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <FileText className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p
                        className="font-medium text-gray-900 truncate sm:text-lg text-base cursor-help block w-full"
                        title={file.fileName}
                      >
                        {file.fileName}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(file.lastModified)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto sm:flex-shrink-0 sm:max-w-[200px]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(file)}
                      disabled={deletingFileId === file.fileId}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 w-full sm:w-auto sm:min-w-[44px]"
                    >
                      {deletingFileId === file.fileId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => handleDownload(file.fileId)}
                      disabled={downloadingFileId === file.fileId}
                      size="sm"
                      className="w-full sm:w-auto sm:min-w-[100px]"
                    >
                      {downloadingFileId === file.fileId ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete File
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium">"{fileToDelete?.fileName}"</span>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fileToDelete && handleDeleteFile(fileToDelete)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete File
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {downloadSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <p className="font-medium">Download completed successfully!</p>
              <div className="flex items-center gap-2 rounded bg-white p-3 border border-green-200">
                <FileText className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Downloaded:</p>
                  <p className="font-medium text-black">{downloadSuccess}</p>
                </div>
              </div>
              <p className="text-sm">The file has been saved to your downloads folder.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <p className="font-medium">Operation failed</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-sm mt-2 text-gray-600">Please try again or contact support if the problem persists.</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
