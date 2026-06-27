'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPlatforms } from '@/store/slices/platformsSlice';
import { fetchBugs } from '@/store/slices/bugsSlice';
import { fetchFeatureRequests } from '@/store/slices/featuresSlice';
import { fetchProjectData } from '@/store/slices/projectSlice';
import { Pencil, X, ArrowLeft } from 'lucide-react';
import UserManagementSection from '@/components/content/UserManagementSection';
import DocSidebar from '@/components/layout/DocSidebar';
import RightComments from '@/components/layout/RightComments';
import { EditProvider } from '@/components/common/EditContext';
import {
  OverviewSection,
  IntroSection,
  LinksSection,
  GitReposSection,
} from '@/components/content/DocSections';
import {
  GranularDocsLanding,
  GranularPlatformSection,
  GranularFeatureSection,
  FeatureRequestsLanding,
  FeatureRequestSection,
  FeatureRequestDetailView,
  ActiveWorkBugsLanding,
  ActiveBugsSection,
  BugReportDetailView,
  AllOtherDocsSection,
  QALanding,
  QAPlatformSection,
  QAStoryDetailView,
  PrevNextNav,
} from '@/components/content/ExtraSections';
import { NeedsReviewBanner } from '@/components/common/EntityWidgets';

export default function HomePage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarWide, setIsSidebarWide] = useState(false);
  const [editing, setEditing] = useState(false);
  const { currentUser, authStatus } = useSelector(s => s.ui);
  const isAdmin = currentUser?.role === 'ADMIN';
  const router = useRouter();

  const dispatch = useDispatch();
  const projectData = useSelector(s => s.project.data);
  const platforms = useSelector(s => s.platforms.items);
  const bugs = useSelector(s => s.bugs.items);
  const featureRequests = useSelector(s => s.features.items);
  const qaStories = useSelector(s => s.qa.items);

  useEffect(() => {
    if (!currentUser && authStatus !== 'loading') {
      router.replace('/login');
    } else if (currentUser) {
      dispatch(fetchProjectData());
    }
  }, [currentUser, authStatus, router, dispatch]);

  useEffect(() => {
    if (projectData?.id) {
      dispatch(fetchPlatforms(projectData.id));
      dispatch(fetchBugs(projectData.id));
      dispatch(fetchFeatureRequests(projectData.id));
    }
  }, [projectData?.id, dispatch]);

  if (!currentUser) return null;

  const getBackTarget = () => {
    const s = activeSection;
    if (!s || s === 'overview') return null;
    if (s.startsWith('platform-') || s.startsWith('custom-') || s.startsWith('feature-')) return 'granular-docs';
    if (s.startsWith('fr-platform-') || s.startsWith('freq-')) return 'feature-requests';
    if (s.startsWith('bug-')) return 'active-bugs';
    if (s.startsWith('qa-platform-') || s.startsWith('qa-story-')) return 'qa';
    const map = {
      intro: 'overview', links: 'overview', 'git-repos': 'overview',
      'granular-docs': 'overview', 'feature-requests': 'overview',
      'active-work-bugs': 'overview', 'active-bugs': 'active-work-bugs',
      qa: 'overview', 'all-other-docs': 'overview', 'user-management': 'overview',
    };
    return map[s] || 'overview';
  };

  const renderContent = () => {
    // Handle custom platforms (added by admin)
    if (activeSection && activeSection.startsWith('custom-')) {
      return <GranularPlatformSection key={activeSection} platformKey={activeSection} onSelect={setActiveSection} />;
    }

    switch (activeSection) {
      case 'overview':
        return <OverviewSection key="overview" onSelect={setActiveSection} />;
      case 'intro':
        return <IntroSection key="intro" onSelect={setActiveSection} />;
      case 'links':
        return <LinksSection key="links" onSelect={setActiveSection} />;
      case 'git-repos':
        return <GitReposSection key="git-repos" onSelect={setActiveSection} />;
      
      // Section 2: Platform Documentation
      case 'granular-docs':
        return <GranularDocsLanding key="granular-docs" onSelect={setActiveSection} />;
      
      // Section 3: Feature Requests
      case 'feature-requests':
        return <FeatureRequestsLanding key="feature-requests" onSelect={setActiveSection} />;

      // Section 4: Bug Reporting
      case 'active-work-bugs':
        return <ActiveWorkBugsLanding key="active-work-bugs" onSelect={setActiveSection} />;
      case 'active-bugs':
        return <ActiveBugsSection key="active-bugs" onSelect={setActiveSection} />;

      // Section 5: QA
      case 'qa':
      case 'qa-landing':
        return <QALanding key="qa" onSelect={setActiveSection} />;
      
      // Section 6: All Other Docs
      case 'all-other-docs':
        return <AllOtherDocsSection key="all-other-docs" onSelect={setActiveSection} />;

      // Admin: User Management
      case 'user-management':
        return <UserManagementSection key="user-management" onSelect={setActiveSection} />;

      default:
        // Handle dynamic prefixes
        if (activeSection.startsWith('platform-')) {
          return <GranularPlatformSection key={activeSection} platformId={Number(activeSection.replace('platform-', ''))} onSelect={setActiveSection} />;
        }
        if (activeSection.startsWith('feature-')) {
          return <GranularFeatureSection key={activeSection} featureId={Number(activeSection.replace('feature-', ''))} onSelect={setActiveSection} />;
        }
        if (activeSection.startsWith('fr-platform-')) {
          return <FeatureRequestSection key={activeSection} platformId={Number(activeSection.replace('fr-platform-', ''))} onSelect={setActiveSection} />;
        }
        if (activeSection.startsWith('freq-')) {
          return <FeatureRequestDetailView key={activeSection} requestId={Number(activeSection.replace('freq-', ''))} onSelect={setActiveSection} />;
        }
        if (activeSection.startsWith('bug-')) {
          return <BugReportDetailView key={activeSection} bugId={Number(activeSection.replace('bug-', ''))} onSelect={setActiveSection} />;
        }
        if (activeSection.startsWith('qa-platform-')) {
          return <QAPlatformSection key={activeSection} platformId={Number(activeSection.replace('qa-platform-', ''))} onSelect={setActiveSection} />;
        }
        if (activeSection.startsWith('qa-story-')) {
          return <QAStoryDetailView key={activeSection} storyId={Number(activeSection.replace('qa-story-', ''))} onSelect={setActiveSection} />;
        }

        return <OverviewSection key="overview-default" />;
    }
  };

  return (
    <div className="doc-layout" style={{ '--sidebar-width': isSidebarWide ? '360px' : '260px' }}>
      <DocSidebar
        activeSection={activeSection}
        onSelect={setActiveSection}
        isWide={isSidebarWide}
        onToggleWide={() => setIsSidebarWide(!isSidebarWide)}
      />
      <main className="doc-main">
        <div className="doc-content-area">
          <div className="doc-toolbar">
            {getBackTarget() && (
              <button
                className="doc-toolbar__btn"
                onClick={() => setActiveSection(getBackTarget())}
                title="Go back"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            )}
            <button
              className={`doc-toolbar__btn doc-toolbar__link ${editing ? 'doc-toolbar__btn--active' : ''}`}
              onClick={() => setEditing(!editing)}
              title={editing ? 'Exit edit mode' : 'Edit this page'}
            >
              {editing ? <X size={16} /> : <Pencil size={16} />}
              <span>{editing ? 'Done' : 'Edit'}</span>
            </button>
          </div>
          <div className={editing ? 'doc-content--editing' : ''}>
            <EditProvider editing={editing}>
              {(() => {
                const s = activeSection;
                let ek = null;
                if (s.startsWith('platform-')) ek = `platform-${s.replace('platform-', '')}`;
                else if (s.startsWith('feature-')) ek = `feature-${s.replace('feature-', '')}`;
                else if (s.startsWith('freq-')) ek = `feature-request-${s.replace('freq-', '')}`;
                else if (s.startsWith('bug-')) ek = `bug-${s.replace('bug-', '')}`;
                else if (s.startsWith('qa-story-')) ek = `qa-story-${s.replace('qa-story-', '')}`;
                return ek ? <NeedsReviewBanner entityKey={ek} /> : null;
              })()}
              {renderContent()}
            </EditProvider>
          </div>
          {(() => {
            const s = activeSection;
            // For list/landing pages, surface whoever most recently touched
            // anything in that collection (by updatedAt).
            const latest = (list) => (list && list.length)
              ? list.reduce((a, b) => (new Date(b.updatedAt) > new Date(a.updatedAt) ? b : a))
              : null;
            let entity;
            // Project-level docs
            if (s === 'overview' || s === 'intro' || s === 'links' || s === 'git-repos') {
              entity = projectData;
            // Platform docs
            } else if (s.startsWith('platform-')) {
              entity = platforms.find(p => p.id === Number(s.replace('platform-', '')));
            // Feature docs (nested under a platform)
            } else if (s.startsWith('feature-')) {
              const featId = Number(s.replace('feature-', ''));
              for (const p of platforms) {
                const f = (p.features || []).find(f => f.id === featId);
                if (f) { entity = f; break; }
              }
            // Bug detail
            } else if (s.startsWith('bug-')) {
              entity = bugs.find(b => b.id === Number(s.replace('bug-', '')));
            // Feature request detail
            } else if (s.startsWith('freq-')) {
              entity = featureRequests.find(f => f.id === Number(s.replace('freq-', '')));
            // QA story detail
            } else if (s.startsWith('qa-story-')) {
              entity = qaStories.find(st => st.id === Number(s.replace('qa-story-', '')));
            // Platform-scoped feature-request list
            } else if (s.startsWith('fr-platform-')) {
              const pid = Number(s.replace('fr-platform-', ''));
              entity = latest(featureRequests.filter(f => f.platformId === pid)) || platforms.find(p => p.id === pid);
            // Platform-scoped QA list
            } else if (s.startsWith('qa-platform-')) {
              const pid = Number(s.replace('qa-platform-', ''));
              entity = latest(qaStories.filter(st => st.platformId === pid)) || platforms.find(p => p.id === pid);
            // Top-level landing/list pages
            } else if (s === 'granular-docs') {
              entity = latest(platforms);
            } else if (s === 'feature-requests') {
              entity = latest(featureRequests);
            } else if (s === 'active-bugs' || s === 'active-work-bugs') {
              entity = latest(bugs);
            } else if (s === 'qa' || s === 'qa-landing') {
              entity = latest(qaStories);
            } else if (s === 'all-other-docs' || s === 'user-management') {
              entity = projectData;
            }

            // Final fallback so every page shows a footer (e.g. all-other-docs,
            // user-management, custom platforms): fall back to the project.
            if (!entity) entity = projectData;

            const name = entity?.updatedBy;
            return (
              <div style={{ fontSize: 12, color: '#999', marginTop: 32, marginBottom: 16, fontStyle: 'italic', textAlign: 'right', borderTop: '1px solid #eee', paddingTop: 16 }}>
                {name ? <>Last updated by <strong style={{ color: '#666', fontStyle: 'normal' }}>@{name}</strong></> : 'Never updated'}
              </div>
            );
          })()}
          <PrevNextNav activeSection={activeSection} onSelect={setActiveSection} />
        </div>
        <RightComments activeSection={activeSection} />
      </main>
    </div>
  );
}
