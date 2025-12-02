import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import supabase from "@/helper/supabaseClient";
import bgImage from "@/assets/img/logoprincipal.png";

const Cadastro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cpf: "",
    cep: "",
    unidade: "",
    nasc: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validação simples
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("E-mail é obrigatório.");
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    if (!emailOk) {
      toast.error("E-mail inválido.");
      return;
    }
    if (!formData.password) {
      toast.error("Senha é obrigatória.");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (!formData.confirmPassword) {
      toast.error("Confirme sua senha.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    try {
      // 1️⃣ Criar usuário no Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: 'client',
          },
          emailRedirectTo: "http://localhost:5173/login"
        }
      });

      if (signUpError) {
        toast.error(signUpError.message);
        return;
      }

      const userId = signUpData.user?.id;
      if (!userId) {
        toast.error("Erro ao obter ID do usuário.");
        return;
      }

      // Inserir dados na tabela usuarios
      const { error: insertError } = await supabase.from("usuario").insert({
        auth_user_id: userId,
        nome: formData.name,
        email: formData.email,
        cpf: formData.cpf,
        cep: formData.cep,
        unidade: formData.unidade,
        nasc: formData.nasc,
      });

      if (insertError) {
        console.log(insertError);
        toast.error("Erro ao salvar dados no banco.");
        return;
      }

      toast.success("Cadastro realizado! Verifique seu e-mail.");
      navigate("/login");

    } catch (err) {
      console.log(err);
      toast.error("Erro inesperado ao cadastrar");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#ffffff8c] overflow-hidden w-full h-full flex items-center justify-center"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'top' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Cadastrar</CardTitle>
          <CardDescription className="text-center">
            Crie sua conta para fazer pedidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2 grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2 grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="unidade">Unidade</Label>
                <Input
                  id="unidade"
                  placeholder="Loja/Filial"
                  value={formData.unidade}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="nasc">Data de nascimento</Label>
                <Input
                  id="nasc"
                  type="date"
                  value={formData.nasc}
                  onChange={handleChange}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Cadastrar
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cadastro;
