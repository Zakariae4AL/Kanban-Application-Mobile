/** Created by `npm run seed` in the backend. */
export const DEMO = { email: 'demo@kanban.dev', password: 'Demo1234' };

import type { MessageKey } from '../../i18n/messages';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;

export type Errors<T extends string> = Partial<Record<T, MessageKey>>;

export function validateLogin(values: { email: string; password: string }): Errors<'email' | 'password'> {
  const errors: Errors<'email' | 'password'> = {};
  if (!values.email.trim()) errors.email = 'validation.required';
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'validation.email';
  if (!values.password) errors.password = 'validation.required';
  return errors;
}

export function validateSignup(values: {
  name: string;
  email: string;
  password: string;
  confirm: string;
}): Errors<'name' | 'email' | 'password' | 'confirm'> {
  const errors: Errors<'name' | 'email' | 'password' | 'confirm'> = {};
  if (!values.name.trim()) errors.name = 'validation.required';
  if (!values.email.trim()) errors.email = 'validation.required';
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'validation.email';
  if (!PASSWORD_RE.test(values.password)) errors.password = 'validation.password';
  if (values.confirm !== values.password) errors.confirm = 'validation.passwordMatch';
  return errors;
}
