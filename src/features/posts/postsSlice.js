import { createSlice, nanoid, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { sub } from "date-fns";

const POSTS_URL = "https://jsonplaceholder.typicode.com/posts";
const initialState = { posts: [], status: "idle", error: null };
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
const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    //reducer  what happens when the action runs
    postAdded: {
      reducer(state, action) {
        state.posts.push(action.payload); //we are allowed to mutate state in the createSlice only!
      },
      prepare(title, content, userId) {
        //prepare prepares the action payload
        return {
          payload: {
            id: nanoid(),
            title,
            content,
            date: new Date().toISOString(),
            userId,
            reactions: { thumbsUp: 0, wow: 0, heart: 0, rocket: 0, coffee: 0 },
          },
        };
      },
    },
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload;
      const existingPost = state.posts.find((post) => post.id === postId);
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
        state.posts = loadedPosts;
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
        state.posts.push(action.payload);
      });
  },
});

export const selectAllPosts = (state) => state.posts.posts; //first posts is name of reducer the other is the inner obj
export const getPostsStatus = (state) => state.posts.status;
export const getPostsError = (state) => state.posts.error;
export const { postAdded, reactionAdded } = postsSlice.actions;
export { fetchPosts, addNewPost };
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
