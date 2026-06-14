import { configureStore } from '@reduxjs/toolkit';
import authReducer    from './slices/authSlice.js';
import uiReducer      from './slices/uiSlice.js';
import socketReducer  from './slices/socketSlice.js';

export const store = configureStore({
  reducer: {
    auth:   authReducer,
    ui:     uiReducer,
    socket: socketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});