'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateFeatureRequestAsync, deleteFeatureRequest } from '@/store/slices/featuresSlice';
import { fetchStatuses } from '@/store/slices/statusesSlice';
import { useEdit } from '@/components/common/EditContext';
import { Breadcrumb } from './SharedHelpers';
import { ReviewStatusBadge } from '@/components/common/EntityWidgets';
import CustomModal from '@/components/common/CustomModal';

export function FeatureRequestDetailView({ requestId, onSelect }) {
  const dispatch = useDispatch();
  const req = useSelector(s => s.features.items.find(f => f.id === requestId));
  const requestStatuses = useSelector(s => s.statuses.byType.request) || [];
  const [statusDraft, setStatusDraft] = useState(null);
  const { editing } = useEdit();
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDesc, setDraftDesc] = useState('');
  const [draftImage, setDraftImage] = useState('');

  const [modalState, setModalState] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });

  useEffect(() => {
    dispatch(fetchStatuses({ projectId: 1, type: 'request' }));
  }, [dispatch]);

  useEffect(() => {
    if (req) {
      setDraftTitle(req.title || '');
      setDraftDesc(req.description || '');
      setDraftImage(req.imageUrl || '');
    }
  }, [req]);

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
    reader.onload = () => setDraftImage(reader.result);
    reader.readAsDataURL(file);
  };

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
      <CustomModal 
        {...modalState} 
        onClose={() => setModalState(s => ({ ...s, isOpen: false }))} 
        onConfirm={() => {
          if (modalState.onConfirm) modalState.onConfirm();
          setModalState(s => ({ ...s, isOpen: false }));
        }} 
      />
      <Breadcrumb items={[{ label: 'Feature Requests', id: 'feature-requests' }, req.title]} onSelect={onSelect} />
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Title</label>
            <input
              style={{ padding: '8px 12px', border: '1px solid #764ABC', borderRadius: '6px', fontSize: '16px', fontWeight: '600', width: '100%', outline: 'none' }}
              value={draftTitle}
              onChange={e => setDraftTitle(e.target.value)}
              placeholder="Feature Request Title"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Description</label>
            <textarea
              style={{ padding: '8px 12px', border: '1px solid #764ABC', borderRadius: '6px', fontSize: '14px', width: '100%', minHeight: '120px', resize: 'vertical', outline: 'none' }}
              value={draftDesc}
              onChange={e => setDraftDesc(e.target.value)}
              placeholder="Write a description..."
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Image Attachment</label>
            {draftImage ? (
              <div style={{ position: 'relative', display: 'inline-block', alignSelf: 'flex-start' }}>
                <img src={draftImage} alt="Attachment preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid #e8e8e8', display: 'block' }} />
                <button
                  type="button"
                  style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                  onClick={() => setDraftImage('')}
                  title="Remove image"
                >×</button>
              </div>
            ) : (
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', padding: '8px 16px', background: '#fff', color: '#1a5c32', border: '1px dashed #1a5c32', borderRadius: '6px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                🖼️ Attach image
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageSelect(e.target.files?.[0])} />
              </label>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
            <button
              style={{ padding: '8px 18px', background: '#1a5c32', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              onClick={async () => {
                if (!draftTitle.trim()) {
                  setModalState({ isOpen: true, type: 'error', title: 'Validation Error', message: 'Title is required.' });
                  return;
                }
                try {
                  await dispatch(updateFeatureRequestAsync({
                    id: req.id,
                    title: draftTitle,
                    description: draftDesc,
                    imageUrl: draftImage
                  })).unwrap();
                  setModalState({ isOpen: true, type: 'success', title: 'Success', message: 'Feature request updated successfully!' });
                } catch (e) {
                  setModalState({ isOpen: true, type: 'error', title: 'Update Failed', message: e.message || 'Failed to update feature request.' });
                }
              }}
            >
              Save Changes
            </button>
            <button
              style={{ padding: '8px 18px', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
              onClick={() => {
                setDraftTitle(req.title || '');
                setDraftDesc(req.description || '');
                setDraftImage(req.imageUrl || '');
              }}
            >
              Reset
            </button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="doc-section__title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {req.title}
            <ReviewStatusBadge entityKey={`feature-request-${req.id}`} />
          </h1>
          <p style={{ fontSize: '15px', lineHeight: 1.6, color: '#374151', whiteSpace: 'pre-wrap', marginBottom: '16px' }}>{req.description}</p>
          {req.imageUrl && (
            <img src={req.imageUrl} alt={req.title} style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, border: '1px solid #e8e8e8', marginTop: 8 }} />
          )}
        </>
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
              onClick={async () => {
                try {
                  await dispatch(updateFeatureRequestAsync({ id: req.id, statusId: statusDraft })).unwrap();
                  setStatusDraft(null);
                } catch (e) {
                  setModalState({ isOpen: true, type: 'error', title: 'Status Update Failed', message: e.message || 'Failed to update status.' });
                }
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
            setModalState({
              isOpen: true,
              type: 'confirm',
              title: 'Delete Feature Request',
              message: 'Are you sure you want to delete this feature request?',
              confirmText: 'Delete',
              onConfirm: () => {
                dispatch(deleteFeatureRequest(req.id));
                onSelect(`fr-platform-${req.platformId}`);
              }
            });
          }}
        >
          Delete
        </button>
      </div>

    </section>
  );
}
