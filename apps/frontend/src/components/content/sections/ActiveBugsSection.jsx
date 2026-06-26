'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBug } from '@/store/slices/bugsSlice';
import { fetchStatuses, fetchSeverities } from '@/store/slices/statusesSlice';
import { Breadcrumb } from './SharedHelpers';
import CustomModal from '@/components/common/CustomModal';

export function ActiveBugsSection({ onSelect }) {
  const dispatch = useDispatch();
  const bugs = useSelector(s => s.bugs.items);
  const platforms = useSelector(s => s.platforms.items) || [];
  const [showNew, setShowNew] = useState(false);
  const statuses = useSelector(s => s.statuses.byType.bug) || [];
  const severities = useSelector(s => s.statuses.severities) || [];
  const [image, setImage] = useState('');
  const [form, setForm] = useState({ platformId: '', title: '', severityId: '', statusId: '', description: '' });

  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalState, setModalState] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });

  useEffect(() => {
    dispatch(fetchStatuses({ projectId: 1, type: 'bug' }));
    dispatch(fetchSeverities(1));
  }, [dispatch]);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setModalState({ isOpen: true, type: 'error', title: 'Invalid File', message: 'Please select an image file.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setModalState({ isOpen: true, type: 'error', title: 'File Too Large', message: 'Image must be 5 MB or smaller.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm({ platformId: '', title: '', severityId: '', statusId: '', description: '' });
    setImage('');
    setShowNew(false);
  };

  const handleCreate = async () => {
    if (!form.platformId || !form.title.trim()) {
      setModalState({ isOpen: true, type: 'error', title: 'Validation Error', message: 'Platform and title are required.' });
      return;
    }
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
      setModalState({ isOpen: true, type: 'error', title: 'Creation Failed', message: e.message || 'Failed to report bug.' });
    }
  };

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
      <CustomModal 
        {...modalState} 
        onClose={() => setModalState(s => ({ ...s, isOpen: false }))} 
        onConfirm={() => {
          if (modalState.onConfirm) modalState.onConfirm();
          setModalState(s => ({ ...s, isOpen: false }));
        }} 
      />
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

            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: '8px 18px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }} onClick={handleCreate}>Save</button>
              <button style={{ padding: '8px 18px', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13 }} onClick={resetForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {filteredBugs.length === 0 ? (
        <div className="feature-block" style={{ padding: 24, textAlign: 'center', color: '#999', fontSize: 14 }}>
          {hasActiveFilters ? 'No bugs match the current filters.' : 'No bugs reported yet.'}
        </div>
      ) : (
        platforms.filter(p => filteredBugs.some(b => b.platformId === p.id)).map(platform => {
          const platformBugs = filteredBugs.filter(b => b.platformId === platform.id);
          return (
            <div key={platform.id} className="feature-block" style={{ marginBottom: 24 }}>
              <div className="feature-block__header" style={{ cursor: 'pointer' }} onClick={() => onSelect(`platform-${platform.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="feature-bar" style={{ background: '#e53935' }}></span>
                  <h3 className="feature-block__name">{platform.name}</h3>
                </div>
                <span className="doc-badge badge--pending" style={{ fontSize: 11 }}>{platformBugs.length} bug{platformBugs.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}
