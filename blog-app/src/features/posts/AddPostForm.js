import { useState } from "react";

import { useSelector } from "react-redux";

import { selectAllUsers, useGetUsersQuery } from "../users/usersSlice";
import { useAddNewPostMutation } from "./postsSlice";

const AddPostForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState("");

  const [addNewPost, { isLoading }] = useAddNewPostMutation(); //destructure

  useGetUsersQuery();
  const users = useSelector(selectAllUsers);

  const onTitleChanged = (e) => {
    return setTitle(e.target.value);
  };
  const onContentChanged = (e) => {
    return setContent(e.target.value);
  };
  const onAuthorChanged = (e) => {
    return setUserId(e.target.value);
  };

  const onSavePostClicked = async () => {
    if (canSave) {
      try {
        await addNewPost({ title, body: content, userId }).unwrap();

        setTitle("");
        setContent("");
        setUserId("");
      } catch (err) {
        console.log(err);
      }
    }
  };

  const usersOptions = users.map((user) => (
    <option key={user.id} value={user.id}>
      {user.name}
    </option>
  ));

  const canSave = [title, content, userId].every(Boolean) && !isLoading;
  return (
    <section>
      <h2>Add a New Post</h2>
      <form>
        <label htmlFor="postTitle">Post Title:</label>
        <input
          type="text"
          id="postTitle"
          name="postTitle"
          value={title}
          onChange={onTitleChanged}
        />
        <label htmlFor="postAuthor">Author:</label>
        <select id="postAuthor" value={userId} onChange={onAuthorChanged}>
          <option value=""></option>
          {usersOptions}
        </select>
        <label htmlFor="postContent">Content:</label>
        <textarea
          id="postContent"
          name="postContent"
          value={content}
          onChange={onContentChanged}
        />
        <button type="button" onClick={onSavePostClicked} disabled={!canSave}>
          Save Post
        </button>
      </form>
    </section>
  );
};

export default AddPostForm;
