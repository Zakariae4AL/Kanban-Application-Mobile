import { fakeFetch, resetDb } from './fakeApi';
import { secureStore } from './secureStoreMock';

// The app talks to the API with fetch: in tests, fetch is served by the in-memory fake API.
const realFetch = globalThis.fetch;
beforeAll(() => {
  globalThis.fetch = fakeFetch as typeof fetch;
});
beforeEach(() => {
  resetDb();
  secureStore.clear();
});
afterAll(() => {
  globalThis.fetch = realFetch;
});
