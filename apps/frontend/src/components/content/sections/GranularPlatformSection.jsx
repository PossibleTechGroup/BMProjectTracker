'use client';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePlatformAsync, deletePlatform, createFeature, deleteFeature } from '@/store/slices/platformsSlice';
import { useEdit } from '@/components/common/EditContext';
import { Breadcrumb, toAbsoluteUrl } from './SharedHelpers';
import { ReviewStatusBadge } from '@/components/common/EntityWidgets';

export function GranularPlatformSection({ platformId, onSelect }) {
  const dispatch = useDispatch();
  const platform = useSelector(s => s.platforms.items.find(p => p.id === platformId));
  const { editing } = useEdit();

  const [showAddFeature, setShowAddFeature] = useState(false);
  const [newFeatureTitle, setNewFeatureTitle] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');

  const [linkDrafts, setLinkDrafts] = useState({});
  const [descDraft, setDescDraft] = useState(null);
  const prevEditing = useRef(editing);

  if (!platform) return <p>Loading or not found...</p>;

  useEffect(() => {
    const wasEditing = prevEditing.current;
    prevEditing.current = editing;

    if (wasEditing && !editing) {
      const updates = {};
      Object.entries(linkDrafts).forEach(([key, val]) => {
        if (val !== platform[key]) updates[key] = val;
      });
      if (descDraft !== null && descDraft !== (platform.description || '')) {
        updates.description = descDraft;
      }
      if (Object.keys(updates).length) {
        dispatch(updatePlatformAsync({ id: platform.id, ...updates }));
      }
      setLinkDrafts({});
      setDescDraft(null);
    } else if (editing) {
      setDescDraft(platform.description || '');
    }
  }, [editing]);

  const handleAddFeature = async () => {
    if (!newFeatureTitle.trim()) return;
    await dispatch(createFeature({
      projectId: 1,
      platformId: platform.id,
      title: newFeatureTitle,
      description: newFeatureDesc,
      order: (platform.features || []).length,
      color: '#1A5C32',
    }));
    setNewFeatureTitle('');
    setNewFeatureDesc('');
    setShowAddFeature(false);
  };

  const linkFields = [
    { key: 'repoUrl', label: 'Repository', icon: '📦', placeholder: 'https://github.com/org/repo' },
    { key: 'figmaUrl', label: 'Figma', icon: '🎨', placeholder: 'https://figma.com/file/...' },
    { key: 'postmanUrl', label: 'Postman', icon: '📮', placeholder: 'https://postman.com/...' },
    { key: 'customUrl', label: 'Custom', icon: '🔗', placeholder: 'https://example.com/...' },
  ];

  const descriptionParagraphs = (platform.description || '').split('\n').filter(p => p.trim());

  return (
    <section className="doc-section doc-section--animate">
      <Breadcrumb items={[{ label: 'Documentation', id: 'granular-docs' }, platform.name]} onSelect={onSelect} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 className="doc-section__title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            {platform.name}
            <ReviewStatusBadge entityKey={`platform-${platform.id}`} />
          </h1>
          <span style={{ fontSize: 13, color: '#888' }}>{platform.type} · {platform.status}</span>
        </div>
        {editing && (
          <button
            style={{ padding: '6px 14px', background: '#fff', color: '#e53935', border: '1px solid #e53935', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            onClick={() => { if (confirm(`Delete platform "${platform.name}" and all its data?`)) { dispatch(deletePlatform(platform.id)); onSelect('granular-docs'); } }}
          >
            Delete Platform
          </button>
        )}
      </div>

      <div style={{ background: '#f9fafb', borderRadius: 10, padding: 16, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#333' }}>🔗 Quick Links</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {linkFields.map(({ key, label, icon, placeholder }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 80, fontSize: 13, color: '#666' }}>{icon} {label}</span>
              {editing ? (
                <input
                  style={{ flex: 1, padding: '6px 10px', border: '1px solid #c8e6c9', borderRadius: 4, fontSize: 13, outline: 'none' }}
                  value={linkDrafts[key] !== undefined ? linkDrafts[key] : (platform[key] || '')}
                  onChange={e => setLinkDrafts(d => ({ ...d, [key]: e.target.value }))}
                  placeholder={placeholder}
                />
              ) : platform[key] ? (
                <a href={toAbsoluteUrl(platform[key])} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: 13, color: '#1a5c32', textDecoration: 'none' }}>
                  {platform[key]}
                </a>
              ) : (
                <span style={{ flex: 1, fontSize: 13, color: '#bbb' }}>Not set</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <h2 className="doc-section__heading" style={{ marginTop: 0 }}>Platform Description</h2>
        {editing ? (
          <div>
            <textarea
              style={{
                width: '100%', minHeight: 200, padding: '14px 16px',
                border: '1px solid #c8e6c9', borderRadius: 8, fontSize: 14,
                lineHeight: 1.8, fontFamily: 'inherit', color: '#333',
                outline: 'none', resize: 'vertical', background: '#fafcfb',
              }}
              value={descDraft !== null ? descDraft : (platform.description || '')}
              onChange={e => setDescDraft(e.target.value)}
              placeholder="Write a detailed description of this platform..."
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
              💡 Use line breaks to separate sections. Changes auto-save when you exit edit mode.
            </div>
          </div>
        ) : descriptionParagraphs.length > 0 ? (
          <div>
            {descriptionParagraphs.map((para, i) => {
              if (para.startsWith('## ')) return <h4 key={i} style={{ fontSize: 16, fontWeight: 600, color: '#333', margin: '20px 0 8px 0' }}>{para.slice(3)}</h4>;
              if (para.startsWith('# ')) return <h3 key={i} style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: '24px 0 10px 0' }}>{para.slice(2)}</h3>;
              if (para.startsWith('• ') || para.startsWith('- ')) {
                const parts = para.slice(2).split(' — ');
                return (
                  <div key={i} style={{ paddingLeft: 16, marginBottom: 8, fontSize: 15, lineHeight: 1.7, color: '#555', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#764ABC', fontWeight: 700 }}>•</span>
                    {parts.length > 1 ? <><strong style={{ color: '#333' }}>{parts[0]}</strong> — {parts.slice(1).join(' — ')}</> : para.slice(2)}
                  </div>
                );
              }
              return <p key={i} className="doc-section__text">{para}</p>;
            })}
          </div>
        ) : (
          <p style={{ fontSize: 14, color: '#999', fontStyle: 'italic' }}>No description yet. Click "Edit" to add a detailed platform description.</p>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 className="doc-section__heading" style={{ margin: 0 }}>Features</h2>
        {editing && !showAddFeature && (
          <button
            style={{ padding: '6px 16px', background: '#1a5c32', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            onClick={() => setShowAddFeature(true)}
          >
            + Add Feature
          </button>
        )}
      </div>

      {editing && showAddFeature && (
        <div style={{ background: '#f0faf3', border: '1px solid #c8e6c9', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a5c32', marginBottom: 10 }}>New Feature</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              style={{ padding: '8px 12px', border: '1px solid #c8e6c9', borderRadius: 6, fontSize: 13, outline: 'none' }}
              value={newFeatureTitle}
              onChange={e => setNewFeatureTitle(e.target.value)}
              placeholder="Feature title..."
              autoFocus
            />
            <input
              style={{ padding: '8px 12px', border: '1px solid #c8e6c9', borderRadius: 6, fontSize: 13, outline: 'none' }}
              value={newFeatureDesc}
              onChange={e => setNewFeatureDesc(e.target.value)}
              placeholder="Short description (optional)"
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: '8px 18px', background: '#1a5c32', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }} onClick={handleAddFeature}>Save</button>
              <button style={{ padding: '8px 18px', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13 }} onClick={() => { setShowAddFeature(false); setNewFeatureTitle(''); setNewFeatureDesc(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(platform.features || []).map(feat => (
          <div key={feat.id} style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
            <button
              style={{ flex: 1, textAlign: 'left', padding: '12px 16px', background: '#f9fafb', borderRadius: 8, border: '1px solid #eee', cursor: 'pointer' }}
              onClick={() => onSelect(`feature-${feat.id}`)}
            >
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: feat.color || '#764ABC', marginRight: 8 }} />
                {feat.title || feat.name}
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>{feat.description}</div>
            </button>
            {editing && (
              <button
                style={{ flexShrink: 0, padding: '0 14px', background: '#fff', color: '#e53935', border: '1px solid #e53935', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                title="Delete feature"
                onClick={() => { if (confirm(`Delete feature "${feat.title || feat.name}" and all its subtasks?`)) dispatch(deleteFeature(feat.id)); }}
              >
                Delete
              </button>
            )}
          </div>
        ))}
        {(!platform.features || platform.features.length === 0) && (
          <p style={{ fontSize: 14, color: '#999', textAlign: 'center', padding: 20 }}>No features yet.</p>
        )}
      </div>

    </section>
  );
}
