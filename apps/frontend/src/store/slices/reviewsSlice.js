import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '@/lib/api';

// ─── Async Thunks ────────────────────────────────────────────

export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (entityKey) => {
    const res = await apiFetch(`/reviews/${entityKey}`);
    return { entityKey, reviews: Array.isArray(res) ? res : [] };
  }
);

export const markReviewed = createAsyncThunk(
  'reviews/markReviewed',
  async (entityKey) => {
    const res = await apiFetch(`/reviews/${entityKey}`, { method: 'POST' });
    return { entityKey, reviews: Array.isArray(res) ? res : [] };
  }
);

// ─── Slice ───────────────────────────────────────────────────

const initialState = {
  byEntity: {},  // { 'platform-1': [...reviews], 'bug-2': [...reviews] }
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.byEntity[action.payload.entityKey] = action.payload.reviews;
      })
      .addCase(markReviewed.fulfilled, (state, action) => {
        state.byEntity[action.payload.entityKey] = action.payload.reviews;
      });
  },
});

export default reviewsSlice.reducer;
