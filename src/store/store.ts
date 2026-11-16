import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { kanbanApi } from '../api/api';
import { storage, TOKEN_KEY } from '../storage';
import { sessionSlice, signedIn, signedOut } from './sessionSlice';

/** Keeps the token in secure storage in sync with the session. */
const persistToken = createListenerMiddleware();
persistToken.startListening({
  matcher: isAnyOf(signedIn, signedOut),
  effect: async (action) => {
    if (signedIn.match(action)) await storage.set(TOKEN_KEY, action.payload.token);
    else await storage.remove(TOKEN_KEY);
  },
});

export function makeStore() {
  return configureStore({
    reducer: { session: sessionSlice.reducer, [kanbanApi.reducerPath]: kanbanApi.reducer },
    middleware: (getDefault) => getDefault().prepend(persistToken.middleware).concat(kanbanApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
