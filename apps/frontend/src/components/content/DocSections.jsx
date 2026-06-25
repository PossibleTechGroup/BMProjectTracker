'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveEdit } from '@/store/slices/editDataSlice';
import { updateProjectField, addResourceLink, updateResourceLink, deleteResourceLink, addGitRepo, updateGitRepo, deleteGitRepo } from '@/store/slices/projectSlice';
import { updatePlatformAsync } from '@/store/slices/platformsSlice';
import EditableField from '@/components/common/EditableField';
import { useEdit } from '@/components/common/EditContext';
import { Pencil } from 'lucide-react';
import t from '@/locales/en.json';

// Ensure a user-entered URL is absolute so it isn't resolved relative to the current host.
function toAbsoluteUrl(url) {
  if (!url) return url;
  const trimmed = url.trim();
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/* ---------- Helper: render text with **bold** markdown ---------- */
function RichText({ text }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
      )}
    </>
  );
}

/* ---------- Breadcrumb ---------- */
function Breadcrumb({ items, onSelect }) {
  return (
    <div className="doc-breadcrumb">
      <button className="doc-breadcrumb__home" onClick={() => onSelect && onSelect('overview')}>
        🏠
      </button>
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

/* ---------- Callout Box ---------- */
function Callout({ header, items }) {
  return (
    <div className="doc-callout">
      <div className="doc-callout__header">{header}</div>
      <ul className="doc-callout__list">
        {items.map((item, i) => (
          <li key={i}>
            {typeof item === 'string' ? <RichText text={item} /> : item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Bold-text list item ---------- */
function BoldListItem({ bold, text }) {
  return (
    <li>
      <strong>{bold}</strong> {text}
    </li>
  );
}

/* ============================================================
   OVERVIEW SECTION
   ============================================================ */
export function OverviewSection({ onSelect }) {
  const d = t.overview;
  const { editing } = useEdit();
  const dispatch = useDispatch();
  const project = useSelector(s => s.project.data) || {};

  // Editable field that saves to the backend project
  const pf = (field, value, type = 'textarea') => (
    <EditableField
      value={value || ''}
      onSave={v => dispatch(updateProjectField({ field, value: v }))}
      editing={editing}
      type={type}
    />
  );

  return (
    <section className="doc-section doc-section--animate" id="section-overview">
      <Breadcrumb items={[d.breadcrumb]} onSelect={onSelect} />
      <h1 className="doc-section__title">{pf('name', project?.name, 'text')} — Project Overview</h1>
      <Callout header={d.calloutHeader} items={d.calloutItems} />

      <h2 className="doc-section__heading">About This Documentation</h2>
      <p className="doc-section__text">{pf('aboutText', project?.aboutText, 'textarea')}</p>

      <h2 className="doc-section__heading">How to Navigate</h2>
      <p className="doc-section__text">{pf('navigateText', project?.navigateText, 'textarea')}</p>

      <h2 className="doc-section__heading">{d.sectionsHeading}</h2>
      <ul className="doc-section__list">
        {d.sectionsList.map((item, i) => (
          <BoldListItem key={i} bold={item.bold} text={item.text} />
        ))}
      </ul>
    </section>
  );
}

/* ============================================================
   INTRO SECTION
   ============================================================ */
export function IntroSection({ onSelect }) {
  const d = t.intro;
  const { editing } = useEdit();
  const dispatch = useDispatch();
  const project = useSelector(s => s.project.data);
  const edits = useSelector(s => s.editData);

  const ef = (key, value, type, options) => (
    <EditableField
      value={edits[key] ?? value}
      onSave={v => dispatch(saveEdit({ key, value: v }))}
      editing={editing}
      type={type}
      options={options}
    />
  );

  // Editable field that saves to the backend project
  const pf = (field, value, type = 'textarea') => (
    <EditableField
      value={value || ''}
      onSave={v => dispatch(updateProjectField({ field, value: v }))}
      editing={editing}
      type={type}
    />
  );

  return (
    <section className="doc-section doc-section--animate" id="section-intro">
      <Breadcrumb items={[{ label: t.sidebar.overview, id: 'overview' }, t.intro.breadcrumb]} onSelect={onSelect} />
      <h1 className="doc-section__title">{pf('name', project?.name, 'text')}</h1>
      <Callout header="About Project" items={[
        editing ? pf('description', project?.description, 'textarea') : (project?.description || "No description provided")
      ]} />

      <h2 className="doc-section__heading">Introduction</h2>
      <p className="doc-section__text">{pf('intro', project?.intro, 'textarea')}</p>
      
      <h2 className="doc-section__heading">Architecture Overview</h2>
      <p className="doc-section__text">{pf('architecture', project?.architecture, 'textarea')}</p>
    </section>
  );
}

/* ============================================================
   PLATFORMS OVERVIEW SECTION
   ============================================================ */
export function PlatformsOverviewSection() {
  const d = t.platformsOverview;
  const { editing } = useEdit();
  const dispatch = useDispatch();
  const edits = useSelector(s => s.editData);

  const ef = (key, value, type, options) => (
    <EditableField
      value={edits[key] ?? value}
      onSave={v => dispatch(saveEdit({ key, value: v }))}
      editing={editing}
      type={type}
      options={options}
    />
  );

  return (
    <section className="doc-section doc-section--animate" id="section-platforms">
      <Breadcrumb items={[t.sidebar.overview, d.breadcrumb]} />
      <h1 className="doc-section__title">{ef('platformsOverview.title', d.title)}</h1>
      <Callout header={ef('platformsOverview.calloutHeader', d.calloutHeader)} items={d.calloutItems} />

      <p className="doc-section__text">{editing ? ef('platformsOverview.overviewText', d.overviewText, 'textarea') : <RichText text={edits['platformsOverview.overviewText'] || d.overviewText} />}</p>

      <h2 className="doc-section__heading">{ef('platformsOverview.webHeading', d.webHeading)}</h2>
      <ul className="doc-section__list">
        {d.webList.map((item, i) => (
          <BoldListItem key={i} bold={item.bold} text={item.text} />
        ))}
      </ul>

      <h2 className="doc-section__heading">{ef('platformsOverview.mobileHeading', d.mobileHeading)}</h2>
      <ul className="doc-section__list">
        {d.mobileList.map((item, i) => (
          <BoldListItem key={i} bold={item.bold} text={item.text} />
        ))}
      </ul>
    </section>
  );
}

/* ============================================================
   INDIVIDUAL PLATFORM SECTION
   ============================================================ */
export function PlatformSection({ platformId }) {
  const platform = t.platforms[platformId];
  const { editing } = useEdit();
  const dispatch = useDispatch();
  const edits = useSelector(s => s.editData);

  const ef = (key, value, type, options) => (
    <EditableField
      value={edits[key] ?? value}
      onSave={v => dispatch(saveEdit({ key, value: v }))}
      editing={editing}
      type={type}
      options={options}
    />
  );
  if (!platform) return null;

  return (
    <section className="doc-section doc-section--animate" id={`section-${platformId}`}>
      <Breadcrumb items={[t.sidebar.overview, t.sidebar.platforms, platform.breadcrumb]} />
      <h1 className="doc-section__title">{ef(`platforms.${platformId}.name`, platform.name)}</h1>

      <Callout
        header="💡 ABOUT THIS PLATFORM"
        items={[
          <><strong>Type:</strong> {platform.type}</>,
          <><strong>Status:</strong> {platform.status}</>,
          ef(`platforms.${platformId}.description`, platform.description),
        ]}
      />

      <h2 className="doc-section__heading">{ef(`platforms.${platformId}.purposeHeading`, 'Purpose')}</h2>
      <p className="doc-section__text">{ef(`platforms.${platformId}.purpose`, platform.purpose)}</p>

      <h2 className="doc-section__heading">Key Features</h2>
      <ul className="doc-section__list">
        {platform.keyFeatures.map((feature, i) => (
          <li key={i}>{feature}</li>
        ))}
      </ul>
    </section>
  );
}

export function LinksSection({ onSelect }) {
  const project = useSelector(s => s.project.data) || {};
  const { editing } = useEdit();
  const dispatch = useDispatch();
  const [newLink, setNewLink] = useState(null);

  const docLinks = (project.resourceLinks || []).filter(l => l.category === 'Documentation' || l.category === 'API');
  const commLinks = (project.resourceLinks || []).filter(l => l.category === 'Communication');

  const handleAddLink = (category) => {
    setNewLink({ category, label: '', url: '' });
  };

  const handleSaveNewLink = () => {
    if (!newLink || !newLink.label || !newLink.url) return;
    dispatch(addResourceLink(newLink));
    setNewLink(null);
  };

  const handleDeleteLink = (linkId) => {
    dispatch(deleteResourceLink(linkId));
  };

  const handleUpdateLink = (linkId, field, value) => {
    dispatch(updateResourceLink({ linkId, data: { [field]: value } }));
  };

  const renderLink = (item) => (
    <li key={item.id} style={{ marginBottom: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      {editing ? (
        <>
          <EditableField value={item.label} onSave={v => handleUpdateLink(item.id, 'label', v)} editing={editing} type="text" />
          <span style={{ color: '#888' }}>—</span>
          <EditableField value={item.url} onSave={v => handleUpdateLink(item.id, 'url', v)} editing={editing} type="text" />
          <button onClick={() => handleDeleteLink(item.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }} title="Delete link">✕</button>
        </>
      ) : (
        <>
          <strong>{item.label}</strong>{' '}
          <a className="doc-link" href={toAbsoluteUrl(item.url)} target="_blank" rel="noopener noreferrer">{item.url}</a>
        </>
      )}
    </li>
  );

  return (
    <section className="doc-section doc-section--animate" id="section-links">
      <Breadcrumb items={[{ label: t.sidebar.overview, id: 'overview' }, t.links.breadcrumb]} onSelect={onSelect} />
      <h1 className="doc-section__title">Resources & Links</h1>
      <Callout header="🔗 RESOURCES" items={["Documentation, API collections, and design resources", "All links are internal to the organization"]} />

      <h2 className="doc-section__heading">Documentation Links</h2>
      <ul className="doc-section__list">
        {docLinks.map(renderLink)}
        {docLinks.length === 0 && !editing && (
          <li style={{ color: '#9CA3AF', fontSize: '14px' }}>No documentation links configured yet.</li>
        )}
      </ul>
      {editing && (
        <button className="doc-link" onClick={() => handleAddLink('Documentation')} style={{ marginBottom: '16px' }}>
          + Add Documentation Link
        </button>
      )}

      <h2 className="doc-section__heading">Communication</h2>
      <ul className="doc-section__list">
        {commLinks.map(renderLink)}
        {commLinks.length === 0 && !editing && (
          <li style={{ color: '#9CA3AF', fontSize: '14px' }}>No communication links configured yet.</li>
        )}
      </ul>
      {editing && (
        <button className="doc-link" onClick={() => handleAddLink('Communication')} style={{ marginBottom: '16px' }}>
          + Add Communication Link
        </button>
      )}

      {newLink && (
        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '12px' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600 }}>New {newLink.category} Link</h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              placeholder="Label (e.g. API Docs)"
              value={newLink.label}
              onChange={e => setNewLink({ ...newLink, label: e.target.value })}
              style={{ flex: 1, minWidth: '150px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
            />
            <input
              placeholder="URL (e.g. https://...)"
              value={newLink.url}
              onChange={e => setNewLink({ ...newLink, url: e.target.value })}
              style={{ flex: 2, minWidth: '200px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
            />
            <button onClick={handleSaveNewLink} style={{ padding: '8px 16px', background: '#593D8F', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Save</button>
            <button onClick={() => setNewLink(null)} style={{ padding: '8px 16px', background: '#e5e7eb', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
}

export function GitReposSection({ onSelect }) {
  const project = useSelector(s => s.project.data) || {};
  const platforms = useSelector(s => s.platforms.items) || [];
  const { editing } = useEdit();
  const dispatch = useDispatch();
  const [editingRepo, setEditingRepo] = useState(null);
  const [repoVal, setRepoVal] = useState('');
  const [newRepo, setNewRepo] = useState(null);

  const startEditRepo = (p) => {
    setEditingRepo(p.id);
    setRepoVal(p.repoUrl || '');
  };

  const saveRepoUrl = (p) => {
    if (repoVal !== p.repoUrl) {
      dispatch(updatePlatformAsync({ id: p.id, repoUrl: repoVal }));
    }
    setEditingRepo(null);
    setRepoVal('');
  };

  return (
    <section className="doc-section doc-section--animate" id="section-git-repos">
      <Breadcrumb items={[{ label: t.sidebar.overview, id: 'overview' }, t.gitRepos.breadcrumb]} onSelect={onSelect} />
      <h1 className="doc-section__title">Repository Links</h1>
      <Callout header="📦 REPOSITORIES" items={["All source code is hosted on GitHub", "Each platform has its own repository or exists within the monorepo"]} />

      {['Web', 'Mobile App', 'Backend', 'Other'].map(type => {
        const typePlatforms = platforms.filter(p => (p.type || 'Other').includes(type) || (type === 'Other' && !['Web', 'Mobile App', 'Backend'].some(t => (p.type || '').includes(t))));
        if (typePlatforms.length === 0) return null;

        return (
          <div key={type} style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#593D8F', marginBottom: '8px' }}>
              {type === 'Mobile App' ? 'Mobile App Repositories' : type === 'Web' ? 'Web Platform Repositories' : `${type} Repositories`}
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {typePlatforms.map(p => (
                <li key={p.id} style={{ marginBottom: '6px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <strong>{p.name} Git Repo:</strong>
                  {editing && editingRepo === p.id ? (
                    <>
                      <input
                        style={{ flex: 1, minWidth: 200, padding: '4px 8px', border: '1px solid #c8e6c9', borderRadius: 4, fontSize: 13, outline: 'none' }}
                        value={repoVal}
                        onChange={e => setRepoVal(e.target.value)}
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') saveRepoUrl(p); if (e.key === 'Escape') setEditingRepo(null); }}
                      />
                      <button style={{ padding: '4px 10px', background: '#1a5c32', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }} onClick={() => saveRepoUrl(p)}>Save</button>
                      <button style={{ padding: '4px 10px', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 12 }} onClick={() => setEditingRepo(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      {p.repoUrl ? (
                        <a href={p.repoUrl.startsWith('http') ? p.repoUrl : `https://${p.repoUrl}`} target="_blank" rel="noreferrer" style={{ color: '#2196F3', textDecoration: 'none' }}>
                          {p.repoUrl.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span style={{ color: '#9CA3AF' }}>Not configured</span>
                      )}
                      {editing && (
                        <button style={{ background: 'none', border: 'none', color: '#1a5c32', cursor: 'pointer', fontSize: 12, padding: '2px 6px', display: 'inline-flex', alignItems: 'center' }} onClick={() => startEditRepo(p)}>
                          <Pencil size={12} />
                        </button>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#593D8F', margin: 0 }}>Shared / Infrastructure Repositories</h3>
          {editing && (
            <button style={{ padding: '4px 12px', background: '#1a5c32', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 }} onClick={() => setNewRepo({ name: '', url: '' })}>
              + Add Repo
            </button>
          )}
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {(project.gitRepositories || []).map(repo => (
            <li key={repo.id} style={{ marginBottom: '6px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {editing ? (
                <>
                  <EditableField value={repo.name} onSave={v => dispatch(updateGitRepo({ repoId: repo.id, data: { name: v } }))} editing={editing} type="text" />
                  <span style={{ color: '#888' }}>—</span>
                  <EditableField value={repo.url} onSave={v => dispatch(updateGitRepo({ repoId: repo.id, data: { url: v } }))} editing={editing} type="text" />
                  <button onClick={() => dispatch(deleteGitRepo(repo.id))} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }} title="Delete">✕</button>
                </>
              ) : (
                <>
                  <strong>{repo.name}:</strong> <a href={toAbsoluteUrl(repo.url)} target="_blank" rel="noreferrer" style={{ color: '#2196F3', textDecoration: 'none' }}>{repo.url}</a>
                </>
              )}
            </li>
          ))}
          {(project.gitRepositories || []).length === 0 && !editing && (
            <li style={{ color: '#9CA3AF', fontSize: '14px' }}>No shared repositories configured.</li>
          )}
        </ul>
        {newRepo && (
          <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input placeholder="Repo name" value={newRepo.name} onChange={e => setNewRepo({ ...newRepo, name: e.target.value })}
                style={{ flex: 1, minWidth: '150px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
              <input placeholder="Repo URL" value={newRepo.url} onChange={e => setNewRepo({ ...newRepo, url: e.target.value })}
                style={{ flex: 2, minWidth: '200px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
              <button onClick={() => { if (newRepo.name && newRepo.url) { dispatch(addGitRepo(newRepo)); setNewRepo(null); } }}
                style={{ padding: '8px 16px', background: '#593D8F', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Save</button>
              <button onClick={() => setNewRepo(null)}
                style={{ padding: '8px 16px', background: '#e5e7eb', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
