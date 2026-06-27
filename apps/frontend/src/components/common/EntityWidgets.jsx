'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchReviews, markReviewed } from '@/store/slices/reviewsSlice';

/* ============================================================
   ReviewStatusBadge — top-right header badge showing review state
   ============================================================ */
export function ReviewStatusBadge({ entityKey }) {
  const dispatch = useDispatch();
  const [hovered, setHovered] = useState(false);
  const currentUser = useSelector(s => s.ui.currentUser);
  const reviews = useSelector(s => s.reviews.byEntity[entityKey]) || [];
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchReviews(entityKey));
  }, [dispatch, entityKey]);

  const handleMarkReviewed = async (e) => {
    e.stopPropagation();
    if (loading) return;
    try {
      setLoading(true);
      await dispatch(markReviewed(entityKey)).unwrap();
    } catch (err) {
      console.error('Failed to mark as reviewed', err);
    } finally {
      setLoading(false);
    }
  };

  const hasReviewed = reviews.some(r => r.userId === currentUser?.id);

  if (reviews.length === 0) {
    return (
      <span 
        onClick={handleMarkReviewed}
        style={{ 
          fontSize: 12, padding: '4px 10px', borderRadius: 6, 
          background: '#ffebee', color: '#c62828', fontWeight: 600, 
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
          border: '1px solid #ffb3b3',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'all 0.15s ease',
          userSelect: 'none'
        }}
        title="Click to Mark as Reviewed"
        onMouseEnter={e => { 
          e.currentTarget.style.background = '#ffcdd2'; 
          e.currentTarget.style.borderColor = '#ff9999';
        }}
        onMouseLeave={e => { 
          e.currentTarget.style.background = '#ffebee'; 
          e.currentTarget.style.borderColor = '#ffb3b3';
        }}
      >
        <span>Unreviewed by you</span>
        <span style={{ fontSize: 13, lineHeight: 1 }}>☑</span>
      </span>
    );
  }

  const namesStr = reviews.map(r => r.userName).join(', ');

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, position: 'relative' }}>
      <span 
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ 
          fontSize: 12, padding: '4px 10px', borderRadius: 6, 
          background: '#e8f5e9', color: '#2e7d32', fontWeight: 600,
          border: '1px solid #c8e6c9', cursor: 'pointer',
          position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 4
        }}
      >
        <span>✓ Reviewed by {namesStr.length > 25 ? `${reviews.length} people` : namesStr}</span>
        
        {hovered && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 6,
            background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8,
            padding: '10px 14px', boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            zIndex: 100, width: 240, color: '#333', fontWeight: 400,
            textAlign: 'left', pointerEvents: 'none'
          }}>
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6, borderBottom: '1px solid #eee', paddingBottom: 4, color: '#2e7d32' }}>
              Review History ({reviews.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
              {reviews.map(r => (
                <div key={r.id} style={{ fontSize: 11 }}>
                  <strong style={{ color: '#333' }}>{r.userName}</strong>
                  <div style={{ color: '#888', fontSize: 10 }}>{new Date(r.reviewedAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </span>
      {!hasReviewed && (
        <button
          onClick={handleMarkReviewed}
          disabled={loading}
          style={{
            background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 6,
            padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)', display: 'inline-flex', alignItems: 'center', gap: 4
          }}
          title="Add your review"
        >
          <span>+ Review</span>
        </button>
      )}
    </div>
  );
}

/* ============================================================
   ReviewOverlay — fixed bottom-right prompt for unreviewed pages
   ============================================================ */
export function ReviewOverlay({ entityKey }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(s => s.ui.currentUser);
  const reviews = useSelector(s => s.reviews.byEntity[entityKey]) || [];
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchReviews(entityKey));
  }, [dispatch, entityKey]);

  const handleMarkReviewed = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await dispatch(markReviewed(entityKey)).unwrap();
    } catch (e) {
      console.error('Failed to mark as reviewed', e);
    } finally {
      setLoading(false);
    }
  };

  const hasReviewed = reviews.some(r => r.userId === currentUser?.id);

  if (hasReviewed) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 30, right: 30, background: '#fff', border: '1px solid #e0e0e0',
      borderRadius: 12, padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      zIndex: 1000, display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit',
    }}>
      <div style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>Not reviewed by you yet</span>
        <button
          onClick={handleMarkReviewed}
          disabled={loading}
          style={{
            background: '#1a5c32', color: '#fff', border: 'none', borderRadius: 6,
            padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
          }}
        >
          {loading ? 'Processing...' : 'Mark as Reviewed'}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   NeedsReviewBanner — prominent top-of-page banner
   ============================================================ */
