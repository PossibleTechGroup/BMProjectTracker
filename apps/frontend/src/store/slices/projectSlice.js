import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '@/lib/api';

export const fetchProjectData = createAsyncThunk(
  'project/fetchProjectData',
  async () => {
    const projects = await apiFetch('/projects');
    if (!projects || projects.length === 0) {
      throw new Error('No projects found');
    }
    // Fetch the full project with all relations
    return await apiFetch(`/projects/${projects[0].id}`);
  }
);

export const updateProjectField = createAsyncThunk(
  'project/updateProjectField',
  async ({ field, value }, { getState }) => {
    const projectId = getState().project.data?.id;
    if (!projectId) throw new Error('No project loaded');
    const updated = await apiFetch(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify({ [field]: value }),
    });
    return updated;
  }
);

// Resource Links
export const addResourceLink = createAsyncThunk(
  'project/addResourceLink',
  async (linkData, { getState }) => {
    const projectId = getState().project.data?.id;
    const userName = getState().ui.currentUser?.name || getState().ui.currentUser?.username || 'Unknown';
    const link = await apiFetch(`/projects/${projectId}/resource-links`, {
      method: 'POST',
      body: JSON.stringify(linkData),
    });
    return { link, userName };
  }
);

export const updateResourceLink = createAsyncThunk(
  'project/updateResourceLink',
  async ({ linkId, data }, { getState }) => {
    const projectId = getState().project.data?.id;
    const userName = getState().ui.currentUser?.name || getState().ui.currentUser?.username || 'Unknown';
    const link = await apiFetch(`/projects/${projectId}/resource-links/${linkId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { link, userName };
  }
);

export const deleteResourceLink = createAsyncThunk(
  'project/deleteResourceLink',
  async (linkId, { getState }) => {
    const projectId = getState().project.data?.id;
    const userName = getState().ui.currentUser?.name || getState().ui.currentUser?.username || 'Unknown';
    await apiFetch(`/projects/${projectId}/resource-links/${linkId}`, {
      method: 'DELETE',
    });
    return { linkId, userName };
  }
);

// Git Repositories
export const addGitRepo = createAsyncThunk(
  'project/addGitRepo',
  async (repoData, { getState }) => {
    const projectId = getState().project.data?.id;
    const userName = getState().ui.currentUser?.name || getState().ui.currentUser?.username || 'Unknown';
    const repo = await apiFetch(`/projects/${projectId}/git-repos`, {
      method: 'POST',
      body: JSON.stringify(repoData),
    });
    return { repo, userName };
  }
);

export const updateGitRepo = createAsyncThunk(
  'project/updateGitRepo',
  async ({ repoId, data }, { getState }) => {
    const projectId = getState().project.data?.id;
    const userName = getState().ui.currentUser?.name || getState().ui.currentUser?.username || 'Unknown';
    const repo = await apiFetch(`/projects/${projectId}/git-repos/${repoId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { repo, userName };
  }
);

export const deleteGitRepo = createAsyncThunk(
  'project/deleteGitRepo',
  async (repoId, { getState }) => {
    const projectId = getState().project.data?.id;
    const userName = getState().ui.currentUser?.name || getState().ui.currentUser?.username || 'Unknown';
    await apiFetch(`/projects/${projectId}/git-repos/${repoId}`, {
      method: 'DELETE',
    });
    return { repoId, userName };
  }
);

// Supplementary Docs
export const addSupplementaryDoc = createAsyncThunk(
  'project/addSupplementaryDoc',
  async (docData, { getState }) => {
    const projectId = getState().project.data?.id;
    const userName = getState().ui.currentUser?.name || getState().ui.currentUser?.username || 'Unknown';
    const doc = await apiFetch(`/projects/${projectId}/supplementary-docs`, {
      method: 'POST',
      body: JSON.stringify(docData),
    });
    return { doc, userName };
  }
);

export const updateSupplementaryDoc = createAsyncThunk(
  'project/updateSupplementaryDoc',
  async ({ docId, data }, { getState }) => {
    const projectId = getState().project.data?.id;
    const userName = getState().ui.currentUser?.name || getState().ui.currentUser?.username || 'Unknown';
    const doc = await apiFetch(`/projects/${projectId}/supplementary-docs/${docId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { doc, userName };
  }
);

export const deleteSupplementaryDoc = createAsyncThunk(
  'project/deleteSupplementaryDoc',
  async (docId, { getState }) => {
    const projectId = getState().project.data?.id;
    const userName = getState().ui.currentUser?.name || getState().ui.currentUser?.username || 'Unknown';
    await apiFetch(`/projects/${projectId}/supplementary-docs/${docId}`, {
      method: 'DELETE',
    });
    return { docId, userName };
  }
);

const projectSlice = createSlice({
  name: 'project',
  initialState: {
    data: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjectData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchProjectData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateProjectField.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      // Resource Links
      .addCase(addResourceLink.fulfilled, (state, action) => {
        if (state.data) {
          state.data.resourceLinks = [...(state.data.resourceLinks || []), action.payload.link];
          state.data.updatedBy = action.payload.userName;
        }
      })
      .addCase(updateResourceLink.fulfilled, (state, action) => {
        if (state.data) {
          state.data.resourceLinks = (state.data.resourceLinks || []).map(l =>
            l.id === action.payload.link.id ? action.payload.link : l
          );
          state.data.updatedBy = action.payload.userName;
        }
      })
      .addCase(deleteResourceLink.fulfilled, (state, action) => {
        if (state.data) {
          state.data.resourceLinks = (state.data.resourceLinks || []).filter(l => l.id !== action.payload.linkId);
          state.data.updatedBy = action.payload.userName;
        }
      })
      // Git Repos
      .addCase(addGitRepo.fulfilled, (state, action) => {
        if (state.data) {
          state.data.gitRepositories = [...(state.data.gitRepositories || []), action.payload.repo];
          state.data.updatedBy = action.payload.userName;
        }
      })
      .addCase(updateGitRepo.fulfilled, (state, action) => {
        if (state.data) {
          state.data.gitRepositories = (state.data.gitRepositories || []).map(r =>
            r.id === action.payload.repo.id ? action.payload.repo : r
          );
          state.data.updatedBy = action.payload.userName;
        }
      })
      .addCase(deleteGitRepo.fulfilled, (state, action) => {
        if (state.data) {
          state.data.gitRepositories = (state.data.gitRepositories || []).filter(r => r.id !== action.payload.repoId);
          state.data.updatedBy = action.payload.userName;
        }
      })
      // Supplementary Docs
      .addCase(addSupplementaryDoc.fulfilled, (state, action) => {
        if (state.data) {
          state.data.supplementaryDocs = [...(state.data.supplementaryDocs || []), action.payload.doc];
          state.data.updatedBy = action.payload.userName;
        }
      })
      .addCase(updateSupplementaryDoc.fulfilled, (state, action) => {
        if (state.data) {
          state.data.supplementaryDocs = (state.data.supplementaryDocs || []).map(d =>
            d.id === action.payload.doc.id ? action.payload.doc : d
          );
          state.data.updatedBy = action.payload.userName;
        }
      })
      .addCase(deleteSupplementaryDoc.fulfilled, (state, action) => {
        if (state.data) {
          state.data.supplementaryDocs = (state.data.supplementaryDocs || []).filter(d => d.id !== action.payload.docId);
          state.data.updatedBy = action.payload.userName;
        }
      });
  },
});

export default projectSlice.reducer;
