'use client';

export function Breadcrumb({ items, onSelect }) {
  return (
    <div className="doc-breadcrumb">
      <button className="doc-breadcrumb__home" onClick={() => onSelect && onSelect('overview')}>🏠</button>
      {items.map((item, i) => {
        const label = typeof item === 'string' ? item : item.label;
        const id = typeof item === 'string' ? null : item.id;
        return (
          <span key={i}>
            <span className="doc-breadcrumb__sep">›</span>
            {i === items.length - 1 ? (
              <span className="doc-breadcrumb__current">{label}</span>
            ) : id && onSelect ? (
              <button className="doc-breadcrumb__link" onClick={() => onSelect(id)}>{label}</button>
            ) : (
              <span>{label}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export function Callout({ header, items }) {
  return (
    <div className="doc-callout">
      <div className="doc-callout__header">{header}</div>
      <ul className="doc-callout__list">
        {items.map((item, i) => <li key={i}>{typeof item === 'string' ? item : item}</li>)}
      </ul>
    </div>
  );
}

export function StatusBadge({ status }) {
  const s = status ? status.toLowerCase() : 'pending';
  const cls = s === 'done' || s === 'resolved' || s === 'passed' ? 'badge--done' :
    s === 'in-progress' ? 'badge--in-progress' :
      s === 'review' ? 'badge--review' : 'badge--pending';
  return <span className={`doc-badge ${cls}`}>{status || 'Pending'}</span>;
}

export function FeatureBar({ color }) {
  return <span className="feature-bar" style={{ background: color || '#2196F3' }} />;
}

// Ensure a user-entered URL is absolute so it isn't resolved relative to the current host.
export function toAbsoluteUrl(url) {
  if (!url) return url;
  const trimmed = url.trim();
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
