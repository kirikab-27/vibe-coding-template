import React, { useState } from 'react';
import { useNotes } from '../../context/NotesContext';
import { useAuth } from '../../context/AuthContext';
import { Note, NoteFormData } from '../../types';

export function NotesManager() {
  const { state: notesState, createNote, updateNote, deleteNote, selectNote, searchNotes, getFilteredNotes } = useNotes();
  const { logout, extendSession } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState<NoteFormData>({ title: '', content: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredNotes = getFilteredNotes();

  const handleCreateNote = () => {
    setFormData({ title: '', content: '' });
    setEditingNote(null);
    setIsCreating(true);
    setIsEditing(true);
    setShowEditModal(true);
    selectNote(null);
  };

  const handleEditNote = (note: Note) => {
    setFormData({ title: note.title, content: note.content });
    setEditingNote(note);
    setIsCreating(false);
    setIsEditing(true);
    setShowEditModal(true);
    extendSession();
  };

  const handleSaveNote = async () => {
    if (!formData.title.trim()) {
      return;
    }

    try {
      if (isCreating) {
        await createNote(formData);
      } else if (editingNote) {
        await updateNote(editingNote.id, formData);
      }
      
      setIsEditing(false);
      setEditingNote(null);
      setIsCreating(false);
      setShowEditModal(false);
      setFormData({ title: '', content: '' });
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingNote(null);
    setIsCreating(false);
    setShowEditModal(false);
    setFormData({ title: '', content: '' });
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('このメモを削除してもよろしいですか？')) {
      try {
        await deleteNote(id);
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <header style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '1rem 0'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            🔐 セキュアメモ
          </h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="メモを検索..."
              value={notesState.searchQuery}
              onChange={(e) => searchNotes(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                width: '200px'
              }}
            />
            <button
              onClick={logout}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>
      
      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={handleCreateNote}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          >
            ➕ 新規作成
          </button>
        </div>

        {notesState.isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280' }}>読み込み中...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280' }}>
              {notesState.searchQuery ? '検索結果がありません' : 'メモがありません。新規作成してください。'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {filteredNotes.map(note => (
              <div
                key={note.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                  position: 'relative'
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'}
                onClick={() => handleEditNote(note)}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{ fontWeight: '600', fontSize: '1.125rem' }}>
                    {note.title || '無題のメモ'}
                  </h3>
                  <span title="暗号化済み">🔒</span>
                </div>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.5'
                }}>
                  {note.content || '内容がありません'}
                </p>
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#9ca3af'
                }}>
                  {new Date(note.updatedAt).toLocaleDateString('ja-JP')}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: '#ef4444',
                    fontSize: '1rem',
                    opacity: 0.7,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                  title="削除"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        {notesState.error && (
          <div style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '0.375rem',
            padding: '1rem',
            color: '#dc2626',
            fontSize: '0.875rem',
            maxWidth: '300px'
          }}>
            {notesState.error}
          </div>
        )}
      </main>

      {/* 編集モーダル */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '2rem',
            maxWidth: '40rem',
            width: '100%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {isCreating ? '新規メモ作成' : 'メモを編集'}
            </h2>
            
            <input
              type="text"
              placeholder="タイトル"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                marginBottom: '1rem',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
            
            <textarea
              placeholder="内容を入力..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                minHeight: '200px',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
            
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!formData.title.trim()}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: formData.title.trim() ? '#3b82f6' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: formData.title.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => formData.title.trim() && (e.currentTarget.style.backgroundColor = '#2563eb')}
                onMouseOut={(e) => formData.title.trim() && (e.currentTarget.style.backgroundColor = '#3b82f6')}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}