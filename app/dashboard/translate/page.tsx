"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Plus, Check, Upload, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PageTransition, SlideUp } from "@/components/ui/page-transition"
import { StepIndicator } from "@/components/step-indicator"
import { FileCard } from "@/components/file-card"
import { mockGlossaries, languages } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const steps = [
  { id: "document", label: "Document" },
  { id: "glossary", label: "Glossary" },
  { id: "preview", label: "Preview" },
  { id: "translate", label: "Translate" },
]

export default function TranslatePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [sourceLanguage, setSourceLanguage] = useState("Vietnamese")
  const [targetLanguage, setTargetLanguage] = useState("")
  const [selectedGlossary, setSelectedGlossary] = useState<string | null>(null)
  const [glossaryOption, setGlossaryOption] = useState<"none" | "existing" | "new">("none")
  const [uploadedFile, setUploadedFile] = useState<{
    name: string
    size: number
    type: string
  } | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Load saved state
    const storedFile = sessionStorage.getItem("uploadedFile")
    const storedStep = sessionStorage.getItem("currentStep")
    const storedSourceLang = sessionStorage.getItem("sourceLanguage")
    const storedTargetLang = sessionStorage.getItem("targetLanguage")
    const storedGlossaryOption = sessionStorage.getItem("glossaryOption")
    const storedSelectedGlossary = sessionStorage.getItem("selectedGlossary")

    if (storedFile) setUploadedFile(JSON.parse(storedFile))
    if (storedStep) setCurrentStep(parseInt(storedStep))
    if (storedSourceLang) setSourceLanguage(storedSourceLang)
    if (storedTargetLang) setTargetLanguage(storedTargetLang)
    if (storedGlossaryOption) setGlossaryOption(storedGlossaryOption as any)
    if (storedSelectedGlossary) setSelectedGlossary(storedSelectedGlossary)
  }, [])

  // Save state changes
  useEffect(() => {
    sessionStorage.setItem("currentStep", currentStep.toString())
  }, [currentStep])

  useEffect(() => {
    sessionStorage.setItem("sourceLanguage", sourceLanguage)
  }, [sourceLanguage])

  useEffect(() => {
    sessionStorage.setItem("targetLanguage", targetLanguage)
  }, [targetLanguage])

  useEffect(() => {
    sessionStorage.setItem("glossaryOption", glossaryOption)
  }, [glossaryOption])

  useEffect(() => {
    if (selectedGlossary) {
      sessionStorage.setItem("selectedGlossary", selectedGlossary)
    } else {
      sessionStorage.removeItem("selectedGlossary")
    }
  }, [selectedGlossary])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push("/dashboard")
    }
  }

  const handleStartTranslation = () => {
    setIsTranslating(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsTranslating(false)
          setIsComplete(true)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 500)
  }

  const handleDownload = () => {
    // Simulate download
    alert("Download started!")
  }

  const handleNewTranslation = () => {
    // Reset all state
    setCurrentStep(0)
    setUploadedFile(null)
    setSourceLanguage("English")
    setTargetLanguage("")
    setSelectedGlossary(null)
    setGlossaryOption("none")
    setIsTranslating(false)
    setProgress(0)
    setIsComplete(false)
    
    // Clear session storage
    sessionStorage.removeItem("uploadedFile")
    sessionStorage.removeItem("currentStep")
    sessionStorage.removeItem("sourceLanguage")
    sessionStorage.removeItem("targetLanguage")
    sessionStorage.removeItem("glossaryOption")
    sessionStorage.removeItem("selectedGlossary")
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    sessionStorage.removeItem("uploadedFile")
  }

  const selectedGlossaryData = selectedGlossary ? mockGlossaries.find((g) => g.id === selectedGlossary) : null

  return (
    <PageTransition className="container mx-auto px-6 py-10">
      {/* Step Indicator */}
      <SlideUp>
        <StepIndicator steps={steps} currentStep={currentStep} className="mb-10" />
      </SlideUp>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Document Setup */}
        {currentStep === 0 && (
          <motion.div
            key="document"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Document Setup</CardTitle>
                <p className="text-muted-foreground">Configure your translation settings</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Info */}
                {uploadedFile ? (
                  <div className="space-y-2">
                    <FileCard
                      name={uploadedFile.name}
                      size={uploadedFile.size}
                      type={uploadedFile.type}
                      status="success"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleRemoveFile}
                      className="w-full text-destructive hover:text-destructive"
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="p-6 border-2 border-dashed border-border rounded-xl text-center"
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.add('border-primary', 'bg-secondary/50')
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-primary', 'bg-secondary/50')
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('border-primary', 'bg-secondary/50')
                      const file = e.dataTransfer.files[0]
                      if (file) {
                        const fileData = {
                          name: file.name,
                          size: file.size,
                          type: file.type
                        }
                        setUploadedFile(fileData)
                        sessionStorage.setItem("uploadedFile", JSON.stringify(fileData))
                      }
                    }}
                  >
                    <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Drag and drop your document here</p>
                    <p className="text-sm text-muted-foreground mb-4">or</p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const fileData = {
                            name: file.name,
                            size: file.size,
                            type: file.type
                          }
                          setUploadedFile(fileData)
                          sessionStorage.setItem("uploadedFile", JSON.stringify(fileData))
                        }
                      }}
                    />
                    <Button 
                      variant="outline" 
                      className="mt-4 bg-transparent" 
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Upload className="mr-2 w-4 h-4" />
                      Upload Document
                    </Button>
                  </div>
                )}

                {/* Language Selection */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Source Language</Label>
                    <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Language</Label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages
                          .filter((l) => l !== sourceLanguage)
                          .map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext} disabled={!uploadedFile || !targetLanguage} className="group">
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Glossary Selection */}
        {currentStep === 1 && (
          <motion.div
            key="glossary"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Glossary Settings</CardTitle>
                <p className="text-muted-foreground">Use a glossary to maintain terminology consistency</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <RadioGroup
                  value={glossaryOption}
                  onValueChange={(v) => {
                  setGlossaryOption(v as any)
                  // Clear selected glossary when switching away from existing
                  if (v === "none" || v === "new") {
                    setSelectedGlossary(null)
                  }
                }}
                  className="space-y-4"
                >

                  {/* --- NONE OPTION --- */}
                  <div
                    className={cn(
                      "flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer",
                      glossaryOption === "none"
                        ? "border-primary bg-secondary/50"
                        : "border-border hover:border-primary/50"
                  )}
                onClick={() => {
                  setGlossaryOption("none")
                  setSelectedGlossary(null)
                }}
                  >
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none" className="flex-1 cursor-pointer">
                      <span className="font-medium">No glossary</span>
                      <p className="text-sm text-muted-foreground">Translate without custom terminology</p>
                    </Label>
                  </div>

                  {/* --- EXISTING OPTION --- */}
                  <div
                    className={cn(
                      "flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer space-y-3",
                      glossaryOption === "existing"
                        ? "border-primary bg-secondary/50"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setGlossaryOption("existing")}
                  >
                    <div className="flex items-start space-x-4">
                      <RadioGroupItem value="existing" id="existing" className="mt-1" />
                      <Label htmlFor="existing" className="flex-1 cursor-pointer">
                        <span className="font-medium">Use existing glossary</span>
                        <p className="text-sm text-muted-foreground">Select from your saved glossaries</p>
                      </Label>
                    </div>

                    {/* Glossary list */}
                    {glossaryOption === "existing" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-2"
                      >
                        {mockGlossaries.map((glossary) => (
                          <div
                            key={glossary.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedGlossary(glossary.id)
                              setGlossaryOption("existing")
                            }}
                            className={cn(
                              "p-3 rounded-lg border transition-all cursor-pointer",
                              selectedGlossary === glossary.id
                                ? "border-primary bg-card shadow-sm"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{glossary.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {glossary.termCount} terms • {glossary.sourceLanguage} → {glossary.targetLanguage}
                                </p>
                              </div>
                              {selectedGlossary === glossary.id && (
                                <Check className="w-5 h-5 text-primary" />
                              )}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* --- NEW OPTION --- */}
                  <div
                    className={cn(
                      "flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer",
                      glossaryOption === "new"
                        ? "border-primary bg-secondary/50"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setGlossaryOption("new")}
                  >
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new" className="flex-1 cursor-pointer">
                      <span className="font-medium">Create new glossary</span>
                      <p className="text-sm text-muted-foreground">Build a custom glossary for this translation</p>
                    </Label>
                  </div>

                </RadioGroup>

                {/* Actions */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back to Document
                  </Button>
                  {glossaryOption === "new" ? (
                    <Button
                      onClick={() => router.push("/dashboard/glossaries/new?returnTo=translate")}
                      className="group"
                    >
                      <Plus className="mr-2 w-4 h-4" />
                      Create Glossary
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={glossaryOption === "existing" && !selectedGlossary}
                      className="group"
                    >
                      Continue
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Preview Summary */}
        {currentStep === 2 && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Translation Summary</CardTitle>
                <p className="text-muted-foreground">Review your settings before starting</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Document Info */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-2">Document</p>
                  {uploadedFile && (
                    <FileCard name={uploadedFile.name} size={uploadedFile.size} type={uploadedFile.type} />
                  )}
                </div>

                {/* Translation Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-sm text-muted-foreground mb-1">Source Language</p>
                    <p className="font-medium">{sourceLanguage}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-sm text-muted-foreground mb-1">Target Language</p>
                    <p className="font-medium">{targetLanguage}</p>
                  </div>
                </div>

                {/* Glossary Info */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Glossary</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                      className="h-7 text-xs"
                    >
                      Edit
                    </Button>
                  </div>
                  {glossaryOption === "none" || !selectedGlossaryData ? (
                    <p className="font-medium">No glossary selected</p>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium">{selectedGlossaryData.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedGlossaryData.termCount} terms • {selectedGlossaryData.sourceLanguage} → {selectedGlossaryData.targetLanguage}
                        </p>
                      </div>
                      {/* Glossary Preview */}
                      <div className="mt-3 p-3 rounded-lg border border-border bg-background">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Sample Terms:</p>
                        <div className="space-y-1.5">
                          {/* Show first 3 terms as preview */}
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">API</span>
                            <span className="font-medium">Application Programming Interface</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">UI</span>
                            <span className="font-medium">User Interface</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">UX</span>
                            <span className="font-medium">User Experience</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          +{selectedGlossaryData.termCount - 3} more terms
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext} className="group">
                    Start Translation
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Translation Progress & Result */}
        {currentStep === 3 && (
          <motion.div
            key="translate"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                {!isTranslating && !isComplete && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-10 h-10 text-foreground" />
                    </div>
                    <h2 className="text-2xl font-serif font-semibold mb-2">Ready to Translate</h2>
                    <p className="text-muted-foreground mb-8">Click below to start the translation process</p>
                    <Button size="lg" onClick={handleStartTranslation} className="group">
                      Start Translation
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                )}

                {isTranslating && (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-20 h-20 rounded-full border-4 border-secondary border-t-primary mx-auto mb-6"
                    />
                    <h2 className="text-2xl font-serif font-semibold mb-2">Translating...</h2>
                    <p className="text-muted-foreground mb-6">Processing your document</p>

                    {/* Progress Bar */}
                    <div className="max-w-md mx-auto">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {Math.round(Math.min(progress, 100))}% complete
                      </p>
                    </div>
                  </div>
                )}

                {isComplete && (
                  <div className="text-center py-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"
                    >
                      <Check className="w-10 h-10 text-success" />
                    </motion.div>
                    <h2 className="text-2xl font-serif font-semibold mb-2">Translation Complete!</h2>
                    <p className="text-muted-foreground mb-8">Your document has been successfully translated</p>

                    {/* Result File Card */}
                    {uploadedFile && (
                      <div className="max-w-md mx-auto mb-8">
                        <FileCard
                          name={`translated_${uploadedFile.name}`}
                          size={uploadedFile.size}
                          type={uploadedFile.type}
                          status="success"
                        />
                      </div>
                    )}

                    <div className="flex justify-center gap-4">
                      <Button size="lg" onClick={handleDownload}>
                        Download Translation
                      </Button>
                      <Button size="lg" variant="outline" onClick={handleNewTranslation}>
                        New Translation
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
