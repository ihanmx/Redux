import {
  createSelector,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import { sub } from "date-fns";
import { apiSlice } from "../api/apiSlice";

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
});
const initialState = postsAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => "/posts",
      transformResponse: (responseData) => {
        ///we need to add date and reaction to res
        let min = 1;
        const loadedPosts = responseData.map((post) => {
          if (!post.date) {
            post.date = sub(new Date(), { minutes: min++ }).toISOString();
          }
          if (!post.reactions) {
            post.reactions = {
              thumbsUp: 0,
              wow: 0,
              heart: 0,
              rocket: 0,
              coffee: 0,
            };
          }
          return post;
        });
        return postsAdapter.setAll(initialState, loadedPosts);
      },
      providesTags: (result, error, arg) => [
        { type: "Post", id: "LIST" }, // <-- covers the whole list
        ...result.ids.map((id) => ({ type: "Post", id })),
      ],
    }),
    getPostsByUserId: builder.query({
      query: (id) => `/posts/?userId=${id}`,
      transformResponse: (responseData) => {
        ///we need to add date and reaction to res
        let min = 1;
        const loadedPosts = responseData.map((post) => {
          if (!post.date) {
            post.date = sub(new Date(), { minutes: min++ }).toISOString();
          }
          if (!post.reactions) {
            post.reactions = {
              thumbsUp: 0,
              wow: 0,
              heart: 0,
              rocket: 0,
              coffee: 0,
            };
          }
          return post;
        });
        return postsAdapter.setAll(initialState, loadedPosts);
      },
      providesTags: (result, error, arg) => {
        console.log(result); //we don't invalidate the whole list

        return [...result.ids.map((id) => ({ type: "Post", id }))];
      },
    }),
    addNewPost: builder.mutation({
      query: (initialPost) => ({
        url: "/posts",
        method: "POST",
        body: {
          ...initialPost,
          userId: Number(initialPost.userId),
          date: new Date().toISOString(),
          reactions: {
            thumbsUp: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0,
          },
        },
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),
    updatePost: builder.mutation({
      query: (initialPost) => ({
        url: `/posts/${initialPost.id}`,
        method: "PUT",
        body: { ...initialPost, date: new Date().toISOString() },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Post", id: arg.id }],
    }),
    deletePost: builder.mutation({
      query: ({ id }) => ({
        url: `/posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Post", id: arg.id }],
    }), // Optimistic Update not  Invalidate & Refetch for reaction
    // update the UI instantly
    addReaction: builder.mutation({
      query: ({ postId, reactions }) => ({
        url: `posts/${postId}`,
        method: "PATCH",
        body: { reactions },
      }),
      async onQueryStarted(
        { postId, reactions },
        { dispatch, queryFulfilled },
      ) {
        const patchResult = dispatch(
          //update cache instead of redux state
          extendedApiSlice.util.updateQueryData(
            "getPosts", //were we cach data to patch
            undefined,
            (draft) => {
              // draft — an Immer draft of the normalized { ids, entities } object, so you can mutate it safely
              const post = draft.entities[postId];
              if (post) post.reactions = reactions;
            },
          ),
        );
        try {
          await queryFulfilled; //// wait for server — if it succeeds, keep the optimistic change
        } catch {
          patchResult.undo(); // // server failed → revert the cache to what it was before
        }
      },
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostsByUserIdQuery,
  useAddNewPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useAddReactionMutation,
} = extendedApiSlice;
//return query result obj it doesn't issue the query

export const selectPostsResult = extendedApiSlice.endpoints.getPosts.select();
//create memorize selector

export const selectPostsData = createSelector(
  selectPostsResult,
  (postsResult) => postsResult.data, //date contains normalized obj
);
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors(
  (state) => selectPostsData(state) ?? initialState, //if null return the right
);

// The Idea of createAsyncThunk
// createAsyncThunk is a Redux Toolkit helper for handling async operations like API calls.

// It creates a "thunk" function that can dispatch multiple actions automatically
// When you call fetchPosts(), it:
// Dispatches "posts/fetchPosts/pending" (loading starts)
// Runs the async code (axios.get)
// Dispatches "posts/fetchPosts/fulfilled" with the data (success)
// Or "posts/fetchPosts/rejected" with error (failure)
// You don't have to manually dispatch these actions — it does it for you
// 2. Why extraReducers Instead of reducers
// extraReducers handles actions from outside the slice, while reducers handles actions defined inside the slice.

// reducers — for actions you create in this slice (like postAdded, reactionAdded)
// extraReducers — for actions from other slices, middleware, or async thunks (like fetchPosts.pending)
// fetchPosts is created with createAsyncThunk outside the slice, so its actions go in extraReducers
// 3. The Idea of the Action Object
// Actions are plain JavaScript objects that tell Redux what happened.

// Structure: { type: "actionName", payload: data, meta: info }
// For async thunks:
// pending: { type: "posts/fetchPosts/pending" } (start loading)
// fulfilled: { type: "posts/fetchPosts/fulfilled", payload: responseData } (success with data)
// rejected: { type: "posts/fetchPosts/rejected", payload: undefined, error: message } (failure)

// The Entity Adapter Idea
// The Problem it solves
// Without an adapter, posts are stored as an array:

// posts: [ {id:1, title:"..."}, {id:2, title:"..."}, ... ]
// To find one post you must loop the whole array — O(n). For updates/deletes it's even messier.

// How the Adapter stores data instead

// const postsAdapter = createEntityAdapter({ ... });
// It automatically restructures state into a normalized shape:

// {
//   ids: [1, 2, 3],               // ordered array of IDs
//   entities: {                   // lookup table by ID — O(1) access
//     1: { id: 1, title: "..." },
//     2: { id: 2, title: "..." },
//   },
//   status: "idle",               // your extra fields still work
//   error: null
// }
// This is why in postsSlice.js:65 you access state.entities[postId] directly — no looping needed.

// getInitialState

// const initialState = postsAdapter.getInitialState({
//   status: "idle",
//   error: null,
// });
// Creates { ids: [], entities: {}, status: "idle", error: null } — the adapter's structure plus your custom fields merged in.

// The sortComparer

// const postsAdapter = createEntityAdapter({
//   sortComparer: (a, b) => b.date.localeCompare(a.date),
// });
// Keeps the ids array automatically sorted (newest first here) whenever posts are added or updated. You never manually sort again.

// Built-in CRUD operations
// These replace manual array/object manipulation inside reducers:

// Method	Used at line	What it does
// upsertMany(state, posts)	:92	Add many posts, update if ID already exists
// addOne(state, post)	:110	Add a single new post
// updateOne(state, post)	:121	Update fields of an existing post by ID
// removeOne(state, id)	:132	Delete a post by ID
// Without the adapter, updateOne for example would be:

// // manual — ugly
// const index = state.posts.findIndex(p => p.id === action.payload.id);
// state.posts[index] = { ...state.posts[index], ...action.payload };
// With the adapter — just one line: postsAdapter.updateOne(state, action.payload)

// Built-in Selectors

// export const {
//   selectAll: selectAllPosts,    // → returns array of all posts (from ids + entities)
//   selectById: selectPostById,   // → returns one post by ID
//   selectIds: selectPostIds,     // → returns just the ids array
// } = postsAdapter.getSelectors((state) => state.posts);
// getSelectors needs to know where in the root state your slice lives — that's the (state) => state.posts part. It then generates the three selectors pre-wired to that location.

// Summary — why it's useful
// Without Adapter	With Adapter
// Manual array loops	O(1) lookup by ID
// Write your own CRUD logic	Free CRUD methods
// Manual sorting	Auto-sorted via sortComparer
// Write your own selectors	Free selectAll, selectById, selectIds
// Easy to introduce bugs	Consistent, tested behavior

// providesTags: (result, error, arg) => [
//         { type: "Post", id: "LIST" }, // <-- covers the whole list
//         ...result.ids.map((id) => ({ type: "Post", id })),
//       ],

// so this takes the result and converts it to alist of ids with post type to making the refetch when update and delete easier
// Show more
// Yes, exactly right.

// The array this returns has two kinds of tags:

// { type: "Post", id: "LIST" } — one tag for the whole list (used when you add a new post, since the new post has no id yet to target)

// { type: "Post", id: 1 }, { type: "Post", id: 2 } ... — one tag pe

//Why All These Selectors?
// The core problem
// RTK Query stores data in its own internal cache, not in a regular Redux slice. So you can't just do state.posts — you need to dig into RTK Query's cache to get the data.

// Step by Step
// Step 1 — selectPostsResult

// export const selectPostsResult = extendedApiSlice.endpoints.getPosts.select();
// This creates a selector that gets the raw RTK Query cache object for the getPosts endpoint. It looks like:

// { data: {...}, status: "fulfilled", error: null }
// You need this as a stepping stone to get to the actual data.

// Step 2 — selectPostsData

// export const selectPostsData = createSelector(
//   selectPostsResult,
//   (postsResult) => postsResult.data,
// );
// Drills into that cache object and pulls out just the data part — which is the normalized object { ids: [...], entities: {...} }.

// createSelector makes it memoized — it won't recalculate unless the data actually changes (performance benefit).

// Step 3 — postsAdapter.getSelectors(...)

// export const { selectAll, selectById, selectIds } =
//   postsAdapter.getSelectors(
//     (state) => selectPostsData(state) ?? initialState
//   );
// postsAdapter already has built-in selectors for normalized data. You're just pointing them at the right place in the state.

// The ?? initialState is a safety net — if the data hasn't loaded yet, use the empty initial state instead of crashing.

// Why Not Just providesTags: ["Todos"]?

// // Simple approach (Todos app)
// providesTags: ["Todos"]

// // Complex approach (Posts app)
// providesTags: (result, error, arg) => [
//   { type: "Post", id: "LIST" },
//   ...result.ids.map((id) => ({ type: "Post", id })),
// ]
// Simple ["Todos"]	Per-ID tags
// Update post #2	Refetches all posts	Refetches only post #2
// Delete post #5	Refetches all posts	Refetches only post #5
// Add new post	Refetches all ✅	Refetches all ✅
// The simple tag is fine for small apps. For a blog with many posts, refetching everything on every change is wasteful — per-ID tags let RTK Query be surgical about what it refetches.

// Yes, exactly right.

// The convention is:

// id: "LIST" → invalidate/refetch the whole list (used for add, because the new post has no real id yet)
// id: someRealId → invalidate/refetch one specific post (used for update/delete, surgical refetch)
// So the pattern across your mutations would look like:

// // Adding a post — refetch the whole list (new post has no id to target)
// invalidatesTags: [{ type: "Post", id: "LIST" }]

// // Updating a post — only refetch that one post
// invalidatesTags: (result, error, arg) => [{ type: "Post", id: arg.id }]

// // Deleting a post — only refetch that one post
// invalidatesTags: (result, error, arg) => [{ type: "Post", id: arg.id }]
// "LIST" is not a special RTK Query keyword — it's just a string convention the community uses. You could write id: "ALL" or id: "FULL_LIST" and it would work the same, as long as providesTags and invalidatesTags use the same string.

// Queries return a single object with many properties:

// const { data, isLoading, isError } = useGetPostsQuery()
// //     ^ destructure object {}
// Mutations return a tuple (array of 2 things):

// const [deletePost, { isLoading }] = useDeletePostMutation()
//     ^ [triggerFn, statusObject]
