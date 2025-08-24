import { useAuth } from "../contexts/AuthContext";
import ModeratorHome from "./Moderator/Home";
import NhaiAdminHome from "./NhaiAdmin/Home";

export default function Dashboard() {
  const { user } = useAuth();

  if (user.role === "Moderator") {
    return <ModeratorHome />;
  } else if (user.role === "Admin") {
    return <NhaiAdminHome />;
  }

  return <Navigate to="/login" replace />;
}
