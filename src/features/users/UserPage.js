import { selectUserById } from "./usersSlice";
import { useSelector } from "react-redux";
import { selectAllPosts } from "../posts/postsSlice";
import { Link, useParams } from "react-router-dom";

const UserPage = () => {
  const { userId } = useParams();
  const user = useSelector((state) => selectUserById(state, Number(userId)));

  //use call back when  derive or transform data from the state or when selector has two props like(state,userId)
  const postsForUser = useSelector((state) => {
    const allPosts = selectAllPosts(state);
    return allPosts.filter((post) => post.userId === Number(userId));
  });
  const postTitles = postsForUser.map((post) => (
    <li key={post.id}>
      <Link to={`/post/${post.id}`}>{post.title}</Link>
    </li>
  ));

  return (
    <section>
      <h2>{user?.name}</h2>

      <ol>{postTitles}</ol>
    </section>
  );
};

export default UserPage;
