import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { toast } from "sonner";

function ProductCardImpl({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const node = product.node;
  const image = node.images.edges[0]?.node;
  const variant = node.variants.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions ?? [],
    });
    toast.success(`${node.title} added to cart`, { position: "top-center" });
  };

  return (
    <Link
      to="/product/$handle"
      params={{ handle: node.handle }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {image ? (
          <img
            src={image.url}
            alt={image.altText ?? node.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold leading-snug line-clamp-1 group-hover:text-foreground">
            {node.title}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAdd}
          disabled={isLoading || !variant || !variant.availableForSale}
          className="mt-auto w-full rounded-full font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : !variant?.availableForSale ? (
            "Sold out"
          ) : (
            "Add to cart"
          )}
        </Button>
      </div>
    </Link>
  );
}


export const ProductCard = memo(ProductCardImpl);
