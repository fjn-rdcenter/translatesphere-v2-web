/**
 * API Type Definitions
 * Request and response types for API calls
 */

import { Glossary, GlossaryTerm, TranslationJob } from "@/lib/types";

// ============================================================================
// Common Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface LoginRequest {
  username: string;
  password: string;
  grant_type?: string;
  scope?: string;
  client_id?: string;
  client_secret?: string;
}

export interface LoginResponse {
  token: string;
  access_token?: string; // OAuth2 standard token field
  refreshToken: string;
  refresh_token?: string; // OAuth2 standard refresh token field
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface RefreshTokenResponse {
  token: string;
  access_token?: string; // OAuth2 standard token field
  refreshToken: string;
  refresh_token?: string; // OAuth2 standard refresh token field
}

// ============================================================================
// Glossary Types
// ============================================================================

export interface CreateGlossaryRequest {
  name: string;
  description: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface UpdateGlossaryRequest {
  name?: string;
  description?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
}

export interface GlossaryResponse extends Glossary {}

export interface CreateTermRequest {
  source: string;
  target: string;
}

export interface UpdateTermRequest {
  source?: string;
  target?: string;
}

export interface TermResponse extends GlossaryTerm {}

// ============================================================================
// Translation Types
// ============================================================================

export interface UploadDocumentRequest {
  file: File;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface UploadDocumentResponse {
  documentId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export interface StartTranslationRequest {
  documentId: string;
  sourceLanguage: string;
  targetLanguage: string;
  glossaryIds?: string[];
}

export interface StartTranslationResponse {
  jobId: string;
  status: "pending" | "translating" | "completed" | "failed" | "cancelled";
  startedAt: string;
}

export interface TranslationStatusResponse {
  jobId: string;
  status: "pending" | "translating" | "completed" | "failed" | "cancelled";
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface TranslationHistoryResponse extends TranslationJob {}
