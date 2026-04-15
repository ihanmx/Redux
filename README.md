# Redux Project

A hands-on project covering Redux Toolkit from fundamentals to advanced patterns. Built progressively across feature branches — each branch introduces a new concept on top of the last.

The main application is a **Blog App** with full CRUD, user pages, and emoji reactions. A **Todo App** lives on a separate branch to demonstrate RTK Query in a simpler context.

---

## Tech Stack

- **React 19**
- **Redux Toolkit 2** — state management (`createSlice`, `createEntityAdapter`, RTK Query)
- **React Redux 9** — connecting React and Redux
- **React Router DOM v7** — client-side routing
- **date-fns** — date formatting
- **JSON Server** — local mock REST API (port 3500)

---

## Branch Guide

Each branch is a self-contained snapshot of a concept. They build on each other sequentially.

| Branch | Concept |
|---|---|
| `feature/simpleCounter` | `createSlice`, `useSelector`, `useDispatch` — Redux basics |
| `feature/PostsApp` | Multiple slices, reading from store, dispatching actions |
| `feature/asyncPostApp` | `createAsyncThunk`, `extraReducers`, loading/error states |
| `feature/blog` | Full CRUD for posts + user pages with async thunks |
| `feature/styles` | CSS styling pass |
| `refactor/normalization-optimization` | `createEntityAdapter` — normalized state, O(1) lookups, `sortComparer` |
| `feature/user` | User list and user page with per-user post filtering |
| `feature/TodoList-App-RTK` | RTK Query fundamentals — `createApi`, queries, mutations, cache invalidation |
| `feature/blog-RTK` | Blog app fully migrated to RTK Query — `injectEndpoints`, optimistic updates, per-ID cache tags |

---

## Blog App (feature/blog-RTK)

### Features

- View all posts sorted by newest first
- View a single post
- Add, edit, and delete posts
- Emoji reactions with optimistic updates (no waiting for server)
- Browse all users and view posts by a specific user
- Loading and error states throughout

### Project Structure

```
src/
├── app/
│   └── store.js                  # Store — RTK Query cache only, no manual slices
├── components/
│   ├── Header.js                 # Nav header
│   └── Layout.js                 # Shared layout wrapper
├── features/
│   ├── api/
│   │   └── apiSlice.js           # Base RTK Query API — tagTypes, baseQuery
│   ├── posts/
│   │   ├── postsSlice.js         # Posts endpoints + entity adapter + selectors
│   │   ├── PostsList.js          # All posts feed
│   │   ├── PostsExcerpt.js       # Single post card in the feed
│   │   ├── SinglePostPage.js     # Full post view
│   │   ├── AddPostForm.js        # Create post form
│   │   ├── EditPostForm.js       # Edit / delete post form
│   │   ├── PostAuther.js         # Displays post author name
│   │   ├── ReactionButtons.js    # Emoji reaction buttons (optimistic update)
│   │   └── TimeAgo.js            # Relative timestamp
│   └── users/
│       ├── usersSlice.js         # Users endpoints + entity adapter + selectors
│       ├── UsersList.js          # All users list
│       └── UserPage.js           # Posts by a specific user
└── App.js                        # Route definitions
```

### Routes

| Path | Component | Description |
|---|---|---|
| `/` | `PostsList` | Home — all posts |
| `/post` | `AddPostForm` | Create a new post |
| `/post/:postId` | `SinglePostPage` | View a single post |
| `/post/edit/:postId` | `EditPostForm` | Edit or delete a post |
| `/user` | `UsersList` | All users |
| `/user/:userId` | `UserPage` | Posts by a specific user |

---

## Redux Concepts Covered

### createSlice & Basics (`feature/simpleCounter`, `feature/PostsApp`)
- `createSlice` — defines reducers and auto-generates action creators
- `useSelector` — reads state from the store
- `useDispatch` — dispatches actions from components

### createAsyncThunk (`feature/asyncPostApp`, `feature/blog`)
- Handles async operations (API calls) with automatic `pending / fulfilled / rejected` action dispatch
- `extraReducers` — listens for thunk actions inside a slice

### createEntityAdapter (`refactor/normalization-optimization`)
Normalizes array data into `{ ids: [], entities: {} }` for O(1) lookups:
- `sortComparer` — keeps the `ids` array auto-sorted (newest post first)
- Built-in CRUD methods: `setAll`, `addOne`, `updateOne`, `removeOne`
- Auto-generated selectors: `selectAll`, `selectById`, `selectIds`

### RTK Query (`feature/TodoList-App-RTK`, `feature/blog-RTK`)
Replaces manual thunks and reducers with a declarative data-fetching layer:

**`createApi`** — defines the base config and all endpoints:
```js
const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3500" }),
  tagTypes: ["Post", "User"],
  endpoints: (builder) => ({}),
});
```

**`injectEndpoints`** — adds endpoints from feature slices without coupling them to the base slice.

**Cache Invalidation with Tags** — surgical refetching instead of refetching everything:
```
providesTags: [{ type: "Post", id: "LIST" }, ...ids]   // on query
invalidatesTags: [{ type: "Post", id: arg.id }]        // on mutation
```
- `id: "LIST"` → invalidates the whole list (used after adding a post)
- `id: someRealId` → invalidates one specific post (used after update/delete)

**Optimistic Updates** — reactions update the UI instantly before the server responds:
```js
// 1. patch the cache immediately
const patchResult = dispatch(apiSlice.util.updateQueryData(...))
try {
  await queryFulfilled   // wait for server
} catch {
  patchResult.undo()     // server failed → revert
}
```

**Selector pattern** — when multiple components share the same cache:
```js
// 1. Get the raw cache result
export const selectPostsResult = extendedApiSlice.endpoints.getPosts.select();
// 2. Drill into .data (the normalized entity object)
export const selectPostsData = createSelector(selectPostsResult, r => r.data);
// 3. Wire the adapter selectors to that data
export const { selectAll: selectAllPosts, selectById: selectPostById } =
  postsAdapter.getSelectors(state => selectPostsData(state) ?? initialState);
```
Components then pair `useGetPostsQuery()` (for subscription + loading states) with `useSelector(selectAllPosts)` (for clean array access).

---

## Todo App (feature/TodoList-App-RTK)

A simpler app demonstrating RTK Query CRUD without the complexity of entity adapters or per-ID cache tags.

- Get all todos (sorted by newest)
- Add a todo
- Toggle completed status
- Delete a todo
- Uses a simple `["Todos"]` tag — any mutation invalidates and refetches the full list

---

## Getting Started

**Start the mock API (required before the React app):**
```bash
cd my-app/blog-app   # or todo-app
npm run server
```
Runs JSON Server at `http://localhost:3500` watching `data/db.json`.

**Start the React app (in a separate terminal):**
```bash
npm install
npm start
```
App runs at `http://localhost:3000`.

> Both terminals must be running at the same time.
