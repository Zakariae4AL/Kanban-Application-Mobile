import { fireEvent, screen, waitFor } from 'expo-router/testing-library';
import { TOKEN_KEY } from '../src/storage';
import { db } from '../test/fakeApi';
import { renderApp } from '../test/renderApp';
import { secureStore } from '../test/secureStoreMock';

const boardUrl = () => `/boards/${db.boards[0]!.id}`;
const taskUrl = (taskId: string) => `/task/${taskId}?boardId=${db.boards[0]!.id}`;
const todo = () => db.boards[0]!.columns[0]!;
const doing = () => db.boards[0]!.columns[1]!;

describe('boards', () => {
  it('lists the boards and opens one', async () => {
    const app = await renderApp('/boards');

    await fireEvent.press(await screen.findByText('Platform Launch'));

    expect(await screen.findByText('Build UI for onboarding flow')).toBeOnTheScreen();
    expect(app.getPathname()).toBe(boardUrl());
    expect(screen.getByRole('tab', { name: 'Todo (2)' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Doing (1)' })).not.toBeSelected();
    expect(screen.getByText('1 of 2 subtasks')).toBeOnTheScreen();
  });

  it('selects another column with its tab', async () => {
    await renderApp(boardUrl());

    await fireEvent.press(await screen.findByRole('tab', { name: 'Doing (1)' }));

    expect(screen.getByRole('tab', { name: 'Doing (1)' })).toBeSelected();
  });

  it('offers to add a column on an empty board', async () => {
    await renderApp(`/boards/${db.boards[1]!.id}`);

    expect(await screen.findByText('This board has no columns yet.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Add a column' })).toBeOnTheScreen();
  });

  it('creates a board and opens it', async () => {
    const app = await renderApp('/board-form');

    await fireEvent.changeText(await screen.findByLabelText('Board name'), 'Website Redesign');
    await fireEvent.changeText(screen.getByLabelText('Columns 3'), 'todo');
    await fireEvent.press(screen.getByRole('button', { name: 'Create' }));
    expect(screen.getByText('Already used')).toBeOnTheScreen(); // "todo" vs "Todo"

    await fireEvent.press(screen.getByRole('button', { name: 'Remove todo' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(app.getPathname()).toMatch(/^\/boards\/.+/));
    expect(await screen.findByRole('tab', { name: 'Doing (0)' })).toBeOnTheScreen();
    expect(db.boards.map((b) => b.name)).toContain('Website Redesign');
  });

  it('renames a board and adds a column', async () => {
    await renderApp(`/board-form?boardId=${db.boards[0]!.id}`);

    const name = await screen.findByLabelText('Board name');
    await fireEvent.changeText(name, 'Launch 2.0');
    await fireEvent.press(screen.getByRole('button', { name: '+ Add column' }));
    await fireEvent.changeText(screen.getByLabelText('Columns 4'), 'Review');
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(db.boards[0]!.name).toBe('Launch 2.0'));
    expect(db.boards[0]!.columns.map((c) => c.name)).toEqual(['Todo', 'Doing', 'Done', 'Review']);
    expect(todo().tasks).toHaveLength(2); // tasks kept
  });

  it('deletes a board after confirmation', async () => {
    const app = await renderApp(boardUrl());

    await fireEvent.press(await screen.findByRole('button', { name: 'Board options' }));
    await fireEvent.press(screen.getByText('Delete board'));
    expect(screen.getByText(/Delete the 'Platform Launch' board/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(app.getPathname()).toBe('/boards'));
    expect(await screen.findByText('Marketing Plan')).toBeOnTheScreen();
    expect(db.boards.map((b) => b.name)).toEqual(['Marketing Plan']);
  });
});

describe('tasks', () => {
  it('shows a task, ticks a subtask and changes its status', async () => {
    const task = todo().tasks[0]!;
    await renderApp(taskUrl(task.id));

    expect(await screen.findByText('Screens for the first visit.')).toBeOnTheScreen();
    expect(screen.getByText('Subtasks (1 of 2)')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('checkbox', { name: 'Sign in page' }));
    expect(await screen.findByText('Subtasks (2 of 2)')).toBeOnTheScreen();
    expect(screen.getByRole('checkbox', { name: 'Sign in page' })).toBeChecked();
    await waitFor(() => expect(task.subtasks[1]!.isCompleted).toBe(true));

    await fireEvent.press(screen.getByRole('radio', { name: 'Doing' }));
    expect(screen.getByRole('radio', { name: 'Doing' })).toBeChecked();
    await waitFor(() =>
      expect(doing().tasks.map((t) => t.title)).toEqual(['Design settings page', task.title]),
    );
  });

  it('reorders a task with Move up / Move down', async () => {
    const second = todo().tasks[1]!;
    await renderApp(taskUrl(second.id));

    expect(await screen.findByRole('button', { name: '↓ Move down' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: '↑ Move up' }));

    await waitFor(() =>
      expect(todo().tasks.map((t) => t.title)).toEqual([
        'Build UI for search',
        'Build UI for onboarding flow',
      ]),
    );
    expect(await screen.findByRole('button', { name: '↑ Move up' })).toBeDisabled();
  });

  it('adds a task after validating the form', async () => {
    await renderApp(`/task-form?boardId=${db.boards[0]!.id}&columnId=${doing().id}`);

    await fireEvent.press(await screen.findByRole('button', { name: 'Create' }));
    expect(screen.getAllByText("Can't be empty")).toHaveLength(2); // title + empty subtask

    await fireEvent.changeText(screen.getByLabelText('Title'), 'Write release notes');
    await fireEvent.changeText(screen.getByLabelText('Subtasks 1'), 'Draft');
    expect(screen.getByRole('radio', { name: 'Doing' })).toBeChecked(); // preselected column
    await fireEvent.press(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(doing().tasks.map((t) => t.title)).toContain('Write release notes'));
    expect(
      doing()
        .tasks.at(-1)!
        .subtasks.map((s) => s.title),
    ).toEqual(['Draft']);
  });

  it('edits a task', async () => {
    const task = todo().tasks[1]!;
    await renderApp(`/task-form?boardId=${db.boards[0]!.id}&taskId=${task.id}`);

    const title = await screen.findByLabelText('Title');
    expect(title).toHaveDisplayValue('Build UI for search');
    await fireEvent.changeText(title, 'Build search results');
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(task.title).toBe('Build search results'));
  });

  it('deletes a task after confirmation', async () => {
    const task = todo().tasks[1]!;
    await renderApp(taskUrl(task.id));

    await fireEvent.press(await screen.findByRole('button', { name: 'Delete' }));
    const dialog = screen.getByText(/Delete the 'Build UI for search' task/);
    expect(dialog).toBeOnTheScreen();
    const buttons = screen.getAllByRole('button', { name: 'Delete' });
    await fireEvent.press(buttons[buttons.length - 1]!);

    await waitFor(() => expect(todo().tasks.map((t) => t.title)).toEqual(['Build UI for onboarding flow']));
  });

  it('tells the user when a task no longer exists', async () => {
    await renderApp(`/task/2f1c4a8e-9b0d-4c3e-8f5a-1b2c3d4e5f60?boardId=${db.boards[0]!.id}`);

    expect(await screen.findByText('This task no longer exists.')).toBeOnTheScreen();
  });
});

describe('settings', () => {
  it('shows the account and switches language and theme', async () => {
    await renderApp('/settings');

    expect(await screen.findByText('demo@kanban.dev')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('radio', { name: 'Dark' }));
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    expect(secureStore.get('kanban.theme')).toBe('dark');

    await fireEvent.press(screen.getByRole('radio', { name: 'Français' }));
    expect(await screen.findByRole('button', { name: 'Se déconnecter' })).toBeOnTheScreen();
    expect(secureStore.get('kanban.locale')).toBe('fr');
  });

  it('logs out and forgets the token', async () => {
    const app = await renderApp('/settings');

    await fireEvent.press(await screen.findByRole('button', { name: 'Log out' }));

    expect(await screen.findByRole('header', { name: 'Log in' })).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/login');
    await waitFor(() => expect(secureStore.has(TOKEN_KEY)).toBe(false));
  });
});

describe('protection', () => {
  it('never shows private screens to a signed-out user', async () => {
    const app = await renderApp(boardUrl(), { signedIn: false });

    expect(await screen.findByRole('header', { name: 'Log in' })).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/login');
    expect(screen.queryByText('Platform Launch')).toBeNull();
  });
});
