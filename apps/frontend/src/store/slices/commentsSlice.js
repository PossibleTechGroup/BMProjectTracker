import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '@/lib/api';

// ─── Async Thunks ────────────────────────────────────────────

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (section) => {
    return { section, comments: await apiFetch(`/comments/${section}`) };
  }
);

export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ section, text }) => {
    return await apiFetch(`/comments/${section}`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (id) => {
    await apiFetch(`/comments/${id}`, { method: 'DELETE' });
    return id;
  }
);

// ─── Slice ───────────────────────────────────────────────────

const initialState = {
  bySection: {}, // { 'platform-1': [...comments], 'bug-2': [...comments] }
  status: 'idle',
  error: null,
};

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.bySection[action.payload.section] = action.payload.comments;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const comment = action.payload;
        const section = comment.entityKey;
        if (!state.bySection[section]) {
          state.bySection[section] = [];
        }
        state.bySection[section].push(comment);
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const id = action.payload;
        Object.keys(state.bySection).forEach((section) => {
          state.bySection[section] = state.bySection[section].map((c) =>
            c.id === id ? { ...c, isDeleted: true } : c
          );
        });
      });
  },
});

export default commentsSlice.reducer;
