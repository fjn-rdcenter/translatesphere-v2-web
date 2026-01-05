/**
 * Error Handler Utility
 * Centralized error handling for API calls
 */

import { AxiosError } from "axios";
import { ApiError } from "../types";

export class ApiErrorHandler {
  /**
   * Parse API error and return user-friendly message
   */
  static parseError(error: unknown): string {
    if (error instanceof AxiosError) {
      // Server responded with error
      if (error.response) {
        const apiError = error.response.data as ApiError;
        return apiError?.error?.message || "Unable to connect to server. Please try again.";
      }
      
      // Request was made but no response
      if (error.request) {
        return "No response from server. Please check your connection.";
      }
    }
    
    // Generic error
    return "An unexpected error occurred. Please try again.";
  }

  /**
   * Log error to console (can be extended to send to logging service)
   */
  static logError(error: unknown, context?: string): void {
    console.error(`[API Error${context ? ` - ${context}` : ""}]:`, error);
  }

  /**
   * Check if error is a network error
   */
  static isNetworkError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      return !error.response && !!error.request;
    }
    return false;
  }

  /**
   * Check if error is an authentication error
   */
  static isAuthError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      return error.response?.status === 401;
    }
    return false;
  }
}
