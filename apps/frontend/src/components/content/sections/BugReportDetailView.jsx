'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateBugAsync, deleteBug } from '@/store/slices/bugsSlice';
import { fetchStatuses, fetchSeverities } from '@/store/slices/statusesSlice';
import { fetchUsers } from '@/store/slices/usersSlice';
import { useEdit } from '@/components/common/EditContext';
import { Breadcrumb } from './SharedHelpers';
import { ReviewStatusBadge } from '@/components/common/EntityWidgets';
import CustomModal from '@/components/common/CustomModal';

export function BugReportDetailView({ bugId, onSelect }) {
  const dispatch = useDispatch();
  const bug = useSelector(s => s.bugs.items.find(b => b.id === bugId));
  const statuses = useSelector(s => s.statuses.byType.bug) || [];
  const [statusDraft, setStatusDraft] = useState(null);
  const { editing } = useEdit();
  const severities = useSelector(s => s.statuses.severities) || [];
  const allUsers = useSelector(s => s.users.items) || [];

  const [draftTitle, setDraftTitle] = useState('');
  const [draftDesc, setDraftDesc] = useState('');
  const [draftSteps, setDraftSteps] = useState('');
  const [draftExpected, setDraftExpected] = useState('');
  const [draftErrorLog, setDraftErrorLog] = useState('');
  const [draftSeverity, setDraftSeverity] = useState('');
  const [draftAssignee, setDraftAssignee] = useState(null);
  const [draftImage, setDraftImage] = useState('');

  const [modalState, setModalState] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });

  useEffect(() => {
    dispatch(fetchStatuses({ projectId: 1, type: 'bug' }));
    dispatch(fetchSeverities(1));
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (bug) {
      setDraftTitle(bug.title || '');
      setDraftDesc(bug.description || '');
      setDraftSteps(bug.steps || '');
      setDraftExpected(bug.expectedFix || '');
      setDraftErrorLog(bug.errorLog || '');
      setDraftSeverity(bug.severity?.id || bug.severityId || '');
      setDraftAssignee(bug.assignedTo?.id || null);
    }
  }, [bug]);

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

  if (!bug) return <p>Not found</p>;
  const attachments = bug.attachments || [];

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
      <Breadcrumb items={[{ label: 'Bug Reporting', id: 'active-work-bugs' }, 'Bugs', bug.title]} onSelect={onSelect} />
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#fdf2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Bug Title</label>
            <input
              style={{ padding: '8px 12px', border: '1px solid #e53935', borderRadius: '6px', fontSize: '16px', fontWeight: '600', width: '100%', outline: 'none' }}
              value={draftTitle}
              onChange={e => setDraftTitle(e.target.value)}
              placeholder="Bug Title"
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Severity</label>
              <select
                style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '100%', outline: 'none', background: '#fff' }}
                value={draftSeverity}
                onChange={e => setDraftSeverity(Number(e.target.value))}
              >
                <option value="">Select Severity</option>
                {severities.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Status</label>
              <select
                style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '100%', outline: 'none', background: '#fff' }}
                value={statusDraft ?? (bug.status?.id || '')}
                onChange={e => setStatusDraft(Number(e.target.value))}
              >
                {statuses.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Assigned To</label>
              <select
                style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '100%', outline: 'none', background: '#fff' }}
                value={(draftAssignee ?? bug.assignedTo?.id) || ''}
                onChange={e => setDraftAssignee(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Unassigned</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name || u.username}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Description</label>
            <textarea
              style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '100%', minHeight: '80px', resize: 'vertical', outline: 'none' }}
              value={draftDesc}
              onChange={e => setDraftDesc(e.target.value)}
              placeholder="Description of the bug..."
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Steps to Reproduce</label>
            <textarea
              style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '100%', minHeight: '80px', resize: 'vertical', outline: 'none' }}
              value={draftSteps}
              onChange={e => setDraftSteps(e.target.value)}
              placeholder="1. Go to...\n2. Click..."
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Expected Behavior / Fix</label>
            <textarea
              style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '100%', minHeight: '80px', resize: 'vertical', outline: 'none' }}
              value={draftExpected}
              onChange={e => setDraftExpected(e.target.value)}
              placeholder="What should happen instead..."
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Error Log / Console Output</label>
            <textarea
              style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px', width: '100%', minHeight: '80px', resize: 'vertical', outline: 'none', background: '#fafafa' }}
              value={draftErrorLog}
              onChange={e => setDraftErrorLog(e.target.value)}
              placeholder="Paste stacktrace or error logs here..."
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Add New Screenshot / Attachment</label>
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
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', padding: '8px 16px', background: '#fff', color: '#e53935', border: '1px dashed #e53935', borderRadius: '6px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                🖼️ Attach new screenshot
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageSelect(e.target.files?.[0])} />
              </label>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
            <button
              style={{ padding: '8px 18px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              onClick={async () => {
                if (!draftTitle.trim()) {
                  setModalState({ isOpen: true, type: 'error', title: 'Validation Error', message: 'Title is required.' });
                  return;
                }
                const updates = {
                  id: bug.id,
                  title: draftTitle,
                  description: draftDesc,
                  steps: draftSteps,
                  expectedFix: draftExpected,
                  errorLog: draftErrorLog,
                  severityId: draftSeverity || undefined,
                };
                if (statusDraft !== null) {
                  updates.statusId = statusDraft;
                }
                updates.assignedToId = draftAssignee;
                if (draftImage) {
                  updates.imageUrl = draftImage;
                }
                try {
                  await dispatch(updateBugAsync(updates)).unwrap();
                  setDraftImage('');
                  setStatusDraft(null);
                  setModalState({ isOpen: true, type: 'success', title: 'Success', message: 'Bug report updated successfully!' });
                } catch (e) {
                  setModalState({ isOpen: true, type: 'error', title: 'Update Failed', message: e.message || 'Failed to update bug report.' });
                }
              }}
            >
              Save Changes
            </button>
            <button
              style={{ padding: '8px 18px', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
              onClick={() => {
                setDraftTitle(bug.title || '');
                setDraftDesc(bug.description || '');
                setDraftSteps(bug.steps || '');
                setDraftExpected(bug.expectedFix || '');
                setDraftErrorLog(bug.errorLog || '');
                setDraftSeverity(bug.severity?.id || bug.severityId || '');
                setDraftAssignee(bug.assignedTo?.id || null);
                setDraftImage('');
                setStatusDraft(null);
              }}
            >
              Reset
            </button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="doc-section__title" style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 12px 0' }}>
            {bug.title}
            <ReviewStatusBadge entityKey={`bug-${bug.id}`} />
          </h1>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: '#666' }}>Severity:</span>
            <span style={{
              background: bug.severity?.color || '#EF4444',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              {bug.severity?.name || 'High'}
            </span>

            <span style={{ width: '1px', height: '12px', background: '#ccc', margin: '0 8px' }}></span>

            <span style={{ fontSize: '13px', color: '#666' }}>Status:</span>
            <span style={{
              background: bug.status?.color || '#6B7280',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              {bug.status?.name || 'Open'}
            </span>

            <span style={{ width: '1px', height: '12px', background: '#ccc', margin: '0 8px' }}></span>

            <span style={{ fontSize: '13px', color: '#666' }}>Assigned To:</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              {bug.assignedTo ? (bug.assignedTo.name || bug.assignedTo.username) : 'Unassigned'}
            </span>
          </div>

          <p style={{ fontSize: '15px', lineHeight: 1.6, color: '#374151', whiteSpace: 'pre-wrap', marginBottom: '16px' }}>{bug.description}</p>

          {bug.steps && (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>Steps to Reproduce</h3>
              <div style={{ fontSize: '14px', color: '#4B5563', whiteSpace: 'pre-wrap', background: '#f9fafb', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                {bug.steps}
              </div>
            </div>
          )}

          {bug.expectedFix && (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>Expected Behavior / Fix</h3>
              <div style={{ fontSize: '14px', color: '#4B5563', whiteSpace: 'pre-wrap', background: '#f9fafb', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                {bug.expectedFix}
              </div>
            </div>
          )}

          {bug.errorLog && (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>Error Log / Stacktrace</h3>
              <pre style={{ fontSize: '12px', color: '#EF4444', whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: '#fdf2f2', padding: '12px', borderRadius: '6px', border: '1px solid #fecaca', overflowX: 'auto' }}>
                {bug.errorLog}
              </pre>
            </div>
          )}

          {statuses.length > 0 && !editing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: '#666' }}>Quick Status Update:</span>
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
                  onClick={async () => {
                    try {
                      await dispatch(updateBugAsync({ id: bug.id, statusId: statusDraft })).unwrap();
                      setStatusDraft(null);
                    } catch (e) {
                      setModalState({ isOpen: true, type: 'error', title: 'Status Update Failed', message: e.message || 'Failed to update status.' });
                    }
                  }}
                >✓</button>
              )}
            </div>
          )}

          {attachments.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Screenshots / Attachments</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {attachments.map(a => (
                  <img key={a.id} src={a.imageUrl} alt={a.caption || bug.title} style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, border: '1px solid #e8e8e8' }} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 24, borderTop: '1px solid #eee', paddingTop: 16 }}>
        <button
          style={{ padding: '6px 16px', background: '#fff', color: '#e53935', border: '1px solid #e53935', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
          onClick={() => {
            setModalState({
              isOpen: true,
              type: 'confirm',
              title: 'Delete Bug Report',
              message: 'Are you sure you want to delete this bug report?',
              confirmText: 'Delete',
              onConfirm: () => {
                dispatch(deleteBug(bug.id));
                onSelect('active-bugs');
              }
            });
          }}
        >
          Delete Bug Report
        </button>
      </div>

    </section>
  );
}
