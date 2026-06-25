import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '@/lib/api';

// ─── Async Thunks ────────────────────────────────────────────

export const fetchFeatureRequests = createAsyncThunk(
  'features/fetchFeatureRequests',
  async (platformId) => {
    return await apiFetch(`/feature-requests/platform/${platformId}`);
  }
);

export const createFeatureRequest = createAsyncThunk(
  'features/createFeatureRequest',
  async (featureData) => {
    return await apiFetch('/feature-requests', {
      method: 'POST',
      body: JSON.stringify(featureData),
    });
  }
);

export const updateFeatureRequestAsync = createAsyncThunk(
  'features/updateFeatureRequestAsync',
  async ({ id, ...data }) => {
    return await apiFetch(`/feature-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
);

export const deleteFeatureRequest = createAsyncThunk(
  'features/deleteFeatureRequest',
  async (id) => {
    await apiFetch(`/feature-requests/${id}`, { method: 'DELETE' });
    return id;
  }
);

// ─── Slice ───────────────────────────────────────────────────

const initialState = {
  items: [],
  status: 'idle',
  error: null,
};

const featuresSlice = createSlice({
  name: 'features',
  initialState,
  reducers: {
    addFeatureRequest(state, action) { state.items.push(action.payload); },
    updateFeatureRequest(state, action) {
      const idx = state.items.findIndex(f => f.id === action.payload.id);
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
    },
    removeFeatureRequest(state, action) {
      state.items = state.items.filter(f => f.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeatureRequests.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFeatureRequests.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchFeatureRequests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createFeatureRequest.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateFeatureRequestAsync.fulfilled, (state, action) => {
        const idx = state.items.findIndex(f => f.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteFeatureRequest.fulfilled, (state, action) => {
        state.items = state.items.filter(f => f.id !== action.payload);
      })
      .addCase('platforms/deletePlatform/fulfilled', (state, action) => {
        state.items = state.items.filter(f => f.platformId !== action.payload);
      });
  },
});

export const { addFeatureRequest, updateFeatureRequest, removeFeatureRequest } = featuresSlice.actions;
export default featuresSlice.reducer;
