import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Store, MapPin } from "lucide-react";
import bgImage from "@/assets/img/logoprincipal.png";

const SelecaoLanchonete = () => {
  const navigate = useNavigate();

  const lanchonetes = [
    {
      id: 1,
      name: "LANCHONETE SESC",
      address: " Rua Doutor José Pinto Rebelo Junior, 91 - Centro, Matinhos - PR, 83260-000",
      description: "Nossa unidade Sesc Caioba em Matinhos",
    },
    {
      id: 2,
      name: "CAFÉ ESCOLA",
      address: " Rua Doutor José Pinto Rebelo Junior, 91 - Centro, Matinhos - PR, 83260-000",
      description: "Unidade Senac Caioba em Matinhos",
    },
  ];

  const handleSelectLanchonete = (lanchoneteId) => {
    localStorage.setItem("lanchonete_selecionada", lanchoneteId);
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
          {lanchonetes.map((lanchonete) => (
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
                  {lanchonete.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {lanchonete.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-8 h-8" /> 
                  <span className="text-sm"> {lanchonete.address}</span>
                </div>
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
          ))}
        </div>
      </div>
    </main>
  );
};

export default SelecaoLanchonete;
