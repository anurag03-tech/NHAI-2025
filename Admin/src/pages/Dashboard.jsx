import { useAuth } from "../contexts/AuthContext";
import OperatorHome from "./Operator/Home";
import NhaiAdminHome from "./NhaiAdmin/Home";


export default function Dashboard() {
  const { user } = useAuth();

  if (user.role === "Operator") {
    return <OperatorHome />;
  } else if (user.role === "Admin") {
    return <NhaiAdminHome />;
  }

  return <Navigate to="/login" replace />;
}
