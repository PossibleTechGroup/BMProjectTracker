'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/slices/uiSlice';
import { saveEdit } from '@/store/slices/editDataSlice';
import { ChevronRight, ChevronLeft, LogOut, Users, Pencil } from 'lucide-react';
import EditableField from '@/components/common/EditableField';
import t from '@/locales/en.json';

const sidebarData = [
  {
    id: 'overview',
    label: t.sidebar.overview,
    defaultOpen: true,
    children: [
      { id: 'intro', label: t.sidebar.intro },
      { id: 'links', label: t.sidebar.links },
      { id: 'git-repos', label: t.sidebar.gitRepos },
    ],
  },
  {
    id: 'granular-docs',
    label: 'Documentation',
    defaultOpen: false,
    children: [
      {
        id: 'granular-admin',
        label: 'Admin Panel',
        children: [
          { id: 'feat-admin-login', label: 'Login' },
          { id: 'feat-admin-analytics', label: 'Dashboard Analytics' },
          { id: 'feat-admin-logs', label: 'Global System Audit Logs' },
        ],
      },
      {
        id: 'granular-callcenter',
        label: 'Call Center',
        children: [
          { id: 'feat-cc-agent', label: 'Agent Dashboard' },
          { id: 'feat-cc-escalation', label: 'Escalation Management' },
        ],
      },
      {
        id: 'granular-merchant-panel',
        label: 'Merchant Panel',
        children: [
          { id: 'feat-mp-products', label: 'Product Management' },
          { id: 'feat-mp-payout', label: 'Payout Dashboard' },
        ],
      },
      {
        id: 'granular-corporate',
        label: 'Corporate Panel',
        children: [
          { id: 'feat-corp-orders', label: 'Bulk Order Management' },
          { id: 'feat-corp-role', label: 'Role Permission Matrix' },
        ],
      },
      {
        id: 'granular-customer',
        label: 'BM-Customer-ET',
        children: [
          { id: 'feat-cust-reg', label: 'User Registration & OTP Auth' },
          { id: 'feat-cust-tracking', label: 'Order Real-time Tracking' },
        ],
      },
      {
        id: 'granular-driver',
        label: 'BM-Driver-ET',
        children: [
          { id: 'feat-drv-dispatch', label: 'Dispatch Accept/Reject' },
          { id: 'feat-drv-proof', label: 'Delivery Proof Logging' },
        ],
      },
      {
        id: 'granular-merchant-app',
        label: 'Merchant App',
        children: [
          { id: 'feat-ma-dispatch', label: 'Instant Order Dispatches' },
          { id: 'feat-ma-alerts', label: 'Order Fulfillment Alerts' },
        ],
      },
    ],
  },
  {
    id: 'feature-requests',
    label: 'Feature Requests',
    defaultOpen: false,
    children: [
      { id: 'fr-admin', label: 'Admin Panel' },
      { id: 'fr-merchant-app', label: 'Merchant App' },
      { id: 'fr-customer', label: 'Client App' },
    ],
  },
  {
    id: 'active-work-bugs',
    label: 'Bug Reporting',
    defaultOpen: false,
    children: [
      { id: 'active-bugs', label: 'Active Bugs' },
    ],
  },
  {
    id: 'qa',
    label: 'QA',
    defaultOpen: false,
    children: [
      { id: 'qa-landing', label: 'QA Overview' },
      {
        id: 'qa-admin',
        label: 'Admin Panel QA',
        children: [
          { id: 'qa-admin-us1', label: 'US-001: Admin Login Auth' },
          { id: 'qa-admin-us2', label: 'US-002: Dashboard Analytics' },
        ],
      },
      {
        id: 'qa-callcenter',
        label: 'Call Center QA',
        children: [
          { id: 'qa-cc-us1', label: 'US-003: Agent Call Queue' },
        ],
      },
      {
        id: 'qa-merchant-panel',
        label: 'Merchant Panel QA',
        children: [
          { id: 'qa-mp-us1', label: 'US-004: Product CRUD' },
        ],
      },
      {
        id: 'qa-corporate',
        label: 'Corporate Panel QA',
        children: [
          { id: 'qa-corp-us1', label: 'US-005: Bulk Order Upload' },
        ],
      },
      {
        id: 'qa-customer',
        label: 'BM-Customer-ET QA',
        children: [
          { id: 'qa-cust-us1', label: 'US-006: OTP Auth Flow' },
        ],
      },
      {
        id: 'qa-driver',
        label: 'BM-Driver-ET QA',
        children: [
          { id: 'qa-drv-us1', label: 'US-007: Dispatch Flow' },
        ],
      },
      {
        id: 'qa-merchant-app',
        label: 'Merchant App QA',
        children: [
          { id: 'qa-ma-us1', label: 'US-008: Order Dispatch Alert' },
        ],
      },
    ],
  },
  {
    id: 'all-other-docs',
    label: 'All Other Docs',
    defaultOpen: false,
  },
];

