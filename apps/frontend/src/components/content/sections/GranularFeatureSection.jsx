'use client';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateFeature, deleteFeature, createSubTask, updateSubTaskAsync, deleteSubTask } from '@/store/slices/platformsSlice';
import { fetchStatuses } from '@/store/slices/statusesSlice';
import { fetchUsers } from '@/store/slices/usersSlice';
import { useEdit } from '@/components/common/EditContext';
import { Breadcrumb, FeatureBar, StatusBadge } from './SharedHelpers';
import { ReviewStatusBadge } from '@/components/common/EntityWidgets';
import { Pencil } from 'lucide-react';

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
  const [showAddSubTaskModal, setShowAddSubTaskModal] = useState(false);
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
  }, [editing, draftTitle, draftDesc, feature, dispatch]);

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
              placeholder="Write a detailed description of this feature..."
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 16 }}>
        <h2 className="doc-section__heading" style={{ margin: 0 }}>Sub-Tasks</h2>
        {editing && (
          <button
            style={{
              padding: '6px 16px', background: '#1a5c32', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600
            }}
            onClick={() => setShowAddSubTaskModal(true)}
          >
            + Add Sub-Task
          </button>
        )}
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

      {showAddSubTaskModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)',
        }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>Create New Sub-Task</h3>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Task Name</label>
              <input
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}
                value={newSubTask}
                onChange={e => setNewSubTask(e.target.value)}
                placeholder="Enter subtask name..."
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') { handleAddSubTask(); setShowAddSubTaskModal(false); }
                  if (e.key === 'Escape') { setShowAddSubTaskModal(false); setNewSubTask(''); }
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button style={{ padding: '8px 16px', background: '#fff', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }} onClick={() => { setShowAddSubTaskModal(false); setNewSubTask(''); }}>Cancel</button>
              <button style={{ padding: '8px 16px', background: '#1a5c32', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }} onClick={() => { handleAddSubTask(); setShowAddSubTaskModal(false); }}>Create</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
