import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '@/lib/api';

// ─── Async Thunks ────────────────────────────────────────────

export const fetchBugs = createAsyncThunk(
  'bugs/fetchBugs',
  async (projectId = 1) => {
    return await apiFetch(`/bugs/project/${projectId}`);
  }
);

export const createBug = createAsyncThunk(
  'bugs/createBug',
  async (bugData) => {
    return await apiFetch('/bugs', {
      method: 'POST',
      body: JSON.stringify(bugData),
    });
  }
);

export const updateBugAsync = createAsyncThunk(
  'bugs/updateBugAsync',
  async ({ id, ...data }) => {
    return await apiFetch(`/bugs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
);

export const deleteBug = createAsyncThunk(
  'bugs/deleteBug',
  async (id) => {
    await apiFetch(`/bugs/${id}`, { method: 'DELETE' });
    return id;
  }
);

// ─── Slice ───────────────────────────────────────────────────

const initialState = {
  items: [],
  status: 'idle',
  error: null,
};

const bugsSlice = createSlice({
  name: 'bugs',
  initialState,
  reducers: {
    addBug(state, action) { state.items.push(action.payload); },
    updateBug(state, action) {
      const idx = state.items.findIndex(b => b.id === action.payload.id);
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
    },
    removeBug(state, action) {
      state.items = state.items.filter(b => b.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBugs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBugs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchBugs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createBug.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateBugAsync.fulfilled, (state, action) => {
        const idx = state.items.findIndex(b => b.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteBug.fulfilled, (state, action) => {
        state.items = state.items.filter(b => b.id !== action.payload);
      })
      .addCase('platforms/deletePlatform/fulfilled', (state, action) => {
        state.items = state.items.filter(b => b.platformId !== action.payload);
      });
  },
});

export const { addBug, updateBug, removeBug } = bugsSlice.actions;
export default bugsSlice.reducer;
