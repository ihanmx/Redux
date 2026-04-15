import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { useGetPostsByUserIdQuery } from "../posts/postsSlice";
import { selectUserById } from "../users/usersSlice";

const UserPage = () => {
  const { userId } = useParams();
  const {
    data: postsForUser,
    isError,
    isLoading,
    isSuccess,
    error,
  } = useGetPostsByUserIdQuery(userId);
  const user = useSelector((state) => selectUserById(state, Number(userId))); //no need for selector it is single data
  // Build useSelector + dedicated selectors when multiple components share the same cache → avoids re-deriving the same data in each component
  // Use data directly from the hook when only one component reads this specific cache entry
  let content;
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (isSuccess) {
    const { ids, entities } = postsForUser; //its anormalize obj
    content = ids.map((id) => (
      <li key={id}>
        <Link to={`/post/${id}`}>{entities[id].title}</Link>
      </li>
    ));
  } else if (isError) {
    content = <p>{error}</p>;
  }

  return (
    <section>
      <h2>{user?.name}</h2>

      <ol>{content}</ol>
    </section>
  );
};

export default UserPage;
