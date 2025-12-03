import { createContext, useContext, useEffect, useMemo, useState } from "react";
import supabase from "@/helper/supabaseClient";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "cart-items-by-lanchonete";
const DEFAULT_LANCHONETE_KEY = "default";
const LANCHONETE_EVENT = "lanchonete_change";

const getSelectedLanchoneteId = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("lanchonete_selecionada");
};

const readCartStorage = () => {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

const writeCartStorage = (state) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore storage errors */
  }
};

export const CartProvider = ({ children }) => {
  const [selectedLanchoneteId, setSelectedLanchoneteId] = useState(getSelectedLanchoneteId);
  const [cartState, setCartState] = useState(readCartStorage);
  const cartKey = selectedLanchoneteId || DEFAULT_LANCHONETE_KEY;
  const cartItems = cartState[cartKey] || [];

  useEffect(() => {
    writeCartStorage(cartState);
  }, [cartState]);

  useEffect(() => {
    const syncSelected = () => {
      setSelectedLanchoneteId(getSelectedLanchoneteId());
    };

    const handleStorage = (event) => {
      if (event.key === "lanchonete_selecionada") {
        syncSelected();
      }
      if (event.key === CART_STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (typeof parsed === "object" && parsed !== null) {
            setCartState(parsed);
          }
        } catch {
          /* ignore */
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(LANCHONETE_EVENT, syncSelected);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(LANCHONETE_EVENT, syncSelected);
    };
  }, []);

  useEffect(() => {
    // ensure key exists when switching lanchonete
    setCartState((prev) => {
      const exists = prev[cartKey];
      if (exists) return prev;
      return { ...prev, [cartKey]: [] };
    });
  }, [cartKey]);

  const getProductStock = async (productId) => {
    const { data, error } = await supabase
      .from("produtos")
      .select("estoque")
      .eq("id", productId)
      .single();

    if (error) {
      throw new Error("Erro ao verificar estoque");
    }

    return Number(data?.estoque ?? 0);
  };

  const addItem = async (product) => {
    const existing = cartItems.find((item) => item.id === product.id);
    const desiredQuantity = (existing?.quantity || 0) + (product.quantity || 1);
    const availableStock = await getProductStock(product.id);

    if (desiredQuantity > availableStock) {
      return { success: false, availableStock };
    }

    setCartState((itemsByLanchonete) => {
      const currentItems = itemsByLanchonete[cartKey] || [];
      const hasItem = currentItems.find((item) => item.id === product.id);
      const updatedItems = hasItem
        ? currentItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + (product.quantity || 1) }
              : item
          )
        : [...currentItems, { ...product, quantity: product.quantity || 1 }];
      return { ...itemsByLanchonete, [cartKey]: updatedItems };
    });

    return { success: true };
  };

  const updateQuantity = async (productId, delta) => {
    const target = cartItems.find((item) => item.id === productId);
    if (!target) {
      return { success: false, availableStock: 0 };
    }

    const desiredQuantity = Math.max(1, target.quantity + delta);
    const availableStock = await getProductStock(productId);

    if (desiredQuantity > availableStock) {
      return { success: false, availableStock };
    }

    setCartState((itemsByLanchonete) => {
      const currentItems = itemsByLanchonete[cartKey] || [];
      const updatedItems = currentItems.map((item) =>
        item.id === productId ? { ...item, quantity: desiredQuantity } : item
      );
      return { ...itemsByLanchonete, [cartKey]: updatedItems };
    });

    return { success: true };
  };

  const removeItem = (productId) => {
    setCartState((itemsByLanchonete) => {
      const currentItems = itemsByLanchonete[cartKey] || [];
      const updatedItems = currentItems.filter((item) => item.id !== productId);
      return { ...itemsByLanchonete, [cartKey]: updatedItems };
    });
  };

  const clearCart = () =>
    setCartState((itemsByLanchonete) => ({
      ...itemsByLanchonete,
      [cartKey]: [],
    }));

  const value = useMemo(
    () => ({
      cartItems,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    [cartItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
