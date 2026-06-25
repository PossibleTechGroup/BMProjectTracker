'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveEdit } from '@/store/slices/editDataSlice';
import { updateProjectField, addSupplementaryDoc, updateSupplementaryDoc, deleteSupplementaryDoc } from '@/store/slices/projectSlice';
import { updateFeatureRequestAsync, createFeatureRequest, deleteFeatureRequest, fetchFeatureRequests } from '@/store/slices/featuresSlice';
import { deleteBug, createBug, updateBugAsync } from '@/store/slices/bugsSlice';
import { deleteQAStory, fetchQAByPlatform, createQAStory, updateQAStoryAsync } from '@/store/slices/qaSlice';
import { createPlatform, deletePlatform, createFeature, updatePlatformAsync, updateFeature, deleteFeature, createSubTask, updateSubTaskAsync, deleteSubTask } from '@/store/slices/platformsSlice';
import { fetchUsers } from '@/store/slices/usersSlice';
import { fetchStatuses, fetchSeverities } from '@/store/slices/statusesSlice';
import { apiFetch } from '@/lib/api';
import EditableField from '@/components/common/EditableField';
import { useEdit } from '@/components/common/EditContext';
import { Pencil } from 'lucide-react';

/* ============================================================
   Shared UI Helpers
   ============================================================ */
