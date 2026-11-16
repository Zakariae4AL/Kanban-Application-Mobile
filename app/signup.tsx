import { useState } from 'react';
import { errorStatus, useRegisterMutation } from '../src/api/api';
import { Button, ErrorText, FormScroll, TextField } from '../src/components/ui';
import { authErrorKey } from '../src/features/auth/authErrors';
import { validateSignup, type Errors } from '../src/features/auth/validation';
import { useI18n } from '../src/i18n/I18nProvider';

type Values = { name: string; email: string; password: string; confirm: string };

export default function SignupScreen() {
  const { t, locale } = useI18n();
  const [register, { isLoading }] = useRegisterMutation();
  const [values, setValues] = useState<Values>({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors<keyof Values>>({});
  const [formError, setFormError] = useState<string>();

  const set = (field: keyof Values) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const submit = async () => {
    const found = validateSignup(values);
    setErrors(found);
    setFormError(undefined);
    if (Object.keys(found).length) return;
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        locale,
      }).unwrap();
    } catch (error) {
      if (errorStatus(error) === 409) setErrors({ email: 'validation.duplicate' });
      setFormError(t(authErrorKey(error)));
    }
  };

  return (
    <FormScroll>
      <TextField
        label={t('auth.name')}
        value={values.name}
        onChangeText={set('name')}
        maxLength={80}
        autoComplete="name"
        error={errors.name && t(errors.name)}
      />
      <TextField
        label={t('auth.email')}
        value={values.email}
        onChangeText={set('email')}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        error={errors.email && t(errors.email)}
      />
      <TextField
        label={t('auth.password')}
        value={values.password}
        onChangeText={set('password')}
        secureTextEntry
        maxLength={72}
        autoComplete="new-password"
        hint={t('auth.passwordHint')}
        error={errors.password && t(errors.password)}
      />
      <TextField
        label={t('auth.confirmPassword')}
        value={values.confirm}
        onChangeText={set('confirm')}
        secureTextEntry
        maxLength={72}
        error={errors.confirm && t(errors.confirm)}
      />
      {formError && <ErrorText>{formError}</ErrorText>}
      <Button title={t('auth.signup.submit')} loading={isLoading} onPress={() => void submit()} />
    </FormScroll>
  );
}
