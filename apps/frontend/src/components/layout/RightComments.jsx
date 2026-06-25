'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Send, MessageSquare } from 'lucide-react';
import { fetchComments, addComment, deleteComment } from '@/store/slices/commentsSlice';

export default function RightComments({ activeSection }) {
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  const currentUser = useSelector(s => s.ui.currentUser);
  const comments = useSelector(s => s.comments.bySection[activeSection]) || [];

  useEffect(() => {
    if (activeSection) {
      dispatch(fetchComments(activeSection));
    }
  }, [dispatch, activeSection]);

  const handleAddComment = async () => {
    if (!text.trim() || !currentUser) return;
    try {
      await dispatch(addComment({ section: activeSection, text: text.trim() })).unwrap();
      setText('');
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteComment(id)).unwrap();
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
    setConfirmDelete(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  if (!currentUser) return null;

  return (
    <aside className="doc-right-panel">
      {confirmDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '300px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>Confirm Deletion</h3>
            <p style={{ marginBottom: '24px', color: '#666' }}>Are you sure you want to delete this comment?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: '8px 16px', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ padding: '8px 16px', border: 'none', background: '#f44336', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="doc-right-panel__header">
        <MessageSquare size={15} />
        <span>Comments ({comments.length})</span>
      </div>

      <div className="doc-right-panel__list">
        {comments.length === 0 && (
          <p className="doc-right-panel__empty">No comments yet for this page.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="right-comment" style={{ position: 'relative', opacity: c.isDeleted ? 0.6 : 1 }}>
            <div className="right-comment__header">
              <span className="right-comment__author" style={{ textDecoration: c.isDeleted ? 'line-through' : 'none' }}>{c.authorName}</span>
              <span className="right-comment__time">{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            {!c.isDeleted && (c.authorId === currentUser.id || currentUser.role === 'ADMIN') && (
              <button 
                className="right-comment__delete"
                onClick={() => setConfirmDelete(c.id)}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '12px' }}
                title="Delete comment"
              >
                ✕
              </button>
            )}
            <p className="right-comment__text" style={{ fontStyle: c.isDeleted ? 'italic' : 'normal', color: c.isDeleted ? '#888' : 'inherit' }}>
              {c.isDeleted ? `[Deleted by @${c.authorName}]` : c.text}
            </p>
          </div>
        ))}
      </div>

      <div className="doc-right-panel__form">
        <input
          className="doc-right-panel__input"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="doc-right-panel__send" onClick={handleAddComment} disabled={!text.trim()}>
          <Send size={14} />
        </button>
      </div>
    </aside>
  );
}
