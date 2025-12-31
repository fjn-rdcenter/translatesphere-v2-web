"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { PageTransition, SlideUp } from "@/components/ui/page-transition";
import { StepIndicator } from "@/components/step-indicator";
import { mockGlossaries } from "@/lib/mock-data";
import { DocumentSetupStep } from "./translating-process/document-setup-step";
import { GlossarySelectionStep } from "./translating-process/glossary-selection-step";
import { TranslationExecutionStep } from "./translating-process/translation-execution-step";

const steps = [
  { id: "document", label: "Document" },
  { id: "glossary", label: "Glossary" },
  { id: "preview", label: "Preview" },
  { id: "translate", label: "Translate" },
];

export type TranslationStatus =
  | "idle"
  | "translating"
  | "success"
  | "error"
  | "cancelled";

function TranslatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [sourceLanguage, setSourceLanguage] = useState("Vietnamese");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [selectedGlossaries, setSelectedGlossaries] = useState<string[]>([]);
  const [glossaryOption, setGlossaryOption] = useState<
    "none" | "existing" | "new"
  >("none");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    type: string;
  } | null>(null);

  // Replaced separate booleans with a single status for better state management
  const [status, setStatus] = useState<TranslationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [termQuery, setTermQuery] = useState("");

  useEffect(() => {
    // Check for step query parameter first
    const stepParam = searchParams.get("step");

    // Load saved state
    const storedFile = sessionStorage.getItem("uploadedFile");
    const storedStep = sessionStorage.getItem("currentStep");
    const storedSourceLang = sessionStorage.getItem("sourceLanguage");
    const storedTargetLang = sessionStorage.getItem("targetLanguage");
    const storedGlossaryOption = sessionStorage.getItem("glossaryOption");
    const storedSelectedGlossaries =
      sessionStorage.getItem("selectedGlossaries");

    if (storedFile) setUploadedFile(JSON.parse(storedFile));

    // Prioritize URL parameter over sessionStorage
    if (stepParam) {
      const step = parseInt(stepParam);
      setCurrentStep(step);
      // Clear the URL parameter after reading it to avoid URL pollution
      router.replace("/dashboard/translate");
    } else if (storedStep) {
      setCurrentStep(parseInt(storedStep));
    }

    if (storedSourceLang) setSourceLanguage(storedSourceLang);
    if (storedTargetLang) setTargetLanguage(storedTargetLang);
    if (storedGlossaryOption) setGlossaryOption(storedGlossaryOption as any);
    if (storedSelectedGlossaries)
      setSelectedGlossaries(JSON.parse(storedSelectedGlossaries));
  }, [searchParams, router]);

  // Save state changes
  useEffect(() => {
    sessionStorage.setItem("currentStep", currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    sessionStorage.setItem("sourceLanguage", sourceLanguage);
  }, [sourceLanguage]);

  useEffect(() => {
    sessionStorage.setItem("targetLanguage", targetLanguage);
  }, [targetLanguage]);

  useEffect(() => {
    sessionStorage.setItem("glossaryOption", glossaryOption);
  }, [glossaryOption]);

  useEffect(() => {
    sessionStorage.setItem(
      "selectedGlossaries",
      JSON.stringify(selectedGlossaries)
    );
  }, [selectedGlossaries]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // Reset translation status when navigating back from step 3
      if (currentStep === 3) {
        setStatus("idle");
        setProgress(0);
        // Clear any ongoing translation interval
        if ((window as any).translationInterval) {
          clearInterval((window as any).translationInterval);
          (window as any).translationInterval = null;
        }
      }
      setCurrentStep(currentStep - 1);
    } else {
      router.push("/dashboard");
    }
  };

  const handleStartTranslation = () => {
    setStatus("translating");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus("success");
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    // Store interval ID so we can cancel it
    (window as any).translationInterval = interval;
  };

  const handleCancelTranslation = () => {
    // Clear the interval
    if ((window as any).translationInterval) {
      clearInterval((window as any).translationInterval);
      (window as any).translationInterval = null;
    }

    // Set to cancelled state instead of resetting completely
    setStatus("cancelled");
    setProgress(0);
  };

  const handleDownload = () => {
    // Simulate download
    alert("Download started!");
  };

  const handleNewTranslation = () => {
    // Reset all state
    setCurrentStep(0);
    setUploadedFile(null);
    setSourceLanguage("English");
    setTargetLanguage("");
    setSelectedGlossaries([]);
    setGlossaryOption("none");
    setStatus("idle");
    setProgress(0);

    // Clear session storage
    sessionStorage.removeItem("uploadedFile");
    sessionStorage.removeItem("currentStep");
    sessionStorage.removeItem("sourceLanguage");
    sessionStorage.removeItem("targetLanguage");
    sessionStorage.removeItem("glossaryOption");
    sessionStorage.removeItem("selectedGlossaries");
  };

  // Helper to retry from failed/cancelled state
  const handleRetry = () => {
    handleStartTranslation();
  };

  const selectedGlossaryList = mockGlossaries.filter((g) =>
    selectedGlossaries.includes(g.id)
  );

  return (
    <PageTransition className="container mx-auto px-6">
      {/* Step Indicator */}
      <SlideUp>
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          className="mb-6"
        />
      </SlideUp>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 0: Document Setup */}
        {currentStep === 0 && (
          <DocumentSetupStep
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            sourceLanguage={sourceLanguage}
            setSourceLanguage={setSourceLanguage}
            targetLanguage={targetLanguage}
            setTargetLanguage={setTargetLanguage}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {/* Step 1: Glossary Selection */}
        {currentStep === 1 && (
          <GlossarySelectionStep
            glossaryOption={glossaryOption}
            setGlossaryOption={setGlossaryOption}
            selectedGlossaries={selectedGlossaries}
            setSelectedGlossaries={setSelectedGlossaries}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            termQuery={termQuery}
            setTermQuery={setTermQuery}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {/* Steps 2 & 3: Preview and Translation Execution */}
        {(currentStep === 2 || currentStep === 3) && (
          <TranslationExecutionStep
            currentStep={currentStep}
            uploadedFile={uploadedFile}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            glossaryOption={glossaryOption}
            selectedGlossaryList={selectedGlossaryList}
            status={status}
            progress={progress}
            onBack={handleBack}
            onStepChange={setCurrentStep}
            onStartTranslation={handleStartTranslation}
            onCancelTranslation={handleCancelTranslation}
            onDownload={handleDownload}
            onNewTranslation={handleNewTranslation}
            onRetry={handleRetry}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

export default function TranslatePage() {
  return (
    <Suspense
      fallback={<div className="container mx-auto px-6 py-8">Loading...</div>}
    >
      <TranslatePageContent />
    </Suspense>
  );
}
