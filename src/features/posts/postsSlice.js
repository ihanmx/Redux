import {
  createSlice,
  nanoid,
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import axios from "axios";
import { sub } from "date-fns";

const POSTS_URL = "https://jsonplaceholder.typicode.com/posts";

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
});
const initialState = postsAdapter.getInitialState({
  //  posts: [], added automatically

  status: "idle",
  error: null,
});
// Redux Toolkit helper for handling async operations like API calls.
const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  //createAsyncThunk("posts/fetchPosts" slice name/actionname
  const response = await axios.get(POSTS_URL);
  return response.data;
});

const addNewPost = createAsyncThunk("posts/addNewPost", async (initialPost) => {
  const response = await axios.post(POSTS_URL, initialPost);

  return response.data;
});

const updatePost = createAsyncThunk("posts/updatePost", async (initialPost) => {
  const { id } = initialPost;
  try {
    const response = await axios.put(`${POSTS_URL}/${id}`, initialPost);
    return response.data;
  } catch (err) {
    //return err.message;
    return initialPost; // only for testing Redux!
  }
});

const deletePost = createAsyncThunk("posts/deletePost", async (initialPost) => {
  const { id } = initialPost;
  try {
    const response = await axios.delete(`${POSTS_URL}/${id}`);
    if (response?.status === 200) return initialPost;
    return `${response?.status}: ${response?.statusText}`;
  } catch (err) {
    return err.message;
  }
});

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    //reducer  what happens when the action runs

    reactionAdded(state, action) {
      const { postId, reaction } = action.payload;
      const existingPost = state.entities[postId];
      if (existingPost) {
        existingPost.reactions[reaction]++; //increament the react by 1
      }
    },
  },

  //extraReducers handles actions from outside the slice, while reducers handles actions defined inside the slice.
  extraReducers(builder) {
    builder
      .addCase(fetchPosts.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        let min = 1;
        const loadedPosts = action.payload.map((post) => {
          post.date = sub(new Date(), { minutes: min++ }).toISOString();
          post.reactions = {
            thumbsUp: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0,
          };
          return post;
        });
        postsAdapter.upsertMany(state, loadedPosts);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        //action.type = what happened   |   action.payload = the data that came with it
        action.payload.userId = Number(action.payload.userId);
        action.payload.date = new Date().toISOString();
        action.payload.reactions = {
          thumbsUp: 0,
          wow: 0,
          heart: 0,
          rocket: 0,
          coffee: 0,
        };
        console.log(action.payload);
        postsAdapter.addOne(state, action.payload);
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        if (!action.payload?.id) {
          console.log("update could not complete");
          console.log(action.payload);
          return;
        }

        action.payload.date = new Date().toISOString();

        postsAdapter.updateOne(state, {
          id: action.payload.id,
          changes: action.payload,
        });
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        if (!action.payload?.id) {
          console.log("Delete could not complete");
          console.log(action.payload);
          return;
        }
        const { id } = action.payload;
        action.payload.date = new Date().toISOString();
        //we are inside the reducer so we access state.post directly not inside selector we use posts.posts
        postsAdapter.removeOne(state, id);
      });
  },
});

//get selecttor creates these selectors and we rename them with aliases

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors((state) => state.posts);

export const getPostsStatus = (state) => state.posts.status;
export const getPostsError = (state) => state.posts.error;

export const selectPostByUser = createSelector(
  //we pass selector +stateand prop act as usememo
  [selectAllPosts, (state, userId) => userId],
  (posts, userId) => {
    return posts.filter((post) => post.userId === userId);
  },
);
export const { reactionAdded } = postsSlice.actions;
export { fetchPosts, addNewPost, updatePost, deletePost };

export default postsSlice.reducer;

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
