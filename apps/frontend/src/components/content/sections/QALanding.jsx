'use client';
import { useSelector } from 'react-redux';
import { Breadcrumb } from './SharedHelpers';

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