export function NeedsReviewBanner({ entityKey }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(s => s.ui.currentUser);
  const reviews = useSelector(s => s.reviews.byEntity[entityKey]) || [];
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entityKey) dispatch(fetchReviews(entityKey));
  }, [dispatch, entityKey]);

  if (!entityKey) return null;

  const hasReviewed = reviews.some(r => r.userId === currentUser?.id);
  if (hasReviewed) return null;

  if (reviews.length === 0) {
    return (
      <div style={{
        background: '#fff3e0', border: '1px solid #ffcc02', borderRadius: 10,
        padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center',
        gap: 14, fontSize: 14, color: '#7a5800',
      }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>⚠️</span>
        <span style={{ flex: 1 }}><strong>This page has never been reviewed.</strong> Please review the content and mark it as reviewed.</span>
        <button
          onClick={async () => {
            setLoading(true);
            try { await dispatch(markReviewed(entityKey)).unwrap(); } catch (e) { console.error(e); }
            setLoading(false);
          }}
          disabled={loading}
          style={{
            background: '#7a5800', color: '#fff', border: 'none', borderRadius: 6,
            padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? '...' : 'Mark as Reviewed'}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fff3e0', border: '1px solid #ffcc02', borderRadius: 10,
      padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center',
      gap: 14, fontSize: 14, color: '#7a5800',
    }}>
      <span style={{ fontSize: 20, lineHeight: 1 }}>⚠️</span>
      <span style={{ flex: 1 }}>
        <strong>This page has changes you haven&apos;t reviewed yet.</strong> The content was modified since your last review. Please re-review.
      </span>
      <button
        onClick={async () => {
          setLoading(true);
          try { await dispatch(markReviewed(entityKey)).unwrap(); } catch (e) { console.error(e); }
          setLoading(false);
        }}
        disabled={loading}
        style={{
          background: '#7a5800', color: '#fff', border: 'none', borderRadius: 6,
          padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {loading ? '...' : 'Mark as Reviewed'}
      </button>
    </div>
  );
}

/* ============================================================
   EntityMetadataFooter — "Created at … by … • Last updated at … by …"
   ============================================================ */
export function EntityMetadataFooter({ createdAt, updatedAt, createdBy, updatedBy, show }) {
  if (!show || (!createdAt && !updatedAt)) return null;
  return (
    <div style={{ fontSize: 12, color: '#999', marginTop: 24, marginBottom: 16, fontStyle: 'italic', textAlign: 'right' }}>
      {createdAt && (
        <span>
          Created at {new Date(createdAt).toLocaleString()}
          {createdBy && <span style={{ color: '#777' }}> by <strong style={{ color: '#666', fontStyle: 'normal' }}>{createdBy}</strong></span>}
        </span>
      )}
      {createdAt && updatedAt && <span> &bull; </span>}
      {updatedAt && (
        <span>
          Last updated at {new Date(updatedAt).toLocaleString()}
          {updatedBy && <span style={{ color: '#777' }}> by <strong style={{ color: '#666', fontStyle: 'normal' }}>{updatedBy}</strong></span>}
        </span>
      )}
    </div>
  );
}
