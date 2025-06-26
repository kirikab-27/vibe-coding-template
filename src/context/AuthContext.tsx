import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { deriveKey, hashPassword, generateSalt, arrayToBase64, base64ToArray, CryptoError } from '../utils/crypto';
import { storage, StorageError } from '../utils/storage';

interface AuthContextType {
  state: AuthState;
  login: (password: string) => Promise<void>;
  logout: () => void;
  setupUser: (password: string) => Promise<void>;
  isSetupRequired: () => Promise<boolean>;
  extendSession: () => void;
}

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: { masterKey: CryptoKey; timeout: number } }
  | { type: 'SET_UNAUTHENTICATED' }
  | { type: 'EXTEND_SESSION'; payload: number };

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  masterKey: null,
  sessionTimeout: 0
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        masterKey: action.payload.masterKey,
        sessionTimeout: action.payload.timeout
      };
    
    case 'SET_UNAUTHENTICATED':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        masterKey: null,
        sessionTimeout: 0
      };
    
    case 'EXTEND_SESSION':
      return {
        ...state,
        sessionTimeout: action.payload
      };
    
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    initializeStorage();
  }, []);

  useEffect(() => {
    if (state.isAuthenticated && state.sessionTimeout > 0) {
      const timeUntilLogout = state.sessionTimeout - Date.now();
      
      if (timeUntilLogout <= 0) {
        logout();
        return;
      }
      
      const timer = setTimeout(() => {
        logout();
      }, timeUntilLogout);

      return () => clearTimeout(timer);
    }
  }, [state.sessionTimeout]);

  const initializeStorage = async () => {
    try {
      await storage.init();
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  };

  const isSetupRequired = async (): Promise<boolean> => {
    try {
      const setupCompleted = await storage.isSetupCompleted();
      return !setupCompleted;
    } catch (error) {
      console.error('Error checking setup status:', error);
      return true;
    }
  };

  const setupUser = async (password: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const salt = await generateSalt();
      const masterKeyHash = await hashPassword(password, salt);
      const masterKey = await deriveKey(password, salt);
      
      const user: User = {
        masterKeyHash,
        salt: arrayToBase64(salt),
        setupCompleted: true,
        createdAt: new Date()
      };
      
      await storage.saveUser(user);
      
      const sessionTimeout = Date.now() + (30 * 60 * 1000); // 30 minutes
      dispatch({ 
        type: 'SET_AUTHENTICATED', 
        payload: { masterKey, timeout: sessionTimeout }
      });
      
    } catch (error) {
      dispatch({ type: 'SET_UNAUTHENTICATED' });
      if (error instanceof CryptoError || error instanceof StorageError) {
        throw error;
      }
      throw new Error('Setup failed');
    }
  };

  const login = async (password: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      console.log('Login: Getting user from storage');
      const user = await storage.getUser();
      if (!user) {
        throw new Error('User not found. Setup required.');
      }
      
      console.log('Login: User found, salt:', user.salt);
      const salt = base64ToArray(user.salt);
      console.log('Login: Salt decoded, hashing password');
      const passwordHash = await hashPassword(password, salt);
      
      console.log('Login: Generated hash:', passwordHash);
      console.log('Login: Stored hash:', user.masterKeyHash);
      
      if (passwordHash !== user.masterKeyHash) {
        throw new Error('Invalid password');
      }
      
      console.log('Login: Password verified, deriving key');
      const masterKey = await deriveKey(password, salt);
      const sessionTimeout = Date.now() + (30 * 60 * 1000); // 30 minutes
      
      console.log('Login: Setting authenticated state');
      dispatch({ 
        type: 'SET_AUTHENTICATED', 
        payload: { masterKey, timeout: sessionTimeout }
      });
      
    } catch (error) {
      console.error('Login error in context:', error);
      dispatch({ type: 'SET_UNAUTHENTICATED' });
      if (error instanceof CryptoError || error instanceof StorageError) {
        throw error;
      }
      throw new Error('Login failed');
    }
  };

  const logout = (): void => {
    dispatch({ type: 'SET_UNAUTHENTICATED' });
  };

  const extendSession = (): void => {
    if (state.isAuthenticated) {
      const newTimeout = Date.now() + (30 * 60 * 1000); // Extend by 30 minutes
      dispatch({ type: 'EXTEND_SESSION', payload: newTimeout });
    }
  };

  const value: AuthContextType = {
    state,
    login,
    logout,
    setupUser,
    isSetupRequired,
    extendSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}