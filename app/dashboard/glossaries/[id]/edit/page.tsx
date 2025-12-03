"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Plus, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageTransition, SlideUp } from "@/components/ui/page-transition"
import { mockGlossaries } from "@/lib/mock-data"
import type { GlossaryTerm } from "@/lib/types"

export default function EditGlossaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const glossary = mockGlossaries.find((g) => g.id === id)

  const [name, setName] = useState(glossary?.name || "")
  const [description, setDescription] = useState(glossary?.description || "")
  const [terms, setTerms] = useState<GlossaryTerm[]>(glossary?.terms || [])
  const [isSaving, setIsSaving] = useState(false)

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

  const addTerm = () => {
    setTerms([...terms, { id: Date.now().toString(), source: "", target: "" }])
  }

  const removeTerm = (termId: string) => {
    if (terms.length > 1) {
      setTerms(terms.filter((t) => t.id !== termId))
    }
  }

  const updateTerm = (termId: string, field: "source" | "target", value: string) => {
    setTerms(terms.map((t) => (t.id === termId ? { ...t, [field]: value } : t)))
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    router.push(`/dashboard/glossaries/${id}`)
  }

  const validTerms = terms.filter((t) => t.source && t.target)
  const isValid = name && validTerms.length > 0

  return (
    <PageTransition className="container mx-auto px-6 py-10">
      {/* Header */}
      <SlideUp>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/glossaries/${id}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-serif font-semibold text-foreground">Edit Glossary</h1>
            <p className="mt-1 text-muted-foreground">
              {glossary.sourceLanguage} → {glossary.targetLanguage}
            </p>
          </div>
        </div>
      </SlideUp>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <SlideUp delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Glossary Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </SlideUp>

          {/* Terms */}
          <SlideUp delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle>Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead className="font-medium">{glossary.sourceLanguage}</TableHead>
                        <TableHead className="font-medium">{glossary.targetLanguage}</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {terms.map((term) => (
                          <motion.tr
                            key={term.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-b border-border last:border-0"
                          >
                            <TableCell className="p-2">
                              <Input
                                value={term.source}
                                onChange={(e) => updateTerm(term.id, "source", e.target.value)}
                                className="border-0 bg-transparent focus-visible:ring-1"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                value={term.target}
                                onChange={(e) => updateTerm(term.id, "target", e.target.value)}
                                className="border-0 bg-transparent focus-visible:ring-1"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeTerm(term.id)}
                                disabled={terms.length === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                <Button variant="outline" onClick={addTerm} className="w-full bg-transparent">
                  <Plus className="mr-2 w-4 h-4" />
                  Add Term
                </Button>
              </CardContent>
            </Card>
          </SlideUp>
        </div>

        {/* Sidebar */}
        <div>
          <SlideUp delay={0.3}>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-1">Valid Terms</p>
                  <p className="font-medium">
                    {validTerms.length} of {terms.length}
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                  <Button className="w-full" disabled={!isValid || isSaving} onClick={handleSave}>
                    {isSaving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                    ) : (
                      <>
                        <Check className="mr-2 w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => router.push(`/dashboard/glossaries/${id}`)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </SlideUp>
        </div>
      </div>
    </PageTransition>
  )
}
