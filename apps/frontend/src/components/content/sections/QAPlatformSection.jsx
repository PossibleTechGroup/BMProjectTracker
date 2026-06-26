'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQAByPlatform, createQAStory, deleteQAStory, updateQAStoryAsync } from '@/store/slices/qaSlice';
import { fetchStatuses } from '@/store/slices/statusesSlice';
import { fetchUsers } from '@/store/slices/usersSlice';
import { useEdit } from '@/components/common/EditContext';
import { Breadcrumb, StatusBadge } from './SharedHelpers';
import CustomModal from '@/components/common/CustomModal';

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

  const [filterStatus, setFilterStatus] = useState('');
  const [filterTester, setFilterTester] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalState, setModalState] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });

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
  const clearFilters = () => { setFilterStatus(''); setFilterTester(''); setSearchQuery(''); };

  const inputStyle = { padding: '8px 12px', border: '1px solid #c8e6c9', borderRadius: 6, fontSize: 13, outline: 'none' };
  const filterSelectStyle = {
    padding: '7px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, outline: 'none',
    background: '#fff', cursor: 'pointer', color: '#333', fontFamily: 'inherit',
  };

  return (
    <section className="doc-section doc-section--animate">
      <CustomModal {...modalState} onClose={() => setModalState(s => ({ ...s, isOpen: false }))} onConfirm={() => { if (modalState.onConfirm) modalState.onConfirm(); setModalState(s => ({ ...s, isOpen: false })); }} />
      <Breadcrumb items={[{ label: 'Quality Assurance', id: 'qa' }, platform.name]} onSelect={onSelect} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 className="doc-section__title" style={{ margin: 0 }}>QA: {platform.name}</h1>
        {!showNew && (
          <button style={{ padding: '6px 16px', background: '#1a5c32', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }} onClick={() => setShowNew(true)}>
            + New QA Story
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', padding: '12px 16px', background: '#fafafa', border: '1px solid #eee', borderRadius: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#666' }}>🔍</div>
        <input style={{ ...filterSelectStyle, flex: '1 1 180px', minWidth: 140 }} placeholder="Search QA stories..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        <select style={{ ...filterSelectStyle, flex: '0 1 160px' }} value={filterTester} onChange={e => setFilterTester(e.target.value)}>
          <option value="">All Testers</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name || u.username}</option>)}
        </select>
        <select style={{ ...filterSelectStyle, flex: '0 1 140px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {hasActiveFilters && (
          <button style={{ padding: '6px 14px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }} onClick={clearFilters}>✕ Clear</button>
        )}
      </div>

      <div style={{ marginBottom: 12, fontSize: 13, color: '#888' }}>
        {hasActiveFilters ? `Showing ${filteredStories.length} of ${stories.length} QA stor${stories.length !== 1 ? 'ies' : 'y'}` : `${stories.length} QA stor${stories.length !== 1 ? 'ies' : 'y'}`}
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
                    <select className="status-select" value={story.status?.id || story.statusId || ''} onChange={e => dispatch(updateQAStoryAsync({ id: story.id, statusId: Number(e.target.value) }))}>
                      {statuses.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                    </select>
                  ) : (
                    <StatusBadge status={story.status?.name || story.status} />
                  )}
                </td>
                {editing && (
                  <td>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#e53935' }}
                      onClick={e => {
                        e.stopPropagation();
                        setModalState({ isOpen: true, type: 'confirm', title: 'Delete QA Story', message: 'Are you sure?', confirmText: 'Delete', onConfirm: () => dispatch(deleteQAStory(story.id)) });
                      }}
                    >🗑️</button>
                  </td>
                )}
              </tr>
            ))}
            {filteredStories.length === 0 && (
              <tr><td colSpan={editing ? 5 : 4} style={{ textAlign: 'center', color: '#999', padding: 20 }}>{hasActiveFilters ? 'No QA stories match the current filters.' : 'No QA stories found.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
