import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Banknote, QrCode, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import  supabase  from "@/helper/supabaseClient";

const Pagamento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, total, clearCart } = useCart();
  const { user } = useAuth();
  
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const deliveryAddress =
    location.state?.deliveryAddress ||
    location.state?.address ||
    "Retirada no balcão";

  const getSelectedLanchoneteId = () => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("lanchonete_selecionada");
  };

  // Redirect if no items
  if (cartItems.length === 0 && !location.state?.fromCheckout) {
    navigate("/carrinho");
    return null;
  }

  const handlePayment = async () => {
    if (!user) {
      toast.error("Faça login para concluir o pedido.");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Seu carrinho está vazio.");
      navigate("/carrinho");
      return;
    }

    setLoading(true);
    try {
      const lanchoneteId = getSelectedLanchoneteId();

      const { data: usuarioRow, error: usuarioError } = await supabase
        .from("usuario")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (usuarioError) throw usuarioError;

      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert({
          usuario_id: usuarioRow?.id ?? null,
          auth_user_id: user.id,
          lanchonete_id: lanchoneteId || null,
          total,
          status: "pending",
          address: deliveryAddress,
          payment_method: paymentMethod,
          metadata: {
            notes: notes || null,
            lanchonete_id: lanchoneteId,
          },
        })
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      const itensPayload = cartItems.map((item) => ({
        pedido_id: pedido.id,
        product_id: item.id,
        title: item.name,
        price: item.price,
        qty: item.quantity,
        metadata: {
          image: item.image,
        },
      }));

      if (itensPayload.length > 0) {
        const { error: itensError } = await supabase
          .from("pedido_items")
          .insert(itensPayload);

        if (itensError) throw itensError;
      }

      clearCart();
      toast.success("Pedido realizado com sucesso!");
      navigate("/perfil", { state: { orderSuccess: true } });
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast.error("Erro ao processar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Pagamento</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Methods */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex items-center gap-3 cursor-pointer flex-1">
                      <QrCode className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">PIX</p>
                        <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors mt-3">
                    <RadioGroupItem value="credit" id="credit" />
                    <Label htmlFor="credit" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">Cartão de Crédito</p>
                        <p className="text-sm text-muted-foreground">Pague no balcão</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors mt-3">
                    <RadioGroupItem value="debit" id="debit" />
                    <Label htmlFor="debit" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">Cartão de Débito</p>
                        <p className="text-sm text-muted-foreground">Pague no balcão</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors mt-3">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Banknote className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">Dinheiro</p>
                        <p className="text-sm text-muted-foreground">Pague no balcão</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card> 
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity}x R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total</span>
                    <span className="text-primary">R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? (
                    "Processando..."
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Confirmar Pedido
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pagamento;