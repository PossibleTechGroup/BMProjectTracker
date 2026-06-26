'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPlatform, deletePlatform } from '@/store/slices/platformsSlice';
import { useEdit } from '@/components/common/EditContext';
import { Breadcrumb } from './SharedHelpers';
import Modal from '@/components/common/Modal';

export function GranularDocsLanding({ onSelect }) {
  const dispatch = useDispatch();
  const platforms = useSelector(s => s.platforms.items) || [];
  const { editing } = useEdit();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await dispatch(createPlatform({
      projectId: 1,
      name: newName,
      slug: newName.toLowerCase().replace(/\s+/g, '-'),
      type: 'web',
      status: 'active',
      description: '',
      repoUrl: '',
      figmaUrl: '',
      postmanUrl: '',
      customUrl: '',
      order: platforms.length,
    }));
    setNewName('');
    setShowAdd(false);
  };

  return (
    <section className="doc-section doc-section--animate">
      <Breadcrumb items={[{ label: 'Platform Documentation', id: 'granular-docs' }]} onSelect={onSelect} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 className="doc-section__title" style={{ margin: 0 }}>Platform Documentation</h1>
        {!showAdd && (
          <button
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', background: '#764ABC', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 150ms ease',
              boxShadow: '0 1px 3px rgba(118,74,188,0.3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#593D8F'; e.currentTarget.style.boxShadow = '0 3px 8px rgba(118,74,188,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#764ABC'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(118,74,188,0.3)'; }}
            onClick={() => setShowAdd(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Platform
          </button>
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setNewName(''); }} title="Create a new platform">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            style={{
              width: '100%', padding: '10px 14px', border: '1px solid #c8e6c9', borderRadius: 6,
              fontSize: 14, outline: 'none'
            }}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Enter platform name..."
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              style={{ padding: '10px 22px', background: '#1a5c32', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
              onClick={handleAdd}
            >
              Save
            </button>
            <button
              style={{ padding: '10px 22px', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
              onClick={() => { setShowAdd(false); setNewName(''); }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <div style={{ marginBottom: 16, fontSize: 14, color: '#666' }}>
        {platforms.length} platform{platforms.length !== 1 ? 's' : ''} available
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {platforms.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(`platform-${p.id}`)}
            style={{
              textAlign: 'left', cursor: 'pointer', width: '100%',
              padding: 0, border: '1px solid #e8e8e8', borderRadius: 12,
              background: '#fff', overflow: 'hidden',
              transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#1a5c32'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e8e8e8'; }}
          >
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a' }}>{p.name}</div>
                <span style={{
                  background: '#f0faf3', color: '#1a5c32', fontSize: 12, fontWeight: 600,
                  padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap'
                }}>
                  {(p.features || []).length} feature{(p.features || []).length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#999' }}>
                <span>🔧 {p.type || 'web'}</span>
                <span>📌 {p.status || 'active'}</span>
              </div>
              {editing && (
                <button
                  style={{ marginTop: 8, padding: '4px 12px', background: '#fff', color: '#e53935', border: '1px solid #e53935', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
                  onClick={e => { e.stopPropagation(); if (confirm(`Delete platform "${p.name}" and all its data?`)) { dispatch(deletePlatform(p.id)); } }}
                >
                  Delete
                </button>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
