import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const RequireAuth = ({ children }) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Faça login para continuar.");
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;
  return children;
};

export default RequireAuth;
