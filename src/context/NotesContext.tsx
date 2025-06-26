import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Note, EncryptedNote, NoteFormData } from '../types';
import { encryptNote, decryptNote, CryptoError } from '../utils/crypto';
import { storage, StorageError } from '../utils/storage';
import { useAuth } from './AuthContext';

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedNoteId: string | null;
}

interface NotesContextType {
  state: NotesState;
  createNote: (noteData: NoteFormData) => Promise<void>;
  updateNote: (id: string, noteData: Partial<NoteFormData>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  selectNote: (id: string | null) => void;
  searchNotes: (query: string) => void;
  refreshNotes: () => Promise<void>;
  getFilteredNotes: () => Note[];
}

type NotesAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_NOTE'; payload: string | null };

const initialState: NotesState = {
  notes: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedNoteId: null
};

function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_NOTES':
      return { ...state, notes: action.payload, isLoading: false };
    
    case 'ADD_NOTE':
      return { 
        ...state, 
        notes: [action.payload, ...state.notes],
        isLoading: false 
      };
    
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note => 
          note.id === action.payload.id ? action.payload : note
        ),
        isLoading: false
      };
    
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload),
        selectedNoteId: state.selectedNoteId === action.payload ? null : state.selectedNoteId,
        isLoading: false
      };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_SELECTED_NOTE':
      return { ...state, selectedNoteId: action.payload };
    
    default:
      return state;
  }
}

const NotesContext = createContext<NotesContextType | null>(null);

export function useNotes(): NotesContextType {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}

interface NotesProviderProps {
  children: ReactNode;
}

export function NotesProvider({ children }: NotesProviderProps) {
  const [state, dispatch] = useReducer(notesReducer, initialState);
  const { state: authState } = useAuth();

  useEffect(() => {
    if (authState.isAuthenticated && authState.masterKey) {
      loadNotes();
    } else {
      dispatch({ type: 'SET_NOTES', payload: [] });
    }
  }, [authState.isAuthenticated, authState.masterKey]);

  const loadNotes = async (): Promise<void> => {
    if (!authState.masterKey) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const encryptedNotes = await storage.getAllNotes();
      const decryptedNotes: Note[] = [];

      for (const encryptedNote of encryptedNotes) {
        try {
          const { title, content } = await decryptNote(
            encryptedNote.encryptedTitle,
            encryptedNote.encryptedContent,
            encryptedNote.iv,
            authState.masterKey
          );

          const note: Note = {
            id: encryptedNote.id,
            title,
            content,
            createdAt: encryptedNote.createdAt,
            updatedAt: encryptedNote.updatedAt,
            encrypted: false
          };

          decryptedNotes.push(note);
        } catch (error) {
          console.error(`Failed to decrypt note ${encryptedNote.id}:`, error);
        }
      }

      dispatch({ type: 'SET_NOTES', payload: decryptedNotes });
    } catch (error) {
      const message = error instanceof StorageError ? error.message : 'Failed to load notes';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const createNote = async (noteData: NoteFormData): Promise<void> => {
    if (!authState.masterKey) {
      throw new Error('Not authenticated');
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const id = crypto.randomUUID();
      const now = new Date();
      
      const { encryptedTitle, encryptedContent, iv } = await encryptNote(
        noteData.title,
        noteData.content,
        authState.masterKey
      );

      const encryptedNote: EncryptedNote = {
        id,
        encryptedTitle,
        encryptedContent,
        iv,
        salt: '', // Use the user's salt from auth
        createdAt: now,
        updatedAt: now
      };

      await storage.saveNote(encryptedNote);

      const note: Note = {
        id,
        title: noteData.title,
        content: noteData.content,
        createdAt: now,
        updatedAt: now,
        encrypted: false
      };

      dispatch({ type: 'ADD_NOTE', payload: note });
    } catch (error) {
      const message = error instanceof CryptoError || error instanceof StorageError 
        ? error.message 
        : 'Failed to create note';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const updateNote = async (id: string, noteData: Partial<NoteFormData>): Promise<void> => {
    if (!authState.masterKey) {
      throw new Error('Not authenticated');
    }

    const existingNote = state.notes.find(note => note.id === id);
    if (!existingNote) {
      throw new Error('Note not found');
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const updatedNote = {
        ...existingNote,
        ...noteData,
        updatedAt: new Date()
      };

      const { encryptedTitle, encryptedContent, iv } = await encryptNote(
        updatedNote.title,
        updatedNote.content,
        authState.masterKey
      );

      const encryptedNote: EncryptedNote = {
        id,
        encryptedTitle,
        encryptedContent,
        iv,
        salt: '',
        createdAt: existingNote.createdAt,
        updatedAt: updatedNote.updatedAt
      };

      await storage.saveNote(encryptedNote);
      dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
    } catch (error) {
      const message = error instanceof CryptoError || error instanceof StorageError 
        ? error.message 
        : 'Failed to update note';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const deleteNote = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await storage.deleteNote(id);
      dispatch({ type: 'DELETE_NOTE', payload: id });
    } catch (error) {
      const message = error instanceof StorageError ? error.message : 'Failed to delete note';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const selectNote = (id: string | null): void => {
    dispatch({ type: 'SET_SELECTED_NOTE', payload: id });
  };

  const searchNotes = (query: string): void => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const refreshNotes = async (): Promise<void> => {
    await loadNotes();
  };

  const getFilteredNotes = (): Note[] => {
    if (!state.searchQuery) {
      return state.notes;
    }

    const query = state.searchQuery.toLowerCase();
    return state.notes.filter(note => 
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  };

  const value: NotesContextType = {
    state,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    searchNotes,
    refreshNotes,
    getFilteredNotes
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}