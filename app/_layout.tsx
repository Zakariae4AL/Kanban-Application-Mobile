import { AppProviders } from '../src/AppProviders';
import { RootNavigator } from '../src/RootNavigator';

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
