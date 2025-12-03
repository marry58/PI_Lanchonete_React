import { useEffect, useState } from "react";
import supabase from "@/helper/supabaseClient";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, Package, ShoppingCart, Layers, BarChart3, TrendingUp, DollarSign, Users, UserCog, Shield, ShieldOff, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

const Admin = () => {

  // ///////////////////////////////////////////////////////////////////
  // Produto estados de edição
  const [productForm, setProductForm] = useState({
    nome: "",
    descricao: "",
    preco: "",
    categoria_id: null,
    lanchonete_id: null,
    imagem: "",
    disponivel: true,
    estoque: 0,
  });

  const handleChangeProdutos = (e) => {
    setProductForm({
      ...productForm,
      [e.target.id]: e.target.value,
    });
  };

  const handleAdicionarProduct = async (e) => {
    e.preventDefault();

    if (!productForm.nome || !productForm.preco || !productForm.categoria_id || !productForm.lanchonete_id) {
      toast.error("Preencha nome, preço, categoria e lanchonete do produto!");
      return;
    }

    try {
      const payload = {
        nome: productForm.nome,
        descricao: productForm.descricao,
        preco: parseFloat(productForm.preco),
        categoria_id: productForm.categoria_id,
        lanchonete_id: productForm.lanchonete_id,
        imagem: productForm.imagem,
        disponivel: productForm.disponivel,
        estoque: Number(productForm.estoque) || 0,
      };



      const { error } = await supabase.from("produtos").insert(payload);

      if (error) {
        console.error(error);
        toast.error("Erro ao adicionar produto.");
        return;
      }

      toast.success("Produto adicionado com sucesso!");
      setIsAddProductOpen(false);
      setProductForm({
        nome: "",
        descricao: "",
        preco: "",
        categoria_id: categories[0]?.id ?? null,
        lanchonete_id: lanchonetes[0]?.id ?? null,
        imagem: "",
        disponivel: true,
        estoque: 0,
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado ao cadastrar produto.");
    }
  };

  const handleEditProduct = async () => {
    if (!productForm.nome || !productForm.preco || !productForm.categoria_id || !productForm.lanchonete_id || !editingProduct) {
      toast.error("Preencha nome, preço, categoria e lanchonete do produto!");
      return;
    }

    try {
      const { error } = await supabase
        .from("produtos")
        .update({
          nome: productForm.nome,
          descricao: productForm.descricao,
          preco: parseFloat(productForm.preco),
          categoria_id: productForm.categoria_id,
          lanchonete_id: productForm.lanchonete_id,
          imagem: productForm.imagem,
          disponivel: productForm.disponivel,
          estoque: Number(productForm.estoque) || 0,
        })
        .eq("id", editingProduct.id);

      if (error) {
        console.error(error);
        toast.error("Erro ao atualizar produto.");
        return;
      }

      toast.success("Produto atualizado com sucesso!");
      setIsEditProductOpen(false);
      setEditingProduct(null);
      setProductForm({
        nome: "",
        descricao: "",
        preco: "",
        categoria_id: categories[0]?.id ?? null,
        lanchonete_id: lanchonetes[0]?.id ?? null,
        imagem: "",
        disponivel: true,
        estoque: 0,
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado ao atualizar produto.");
    }
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      nome: product.nome,
      descricao: product.descricao,
      preco: product.preco.toString(),
      categoria_id: product.categoria_id,
      lanchonete_id: product.lanchonete_id,
      imagem: product.imagem,
      disponivel: product.disponivel,
      estoque: product.estoque ?? 0,
    });
    setIsEditProductOpen(true);
  };

  const deleteProduct = async (productId) => {
    try {
      const { error } = await supabase.from("produtos").delete().eq("id", productId);

      if (error) {
        console.error(error);
        toast.error("Erro ao remover produto.");
        return;
      }

      toast.success("Produto removido!");
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado ao remover produto.");
    }
  };

  const toggleProductAvailability = async (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newValue = !product.disponivel;

    try {
      const { error } = await supabase
        .from("produtos")
        .update({ disponivel: newValue })
        .eq("id", productId);

      if (error) {
        console.error(error);
        toast.error("Erro ao atualizar disponibilidade.");
        return;
      }

      toast.success("Disponibilidade atualizada!");
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado ao atualizar disponibilidade.");
    }
  };

  // Estado de Produtos
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [lanchonetes, setLanchonetes] = useState([]);
  const [isLoadingLanchonetes, setIsLoadingLanchonetes] = useState(false);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    const { data, error } = await supabase
      .from("produtos")
      .select("id, nome, descricao, preco, categoria_id, lanchonete_id, imagem, disponivel, estoque")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      toast.error("Erro ao carregar produtos.");
      setIsLoadingProducts(false);
      return;
    }

    const normalized = (data || []).map((prod) => ({
      id: prod.id,
      nome: prod.nome,
      descricao: prod.descricao,
      preco: Number(prod.preco) || 0,
      categoria_id: prod.categoria_id,
      lanchonete_id: prod.lanchonete_id,
      imagem: prod.imagem,
      disponivel: prod.disponivel ?? true,
      estoque: Number(prod.estoque) || 0,
    }));

    setProducts(normalized);
    setIsLoadingProducts(false);
  };

  const fetchLanchonetes = async () => {
    setIsLoadingLanchonetes(true);
    const { data, error } = await supabase
      .from("lanchonete")
      .select("id, nome_lanchonete, endereco, status")
      .order("nome_lanchonete", { ascending: true });

    if (error) {
      console.error(error);
      toast.error("Erro ao carregar lanchonetes.");
      setIsLoadingLanchonetes(false);
      return;
    }

    const normalized = (data || [])
      .filter((item) => item.status !== false)
      .map((item) => ({
        id: item.id,
        name: item.nome_lanchonete,
        address: item.endereco,
      }));

    setLanchonetes(normalized);
    setIsLoadingLanchonetes(false);
  };

  // fim PRODUTOS  
  // ///////////////////////////////////////////////////////////////////




  // ///////////////////////////////////////////////////////////////////
  // Categoria estados de edição 


  const [formCategorias, setFormCategorias] = useState({
    nameCategorias: "",
    descricaoCategorias: "",
    urlImagemCategorias: "",

  });
  const handleChangeCategorias = (e) => {
    setFormCategorias({
      ...formCategorias,
      [e.target.id]: e.target.value,
    });
  };

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    const { data, error } = await supabase
      .from("categorias")
      .select("id, nomeCategoria, descricao, imagem")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      toast.error("Erro ao carregar categorias.");
      setIsLoadingCategories(false);
      return;
    }

    const normalized = (data || []).map((cat) => ({
      id: cat.id,
      name: cat.nomeCategoria,
      description: cat.descricao,
      image_url: cat.imagem,
    }));

    setCategories(normalized);
    setIsLoadingCategories(false);
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchLanchonetes();
    fetchOrders();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();

    try {
      // Inserir dados na tabela usuarios
      const { error: insertError } = await supabase.from("categorias").insert({
        nomeCategoria: formCategorias.nameCategorias,
        descricao: formCategorias.descricaoCategorias,
        imagem: formCategorias.urlImagemCategorias,
      });

      if (insertError) {
        console.log(insertError);
        toast.error("Erro ao salvar dados no banco.");
        return;
      }
      toast.success("Cadastro de categoria realizado!");
      setIsAddCategoryOpen(false);
      setFormCategorias({ nameCategorias: "", descricaoCategorias: "", urlImagemCategorias: "" });
      fetchCategories();
    } catch (err) {
      console.log(err);
      toast.error("Erro inesperado ao cadastrar");
    }
  };


  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    image_url: "",
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (categories.length === 0) return;
    setProductForm((prev) => {
      const categoryExists = categories.some((cat) => cat.id === prev.categoria_id);
      if (categoryExists) {
        return prev;
      }
      return {
        ...prev,
        categoria_id: categories[0].id,
      };
    });
  }, [categories]);

  useEffect(() => {
    if (lanchonetes.length === 0) return;
    setProductForm((prev) => {
      const lanchoneteExists = lanchonetes.some((lan) => lan.id === prev.lanchonete_id);
      if (lanchoneteExists) {
        return prev;
      }
      return {
        ...prev,
        lanchonete_id: lanchonetes[0].id,
      };
    });
  }, [lanchonetes]);

  const handleEditCategory = async () => {
    if (!categoryForm.name) {
      toast.error("Preencha o nome da categoria!");
      return;
    }

    try {
      const { error } = await supabase
        .from("categorias")
        .update({
          nomeCategoria: categoryForm.name,
          descricao: categoryForm.description,
          imagem: categoryForm.image_url,
        })
        .eq("id", editingCategory.id);

      if (error) {
        console.error(error);
        toast.error("Erro ao atualizar categoria.");
        return;
      }

      toast.success("Categoria atualizada com sucesso!");
      setIsEditCategoryOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "", image_url: "" });
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado ao atualizar categoria.");
    }
  };

  const openEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      image_url: category.image_url,
    });
    setIsEditCategoryOpen(true);
  };

  const deleteCategory = async (categoryId) => {
    const hasProducts = products.some(p => p.categoria_id === categoryId);
    if (hasProducts) {
      toast.error("Não é possível excluir categoria com produtos!");
      return;
    }

    try {
      const { error } = await supabase
        .from("categorias")
        .delete()
        .eq("id", categoryId);

      if (error) {
        console.error(error);
        toast.error("Erro ao remover categoria.");
        return;
      }

      toast.success("Categoria removida!");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado ao remover categoria.");
    }
  };


  // ===== fim FUNÇÕES DE CATEGORIAS =====

  // Estado de Pedidos
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .select(`
    id,
    total,
    status,
    address,
    payment_method,
    metadata,
    created_at,
    usuario:usuario_id (nome, email, telefone),
    lanchonete:lanchonete_id (nome_lanchonete)
  `)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar pedidos.");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchOrderItems = async (orderId) => {
    try {
      const { data, error } = await supabase
        .from("pedido_items")
        .select(`
    id,
    title,
    price,
    qty,
    metadata,
    produto:product_id (nome, imagem)
  `)
        .eq("pedido_id", orderId);

      if (error) {
        throw error;
      }
      return data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const handleViewOrderDetails = async (order) => {
    setSelectedOrder(order);
    const items = await fetchOrderItems(order.id);
    setSelectedOrderItems(items);
    setIsOrderDetailsOpen(true);
  };

  const updateOrderStatusInDB = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from("pedidos")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) {
        console.error(error);
        toast.error("Erro ao atualizar status.");
        return;
      }

      toast.success("Status do pedido atualizado!");
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar status.");
    }
  };

  // Dialogs states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);

  // Dados mockados para o Dashboard
  // Dados mockados para o Dashboard
  const salesData = [
    { day: "Seg", value: 250 },
    { day: "Ter", value: 380 },
    { day: "Qua", value: 420 },
    { day: "Qui", value: 310 },
    { day: "Sex", value: 580 },
    { day: "Sáb", value: 720 },
    { day: "Dom", value: 650 },
  ];

  const orderStatusData = [
    { name: "Pendente", value: 12, color: "hsl(var(--chart-1))" },
    { name: "Preparando", value: 8, color: "hsl(var(--chart-2))" },
    { name: "Pronto", value: 5, color: "hsl(var(--chart-3))" },
    { name: "Entregue", value: 45, color: "hsl(var(--chart-4))" },
  ];

  const topProductsData = [
    { product: "X-Burger", sales: 45 },
    { product: "Pizza", sales: 38 },
    { product: "Coca-Cola", sales: 62 },
    { product: "Esfiha", sales: 28 },
    { product: "X-Salada", sales: 33 },
  ];

  const chartConfig = {
    value: {
      label: "Vendas",
      color: "hsl(var(--primary))",
    },
    sales: {
      label: "Quantidade",
      color: "hsl(var(--primary))",
    },
  };
  // Helper para obter badge de status
  const getStatusBadge = (status) => {
    const variants = {
      pending: { label: "Pendente", variant: "secondary" },
      preparing: { label: "Preparando", variant: "default" },
      ready: { label: "Pronto", variant: "outline" },
      delivered: { label: "Entregue", variant: "outline" },
      cancelled: { label: "Cancelado", variant: "destructive" },
    };
    const { label, variant } = variants[status] || variants.pending;
    return <Badge variant={variant}>{label}</Badge>;
  };

  // Função para obter nome da categoria
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Sem categoria";
  };

  const getLanchoneteName = (lanchoneteId) => {
    const unidade = lanchonetes.find((l) => l.id === lanchoneteId);
    return unidade ? unidade.name : "Sem unidade";
  };

  // ===== FUNÇÕES DE PEDIDOS =====
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredProducts = products.filter((product) => {
    const search = productSearchTerm.trim().toLowerCase();
    if (!search) return true;

    const matchesName = product.nome?.toLowerCase().includes(search);
    const matchesDescription = product.descricao?.toLowerCase().includes(search);
    const categoryName = getCategoryName(product.categoria_id).toLowerCase();
    const matchesCategory = categoryName.includes(search);
    const lanchoneteName = getLanchoneteName(product.lanchonete_id).toLowerCase();
    const matchesLanchonete = lanchoneteName.includes(search);

    return matchesName || matchesDescription || matchesCategory || matchesLanchonete;
  });




  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie pedidos, produtos e categorias</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-4">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Layers className="h-4 w-4" />
              Categorias
            </TabsTrigger>
          </TabsList>

          {/* ===== TAB DE DASHBOARD ===== */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 3.310,00</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12.5%</span> em relação ao mês passado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">70</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+8.2%</span> em relação à semana passada
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.filter(p => p.disponivel).length}</div>
                  <p className="text-xs text-muted-foreground">
                    de {products.length} produtos cadastrados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 47,29</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+5.3%</span> em relação ao mês passado
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Gráfico de Vendas por Dia */}
              <Card>
                <CardHeader>
                  <CardTitle>Vendas da Semana</CardTitle>
                  <CardDescription>Faturamento diário em R$</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="day"
                          className="text-xs"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                          className="text-xs"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))", r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Pizza - Status dos Pedidos */}
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Pedidos</CardTitle>
                  <CardDescription>Distribuição por status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Barras - Produtos Mais Vendidos */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Produtos Mais Vendidos</CardTitle>
                  <CardDescription>Top 5 produtos do mês</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProductsData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="product"
                          className="text-xs"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                          className="text-xs"
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="sales"
                          fill="hsl(var(--primary))"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          {/* ===== TAB DE PEDIDOS ===== */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Pedidos</CardTitle>
                <CardDescription>Visualize e atualize o status dos pedidos</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <p className="text-center text-muted-foreground py-8">Carregando pedidos...</p>
                ) : orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum pedido encontrado.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Lanchonete</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                            <TableCell>{order.usuario?.nome || order.metadata?.customer_name || "Cliente"}</TableCell>
                            <TableCell>{order.lanchonete?.nome_lanchonete || "-"}</TableCell>
                            <TableCell className="font-semibold">R$ {Number(order.total).toFixed(2)}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewOrderDetails(order)}
                                >
                                  Ver Detalhes
                                </Button>
                                <Select
                                  value={order.status}
                                  onValueChange={(value) => updateOrderStatusInDB(order.id, value)}
                                >
                                  <SelectTrigger className="w-36">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="preparing">Preparando</SelectItem>
                                    <SelectItem value="ready">Pronto</SelectItem>
                                    <SelectItem value="delivered">Entregue</SelectItem>
                                    <SelectItem value="cancelled">Cancelado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dialog de detalhes do pedido */}
            <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Detalhes do Pedido</DialogTitle>
                  <DialogDescription>
                    Pedido #{selectedOrder?.id.slice(0, 8)}
                  </DialogDescription>
                </DialogHeader>
                {selectedOrder && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cliente</p>
                        <p className="font-medium">{selectedOrder.usuario?.nome || selectedOrder.metadata?.customer_name || "Cliente"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Telefone</p>
                        <p className="font-medium">{selectedOrder.usuario?.telefone || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Data</p>
                        <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pagamento</p>
                        <p className="font-medium">{selectedOrder.payment_method?.toUpperCase() || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Endereço</p>
                        <p className="font-medium">{selectedOrder.address || "Retirada no balcão"}</p>
                      </div>
                    </div>

                    {selectedOrder.metadata?.notes && (
                      <div>
                        <p className="text-muted-foreground text-sm">Observações</p>
                        <p className="text-sm">{selectedOrder.metadata.notes}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-muted-foreground text-sm mb-2">Itens do Pedido</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedOrderItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                            {(
                              item.metadata?.image || item.produto?.imagem
                            ) && (
                                <img
                                  src={item.metadata?.image || item.produto?.imagem}
                                  alt={item.produto?.nome || item.title || "Produto"}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                            <div className="flex-1">
                              <p className="font-medium">{item.title || item.produto?.nome || "Produto"}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.qty}x R$ {Number(item.price).toFixed(2)}
                              </p>
                            </div>
                            <p className="font-semibold">
                              R$ {(item.qty * Number(item.price)).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-lg font-bold text-primary">
                        R$ {Number(selectedOrder.total).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => updateOrderStatusInDB(selectedOrder.id, "preparing")}
                        disabled={selectedOrder.status === "preparing"}
                      >
                        Preparando
                      </Button>
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => updateOrderStatusInDB(selectedOrder.id, "ready")}
                        disabled={selectedOrder.status === "ready"}
                      >
                        Pronto
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => {
                          updateOrderStatusInDB(selectedOrder.id, "delivered");
                          setIsOrderDetailsOpen(false);
                        }}
                        disabled={selectedOrder.status === "delivered"}
                      >
                        Finalizar
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* ===== TAB DE PRODUTOS ===== */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Gerenciar Produtos</CardTitle>
                  <CardDescription>Adicione, edite ou remova produtos do cardápio</CardDescription>
                </div>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Produto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <form onSubmit={handleAdicionarProduct}>
                      <DialogHeader>
                        <DialogTitle>Novo Produto</DialogTitle>
                        <DialogDescription>Preencha os dados do produto</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nome">Nome</Label>
                          <Input
                            id="nome"
                            value={productForm.nome}
                            onChange={handleChangeProdutos}
                            placeholder="Ex: X-Burger Especial"
                          />
                        </div>
                        <div>
                          <Label htmlFor="descricao">Descrição</Label>
                          <Textarea
                            id="descricao"
                            value={productForm.descricao}
                            onChange={handleChangeProdutos}
                            placeholder="Descreva o produto"
                          />
                        </div>
                        <div>
                          <Label htmlFor="preco">Preço (R$)</Label>
                          <Input
                            id="preco"
                            type="number"
                            step="0.01"
                            value={productForm.preco}
                            onChange={handleChangeProdutos}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="estoque">Estoque</Label>
                          <Input
                            id="estoque"
                            type="number"
                            min="0"
                            value={productForm.estoque}
                            onChange={handleChangeProdutos}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="categoria_id">Categoria</Label>
                          <Select
                            value={productForm.categoria_id ? productForm.categoria_id.toString() : ""}
                            onValueChange={(value) =>
                              setProductForm((prev) => ({ ...prev, categoria_id: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="lanchonete_id">Lanchonete</Label>
                          <Select
                            value={productForm.lanchonete_id ? productForm.lanchonete_id.toString() : ""}
                            onValueChange={(value) =>
                              setProductForm((prev) => ({ ...prev, lanchonete_id: value }))
                            }
                            disabled={lanchonetes.length === 0}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={isLoadingLanchonetes ? "Carregando..." : "Selecione"} />
                            </SelectTrigger>
                            <SelectContent>
                              {lanchonetes.map((lan) => (
                                <SelectItem key={lan.id} value={lan.id.toString()}>
                                  {lan.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {lanchonetes.length === 0 && !isLoadingLanchonetes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Cadastre uma lanchonete antes de criar produtos.
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="disponivel"
                            checked={productForm.disponivel}
                            onChange={(e) =>
                              setProductForm((prev) => ({
                                ...prev,
                                disponivel: e.target.checked,
                              }))
                            }
                            className="w-4 h-4"
                          />
                          <Label htmlFor="disponivel">Produto disponível</Label>
                        </div>
                        <div>
                          <Label htmlFor="imagem">URL da Imagem</Label>
                          <Input
                            id="imagem"
                            value={productForm.imagem}
                            onChange={handleChangeProdutos}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="w-full mt-4">
                          Adicionar Produto
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, descrição, categoria ou lanchonete..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                {isLoadingProducts ? (
                  <p className="text-sm text-muted-foreground">Carregando produtos...</p>
                ) : products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum produto cadastrado.</p>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum produto encontrado para a busca.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Imagem</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Lanchonete</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <img
                                src={product.imagem}
                                alt={product.nome}
                                className="w-16 h-16 object-cover rounded"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{product.nome}</TableCell>
                            <TableCell className="max-w-xs truncate text-muted-foreground text-sm">
                              {product.descricao}
                            </TableCell>
                            <TableCell className="font-semibold">R$ {product.preco.toFixed(2)}</TableCell>
                            <TableCell>{getCategoryName(product.categoria_id)}</TableCell>
                            <TableCell>{getLanchoneteName(product.lanchonete_id)}</TableCell>
                            <TableCell>
                              <Badge variant={product.disponivel ? "outline" : "secondary"}>
                                {product.disponivel ? "Disponível" : "Indisponível"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openEditProduct(product)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => deleteProduct(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== TAB DE CATEGORIAS ===== */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Gerenciar Categorias</CardTitle>
                  <CardDescription>Adicione, edite ou remova categorias de produtos</CardDescription>
                </div>
                <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <form onSubmit={handleAddCategory} >
                      <DialogHeader>
                        <DialogTitle>Nova Categoria</DialogTitle>
                        <DialogDescription>Preencha os dados da categoria</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nameCategorias">Nome</Label>
                          <Input
                            id="nameCategorias"
                            value={formCategorias.nameCategorias}
                            onChange={handleChangeCategorias}
                            placeholder="Ex: Lanches"
                          />
                        </div>
                        <div>
                          <Label htmlFor="descricaoCategorias">Descrição</Label>
                          <Textarea
                            id="descricaoCategorias"
                            value={formCategorias.descricaoCategorias}
                            onChange={handleChangeCategorias}
                            placeholder="Descreva a categoria"
                          />
                        </div>
                        <div>
                          <Label htmlFor="urlImagemCategorias">URL da Imagem</Label>
                          <Input
                            id="urlImagemCategorias"
                            value={formCategorias.urlImagemCategorias}
                            onChange={handleChangeCategorias}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="w-full mt-4">
                          Adicionar Categoria
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {isLoadingCategories ? (
                  <p className="text-sm text-muted-foreground">Carregando categorias...</p>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((category) => (
                      <Card key={category.id} className="overflow-hidden">
                        <div className="aspect-video relative">
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {category.description}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => openEditCategory(category)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Editar Produto */}
        <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
              <DialogDescription>Atualize os dados do produto</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-nome">Nome</Label>
                <Input
                  id="edit-nome"
                  value={productForm.nome}
                  onChange={(e) => setProductForm({ ...productForm, nome: e.target.value })}
                  placeholder="Ex: X-Burger Especial"
                />
              </div>
              <div>
                <Label htmlFor="edit-descricao">Descrição</Label>
                <Textarea
                  id="edit-descricao"
                  value={productForm.descricao}
                  onChange={(e) => setProductForm({ ...productForm, descricao: e.target.value })}
                  placeholder="Descreva o produto"
                />
              </div>
              <div>
                <Label htmlFor="edit-preco">Preço (R$)</Label>
                <Input
                  id="edit-preco"
                  type="number"
                  step="0.01"
                  value={productForm.preco}
                  onChange={(e) => setProductForm({ ...productForm, preco: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="edit-estoque">Estoque</Label>
                <Input
                  id="edit-estoque"
                  type="number"
                  min="0"
                  value={productForm.estoque}
                  onChange={(e) => setProductForm({ ...productForm, estoque: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="edit-categoria">Categoria</Label>
                <Select
                  value={productForm.categoria_id ? productForm.categoria_id.toString() : ""}
                  onValueChange={(value) => setProductForm({ ...productForm, categoria_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-lanchonete">Lanchonete</Label>
                <Select
                  value={productForm.lanchonete_id ? productForm.lanchonete_id.toString() : ""}
                  onValueChange={(value) => setProductForm({ ...productForm, lanchonete_id: value })}
                  disabled={lanchonetes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingLanchonetes ? "Carregando..." : "Selecione"} />
                  </SelectTrigger>
                  <SelectContent>
                    {lanchonetes.map((lan) => (
                      <SelectItem key={lan.id} value={lan.id.toString()}>
                        {lan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-imagem">URL da Imagem</Label>
                <Input
                  id="edit-imagem"
                  value={productForm.imagem}
                  onChange={(e) => setProductForm({ ...productForm, imagem: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-disponivel"
                  checked={productForm.disponivel}
                  onChange={(e) => setProductForm({ ...productForm, disponivel: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="edit-disponivel" className="cursor-pointer">
                  Produto disponível
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEditProduct} className="w-full">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Editar Categoria */}
        <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Categoria</DialogTitle>
              <DialogDescription>Atualize os dados da categoria</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-cat-name">Nome</Label>
                <Input
                  id="edit-cat-name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Ex: Lanches"
                />
              </div>
              <div>
                <Label htmlFor="edit-cat-description">Descrição</Label>
                <Textarea
                  id="edit-cat-description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Descreva a categoria"
                />
              </div>
              <div>
                <Label htmlFor="edit-cat-image">URL da Imagem</Label>
                <Input
                  id="edit-cat-image"
                  value={categoryForm.image_url}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEditCategory} className="w-full">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Admin;