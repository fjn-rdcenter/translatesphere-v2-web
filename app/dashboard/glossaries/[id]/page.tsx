"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Edit, Trash2, Search, ArrowRight, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PageTransition, SlideUp } from "@/components/ui/page-transition"
import { mockGlossaries } from "@/lib/mock-data"

export default function GlossaryDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (id === "new") {
      router.replace("/dashboard/glossaries/new")
    }
  }, [id, router])

  const glossary = mockGlossaries.find((g) => g.id === id)
  const [terms, setTerms] = useState(glossary?.terms || [])
  const [selectedTerms, setSelectedTerms] = useState<Set<string>>(new Set())
  const [showDeleteWarning, setShowDeleteWarning] = useState(false)
  const [deleteAction, setDeleteAction] = useState<"glossary" | "terms" | null>(null)

  useEffect(() => {
    if (glossary) {
      setTerms(glossary.terms)
    }
  }, [glossary])

  const toggleTermSelection = (termId: string) => {
    setSelectedTerms(prev => {
      const newSet = new Set(prev)
      if (newSet.has(termId)) {
        newSet.delete(termId)
      } else {
        newSet.add(termId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedTerms.size === filteredTerms.length) {
      setSelectedTerms(new Set())
    } else {
      setSelectedTerms(new Set(filteredTerms.map(t => t.id)))
    }
  }

  const handleDeleteSelected = () => {
    setDeleteAction("terms")
    setShowDeleteWarning(true)
  }

  const confirmDelete = () => {
    if (deleteAction === "glossary" || (deleteAction === "terms" && selectedTerms.size === terms.length)) {
      // Delete glossary logic here (mock)
      router.push("/dashboard/glossaries")
    } else {
      setTerms(terms.filter(t => !selectedTerms.has(t.id)))
      setSelectedTerms(new Set())
    }
    setShowDeleteWarning(false)
    setDeleteAction(null)
  }

  if (id === "new") {
    return null
  }

  if (!glossary) {
    return (
      <div className="container mx-auto px-6 py-10 text-center">
        <h1 className="text-2xl font-semibold">Glossary not found</h1>
        <Button className="mt-4" onClick={() => router.push("/dashboard/glossaries")}>
          Back to Glossaries
        </Button>
      </div>
    )
  }

  const filteredTerms = terms.filter(
    (term) =>
      term.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.target.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <PageTransition className="container mx-auto px-6 py-10">
      {/* Header */}
      <SlideUp>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/glossaries")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-serif font-semibold text-foreground">{glossary.name}</h1>
              <p className="mt-1 text-muted-foreground">
                {glossary.sourceLanguage} → {glossary.targetLanguage} • {glossary.termCount} terms
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedTerms.size > 0 && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteSelected}
              >
                <Trash2 className="mr-2 w-4 h-4" />
                Delete {selectedTerms.size}
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push(`/dashboard/glossaries/${id}/edit`)}>
              <Edit className="mr-2 w-4 h-4" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              className="text-destructive hover:text-destructive bg-transparent"
              onClick={() => {
                setDeleteAction("glossary")
                setShowDeleteWarning(true)
              }}
            >
              <Trash2 className="mr-2 w-4 h-4" />
              Delete Glossary
            </Button>

            <AlertDialog open={showDeleteWarning} onOpenChange={setShowDeleteWarning}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {deleteAction === "glossary" || (deleteAction === "terms" && selectedTerms.size === terms.length)
                      ? "Delete Glossary?" 
                      : "Delete Selected Terms?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {deleteAction === "glossary" 
                      ? `Are you sure you want to delete "${glossary.name}"? This action cannot be undone.`
                      : (selectedTerms.size === terms.length
                        ? `You are about to delete all terms. This will permanently delete the "${glossary.name}" glossary. Are you sure?`
                        : `Are you sure you want to delete ${selectedTerms.size} terms? This action cannot be undone.`
                      )
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setShowDeleteWarning(false)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={confirmDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SlideUp>

      {/* Description */}
      {glossary.description && (
        <SlideUp delay={0.1}>
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-muted-foreground">{glossary.description}</p>
            </CardContent>
          </Card>
        </SlideUp>
      )}

      {/* Terms Table */}
      <SlideUp delay={0.2}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Terms</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedTerms.size === filteredTerms.length && filteredTerms.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="font-medium">{glossary.sourceLanguage}</TableHead>
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="font-medium">{glossary.targetLanguage}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTerms.map((term, index) => (
                    <motion.tr
                      key={term.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                    >
                      <TableCell>
                        <Checkbox 
                          checked={selectedTerms.has(term.id)}
                          onCheckedChange={() => toggleTermSelection(term.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{term.source}</TableCell>
                      <TableCell>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell>{term.target}</TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredTerms.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No terms found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </SlideUp>
    </PageTransition>
  )
}
