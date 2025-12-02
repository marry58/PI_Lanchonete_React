import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Carrinho from "./pages/Carrinho";
import Perfil from "./pages/Perfil";
import Admin from "./pages/Admin";
import AdminMaster from "./pages/AdminMaster";
import NotFound from "./pages/NotFound";
import Lanchonete from "./pages/Lanchonete";
import SelecaoLanchonete from "./pages/SelecaoLanchonete";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import RequireMasterAdmin from "./components/RequireMasterAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Lanchonete />} />
            <Route path="/inicio" element={<RequireAuth><SelecaoLanchonete /></RequireAuth>} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/carrinho" element={<RequireAuth><Carrinho /></RequireAuth>} />
            <Route path="/perfil" element={<RequireAuth><Perfil /></RequireAuth>} />
            <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
            <Route path="/admin-master" element={<RequireMasterAdmin><AdminMaster /></RequireMasterAdmin>} />
            <Route path="/lanchonete" element={<RequireAuth><Index /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>  
  </QueryClientProvider>
);

export default App;
