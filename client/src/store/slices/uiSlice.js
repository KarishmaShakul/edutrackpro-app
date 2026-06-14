import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen:       true,
    notifPanelOpen:    false,
    unreadNotifCount:  0,
    unreadMessageCount:0,
    theme:             'light',
  },
  reducers: {
    toggleSidebar:       (state)          => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen:      (state, { payload }) => { state.sidebarOpen = payload; },
    toggleNotifPanel:    (state)          => { state.notifPanelOpen = !state.notifPanelOpen; },
    setUnreadNotif:      (state, { payload }) => { state.unreadNotifCount = payload; },
    setUnreadMessages:   (state, { payload }) => { state.unreadMessageCount = payload; },
    incrementUnreadMsg:  (state)          => { state.unreadMessageCount += 1; },
    decrementUnreadMsg:  (state)          => {
      state.unreadMessageCount = Math.max(0, state.unreadMessageCount - 1);
    },
  },
});

export const {
  toggleSidebar, setSidebarOpen, toggleNotifPanel,
  setUnreadNotif, setUnreadMessages,
  incrementUnreadMsg, decrementUnreadMsg,
} = uiSlice.actions;
export default uiSlice.reducer;