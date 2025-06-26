import { CryptoConfig, ErrorCode } from '../types';

const config: CryptoConfig = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  saltLength: 16,
  ivLength: 12,
  iterations: 100000,
  tagLength: 128
};

export class CryptoError extends Error {
  constructor(message: string, public code: ErrorCode = ErrorCode.CRYPTO_ERROR) {
    super(message);
    this.name = 'CryptoError';
  }
}

export async function generateSalt(): Promise<Uint8Array> {
  return crypto.getRandomValues(new Uint8Array(config.saltLength));
}

export async function generateIV(): Promise<Uint8Array> {
  return crypto.getRandomValues(new Uint8Array(config.ivLength));
}

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  try {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    const baseKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: config.iterations,
        hash: 'SHA-256'
      },
      baseKey,
      {
        name: config.algorithm,
        length: config.keyLength
      },
      false,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    throw new CryptoError('Failed to derive key from password');
  }
}

export async function encrypt(data: string, key: CryptoKey): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const iv = await generateIV();
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: config.algorithm,
        iv,
        tagLength: config.tagLength
      },
      key,
      dataBuffer
    );
    
    return { encrypted, iv };
  } catch (error) {
    throw new CryptoError('Encryption failed');
  }
}

export async function decrypt(encrypted: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<string> {
  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: config.algorithm,
        iv,
        tagLength: config.tagLength
      },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    throw new CryptoError('Decryption failed - invalid key or corrupted data');
  }
}

export async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Combine password and salt properly
    const combined = new Uint8Array(passwordBuffer.length + salt.length);
    combined.set(passwordBuffer);
    combined.set(salt, passwordBuffer.length);
    
    const hash = await crypto.subtle.digest('SHA-256', combined);
    return arrayToBase64(new Uint8Array(hash));
  } catch (error) {
    throw new CryptoError('Password hashing failed');
  }
}

export function arrayToBase64(array: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return btoa(binary);
}

export function base64ToArray(base64: string): Uint8Array {
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return array;
}

export async function encryptNote(
  title: string,
  content: string,
  key: CryptoKey
): Promise<{
  encryptedTitle: string;
  encryptedContent: string;
  iv: string;
}> {
  const { encrypted: encryptedTitleBuffer, iv: titleIV } = await encrypt(title, key);
  const { encrypted: encryptedContentBuffer, iv: contentIV } = await encrypt(content, key);
  
  // Store both IVs concatenated (for simplicity, use titleIV for both in this implementation)
  return {
    encryptedTitle: arrayToBase64(new Uint8Array(encryptedTitleBuffer)),
    encryptedContent: arrayToBase64(new Uint8Array(encryptedContentBuffer)),
    iv: arrayToBase64(titleIV) + '|' + arrayToBase64(contentIV)
  };
}

export async function decryptNote(
  encryptedTitle: string,
  encryptedContent: string,
  iv: string,
  key: CryptoKey
): Promise<{
  title: string;
  content: string;
}> {
  const [titleIVString, contentIVString] = iv.split('|');
  const titleIV = base64ToArray(titleIVString);
  const contentIV = base64ToArray(contentIVString);
  
  const title = await decrypt(
    base64ToArray(encryptedTitle).buffer,
    key,
    titleIV
  );
  
  const content = await decrypt(
    base64ToArray(encryptedContent).buffer,
    key,
    contentIV
  );
  
  return { title, content };
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}