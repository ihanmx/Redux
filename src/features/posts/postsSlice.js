import { createSlice, nanoid } from "@reduxjs/toolkit";
import { sub } from "date-fns";
import reducer from "../users/usersSlice";

const initialState = [
  {
    id: "1",
    title: "Learning Redux Toolkit",
    content: "I've heard good things.",
    date: sub(new Date(), { minutes: 10 }).toISOString(),
    reactions: { thumbsUp: 0, wow: 0, heart: 0, rocket: 0, coffee: 0 },
  },
  {
    id: "2",
    title: "Slices...",
    content: "The more I say slice, the more I want pizza.",
    date: sub(new Date(), { minutes: 5 }).toISOString(),
    reactions: { thumbsUp: 0, wow: 0, heart: 0, rocket: 0, coffee: 0 },
  },
];

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    //reducer  what happens when the action runs
    postAdded: {
      reducer(state, action) {
        state.push(action.payload); //we are allowed to mutate state in the createSlice only!
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
      const existingPost = state.find((post) => post.id === postId);
      if (existingPost) {
        existingPost.reactions[reaction]++; //increament the react by 1
      }
    },
  },
});

export const selectAllPosts = (state) => state.posts;
export const { postAdded, reactionAdded } = postsSlice.actions;
export default postsSlice.reducer;
