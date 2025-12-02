import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import supabase from "@/helper/supabaseClient";
import bgImage from "@/assets/img/logoprincipal.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

 const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      const user = data?.user;
      const roles = user?.app_metadata?.roles || [];
      const userRole = user?.user_metadata?.role || user?.app_metadata?.role;

      let storedRoles = [];
      if (user?.id) {
        const { data: roleRows, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        if (!roleError && roleRows) {
          storedRoles = roleRows.map((row) => row.role);
        }
      }

      const isMasterAdmin =
        userRole === "master_admin" ||
        roles.includes("master_admin") ||
        storedRoles.includes("master_admin") ||
        user?.app_metadata?.role === "master_admin";

      const isAdmin =
        userRole === "admin" ||
        roles.includes("admin") ||
        storedRoles.includes("admin") ||
        user?.app_metadata?.role === "admin";

      toast.success("Login realizado com sucesso!");
      if (isMasterAdmin) {
        navigate("/admin-master");
      } else if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/inicio");
      }
    } catch (err) {
      toast.error("Erro inesperado ao fazer login.");
    }

    setLoading(false);
  };
  return (
    <div className="fixed inset-0 bg-[#ffffff8c] overflow-hidden w-full h-full flex items-center justify-center"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'top' }}>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{" "}
            <Link to="/cadastro" className="text-primary hover:underline font-medium">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
