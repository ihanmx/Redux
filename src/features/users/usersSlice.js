import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const USERS_URL = "https://jsonplaceholder.typicode.com/users";

const initialState = [];

const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const response = await axios.get(USERS_URL);
  return response.data;
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      return action.payload; //replaces the state automatically
    });
  },
});

// selectAllUsers is a function that gets data from the Redux store
// It takes the entire state object as input
// Returns state.users — the users slice from the store
export const selectAllUsers = (state) => state.users;
export { fetchUsers };
export default usersSlice.reducer;
