import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotesProvider } from './context/NotesContext';
import { AuthScreen } from './components/Auth/AuthScreen';
import { NotesManager } from './components/Notes/NotesManager';
import { storage } from './utils/storage';

function SecureNotesApp() {
  const { state } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await storage.init();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem',
        fontWeight: '500'
      }}>
        🔐 セキュアメモアプリ - 初期化中...
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <AuthScreen onAuthenticated={() => {}} />;
  }

  return (
    <NotesProvider>
      <NotesManager />
    </NotesProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <SecureNotesApp />
    </AuthProvider>
  );
}

export default App;