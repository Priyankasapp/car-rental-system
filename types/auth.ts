// types/auth.ts
import { Role, StaffType } from "@prisma/client";


// User Session — used in client-side hooks & context

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  staffType?: StaffType | null;
  isEmailVerified: boolean;
  mustChangePassword: boolean;
  profilePicture?: string | null;
  permissions: string[];
}


// JWT Payload — decoded token shape

export interface JWTPayload {
  sub?: string;        
  userId: string;
  email: string;
  role: Role;
  permissions: string[];
  tokenVersion: number;
  sessionId: string;
  iat?: number;
  exp?: number;
}


// API Response wrapper

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}


// Convenience re-exports for common response shapes

export type AuthMeResponse = ApiResponse<{ user: UserSession }>;
export type EmptyResponse = ApiResponse<never>;