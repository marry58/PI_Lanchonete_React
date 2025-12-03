import { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Shield,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  MapPin,
  Clock,
  Users,
  Package,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import supabase from "@/helper/supabaseClient";

const AdminMaster = () => {
  // Estados para Lanchonetes
  const [lanchonetes, setLanchonetes] = useState([]);
  const [isLoadingLanchonetes, setIsLoadingLanchonetes] = useState(false);

  const [isAddLanchoneteOpen, setIsAddLanchoneteOpen] = useState(false);
  const [isEditLanchoneteOpen, setIsEditLanchoneteOpen] = useState(false);
  const [editingLanchonete, setEditingLanchonete] = useState(null);
  const [lanchoneteForm, setLanchoneteForm] = useState({
    nome_lanchonete: "",
    endereco: "",
    telefone: "",
    horario: "",
    status: true
  });

  // Estados para Admins
  const [admins, setAdmins] = useState([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({
    nome: "",
    email: "",
    lanchoneteId: "",
    senha: ""
  });

  // Estados para Estatísticas
  const [stats, setStats] = useState({
    totalLanchonetes: 2,
    totalAdmins: 2,
    totalUsuarios: 150,
    totalPedidos: 450,
    receitaTotal: 15750.00,
    pedidosHoje: 28
  });

  const getLanchoneteName = (lanchoneteId) => {
    if (!lanchoneteId) return "Sem unidade";
    const unidade = lanchonetes.find((l) => l.id === lanchoneteId);
    return unidade?.nome_lanchonete || "Sem unidade";
  };

  const formatAdminDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Funções para Lanchonetes
  const fetchLanchonetes = useCallback(async () => {
    setIsLoadingLanchonetes(true);
    const { data, error } = await supabase
      .from("lanchonete")
      .select("id, nome_lanchonete, endereco, telefone, horario, status")
      .order("nome_lanchonete", { ascending: true });

    if (error) {
      console.error(error);
      toast.error("Erro ao carregar lanchonetes.");
      setIsLoadingLanchonetes(false);
      return;
    }

    const normalized = (data || []).map((item) => ({
      id: item.id,
      nome_lanchonete: item.nome_lanchonete,
      endereco: item.endereco ?? "",
      telefone: item.telefone ?? "",
      horario: item.horario ?? "",
      status: item.status ?? true,
    }));

    setLanchonetes(normalized);
    setStats((prev) => ({ ...prev, totalLanchonetes: normalized.length }));
    setIsLoadingLanchonetes(false);
  }, []);

  const fetchAdmins = useCallback(async () => {
    setIsLoadingAdmins(true);
    try {
      const adminRoles = ["admin"];
      const { data, error } = await supabase
        .from("usuario")
        .select("id, nome, email, role, metadata, created_at, auth_user_id, lanchonete_id")
        .in("role", adminRoles)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const normalized = (data || []).map((item) => ({
        id: item.id,
        auth_user_id: item.auth_user_id,
        nome: item.nome ?? "Sem nome",
        email: item.email ?? "",
        lanchoneteId: item.lanchonete_id ?? item.metadata?.lanchonete_id ?? null,
        status: item.metadata?.active ?? true,
        dataAdicao: item.created_at,
        metadata: item.metadata || {},
        role: item.role || "admin",
      }));

      setAdmins(normalized);
      setStats((prev) => ({ ...prev, totalAdmins: normalized.length }));
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar admins.");
    } finally {
      setIsLoadingAdmins(false);
    }
  }, []);

  useEffect(() => {
    fetchLanchonetes();
    fetchAdmins();
  }, [fetchLanchonetes, fetchAdmins]);

  const handleAddLanchonete = async (e) => {
    e.preventDefault();
    if (!lanchoneteForm.nome_lanchonete || !lanchoneteForm.endereco) {
      toast.error("Preencha nome e endereço da lanchonete!");
      return;
    }

    try {
      const { error } = await supabase.from("lanchonete").insert({
        nome_lanchonete: lanchoneteForm.nome_lanchonete,
        endereco: lanchoneteForm.endereco,
        telefone: lanchoneteForm.telefone,
        horario: lanchoneteForm.horario,
        status: lanchoneteForm.status,
      });

      if (error) {
        throw error;
      }

      toast.success("Lanchonete adicionada com sucesso!");
      setIsAddLanchoneteOpen(false);
      setLanchoneteForm({ nome_lanchonete: "", endereco: "", telefone: "", horario: "", status: true });
      fetchLanchonetes();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar lanchonete.");
    }
  };

  const openEditLanchonete = (lanchonete) => {
    setEditingLanchonete(lanchonete);
    setLanchoneteForm({
      nome_lanchonete: lanchonete.nome_lanchonete,
      endereco: lanchonete.endereco,
      telefone: lanchonete.telefone,
      horario: lanchonete.horario,
      status: lanchonete.status
    });
    setIsEditLanchoneteOpen(true);
  };

  const handleEditLanchonete = async () => {
    if (!lanchoneteForm.nome_lanchonete || !lanchoneteForm.endereco || !editingLanchonete) {
      toast.error("Preencha nome e endereço da lanchonete!");
      return;
    }

    try {
      const { error } = await supabase
        .from("lanchonete")
        .update({
          nome_lanchonete: lanchoneteForm.nome_lanchonete,
          endereco: lanchoneteForm.endereco,
          telefone: lanchoneteForm.telefone,
          horario: lanchoneteForm.horario,
          status: lanchoneteForm.status,
        })
        .eq("id", editingLanchonete.id);

      if (error) {
        throw error;
      }

      toast.success("Lanchonete atualizada com sucesso!");
      setIsEditLanchoneteOpen(false);
      setEditingLanchonete(null);
      setLanchoneteForm({ nome_lanchonete: "", endereco: "", telefone: "", horario: "", status: true });
      fetchLanchonetes();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar lanchonete.");
    }
  };

  const deleteLanchonete = async (id) => {
    try {
      const { error } = await supabase.from("lanchonete").delete().eq("id", id);
      if (error) {
        throw error;
      }
      toast.success("Lanchonete removida!");
      fetchLanchonetes();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao remover lanchonete.");
    }
  };

  const toggleLanchoneteStatus = async (id) => {
    const target = lanchonetes.find((l) => l.id === id);
    if (!target) return;

    try {
      const { error } = await supabase
        .from("lanchonete")
        .update({ status: !target.status })
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Status atualizado!");
      fetchLanchonetes();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar status.");
    }
  };

  // Funções para Admins
  const handleAddAdmin = async (e) => {
    e.preventDefault();

    if (!adminForm.nome || !adminForm.email || !adminForm.senha || !adminForm.lanchoneteId) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      setIsSavingAdmin(true);


      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: adminForm.email,
        password: adminForm.senha,
        options: {
          data: {
            full_name: adminForm.nome,
            role: "admin",
            lanchonete_id: adminForm.lanchoneteId,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      const authUserId = signUpData.user?.id;

      if (!authUserId) {
        throw new Error("Não foi possível obter o ID do usuário criado.");
      }

      const selectedLanchonete = lanchonetes.find((l) => l.id === adminForm.lanchoneteId);
      const unidadeNome = selectedLanchonete?.nome_lanchonete || "";

      const { error: usuarioError } = await supabase.from("usuario").insert({
        auth_user_id: authUserId,
        nome: adminForm.nome,
        email: adminForm.email,
        role: "admin",
        unidade: unidadeNome,
        lanchonete_id: adminForm.lanchoneteId,
        metadata: {
          active: true,
          lanchonete_id: adminForm.lanchoneteId,
        },
      });

      if (usuarioError) {
        throw usuarioError;
      }

      toast.success("Administrador criado com sucesso!");
      setIsAddAdminOpen(false);
      setAdminForm({ nome: "", email: "", lanchoneteId: "", senha: "" });
      fetchAdmins();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Erro ao criar administrador.");
    } finally {
      setIsSavingAdmin(false);
    }
  };

  const toggleAdminStatus = async (admin) => {
    const nextStatus = !admin.status;
    try {
      const newMetadata = {
        ...(admin.metadata || {}),
        active: nextStatus,
      };

      const { error } = await supabase
        .from("usuario")
        .update({ metadata: newMetadata })
        .eq("id", admin.id);

      if (error) {
        throw error;
      }

      toast.success("Status do admin atualizado!");
      fetchAdmins();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar status do admin.");
    }
  };

  const deleteAdmin = async (admin) => {
    try {
      const newMetadata = {
        ...(admin.metadata || {}),
        lanchonete_id: null,
        active: false,
      };

      const { error } = await supabase
        .from("usuario")
        .update({ role: "client", metadata: newMetadata })
        .eq("id", admin.id);

      if (error) {
        throw error;
      }

      toast.success("Admin removido!");
      fetchAdmins();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao remover admin.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Painel Master</h1>
            <p className="text-muted-foreground">Gerenciamento geral do sistema</p>
          </div>
          <Badge variant="outline" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Master Admin
          </Badge>
        </div>

        <Tabs defaultValue="lanchonetes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lanchonetes" className="gap-2">
              <Store className="h-4 w-4" />
              Lanchonetes
            </TabsTrigger>
            <TabsTrigger value="admins" className="gap-2">
              <Shield className="h-4 w-4" />
              Admins
            </TabsTrigger>
            <TabsTrigger value="estatisticas" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Estatísticas
            </TabsTrigger>
          </TabsList>

          {/* Tab Lanchonetes */}
          <TabsContent value="lanchonetes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gerenciar Lanchonetes</CardTitle>
                    <CardDescription>Cadastre e gerencie as lanchonetes do sistema</CardDescription>
                  </div>
                  <Dialog open={isAddLanchoneteOpen} onOpenChange={setIsAddLanchoneteOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nova Lanchonete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Lanchonete</DialogTitle>
                        <DialogDescription>Cadastre uma nova lanchonete no sistema</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddLanchonete} className="space-y-4">
                        <div>
                          <Label htmlFor="nome_lanchonete">Nome *</Label>
                          <Input
                            id="nome_lanchonete"
                            value={lanchoneteForm.nome_lanchonete}
                            onChange={(e) => setLanchoneteForm({...lanchoneteForm, nome_lanchonete: e.target.value})}
                            placeholder="Nome da lanchonete"
                          />
                        </div>
                        <div>
                          <Label htmlFor="endereco">Endereço *</Label>
                          <Input
                            id="endereco"
                            value={lanchoneteForm.endereco}
                            onChange={(e) => setLanchoneteForm({...lanchoneteForm, endereco: e.target.value})}
                            placeholder="Endereço completo"
                          />
                        </div>
                        <div>
                          <Label htmlFor="telefone">Telefone</Label>
                          <Input
                            id="telefone"
                            value={lanchoneteForm.telefone}
                            onChange={(e) => setLanchoneteForm({...lanchoneteForm, telefone: e.target.value})}
                            placeholder="(00) 0000-0000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="horario">Horário de Funcionamento</Label>
                          <Input
                            id="horario"
                            value={lanchoneteForm.horario}
                            onChange={(e) => setLanchoneteForm({...lanchoneteForm, horario: e.target.value})}
                            placeholder="Ex: 8h - 18h"
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit">Adicionar</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingLanchonetes ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                          Carregando lanchonetes...
                        </TableCell>
                      </TableRow>
                    ) : lanchonetes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                          Nenhuma lanchonete cadastrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      lanchonetes.map((lanchonete) => (
                        <TableRow key={lanchonete.id}>
                          <TableCell className="font-medium">{lanchonete.nome_lanchonete}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {lanchonete.endereco}
                            </div>
                          </TableCell>
                          <TableCell>{lanchonete.telefone}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {lanchonete.horario}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={lanchonete.status}
                              onCheckedChange={() => toggleLanchoneteStatus(lanchonete.id)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditLanchonete(lanchonete)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteLanchonete(lanchonete.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Admins */}
          <TabsContent value="admins" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gerenciar Administradores</CardTitle>
                    <CardDescription>Gerencie os admins de cada lanchonete</CardDescription>
                  </div>
                  <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Admin
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Administrador</DialogTitle>
                        <DialogDescription>Cadastre um novo administrador</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddAdmin} className="space-y-4">
                        <div>
                          <Label htmlFor="admin-nome">Nome *</Label>
                          <Input
                            id="admin-nome"
                            value={adminForm.nome}
                            onChange={(e) => setAdminForm({ ...adminForm, nome: e.target.value })}
                            placeholder="Nome completo"
                          />
                        </div>
                        <div>
                          <Label htmlFor="admin-email">Email *</Label>
                          <Input
                            id="admin-email"
                            type="email"
                            value={adminForm.email}
                            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="admin-senha">Senha *</Label>
                          <Input
                            id="admin-senha"
                            type="password"
                            value={adminForm.senha}
                            onChange={(e) => setAdminForm({ ...adminForm, senha: e.target.value })}
                            placeholder="Senha do admin"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lanchonete">Lanchonete *</Label>
                          <Select
                            value={adminForm.lanchoneteId}
                            onValueChange={(value) => setAdminForm({ ...adminForm, lanchoneteId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma lanchonete" />
                            </SelectTrigger>
                            <SelectContent>
                              {lanchonetes.map((l) => (
                                <SelectItem key={l.id} value={l.id}>
                                  {l.nome_lanchonete}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={isSavingAdmin}>
                            {isSavingAdmin ? "Salvando..." : "Adicionar"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Lanchonete</TableHead>
                      <TableHead>Data de Adição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingAdmins ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                          Carregando administradores...
                        </TableCell>
                      </TableRow>
                    ) : admins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                          Nenhum administrador cadastrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      admins.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium">{admin.nome}</TableCell>
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{getLanchoneteName(admin.lanchoneteId)}</Badge>
                          </TableCell>
                          <TableCell>{formatAdminDate(admin.dataAdicao)}</TableCell>
                          <TableCell>
                            <Switch
                              checked={admin.status}
                              onCheckedChange={() => toggleAdminStatus(admin)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteAdmin(admin)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Estatísticas */}
          <TabsContent value="estatisticas" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Lanchonetes</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLanchonetes}</div>
                  <p className="text-xs text-muted-foreground">Unidades ativas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Admins</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAdmins}</div>
                  <p className="text-xs text-muted-foreground">Administradores ativos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsuarios}</div>
                  <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPedidos}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.pedidosHoje} hoje
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {stats.receitaTotal.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Todas as lanchonetes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12.5%</div>
                  <p className="text-xs text-muted-foreground">Comparado ao mês anterior</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Lanchonete</CardTitle>
                <CardDescription>Comparativo de vendas entre unidades</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lanchonete</TableHead>
                      <TableHead>Pedidos</TableHead>
                      <TableHead>Receita</TableHead>
                      <TableHead>Ticket Médio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Lanchonete Centro</TableCell>
                      <TableCell>280</TableCell>
                      <TableCell>R$ 9.450,00</TableCell>
                      <TableCell>R$ 33,75</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Lanchonete Campus Norte</TableCell>
                      <TableCell>170</TableCell>
                      <TableCell>R$ 6.300,00</TableCell>
                      <TableCell>R$ 37,06</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog para editar lanchonete */}
      <Dialog open={isEditLanchoneteOpen} onOpenChange={setIsEditLanchoneteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Lanchonete</DialogTitle>
            <DialogDescription>Atualize as informações da lanchonete</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nome">Nome *</Label>
              <Input
                id="edit-nome"
                value={lanchoneteForm.nome_lanchonete}
                onChange={(e) => setLanchoneteForm({...lanchoneteForm, nome_lanchonete: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-endereco">Endereço *</Label>
              <Input
                id="edit-endereco"
                value={lanchoneteForm.endereco}
                onChange={(e) => setLanchoneteForm({...lanchoneteForm, endereco: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-telefone">Telefone</Label>
              <Input
                id="edit-telefone"
                value={lanchoneteForm.telefone}
                onChange={(e) => setLanchoneteForm({...lanchoneteForm, telefone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-horario">Horário de Funcionamento</Label>
              <Input
                id="edit-horario"
                value={lanchoneteForm.horario}
                onChange={(e) => setLanchoneteForm({...lanchoneteForm, horario: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditLanchonete}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMaster;
