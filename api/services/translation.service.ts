/**
 * Translation Service
 * API calls for document translation
 * 
 * TODO: Implement the actual API calls based on your backend endpoints
 */

import apiClient from "../client";
import { API_CONFIG } from "../config";
import {
  UploadDocumentRequest,
  UploadDocumentResponse,
  StartTranslationRequest,
  StartTranslationResponse,
  TranslationStatusResponse,
  TranslationHistoryResponse,
  ApiResponse,
} from "../types";
import { ApiErrorHandler } from "../utils/error-handler";

export class TranslationService {
  /**
   * Upload document for translation
   */
  static async uploadDocument(
    file: File,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<UploadDocumentResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sourceLanguage", sourceLanguage);
      formData.append("targetLanguage", targetLanguage);

      const response = await apiClient.post<
        ApiResponse<UploadDocumentResponse>
      >(API_CONFIG.ENDPOINTS.TRANSLATIONS.UPLOAD, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.data;
    } catch (error) {
      ApiErrorHandler.logError(error, "TranslationService.uploadDocument");
      throw new Error(ApiErrorHandler.parseError(error));
    }
  }

  /**
   * Start translation job
   */
  static async startTranslation(
    params: StartTranslationRequest
  ): Promise<StartTranslationResponse> {
    try {
      const response = await apiClient.post<
        ApiResponse<StartTranslationResponse>
      >(API_CONFIG.ENDPOINTS.TRANSLATIONS.START, params);

      return response.data.data;
    } catch (error) {
      ApiErrorHandler.logError(error, "TranslationService.startTranslation");
      throw new Error(ApiErrorHandler.parseError(error));
    }
  }

  /**
   * Get translation job status
   */
  static async getTranslationStatus(
    jobId: string
  ): Promise<TranslationStatusResponse> {
    try {
      const response = await apiClient.get<
        ApiResponse<TranslationStatusResponse>
      >(API_CONFIG.ENDPOINTS.TRANSLATIONS.STATUS(jobId));

      return response.data.data;
    } catch (error) {
      ApiErrorHandler.logError(
        error,
        "TranslationService.getTranslationStatus"
      );
      throw new Error(ApiErrorHandler.parseError(error));
    }
  }

  /**
   * Cancel translation job
   */
  static async cancelTranslation(jobId: string): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.TRANSLATIONS.CANCEL(jobId));
    } catch (error) {
      ApiErrorHandler.logError(error, "TranslationService.cancelTranslation");
      throw new Error(ApiErrorHandler.parseError(error));
    }
  }

  /**
   * Download translated document
   */
  static async downloadTranslatedDocument(jobId: string): Promise<Blob> {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.TRANSLATIONS.DOWNLOAD(jobId),
        {
          responseType: "blob",
        }
      );

      return response.data;
    } catch (error) {
      ApiErrorHandler.logError(
        error,
        "TranslationService.downloadTranslatedDocument"
      );
      throw new Error(ApiErrorHandler.parseError(error));
    }
  }

  /**
   * Get translation history
   */
  static async getTranslationHistory(): Promise<TranslationHistoryResponse[]> {
    try {
      const response = await apiClient.get<
        ApiResponse<TranslationHistoryResponse[]>
      >(API_CONFIG.ENDPOINTS.TRANSLATIONS.HISTORY);

      return response.data.data;
    } catch (error) {
      ApiErrorHandler.logError(
        error,
        "TranslationService.getTranslationHistory"
      );
      throw new Error(ApiErrorHandler.parseError(error));
    }
  }
}
