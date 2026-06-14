import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/index.js';

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authApi.me();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authApi.logout();
    localStorage.removeItem('accessToken');
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:        null,
    isAuth:      false,
    loading:     true,  // true on first load while we check session
    error:       null,
  },
  reducers: {
    setCredentials: (state, { payload }) => {
      state.user   = payload.user;
      state.isAuth = true;
      state.loading = false;
      localStorage.setItem('accessToken', payload.accessToken);
    },
    clearAuth: (state) => {
      state.user   = null;
      state.isAuth = false;
      state.loading = false;
      localStorage.removeItem('accessToken');
    },
    updateUser: (state, { payload }) => {
      state.user = { ...state.user, ...payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending,   (state) => { state.loading = true; })
      .addCase(fetchMe.fulfilled, (state, { payload }) => {
        state.user    = payload;
        state.isAuth  = true;
        state.loading = false;
      })
      .addCase(fetchMe.rejected,  (state) => {
        state.user    = null;
        state.isAuth  = false;
        state.loading = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user    = null;
        state.isAuth  = false;
        state.loading = false;
      });
  },
});

export const { setCredentials, clearAuth, updateUser } = authSlice.actions;
export default authSlice.reducer;