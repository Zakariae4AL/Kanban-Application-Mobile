import { StyleSheet, Text, View } from 'react-native';
import { kanbanApi, useMeQuery } from '../src/api/api';
import { Button, Card, FormScroll, Label, Muted, Segmented } from '../src/components/ui';
import { API_URL } from '../src/config';
import { LOCALES, useI18n } from '../src/i18n/I18nProvider';
import { signedOut } from '../src/store/sessionSlice';
import { useAppDispatch } from '../src/store/store';
import { useTheme, type ThemePreference } from '../src/theme/ThemeProvider';

export default function SettingsScreen() {
  const { t, locale, setLocale } = useI18n();
  const { colors, preference, setPreference } = useTheme();
  const dispatch = useAppDispatch();
  const { data: me } = useMeQuery();

  return (
    <FormScroll>
      <View>
        <Label>{t('settings.account')}</Label>
        <Card>
          <Text style={[styles.name, { color: colors.text }]}>{me?.name ?? '…'}</Text>
          <Muted>{me?.email ?? ''}</Muted>
        </Card>
      </View>
      <Segmented<ThemePreference>
        label={t('settings.theme')}
        value={preference}
        onChange={setPreference}
        options={[
          { value: 'system', label: t('settings.theme.system') },
          { value: 'light', label: t('settings.theme.light') },
          { value: 'dark', label: t('settings.theme.dark') },
        ]}
      />
      <Segmented
        label={t('settings.language')}
        value={locale}
        onChange={setLocale}
        options={LOCALES.map((code) => ({ value: code, label: code === 'en' ? 'English' : 'Français' }))}
      />
      <View>
        <Label>{t('settings.server')}</Label>
        <Muted>{API_URL}</Muted>
      </View>
      <Button
        title={t('settings.logout')}
        variant="danger"
        onPress={() => {
          dispatch(signedOut());
          dispatch(kanbanApi.util.resetApiState());
        }}
      />
    </FormScroll>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
});
