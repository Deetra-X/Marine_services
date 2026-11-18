export type CartItem = { productId: string; quantity: number };

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem("marine-order-cart") || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("marine-order-cart", JSON.stringify(items));
  }
}
