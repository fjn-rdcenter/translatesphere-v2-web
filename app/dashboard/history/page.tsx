"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Download, FileText, Check, X, Clock, Calendar, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageTransition, SlideUp } from "@/components/ui/page-transition"
import { mockTranslationHistory, languages } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

const statusConfig = {
  completed: { label: "Completed", icon: Check, className: "bg-success/10 text-success" },
  failed: { label: "Failed", icon: X, className: "bg-destructive/10 text-destructive" },
  translating: { label: "In Progress", icon: Clock, className: "bg-warning/10 text-warning-foreground" },
  pending: { label: "Pending", icon: Clock, className: "bg-muted text-muted-foreground" },
}

export default function HistoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [languageFilter, setLanguageFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  // Check for URL filter parameter and set initial state
  useEffect(() => {
    const filter = searchParams.get("filter")
    if (filter === "month") {
      setDateFilter("month")
    }
  }, [searchParams])

  const filteredHistory = mockTranslationHistory.filter((job) => {
    const matchesSearch = job.documentName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    const matchesLanguage =
      languageFilter === "all" || job.sourceLanguage === languageFilter || job.targetLanguage === languageFilter

    let matchesDate = true
    if (dateFilter !== "all") {
      const now = new Date()
      const jobDate = new Date(job.startedAt)
      if (dateFilter === "today") {
        matchesDate = jobDate.toDateString() === now.toDateString()
      } else if (dateFilter === "week") {
        const weekAgo = new Date(now.setDate(now.getDate() - 7))
        matchesDate = jobDate >= weekAgo
      } else if (dateFilter === "month") {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
        matchesDate = jobDate >= monthAgo
      }
    }

    return matchesSearch && matchesStatus && matchesLanguage && matchesDate
  })

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setLanguageFilter("all")
    setDateFilter("all")
  }

  const hasActiveFilters = searchQuery || statusFilter !== "all" || languageFilter !== "all" || dateFilter !== "all"

  return (
    <PageTransition className="container mx-auto px-6 py-10">
      {/* Header */}
      <SlideUp>
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold text-foreground">Translation History</h1>
          <p className="mt-1 text-muted-foreground">View and manage your past translations</p>
        </div>
      </SlideUp>

      {/* Filters */}
      <SlideUp delay={0.1}>
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by document name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-background"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40 h-11">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="translating">In Progress</SelectItem>
                </SelectContent>
              </Select>

              {/* Language Filter */}
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-full md:w-44 h-11 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Language" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-40 h-11">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="h-11">
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </SlideUp>

      {/* Results Summary */}
      <SlideUp delay={0.15}>
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredHistory.length} of {mockTranslationHistory.length} translations
          </p>
        </div>
      </SlideUp>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.map((job, index) => {
          const status = statusConfig[job.status]
          const StatusIcon = status.icon

          return (
            <SlideUp key={job.id} delay={0.2 + index * 0.03}>
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-foreground truncate">{job.documentName}</h3>
                        <Badge variant="secondary" className={cn("shrink-0", status.className)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>
                          {job.sourceLanguage} → {job.targetLanguage}
                        </span>
                        <span className="hidden md:inline">•</span>
                        <span>{formatFileSize(job.fileSize)}</span>
                        {job.glossaryName && (
                          <>
                            <span className="hidden md:inline">•</span>
                            <span className="text-foreground/70">{job.glossaryName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col items-end text-right shrink-0">
                      <p className="text-sm font-medium text-foreground">{formatDate(job.startedAt)}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(job.startedAt)}</p>
                    </div>

                    {/* Actions */}
                    {job.status === "completed" && (
                      <Button variant="outline" size="sm" className="shrink-0 bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                    {job.status === "failed" && (
                      <Button variant="outline" size="sm" className="shrink-0 bg-transparent">
                        Retry
                      </Button>
                    )}
                  </div>

                  {/* Progress for in-progress jobs */}
                  {job.status === "translating" && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{job.progress}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${job.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </SlideUp>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredHistory.length === 0 && (
        <SlideUp delay={0.2}>
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No translations found</h3>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters ? "Try adjusting your filters" : "Start translating to see your history here"}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => router.push("/dashboard")}>Start Translating</Button>
            )}
          </div>
        </SlideUp>
      )}
    </PageTransition>
  )
}
