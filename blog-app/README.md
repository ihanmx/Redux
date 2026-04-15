# Redux Blog App

A full-featured blog application built as a learning project to practice Redux Toolkit concepts including async thunks, entity adapters, memoized selectors, and React Router.

## Tech Stack

- **React 19**
- **Redux Toolkit** — state management
- **React Redux** — connecting React and Redux
- **React Router DOM v7** — client-side routing
- **Axios** — HTTP requests
- **date-fns** — date formatting
- **JSONPlaceholder** — mock REST API

## Features

- View all blog posts sorted by newest first
- View a single post on its own page
- Add a new post with title, content, and author
- Edit an existing post
- Delete a post
- React to posts with emoji reactions (thumbsUp, wow, heart, rocket, coffee)
- View all users and browse posts by a specific user
- Async data fetching with loading/error states

## Project Structure

```
src/
├── app/
│   └── store.js                  # Redux store configuration
├── components/
│   ├── Header.js                 # Nav header
│   └── Layout.js                 # Shared layout wrapper
├── features/
│   ├── posts/
│   │   ├── postsSlice.js         # Posts state — adapter, thunks, selectors
│   │   ├── PostsList.js          # All posts feed
│   │   ├── PostsExcerpt.js       # Single post card
│   │   ├── SinglePostPage.js     # Full post view
│   │   ├── AddPostForm.js        # Create post form
│   │   ├── EditPostForm.js       # Edit / delete post form
│   │   ├── PostAuther.js         # Displays post author name
│   │   ├── ReactionButtons.js    # Emoji reaction buttons
│   │   └── TimeAgo.js            # Relative timestamp display
│   └── users/
│       ├── usersSlice.js         # Users state — thunk, selectors
│       ├── UsersList.js          # All users list
│       └── UserPage.js           # Posts by a specific user
└── App.js                        # Route definitions
```

## Redux Concepts Covered

### Entity Adapter
Posts state is normalized using `createEntityAdapter`, which provides:
- `{ ids: [], entities: {} }` shape for O(1) lookups
- Auto-sorting via `sortComparer` (newest post first)
- Built-in CRUD methods: `addOne`, `upsertMany`, `updateOne`, `removeOne`
- Auto-generated selectors: `selectAll`, `selectById`, `selectIds`

### Async Thunks
All API calls use `createAsyncThunk`, which automatically dispatches:
- `pending` — triggers loading state
- `fulfilled` — delivers data to the reducer
- `rejected` — captures error message

| Thunk | Method | Endpoint |
|---|---|---|
| `fetchPosts` | GET | `/posts` |
| `addNewPost` | POST | `/posts` |
| `updatePost` | PUT | `/posts/:id` |
| `deletePost` | DELETE | `/posts/:id` |
| `fetchUsers` | GET | `/users` |

### Memoized Selectors
`selectPostByUser` uses `createSelector` to filter posts by user ID. The result is cached and only recomputed when posts or the userId argument change — preventing unnecessary re-renders.

## Routes

| Path | Component | Description |
|---|---|---|
| `/` | `PostsList` | Home — all posts |
| `/post` | `AddPostForm` | Create a new post |
| `/post/:postId` | `SinglePostPage` | View a single post |
| `/post/edit/:postId` | `EditPostForm` | Edit or delete a post |
| `/user` | `UsersList` | All users |
| `/user/:userId` | `UserPage` | Posts by a specific user |

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

App runs on [http://localhost:3000](http://localhost:3000)

## API

Data is fetched from [JSONPlaceholder](https://jsonplaceholder.typicode.com) — a free fake REST API for testing. Write operations (POST, PUT, DELETE) are simulated and won't persist between page refreshes.
