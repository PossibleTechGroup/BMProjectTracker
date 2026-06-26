'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateQAStoryAsync } from '@/store/slices/qaSlice';
import { fetchStatuses } from '@/store/slices/statusesSlice';
import { fetchUsers } from '@/store/slices/usersSlice';
import { Breadcrumb } from './SharedHelpers';
import { ReviewStatusBadge } from '@/components/common/EntityWidgets';

export function QAStoryDetailView({ storyId, onSelect }) {
  const dispatch = useDispatch();
  const story = useSelector(s => s.qa.items.find(st => st.id === storyId));
  const users = useSelector(s => s.users.items) || [];
  const statuses = useSelector(s => s.statuses.byType.qa) || [];
  const [statusDraft, setStatusDraft] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchStatuses({ projectId: 1, type: 'qa' }));
  }, [dispatch]);

  if (!story) return <p>Loading...</p>;

  const update = (data) => dispatch(updateQAStoryAsync({ id: story.id, ...data }));
  const dateValue = story.lastTested ? new Date(story.lastTested).toISOString().slice(0, 10) : '';
  const rowStyle = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 };
  const labelStyle = { width: 110, fontSize: 14, color: '#666', fontWeight: 600 };

  return (
    <section className="doc-section doc-section--animate">
      <Breadcrumb items={[{ label: 'Quality Assurance', id: 'qa' }, 'Stories', story.storyCode]} onSelect={onSelect} />
      <h1 className="doc-section__title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {story.storyCode}: {story.title}
        <ReviewStatusBadge entityKey={`qa-story-${story.id}`} />
      </h1>

      <div className="doc-callout" style={{ padding: 16 }}>
        <div className="doc-callout__header" style={{ marginBottom: 12 }}>QA Details</div>
        <div style={rowStyle}>
          <span style={labelStyle}>Tester</span>
          <select className="status-select" value={story.testerId || ''} onChange={e => update({ testerId: e.target.value ? Number(e.target.value) : null })}>
            <option value="">Unassigned</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name || u.username}</option>)}
          </select>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Last Tested</span>
          <input type="date" className="status-select" style={{ paddingRight: 12 }} value={dateValue} onChange={e => update({ lastTested: e.target.value ? new Date(e.target.value).toISOString() : null })} />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Status</span>
          <select className="status-select" value={statusDraft ?? (story.statusId || '')} onChange={e => setStatusDraft(Number(e.target.value))}>
            {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {statusDraft != null && statusDraft !== story.statusId && (
            <button className="status-save-btn" title="Save status" onClick={() => { update({ statusId: statusDraft }); setStatusDraft(null); }}>✓</button>
          )}
        </div>
      </div>

      <h2 className="doc-section__heading">Description</h2>
      <p className="doc-section__text">{story.description}</p>
      <h2 className="doc-section__heading">Steps</h2>
      <ol style={{ marginLeft: '20px' }}>
        {(story.steps || []).map(step => (
          <li key={step.id}>{step.instruction}</li>
        ))}
      </ol>

    </section>
  );
}
