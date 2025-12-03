export interface Document {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  status: "pending" | "translating" | "completed" | "failed"
  sourceLanguage: string
  targetLanguage: string
  glossaryId?: string
  progress?: number
}

export interface GlossaryTerm {
  id: string
  source: string
  target: string
}

export interface Glossary {
  id: string
  name: string
  description: string
  sourceLanguage: string
  targetLanguage: string
  termCount: number
  terms: GlossaryTerm[]
  createdAt: Date
  updatedAt: Date
}

export interface TranslationJob {
  id: string
  documentId: string
  documentName: string
  sourceLanguage: string
  targetLanguage: string
  glossaryName?: string
  status: "pending" | "translating" | "completed" | "failed"
  progress: number
  startedAt: Date
  completedAt?: Date
  fileSize: number
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}
