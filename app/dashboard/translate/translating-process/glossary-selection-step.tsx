import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Check,
  Search,
  Edit2,
  X,
  Trash2,
  MoveRight,
  Upload,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockGlossaries } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import { Checkbox } from "@/components/ui/checkbox";

interface GlossarySelectionStepProps {
  glossaryOption: "none" | "existing" | "new";
  setGlossaryOption: (option: "none" | "existing" | "new") => void;
  selectedGlossaries: string[];
  setSelectedGlossaries: (ids: string[]) => void;
  sourceLanguage: string;
  targetLanguage: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  termQuery: string;
  setTermQuery: (query: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function GlossarySelectionStep({
  glossaryOption,
  setGlossaryOption,
  selectedGlossaries,
  setSelectedGlossaries,
  sourceLanguage,
  targetLanguage,
  searchQuery,
  setSearchQuery,
  termQuery,
  setTermQuery,
  onNext,
  onBack,
}: GlossarySelectionStepProps) {
  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingGlossaryId, setViewingGlossaryId] = useState<string | null>(
    null
  );
  const [editedTerms, setEditedTerms] = useState<any[]>([]);
  const [editedGlossaryName, setEditedGlossaryName] = useState("");
  const [editedSourceLanguage, setEditedSourceLanguage] = useState("");
  const [editedTargetLanguage, setEditedTargetLanguage] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editModalSearchQuery, setEditModalSearchQuery] = useState("");
  const [entryMode, setEntryMode] = useState<"manual" | "import">("manual");

  // Add term state
  const [isAddingNewTerm, setIsAddingNewTerm] = useState(false);
  const [newTermSource, setNewTermSource] = useState("");
  const [newTermTarget, setNewTermTarget] = useState("");
  const [recentlyAddedTermId, setRecentlyAddedTermId] = useState<string | null>(
    null
  );
  const [deletingTermId, setDeletingTermId] = useState<string | null>(null);

  const viewingGlossaryData = viewingGlossaryId
    ? mockGlossaries.find((g) => g.id === viewingGlossaryId)
    : null;

  const filteredGlossaries = mockGlossaries.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTerms =
    viewingGlossaryData?.terms?.filter((t: any) =>
      `${t.source} ${t.target}`.toLowerCase().includes(termQuery.toLowerCase())
    ) ?? [];

  // Automatically select the first available glossary to view if none is being viewed
  useEffect(() => {
    if (!viewingGlossaryId && filteredGlossaries.length > 0) {
      setViewingGlossaryId(filteredGlossaries[0].id);
    }
  }, [filteredGlossaries]);

