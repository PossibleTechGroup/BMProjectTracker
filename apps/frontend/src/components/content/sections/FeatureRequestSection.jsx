'use client';
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createFeatureRequest, deleteFeatureRequest, fetchFeatureRequests, updateFeatureRequestAsync } from '@/store/slices/featuresSlice';
import { fetchStatuses } from '@/store/slices/statusesSlice';
import { useEdit } from '@/components/common/EditContext';
import { Breadcrumb, StatusBadge } from './SharedHelpers';
import CustomModal from '@/components/common/CustomModal';

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

  const [modalState, setModalState] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });

  useEffect(() => {
    dispatch(fetchStatuses({ projectId: 1, type: 'request' }));
    dispatch(fetchFeatureRequests(platformId));
  }, [dispatch, platformId]);

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
      <CustomModal 
        {...modalState} 
        onClose={() => setModalState(s => ({ ...s, isOpen: false }))} 
        onConfirm={() => {
          if (modalState.onConfirm) modalState.onConfirm();
          setModalState(s => ({ ...s, isOpen: false }));
        }} 
      />
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
                        onClick={async () => {
                          try {
                            await dispatch(updateFeatureRequestAsync({ id: req.id, statusId: statusDrafts[req.id] })).unwrap();
                            setStatusDrafts(d => { const n = { ...d }; delete n[req.id]; return n; });
                          } catch(e) {
                            setModalState({ isOpen: true, type: 'error', title: 'Update Failed', message: e.message || 'Failed to update status.' });
                          }
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
                    onClick={e => {
                      e.stopPropagation();
                      setModalState({
                        isOpen: true,
                        type: 'confirm',
                        title: 'Delete Request',
                        message: 'Are you sure you want to delete this request?',
                        confirmText: 'Delete',
                        onConfirm: () => dispatch(deleteFeatureRequest(req.id))
                      });
                    }}
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
