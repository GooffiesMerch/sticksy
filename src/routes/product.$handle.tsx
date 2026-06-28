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
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to shop
        </Link>

        <div className="mt-6 grid gap-8 lg:gap-12 lg:grid-cols-2">
          {/* GALLERY */}
          <div className="flex flex-col gap-3">
            <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
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
                    className={`h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
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

          {/* DETAILS */}
          <div className="flex flex-col gap-6">
            <div>
              <Badge variant="secondary" className="mb-3 gap-1.5">
                <Heart className="h-3.5 w-3.5 fill-current text-rose-500" />
                Loved by happy customers
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                {node.title}
              </h1>
              <p className="mt-3 text-3xl font-semibold">
                {selectedVariant
                  ? formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)
                  : formatPrice(
                      node.priceRange.minVariantPrice.amount,
                      node.priceRange.minVariantPrice.currencyCode,
                    )}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Tax included. Shipping calculated at checkout.</p>
            </div>

            {/* Feature bullets */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {[
                { icon: Sparkles, text: "Premium matte vinyl finish" },
                { icon: Droplets, text: "Waterproof & fade-resistant" },
                { icon: ShieldCheck, text: "Removable — no paint damage" },
                { icon: Ruler, text: "Fits standard 1–2 ton split ACs" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

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
              className="h-12 text-base"
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

            {/* Info blocks */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <PackageCheck className="h-4 w-4 text-primary" /> What's included
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  1 custom-cut AC sticker, application squeegee, and step-by-step guide.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Droplets className="h-4 w-4 text-primary" /> Care instructions
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Wipe with a soft damp cloth. Avoid harsh chemicals or abrasive scrubs.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Info className="h-4 w-4 text-primary" /> Note
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  We resize each sticker to fit your AC. Just share dimensions after ordering.
                </p>
              </div>
            </div>

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

        {/* Order timeline */}
        <section className="mt-16">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            From order to your wall
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { icon: PackageCheck, title: "Order placed", desc: "We confirm your design and AC size right away." },
              { icon: Truck, title: "Dispatched", desc: "Carefully packed and shipped within 24–48 hours." },
              { icon: HomeIcon, title: "Delivered", desc: "Arrives in 2–4 days across Pakistan, ready to apply." },
            ].map((step, i) => (
              <div key={step.title} className="relative rounded-xl border bg-card p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="mt-3 text-xs font-medium text-muted-foreground">
                  Step {i + 1}
                </div>
                <h3 className="mt-1 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16 mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="mt-6">
            <AccordionItem value="fit">
              <AccordionTrigger>Will this sticker fit my AC?</AccordionTrigger>
              <AccordionContent>
                Our designs fit standard 1–2 ton split AC indoor units. For custom sizes, just
                share your AC dimensions after ordering and we'll resize it for free.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="apply">
              <AccordionTrigger>Is it easy to apply?</AccordionTrigger>
              <AccordionContent>
                Yes! Each order includes a squeegee and a simple guide. Most customers apply
                it in under 10 minutes.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="damage">
              <AccordionTrigger>Will it damage my AC paint?</AccordionTrigger>
              <AccordionContent>
                Not at all. We use premium removable vinyl that peels off cleanly without
                leaving residue.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>How long does shipping take?</AccordionTrigger>
              <AccordionContent>
                2–4 days across Pakistan, 7–14 days internationally.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="damaged">
              <AccordionTrigger>What if my sticker arrives damaged?</AccordionTrigger>
              <AccordionContent>
                We offer a 30-day replacement guarantee. Just send us a photo and we'll ship
                a fresh one.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>
      <Footer />
    </div>
  );
}
