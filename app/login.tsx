import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLoginMutation } from '../src/api/api';
import { Button, ErrorText, FormScroll, Muted, TextField, Title } from '../src/components/ui';
import { authErrorKey } from '../src/features/auth/authErrors';
import { DEMO, validateLogin, type Errors } from '../src/features/auth/validation';
import { LOCALES, useI18n } from '../src/i18n/I18nProvider';
import { useTheme } from '../src/theme/ThemeProvider';

export default function LoginScreen() {
  const { t, locale, setLocale } = useI18n();
  const { colors } = useTheme();
  const [login, { isLoading }] = useLoginMutation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Errors<'email' | 'password'>>({});
  const [formError, setFormError] = useState<string>();

  const submit = async (credentials = values) => {
    const found = validateLogin(credentials);
    setErrors(found);
    setFormError(undefined);
    if (Object.keys(found).length) return;
    try {
      await login({ email: credentials.email.trim(), password: credentials.password }).unwrap();
      // The navigator switches to the boards automatically once signed in.
    } catch (error) {
      setFormError(t(authErrorKey(error)));
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.page }]}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FormScroll>
          <View style={styles.brandRow}>
            <View
              style={styles.logo}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              {[1, 0.75, 0.5].map((opacity) => (
                <View
                  key={opacity}
                  style={[styles.logoBar, { backgroundColor: colors.accentText, opacity }]}
                />
              ))}
            </View>
            <Text style={[styles.brand, { color: colors.text }]}>{t('app.name')}</Text>
            <View style={styles.lang}>
              {LOCALES.map((code) => (
                <Text
                  key={code}
                  role="button"
                  aria-selected={locale === code}
                  onPress={() => setLocale(code)}
                  style={[styles.langItem, { color: locale === code ? colors.accentText : colors.muted }]}
                >
                  {code.toUpperCase()}
                </Text>
              ))}
            </View>
          </View>
          <View>
            <Title>{t('auth.login.title')}</Title>
            <Muted>{t('app.tagline')}</Muted>
          </View>
          <TextField
            label={t('auth.email')}
            value={values.email}
            onChangeText={(email) => setValues((v) => ({ ...v, email }))}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            error={errors.email && t(errors.email)}
          />
          <TextField
            label={t('auth.password')}
            value={values.password}
            onChangeText={(password) => setValues((v) => ({ ...v, password }))}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            onSubmitEditing={() => void submit()}
            error={errors.password && t(errors.password)}
          />
          {formError && <ErrorText>{formError}</ErrorText>}
          <Button title={t('auth.login.submit')} loading={isLoading} onPress={() => void submit()} />
          <Button
            title={t('auth.demo')}
            variant="secondary"
            onPress={() => {
              setValues(DEMO);
              void submit(DEMO);
            }}
          />
          <Text style={[styles.footer, { color: colors.muted }]}>
            {t('auth.login.noAccount')}{' '}
            <Link href="/signup" style={[styles.link, { color: colors.accentText }]}>
              {t('auth.login.toSignup')}
            </Link>
          </Text>
        </FormScroll>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 12 },
  logo: { flexDirection: 'row', gap: 3 },
  logoBar: { width: 6, height: 25, borderRadius: 2 },
  brand: { fontSize: 26, fontWeight: '800', flex: 1 },
  lang: { flexDirection: 'row', gap: 4 },
  langItem: { fontSize: 14, fontWeight: '800', padding: 10 },
  footer: { textAlign: 'center', fontSize: 14 },
  link: { fontWeight: '700' },
});
