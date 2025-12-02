import { useEffect, useState } from "react";
import supabase from "@/helper/supabaseClient"; // ajuste o caminho conforme seu projeto
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Clock } from "lucide-react";
import { toast } from "sonner";

const Perfil = () => {
  const orders = [
    {
      id: 1,
      date: "25/11/2025",
      items: "2 itens",
      total: 51.70,
      status: "Entregue",
    },
    {
      id: 2,
      date: "20/11/2025",
      items: "3 itens",
      total: 78.90,
      status: "Entregue",
    },
  ];

  const [profile, setProfile] = useState({
  nome: "",
  email: "",
  telefone: "",
});

  useEffect(() => {
  const fetchProfile = async () => {
    const { data: auth } = await supabase.auth.getUser();

    if (!auth?.user) {
      toast.error("Usuário não autenticado");
      return;
    }

    const userId = auth.user.id;

    // Buscar dados na tabela usuario
    const { data, error } = await supabase
      .from("usuario")
      .select("nome, email, telefone")
      .eq("auth_user_id", userId)
      .single();

    if (error) {
      console.log(error);
      toast.error("Erro ao carregar perfil");
      return;
    }

    setProfile({
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
    });
  };

  fetchProfile();
}, []);

const handleChange = (e) => {
  setProfile((prev) => ({
    ...prev,
    [e.target.id]: e.target.value,
  }));
};

const handleSave = async () => {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user.id;

  const { error } = await supabase
    .from("usuario")
    .update({
      nome: profile.nome,
      email: profile.email,
      telefone: profile.telefone,
    })
    .eq("auth_user_id", userId);

  if (error) {
    console.log(error);
    toast.error("Erro ao salvar");
    return;
  }

  toast.success("Informações atualizadas com sucesso!");
};

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Ola!<br/>{profile.nome}</h1>

        <Tabs defaultValue="dados" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="dados">
              <User className="h-4 w-4 mr-2" />
              Dados
            </TabsTrigger>
            <TabsTrigger value="pedidos">
              <Clock className="h-4 w-4 mr-2" />
              Pedidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input id="nome" value={profile.nome} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profile.email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" type="tel" value={profile.telefone} onChange={handleChange} />
                </div>
                <Button onClick={handleSave}>Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pedidos">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">Pedido #{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.date} • {order.items}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">
                              R$ {order.total.toFixed(2)}
                            </p>
                            <span className="inline-block mt-1 px-2 py-1 bg-success/10 text-success text-xs rounded">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Perfil;
