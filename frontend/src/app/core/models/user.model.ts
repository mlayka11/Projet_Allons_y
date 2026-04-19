// src/app/core/models/user.model.ts
export type UserRole = 'SENDER' | 'DELIVERER';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  rating: number;
  ratingCount: number;
  points: number;
  balance: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  points: number;
  balance: number;
  rating: number;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}
