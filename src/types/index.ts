export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  encrypted: boolean;
}

export interface EncryptedNote {
  id: string;
  encryptedTitle: string;
  encryptedContent: string;
  iv: string;
  salt: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  masterKeyHash: string;
  salt: string;
  setupCompleted: boolean;
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  masterKey: CryptoKey | null;
  sessionTimeout: number;
}

export interface CryptoConfig {
  algorithm: 'AES-GCM';
  keyLength: 256;
  saltLength: 16;
  ivLength: 12;
  iterations: 100000;
  tagLength: 128;
}

export interface StorageMetadata {
  key?: string;
  version: string;
  createdAt: Date;
  lastSync: Date;
  noteCount: number;
}

export interface UserWithId extends User {
  id: string;
}

export type NoteFormData = Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'encrypted'>;

export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export enum ErrorCode {
  CRYPTO_ERROR = 'CRYPTO_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface SessionConfig {
  timeout: number;
  warningTime: number;
  autoSave: boolean;
  autoSaveInterval: number;
}