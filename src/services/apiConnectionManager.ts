/**
 * API Connection Manager for APSSI CONNECT
 * Handles secure communication with the Civil Registry API
 */

export type ConnectionStatus = "CONNECTED" | "DISCONNECTED" | "ERROR" | "TIMEOUT" | "UNREACHABLE" | "UNAUTHORIZED" | "INITIALIZING";

export interface ApiPayload {
  nik: string;
  kkNumber: string;
  fullName: string;
  dob: string;
  nonce?: string; // Prevent Replay Attack
  timestamp?: string; // Prevent Replay Attack
}

export interface ApiResponse<T> {
  status: number;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Mock Encryption Layer
 * Implements AES-like simulation with Salt and Nonce
 * Ensure: End-to-End Encryption
 */
const encryptPayload = (payload: ApiPayload): string => {
  // In a real-world scenario, this would use an industrial-grade crypto library (e.g., CryptoJS)
  const salt = Math.random().toString(36).substring(7);
  const jsonString = JSON.stringify({ ...payload, salt });
  
  // Simulation of E2E Encryption (e.g., Public Key RSA-OAEP + AES-GCM)
  return btoa(`E2E_RSA_AES_GCM_${jsonString}_HASH_${Date.now()}`);
};

/**
 * API Connection Manager Service
 * Prevent: Unauthorized Data Exposure, Replay Attack, Token Leakage
 */
class ApiConnectionManager {
  private static instance: ApiConnectionManager;
  // Use memory-only storage for JWT to prevent leakage to localStorage
  private jwtToken: string | null = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; 

  private constructor() {}

  public static getInstance(): ApiConnectionManager {
    if (!ApiConnectionManager.instance) {
      ApiConnectionManager.instance = new ApiConnectionManager();
    }
    return ApiConnectionManager.instance;
  }

  /**
   * Send Encrypted HTTPS POST Request
   */
  public async sendPostRequest<T>(endpoint: string, payload: ApiPayload): Promise<ApiResponse<T>> {
    // 1. Add Anti-Replay Security Layer
    const securePayload: ApiPayload = {
      ...payload,
      nonce: Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString()
    };

    const encryptedData = encryptPayload(securePayload);
    
    // Set up request with timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s Timeout

    try {
      // Simulation of a real fetch call with secure headers
      // await fetch(endpoint, { 
      //   method: 'POST', 
      //   headers: { 
      //     'Authorization': `Bearer ${this.jwtToken}`,
      //     'Content-Type': 'application/jose', // JSON Object Signing and Encryption
      //     'X-Request-ID': securePayload.nonce!
      //   },
      //   body: encryptedData 
      // })
      
      // Simulate API call with potential errors
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 1. JWT Validation check simulation
      if (!this.jwtToken || this.jwtToken.includes("EXPIRED")) {
        throw new Error("UNAUTHORIZED_TOKEN");
      }

      // 2. Success path simulation
      return {
        status: 200,
        data: { match: true, score: 100 } as T, // Mock response data
        timestamp: new Date().toISOString()
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "UNKNOWN_ERROR";
      const errorName = error instanceof Error ? error.name : "";

      if (errorName === 'AbortError') {
        return { status: 408, error: "REQUEST_TIMEOUT", timestamp: new Date().toISOString() };
      }
      
      if (errorMessage === "UNAUTHORIZED_TOKEN") {
        return { status: 401, error: "INVALID_TOKEN", timestamp: new Date().toISOString() };
      }

      // Handle server error / unreachable simulation
      return { status: 503, error: "API_UNREACHABLE", timestamp: new Date().toISOString() };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Refresh JWT Token
   */
  public async refreshToken(): Promise<boolean> {
    // Logic to refresh token securely
    this.jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_SECURE_REFRESH_" + Date.now();
    return true;
  }
}

export const apiConnectionManager = ApiConnectionManager.getInstance();
