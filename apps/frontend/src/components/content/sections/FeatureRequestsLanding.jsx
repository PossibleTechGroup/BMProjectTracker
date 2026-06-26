'use client';
import { useDispatch, useSelector } from 'react-redux';
import { useEdit } from '@/components/common/EditContext';
import { Breadcrumb } from './SharedHelpers';

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
