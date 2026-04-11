import "./App.css";

import PostsList from "./features/posts/PostsList.js";
import AddPostForm from "./features/posts/AddPostForm.js";

function App() {
  return (
    <div className="App">
      <AddPostForm />
      <PostsList />
    </div>
  );
}

export default App;
