import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  Trash2,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileCard } from "@/components/file-card";
import { languages } from "@/lib/mock-data";

interface DocumentSetupStepProps {
  uploadedFile: {
    name: string;
    size: number;
    type: string;
  } | null;
  setUploadedFile: (
    file: { name: string; size: number; type: string } | null
  ) => void;
  sourceLanguage: string;
  setSourceLanguage: (lang: string) => void;
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DocumentSetupStep({
  uploadedFile,
  setUploadedFile,
  sourceLanguage,
  setSourceLanguage,
  targetLanguage,
  setTargetLanguage,
  onNext,
  onBack,
}: DocumentSetupStepProps) {
  const handleRemoveFile = () => {
    setUploadedFile(null);
    sessionStorage.removeItem("uploadedFile");
  };

  const handleFileSelect = (file: File) => {
    const fileData = {
      name: file.name,
      size: file.size,
      type: file.type,
    };
    setUploadedFile(fileData);
    sessionStorage.setItem("uploadedFile", JSON.stringify(fileData));
  };

  return (
    <motion.div
      key="document"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.15 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Document Setup
          </CardTitle>
          <p className="text-muted-foreground">
            Upload your document and choose translation languages
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* ================= FILE UPLOAD ================= */}
          {uploadedFile ? (
            <div className="flex items-stretch gap-2">
              {/* File card */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <FileCard
                  name={uploadedFile.name}
                  size={uploadedFile.size}
                  type={uploadedFile.type}
                  status="success"
                />
              </div>

              {/* Remove action – full height */}
              <button
                onClick={handleRemoveFile}
                className="
                  group
                  w-12
                  flex items-center justify-center
                  rounded-xl
                  border border-border
                  text-muted-foreground
                  transition-all duration-200

                  hover:bg-destructive
                  hover:border-destructive
                  hover:text-white

                  active:bg-destructive/90
                "
                aria-label="Remove file"
              >
                <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
              </button>
            </div>
          ) : (
            <div
              className="
                p-6 border-2 border-dashed border-border
                rounded-xl text-center
                transition-colors
              "
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add(
                  "border-primary",
                  "bg-secondary/50"
                );
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove(
                  "border-primary",
                  "bg-secondary/50"
                );
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove(
                  "border-primary",
                  "bg-secondary/50"
                );
                const file = e.dataTransfer.files[0];
                if (file) {
                  handleFileSelect(file);
                }
              }}
            >
              <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                Drag and drop your document here
              </p>
              <p className="text-sm text-muted-foreground mb-4">or</p>

              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileSelect(file);
                  }
                }}
              />

              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="mr-2 w-4 h-4" />
                Upload Document
              </Button>
            </div>
          )}

          {/* ================= LANGUAGE PAIR ================= */}
          <div className="space-y-2">
            <Label>Translation Languages</Label>

            <div className="flex items-center gap-3">
              {/* Source language */}
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="h-12 flex-1">
                  <SelectValue placeholder="From" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Swap */}
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => {
                  if (!sourceLanguage || !targetLanguage) return;
                  setSourceLanguage(targetLanguage);
                  setTargetLanguage(sourceLanguage);
                }}
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>

              {/* Target language */}
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="h-12 flex-1">
                  <SelectValue placeholder="To" />
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

          {/* ================= ACTIONS ================= */}
          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>

            <Button
              onClick={onNext}
              disabled={!uploadedFile || !targetLanguage}
              className="group"
            >
              Continue
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
