'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPlatforms } from '@/store/slices/platformsSlice';
import { fetchBugs } from '@/store/slices/bugsSlice';
import { fetchFeatureRequests } from '@/store/slices/featuresSlice';
import { fetchProjectData } from '@/store/slices/projectSlice';
import { Pencil, X } from 'lucide-react';
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

export default function HomePage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarWide, setIsSidebarWide] = useState(false);
  const [editing, setEditing] = useState(false);
  const { currentUser, authStatus } = useSelector(s => s.ui);
  const isAdmin = currentUser?.role === 'ADMIN';
  const router = useRouter();

  const dispatch = useDispatch();

  useEffect(() => {
    if (!currentUser && authStatus !== 'loading') {
      router.replace('/login');
    } else if (currentUser) {
      dispatch(fetchPlatforms(1));
      dispatch(fetchBugs(1));
      dispatch(fetchFeatureRequests(1));
      dispatch(fetchProjectData());
    }
  }, [currentUser, authStatus, router, dispatch]);

  if (!currentUser) return null;

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
            <button
              className={`doc-toolbar__btn ${editing ? 'doc-toolbar__btn--active' : ''}`}
              onClick={() => setEditing(!editing)}
              title={editing ? 'Exit edit mode' : 'Edit this page'}
            >
              {editing ? <X size={16} /> : <Pencil size={16} />}
              <span>{editing ? 'Done' : 'Edit'}</span>
            </button>
          </div>
          <div className={editing ? 'doc-content--editing' : ''}>
            <EditProvider editing={editing}>
              {renderContent()}
            </EditProvider>
          </div>
          <PrevNextNav activeSection={activeSection} onSelect={setActiveSection} />
        </div>
        <RightComments activeSection={activeSection} />
      </main>
    </div>
  );
}
