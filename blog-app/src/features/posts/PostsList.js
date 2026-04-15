import { useSelector, useDispatch } from "react-redux";
import { selectAllPosts, fetchPosts } from "./postsSlice";
import PostsExcerpt from "./PostsExcerpt";
import { useEffect } from "react";
import { useGetPostsQuery } from "./postsSlice";

const PostsList = () => {
  const { isLoading, isSuccess, isError, error } = useGetPostsQuery();
  const dispatch = useDispatch();
  const posts = useSelector(selectAllPosts); //in case if the shape of the state changes, we only need to change the selector function and not all the components that use it.

  // useEffect(() => {
  //   if (postsStatus === "idle") {
  //     dispatch(fetchPosts());
  //   }
  // }, [postsStatus, dispatch]);

  let content;

  if (isLoading) {
    content = <p>Loading</p>;
  } else if (isSuccess) {
    const orderedPosts = posts
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));

    content = orderedPosts.map((post) => (
      <PostsExcerpt key={post.id} post={post} />
    ));
  } else if (isError) {
    content = <p>{error?.message}</p>;
  }

  return <div>{content}</div>;
};

export default PostsList;
