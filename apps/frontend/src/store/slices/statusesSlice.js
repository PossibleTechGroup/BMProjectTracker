import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '@/lib/api';

// ─── Async Thunks ────────────────────────────────────────────

export const fetchStatuses = createAsyncThunk(
  'statuses/fetchStatuses',
  async ({ projectId = 1, type }, { getState }) => {
    // Skip if already loaded for this type
    const existing = getState().statuses.byType[type];
    if (existing && existing.length > 0) return { type, items: existing };
    const items = await apiFetch(`/statuses/project/${projectId}?type=${type}`);
    return { type, items };
  }
);

export const fetchSeverities = createAsyncThunk(
  'statuses/fetchSeverities',
  async (projectId = 1, { getState }) => {
    const existing = getState().statuses.severities;
    if (existing && existing.length > 0) return existing;
    return await apiFetch(`/severities/project/${projectId}`);
  }
);

// ─── Slice ───────────────────────────────────────────────────

const initialState = {
  byType: {},       // { task: [...], request: [...], bug: [...], work: [...], qa: [...] }
  severities: [],
  status: 'idle',
  error: null,
};

const statusesSlice = createSlice({
  name: 'statuses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatuses.fulfilled, (state, action) => {
        state.byType[action.payload.type] = action.payload.items;
      })
      .addCase(fetchSeverities.fulfilled, (state, action) => {
        state.severities = action.payload;
      });
  },
});

export default statusesSlice.reducer;
