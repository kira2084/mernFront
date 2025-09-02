import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
const PublicRoute = ({ children }) => {
  const { state, loading } = useAuth();
  const navigate = useNavigate();
  //if (loading) return <div>Loading...</div>;
  try {
    if (state.isAuthenticated) navigate("/");
  } catch (error) {
    alert(error);
  }

  return children;
};

export default PublicRoute;