function Breadcrumb({ items, onSelect }) {
  return (
    <div className="doc-breadcrumb">
      <button className="doc-breadcrumb__home" onClick={() => onSelect && onSelect('overview')}>🏠</button>
      {items.map((item, i) => {
        const label = typeof item === 'string' ? item : item.label;
        const id = typeof item === 'string' ? null : item.id;
        return (
          <span key={i}>
            <span className="doc-breadcrumb__sep">›</span>
            {i === items.length - 1 ? (
              <span className="doc-breadcrumb__current">{label}</span>
            ) : id && onSelect ? (
              <button className="doc-breadcrumb__link" onClick={() => onSelect(id)}>{label}</button>
            ) : (
              <span>{label}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function Callout({ header, items }) {
  return (
    <div className="doc-callout">
      <div className="doc-callout__header">{header}</div>
      <ul className="doc-callout__list">
        {items.map((item, i) => <li key={i}>{typeof item === 'string' ? item : item}</li>)}
      </ul>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = status ? status.toLowerCase() : 'pending';
  const cls = s === 'done' || s === 'resolved' || s === 'passed' ? 'badge--done' :
    s === 'in-progress' ? 'badge--in-progress' :
      s === 'review' ? 'badge--review' : 'badge--pending';
  return <span className={`doc-badge ${cls}`}>{status || 'Pending'}</span>;
}

import { ReviewStatusBadge, ReviewOverlay } from '@/components/common/EntityWidgets';


function FeatureBar({ color }) {
  return <span className="feature-bar" style={{ background: color || '#2196F3' }} />;
}

// Ensure a user-entered URL is absolute so it isn't resolved relative to the current host.
function toAbsoluteUrl(url) {
  if (!url) return url;
  const trimmed = url.trim();
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function PrevNextNav({ activeSection, onSelect }) {
  return null; // Dynamic sequences can be built if needed, but removed static docSequence
}

/* ============================================================
   Dynamic Views from Redux
   ============================================================ */

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
        {editing && !showAdd && (
          <button
            className="doc-badge badge--done"
            style={{ cursor: 'pointer', border: 'none', padding: '8px 18px', fontSize: 14, borderRadius: 6, fontWeight: 600 }}
            onClick={() => setShowAdd(true)}
          >
            + New Platform
          </button>
        )}
      </div>

      {editing && showAdd && (
        <div style={{
          background: '#f0faf3', border: '1px solid #c8e6c9', borderRadius: 10, padding: '20px',
          marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1a5c32', marginBottom: 12 }}>Create a new platform</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              style={{
                flex: 1, padding: '10px 14px', border: '1px solid #c8e6c9', borderRadius: 6,
                fontSize: 14, outline: 'none', background: '#fff'
              }}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Enter platform name..."
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setShowAdd(false); setNewName(''); } }}
            />
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
      )}

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

export function GranularPlatformSection({ platformId, onSelect }) {
  const dispatch = useDispatch();
  const platform = useSelector(s => s.platforms.items.find(p => p.id === platformId));
  const { editing } = useEdit();

  const [showAddFeature, setShowAddFeature] = useState(false);
  const [newFeatureTitle, setNewFeatureTitle] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');

  const [linkDrafts, setLinkDrafts] = useState({});
  const [descDraft, setDescDraft] = useState(null);

  if (!platform) return <p>Loading or not found...</p>;

  useEffect(() => {
    if (!editing) {
      const updates = {};
      // save link drafts
      Object.entries(linkDrafts).forEach(([key, val]) => {
        if (val !== platform[key]) updates[key] = val;
      });
      // save description draft
      if (descDraft !== null && descDraft !== (platform.description || '')) {
        updates.description = descDraft;
      }
      if (Object.keys(updates).length) {
        dispatch(updatePlatformAsync({ id: platform.id, ...updates }));
      }
      setLinkDrafts({});
      setDescDraft(null);
    } else {
      // entering edit mode — seed the description draft
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

  // Split description into paragraphs for rendering
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

      {/* Links Section */}
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

      {/* Platform Description Section */}
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
              placeholder="Write a detailed description of this platform...&#10;&#10;For example:&#10;• Login & Authentication — How users log in, session handling, etc.&#10;• Dashboard — What the main dashboard shows&#10;• User Management — How admins manage users&#10;• Settings — Configuration options available&#10;&#10;Use line breaks to separate sections. Changes save when you exit edit mode."
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
              💡 Use line breaks to separate sections. Changes auto-save when you exit edit mode.
            </div>
          </div>
        ) : descriptionParagraphs.length > 0 ? (
          <div>
            {descriptionParagraphs.map((para, i) => {
              // Support simple headings: lines starting with "# " or "## "
              if (para.startsWith('## ')) {
                return <h4 key={i} style={{ fontSize: 16, fontWeight: 600, color: '#333', margin: '20px 0 8px 0' }}>{para.slice(3)}</h4>;
              }
              if (para.startsWith('# ')) {
                return <h3 key={i} style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: '24px 0 10px 0' }}>{para.slice(2)}</h3>;
              }
              // Support bullet points: lines starting with "• " or "- "
              if (para.startsWith('• ') || para.startsWith('- ')) {
                const parts = para.slice(2).split(' — ');
                return (
                  <div key={i} style={{ paddingLeft: 16, marginBottom: 8, fontSize: 15, lineHeight: 1.7, color: '#555', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#764ABC', fontWeight: 700 }}>•</span>
                    {parts.length > 1 ? (
                      <><strong style={{ color: '#333' }}>{parts[0]}</strong> — {parts.slice(1).join(' — ')}</>
                    ) : para.slice(2)}
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

      {/* Features Section */}
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



      <ReviewOverlay entityKey={`platform-${platform.id}`} />
    </section>
  );
}

export function GranularFeatureSection({ featureId, onSelect }) {
  const dispatch = useDispatch();
  const platforms = useSelector(s => s.platforms.items);
  const users = useSelector(s => s.users.items);
  const { editing } = useEdit();

  let feature, platform;
  for (const p of platforms) {
    feature = (p.features || []).find(f => f.id === featureId);
    if (feature) { platform = p; break; }
  }
  if (!feature || !platform) return <p>Feature not found.</p>;

  const [draftTitle, setDraftTitle] = useState(feature.title || '');
  const [draftDesc, setDraftDesc] = useState(feature.description || '');
  const [newSubTask, setNewSubTask] = useState('');
  const [editingSub, setEditingSub] = useState(null);
  const [subTitleVal, setSubTitleVal] = useState('');
  const [subAssigneeVal, setSubAssigneeVal] = useState('');
  const [subStatusVal, setSubStatusVal] = useState('');
  const taskStatuses = useSelector(s => s.statuses.byType.task) || [];
  
  useEffect(() => {
    dispatch(fetchStatuses({ projectId: 1, type: 'task' }));
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (feature) {
      setDraftTitle(feature.title || '');
      setDraftDesc(feature.description || '');
    }
  }, [feature?.title, feature?.description]);

  const prevEditing = useRef(editing);
  useEffect(() => {
    if (prevEditing.current && !editing) {
      const updates = {};
      if (draftTitle.trim() && draftTitle !== (feature.title || '')) updates.title = draftTitle;
      if (draftDesc !== (feature.description || '')) updates.description = draftDesc;
      if (Object.keys(updates).length) dispatch(updateFeature({ id: feature.id, ...updates }));
    }
    prevEditing.current = editing;
  }, [editing]);

  const handleAddSubTask = async () => {
    if (!newSubTask.trim()) return;
    const defaultStatus = taskStatuses.find(s => s.isDefault) || taskStatuses[0];
    await dispatch(createSubTask({
      projectId: 1,
      featureId: feature.id,
      title: newSubTask,
      statusId: defaultStatus?.id || 1,
      order: (feature.subTasks || []).length,
    }));
    setNewSubTask('');
  };

  const startEditSub = (sub) => {
    setEditingSub(sub.id);
    setSubTitleVal(sub.title || '');
    setSubAssigneeVal(sub.doneById ? String(sub.doneById) : '');
    setSubStatusVal(sub.statusId ? String(sub.statusId) : '');
  };

  const saveSubTask = async () => {
    if (!editingSub) return;
    const updates = {};
    if (subTitleVal.trim()) updates.title = subTitleVal;
    if (subAssigneeVal) updates.doneById = Number(subAssigneeVal);
    else updates.doneById = null;
    if (subStatusVal) updates.statusId = Number(subStatusVal);
    await dispatch(updateSubTaskAsync({ id: editingSub, ...updates }));
    setEditingSub(null);
  };

  const handleDeleteSub = async (id) => {
    if (confirm('Delete this subtask?')) {
      await dispatch(deleteSubTask(id));
    }
  };

  return (
    <section className="doc-section doc-section--animate">
      <Breadcrumb items={[
        { label: 'Documentation', id: 'granular-docs' },
        { label: platform.name, id: `platform-${platform.id}` },
        feature.title || feature.name
      ]} onSelect={onSelect} />

      <div className="feature-block__header" style={{ marginBottom: 8 }}>
        <FeatureBar />
        {editing ? (
          <input
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #c8e6c9', borderRadius: 6, fontSize: 18, fontWeight: 700, outline: 'none' }}
            value={draftTitle}
            onChange={e => setDraftTitle(e.target.value)}
          />
        ) : (
          <h1 className="doc-section__title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            FEATURE: {feature.title || feature.name}
            <ReviewStatusBadge entityKey={`feature-${feature.id}`} />
          </h1>
        )}
        {editing && (
          <button
            style={{ flexShrink: 0, padding: '6px 14px', background: '#fff', color: '#e53935', border: '1px solid #e53935', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            onClick={() => {
              if (confirm(`Delete feature "${feature.title || feature.name}" and all its subtasks?`)) {
                dispatch(deleteFeature(feature.id));
                onSelect(`platform-${platform.id}`);
              }
            }}
          >
            Delete Feature
          </button>
        )}
      </div>

      <div style={{ marginBottom: 28 }}>
        <h2 className="doc-section__heading" style={{ marginTop: 16 }}>Feature Description</h2>
        {editing ? (
          <div>
            <textarea
              style={{
                width: '100%', minHeight: 200, padding: '14px 16px',
                border: '1px solid #c8e6c9', borderRadius: 8, fontSize: 14,
                lineHeight: 1.8, fontFamily: 'inherit', color: '#333',
                outline: 'none', resize: 'vertical', background: '#fafcfb',
                marginBottom: 8
              }}
              value={draftDesc}
              onChange={e => setDraftDesc(e.target.value)}
              placeholder="Write a detailed description of this feature...&#10;&#10;Use line breaks to separate sections. You can use '## ' for headings or '• ' for bullet points."
            />
          </div>
        ) : (feature.description || '').trim() ? (
          <div style={{ marginBottom: 24 }}>
            {(feature.description || '').split('\n').filter(p => p.trim()).map((para, i) => {
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
          <p style={{ fontSize: 14, color: '#999', fontStyle: 'italic', marginBottom: 24 }}>No description yet. Click "Edit" to add details.</p>
        )}

      </div>

      <ReviewOverlay entityKey={`feature-${feature.id}`} />

      {editing && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, outline: 'none' }}
            value={newSubTask}
            onChange={e => setNewSubTask(e.target.value)}
            placeholder="New subtask title..."
            onKeyDown={e => { if (e.key === 'Enter') handleAddSubTask(); }}
          />
          <button
            style={{ padding: '8px 18px', background: '#1a5c32', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            onClick={handleAddSubTask}
          >
            + Add
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 className="doc-section__heading" style={{ margin: 0 }}>Sub-Tasks</h2>
      </div>

      <div className="feature-block__table">
        <table>
          <thead>
            <tr><th>Task</th><th>Assignee</th><th>Status</th>{editing && <th style={{ width: 80 }}></th>}</tr>
          </thead>
          <tbody>
            {(feature.subTasks || []).map(sub => (
              editingSub === sub.id ? (
                <tr key={sub.id}>
                  <td>
                    <input
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #c8e6c9', borderRadius: 4, fontSize: 13, outline: 'none' }}
                      value={subTitleVal}
                      onChange={e => setSubTitleVal(e.target.value)}
                      autoFocus
                    />
                  </td>
                  <td>
                    <select
                      style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                      value={subAssigneeVal}
                      onChange={e => setSubAssigneeVal(e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name || u.username}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                      value={subStatusVal}
                      onChange={e => setSubStatusVal(e.target.value)}
                    >
                      {taskStatuses.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={{ padding: '4px 10px', background: '#1a5c32', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }} onClick={saveSubTask}>Save</button>
                      <button style={{ padding: '4px 10px', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 12 }} onClick={() => setEditingSub(null)}>X</button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={sub.id}>
                  <td><strong>{sub.title}</strong></td>
                  <td>{sub.doneBy?.name || sub.doneBy?.username || 'Unassigned'}</td>
                  <td><StatusBadge status={sub.status?.name || sub.status || 'pending'} /></td>
                  {editing && (
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#1a5c32', display: 'flex', alignItems: 'center' }} onClick={() => startEditSub(sub)}>
                          <Pencil size={13} />
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#e53935' }} onClick={() => handleDeleteSub(sub.id)}>🗑️</button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            ))}
            {(!feature.subTasks || feature.subTasks.length === 0) && (
              <tr><td colSpan={editing ? 4 : 3} style={{ textAlign: 'center', color: '#999', padding: 20 }}>No subtasks yet{editing ? '. Add one above.' : '.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function FeatureRequestsLanding({ onSelect }) {
  const dispatch = useDispatch();
  const platforms = useSelector(s => s.platforms.items) || [];
  const requests = useSelector(s => s.features.items) || [];
  const { editing } = useEdit();

  return (
    <section className="doc-section doc-section--animate">
      <Breadcrumb items={[{ label: 'Feature Requests', id: 'feature-requests' }]} onSelect={onSelect} />
      <h1 className="doc-section__title">Feature Requests</h1>
      <div style={{ marginBottom: 16, fontSize: 14, color: '#666' }}>
        {requests.length} request{requests.length !== 1 ? 's' : ''} across {platforms.length} platform{platforms.length !== 1 ? 's' : ''}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {platforms.map(p => {
          const platRequests = requests.filter(r => r.platformId === p.id);
          return (
            <button
              key={p.id}
              onClick={() => onSelect(`fr-platform-${p.id}`)}
              style={{ textAlign: 'left', cursor: 'pointer', width: '100%', padding: 0, border: '1px solid #e8e8e8', borderRadius: 12, background: '#fff', overflow: 'hidden', transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#1a5c32'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e8e8e8'; }}
            >
                <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a' }}>{p.name}</div>
                  <span style={{ background: '#f0faf3', color: '#1a5c32', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    {platRequests.length} request{platRequests.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#999' }}>
                  <span>🔧 {p.type || 'web'}</span>
                  <span>📌 {p.status || 'active'}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {platforms.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>No platforms yet.</p>}
    </section>
  );
}

export function FeatureRequestSection({ platformId, onSelect }) {
  const dispatch = useDispatch();
  const platform = useSelector(s => s.platforms.items.find(p => p.id === platformId));
  const allRequests = useSelector(s => s.features.items);
  const requests = useMemo(() => allRequests.filter(f => f.platformId === platformId), [allRequests, platformId]);
  const { editing } = useEdit();
  const requestStatuses = useSelector(s => s.statuses.byType.request) || [];
  const [statusDrafts, setStatusDrafts] = useState({});
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqDesc, setNewReqDesc] = useState('');
  const [newReqImage, setNewReqImage] = useState('');
  const [reqError, setReqError] = useState('');

  useEffect(() => {
    dispatch(fetchStatuses({ projectId: 1, type: 'request' }));
    dispatch(fetchFeatureRequests(platformId));
  }, [dispatch, platformId]);

  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be 5 MB or smaller.'); return; }
    const reader = new FileReader();
    reader.onload = () => setNewReqImage(reader.result);
    reader.readAsDataURL(file);
  };

  const resetNewRequest = () => {
    setShowNewRequest(false);
    setNewReqTitle('');
    setNewReqDesc('');
    setNewReqImage('');
    setReqError('');
  };

  if (!platform) return null;

  const handleApprove = (e, req) => {
    e.stopPropagation();
    const approved = requestStatuses.find(s => s.slug === 'approved');
    if (approved) dispatch(updateFeatureRequestAsync({ id: req.id, statusId: approved.id }));
  };

  const handleReject = (e, req) => {
    e.stopPropagation();
    const rejected = requestStatuses.find(s => s.slug === 'rejected');
    if (rejected) dispatch(updateFeatureRequestAsync({ id: req.id, statusId: rejected.id }));
  };

  const handleCreateRequest = async () => {
    setReqError('');
    if (!newReqTitle.trim()) { setReqError('Title is required.'); return; }
    const defaultStatus = requestStatuses.find(s => s.isDefault) || requestStatuses[0];
    try {
      await dispatch(createFeatureRequest({
        projectId: 1,
        platformId: platform.id,
        title: newReqTitle,
        description: newReqDesc,
        imageUrl: newReqImage,
        statusId: defaultStatus?.id,
      })).unwrap();
      resetNewRequest();
    } catch (e) {
      setReqError(e.message || 'Failed to create feature request.');
    }
  };

  return (
    <section className="doc-section doc-section--animate">
      <Breadcrumb items={[{ label: 'Feature Requests', id: 'feature-requests' }, platform.name]} onSelect={onSelect} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 className="doc-section__title" style={{ margin: 0 }}>{platform.name} - Requests</h1>
        {!showNewRequest && (
          <button
            style={{ padding: '6px 16px', background: '#1a5c32', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            onClick={() => setShowNewRequest(true)}
          >
            + New Request
          </button>
        )}
      </div>

      {showNewRequest && (
        <div style={{ background: '#f0faf3', border: '1px solid #c8e6c9', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a5c32', marginBottom: 10 }}>New Feature Request</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              style={{ padding: '8px 12px', border: '1px solid #c8e6c9', borderRadius: 6, fontSize: 13, outline: 'none' }}
              value={newReqTitle}
              onChange={e => setNewReqTitle(e.target.value)}
              placeholder="Request title..."
              autoFocus
            />
            <textarea
              style={{ padding: '8px 12px', border: '1px solid #c8e6c9', borderRadius: 6, fontSize: 13, outline: 'none', minHeight: 60, resize: 'vertical' }}
              value={newReqDesc}
              onChange={e => setNewReqDesc(e.target.value)}
              placeholder="Description (optional)"
            />

            {/* Optional image attachment */}
            {newReqImage ? (
              <div style={{ position: 'relative', display: 'inline-block', alignSelf: 'flex-start' }}>
                <img src={newReqImage} alt="Attachment preview" style={{ maxWidth: 240, maxHeight: 160, borderRadius: 6, border: '1px solid #c8e6c9', display: 'block' }} />
                <button
                  type="button"
                  style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 13, lineHeight: 1 }}
                  onClick={() => setNewReqImage('')}
                  title="Remove image"
                >×</button>
              </div>
            ) : (
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', padding: '6px 12px', background: '#fff', color: '#1a5c32', border: '1px dashed #1a5c32', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                🖼️ Attach image (optional)
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageSelect(e.target.files?.[0])} />
              </label>
            )}

            {reqError && <div style={{ color: '#c62828', fontSize: 13 }}>{reqError}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: '8px 18px', background: '#1a5c32', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }} onClick={handleCreateRequest}>Save</button>
              <button style={{ padding: '8px 18px', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13 }} onClick={resetNewRequest}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="feature-block__table">
        <table>
          <thead><tr><th>Title</th><th>Status</th><th>Actions</th><th style={{ width: 60 }}></th></tr></thead>
          <tbody>
            {requests.map(req => {
              const hasDraft = statusDrafts[req.id] !== undefined && statusDrafts[req.id] !== (req.status?.id || '');
              return (
              <tr key={req.id} className="clickable-row" onClick={() => onSelect(`freq-${req.id}`)}>
                <td>{req.title}</td>
                <td onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {requestStatuses.length > 0 ? (
                      <select
                        className="status-select"
                        value={statusDrafts[req.id] !== undefined ? statusDrafts[req.id] : (req.status?.id || '')}
                        onChange={e => {
                          setStatusDrafts(d => ({ ...d, [req.id]: Number(e.target.value) }));
                        }}
                      >
                        {requestStatuses.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge status={req.status?.name || req.status} />
                    )}
                    {hasDraft && (
                      <button
                        onClick={() => {
                          dispatch(updateFeatureRequestAsync({ id: req.id, statusId: statusDrafts[req.id] }));
                          setStatusDrafts(d => { const n = { ...d }; delete n[req.id]; return n; });
                        }}
                        style={{
                          width: 26, height: 26, borderRadius: '50%', border: 'none',
                          background: '#1a5c32', color: '#fff', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, flexShrink: 0,
                          boxShadow: '0 2px 6px rgba(26,92,50,0.3)',
                          transition: 'all 0.15s ease',
                        }}
                        title="Save status change"
                      >✓</button>
                    )}
                  </div>
                </td>
                <td>
                  {(req.status?.slug === 'review' || req.status === 'review') && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="doc-badge badge--done" style={{ cursor: 'pointer', border: 'none' }} onClick={(e) => handleApprove(e, req)}>Approve</button>
                      <button className="doc-badge badge--pending" style={{ cursor: 'pointer', border: 'none' }} onClick={(e) => handleReject(e, req)}>Reject</button>
                    </div>
                  )}
                </td>
                <td>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#e53935' }}
                    title="Delete request"
                    onClick={e => { e.stopPropagation(); if (confirm('Delete this feature request?')) dispatch(deleteFeatureRequest(req.id)); }}
                  >🗑️</button>
                </td>
              </tr>
              );
            })}
            {requests.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#999', padding: 20 }}>No feature requests yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function FeatureRequestDetailView({ requestId, onSelect }) {
  const dispatch = useDispatch();
  const req = useSelector(s => s.features.items.find(f => f.id === requestId));
  const requestStatuses = useSelector(s => s.statuses.byType.request) || [];
  const [statusDraft, setStatusDraft] = useState(null);

  useEffect(() => {
    dispatch(fetchStatuses({ projectId: 1, type: 'request' }));
  }, [dispatch]);

  if (!req) return <p>Not found</p>;

  const handleApprove = () => {
    const approved = requestStatuses.find(s => s.slug === 'approved');
    if (approved) dispatch(updateFeatureRequestAsync({ id: req.id, statusId: approved.id }));
  };

  const handleReject = () => {
    const rejected = requestStatuses.find(s => s.slug === 'rejected');
    if (rejected) dispatch(updateFeatureRequestAsync({ id: req.id, statusId: rejected.id }));
  };

  return (
    <section className="doc-section doc-section--animate">
      <Breadcrumb items={[{ label: 'Feature Requests', id: 'feature-requests' }, req.title]} onSelect={onSelect} />
      <h1 className="doc-section__title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {req.title}
        <ReviewStatusBadge entityKey={`feature-request-${req.id}`} />
      </h1>
      <p>{req.description}</p>
      {req.imageUrl && (
        <img src={req.imageUrl} alt={req.title} style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, border: '1px solid #e8e8e8', marginTop: 8 }} />
      )}
      {requestStatuses.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
          <span style={{ fontSize: 14, color: '#666' }}>Status:</span>
          <select
            className="status-select"
            value={statusDraft ?? (req.status?.id || '')}
            onChange={e => setStatusDraft(Number(e.target.value))}
          >
            {requestStatuses.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {statusDraft != null && statusDraft !== req.status?.id && (
            <button
              className="status-save-btn"
              title="Save status"
              onClick={() => {
                dispatch(updateFeatureRequestAsync({ id: req.id, statusId: statusDraft }));
                setStatusDraft(null);
              }}
            >✓</button>
          )}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {req.status?.slug === 'review' && (
          <>
            <button
              className="doc-badge badge--done"
              style={{ cursor: 'pointer', border: 'none', padding: '6px 16px', fontSize: 14 }}
              onClick={handleApprove}
            >
              Approve
            </button>
            <button
              className="doc-badge badge--pending"
              style={{ cursor: 'pointer', border: 'none', padding: '6px 16px', fontSize: 14 }}
              onClick={handleReject}
            >
              Reject
            </button>
          </>
        )}
        <button
          style={{ padding: '6px 16px', background: '#fff', color: '#e53935', border: '1px solid #e53935', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
          onClick={() => {
            if (confirm('Delete this feature request?')) {
              dispatch(deleteFeatureRequest(req.id));
              onSelect(`fr-platform-${req.platformId}`);
            }
          }}
        >
          Delete
        </button>
      </div>

      <ReviewOverlay entityKey={`feature-request-${req.id}`} />
    </section>
  );
}

export function ActiveWorkBugsLanding({ onSelect }) {
  const bugs = useSelector(s => s.bugs.items) || [];
  return (
    <section className="doc-section doc-section--animate">
      <Breadcrumb items={[{ label: 'Bug Reporting', id: 'active-work-bugs' }]} onSelect={onSelect} />
      <h1 className="doc-section__title">Bug Reporting</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => onSelect('active-bugs')}
          style={{ textAlign: 'left', cursor: 'pointer', padding: 0, border: '1px solid #e8e8e8', borderRadius: 12, background: '#fff', overflow: 'hidden', transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#1a5c32'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e8e8e8'; }}
        >
          <div style={{ padding: '16px 18px' }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', marginBottom: 8 }}>🐛 Active Bugs</div>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>View and manage reported bugs across all platforms.</div>
            <span style={{ background: '#fff0f0', color: '#e53935', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{bugs.length} bug{bugs.length !== 1 ? 's' : ''}</span>
          </div>
        </button>
      </div>
    </section>
  );
}

export function ActiveBugsSection({ onSelect }) {
  const dispatch = useDispatch();
  const bugs = useSelector(s => s.bugs.items);
  const platforms = useSelector(s => s.platforms.items) || [];
  const { editing } = useEdit();

  const [showNew, setShowNew] = useState(false);
  const statuses = useSelector(s => s.statuses.byType.bug) || [];
  const [statusDrafts, setStatusDrafts] = useState({});
  const severities = useSelector(s => s.statuses.severities) || [];
  const [error, setError] = useState('');
  const [image, setImage] = useState('');
  const [form, setForm] = useState({ platformId: '', title: '', severityId: '', statusId: '', description: '' });

  // ── Filter state ──
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchStatuses({ projectId: 1, type: 'bug' }));
    dispatch(fetchSeverities(1));
  }, [dispatch]);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be 5 MB or smaller.'); return; }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm({ platformId: '', title: '', severityId: '', statusId: '', description: '' });
    setImage('');
    setError('');
    setShowNew(false);
  };

  const handleCreate = async () => {
    setError('');
    if (!form.platformId || !form.title.trim()) { setError('Platform and title are required.'); return; }
    const defaultStatus = statuses.find(s => s.isDefault) || statuses[0];
    const defaultSeverity = severities.find(s => s.isDefault) || severities[0];
    try {
      await dispatch(createBug({
        platformId: Number(form.platformId),
        title: form.title,
        description: form.description,
        imageUrl: image,
        severityId: form.severityId ? Number(form.severityId) : defaultSeverity?.id,
        statusId: form.statusId ? Number(form.statusId) : defaultStatus?.id,
      })).unwrap();
      resetForm();
    } catch (e) {
      setError(e.message || 'Failed to report bug.');
    }
  };

  // ── Compute filtered bugs ──
  const filteredBugs = bugs.filter(b => {
    if (filterPlatform && b.platformId !== Number(filterPlatform)) return false;
    if (filterSeverity && b.severityId !== Number(filterSeverity)) return false;
    if (filterStatus && (b.status?.id || b.statusId) !== Number(filterStatus)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = b.title?.toLowerCase().includes(q);
      const descMatch = b.description?.toLowerCase().includes(q);
      const reporterMatch = (b.reportedBy?.name || b.reportedBy?.username || '').toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !reporterMatch) return false;
    }
    return true;
  });

  const hasActiveFilters = filterPlatform || filterSeverity || filterStatus || searchQuery;

  const clearFilters = () => {
    setFilterPlatform('');
    setFilterSeverity('');
    setFilterStatus('');
    setSearchQuery('');
  };

  const inputStyle = { padding: '8px 12px', border: '1px solid #c8e6c9', borderRadius: 6, fontSize: 13, outline: 'none' };
  const filterSelectStyle = {
    padding: '7px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, outline: 'none',
    background: '#fff', cursor: 'pointer', color: '#333', fontFamily: 'inherit',
  };

  return (
    <section className="doc-section doc-section--animate">
      <Breadcrumb items={[{ label: 'Bug Reporting', id: 'active-work-bugs' }, 'Active Bugs']} onSelect={onSelect} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 className="doc-section__title" style={{ margin: 0 }}>Active Bugs</h1>
        {!showNew && (
          <button
            style={{ padding: '6px 16px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            onClick={() => setShowNew(true)}
          >
            + Report Bug
          </button>
        )}
      </div>

      {/* ── Filter Bar ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
        padding: '12px 16px', background: '#fafafa', border: '1px solid #eee',
        borderRadius: 10, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#666' }}>
          🔍
        </div>
        <input
          style={{ ...filterSelectStyle, flex: '1 1 180px', minWidth: 140 }}
          placeholder="Search bugs..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select style={{ ...filterSelectStyle, flex: '0 1 160px' }} value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
          <option value="">All Platforms</option>
          {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select style={{ ...filterSelectStyle, flex: '0 1 140px' }} value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
          <option value="">All Severities</option>
          {severities.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select style={{ ...filterSelectStyle, flex: '0 1 140px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {hasActiveFilters && (
          <button
            style={{ padding: '6px 14px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            onClick={clearFilters}
          >
            ✕ Clear
          </button>
        )}
      </div>

      <div style={{ marginBottom: 12, fontSize: 13, color: '#888' }}>
        {hasActiveFilters
          ? `Showing ${filteredBugs.length} of ${bugs.length} bug${bugs.length !== 1 ? 's' : ''}`
          : `${bugs.length} bug${bugs.length !== 1 ? 's' : ''}`
        }
      </div>

      {showNew && (
        <div style={{ background: '#fff5f5', border: '1px solid #f5c6c6', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#c62828', marginBottom: 10 }}>Report a Bug</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <select style={inputStyle} value={form.platformId} onChange={e => setField('platformId', e.target.value)} autoFocus>
              <option value="">Select platform...</option>
              {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input style={inputStyle} value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Bug title..." />
            <div style={{ display: 'flex', gap: 8 }}>
              <select style={{ ...inputStyle, flex: 1 }} value={form.severityId} onChange={e => setField('severityId', e.target.value)}>
                <option value="">Severity (default)</option>
                {severities.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select style={{ ...inputStyle, flex: 1 }} value={form.statusId} onChange={e => setField('statusId', e.target.value)}>
                <option value="">Status (default)</option>
                {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Description (optional)" />

            {/* Optional screenshot / image attachment */}
            {image ? (
              <div style={{ position: 'relative', display: 'inline-block', alignSelf: 'flex-start' }}>
                <img src={image} alt="Attachment preview" style={{ maxWidth: 240, maxHeight: 160, borderRadius: 6, border: '1px solid #f5c6c6', display: 'block' }} />
                <button
                  type="button"
                  style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 13, lineHeight: 1 }}
                  onClick={() => setImage('')}
                  title="Remove image"
                >×</button>
              </div>
            ) : (
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', padding: '6px 12px', background: '#fff', color: '#c62828', border: '1px dashed #e53935', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                🖼️ Attach screenshot (optional)
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageSelect(e.target.files?.[0])} />
              </label>
            )}

            {error && <div style={{ color: '#c62828', fontSize: 13 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: '8px 18px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }} onClick={handleCreate}>Save</button>
              <button style={{ padding: '8px 18px', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13 }} onClick={resetForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="feature-block__table">
        <table>
          <thead><tr><th>Title</th><th>Platform</th><th>Severity</th><th>Status</th>{editing && <th style={{ width: 60 }}></th>}</tr></thead>
          <tbody>
            {filteredBugs.map(b => (
              <tr key={b.id} className="clickable-row" onClick={() => onSelect(`bug-${b.id}`)}>
                <td>{b.title}</td>
                <td style={{ fontSize: 13, color: '#555' }}>{b.platform?.name || platforms.find(p => p.id === b.platformId)?.name || '—'}</td>
                <td>
                  {b.severity ? (
                    <span className="doc-badge" style={{ background: `${b.severity.color}18`, color: b.severity.color, fontWeight: 600 }}>
                      {b.severity.name}
                    </span>
                  ) : '—'}
                </td>
                <td onClick={e => e.stopPropagation()}>
                  {statuses.length > 0 ? (
                    <select
                      className="status-select"
                      value={b.status?.id || ''}
                      onChange={e => {
                        dispatch(updateBugAsync({ id: b.id, statusId: Number(e.target.value) }));
                      }}
                    >
                      {statuses.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  ) : (
                    <StatusBadge status={b.status?.name || b.status} />
                  )}
                </td>
                {editing && (
                  <td>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#e53935' }}
                      onClick={e => { e.stopPropagation(); if (confirm('Delete this bug?')) dispatch(deleteBug(b.id)); }}
                    >🗑️</button>
                  </td>
                )}
              </tr>
            ))}
            {filteredBugs.length === 0 && (
              <tr>
                <td colSpan={editing ? 5 : 4} style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                  {hasActiveFilters ? 'No bugs match the current filters.' : 'No bugs reported yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function BugReportDetailView({ bugId, onSelect }) {
  const dispatch = useDispatch();
  const bug = useSelector(s => s.bugs.items.find(b => b.id === bugId));
  const statuses = useSelector(s => s.statuses.byType.bug) || [];
  const [statusDraft, setStatusDraft] = useState(null);

  useEffect(() => {
    dispatch(fetchStatuses({ projectId: 1, type: 'bug' }));
  }, [dispatch]);

  if (!bug) return <p>Not found</p>;
  const attachments = bug.attachments || [];
  return (
    <section className="doc-section doc-section--animate">
      <Breadcrumb items={[{ label: 'Bug Reporting', id: 'active-work-bugs' }, 'Bugs', bug.title]} onSelect={onSelect} />
      <h1 className="doc-section__title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {bug.title}
        <ReviewStatusBadge entityKey={`bug-${bug.id}`} />
      </h1>
      <p>{bug.description}</p>
      {statuses.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 14, color: '#666' }}>Status:</span>
          <select
            className="status-select"
            value={statusDraft ?? (bug.status?.id || '')}
            onChange={e => setStatusDraft(Number(e.target.value))}
          >
            {statuses.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {statusDraft != null && statusDraft !== bug.status?.id && (
            <button
              className="status-save-btn"
              title="Save status"
              onClick={() => {
                dispatch(updateBugAsync({ id: bug.id, statusId: statusDraft }));
                setStatusDraft(null);
              }}
            >✓</button>
          )}
        </div>
      )}
      {attachments.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
          {attachments.map(a => (
            <img key={a.id} src={a.imageUrl} alt={a.caption || bug.title} style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, border: '1px solid #e8e8e8' }} />
          ))}
        </div>
      )}

      <ReviewOverlay entityKey={`bug-${bug.id}`} />
    </section>
  );
}

export function QALanding({ onSelect }) {
  const platforms = useSelector(s => s.platforms.items) || [];
  return (
    <section className="doc-section doc-section--animate">
      <Breadcrumb items={[{ label: 'Quality Assurance', id: 'qa' }]} onSelect={onSelect} />
      <h1 className="doc-section__title">QA Overview</h1>
      <div style={{ marginBottom: 16, fontSize: 14, color: '#666' }}>
        {platforms.length} platform{platforms.length !== 1 ? 's' : ''}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {platforms.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(`qa-platform-${p.id}`)}
            style={{ textAlign: 'left', cursor: 'pointer', width: '100%', padding: 0, border: '1px solid #e8e8e8', borderRadius: 12, background: '#fff', overflow: 'hidden', transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#1a5c32'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e8e8e8'; }}
          >
            <div style={{ padding: '16px 18px' }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', marginBottom: 8 }}>{p.name}</div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#999' }}>
                <span>🔧 {p.type || 'web'}</span>
                <span>📌 {p.status || 'active'}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      {platforms.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>No platforms yet.</p>}
    </section>
  );
}

export function QAPlatformSection({ platformId, onSelect }) {
  const dispatch = useDispatch();
  const stories = useSelector(s => s.qa.items);
  const platform = useSelector(s => s.platforms.items.find(p => p.id === platformId));
  const users = useSelector(s => s.users.items) || [];
  const { editing } = useEdit();

  const statuses = useSelector(s => s.statuses.byType.qa) || [];
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ storyCode: '', title: '', description: '', statusId: '' });

  // ── Filter state ──
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTester, setFilterTester] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchQAByPlatform(platformId));
    dispatch(fetchStatuses({ projectId: 1, type: 'qa' }));
    dispatch(fetchUsers());
  }, [dispatch, platformId]);

  if (!platform) return null;

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const resetForm = () => {
    setForm({ storyCode: '', title: '', description: '', statusId: '' });
    setError('');
    setShowNew(false);
  };

  const handleCreate = async () => {
    setError('');
    if (!form.title.trim()) { setError('Title is required.'); return; }
    const defaultStatus = statuses.find(s => s.isDefault) || statuses[0];
    const prefix = (platform.slug || platform.name || 'qa').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
    const storyCode = form.storyCode.trim() || `QA-${prefix}-${stories.length + 1}`;
    try {
      await dispatch(createQAStory({
        platformId,
        storyCode,
        title: form.title,
        description: form.description,
        statusId: form.statusId ? Number(form.statusId) : defaultStatus?.id,
        order: stories.length,
      })).unwrap();
      resetForm();
    } catch (e) {
      setError(e.message || 'Failed to create QA story.');
    }
  };

  const filteredStories = stories.filter(story => {
    if (filterStatus && (story.status?.id || story.statusId) !== Number(filterStatus)) return false;
    if (filterTester && story.testerId !== Number(filterTester)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = story.title?.toLowerCase().includes(q);
      const matchCode = story.storyCode?.toLowerCase().includes(q);
      const matchDesc = story.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchDesc) return false;
    }
    return true;
  });

  const hasActiveFilters = filterStatus || filterTester || searchQuery;

  const clearFilters = () => {
    setFilterStatus('');
    setFilterTester('');
    setSearchQuery('');
  };

  const inputStyle = { padding: '8px 12px', border: '1px solid #c8e6c9', borderRadius: 6, fontSize: 13, outline: 'none' };
  const filterSelectStyle = {
    padding: '7px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, outline: 'none',
    background: '#fff', cursor: 'pointer', color: '#333', fontFamily: 'inherit',
  };

  return (
    <section className="doc-section doc-section--animate">
      <Breadcrumb items={[{ label: 'Quality Assurance', id: 'qa' }, platform.name]} onSelect={onSelect} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 className="doc-section__title" style={{ margin: 0 }}>QA: {platform.name}</h1>
        {!showNew && (
          <button
            style={{ padding: '6px 16px', background: '#1a5c32', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            onClick={() => setShowNew(true)}
          >
            + New QA Story
          </button>
        )}
      </div>

      {/* ── Filter Bar ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
        padding: '12px 16px', background: '#fafafa', border: '1px solid #eee',
        borderRadius: 10, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#666' }}>
          🔍
        </div>
        <input
          style={{ ...filterSelectStyle, flex: '1 1 180px', minWidth: 140 }}
          placeholder="Search QA stories..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select style={{ ...filterSelectStyle, flex: '0 1 160px' }} value={filterTester} onChange={e => setFilterTester(e.target.value)}>
          <option value="">All Testers</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name || u.username}</option>)}
        </select>
        <select style={{ ...filterSelectStyle, flex: '0 1 140px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {hasActiveFilters && (
          <button
            style={{ padding: '6px 14px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            onClick={clearFilters}
          >
            ✕ Clear
          </button>
        )}
      </div>

      <div style={{ marginBottom: 12, fontSize: 13, color: '#888' }}>
        {hasActiveFilters
          ? `Showing ${filteredStories.length} of ${stories.length} QA stor${stories.length !== 1 ? 'ies' : 'y'}`
          : `${stories.length} QA stor${stories.length !== 1 ? 'ies' : 'y'}`
        }
      </div>

      {showNew && (
        <div style={{ background: '#f0faf3', border: '1px solid #c8e6c9', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a5c32', marginBottom: 10 }}>New QA Story</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input style={inputStyle} value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Story title..." autoFocus />
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} value={form.storyCode} onChange={e => setField('storyCode', e.target.value)} placeholder="Story code (optional, auto-generated)" />
              <select style={{ ...inputStyle, flex: 1 }} value={form.statusId} onChange={e => setField('statusId', e.target.value)}>
                <option value="">Status (default)</option>
                {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Description (optional)" />
            {error && <div style={{ color: '#c62828', fontSize: 13 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: '8px 18px', background: '#1a5c32', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }} onClick={handleCreate}>Save</button>
              <button style={{ padding: '8px 18px', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13 }} onClick={resetForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="feature-block__table">
        <table>
          <thead><tr><th>Story Code</th><th>Title</th><th>Tester</th><th>Status</th>{editing && <th style={{ width: 60 }}></th>}</tr></thead>
          <tbody>
            {filteredStories.map(story => (
              <tr key={story.id} className="clickable-row" onClick={() => onSelect(`qa-story-${story.id}`)}>
                <td>{story.storyCode}</td>
                <td>{story.title}</td>
                <td style={{ fontSize: 13, color: '#555' }}>{story.tester ? (story.tester.name || story.tester.username) : 'Unassigned'}</td>
                <td onClick={e => e.stopPropagation()}>
                  {statuses.length > 0 ? (
                    <select
                      className="status-select"
                      value={story.status?.id || story.statusId || ''}
                      onChange={e => {
                        dispatch(updateQAStoryAsync({ id: story.id, statusId: Number(e.target.value) }));
                      }}
                    >
                      {statuses.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  ) : (
                    <StatusBadge status={story.status?.name || story.status} />
                  )}
                </td>
                {editing && (
                  <td>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#e53935' }}
                      onClick={e => { e.stopPropagation(); if (confirm('Delete this QA story?')) dispatch(deleteQAStory(story.id)); }}
                    >🗑️</button>
                  </td>
                )}
              </tr>
            ))}
            {filteredStories.length === 0 && (
              <tr>
                <td colSpan={editing ? 5 : 4} style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                  {hasActiveFilters ? 'No QA stories match the current filters.' : 'No QA stories found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function QAStoryDetailView({ storyId, onSelect }) {
  const dispatch = useDispatch();
  const story = useSelector(s => s.qa.items.find(st => st.id === storyId));
  const users = useSelector(s => s.users.items) || [];
  const statuses = useSelector(s => s.statuses.byType.qa) || [];
  const [statusDraft, setStatusDraft] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchStatuses({ projectId: 1, type: 'qa' }));
  }, [dispatch]);

  if (!story) return <p>Loading...</p>;

  const update = (data) => dispatch(updateQAStoryAsync({ id: story.id, ...data }));
  const dateValue = story.lastTested ? new Date(story.lastTested).toISOString().slice(0, 10) : '';
  const rowStyle = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 };
  const labelStyle = { width: 110, fontSize: 14, color: '#666', fontWeight: 600 };

  return (
    <section className="doc-section doc-section--animate">
      <Breadcrumb items={[{ label: 'Quality Assurance', id: 'qa' }, 'Stories', story.storyCode]} onSelect={onSelect} />
      <h1 className="doc-section__title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {story.storyCode}: {story.title}
        <ReviewStatusBadge entityKey={`qa-story-${story.id}`} />
      </h1>

      <div className="doc-callout" style={{ padding: 16 }}>
        <div className="doc-callout__header" style={{ marginBottom: 12 }}>QA Details</div>
        <div style={rowStyle}>
          <span style={labelStyle}>Tester</span>
          <select
            className="status-select"
            value={story.testerId || ''}
            onChange={e => update({ testerId: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">Unassigned</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name || u.username}</option>)}
          </select>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Last Tested</span>
          <input
            type="date"
            className="status-select"
            style={{ paddingRight: 12 }}
            value={dateValue}
            onChange={e => update({ lastTested: e.target.value ? new Date(e.target.value).toISOString() : null })}
          />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Status</span>
          <select
            className="status-select"
            value={statusDraft ?? (story.statusId || '')}
            onChange={e => setStatusDraft(Number(e.target.value))}
          >
            {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {statusDraft != null && statusDraft !== story.statusId && (
            <button
              className="status-save-btn"
              title="Save status"
              onClick={() => { update({ statusId: statusDraft }); setStatusDraft(null); }}
            >✓</button>
          )}
        </div>
      </div>

      <h2 className="doc-section__heading">Description</h2>
      <p className="doc-section__text">{story.description}</p>
      <h2 className="doc-section__heading">Steps</h2>
      <ol style={{ marginLeft: '20px' }}>
        {(story.steps || []).map(step => (
          <li key={step.id}>{step.instruction}</li>
        ))}
      </ol>

      <ReviewOverlay entityKey={`qa-story-${story.id}`} />
    </section>
  );
}

const CATEGORIES = ["Supplementary Specs", "API References", "Deployment Guides", "External Services", "Other"];

export function AllOtherDocsSection({ onSelect }) {
  const dispatch = useDispatch();
  const project = useSelector(s => s.project.data);
  const { editing } = useEdit();
  const docs = project?.supplementaryDocs || [];
  
  // local state for adding new doc
  const [showAdd, setShowAdd] = useState(false);
  const [newDoc, setNewDoc] = useState({ category: 'Supplementary Specs', title: '', url: '', stage: 'DRAFT', reviewed: false });
  const [error, setError] = useState('');

  // local state for editing a doc in the list
  const [editingDocId, setEditingDocId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', url: '', stage: 'DRAFT', reviewed: false, category: 'Supplementary Specs' });

  const handleAdd = async () => {
    if (!newDoc.title.trim()) { setError('Title is required.'); return; }
    try {
      await dispatch(addSupplementaryDoc(newDoc)).unwrap();
      setNewDoc({ category: 'Supplementary Specs', title: '', url: '', stage: 'DRAFT', reviewed: false });
      setShowAdd(false);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to add doc.');
    }
  };

  const handleStartEdit = (doc) => {
    setEditingDocId(doc.id);
    setEditForm({ title: doc.title, url: doc.url, stage: doc.stage, reviewed: doc.reviewed, category: doc.category });
  };

  const handleSaveEdit = async (docId) => {
    if (!editForm.title.trim()) return;
    try {
      await dispatch(updateSupplementaryDoc({ docId, data: editForm })).unwrap();
      setEditingDocId(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section className="doc-section doc-section--animate">
      <Breadcrumb items={[{ label: 'Other Docs', id: 'all-other-docs' }]} onSelect={onSelect} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="doc-section__title" style={{ margin: 0 }}>All Other Docs</h1>
        {editing && !showAdd && (
          <button
            style={{ padding: '6px 16px', background: '#764ABC', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            onClick={() => setShowAdd(true)}
          >
            + Add Document
          </button>
        )}
      </div>
      <p className="doc-section__text">
        Access supplementary system specifications, API references, deployment checklists, and external service documentation.
      </p>

      {/* Add Document Form */}
      {editing && showAdd && (
        <div style={{ background: '#f5f3f7', border: '1px solid #764ABC', borderRadius: 10, padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#764ABC', marginBottom: 12 }}>Add Supplementary Document</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <select 
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
                value={newDoc.category} 
                onChange={e => setNewDoc({...newDoc, category: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input 
                style={{ flex: 2, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
                placeholder="Document title..."
                value={newDoc.title}
                onChange={e => setNewDoc({...newDoc, title: e.target.value})}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input 
                style={{ flex: 2, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
                placeholder="Document URL (optional)..."
                value={newDoc.url}
                onChange={e => setNewDoc({...newDoc, url: e.target.value})}
              />
              <select 
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
                value={newDoc.stage} 
                onChange={e => setNewDoc({...newDoc, stage: e.target.value})}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="REVIEW">REVIEW</option>
                <option value="FINAL">FINAL</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={newDoc.reviewed}
                  onChange={e => setNewDoc({...newDoc, reviewed: e.target.checked})}
                />
                Reviewed
              </label>
            </div>
            {error && <div style={{ color: '#c62828', fontSize: 13 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button style={{ padding: '8px 18px', background: '#764ABC', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }} onClick={handleAdd}>Save</button>
              <button style={{ padding: '8px 18px', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13 }} onClick={() => { setShowAdd(false); setError(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Render list by category */}
      {CATEGORIES.map(category => {
        const categoryDocs = docs.filter(d => d.category === category);
        if (!editing && categoryDocs.length === 0) return null;

        return (
          <div key={category} className="feature-block" style={{ marginBottom: 28 }}>
            <div className="feature-block__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="feature-bar" style={{ background: '#764ABC' }}></span>
                <h3 className="feature-block__name">{category}</h3>
              </div>
              <span className="doc-badge badge--pending" style={{ fontSize: 11 }}>
                {categoryDocs.length} item{categoryDocs.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="feature-block__table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Stage</th>
                    <th>Status</th>
                    {editing && <th style={{ width: 120, textAlign: 'center' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {categoryDocs.map(doc => {
                    const isEditingThis = editingDocId === doc.id;
                    return (
                      <tr key={doc.id}>
                        <td>
                          {isEditingThis ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <input 
                                style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                                value={editForm.title}
                                onChange={e => setEditForm({...editForm, title: e.target.value})}
                                placeholder="Title"
                              />
                              <input 
                                style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                                value={editForm.url}
                                onChange={e => setEditForm({...editForm, url: e.target.value})}
                                placeholder="URL (optional)"
                              />
                              <select 
                                style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                                value={editForm.category}
                                onChange={e => setEditForm({...editForm, category: e.target.value})}
                              >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          ) : doc.url ? (
                            <a href={doc.url} target="_blank" rel="noreferrer" className="doc-link">
                              {doc.title}
                            </a>
                          ) : (
                            doc.title
                          )}
                        </td>
                        <td>
                          {isEditingThis ? (
                            <select 
                              style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                              value={editForm.stage}
                              onChange={e => setEditForm({...editForm, stage: e.target.value})}
                            >
                              <option value="DRAFT">DRAFT</option>
                              <option value="REVIEW">REVIEW</option>
                              <option value="FINAL">FINAL</option>
                            </select>
                          ) : (
                            <span className={`doc-badge ${
                              doc.stage === 'FINAL' ? 'doc-badge--done' : doc.stage === 'REVIEW' ? 'doc-badge--review' : 'doc-badge--pending'
                            }`}>
                              {doc.stage}
                            </span>
                          )}
                        </td>
                        <td>
                          {isEditingThis ? (
                            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                              <input 
                                type="checkbox"
                                checked={editForm.reviewed}
                                onChange={e => setEditForm({...editForm, reviewed: e.target.checked})}
                              />
                              Reviewed
                            </label>
                          ) : (
                            <span className={`doc-badge ${doc.reviewed ? 'doc-badge--done' : 'doc-badge--pending'}`}>
                              {doc.reviewed ? 'Reviewed' : 'Pending Review'}
                            </span>
                          )}
                        </td>
                        {editing && (
                          <td>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                              {isEditingThis ? (
                                <>
                                  <button 
                                    style={{ background: '#1a5c32', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }}
                                    onClick={() => handleSaveEdit(doc.id)}
                                  >
                                    Save
                                  </button>
                                  <button 
                                    style={{ background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }}
                                    onClick={() => setEditingDocId(null)}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center' }}
                                    title="Edit"
                                    onClick={() => handleStartEdit(doc)}
                                  >
                                    <Pencil size={13} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {categoryDocs.length === 0 && (
                    <tr>
                      <td colSpan={editing ? 4 : 3} style={{ textAlign: 'center', color: '#999', padding: '16px' }}>
                        No documents under this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export function OverviewSection() {
  const platforms = useSelector(s => s.platforms.items) || [];
  const project = useSelector(s => s.project.data);
  const { editing } = useEdit();
  const dispatch = useDispatch();

  const pf = (field, value, type = 'textarea') => (
    <EditableField
      value={value || ''}
      onSave={v => dispatch(updateProjectField({ field, value: v }))}
      editing={editing}
      type={type}
    />
  );

  return (
    <></>
  );
}
