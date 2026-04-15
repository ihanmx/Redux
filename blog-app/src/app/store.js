import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../features/api/apiSlice";
import usersReducer from "../features/users/usersSlice";
import { getDefaultOptions } from "date-fns";

export const store = configureStore({
  reducer: { [apiSlice.reducerPath]: apiSlice.reducer, users: usersReducer },
  //important to use RTK
  middleware: (getDefaultMiddleWare) =>
    getDefaultMiddleWare().concat(apiSlice.middleware),
});

//[apiSlice.reducerPath] ==api we used this approach for dynamic naming
