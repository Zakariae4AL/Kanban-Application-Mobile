// Importing Expo Router's testing library installs its test mocks and matchers.
import 'expo-router/testing-library';
import { render } from '@testing-library/react-native';
import { ExpoRoot } from 'expo-router/build/ExpoRoot';
import { getRouteInfoFromState } from 'expo-router/build/global-state/getRouteInfoFromState';
import { navigationRef } from 'expo-router/build/global-state/navigationRef';
import { getMockContext } from 'expo-router/build/testing-library/mock-config';
import Index from '../app/index';
import Login from '../app/login';
import Signup from '../app/signup';
import Boards from '../app/boards/index';
import Board from '../app/boards/[boardId]';
import TaskScreen from '../app/task/[taskId]';
import TaskForm from '../app/task-form';
import BoardForm from '../app/board-form';
import Settings from '../app/settings';
import { AppProviders } from '../src/AppProviders';
import { RootNavigator } from '../src/RootNavigator';
import { TOKEN_KEY } from '../src/storage';
import { makeStore } from '../src/store/store';
import { TOKEN } from './fakeApi';
import { secureStore } from './secureStoreMock';

/**
 * Renders the real screens with the real navigator, a fresh store and the fake API.
 * Same as Expo Router's renderRouter, but with real timers: the fake API runs on real
 * network code, which fake timers would freeze.
 */
export async function renderApp(initialUrl = '/', { signedIn = true }: { signedIn?: boolean } = {}) {
  if (signedIn) secureStore.set(TOKEN_KEY, TOKEN);
  const store = makeStore();
  const Layout = () => (
    <AppProviders store={store} locale="en">
      <RootNavigator />
    </AppProviders>
  );
  process.env.EXPO_ROUTER_IMPORT_MODE = 'sync';
  const context = getMockContext({
    _layout: Layout,
    index: Index,
    login: Login,
    signup: Signup,
    'boards/index': Boards,
    'boards/[boardId]': Board,
    'task/[taskId]': TaskScreen,
    'task-form': TaskForm,
    'board-form': BoardForm,
    settings: Settings,
  });
  const result = await render(<ExpoRoot context={context} location={initialUrl} />);
  const route = () => getRouteInfoFromState(navigationRef.getRootState() as never);
  return { ...result, store, getPathname: () => route().pathname };
}
