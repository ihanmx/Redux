import { useSelector } from "react-redux";
import { selectAllPosts } from "./postsSlice";
import PostAuther from "./PostAuther";
import TimeAgo from "./TimeAgo";
import ReactionButtons from "./ReactionButtons";
const PostsList = () => {
  const posts = useSelector(selectAllPosts); //in case if the shape of the state changes, we only need to change the selector function and not all the components that use it.
  const orderedPosts = posts
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date)); //slice makes copy
  const renderedPosts = orderedPosts.map((post) => (
    <article key={post.id}>
      <h3>{post.title}</h3>
      <p>{post.content?.substring(0, 100) || ""}...</p>
      <p className="postCredit">
        <PostAuther userId={post.userId} />
        <TimeAgo timestamp={post.date} />
      </p>
      <ReactionButtons post={post} />
    </article>
  ));
  return (
    <div>
      <h2>Posts</h2>
      {renderedPosts}
    </div>
  );
};

export default PostsList;
