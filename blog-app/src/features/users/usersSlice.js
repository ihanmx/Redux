import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";

import { apiSlice } from "../api/apiSlice";

const usersAdaptor = createEntityAdapter({});

const initialState = usersAdaptor.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/users",
      transformResponse: (responseData) => {
        return usersAdaptor.setAll(initialState, responseData);
      },
      providesTags: (result, error, arg) => [
        { type: "User", id: "List" },
        ...result.ids.map((id) => ({ type: "User", id })),
      ],
    }),
    getUserById: builder.query({
      query: (userId) => `/users/${userId}`,
      transformResponse: (responseDate) => {
        //single user no need for adaptor
        return responseDate;
      },
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
  }),
});

// selectAllUsers is a function that gets data from the Redux store
// It takes the entire state object as input
// Returns state.users — the users slice from the store

// RTK Query auto-generates these hooks from the endpoint definitions.
// useGetUsersQuery fetches all users, useGetUserByIdQuery fetches one user by id.
// We export them so components can call the API directly without manual dispatch.
export const { useGetUserByIdQuery, useGetUsersQuery } = extendedApiSlice;

// Gives us a selector that reads the cached getUsers query result from the Redux store.
// We need this as an input to createSelector so we can derive data from the cache.
export const selectUsersResult = extendedApiSlice.endpoints.getUsers.select();

// Extracts only the .data field (the normalized entity state) from the query result object.
// createSelector memoizes this so it only recomputes when selectUsersResult changes.
export const selectUsersData = createSelector(
  selectUsersResult,
  (userResult) => userResult.data,
);

// Generates selectAllUsers and selectUserById from the adapter.
// We pass selectUsersData(state) as the slice, falling back to initialState
// if the data hasn't loaded yet (to avoid undefined errors).
export const { selectAll: selectAllUsers, selectById: selectUserById } =
  usersAdaptor.getSelectors((state) => selectUsersData(state) ?? initialState);
