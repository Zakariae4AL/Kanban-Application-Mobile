import { fireEvent, screen } from 'expo-router/testing-library';
import { TOKEN_KEY } from '../src/storage';
import { db, TOKEN } from '../test/fakeApi';
import { renderApp } from '../test/renderApp';
import { secureStore } from '../test/secureStoreMock';

describe('authentication', () => {
  it('shows the login screen when there is no saved session', async () => {
    const app = await renderApp('/', { signedIn: false });

    expect(await screen.findByRole('header', { name: 'Log in' })).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/login');
  });

  it('logs in with the demo account, saves the token securely and lists the boards', async () => {
    const app = await renderApp('/', { signedIn: false });

    await fireEvent.press(await screen.findByRole('button', { name: 'Use the demo account' }));

    expect(await screen.findByText('Platform Launch')).toBeOnTheScreen();
    expect(screen.getByText('Marketing Plan')).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/boards');
    expect(secureStore.get(TOKEN_KEY)).toBe(TOKEN);
    expect(db.calls).toContain('POST /auth/mobile/login');
  });

  it('validates the form before calling the API', async () => {
    await renderApp('/login', { signedIn: false });

    await fireEvent.press(await screen.findByRole('button', { name: 'Log in' }));

    expect(screen.getAllByText("Can't be empty")).toHaveLength(2);
    expect(db.calls).toEqual([]);
  });

  it('explains wrong credentials and network problems', async () => {
    await renderApp('/login', { signedIn: false });

    await fireEvent.changeText(await screen.findByLabelText('Email'), 'demo@kanban.dev');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'wrong-password');
    await fireEvent.press(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Invalid email or password.')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Email'), 'offline@kanban.dev');
    await fireEvent.press(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText(/Cannot reach the server/)).toBeOnTheScreen();
  });

  it('creates an account and opens the starter board list', async () => {
    await renderApp('/signup', { signedIn: false });

    await fireEvent.changeText(await screen.findByLabelText('Name'), 'Zakariae');
    await fireEvent.changeText(screen.getByLabelText('Email'), 'zak@example.com');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'Secret123');
    await fireEvent.changeText(screen.getByLabelText('Confirm password'), 'Secret123');
    await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('My first board')).toBeOnTheScreen();
  });

  it('rejects a weak password and an email already in use', async () => {
    await renderApp('/signup', { signedIn: false });

    await fireEvent.changeText(await screen.findByLabelText('Name'), 'Someone');
    await fireEvent.changeText(screen.getByLabelText('Email'), 'taken@kanban.dev');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'short');
    await fireEvent.changeText(screen.getByLabelText('Confirm password'), 'short');
    await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Min. 8 characters, with a letter and a digit')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Password'), 'Secret123');
    await fireEvent.changeText(screen.getByLabelText('Confirm password'), 'Secret123');
    await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('An account already exists with this email.')).toBeOnTheScreen();
  });

  it('restores the saved session at startup', async () => {
    const app = await renderApp('/');

    expect(await screen.findByText('Platform Launch')).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/boards');
  });

  it('signs out and forgets the token when it is rejected', async () => {
    db.tokenValid = false; // e.g. expired
    const app = await renderApp('/boards');

    expect(await screen.findByRole('header', { name: 'Log in' })).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/login');
    expect(secureStore.has(TOKEN_KEY)).toBe(false);
  });
});
