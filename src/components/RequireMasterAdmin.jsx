import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const RequireMasterAdmin = ({ children }) => {
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
    const isMasterAdmin = roles.includes("master_admin") || user?.user_metadata?.role === "master_admin" || user?.app_metadata?.role === "master_admin";
    if (!isMasterAdmin) {
      toast.error("Acesso restrito ao administrador master.");
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) return null;
  const roles = user?.app_metadata?.roles || [];
  const isMasterAdmin = roles.includes("master_admin") || user?.user_metadata?.role === "master_admin" || user?.app_metadata?.role === "master_admin";
  if (!isMasterAdmin) return null;
  return children;
};

export default RequireMasterAdmin;
