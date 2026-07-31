/* eslint-disable @typescript-eslint/no-explicit-any */
import { Role, StaffType } from "@prisma/client";

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

export interface JWTPayload {
  sub: any;
  userId: string;
  email: string;
  role: Role;
  tokenVersion: number;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}