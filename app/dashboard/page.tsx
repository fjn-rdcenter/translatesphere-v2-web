"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, BookOpen, History, ArrowRight, Clock, MoreHorizontal, CheckCircle2, AlertCircle, Timer, Activity, Calendar } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PageTransition, SlideUp } from "@/components/ui/page-transition"
import { FileCard } from "@/components/file-card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const quickStats = [
  { label: "Total Translations", value: "1,248", change: "+12%", icon: FileText, trend: "up" },
  { label: "Active Glossaries", value: "8", change: "Stable", icon: BookOpen, trend: "neutral" },
  { label: "Translations This Month", value: "156", change: "+24%", icon: Calendar, trend: "up" },
]

export default function DashboardPage() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    multiple: false,
  })

  const handleContinue = () => {
    if (files.length > 0) {
      sessionStorage.setItem(
        "uploadedFile",
        JSON.stringify({
          name: files[0].name,
          size: files[0].size,
          type: files[0].type,
        }),
      )
      router.push("/dashboard/translate")
    }
  }

  const removeFile = () => {
    setFiles([])
  }

  return (
    <PageTransition className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your translation activities and performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/dashboard/history">
              <History className="w-4 h-4" />
              Full History
            </Link>
          </Button>
          <Button className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800" asChild>
            <Link href="/dashboard/translate">
              <Upload className="w-4 h-4" />
              New Translation
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {quickStats.map((stat, i) => {
          // Determine the navigation path based on the stat label
          let href = "/dashboard/history"
          if (stat.label === "Active Glossaries") {
            href = "/dashboard/glossaries"
          } else if (stat.label === "Translations This Month") {
            href = "/dashboard/history?filter=month"
          }

          return (
            <SlideUp key={stat.label} delay={i * 0.1}>
              <Link href={href}>
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className={cn(
                        "font-medium",
                        stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-zinc-500"
                      )}>
                        {stat.change}
                      </span>
                      {" "}from last month
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </SlideUp>
          )
        })}
      </div>

      <div className="space-y-6">
        {/* Quick Upload - Expanded */}
        <Card className="w-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
          <CardHeader>
            <CardTitle>Quick Upload</CardTitle>
            <CardDescription>Drag and drop documents here to start a new translation immediately.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={cn(
                "w-full rounded-xl p-10 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center gap-4 min-h-[200px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm",
                "hover:border-primary/50 hover:shadow-md",
                isDragActive && "border-primary ring-2 ring-primary/20",
              )}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <p className="text-lg font-medium">
                  {isDragActive ? "Drop your files here" : "Click or drag files to upload"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Support for PDF, DOCX, TXT, and more. Up to 50MB per file.
                </p>
              </div>
            </div>

            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 max-w-2xl mx-auto"
                >
                  <FileCard
                    name={files[0].name}
                    size={files[0].size}
                    type={files[0].type}
                    status="success"
                    onRemove={removeFile}
                  />
                  <div className="flex justify-center mt-4">
                    <Button onClick={handleContinue} size="lg" className="min-w-[200px] gap-2">
                      Translate Now
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
