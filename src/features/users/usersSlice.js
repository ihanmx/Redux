import { createSlice } from "@reduxjs/toolkit";

const initialState = [
  { id: "1", name: "hanan" },
  { id: "2", name: "hanan2" },
  { id: "3", name: "hanan3" },
];

const usersSlice = createSlice({ name: "users", initialState, reducers: {} });

// selectAllUsers is a function that gets data from the Redux store
// It takes the entire state object as input
// Returns state.users — the users slice from the store
export const selectAllUsers = (state) => state.users;

export default usersSlice.reducer;
