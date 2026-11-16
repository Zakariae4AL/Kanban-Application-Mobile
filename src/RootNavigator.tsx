import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Loading } from './components/ui';
import { useI18n } from './i18n/I18nProvider';
import { useAppSelector } from './store/store';
import { useTheme } from './theme/ThemeProvider';

/**
 * Signed-out users only see login/signup; signed-in users only see the app.
 * Expo Router redirects automatically when the session changes.
 */
export function RootNavigator() {
  const { status, token } = useAppSelector((s) => s.session);
  const { colors, scheme } = useTheme();
  const { t } = useI18n();

  if (status === 'restoring') return <Loading />;

  const signedIn = Boolean(token);
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.page },
          headerShadowVisible: false,
        }}
      >
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ title: t('auth.signup.title') }} />
        </Stack.Protected>
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="boards/index" options={{ title: t('boards.title') }} />
          <Stack.Screen name="boards/[boardId]" options={{ title: '' }} />
          <Stack.Screen name="task/[taskId]" options={{ presentation: 'modal', title: '' }} />
          <Stack.Screen name="task-form" options={{ presentation: 'modal' }} />
          <Stack.Screen name="board-form" options={{ presentation: 'modal' }} />
          <Stack.Screen name="settings" options={{ title: t('settings.title') }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
