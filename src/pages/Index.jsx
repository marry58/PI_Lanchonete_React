import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import supabase from "@/helper/supabaseClient";
import { Search } from "lucide-react";
import { toast } from "sonner";


console.log("Supabase URL:", supabase.supabaseUrl);
const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["todos"]);
  const [loading, setLoading] = useState(true);

  // ---------- FUNÇÃO DE SELECT NO SUPABASE ----------
  const getProducts = async () => {
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
    `);

  if (error) {
    console.error("Erro ao buscar produtos:", error);
    toast.error("Erro ao carregar produtos!");
    return [];
  }

  return data;
};

  // ---------- CARREGAR PRODUTOS ----------
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();

        setProducts(data);

        // Gerar categorias com fallback para produtos sem categoria relacionada
        const normalizedCategoryNames = data.map(
          (item) => item.categorias?.nomeCategoria || "sem categoria"
        );

        const uniqueCategories = [
          "todos",
          ...new Set(normalizedCategoryNames),
        ];

        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        toast.error("Erro ao carregar produtos!");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

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
  const handleAddToCart = (productName) => {
    toast.success(`${productName} adicionado ao carrinho!`);
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Cardápio</h1>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getProductsByCategory(cat).map((product) => (
                  <ProductCard
                    key={product.id}
                    name={product.nome}
                    description={product.descricao || ""}
                    price={Number(product.preco) || 0}
                    image={product.imagem}
                    onAddToCart={() => handleAddToCart(product.nome)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
