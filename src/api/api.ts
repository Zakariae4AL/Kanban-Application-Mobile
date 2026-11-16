import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { API_URL } from '../config';
import { signedIn, signedOut } from '../store/sessionSlice';
import type { Board, BoardInput, BoardSummary, Locale, Subtask, Task, TaskInput, User } from './types';

type StateWithToken = { session: { token: string | null } };

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as StateWithToken).session.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

/** An expired or revoked token signs the user out (the app then shows the login screen). */
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra);
  const url = typeof args === 'string' ? args : args.url;
  if (result.error?.status === 401 && !url.startsWith('/auth/mobile/')) {
    api.dispatch(signedOut());
    api.dispatch(kanbanApi.util.resetApiState());
  }
  return result;
};

/** Resolves to the result, or null when the request failed (the caller handles the error). */
async function settled<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}

/** Moves a task inside a cached board and renumbers positions, like the server does. */
export function moveTaskInBoard(board: Board, taskId: string, columnId: string, position: number) {
  const source = board.columns.find((c) => c.tasks.some((t) => t.id === taskId));
  const target = board.columns.find((c) => c.id === columnId);
  if (!source || !target) return;

  const [task] = source.tasks.splice(
    source.tasks.findIndex((t) => t.id === taskId),
    1,
  );
  if (!task) return;
  task.columnId = target.id;
  target.tasks.splice(Math.min(Math.max(position, 0), target.tasks.length), 0, task);
  for (const column of new Set([source, target])) column.tasks.forEach((t, i) => (t.position = i));
}

type AuthResponse = { user: User; token: string };

export const kanbanApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Me', 'Boards', 'Board'],
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/mobile/login', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const result = await settled(queryFulfilled);
        if (result) dispatch(signedIn(result.data));
      },
    }),
    register: build.mutation<AuthResponse, { name: string; email: string; password: string; locale: Locale }>(
      {
        query: (body) => ({ url: '/auth/mobile/register', method: 'POST', body }),
        async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
          const result = await settled(queryFulfilled);
          if (result) dispatch(signedIn(result.data));
        },
      },
    ),
    me: build.query<User, void>({ query: () => '/auth/me', providesTags: ['Me'] }),

    getBoards: build.query<BoardSummary[], void>({ query: () => '/boards', providesTags: ['Boards'] }),
    getBoard: build.query<Board, string>({
      query: (id) => `/boards/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Board', id }],
    }),
    createBoard: build.mutation<Board, BoardInput>({
      query: (body) => ({ url: '/boards', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const result = await settled(queryFulfilled);
        if (!result) return;
        const board = result.data;
        dispatch(
          kanbanApi.util.updateQueryData('getBoards', undefined, (list) => {
            list.push({ id: board.id, name: board.name });
          }),
        );
        dispatch(kanbanApi.util.upsertQueryData('getBoard', board.id, board));
      },
    }),
    updateBoard: build.mutation<Board, BoardInput & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/boards/${id}`, method: 'PATCH', body }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const result = await settled(queryFulfilled);
        if (!result) return;
        dispatch(kanbanApi.util.upsertQueryData('getBoard', id, result.data));
        dispatch(
          kanbanApi.util.updateQueryData('getBoards', undefined, (list) => {
            const item = list.find((b) => b.id === id);
            if (item) item.name = result.data.name;
          }),
        );
      },
    }),
    deleteBoard: build.mutation<void, string>({
      query: (id) => ({ url: `/boards/${id}`, method: 'DELETE' }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        if (!(await settled(queryFulfilled))) return;
        dispatch(
          kanbanApi.util.updateQueryData('getBoards', undefined, (list) => list.filter((b) => b.id !== id)),
        );
      },
    }),

    createTask: build.mutation<Task, TaskInput & { boardId: string }>({
      query: ({ boardId, ...body }) => ({ url: `/boards/${boardId}/tasks`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { boardId }) => [{ type: 'Board', id: boardId }],
    }),
    updateTask: build.mutation<Task, Partial<TaskInput> & { id: string; boardId: string }>({
      query: ({ id, boardId: _boardId, ...body }) => ({ url: `/tasks/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { boardId }) => [{ type: 'Board', id: boardId }],
    }),
    moveTask: build.mutation<Task, { id: string; boardId: string; columnId: string; position: number }>({
      query: ({ id, columnId, position }) => ({
        url: `/tasks/${id}/move`,
        method: 'PATCH',
        body: { columnId, position },
      }),
      async onQueryStarted({ id, boardId, columnId, position }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          kanbanApi.util.updateQueryData('getBoard', boardId, (board) =>
            moveTaskInBoard(board, id, columnId, position),
          ),
        );
        if (!(await settled(queryFulfilled))) patch.undo();
      },
    }),
    deleteTask: build.mutation<void, { id: string; boardId: string }>({
      query: ({ id }) => ({ url: `/tasks/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { boardId }) => [{ type: 'Board', id: boardId }],
    }),
    toggleSubtask: build.mutation<Subtask, { id: string; boardId: string; isCompleted: boolean }>({
      query: ({ id, isCompleted }) => ({ url: `/subtasks/${id}`, method: 'PATCH', body: { isCompleted } }),
      async onQueryStarted({ id, boardId, isCompleted }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          kanbanApi.util.updateQueryData('getBoard', boardId, (board) => {
            for (const task of board.columns.flatMap((c) => c.tasks)) {
              const subtask = task.subtasks.find((s) => s.id === id);
              if (subtask) subtask.isCompleted = isCompleted;
            }
          }),
        );
        if (!(await settled(queryFulfilled))) patch.undo();
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useMeQuery,
  useGetBoardsQuery,
  useGetBoardQuery,
  useCreateBoardMutation,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useMoveTaskMutation,
  useDeleteTaskMutation,
  useToggleSubtaskMutation,
} = kanbanApi;

export const errorStatus = (error: unknown): number | undefined =>
  typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number'
    ? error.status
    : undefined;
