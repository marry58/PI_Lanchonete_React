import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import supabase from "@/helper/supabaseClient";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";


console.log("Supabase URL:", supabase.supabaseUrl);
const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["todos"]);
  const [loading, setLoading] = useState(true);
  const [selectedLanchoneteId, setSelectedLanchoneteId] = useState(undefined);
  const [selectedLanchonete, setSelectedLanchonete] = useState(null);
  const [selectionChecked, setSelectionChecked] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();

  // ---------- FUNÇÃO DE SELECT NO SUPABASE ----------
  const getProducts = async (lanchoneteId) => {
    if (!lanchoneteId) return [];

    const { data, error } = await supabase
      .from("produtos")
      .select(`
        id,
        nome,
        descricao,
        preco,
        imagem,
        categoria_id,
        categorias (
          id,
          nomeCategoria
        )
      `)
      .eq("lanchonete_id", lanchoneteId)
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao buscar produtos:", error);
      toast.error("Erro ao carregar produtos!");
      return [];
    }

    return data;
  };

  const getLanchoneteInfo = async (lanchoneteId) => {
    if (!lanchoneteId) return null;

    const { data, error } = await supabase
      .from("lanchonete")
      .select("id, nome_lanchonete, endereco")
      .eq("id", lanchoneteId)
      .single();

    if (error) {
      console.error("Erro ao carregar lanchonete:", error);
      toast.error("Não foi possível carregar a lanchonete selecionada.");
      return null;
    }

    return data;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedId = window.localStorage.getItem("lanchonete_selecionada");
    setSelectedLanchoneteId(storedId);
    setSelectionChecked(true);
  }, []);

  // ---------- CARREGAR PRODUTOS ----------
  useEffect(() => {
    if (!selectionChecked) return;

    if (!selectedLanchoneteId) {
      setProducts([]);
      setCategories(["todos"]);
      setSelectedLanchonete(null);
      setLoading(false);
      return;
    }

    const loadProducts = async () => {
      setLoading(true);
      try {
        const [data, lanchoneteData] = await Promise.all([
          getProducts(selectedLanchoneteId),
          getLanchoneteInfo(selectedLanchoneteId),
        ]);

        setProducts(data);
        setSelectedLanchonete(lanchoneteData);

        const normalizedCategoryNames = data.map(
          (item) => item.categorias?.nomeCategoria || "sem categoria"
        );

        const uniqueCategories = [
          "todos",
          ...new Set(normalizedCategoryNames),
        ];

        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar cardápio da lanchonete.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectionChecked, selectedLanchoneteId]);

  const handleChangeLanchonete = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("lanchonete_selecionada");
      window.dispatchEvent(new Event("lanchonete_change"));
    }
    setSelectedLanchoneteId(undefined);
    setSelectedLanchonete(null);
    setSearchTerm("");
    navigate("/inicio");
  };

  // ---------- FILTRO DE BUSCA ----------
  const filteredProducts = products.filter((product) =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ---------- FILTRAR POR CATEGORIA ----------
  const getProductsByCategory = (category) => {
  if (category === "todos") return filteredProducts;

  return filteredProducts.filter((product) => {
    const productCategory = product.categorias?.nomeCategoria || "sem categoria";
    return productCategory === category;
  });
};

  // ---------- ADICIONAR AO CARRINHO ----------
  const handleAddToCart = async (product) => {
    try {
      const result = await addItem({
        id: product.id,
        name: product.nome,
        description: product.descricao || "",
        price: Number(product.preco) || 0,
        image: product.imagem,
      });

      if (result?.success) {
        toast.success(`${product.nome} adicionado ao carrinho!`);
      } else {
        toast.error(
          result?.availableStock > 0
            ? `Estoque disponível: ${result.availableStock} unidade(s).`
            : "Produto sem estoque disponível."
        );
      }
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho", error);
      toast.error("Não foi possível verificar o estoque agora.");
    }
  };

  if (loading) {
    return <p className="text-center mt-20">Carregando...</p>;
  }

  console.log("Produtos carregados:", products);
  console.log("Categorias disponíveis:", categories);
  console.log("Produtos filtrados:", filteredProducts);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1 w-full">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold">Cardápio</h1>
              {selectedLanchonete && (
                <p className="text-sm text-muted-foreground mt-2">
                  Unidade selecionada: <span className="font-semibold text-foreground">{selectedLanchonete.nome_lanchonete}</span>
                  {selectedLanchonete.endereco && ` • ${selectedLanchonete.endereco}`}
                </p>
              )}
            </div>
            {selectedLanchoneteId && (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleChangeLanchonete}
              >
                Trocar lanchonete
              </Button>
            )}
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder={selectedLanchoneteId ? "Buscar produtos..." : "Selecione uma lanchonete para buscar"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={!selectedLanchoneteId}
            />
          </div>
        </div>

        {selectionChecked && !selectedLanchoneteId ? (
          <div className="rounded-md border border-dashed p-8 text-center">
            <p className="mb-4 text-muted-foreground">
              Escolha uma lanchonete para visualizar o cardápio disponível.
            </p>
            <Button asChild>
              <Link to="/inicio">Selecionar Lanchonete</Link>
            </Button>
          </div>
        ) : (
        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="mb-8">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat} value={cat}>
              {getProductsByCategory(cat).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum produto disponível nesta categoria.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {getProductsByCategory(cat).map((product) => (
                    <ProductCard
                      key={product.id}
                      name={product.nome}
                      description={product.descricao || ""}
                      price={Number(product.preco) || 0}
                      image={product.imagem}
                      onAddToCart={() => handleAddToCart(product)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
