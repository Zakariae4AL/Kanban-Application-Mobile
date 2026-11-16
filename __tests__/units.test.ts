import { moveTaskInBoard } from '../src/api/api';
import { authErrorKey } from '../src/features/auth/authErrors';
import { validateLogin, validateSignup } from '../src/features/auth/validation';
import { validateList } from '../src/features/listValidation';
import { messages } from '../src/i18n/messages';
import { seedBoards } from '../test/fakeApi';

describe('moveTaskInBoard', () => {
  const titles = (board: ReturnType<typeof seedBoards>[number]) =>
    board.columns.map((c) => c.tasks.map((t) => `${t.title}@${t.position}`));

  it('moves across columns and renumbers both', () => {
    const board = seedBoards()[0]!;
    moveTaskInBoard(board, board.columns[0]!.tasks[0]!.id, board.columns[1]!.id, 0);
    expect(titles(board)).toEqual([
      ['Build UI for search@0'],
      ['Build UI for onboarding flow@0', 'Design settings page@1'],
      [],
    ]);
  });

  it('clamps positions and ignores unknown ids', () => {
    const board = seedBoards()[0]!;
    moveTaskInBoard(board, board.columns[0]!.tasks[0]!.id, board.columns[0]!.id, 99);
    expect(titles(board)[0]).toEqual(['Build UI for search@0', 'Build UI for onboarding flow@1']);
    moveTaskInBoard(board, board.columns[0]!.tasks[0]!.id, board.columns[0]!.id, -5);
    expect(titles(board)[0]).toEqual(['Build UI for search@0', 'Build UI for onboarding flow@1']);

    const before = JSON.stringify(board);
    moveTaskInBoard(board, 'nope', board.columns[1]!.id, 0);
    expect(JSON.stringify(board)).toBe(before);
  });
});

describe('authErrorKey', () => {
  it.each([
    [{ status: 401 }, 'auth.error.invalid'],
    [{ status: 409 }, 'auth.error.emailTaken'],
    [{ status: 429 }, 'auth.error.tooMany'],
    [{ status: 'FETCH_ERROR' }, 'auth.error.network'],
    [{ status: 500 }, 'error.generic'],
  ])('maps %p to %s', (error, key) => {
    expect(authErrorKey(error)).toBe(key);
  });
});

describe('form validation', () => {
  it('matches the API rules', () => {
    expect(validateLogin({ email: 'nope', password: '' })).toEqual({
      email: 'validation.email',
      password: 'validation.required',
    });
    expect(
      validateSignup({ name: 'A', email: 'a@b.co', password: 'Secret123', confirm: 'Secret123' }),
    ).toEqual({});
    expect(validateSignup({ name: '', email: 'a@b.co', password: '12345678', confirm: 'x' })).toEqual({
      name: 'validation.required',
      password: 'validation.password',
      confirm: 'validation.passwordMatch',
    });
  });

  it('flags empty and duplicated list items', () => {
    const items = ['Todo', ' todo ', ''].map((value, i) => ({ key: String(i), value }));
    const result = validateList(items, { required: 'req', duplicate: 'dup' });
    expect(result.valid).toBe(false);
    expect(result.items.map((i) => i.error)).toEqual([undefined, 'dup', 'req']);
  });
});

describe('translations', () => {
  it('has every English message in French, with the same placeholders', () => {
    expect(Object.keys(messages.fr).sort()).toEqual(Object.keys(messages.en).sort());
    const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(messages.en) as (keyof typeof messages.en)[]) {
      expect(placeholders(messages.fr[key])).toEqual(placeholders(messages.en[key]));
    }
  });
});
