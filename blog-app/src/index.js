import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { store } from "./app/store";
import { Provider } from "react-redux";
import { extendedApiSlice as postsApiSlice } from "./features/posts/postsSlice";
import { extendedApiSlice as usersApiSlice } from "./features/users/usersSlice";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// It manually triggers the getPosts and getUsers fetches the moment the app loads
store.dispatch(postsApiSlice.endpoints.getPosts.initiate());
store.dispatch(usersApiSlice.endpoints.getUsers.initiate());
// Normally in Redux, you dispatch actions inside React components using the useDispatch hook. But here, the dispatch happens before the app even renders — outside of any component.
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<App />}></Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
