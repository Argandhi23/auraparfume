export interface CartItem {
  id: string; // product id + size identifier (e.g. productId-size)
  productId: string;
  name: string;
  slug: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const cart = localStorage.getItem("parfume_cart");
  return cart ? JSON.parse(cart) : [];
}

export function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("parfume_cart", JSON.stringify(cart));
  // Trigger a custom event to notify other components in the same tab
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(product: { id: string; name: string; slug: string; price: number; image: string }, size: string, quantity: number = 1) {
  const cart = getCart();
  const cartItemId = `${product.id}-${size}`;
  const existingItemIndex = cart.findIndex((item) => item.id === cartItemId);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      id: cartItemId,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      size,
      quantity,
      image: product.image,
    });
  }
  saveCart(cart);
}

export function removeFromCart(itemId: string) {
  const cart = getCart();
  const updatedCart = cart.filter((item) => item.id !== itemId);
  saveCart(updatedCart);
}

export function updateCartQty(itemId: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(itemId);
    return;
  }
  const cart = getCart();
  const itemIndex = cart.findIndex((item) => item.id === itemId);
  if (itemIndex > -1) {
    cart[itemIndex].quantity = quantity;
    saveCart(cart);
  }
}

export function clearCart() {
  saveCart([]);
}
