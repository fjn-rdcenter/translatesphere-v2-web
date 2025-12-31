"use client";

import type React from "react";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Upload,
  FileText,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition, SlideUp } from "@/components/ui/page-transition";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { languages } from "@/lib/mock-data";
import type { GlossaryTerm } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function NewGlossaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [terms, setTerms] = useState<GlossaryTerm[]>([
    { id: "1", source: "", target: "" },
  ]);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTerms, setSelectedTerms] = useState<Set<string>>(new Set());
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  // Track which terms have had their target manually edited
  const [targetEditedTerms, setTargetEditedTerms] = useState<Set<string>>(
    new Set()
  );

  const addTerm = () => {
    setTerms([...terms, { id: Date.now().toString(), source: "", target: "" }]);
  };

  const removeTerm = (id: string) => {
    // Check if this is the last term
    if (terms.length === 1) {
      setShowDeleteWarning(true);
      return;
    }
    setTerms(terms.filter((t) => t.id !== id));
    setSelectedTerms((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleTermSelection = (id: string) => {
    setSelectedTerms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedTerms.size === terms.length) {
      setSelectedTerms(new Set());
    } else {
      setSelectedTerms(new Set(terms.map((t) => t.id)));
    }
  };

  const deleteSelectedTerms = () => {
    // Check if deleting all terms
    if (selectedTerms.size === terms.length) {
      setShowDeleteWarning(true);
      return;
    }
    setTerms(terms.filter((t) => !selectedTerms.has(t.id)));
    setSelectedTerms(new Set());
  };

  const confirmDeleteAllTerms = () => {
    // Navigate back since glossary will be deleted
    handleBack();
  };

  const updateTerm = (
    id: string,
    field: "source" | "target",
    value: string
  ) => {
    const currentTerm = terms.find((t) => t.id === id);

    if (field === "source" && currentTerm) {
      // If target hasn't been manually edited, auto-fill it with source value
      if (!targetEditedTerms.has(id)) {
        // Auto-fill target with source value
        setTerms(
          terms.map((t) =>
            t.id === id ? { ...t, source: value, target: value } : t
          )
        );
      } else {
        // Just update source
        setTerms(terms.map((t) => (t.id === id ? { ...t, source: value } : t)));
      }
    } else if (field === "target") {
      // Mark this term's target as manually edited
      setTargetEditedTerms((prev) => new Set(prev).add(id));
      setTerms(terms.map((t) => (t.id === id ? { ...t, target: value } : t)));
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/plain") {
      setImportedFile(file);
      // Simulate parsing the file
      const mockImportedTerms: GlossaryTerm[] = [
        { id: "101", source: "Contract", target: "Contrato" },
        { id: "102", source: "Agreement", target: "Acuerdo" },
        { id: "103", source: "Clause", target: "Cláusula" },
      ];
      setTerms([
        ...terms.filter((t) => t.source || t.target),
        ...mockImportedTerms,
      ]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (returnTo === "translate") {
      // Navigate back to translate page at step 1 (Glossary Selection)
      router.push("/dashboard/translate?step=1");
    } else {
      router.push("/dashboard/glossaries");
    }
  };

  const handleBack = () => {
    if (returnTo === "translate") {
      router.push("/dashboard/translate");
    } else {
      router.push("/dashboard/glossaries");
    }
  };

  const validTerms = terms.filter((t) => t.source && t.target);
  const isValid =
    name && sourceLanguage && targetLanguage && validTerms.length > 0;

  return (
    <PageTransition className="container mx-auto px-6">
      {/* Header */}
      <SlideUp>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-serif font-semibold text-foreground">
              Create Glossary
            </h1>
            <p className="mt-1 text-muted-foreground">
              Build a custom terminology profile
            </p>
          </div>
        </div>
      </SlideUp>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
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
                  <Input
                    id="name"
                    placeholder="e.g., Legal Terms, Medical Vocabulary"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the purpose of this glossary..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Source Language</Label>
                    <Select
                      value={sourceLanguage}
                      onValueChange={setSourceLanguage}
                    >
                      <SelectTrigger className="h-12 w-full">
                        <SelectValue placeholder="Select" />
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
                    <Select
                      value={targetLanguage}
                      onValueChange={setTargetLanguage}
                    >
                      <SelectTrigger className="h-12 w-full">
                        <SelectValue placeholder="Select" />
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
              </CardContent>
            </Card>
          </SlideUp>

          {/* Terms */}
          <SlideUp delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle>Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="manual" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    <TabsTrigger value="import">Import File</TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual" className="space-y-4">
                    {/* Bulk Actions */}
                    {selectedTerms.size > 0 && (
                      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
                        <span className="text-sm font-medium">
                          {selectedTerms.size} term
                          {selectedTerms.size > 1 ? "s" : ""} selected
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTerms(new Set())}
                          >
                            Clear Selection
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={deleteSelectedTerms}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Selected
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="border border-border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-secondary/50">
                            <TableHead className="w-12">
                              <Checkbox
                                checked={
                                  selectedTerms.size === terms.length &&
                                  terms.length > 0
                                }
                                onCheckedChange={toggleSelectAll}
                              />
                            </TableHead>
                            <TableHead className="font-medium">
                              Source Term
                            </TableHead>
                            <TableHead className="font-medium">
                              Target Term
                            </TableHead>
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
                                className={cn(
                                  "border-b border-border last:border-0",
                                  selectedTerms.has(term.id) &&
                                    "bg-secondary/30"
                                )}
                              >
                                <TableCell className="p-2">
                                  <Checkbox
                                    checked={selectedTerms.has(term.id)}
                                    onCheckedChange={() =>
                                      toggleTermSelection(term.id)
                                    }
                                  />
                                </TableCell>
                                <TableCell className="p-2">
                                  <Input
                                    placeholder="Enter source term"
                                    value={term.source}
                                    onChange={(e) =>
                                      updateTerm(
                                        term.id,
                                        "source",
                                        e.target.value
                                      )
                                    }
                                    className="border-0 bg-transparent focus-visible:ring-1"
                                  />
                                </TableCell>
                                <TableCell className="p-2">
                                  <Input
                                    placeholder="Enter translation"
                                    value={term.target}
                                    onChange={(e) =>
                                      updateTerm(
                                        term.id,
                                        "target",
                                        e.target.value
                                      )
                                    }
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

                    <Button
                      variant="outline"
                      onClick={addTerm}
                      className="w-full bg-transparent"
                    >
                      <Plus className="mr-2 w-4 h-4" />
                      Add Term
                    </Button>
                  </TabsContent>

                  <TabsContent value="import" className="space-y-4">
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                        importedFile
                          ? "border-primary bg-secondary/50"
                          : "border-border"
                      )}
                    >
                      {importedFile ? (
                        <div className="flex items-center justify-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-card flex items-center justify-center">
                            <FileText className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{importedFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {terms.length - 1} terms imported
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setImportedFile(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                          <p className="font-medium mb-1">Upload a .txt file</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Format: source term | target term (one pair per
                            line)
                          </p>
                          <input
                            type="file"
                            accept=".txt"
                            onChange={handleFileImport}
                            className="hidden"
                            id="file-import"
                          />
                          <Button asChild variant="outline">
                            <label
                              htmlFor="file-import"
                              className="cursor-pointer"
                            >
                              Choose File
                            </label>
                          </Button>
                        </>
                      )}
                    </div>

                    {importedFile && (
                      <p className="text-sm text-muted-foreground text-center">
                        You can also add more terms manually in the Manual Entry
                        tab
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </SlideUp>
        </div>

        {/* Sidebar Preview */}
        <div className="space-y-6 sticky top-24 self-start">
          <SlideUp delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="font-medium">{name || "Untitled Glossary"}</p>
                </div>

                {sourceLanguage && targetLanguage && (
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-sm text-muted-foreground mb-1">
                      Languages
                    </p>
                    <p className="font-medium">
                      {sourceLanguage} → {targetLanguage}
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-1">Terms</p>
                  <p className="font-medium">{validTerms.length} valid terms</p>
                </div>

                {validTerms.length > 0 && (
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-sm text-muted-foreground mb-2">
                      All Terms ({validTerms.length})
                    </p>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {validTerms.map((term) => (
                        <div
                          key={term.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="font-medium">{term.source}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span>{term.target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 space-y-3">
                  <Button
                    className="w-full"
                    disabled={!isValid || isSaving}
                    onClick={handleSave}
                  >
                    {isSaving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                    ) : (
                      <>
                        <Check className="mr-2 w-4 h-4" />
                        Save Glossary
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={handleBack}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </SlideUp>
        </div>
      </div>

      {/* Delete All Terms Warning Dialog */}
      <AlertDialog open={showDeleteWarning} onOpenChange={setShowDeleteWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete All Terms?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Removing all terms will delete this glossary. A glossary must have
              at least one term to exist.
              <br />
              <br />
              Are you sure you want to proceed? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAllTerms}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Glossary
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
