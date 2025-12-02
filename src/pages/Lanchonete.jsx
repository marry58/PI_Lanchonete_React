import { Button } from "@/components/ui/button";
import bgImage from "@/assets/img/logoprincipal.png";
import { useNavigate } from "react-router-dom";

const Lanchonete = () => {
    const navigate = useNavigate();
    return (
        <main
            className="fixed inset-0 bg-[#ffffff8c] overflow-hidden w-full h-full flex items-center justify-center"
            style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'top' }}
            aria-label="Tela de abertura com background"
        >
            <div className="absolute inset-0 bg-white/60" />


            {/* Content area */}
            <div className="relative z-10 flex flex-col items-center gap-8 w-full h-full justify-center">
                {/* Top logo positioned near the top */}
                <img
                    src="/src/assets/img/headerPrincipal.png"
                    alt="Fecomércio PR logo"
                    className="w-[544px] h-[118px] mt-[55px] object-contain absolute top-12 left-1/2 -translate-x-1/2"
                />
                {/* Two large buttons */}
                <div className="flex flex-col items-center gap-8 mt-8">
                    <Button
                        className="bg-[#0b4d8b] rounded-[12px] w-[640px] h-[90px] hover:opacity-90 transition-opacity max-w-[90%]"
                        onClick={() => navigate("/cadastro")}
                    >
                        <span className="text-[#ff8a00] font-semibold italic text-4xl">CADASTRAR</span>
                    </Button>

                    <Button
                        className="bg-[#0b4d8b] rounded-[12px] w-[640px] h-[90px] hover:opacity-90 transition-opacity max-w-[90%]"
                        onClick={() => navigate("/login")}
                    >
                        <span className="text-[#ff8a00] font-semibold italic text-4xl">ENTRAR</span>
                    </Button>
                </div>
            </div>
        </main>
    );
};

export default Lanchonete;
