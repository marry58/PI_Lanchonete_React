import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const RequireAdmin = ({ children }) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast.error("Faça login para continuar.");
      navigate("/login");
      return;
    }
    const roles = user?.app_metadata?.roles || [];
    const isAdmin = roles.includes("admin") || user?.user_metadata?.role === "admin" || user?.app_metadata?.role === "admin";
    if (!isAdmin) {
      toast.error("Acesso restrito ao administrador.");
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) return null;
  const roles = user?.app_metadata?.roles || [];
  const isAdmin = roles.includes("admin") || user?.user_metadata?.role === "admin" || user?.app_metadata?.role === "admin";
  if (!isAdmin) return null;
  return children;
};

export default RequireAdmin;
