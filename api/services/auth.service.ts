/**
 * Authentication Service
 * API calls for user authentication
 * 
 * TODO: Implement the actual API calls based on your backend endpoints
 */

import apiClient from "../client";
import { API_CONFIG } from "../config";
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  ApiResponse,
} from "../types";
import { ApiErrorHandler } from "../utils/error-handler";

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Prepare form data for OAuth2 password grant
      const formData = new URLSearchParams();
      formData.append("grant_type", credentials.grant_type || "password");
      formData.append("username", credentials.username);
      formData.append("password", credentials.password);
      formData.append("scope", credentials.scope || "");
      formData.append("client_id", credentials.client_id || "string");
      formData.append("client_secret", credentials.client_secret || "");

      console.log("🔐 Attempting login to:", API_CONFIG.ENDPOINTS.AUTH.LOGIN);
      
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        formData.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      
      console.log("✅ Login response:", response.data);
      
      // Handle different response formats
      const loginData = response.data.data || response.data;
      const token = loginData.token || loginData.access_token;
      
      // Store token in localStorage
      if (token) {
        localStorage.setItem("auth_token", token);
        console.log("💾 Token stored successfully");
      }
      
      return loginData;
    } catch (error) {
      console.error("❌ Login error details:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      ApiErrorHandler.logError(error, "AuthService.login");
      throw new Error(ApiErrorHandler.parseError(error));
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      
      // Clear token from localStorage
      localStorage.removeItem("auth_token");
    } catch (error) {
      ApiErrorHandler.logError(error, "AuthService.logout");
      throw new Error(ApiErrorHandler.parseError(error));
    }
  }

  /**
   * Refresh authentication token
   * Token should be in Authorization header (handled by axios interceptor)
   */
  static async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      // Send empty body - token is in Authorization header
      const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH,
        {}
      );
      
      // Update token in localStorage
      if (response.data.data.token) {
        localStorage.setItem("auth_token", response.data.data.token);
      }
      
      return response.data.data;
    } catch (error) {
      ApiErrorHandler.logError(error, "AuthService.refreshToken");
      throw new Error(ApiErrorHandler.parseError(error));
    }
  }

  /**
   * Get current user information
   */
  static async getCurrentUser(): Promise<LoginResponse["user"]> {
    try {
      const response = await apiClient.get<ApiResponse<LoginResponse["user"]>>(
        API_CONFIG.ENDPOINTS.AUTH.ME
      );
      
      return response.data.data;
    } catch (error) {
      ApiErrorHandler.logError(error, "AuthService.getCurrentUser");
      throw new Error(ApiErrorHandler.parseError(error));
    }
  }
}
