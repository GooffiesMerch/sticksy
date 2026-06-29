import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink, Loader2, ShieldCheck, Truck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Sticksy" },
      { name: "description", content: "Review your cart and securely checkout your Sticksy AC stickers." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Checkout — Sticksy" },
      { property: "og:description", content: "Review your cart and securely checkout." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } =
    useCartStore();

  useEffect(() => {
    syncCart();
  }, [syncCart]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce(
    (s, i) => s + parseFloat(i.price.amount) * i.quantity,
    0,
  );
  const currency = items[0]?.price.currencyCode ?? "PKR";

  const handleCheckout = () => {
    const url = getCheckoutUrl();
    if (url) window.open(url, "_blank");
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="rounded-xl border bg-card p-10 text-center">
          <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">
            Add some stickers to get started.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Continue shopping</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-muted-foreground">
          {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Items */}
        <section className="space-y-4">
          {items.map((item) => {
            const img = item.product.node.images?.edges?.[0]?.node;
            return (
              <div
                key={item.variantId}
                className="flex gap-4 rounded-lg border bg-card p-4"
              >
                <Link
                  to="/product/$handle"
                  params={{ handle: item.product.node.handle }}
                  className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted"
                >
                  {img && (
                    <img
                      src={img.url}
                      alt={item.product.node.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    to="/product/$handle"
                    params={{ handle: item.product.node.handle }}
                    className="font-medium hover:underline"
                  >
                    {item.product.node.title}
                  </Link>
                  {item.selectedOptions.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {item.selectedOptions.map((o) => o.value).join(" • ")}
                    </p>
                  )}
                  <p className="mt-1 font-semibold">
                    {formatPrice(item.price.amount, item.price.currencyCode)}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        disabled={isLoading}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        disabled={isLoading}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.variantId)}
                      disabled={isLoading}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/">← Continue shopping</Link>
          </Button>
        </section>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal.toFixed(2), currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground">Calculated at next step</span>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">Total</span>
              <span className="text-xl font-bold">
                {formatPrice(subtotal.toFixed(2), currency)}
              </span>
            </div>
            <Button
              onClick={handleCheckout}
              className="mt-6 w-full"
              size="lg"
              disabled={isLoading || isSyncing}
            >
              {isLoading || isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Proceed to secure checkout
                </>
              )}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              You'll complete payment on Shopify's secure checkout.
            </p>

            <div className="mt-6 space-y-3 border-t pt-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" /> SSL secured payments
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4" /> Quality guarantee
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck className="h-4 w-4" /> Nationwide delivery
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
