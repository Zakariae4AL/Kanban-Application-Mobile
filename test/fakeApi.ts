/* eslint-disable @typescript-eslint/no-explicit-any -- request bodies in this test fixture are loosely typed */
import type { Board, Task, User } from '../src/api/types';

/**
 * In-memory version of the Kanban API (mobile routes + Bearer token),
 * served through a fake `fetch` installed for the tests.
 */
const API = 'http://localhost:3000/api/v1';
export const TOKEN = 'test-token';

type Db = { user: User & { password: string }; tokenValid: boolean; boards: Board[]; calls: string[] };

let seq = 0;
const id = () => `00000000-0000-4000-8000-${String(++seq).padStart(12, '0')}`;

export function seedBoards(): Board[] {
  const [todo, doing, done] = [id(), id(), id()];
  return [
    {
      id: id(),
      name: 'Platform Launch',
      createdAt: '2026-01-01T00:00:00Z',
      columns: [
        {
          id: todo,
          name: 'Todo',
          position: 0,
          tasks: [
            {
              id: id(),
              title: 'Build UI for onboarding flow',
              description: 'Screens for the first visit.',
              position: 0,
              columnId: todo,
              subtasks: [
                { id: id(), title: 'Sign up page', isCompleted: true, position: 0 },
                { id: id(), title: 'Sign in page', isCompleted: false, position: 1 },
              ],
            },
            {
              id: id(),
              title: 'Build UI for search',
              description: '',
              position: 1,
              columnId: todo,
              subtasks: [],
            },
          ],
        },
        {
          id: doing,
          name: 'Doing',
          position: 1,
          tasks: [
            {
              id: id(),
              title: 'Design settings page',
              description: '',
              position: 0,
              columnId: doing,
              subtasks: [],
            },
          ],
        },
        { id: done, name: 'Done', position: 2, tasks: [] },
      ],
    },
    { id: id(), name: 'Marketing Plan', createdAt: '2026-01-02T00:00:00Z', columns: [] },
  ];
}

export const db: Db = {
  user: { id: 'u1', email: 'demo@kanban.dev', name: 'Demo User', createdAt: '', password: 'Demo1234' },
  tokenValid: true,
  boards: [],
  calls: [],
};

export function resetDb() {
  seq = 0;
  db.tokenValid = true;
  db.boards = seedBoards();
  db.calls = [];
}

const publicUser = () => ({
  id: db.user.id,
  email: db.user.email,
  name: db.user.name,
  createdAt: db.user.createdAt,
});
const authorized = (request: { headers: Headers }) =>
  db.tokenValid && request.headers.get('Authorization') === `Bearer ${TOKEN}`;
const allTasks = () => db.boards.flatMap((b) => b.columns.flatMap((c) => c.tasks));
const columnById = (columnId: string) => db.boards.flatMap((b) => b.columns).find((c) => c.id === columnId);
const renumber = (tasks: Task[]) => tasks.forEach((t, i) => (t.position = i));

type Reply = { status: number; body?: unknown } | 'network-error';
type Handler = (ctx: {
  params: Record<string, string>;
  body: any;
  headers: Headers;
}) => Reply | Promise<Reply>;
const json = (body: unknown, status = 200): Reply => ({ status, body });
const noContent = (): Reply => ({ status: 204 });

