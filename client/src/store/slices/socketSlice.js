import { createSlice } from '@reduxjs/toolkit';

const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    onlineUsers:  [],
    connected:    false,
  },
  reducers: {
    setConnected:   (state, { payload }) => { state.connected = payload; },
    userOnline:     (state, { payload }) => {
      if (!state.onlineUsers.includes(payload)) state.onlineUsers.push(payload);
    },
    userOffline:    (state, { payload }) => {
      state.onlineUsers = state.onlineUsers.filter(id => id !== payload);
    },
    setOnlineUsers: (state, { payload }) => { state.onlineUsers = payload; },
  },
});

export const { setConnected, userOnline, userOffline, setOnlineUsers } = socketSlice.actions;
export default socketSlice.reducer;