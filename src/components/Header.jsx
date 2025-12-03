import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import { Badge } from "./ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import logo from "@/assets/img/FecomercioSESCSENAC.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { user, signOut } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const userRoleRaw = user?.user_metadata?.role;
  const userRole = typeof userRoleRaw === "string" ? userRoleRaw.toLowerCase() : undefined;
  const showClientLinks = userRole !== "admin" && userRole !== "admin_master";

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
    setShowLogoutDialog(false);
  };

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/lanchonete" className="flex items-center" aria-label="Página inicial">
            <img src={logo} alt="Lanchonete" className=" md:h-16" />
          </Link>
          <div className="flex items-center gap-4">
            {showClientLinks && (
              <>
                <Link to="/carrinho" className="relative">
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Link>
                <Link to="/perfil">
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza que deseja sair?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você será desconectado da sua conta e redirecionado para a página de login.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>Sair</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link
              to="/"
              className="block py-2 hover:bg-primary-foreground/10 rounded px-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Cardápio
            </Link>
            <Link
              to="/sobre"
              className="block py-2 hover:bg-primary-foreground/10 rounded px-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre
            </Link>
            <Link
              to="/contato"
              className="block py-2 hover:bg-primary-foreground/10 rounded px-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contato
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
