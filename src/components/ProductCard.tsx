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
      className="group flex flex-col gap-3"
    >
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
        {image ? (
          <img
            src={image.url}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-medium leading-tight line-clamp-1">{node.title}</h3>
        <p className="text-sm text-muted-foreground">
          {formatPrice(price.amount, price.currencyCode)}
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleAdd}
        disabled={isLoading || !variant || !variant.availableForSale}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : !variant?.availableForSale ? (
          "Sold out"
        ) : (
          "Add to cart"
        )}
      </Button>
    </Link>
  );
}

export const ProductCard = memo(ProductCardImpl);
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-medium leading-tight line-clamp-1">{node.title}</h3>
        <p className="text-sm text-muted-foreground">
          {formatPrice(price.amount, price.currencyCode)}
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleAdd}
        disabled={isLoading || !variant || !variant.availableForSale}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : !variant?.availableForSale ? (
          "Sold out"
        ) : (
          "Add to cart"
        )}
      </Button>
    </Link>
  );
}
