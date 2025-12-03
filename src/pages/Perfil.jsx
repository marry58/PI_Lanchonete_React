import { useEffect, useState } from "react";
import supabase from "@/helper/supabaseClient";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Clock, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Perfil = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

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

      // Buscar pedidos do usuário
      const { data: pedidosData, error: pedidosError } = await supabase
        .from("pedidos")
        .select("*")
        .eq("auth_user_id", userId)
        .order("created_at", { ascending: false });

      if (pedidosError) {
        console.log(pedidosError);
      } else {
        setOrders(pedidosData || []);
      }
    };

    fetchProfile();
  }, []);

  const fetchOrderItems = async (orderId) => {
    setLoadingItems(true);
    const { data, error } = await supabase
      .from("pedido_items")
      .select("id, title, price, qty, metadata")
      .eq("pedido_id", orderId);

    if (error) {
      console.log(error);
      toast.error("Erro ao carregar itens do pedido");
    } else {
      setOrderItems(data || []);
    }
    setLoadingItems(false);
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const translateStatus = (status) => {
    const statusMap = {
      pending: "Pendente",
      preparing: "Preparando",
      ready: "Pronto",
      delivered: "Entregue",
      cancelled: "Cancelado",
    };
    return statusMap[status] || status;
  };

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
                  {orders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum pedido encontrado
                    </p>
                  ) : (
                    orders.map((order) => (
                      <Card
                        key={order.id}
                        className="border cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => handleOrderClick(order)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold flex items-center gap-2">
                                Pedido #{order.id.slice(0, 8)}
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(order.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">
                                R$ {Number(order.total).toFixed(2)}
                              </p>
                              <span className="inline-block mt-1 px-2 py-1 bg-success/10 text-success text-xs rounded">
                                {translateStatus(order.status)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dialog para detalhes do pedido */}
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Detalhes do Pedido #{selectedOrder?.id.slice(0, 8)}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Data: {selectedOrder && formatDate(selectedOrder.created_at)}</p>
                  <p>Status: {selectedOrder && translateStatus(selectedOrder.status)}</p>
                  <p>Endereço: {selectedOrder?.address || "Retirada no balcão"}</p>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Itens do Pedido</h4>
                  {loadingItems ? (
                    <p className="text-muted-foreground">Carregando...</p>
                  ) : (
                    <div className="space-y-2">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {item.metadata?.image && (
                              <img
                                src={item.metadata.image}
                                alt={item.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.title || "Produto"}</p>
                              <p className="text-sm text-muted-foreground">
                                Qtd: {item.qty}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold">
                            R$ {(Number(item.price) * item.qty).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    R$ {selectedOrder && Number(selectedOrder.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </Tabs>
      </main>
    </div>
  );
};

export default Perfil;