function SidebarItem({ item, activeSection, onSelect, depth = 0 }) {
  const [open, setOpen] = useState(item.defaultOpen || false);
  const [showTooltip, setShowTooltip] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = activeSection === item.id;

  const handleClick = () => {
    if (hasChildren) setOpen(!open);
    onSelect(item.id);
  };

  return (
    <div className="doc-nav-item"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        className={`doc-nav-item__btn ${isActive ? 'doc-nav-item__btn--active' : ''} doc-nav-item__btn--depth-${depth}`}
        onClick={handleClick}
        style={{ paddingLeft: `${12 + depth * 14}px` }}
      >
        <span className="doc-nav-item__label">{item.label}</span>
        {hasChildren && (
          <span className={`doc-nav-item__chevron ${open ? 'doc-nav-item__chevron--open' : ''}`}>
            <ChevronRight size={14} />
          </span>
        )}
      </button>
      {showTooltip && !hasChildren && (
        <div className="doc-nav-item__tooltip">
          <div className="doc-nav-item__tooltip-title">{item.label}</div>
          <div className="doc-nav-item__tooltip-id">{item.id}</div>
        </div>
      )}
      {hasChildren && (
        <div className={`doc-nav-item__children ${open ? 'doc-nav-item__children--open' : ''}`}>
          {item.children.map((child) => (
            <SidebarItem key={child.id} item={child} activeSection={activeSection} onSelect={onSelect} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocSidebar({ activeSection, onSelect, isWide, onToggleWide }) {
  const currentUser = useSelector(s => s.ui.currentUser);
  const customPlatforms = useSelector(s => s.editData.customPlatforms || []);
  const edits = useSelector(s => s.editData);
  const sidebarTitle = edits['sidebar.title'] || 'BM Ecosystem';
  const sidebarSubtitle = edits['sidebar.subtitle'] || 'Full Project Documentation';
  const dispatch = useDispatch();
  const router = useRouter();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftSubtitle, setDraftSubtitle] = useState('');

  const handleStartEdit = () => {
    setDraftTitle(sidebarTitle);
    setDraftSubtitle(sidebarSubtitle);
    setIsEditingHeader(true);
  };

  const platforms = useSelector(s => s.platforms.items);

  const customDocItems = customPlatforms.map(p => ({
    id: p.id,
    label: p.data.name,
  }));

  const dynamicDocs = platforms.filter(Boolean).map(p => ({
    id: `platform-${p.id}`,
    label: p.name,
    children: (p.features || []).map(f => ({
      id: `feature-${f.id}`,
      label: f.title || f.name || 'Unnamed Feature'
    }))
  }));

  const dynamicQA = platforms.filter(Boolean).map(p => ({
    id: `qa-platform-${p.id}`,
    label: p.name,
    // Add stories if we fetch them. For now just placeholder
    children: [],
  }));

  const editableSidebarData = [
    sidebarData[0], // overview
    {
      ...sidebarData[1], // Documentation
      children: [
        ...dynamicDocs,
        ...customDocItems,
      ],
    },
    {
      ...sidebarData[2], // Feature Requests
      children: platforms.filter(Boolean).map(p => ({ id: `fr-platform-${p.id}`, label: p.name }))
    },
    sidebarData[3], // Active work
    {
      ...sidebarData[4], // QA
      children: [
        { id: 'qa-landing', label: 'QA Overview' },
        ...dynamicQA
      ],
    },
    sidebarData[5], // Other docs
    ...(isAdmin ? [{ id: 'user-management', label: 'User Management', defaultOpen: false }] : []),
  ];

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };


  return (
    <aside className="doc-sidebar">
      <div className="doc-sidebar__header">
        {isEditingHeader ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <input
              value={draftTitle}
              onChange={e => setDraftTitle(e.target.value)}
              placeholder="Title"
              style={{
                padding: '6px 10px',
                border: '1px solid #764ABC',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '700',
                color: '#764ABC',
                width: '100%',
                outline: 'none',
                background: '#fff'
              }}
              autoFocus
            />
            <input
              value={draftSubtitle}
              onChange={e => setDraftSubtitle(e.target.value)}
              placeholder="Subtitle"
              style={{
                padding: '6px 10px',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '500',
                color: '#6B7280',
                width: '100%',
                outline: 'none',
                background: '#fff'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                onClick={() => {
                  dispatch(saveEdit({ key: 'sidebar.title', value: draftTitle }));
                  dispatch(saveEdit({ key: 'sidebar.subtitle', value: draftSubtitle }));
                  setIsEditingHeader(false);
                }}
                style={{
                  padding: '4px 12px',
                  background: '#764ABC',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingHeader(false)}
                style={{
                  padding: '4px 12px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 className="doc-sidebar__title" style={{ margin: 0 }}>{sidebarTitle}</h2>
              <span className="doc-sidebar__subtitle">{sidebarSubtitle}</span>
            </div>
            {isAdmin && (
              <button
                onClick={handleStartEdit}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#764ABC',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: '4px',
                  flexShrink: 0
                }}
                title="Edit header"
              >
                <Pencil size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      <button
        className="doc-sidebar__toggle"
        onClick={onToggleWide}
        title={isWide ? "Narrow Sidebar" : "Wide Sidebar"}
      >
        {isWide ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <nav className="doc-sidebar__nav">
        {editableSidebarData.map((item) => (
          <SidebarItem key={item.id} item={item} activeSection={activeSection} onSelect={onSelect} depth={0} />
        ))}
      </nav>

      <div className="doc-sidebar__footer">
        {currentUser ? (
          <>
            <div className="doc-sidebar__user">
              <span className="doc-sidebar__user-name">{currentUser.username}</span>
              <span className="doc-sidebar__user-role">{currentUser.role}</span>
            </div>
            {isAdmin && (
              <button
                className="doc-sidebar__footer-btn"
                onClick={() => { onSelect('user-management'); }}
                title="User Management"
              >
                <Users size={16} />
              </button>
            )}
            <button className="doc-sidebar__logout" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <a href="/login" className="doc-sidebar__login-link">Sign in</a>
        )}
      </div>
    </aside>
  );
}
