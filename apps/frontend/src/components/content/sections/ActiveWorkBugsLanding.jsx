'use client';
import { useSelector } from 'react-redux';
import { Breadcrumb } from './SharedHelpers';

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
