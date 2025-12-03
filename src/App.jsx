import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import RequireMasterAdmin from "./components/RequireMasterAdmin";
import { CartProvider } from "./context/CartContext";
import Pagamento from "./pages/Pagamento";

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Cadastro = lazy(() => import("./pages/Cadastro"));
const Carrinho = lazy(() => import("./pages/Carrinho"));
const Perfil = lazy(() => import("./pages/Perfil"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminMaster = lazy(() => import("./pages/AdminMaster"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Lanchonete = lazy(() => import("./pages/Lanchonete"));
const SelecaoLanchonete = lazy(() => import("./pages/SelecaoLanchonete"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <Suspense
            fallback={
              <div className="flex h-screen items-center justify-center text-lg font-medium">
                Carregando...
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Lanchonete />} />
              <Route path="/inicio" element={<RequireAuth><SelecaoLanchonete /></RequireAuth>} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/carrinho" element={<RequireAuth><Carrinho /></RequireAuth>} />
              <Route path="/pagamento" element={<RequireAuth><Pagamento /></RequireAuth>} />
              <Route path="/perfil" element={<RequireAuth><Perfil /></RequireAuth>} />
              <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
              <Route path="/admin-master" element={<RequireMasterAdmin><AdminMaster /></RequireMasterAdmin>} />
              <Route path="/lanchonete" element={<RequireAuth><Index /></RequireAuth>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>  
  </QueryClientProvider>
);

export default App;
