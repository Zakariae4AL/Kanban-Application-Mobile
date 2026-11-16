import { useEffect, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Locale } from './api/types';
import { I18nProvider } from './i18n/I18nProvider';
import { storage, TOKEN_KEY } from './storage';
import { restored } from './store/sessionSlice';
import { type AppStore, makeStore } from './store/store';
import { ThemeProvider } from './theme/ThemeProvider';

const defaultStore = makeStore();

/** Reads the saved token once at startup. */
function SessionRestorer({ store }: { store: AppStore }) {
  useEffect(() => {
    void storage.get(TOKEN_KEY).then((token) => store.dispatch(restored(token)));
  }, [store]);
  return null;
}

export function AppProviders({
  children,
  store = defaultStore,
  locale,
}: {
  children: ReactNode;
  store?: AppStore;
  locale?: Locale;
}) {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nProvider initial={locale}>
            <SessionRestorer store={store} />
            {children}
          </I18nProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
