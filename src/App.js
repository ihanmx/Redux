import "./App.css";

import PostsList from "./features/posts/PostsList.js";
import AddPostForm from "./features/posts/AddPostForm.js";
import Layout from "./components/Layout.js";
import SinglePostPage from "./features/posts/SinglePostPage.js";
import EditPostForm from "./features/posts/EditPostForm.js";
import UserPage from "./features/users/UserPage.js";
import UsersList from "./features/users/UsersList.js";
import { Route, Routes, Navigate } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<PostsList />}></Route>
        <Route path="post">
          <Route index element={<AddPostForm />}></Route>
          <Route path=":postId" element={<SinglePostPage />}></Route>
          <Route path="edit/:postId" element={<EditPostForm />} />
        </Route>
        <Route path="user">
          <Route index element={<UsersList />}></Route>
          <Route path=":userId" element={<UserPage />}></Route>
        </Route>

        {/* catch all-can  replaced by 404 page */}
        <Route path="*s" element={<Navigate to="/" replace />}></Route>
      </Route>
    </Routes>
  );
}

export default App;