const routes: [string, string, Handler][] = [
  [
    'POST',
    '/auth/mobile/login',
    ({ body }) => {
      if (body.email === 'offline@kanban.dev') return 'network-error';
      if (body.email !== db.user.email || body.password !== db.user.password) {
        return json({ message: 'Invalid email or password.' }, 401);
      }
      return json({ user: publicUser(), token: TOKEN });
    },
  ],
  [
    'POST',
    '/auth/mobile/register',
    ({ body }) => {
      if (body.email === 'taken@kanban.dev') return json({ message: 'Conflict' }, 409);
      db.user = { ...db.user, email: body.email, name: body.name };
      db.boards = [
        {
          id: id(),
          name: body.locale === 'fr' ? 'Mon premier tableau' : 'My first board',
          createdAt: '',
          columns: [],
        },
      ];
      return json({ user: publicUser(), token: TOKEN }, 201);
    },
  ],
  ['GET', '/auth/me', () => json(publicUser())],

  ['GET', '/boards', () => json(db.boards.map(({ id, name }) => ({ id, name })))],
  [
    'GET',
    '/boards/:id',
    ({ params }) => {
      const board = db.boards.find((b) => b.id === params.id);
      return board ? json(board) : json({ message: 'Not found' }, 404);
    },
  ],
  [
    'POST',
    '/boards',
    ({ body }) => {
      const board: Board = {
        id: id(),
        name: body.name,
        createdAt: '',
        columns: body.columns.map((c: { name: string }, position: number) => ({
          id: id(),
          name: c.name,
          position,
          tasks: [],
        })),
      };
      db.boards.push(board);
      return json(board, 201);
    },
  ],
  [
    'PATCH',
    '/boards/:id',
    ({ params, body }) => {
      const board = db.boards.find((b) => b.id === params.id)!;
      board.name = body.name;
      board.columns = body.columns.map((c: { id?: string; name: string }, position: number) => ({
        id: c.id ?? id(),
        name: c.name,
        position,
        tasks: board.columns.find((col) => col.id === c.id)?.tasks ?? [],
      }));
      return json(board);
    },
  ],
  [
    'DELETE',
    '/boards/:id',
    ({ params }) => {
      db.boards = db.boards.filter((b) => b.id !== params.id);
      return noContent();
    },
  ],

  [
    'POST',
    '/boards/:boardId/tasks',
    ({ body }) => {
      const column = columnById(body.columnId)!;
      const task: Task = {
        id: id(),
        title: body.title,
        description: body.description,
        columnId: column.id,
        position: column.tasks.length,
        subtasks: body.subtasks.map((s: { title: string }, position: number) => ({
          id: id(),
          title: s.title,
          isCompleted: false,
          position,
        })),
      };
      column.tasks.push(task);
      return json(task, 201);
    },
  ],
  [
    'PATCH',
    '/tasks/:id/move',
    ({ params, body }) => {
      const task = allTasks().find((t) => t.id === params.id)!;
      const source = columnById(task.columnId)!;
      const target = columnById(body.columnId)!;
      source.tasks = source.tasks.filter((t) => t.id !== task.id);
      task.columnId = target.id;
      target.tasks.splice(Math.min(body.position, target.tasks.length), 0, task);
      renumber(source.tasks);
      renumber(target.tasks);
      return json(task);
    },
  ],
  [
    'PATCH',
    '/tasks/:id',
    ({ params, body }) => {
      const task = allTasks().find((t) => t.id === params.id)!;
      if (body.title !== undefined) task.title = body.title;
      if (body.description !== undefined) task.description = body.description;
      if (body.subtasks) {
        task.subtasks = body.subtasks.map((s: { id?: string; title: string }, position: number) => ({
          id: s.id ?? id(),
          title: s.title,
          isCompleted: task.subtasks.find((x) => x.id === s.id)?.isCompleted ?? false,
          position,
        }));
      }
      return json(task);
    },
  ],
  [
    'DELETE',
    '/tasks/:id',
    ({ params }) => {
      for (const column of db.boards.flatMap((b) => b.columns)) {
        column.tasks = column.tasks.filter((t) => t.id !== params.id);
      }
      return noContent();
    },
  ],
  [
    'PATCH',
    '/subtasks/:id',
    ({ params, body }) => {
      const subtask = allTasks()
        .flatMap((t) => t.subtasks)
        .find((s) => s.id === params.id)!;
      subtask.isCompleted = body.isCompleted;
      return json(subtask);
    },
  ],
];

const compile = (pattern: string) => new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$');
const compiled = routes.map(([method, pattern, handler]) => ({ method, regex: compile(pattern), handler }));

/** Minimal Response with what RTK Query needs (status, headers, clone, text, json). */
function makeResponse(status: number, body?: unknown) {
  const text = body === undefined ? '' : JSON.stringify(body);
  const response = {
    status,
    ok: status >= 200 && status < 300,
    headers: new Headers(body === undefined ? {} : { 'content-type': 'application/json' }),
    text: async () => text,
    json: async () => JSON.parse(text),
    clone: () => makeResponse(status, body),
  };
  return response as unknown as Response;
}

export async function fakeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const request = input instanceof Request ? input : new Request(String(input), init);
  const url = new URL(request.url);
  if (!url.href.startsWith(API)) throw new TypeError(`Unexpected request to ${url.href}`);
  const path = url.pathname.replace('/api/v1', '');
  db.calls.push(`${request.method} ${path}`);

  if (!path.startsWith('/auth/mobile/') && !authorized(request))
    return makeResponse(401, { message: 'Unauthorized' });

  for (const route of compiled) {
    const match = route.method === request.method ? route.regex.exec(path) : null;
    if (!match) continue;
    const raw = await request.text();
    const reply = await route.handler({
      params: { ...match.groups },
      body: raw ? JSON.parse(raw) : undefined,
      headers: request.headers,
    });
    if (reply === 'network-error') throw new TypeError('Network request failed');
    return makeResponse(reply.status, reply.body);
  }
  return makeResponse(404, { message: 'Not found' });
}
