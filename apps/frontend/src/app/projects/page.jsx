'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllProjects, setActiveProject } from '@/store/slices/projectSlice';
import { logout } from '@/store/slices/uiSlice';
import { FolderGit2, LogOut, Plus, Search, Users, LayoutGrid, ChevronRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import styles from './projects.module.scss';
import CustomModal from '@/components/common/CustomModal';

export default function ProjectSelectorPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { currentUser, authStatus } = useSelector(s => s.ui);
  const { projectsList, listStatus } = useSelector(s => s.project);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', slug: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    if (!currentUser && authStatus !== 'loading') {
      router.replace('/login');
    } else if (currentUser) {
      dispatch(fetchAllProjects());
    }
  }, [currentUser, authStatus, router, dispatch]);

  const handleSelectProject = (projectId) => {
    dispatch(setActiveProject(projectId));
    router.push('/');
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim() || !newProject.slug.trim()) return;
    
    setIsSubmitting(true);
    setCreateError('');
    try {
      await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify(newProject),
      });
      setIsCreateModalOpen(false);
      setNewProject({ name: '', slug: '', description: '' });
      dispatch(fetchAllProjects()); // Refresh the list
    } catch (err) {
      setCreateError(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return null;

  const filteredProjects = projectsList.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <FolderGit2 className={styles.logoIcon} size={28} />
            <div>
              <h1 className={styles.title}>BM Ecosystem</h1>
              <p className={styles.subtitle}>Select a project to continue</p>
            </div>
          </div>
          
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{currentUser.name}</span>
              <span className={styles.userRole}>{currentUser.role}</span>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Sign Out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} size={18} />
            <input 
              type="text" 
              className={styles.searchInput} 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {isAdmin && (
            <button className={styles.createBtn} onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={18} />
              <span>New Project</span>
            </button>
          )}
        </div>

        {listStatus === 'loading' ? (
          <div className={styles.loading}>Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className={styles.empty}>
            <FolderGit2 size={48} className={styles.emptyIcon} />
            <h3>No projects found</h3>
            <p>Try adjusting your search or ask an admin to create a new project.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredProjects.map(project => (
              <div key={project.id} className={styles.card} onClick={() => handleSelectProject(project.id)}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{project.name}</h3>
                  <span className={styles.cardBadge}>Active</span>
                </div>
                <p className={styles.cardDesc}>{project.description || 'No description provided.'}</p>
                <div className={styles.cardFooter}>
                  <div className={styles.cardStats}>
                    <div className={styles.stat} title="Members">
                      <Users size={14} />
                      <span>{project._count?.members || 0}</span>
                    </div>
                    <div className={styles.stat} title="Platforms/Docs">
                      <LayoutGrid size={14} />
                      <span>{project._count?.platforms || 0}</span>
                    </div>
                  </div>
                  <div className={styles.cardAction}>
                    <span>Open</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CustomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
      >
        <form className={styles.form} onSubmit={handleCreateProject}>
          {createError && <div className={styles.errorBanner}>{createError}</div>}
          
          <div className={styles.formGroup}>
            <label>Project Name</label>
            <input 
              type="text" 
              required
              value={newProject.name}
              onChange={(e) => {
                const name = e.target.value;
                setNewProject(prev => ({ 
                  ...prev, 
                  name, 
                  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') 
                }));
              }}
              placeholder="e.g. Courier App"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>URL Slug (Unique)</label>
            <input 
              type="text" 
              required
              value={newProject.slug}
              onChange={(e) => setNewProject(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="e.g. courier-app"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea 
              rows={3}
              value={newProject.description}
              onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief overview of the project"
            />
          </div>
          
          <div className={styles.formActions}>
            <button type="button" className={styles.btnCancel} onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={isSubmitting || !newProject.name || !newProject.slug}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </CustomModal>
    </div>
  );
}
