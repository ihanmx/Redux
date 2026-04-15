import { useSelector } from "react-redux";
import { selectPostById } from "./postsSlice";
import TimeAgo from "./TimeAgo";
import PostAuther from "./PostAuther";
import ReactionButtons from "./ReactionButtons";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
const SinglePostPage = () => {
  //// ✅ correct — you wrap it so you can pass both arguments
  // useSelector((state) => selectPostById(state, postId))
  //           ^ useSelector provides state, you provide postId

  const { postId } = useParams();
  const post = useSelector((state) => selectPostById(state, postId));
  if (!post) {
    return <section>Post not found !</section>;
  }
  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
      <p className="postCredit">
        <Link to={`/post/edit/${post.id}`}>Edit Post</Link>
        <PostAuther userId={post.userId} />
        <TimeAgo timestamp={post.date} />
      </p>
      <ReactionButtons post={post} />
    </article>
  );
};

export default SinglePostPage;
