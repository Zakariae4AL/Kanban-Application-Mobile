import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../api/types';

type SessionState = {
  /** 'restoring' until the saved token has been read from secure storage. */
  status: 'restoring' | 'ready';
  token: string | null;
  user: User | null;
};

const initialState: SessionState = { status: 'restoring', token: null, user: null };

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    restored(state, action: PayloadAction<string | null>) {
      state.status = 'ready';
      state.token = action.payload;
    },
    signedIn(state, action: PayloadAction<{ token: string; user: User }>) {
      state.status = 'ready';
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    signedOut(state) {
      state.status = 'ready';
      state.token = null;
      state.user = null;
    },
  },
});

export const { restored, signedIn, signedOut } = sessionSlice.actions;
