import { errorStatus } from '../../api/api';
import type { MessageKey } from '../../i18n/messages';

/** Translates an API error from login/signup into a message key. */
export function authErrorKey(error: unknown): MessageKey {
  const status = errorStatus(error);
  if (status === 401) return 'auth.error.invalid';
  if (status === 409) return 'auth.error.emailTaken';
  if (status === 429) return 'auth.error.tooMany';
  if (status === undefined) return 'auth.error.network';
  return 'error.generic';
}