  // Clear recently added term highlight after 2 seconds
  useEffect(() => {
    if (recentlyAddedTermId) {
      const timer = setTimeout(() => setRecentlyAddedTermId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [recentlyAddedTermId]);

  const resetModalState = () => {
    setIsEditModalOpen(false);
    setEditedTerms([]);
    setIsAddingNewTerm(false);
    setNewTermSource("");
    setNewTermTarget("");
    setEditModalSearchQuery("");
    setDeletingTermId(null);
  };

  const handleToggleGlossary = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedGlossaries([...selectedGlossaries, id]);
    } else {
      setSelectedGlossaries(selectedGlossaries.filter((gId) => gId !== id));
    }
  };

  const handleViewGlossary = (id: string) => {
    setViewingGlossaryId(id);
    setTermQuery("");
  };

  const handleOpenEditModal = () => {
    setEditedTerms(viewingGlossaryData?.terms || []);
    setEditedGlossaryName(viewingGlossaryData?.name || "");
    setEditedSourceLanguage(viewingGlossaryData?.sourceLanguage || "");
    setEditedTargetLanguage(viewingGlossaryData?.targetLanguage || "");
    setEditedDescription(viewingGlossaryData?.description || "");
    setEditModalSearchQuery("");
    setIsEditModalOpen(true);
  };

  const handleCreateNewGlossary = () => {
    setViewingGlossaryId(null);
    setGlossaryOption("new");
    setEditedTerms([]);
    setEditedGlossaryName("");
    setEditedSourceLanguage(sourceLanguage || "");
    setEditedTargetLanguage(targetLanguage || "");
    setEditedDescription("");
    setEntryMode("manual");
    setIsEditModalOpen(true);
  };

  const handleSaveChanges = () => {
    console.log(
      glossaryOption === "new"
        ? "Creating new glossary:"
        : "Saving glossary changes:",
      {
        name: editedGlossaryName,
        sourceLanguage: editedSourceLanguage,
        targetLanguage: editedTargetLanguage,
        description: editedDescription,
        terms: editedTerms,
      }
    );
    resetModalState();
  };

  const handleEditTerm = (
    termId: string,
    field: "source" | "target",
    value: string
  ) => {
    setEditedTerms((prev) =>
      prev.map((term) =>
        term.id === termId ? { ...term, [field]: value } : term
      )
    );
  };

  const initiateDeleteTerm = (termId: string) => {
    setDeletingTermId(termId);
  };

  const confirmDeleteTerm = (termId: string) => {
    setEditedTerms((prev) => prev.filter((term) => term.id !== termId));
    setDeletingTermId(null);
  };

  const cancelDeleteTerm = () => {
    setDeletingTermId(null);
  };

  const handleAddNewTerm = () => {
    if (newTermSource.trim() && newTermTarget.trim()) {
      const newTerm = {
        id: `temp-${Date.now()}`,
        source: newTermSource.trim(),
        target: newTermTarget.trim(),
      };
      setEditedTerms((prev) => [...prev, newTerm]);
      setRecentlyAddedTermId(newTerm.id);
      setNewTermSource("");
      setNewTermTarget("");
      setIsAddingNewTerm(false);

      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop =
            scrollContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      const newTerms = content
        .split(/\r?\n/)
        .filter((line) => line.trim())
        .map((line) => {
          const parts = line.split("|");
          if (parts.length >= 2) {
            const source = parts[0].trim();
            const target = parts[1].trim();
            if (source && target) {
              return {
                id: `imported-${Date.now()}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                source,
                target,
              };
            }
          }
          return null;
        })
        .filter(Boolean) as any[];

      if (newTerms.length > 0) {
        setEditedTerms((prev) => [...prev, ...newTerms]);
        setEntryMode("manual");
        event.target.value = "";
        toast({
          variant: "success",
          title: "Import Successful",
          description: `${newTerms.length} terms have been imported successfully.`,
          duration: 3000,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description:
            "No valid terms found. Please ensure file content uses 'source | target' format.",
          duration: 3000,
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-7xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL - Glossary List */}
        <div className="lg:col-span-4">
          <Card className="h-[calc(100vh-280px)] flex flex-col">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Select Glossary
                </CardTitle>
                <Button
                  size="sm"
                  onClick={handleCreateNewGlossary}
                  className="h-8"
                >
                  <Plus className="mr-1.5 w-4 h-4" />
                  Create New
                </Button>
              </div>

              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search glossaries..."
                  className="h-9 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto space-y-2 pt-0">
              <div className="pt-0 pb-1">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Glossary List
                </h3>
              </div>

              {filteredGlossaries.map((glossary) => (
                <div
                  key={glossary.id}
                  onClick={() => handleViewGlossary(glossary.id)}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition flex items-center justify-between gap-3",
                    viewingGlossaryId === glossary.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-secondary/50"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {glossary.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {glossary.sourceLanguage} → {glossary.targetLanguage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {glossary.termCount} terms
                    </p>
                  </div>
                  <Checkbox
                    checked={selectedGlossaries.includes(glossary.id)}
                    onCheckedChange={(checked) =>
                      handleToggleGlossary(glossary.id, checked as boolean)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="h-5 w-5 border-2 border-primary/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                  />
                </div>
              ))}

              {filteredGlossaries.length === 0 && searchQuery && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No glossaries found
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL - Detail View */}
        <div className="lg:col-span-8">
          <Card className="h-[calc(100vh-280px)] flex flex-col">
            {viewingGlossaryId === null ? (
              <>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    No Glossary Selected
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-2 max-w-md">
                    <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg">
                      Select a Glossary to View
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Click on a glossary from the list to view its terms and
                      details.
                    </p>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="pb-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg font-semibold truncate">
                        {viewingGlossaryData?.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {viewingGlossaryData?.sourceLanguage} →{" "}
                        {viewingGlossaryData?.targetLanguage} •{" "}
                        {viewingGlossaryData?.termCount} terms
                      </p>
                      {viewingGlossaryData?.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {viewingGlossaryData.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenEditModal}
                    >
                      <Edit2 className="mr-2 w-4 h-4" />
                      Edit
                    </Button>
                  </div>

                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={termQuery}
                      onChange={(e) => setTermQuery(e.target.value)}
                      placeholder="Search terms..."
                      className="h-9 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto pt-0">
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 p-3 bg-secondary/30 border-b font-medium text-sm">
                      <div>Source Term</div>
                      <MoveRight className="w-4 h-4 text-muted-foreground mx-auto" />
                      <div>Target Term</div>
                    </div>

                    <div className="divide-y">
                      {filteredTerms.length > 0 ? (
                        filteredTerms.map((term: any) => (
                          <div
                            key={term.id}
                            className="grid grid-cols-[1fr_auto_1fr] gap-4 p-3 transition hover:bg-secondary/20"
                          >
                            <div className="text-sm truncate">
                              {term.source}
                            </div>
                            <MoveRight className="w-4 h-4 text-muted-foreground mx-auto" />
                            <div className="text-sm font-medium truncate">
                              {term.target}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          {termQuery
                            ? "No matching terms found"
                            : "No terms in this glossary"}
                        </div>
                      )}
                    </div>
                  </div>

                  {filteredTerms.length > 0 && termQuery === "" && (
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Showing {filteredTerms.length} of{" "}
                      {viewingGlossaryData?.termCount} terms
                    </p>
                  )}
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>

      {/* Edit/Create Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-xl w-full flex flex-col md:max-h-[95vh] h-[90vh] md:h-auto p-0 gap-0 overflow-hidden outline-none bg-white shadow-xl sm:rounded-xl">
          <DialogHeader className="px-6 py-4 border-b bg-white relative z-10 shrink-0">
            <DialogTitle className="text-xl font-semibold tracking-tight mb-3">
              {glossaryOption === "new"
                ? "Create New Glossary"
                : "Edit Glossary"}
            </DialogTitle>
            <div className="grid gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="space-y-1 flex-[1.5]">
                  <Label
                    htmlFor="glossary-name"
                    className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
                  >
                    Glossary Name
                  </Label>
                  <Input
                    id="glossary-name"
                    value={editedGlossaryName}
                    onChange={(e) => setEditedGlossaryName(e.target.value)}
                    placeholder="E.g., Technical Terms"
                    className="h-8 bg-muted/30 focus:bg-white transition-colors text-sm"
                  />
                </div>

                <div className="space-y-1 flex-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Source
                  </Label>
                  <Select
                    value={editedSourceLanguage}
                    onValueChange={setEditedSourceLanguage}
                  >
                    <SelectTrigger className="h-8 bg-muted/30 focus:bg-white transition-colors w-full text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 flex-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Target
                  </Label>
                  <Select
                    value={editedTargetLanguage}
                    onValueChange={setEditedTargetLanguage}
                  >
                    <SelectTrigger className="h-8 bg-muted/30 focus:bg-white transition-colors w-full text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="description"
                  className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
                >
                  Description (optional)
                </Label>
                <Textarea
                  id="description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Brief description of this glossary..."
                  className="min-h-[40px] !max-h-[80px] overflow-y-auto resize-none bg-muted/30 focus:bg-white transition-colors text-sm py-2 break-all"
                />
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-2 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10 h-10 gap-4">
              <div className="flex items-center p-1 bg-muted/50 rounded-lg border border-border/50">
                <button
                  onClick={() => setEntryMode("manual")}
                  className={cn(
                    "px-3 py-1 text-[10px] font-semibold rounded-md transition-all",
                    entryMode === "manual"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-white/50"
                  )}
                >
                  Manual Entry
                </button>
                <button
                  onClick={() => setEntryMode("import")}
                  className={cn(
                    "px-3 py-1 text-[10px] font-semibold rounded-md transition-all",
                    entryMode === "import"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-white/50"
                  )}
                >
                  Import File
                </button>
              </div>

              {entryMode === "manual" && (
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    value={editModalSearchQuery}
                    onChange={(e) => setEditModalSearchQuery(e.target.value)}
                    placeholder="Search terms..."
                    className="w-full bg-white border border-border/50 h-7 rounded-md pl-8 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm"
                  />
                </div>
              )}

              <div className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 bg-muted rounded-md border border-border/50 ml-auto">
                {editedTerms.length} terms
              </div>
            </div>

            {/* Content Area */}
            {entryMode === "manual" ? (
              <>
                <div className="grid grid-cols-[1fr_24px_1fr_auto] gap-4 px-6 py-1.5 bg-muted/30 border-b">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-3">
                    Source Term
                  </div>
                  <div></div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-3">
                    Target Term
                  </div>
                  <div></div>
                </div>

                <div
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-1"
                >
                  {editedTerms.length > 0 ? (
                    editedTerms
                      .filter((t: any) =>
                        `${t.source} ${t.target}`
                          .toLowerCase()
                          .includes(editModalSearchQuery.toLowerCase())
                      )
                      .map((term: any) => {
                        const isNewlyAdded = term.id === recentlyAddedTermId;
                        const isDeleting = term.id === deletingTermId;
                        return (
                          <div
                            key={term.id}
                            className={cn(
                              "group grid grid-cols-[1fr_24px_1fr_auto] gap-4 items-center p-1.5 rounded-lg border transition-all duration-300",
                              isNewlyAdded
                                ? "bg-green-50/50 border-green-500/30 shadow-sm"
                                : isDeleting
                                ? "bg-red-50/50 border-red-500/30 shadow-sm"
                                : "border-transparent bg-white shadow-sm hover:border-primary/20 hover:shadow-md"
                            )}
                          >
                            <Input
                              value={term.source}
                              onChange={(e) =>
                                handleEditTerm(
                                  term.id,
                                  "source",
                                  e.target.value
                                )
                              }
                              disabled={isDeleting}
                              className={cn(
                                "h-8 border-transparent bg-transparent hover:bg-muted/50 focus:bg-white focus:border-input focus:shadow-sm transition-all text-sm px-2",
                                isNewlyAdded && "text-green-800 font-medium",
                                isDeleting && "text-red-800/50"
                              )}
                              placeholder="Source term"
                            />
                            <MoveRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 mx-auto" />
                            <Input
                              value={term.target}
                              onChange={(e) =>
                                handleEditTerm(
                                  term.id,
                                  "target",
                                  e.target.value
                                )
                              }
                              disabled={isDeleting}
                              className={cn(
                                "h-8 border-transparent bg-transparent hover:bg-muted/50 focus:bg-white focus:border-input focus:shadow-sm transition-all text-sm font-medium text-primary px-2",
                                isNewlyAdded && "text-green-800",
                                isDeleting && "text-red-800/50"
                              )}
                              placeholder="Target term"
                            />

                            {isDeleting ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => confirmDeleteTerm(term.id)}
                                  className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-full"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={cancelDeleteTerm}
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </Button>
                                <span className="text-[10px] text-red-600 font-medium ml-1 mr-1">
                                  Delete?
                                </span>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => initiateDeleteTerm(term.id)}
                                className="h-7 w-7 text-muted-foreground/60 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all rounded-full"
                                tabIndex={-1}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        );
                      })
                  ) : (
                    <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-muted-foreground rounded-lg border-2 border-dashed border-muted m-2 bg-muted/5">
                      <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center mb-3 shadow-sm">
                        <Plus className="w-6 h-6 text-primary/40" />
                      </div>
                      <p className="font-medium text-foreground text-sm">
                        No terms yet
                      </p>
                      <p className="text-xs mt-1">
                        Add your first term below to get started
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
                <div
                  className="w-full max-w-lg border-2 border-dashed border-primary/20 rounded-xl bg-white/50 p-10 flex flex-col items-center justify-center text-center hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer group"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".txt"
                    onChange={handleFileUpload}
                  />
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Click to upload .txt file
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                    Files must follow the format: <br />
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                      source term | target term
                    </code>
                  </p>
                  <div className="text-xs text-muted-foreground/60 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Max file size: 5MB
                  </div>
                </div>
              </div>
            )}

            {/* Add New Section - Only in Manual Mode */}
            {entryMode === "manual" && (
              <div className="p-3 border-t bg-white shrink-0 z-20 shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.05)] flex justify-center">
                {isAddingNewTerm ? (
                  <div className="flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300 w-full max-w-3xl">
                    <div className="flex-1 grid grid-cols-[1fr_24px_1fr] gap-4 items-center p-2 rounded-lg border border-primary/20 bg-primary/5">
                      <Input
                        value={newTermSource}
                        onChange={(e) => setNewTermSource(e.target.value)}
                        placeholder="New Source Term"
                        className="h-8 bg-white border-primary/20 focus:border-primary shadow-sm text-sm"
                        autoFocus
                      />
                      <MoveRight className="w-4 h-4 text-primary/40 shrink-0 mx-auto" />
                      <Input
                        value={newTermTarget}
                        onChange={(e) => setNewTermTarget(e.target.value)}
                        placeholder="New Target Term"
                        className="h-8 bg-white border-primary/20 focus:border-primary shadow-sm text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddNewTerm();
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Button
                        onClick={handleAddNewTerm}
                        size="icon"
                        className="h-8 w-8 bg-primary hover:bg-primary/90 shadow-sm rounded-full"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        onClick={() => setIsAddingNewTerm(false)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-auto px-8 h-9 border-dashed border text-xs text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all rounded-full"
                    onClick={() => setIsAddingNewTerm(true)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add New Term
                  </Button>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="p-4 bg-muted/20 shrink-0 border-t">
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-muted-foreground">
                {editedTerms.length > 0
                  ? "Changes must be saved to apply."
                  : ""}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={resetModalState}>
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges} className="px-8">
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
