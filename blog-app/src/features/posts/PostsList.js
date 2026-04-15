import { useSelector } from "react-redux";
import { selectAllPosts } from "./postsSlice";
import PostsExcerpt from "./PostsExcerpt";
import { useGetPostsQuery } from "./postsSlice";

const PostsList = () => {
  // Triggers the fetch + gives loading states
  const { isLoading, isSuccess, isError, error } = useGetPostsQuery();

  // Reads the result as a clean, sorted array via the memoized selector
  const posts = useSelector(selectAllPosts);
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
