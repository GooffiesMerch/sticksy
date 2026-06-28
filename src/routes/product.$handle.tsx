import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  Loader2,
  Heart,
  PackageCheck,
  Truck,
  Home as HomeIcon,
  Sparkles,
  Ruler,
  Droplets,
  ShieldCheck,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { fetchProductByHandle, formatPrice } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

const productQueryOptions = (handle: string) =>
  queryOptions({
    queryKey: ["product", handle],
    queryFn: async () => {
      const product = await fetchProductByHandle(handle);
      if (!product) throw notFound();
      return product;
    },
  });

export const Route = createFileRoute("/product/$handle")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(productQueryOptions(params.handle)),
  head: ({ params }) => ({
    meta: [
      { title: `${params.handle} — Shop` },
      { name: "description", content: `Product details for ${params.handle}.` },
    ],
  }),
  component: ProductDetail,
  notFoundComponent: ProductNotFound,
  errorComponent: ProductError,
});

function ProductNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <p className="mt-2 text-muted-foreground">This product doesn't exist or was removed.</p>
        <Button asChild className="mt-6">
          <Link to="/">Back to shop</Link>
        </Button>
      </main>
    </div>
  );
}

function ProductError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  console.error(error);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Couldn't load product</h1>
        <Button
          className="mt-6"
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Try again
        </Button>
      </main>
    </div>
  );
}

function ProductDetail() {
  const { handle } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQueryOptions(handle));
  const node = product.node;

  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const variants = node.variants.edges.map((e) => e.node);
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? "");
  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) ?? variants[0],
    [variants, selectedVariantId],
  );

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const images = node.images.edges;

  const handleAdd = async () => {
    if (!selectedVariant) return;
    await addItem({
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions ?? [],
    });
    toast.success(`${node.title} added to cart`, { position: "top-center" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to shop
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              {images[selectedImageIdx]?.node ? (
                <img
                  src={images[selectedImageIdx].node.url}
                  alt={images[selectedImageIdx].node.altText ?? node.title}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={img.node.url}
                    onClick={() => setSelectedImageIdx(i)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                      i === selectedImageIdx ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img
                      src={img.node.url}
                      alt={img.node.altText ?? `${node.title} image ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{node.title}</h1>
              <p className="mt-2 text-2xl">
                {selectedVariant
                  ? formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)
                  : formatPrice(
                      node.priceRange.minVariantPrice.amount,
                      node.priceRange.minVariantPrice.currencyCode,
                    )}
              </p>
            </div>

            {variants.length > 1 && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Variant</label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      disabled={!v.availableForSale}
                      className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                        v.id === selectedVariantId
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background hover:bg-accent"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              size="lg"
              onClick={handleAdd}
              disabled={isLoading || !selectedVariant?.availableForSale}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : !selectedVariant?.availableForSale ? (
                "Sold out"
              ) : (
                "Add to cart"
              )}
            </Button>

            {node.description && (
              <div className="prose prose-sm max-w-none">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {node.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
