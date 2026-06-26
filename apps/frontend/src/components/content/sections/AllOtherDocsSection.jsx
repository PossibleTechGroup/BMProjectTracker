'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addSupplementaryDoc, updateSupplementaryDoc, deleteSupplementaryDoc } from '@/store/slices/projectSlice';
import { useEdit } from '@/components/common/EditContext';
import { Breadcrumb } from './SharedHelpers';
import { Pencil, Trash2 } from 'lucide-react';

const CATEGORIES = ["Supplementary Specs", "API References", "Deployment Guides", "External Services", "Other"];

export function AllOtherDocsSection({ onSelect }) {
  const dispatch = useDispatch();
  const project = useSelector(s => s.project.data);
  const { editing } = useEdit();
  const docs = project?.supplementaryDocs || [];
  
  const [showAdd, setShowAdd] = useState(false);
  const [newDoc, setNewDoc] = useState({ category: 'Supplementary Specs', title: '', url: '', stage: 'DRAFT', reviewed: false });
  const [error, setError] = useState('');

  const [editingDocId, setEditingDocId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', url: '', stage: 'DRAFT', reviewed: false, category: 'Supplementary Specs' });

  const handleAdd = async () => {
    if (!newDoc.title.trim()) { setError('Title is required.'); return; }
    try {
      await dispatch(addSupplementaryDoc(newDoc)).unwrap();
      setNewDoc({ category: 'Supplementary Specs', title: '', url: '', stage: 'DRAFT', reviewed: false });
      setShowAdd(false);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to add doc.');
    }
  };

  const handleStartEdit = (doc) => {
    setEditingDocId(doc.id);
    setEditForm({ title: doc.title, url: doc.url, stage: doc.stage, reviewed: doc.reviewed, category: doc.category });
  };

  const handleSaveEdit = async (docId) => {
    if (!editForm.title.trim()) return;
    try {
      await dispatch(updateSupplementaryDoc({ docId, data: editForm })).unwrap();
      setEditingDocId(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section className="doc-section doc-section--animate">
      <Breadcrumb items={[{ label: 'Other Docs', id: 'all-other-docs' }]} onSelect={onSelect} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="doc-section__title" style={{ margin: 0 }}>All Other Docs</h1>
        {editing && !showAdd && (
          <button
            style={{ padding: '6px 16px', background: '#764ABC', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            onClick={() => setShowAdd(true)}
          >
            + Add Document
          </button>
        )}
      </div>
      <p className="doc-section__text">
        Access supplementary system specifications, API references, deployment checklists, and external service documentation.
      </p>

      {editing && showAdd && (
        <div style={{ background: '#f5f3f7', border: '1px solid #764ABC', borderRadius: 10, padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#764ABC', marginBottom: 12 }}>Add Supplementary Document</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <select style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }} value={newDoc.category} onChange={e => setNewDoc({...newDoc, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input style={{ flex: 2, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }} placeholder="Document title..." value={newDoc.title} onChange={e => setNewDoc({...newDoc, title: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input style={{ flex: 2, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }} placeholder="Document URL (optional)..." value={newDoc.url} onChange={e => setNewDoc({...newDoc, url: e.target.value})} />
              <select style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }} value={newDoc.stage} onChange={e => setNewDoc({...newDoc, stage: e.target.value})}>
                <option value="DRAFT">DRAFT</option>
                <option value="REVIEW">REVIEW</option>
                <option value="FINAL">FINAL</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={newDoc.reviewed} onChange={e => setNewDoc({...newDoc, reviewed: e.target.checked})} />
                Reviewed
              </label>
            </div>
            {error && <div style={{ color: '#c62828', fontSize: 13 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button style={{ padding: '8px 18px', background: '#764ABC', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }} onClick={handleAdd}>Save</button>
              <button style={{ padding: '8px 18px', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13 }} onClick={() => { setShowAdd(false); setError(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {CATEGORIES.map(category => {
        const categoryDocs = docs.filter(d => d.category === category);
        if (!editing && categoryDocs.length === 0) return null;
        return (
          <div key={category} className="feature-block" style={{ marginBottom: 28 }}>
            <div className="feature-block__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="feature-bar" style={{ background: '#764ABC' }}></span>
                <h3 className="feature-block__name">{category}</h3>
              </div>
              <span className="doc-badge badge--pending" style={{ fontSize: 11 }}>{categoryDocs.length} item{categoryDocs.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="feature-block__table">
              <table>
                <thead><tr><th>Title</th><th>Stage</th><th>Status</th>{editing && <th style={{ width: 120, textAlign: 'center' }}>Actions</th>}</tr></thead>
                <tbody>
                  {categoryDocs.map(doc => {
                    const isEditingThis = editingDocId === doc.id;
                    return (
                      <tr key={doc.id}>
                        <td>
                          {isEditingThis ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <input style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }} value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="Title" />
                              <input style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }} value={editForm.url} onChange={e => setEditForm({...editForm, url: e.target.value})} placeholder="URL (optional)" />
                              <select style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }} value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          ) : doc.url ? (
                            <a href={doc.url} target="_blank" rel="noreferrer" className="doc-link">{doc.title}</a>
                          ) : doc.title}
                        </td>
                        <td>
                          {isEditingThis ? (
                            <select style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }} value={editForm.stage} onChange={e => setEditForm({...editForm, stage: e.target.value})}>
                              <option value="DRAFT">DRAFT</option>
                              <option value="REVIEW">REVIEW</option>
                              <option value="FINAL">FINAL</option>
                            </select>
                          ) : (
                            <span className={`doc-badge ${doc.stage === 'FINAL' ? 'doc-badge--done' : doc.stage === 'REVIEW' ? 'doc-badge--review' : 'doc-badge--pending'}`}>{doc.stage}</span>
                          )}
                        </td>
                        <td>
                          {isEditingThis ? (
                            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
                              <input type="checkbox" checked={editForm.reviewed} onChange={e => setEditForm({...editForm, reviewed: e.target.checked})} />
                              Reviewed
                            </label>
                          ) : (
                            <span className={`doc-badge ${doc.reviewed ? 'doc-badge--done' : 'doc-badge--pending'}`}>{doc.reviewed ? 'Reviewed' : 'Pending Review'}</span>
                          )}
                        </td>
                        {editing && (
                          <td>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                              {isEditingThis ? (
                                <>
                                  <button style={{ background: '#1a5c32', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }} onClick={() => handleSaveEdit(doc.id)}>Save</button>
                                  <button style={{ background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }} onClick={() => setEditingDocId(null)}>Cancel</button>
                                </>
                              ) : (
                                <>
                                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center' }} title="Edit" onClick={() => handleStartEdit(doc)}>
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', color: '#e53935' }}
                                    title="Delete"
                                    onClick={() => { if (confirm(`Delete "${doc.title}"?`)) { dispatch(deleteSupplementaryDoc(doc.id)); } }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {categoryDocs.length === 0 && (
                    <tr><td colSpan={editing ? 4 : 3} style={{ textAlign: 'center', color: '#999', padding: '16px' }}>No documents under this category.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </section>
  );
}
