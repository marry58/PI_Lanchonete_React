import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Store, MapPin, Loader2 } from "lucide-react";
import bgImage from "@/assets/img/logoprincipal.png";
import supabase from "@/helper/supabaseClient";
import { toast } from "sonner";

const SelecaoLanchonete = () => {
  const navigate = useNavigate();
  const [lanchonetes, setLanchonetes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLanchonetes = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("lanchonete")
        .select("id, nome_lanchonete, endereco, horario, status, telefone")
        .order("nome_lanchonete", { ascending: true });

      if (error) {
        console.error("Erro ao carregar lanchonetes:", error);
        toast.error("Não foi possível carregar as lanchonetes.");
        setIsLoading(false);
        return;
      }

      const active = (data || []).filter((item) => item.status !== false);
      setLanchonetes(active);
      setIsLoading(false);
    };

    fetchLanchonetes();
  }, []);

  const handleSelectLanchonete = (lanchoneteId) => {
    localStorage.setItem("lanchonete_selecionada", lanchoneteId);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("lanchonete_change"));
    }
    navigate("/lanchonete");
  };

  return (
    <main
      className="fixed inset-0 bg-[#ffffff8c] overflow-hidden w-full h-full flex items-center justify-center"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'top' }}
      aria-label="Seleção de lanchonete"
    >
      <div className="absolute inset-0 bg-white/60" />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full h-full justify-center px-4">
        {/* Logo no topo */}
        <img
          src="/src/assets/img/headerPrincipal.png"
          alt="Fecomércio PR logo"
          className="w-[544px] h-[118px] object-contain absolute top-12 left-1/2 -translate-x-1/2 max-w-[90%]"
        />

        {/* Título */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-[#0b4d8b] mb-2">
            Escolha sua Lanchonete
          </h1>
          <p className="text-lg text-gray-700">
            Selecione a unidade mais próxima de você
          </p>
        </div>

        {/* Cards das lanchonetes */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center w-full max-w-4xl">
          {isLoading ? (
            <div className="flex flex-col items-center text-center text-gray-600 py-10">
              <Loader2 className="h-10 w-10 animate-spin mb-3" />
              <p>Carregando unidades...</p>
            </div>
          ) : lanchonetes.length === 0 ? (
            <Card className="w-full md:w-[400px] text-center p-6">
              <CardHeader>
                <CardTitle className="text-xl">Nenhuma unidade disponível</CardTitle>
                <CardDescription>
                  Tente novamente mais tarde ou entre em contato com o suporte.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            lanchonetes.map((lanchonete) => (
            <Card
              key={lanchonete.id}
              className="w-full md:w-[400px] hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-[#ff8a00]"
              onClick={() => handleSelectLanchonete(lanchonete.id)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-[#0b4d8b] rounded-full flex items-center justify-center">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-[#0b4d8b]">
                    {lanchonete.nome_lanchonete}
                </CardTitle>
                <CardDescription className="text-base">
                    {lanchonete.descricao || "Unidade disponível"}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-8 h-8" /> 
                    <span className="text-sm"> {lanchonete.endereco}</span>
                </div>
                  {lanchonete.horario && (
                    <p className="text-sm text-gray-500 mb-2">Horário: {lanchonete.horario}</p>
                  )}
                  {lanchonete.telefone && (
                    <p className="text-sm text-gray-500 mb-4">Telefone: {lanchonete.telefone}</p>
                  )}
                <Button
                  className="w-full bg-[#0b4d8b] hover:bg-[#0b4d8b]/90 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectLanchonete(lanchonete.id);
                  }}
                >
                  <span className="text-[#ff8a00] font-semibold text-lg">
                    SELECIONAR
                  </span>
                </Button>
              </CardContent>
            </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default SelecaoLanchonete;
