import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '@/lib/api';
import { addBug } from '@/store/slices/bugsSlice';
import { addFeatureRequest } from '@/store/slices/featuresSlice';
import { addQAStory } from '@/store/slices/qaSlice';

// ─── Async Thunks ────────────────────────────────────────────

export const fetchPlatforms = createAsyncThunk(
  'platforms/fetchPlatforms',
  async (projectId = 1) => {
    return await apiFetch(`/platforms/project/${projectId}`);
  }
);

export const createPlatform = createAsyncThunk(
  'platforms/createPlatform',
  async (platformData, { dispatch }) => {
    const res = await apiFetch('/platforms', {
      method: 'POST',
      body: JSON.stringify(platformData),
    });
    res.featureRequests?.forEach(fr => dispatch(addFeatureRequest(fr)));
    res.bugReports?.forEach(b => dispatch(addBug(b)));
    res.qaStories?.forEach(q => dispatch(addQAStory(q)));
    return res.platform;
  }
);

export const updatePlatformAsync = createAsyncThunk(
  'platforms/updatePlatformAsync',
  async ({ id, ...data }) => {
    return await apiFetch(`/platforms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
);

export const deletePlatform = createAsyncThunk(
  'platforms/deletePlatform',
  async (id) => {
    await apiFetch(`/platforms/${id}`, { method: 'DELETE' });
    return id;
  }
);

export const createFeature = createAsyncThunk(
  'platforms/createFeature',
  async (featureData) => {
    return await apiFetch('/features', {
      method: 'POST',
      body: JSON.stringify(featureData),
    });
  }
);

export const updateFeature = createAsyncThunk(
  'platforms/updateFeature',
  async ({ id, ...data }) => {
    return await apiFetch(`/features/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
);

export const deleteFeature = createAsyncThunk(
  'platforms/deleteFeature',
  async (id) => {
    await apiFetch(`/features/${id}`, { method: 'DELETE' });
    return id;
  }
);

export const createSubTask = createAsyncThunk(
  'platforms/createSubTask',
  async (subTaskData) => {
    return await apiFetch('/subtasks', {
      method: 'POST',
      body: JSON.stringify(subTaskData),
    });
  }
);

export const updateSubTaskAsync = createAsyncThunk(
  'platforms/updateSubTaskAsync',
  async ({ id, ...data }) => {
    return await apiFetch(`/subtasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
);

export const deleteSubTask = createAsyncThunk(
  'platforms/deleteSubTask',
  async (id) => {
    await apiFetch(`/subtasks/${id}`, { method: 'DELETE' });
    return id;
  }
);

// ─── Slice ───────────────────────────────────────────────────

const initialState = {
  items: [],
  status: 'idle',
  error: null,
};

const platformsSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {
    updatePlatform(state, action) {
      const idx = state.items.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
    },
    addFeature(state, action) {
      const { platformId, feature } = action.payload;
      const platform = state.items.find(p => p.id === platformId);
      if (platform) {
        if (!platform.features) platform.features = [];
        platform.features.push(feature);
      }
    },
    updateSubTask(state, action) {
      const { platformId, featureId, subTaskId, updates } = action.payload;
      const platform = state.items.find(p => p.id === platformId);
      if (!platform) return;
      const feature = platform.features?.find(f => f.id === featureId);
      if (!feature) return;
      const sub = feature.subTasks?.find(s => s.id === subTaskId);
      if (sub) Object.assign(sub, updates);
    },
    addSubTask(state, action) {
      const { platformId, featureId, subTask } = action.payload;
      const platform = state.items.find(p => p.id === platformId);
      if (!platform) return;
      const feature = platform.features?.find(f => f.id === featureId);
      if (feature) {
        if (!feature.subTasks) feature.subTasks = [];
        feature.subTasks.push(subTask);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatforms.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlatforms.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPlatforms.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createPlatform.fulfilled, (state, action) => {
        if (action.payload) state.items.push(action.payload);
      })
      .addCase(updatePlatformAsync.fulfilled, (state, action) => {
        const idx = state.items.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deletePlatform.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      })
      .addCase(createFeature.fulfilled, (state, action) => {
        const feature = action.payload;
        const platform = state.items.find(p => p.id === feature.platformId);
        if (platform) {
          if (!platform.features) platform.features = [];
          platform.features.push(feature);
        }
      })
      .addCase(updateFeature.fulfilled, (state, action) => {
        const feat = action.payload;
        const platform = state.items.find(p => p.id === feat.platformId);
        if (platform) {
          const idx = (platform.features || []).findIndex(f => f.id === feat.id);
          if (idx !== -1) platform.features[idx] = feat;
        }
      })
      .addCase(deleteFeature.fulfilled, (state, action) => {
        const id = action.payload;
        for (const p of state.items) {
          if (p.features) {
            const idx = p.features.findIndex(f => f.id === id);
            if (idx !== -1) { p.features.splice(idx, 1); break; }
          }
        }
      })
      .addCase(createSubTask.fulfilled, (state, action) => {
        const sub = action.payload;
        for (const p of state.items) {
          const feat = (p.features || []).find(f => {
            const subTaskIds = (f.subTasks || []).map(s => s.id);
            return f.id === sub.featureId || subTaskIds.includes(sub.id);
          });
          if (feat) {
            if (!feat.subTasks) feat.subTasks = [];
            feat.subTasks.push(sub);
            break;
          }
        }
      })
      .addCase(updateSubTaskAsync.fulfilled, (state, action) => {
        const sub = action.payload;
        for (const p of state.items) {
          const feat = (p.features || []).find(f => f.id === sub.featureId);
          if (feat) {
            const idx = (feat.subTasks || []).findIndex(s => s.id === sub.id);
            if (idx !== -1) feat.subTasks[idx] = sub;
            break;
          }
        }
      })
      .addCase(deleteSubTask.fulfilled, (state, action) => {
        const id = action.payload;
        for (const p of state.items) {
          for (const feat of (p.features || [])) {
            if (feat.subTasks) {
              const idx = feat.subTasks.findIndex(s => s.id === id);
              if (idx !== -1) { feat.subTasks.splice(idx, 1); break; }
            }
          }
        }
      });
  },
});

export const { updatePlatform, addFeature, updateSubTask, addSubTask, removeSubTask } = platformsSlice.actions;
export default platformsSlice.reducer;
