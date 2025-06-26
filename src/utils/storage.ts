import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { EncryptedNote, User, UserWithId, StorageMetadata, ErrorCode } from '../types';

interface SecureNotesDB extends DBSchema {
  notes: {
    key: string;
    value: EncryptedNote;
    indexes: { 'by-date': Date };
  };
  user: {
    key: string;
    value: UserWithId;
  };
  metadata: {
    key: string;
    value: StorageMetadata;
  };
}

export class StorageError extends Error {
  constructor(message: string, public code: ErrorCode = ErrorCode.STORAGE_ERROR) {
    super(message);
    this.name = 'StorageError';
  }
}

class SecureStorage {
  private db: IDBPDatabase<SecureNotesDB> | null = null;
  private readonly dbName = 'SecureNotesDB';
  private readonly version = 1;

  async init(): Promise<void> {
    try {
      this.db = await openDB<SecureNotesDB>(this.dbName, this.version, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('notes')) {
            const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
            notesStore.createIndex('by-date', 'createdAt');
          }

          if (!db.objectStoreNames.contains('user')) {
            db.createObjectStore('user', { keyPath: 'id' });
          }

          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'key' });
          }
        }
      });

      await this.initMetadata();
    } catch (error) {
      throw new StorageError('Failed to initialize database');
    }
  }

  private async initMetadata(): Promise<void> {
    if (!this.db) throw new StorageError('Database not initialized');

    const existing = await this.db.get('metadata', 'app');
    if (!existing) {
      const metadata: StorageMetadata = {
        version: '1.0.0',
        createdAt: new Date(),
        lastSync: new Date(),
        noteCount: 0
      };
      await this.db.put('metadata', { ...metadata, key: 'app' });
    }
  }

  async saveNote(note: EncryptedNote): Promise<void> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      await this.db.put('notes', note);
      await this.updateNoteCount();
    } catch (error) {
      throw new StorageError(`Failed to save note: ${note.id}`);
    }
  }

  async getNote(id: string): Promise<EncryptedNote | null> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      const note = await this.db.get('notes', id);
      return note || null;
    } catch (error) {
      throw new StorageError(`Failed to get note: ${id}`);
    }
  }

  async getAllNotes(): Promise<EncryptedNote[]> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      return await this.db.getAllFromIndex('notes', 'by-date');
    } catch (error) {
      throw new StorageError('Failed to get all notes');
    }
  }

  async deleteNote(id: string): Promise<void> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      await this.db.delete('notes', id);
      await this.updateNoteCount();
    } catch (error) {
      throw new StorageError(`Failed to delete note: ${id}`);
    }
  }

  async getNotesByDateRange(startDate: Date, endDate: Date): Promise<EncryptedNote[]> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      const allNotes = await this.getAllNotes();
      return allNotes.filter(
        note => note.createdAt >= startDate && note.createdAt <= endDate
      );
    } catch (error) {
      throw new StorageError('Failed to get notes by date range');
    }
  }

  async saveUser(user: User): Promise<void> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      await this.db.put('user', { ...user, id: 'main' });
    } catch (error) {
      throw new StorageError('Failed to save user data');
    }
  }

  async getUser(): Promise<User | null> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      const user = await this.db.get('user', 'main');
      return user || null;
    } catch (error) {
      throw new StorageError('Failed to get user data');
    }
  }

  async isSetupCompleted(): Promise<boolean> {
    try {
      const user = await this.getUser();
      return user?.setupCompleted || false;
    } catch (error) {
      return false;
    }
  }

  async getMetadata(): Promise<StorageMetadata | null> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      const metadata = await this.db.get('metadata', 'app');
      return metadata || null;
    } catch (error) {
      throw new StorageError('Failed to get metadata');
    }
  }

  private async updateNoteCount(): Promise<void> {
    if (!this.db) return;

    try {
      const count = await this.db.count('notes');
      const metadata = await this.getMetadata();
      
      if (metadata) {
        await this.db.put('metadata', {
          ...metadata,
          noteCount: count,
          lastSync: new Date(),
          key: 'app'
        });
      }
    } catch (error) {
      console.warn('Failed to update note count');
    }
  }

  async clearAllData(): Promise<void> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      const tx = this.db.transaction(['notes', 'user', 'metadata'], 'readwrite');
      await tx.objectStore('notes').clear();
      await tx.objectStore('user').clear();
      await tx.objectStore('metadata').clear();
      await tx.done;
      
      await this.initMetadata();
    } catch (error) {
      throw new StorageError('Failed to clear all data');
    }
  }

  async exportData(): Promise<{
    notes: EncryptedNote[];
    metadata: StorageMetadata | null;
    exportDate: Date;
  }> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      const notes = await this.getAllNotes();
      const metadata = await this.getMetadata();
      
      return {
        notes,
        metadata,
        exportDate: new Date()
      };
    } catch (error) {
      throw new StorageError('Failed to export data');
    }
  }

  async importData(data: {
    notes: EncryptedNote[];
    metadata?: StorageMetadata;
  }): Promise<void> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      const tx = this.db.transaction(['notes', 'metadata'], 'readwrite');
      
      for (const note of data.notes) {
        await tx.objectStore('notes').put(note);
      }
      
      if (data.metadata) {
        await tx.objectStore('metadata').put({
          ...data.metadata,
          lastSync: new Date(),
          key: 'app'
        });
      }
      
      await tx.done;
    } catch (error) {
      throw new StorageError('Failed to import data');
    }
  }

  async getStorageUsage(): Promise<{
    used: number;
    available: number;
    percentage: number;
  }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const available = estimate.quota || 0;
        const percentage = available > 0 ? (used / available) * 100 : 0;
        
        return { used, available, percentage };
      }
      
      return { used: 0, available: 0, percentage: 0 };
    } catch (error) {
      throw new StorageError('Failed to get storage usage');
    }
  }
}

export const storage = new SecureStorage();