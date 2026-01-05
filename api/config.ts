/**
 * API Configuration
 * Central configuration for API endpoints and settings
 */

export const API_CONFIG = {
  BASE_URL: "http://192.168.137.218:18000",
  TIMEOUT: 30000, // 30 seconds
  
  // API Endpoints - Update these to match your backend routes
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: "/api/v2/auth/login",
      LOGOUT: "/api/v2/auth/logout",
      REFRESH: "/api/v2/auth/refresh-token",
      ME: "/api/v2/auth/me",
    },
    
    // Glossaries
    GLOSSARIES: {
      BASE: "/api/v2/glossaries",
      BY_ID: (id: string) => `/api/v2/glossaries/${id}`,
      TERMS: (glossaryId: string) => `/api/v2/glossaries/${glossaryId}/terms`,
      TERM_BY_ID: (glossaryId: string, termId: string) => 
        `/api/v2/glossaries/${glossaryId}/terms/${termId}`,
    },
    
    // Translations
    TRANSLATIONS: {
      UPLOAD: "/api/v2/translations/upload",
      START: "/api/v2/translations/start",
      STATUS: (jobId: string) => `/api/v2/translations/${jobId}/status`,
      CANCEL: (jobId: string) => `/api/v2/translations/${jobId}/cancel`,
      DOWNLOAD: (jobId: string) => `/api/v2/translations/${jobId}/download`,
      HISTORY: "/api/v2/translations/history",
    },
  },
} as const;
