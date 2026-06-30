import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
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
  Palette,
  Maximize2,
  Printer,
  Check,
  X,
  Star,
  Minus,
  Plus,
} from "lucide-react";
import pdpReview1 from "@/assets/pdp-review-1.jpg";
import pdpReview2 from "@/assets/pdp-review-2.jpg";
import pdpReview3 from "@/assets/pdp-review-3.jpg";
import tankReview1 from "@/assets/tank-review-1.jpg";
import tankReview2 from "@/assets/tank-review-2.jpg";
import tankReview3 from "@/assets/tank-review-3.jpg";
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
import { MinimalHeader } from "@/components/MinimalHeader";
import { Footer } from "@/components/Footer";
import { fetchProductByHandle, fetchProducts, formatPrice } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";
import { useCartStore } from "@/stores/cartStore";

// Products that should render as a standalone landing page (no site header/footer,
// no back link, no related products). Reached only via direct URL.
const STANDALONE_HANDLES = new Set<string>([
  "insulated-water-tank-cover-for-plastic-tanks",
]);

const productQueryOptions = (handle: string) =>
  queryOptions({
    queryKey: ["product", handle],
    queryFn: async () => {
      const product = await fetchProductByHandle(handle);
      if (!product) throw notFound();
      return product;
    },
  });

const WATER_TANK_HANDLE = "insulated-water-tank-cover-for-plastic-tanks";

const TANK_FAQS = [
  { q: "Will this fit my plastic water tank?", a: "Yes — we make sizes for 400L, 500L, 800L, 1000L, 1200L and larger plastic tanks. Pick the closest size to yours; the adjustable straps handle small differences in shape." },
  { q: "Does it really keep the water cool?", a: "Yes. The multi-layer insulated shell reflects sunlight and slows heat transfer, so stored water stays noticeably cooler — especially during Pakistan's summer." },
  { q: "Will it stop algae inside the tank?", a: "By blocking direct sunlight from hitting the tank walls, the cover dramatically reduces algae and bacterial growth that thrive in sunlit water." },
  { q: "Is it hard to install?", a: "Not at all. Wrap it around your tank, fasten the adjustable straps, and you're done — most people fit it in under 10 minutes." },
  { q: "How long does shipping take?", a: "2–4 days across Pakistan. We dispatch within 24–48 hours of your order." },
];

const STICKER_FAQS = [
  { q: "Will this sticker fit my AC?", a: "Our designs fit standard 1–2 ton split AC indoor units. For custom sizes, just share your AC dimensions after ordering and we'll resize it for free." },
  { q: "Is it easy to apply?", a: "Yes! Each order includes a squeegee and a simple guide. Most customers apply it in under 10 minutes." },
  { q: "Will it damage my AC paint?", a: "Not at all. We use premium removable vinyl that peels off cleanly without leaving residue." },
  { q: "How long does shipping take?", a: "2–4 days across Pakistan, 7–14 days internationally." },
  { q: "What if my sticker arrives damaged?", a: "We offer a 30-day replacement guarantee. Just send us a photo and we'll ship a fresh one." },
];

export const Route = createFileRoute("/product/$handle")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(productQueryOptions(params.handle)),
  head: ({ params, loaderData }) => {
    const node = loaderData?.node;
    const title = node ? `${node.title} — Sticksy` : "Product — Sticksy";
    const rawDesc = node?.description?.trim() || "";
    const fallback = node
      ? `Shop the ${node.title} premium vinyl AC sticker from Sticksy. Easy to apply, made to last, shipped fast across Pakistan and worldwide.`
      : "Premium vinyl AC stickers from Sticksy — easy to apply, made to last.";
    const source = rawDesc.length >= 50 ? rawDesc : fallback;
    const description =
      source.length <= 160
        ? source
        : source.slice(0, 157).replace(/\s+\S*$/, "").trimEnd() + "…";
    const url = `https://sticksy.lovable.app/product/${params.handle}`;
    const image = node?.images?.edges?.[0]?.node?.url;
    const price = node?.priceRange?.minVariantPrice;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: node
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: node.title,
                description: rawDesc || fallback,
                image: node.images.edges.map((e) => e.node.url),
                url,
                offers: price
                  ? {
                      "@type": "Offer",
                      price: price.amount,
                      priceCurrency: price.currencyCode,
                      availability: "https://schema.org/InStock",
                      url,
                    }
                  : undefined,
              }),
            },
          ]
        : [],
    };
  },
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
  const [quantity, setQuantity] = useState(1);
  const images = node.images.edges;

  // Related products
  const { data: relatedProducts } = useQuery({
    queryKey: ["related-products"],
    queryFn: () => fetchProducts(12),
    staleTime: 5 * 60 * 1000,
  });
  const related = (relatedProducts ?? []).filter((p) => p.node.handle !== handle).slice(0, 4);

  // Order timeline dates
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const delivery = new Date(today); delivery.setDate(today.getDate() + 3);




  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    await addItem({
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions ?? [],
    });
    const url = useCartStore.getState().getCheckoutUrl();
    if (url) {
      window.open(url, "_blank");
    } else {
      toast.error("Could not start checkout. Please try again.", { position: "top-center" });
    }
  };

  const isStandalone = STANDALONE_HANDLES.has(handle);
  const isWaterTank = handle === "insulated-water-tank-cover-for-plastic-tanks";

  // Product-specific copy
  const copy = isWaterTank
    ? {
        badge: "Pakistan's #1 insulated tank cover",
        featureBullets: [
          { icon: Droplets, text: "Keeps water cool in peak summer" },
          { icon: ShieldCheck, text: "Prevents freezing in winter" },
          { icon: Sparkles, text: "UV & weather resistant" },
          { icon: Ruler, text: "Fits 400L – 1200L+ plastic tanks" },
        ],
        included: "1 insulated tank cover, adjustable straps, and a fitting guide.",
        care: "Wipe clean with a damp cloth. Stays outdoor-ready year round.",
        note: "Pick the size closest to your tank — straps adjust for a snug fit.",
        timelineSteps: [
          { icon: PackageCheck, title: "Order placed", desc: "We confirm your tank size and dispatch the matching cover." },
          { icon: Truck, title: "Order dispatches", desc: "Carefully packed and shipped within 24–48 hours." },
          { icon: HomeIcon, title: "Delivered!", desc: "Arrives ready to wrap around your rooftop tank." },
        ],
        sectionTitle: "Built to protect every drop.",
        sectionSub: `Why the ${node.title} is worth every rupee.`,
        sectionFeatures: [
          { icon: ShieldCheck, title: "Thermal insulation", desc: "Multi-layer insulation keeps stored water cool in summer and prevents winter freezing." },
          { icon: Droplets, title: "Algae & bacteria control", desc: "Blocks direct sunlight so algae can't grow inside your tank." },
          { icon: Sparkles, title: "UV & weatherproof", desc: "Heat-reflective outer shell resists fading, rain, and harsh sun." },
          { icon: Ruler, title: "Custom snug fit", desc: "Adjustable straps and multiple sizes for 400L to 1200L+ plastic tanks." },
        ],
        statsTitle: "Cool, clean water — all year round",
        statsSub: "A simple cover that protects your family's water and your tank itself.",
        stats: [
          { pct: 96, label: "Customers report noticeably cooler water" },
          { pct: 93, label: "Reduction in algae growth inside the tank" },
          { pct: 90, label: "Longer tank lifespan vs. uncovered tanks" },
        ],
        compareSub: "Multi-layer insulation, weatherproof shell, and adjustable fit — built for Pakistan's rooftops.",
        compareRows: [
          "Multi-layer thermal insulation",
          "Heat-reflective UV shield",
          "Blocks sunlight (no algae)",
          "Weather & rain resistant",
          "Adjustable straps for snug fit",
          "Fits 400L – 1200L+ plastic tanks",
        ],
        reviewsTitle: `What customers say about the ${node.title}`,
        reviews: [
          {
            img: tankReview1,
            name: "Imran S.",
            location: "Lahore, PK",
            title: "Water finally stays cool in June",
            body: "Our rooftop tank used to make the water boiling hot by noon. After fitting this cover, even at 45°C the water is genuinely cool. Worth every rupee.",
          },
          {
            img: tankReview2,
            name: "Faisal A.",
            location: "Islamabad, PK",
            title: "Perfect fit on my 1000L tank",
            body: "Straps were easy to adjust and the cover sits tight even in strong wind. No more green algae inside the tank either.",
          },
          {
            img: tankReview3,
            name: "Bilal R.",
            location: "Rawalpindi, PK",
            title: "Cool water even in peak summer",
            body: "Our tank sits in direct sun on the roof and used to give scalding water by afternoon. With this cover the water stays genuinely cool — perfect for bath after work and for filling bottles before my daily commute. Game changer in June.",
          },
        ],
        faqs: [
          { q: "Will this fit my plastic water tank?", a: "Yes — we make sizes for 400L, 500L, 800L, 1000L, 1200L and larger plastic tanks. Pick the closest size to yours; the adjustable straps handle small differences in shape." },
          { q: "Does it really keep the water cool?", a: "Yes. The multi-layer insulated shell reflects sunlight and slows heat transfer, so stored water stays noticeably cooler — especially during Pakistan's summer." },
          { q: "Will it stop algae inside the tank?", a: "By blocking direct sunlight from hitting the tank walls, the cover dramatically reduces algae and bacterial growth that thrive in sunlit water." },
          { q: "Is it hard to install?", a: "Not at all. Wrap it around your tank, fasten the adjustable straps, and you're done — most people fit it in under 10 minutes." },
          { q: "How long does shipping take?", a: "2–4 days across Pakistan. We dispatch within 24–48 hours of your order." },
        ],
        ctaShort: "Get the cover",
      }
    : {
        badge: "Loved by happy customers",
        featureBullets: [
          { icon: Sparkles, text: "Premium matte vinyl finish" },
          { icon: Droplets, text: "Waterproof & fade-resistant" },
          { icon: ShieldCheck, text: "Removable — no paint damage" },
          { icon: Ruler, text: "Fits standard 1–2 ton split ACs" },
        ],
        included: "1 custom-cut AC sticker, application squeegee, and step-by-step guide.",
        care: "Wipe with a soft damp cloth. Avoid harsh chemicals or abrasive scrubs.",
        note: "We resize each sticker to fit your AC. Just share dimensions after ordering.",
        timelineSteps: [
          { icon: PackageCheck, title: "Order placed", desc: "We confirm your design and AC size right away." },
          { icon: Truck, title: "Order dispatches", desc: "Carefully packed and shipped within 24–48 hours." },
          { icon: HomeIcon, title: "Delivered!", desc: "Arrives at your door, ready to apply." },
        ],
        sectionTitle: "Art that captivates and inspires.",
        sectionSub: `Why the ${node.title} stands out.`,
        sectionFeatures: [
          { icon: ShieldCheck, title: "Premium Vinyl Quality", desc: "Crafted with high-grade matte vinyl that resists fading, scratches, and humidity." },
          { icon: Maximize2, title: "Custom-fit Sizing", desc: "Resized to match your exact AC dimensions for a clean, edge-to-edge finish." },
          { icon: Printer, title: "Exceptional Print Fidelity", desc: "Top-tier pigmented inks deliver stunning clarity and rich, true-to-design colors." },
          { icon: HomeIcon, title: "Indoor Use Only", desc: "Designed specifically for indoor split AC units to enhance any living space." },
        ],
        statsTitle: "Transform Your Decor with Art",
        statsSub: "A sticker can redefine your space and express your personality.",
        stats: [
          { pct: 95, label: "Enhances your decor with vibrant art." },
          { pct: 92, label: "Delivers exceptional print quality." },
          { pct: 89, label: "Perfect for any indoor space." },
        ],
        compareSub: "Premium matte vinyl, custom-fit sizing, and pigmented inks — built to look stunning on any indoor split AC.",
        compareRows: [
          "Premium matte vinyl",
          "Pigmented archival inks",
          "Custom-fit sizing",
          "Vibrant color reproduction",
          "Removable — no residue",
          "Designed for indoor AC use",
        ],
        reviewsTitle: `What customers say about the ${node.title}`,
        reviews: [
          { img: pdpReview1, name: "Ayesha K.", location: "Lahore, PK", title: "Transformed my living room!", body: "The print quality is incredible and it fit my split AC perfectly. Guests can't stop asking where I got it from." },
          { img: pdpReview2, name: "Rohan M.", location: "Mumbai, IN", title: "Looks even better in person", body: "Colors are super vibrant and applying it was so easy with the squeegee they included. Worth every rupee." },
          { img: pdpReview3, name: "Priya S.", location: "Karachi, PK", title: "Packaging was so cute 🎁", body: "Delivery was quick and the Sticksy parcel felt like opening a gift. Sticker is premium quality — highly recommend!" },
        ],
        faqs: [
          { q: "Will this sticker fit my AC?", a: "Our designs fit standard 1–2 ton split AC indoor units. For custom sizes, just share your AC dimensions after ordering and we'll resize it for free." },
          { q: "Is it easy to apply?", a: "Yes! Each order includes a squeegee and a simple guide. Most customers apply it in under 10 minutes." },
          { q: "Will it damage my AC paint?", a: "Not at all. We use premium removable vinyl that peels off cleanly without leaving residue." },
          { q: "How long does shipping take?", a: "2–4 days across Pakistan, 7–14 days internationally." },
          { q: "What if my sticker arrives damaged?", a: "We offer a 30-day replacement guarantee. Just send us a photo and we'll ship a fresh one." },
        ],
        ctaShort: node.title.split(" ").slice(0, 3).join(" "),
      };

  return (
    <div className="min-h-screen bg-background">
      {isStandalone ? <MinimalHeader /> : <Header />}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
        {!isStandalone && (
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Back to shop
          </Link>
        )}

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
                {copy.badge}
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
              {copy.featureBullets.map(({ icon: Icon, text }) => (
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

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="inline-flex items-center rounded-md border border-input bg-background h-12">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-r-none"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center text-base font-medium" aria-live="polite">
                  {quantity}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-l-none"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                className="h-12 text-base sm:flex-1"
                onClick={handleBuyNow}
                disabled={isLoading || !selectedVariant?.availableForSale}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : !selectedVariant?.availableForSale ? (
                  "Sold out"
                ) : (
                  "Buy now"
                )}
              </Button>
            </div>


            {/* Info blocks */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <PackageCheck className="h-4 w-4 text-primary" /> What's included
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {copy.included}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Droplets className="h-4 w-4 text-primary" /> Care instructions
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {copy.care}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Info className="h-4 w-4 text-primary" /> Note
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {copy.note}
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
            {isWaterTank ? "From order to your rooftop" : "From order to your wall"}
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {copy.timelineSteps.map((step, i) => {
              const date = i === 0 ? fmt(today) : i === 1 ? fmt(tomorrow) : fmt(delivery);
              return (
                <div key={step.title} className="relative rounded-xl border bg-card p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-3 text-xs font-medium text-primary">
                    {i + 1}. {date}
                  </div>
                  <h3 className="mt-1 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Art that captivates */}
        <section className="mt-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                {copy.sectionTitle}
              </h2>
              <p className="mt-3 text-muted-foreground">
                {copy.sectionSub}
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {copy.sectionFeatures.map((f) => (
                  <div key={f.title} className="flex gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{f.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
                {images[0]?.node && (
                  <img
                    src={images[0].node.url}
                    alt={images[0].node.altText ?? node.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Transform decor — stat bars */}
        <section className="mt-20 rounded-2xl border bg-card p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                {copy.statsTitle}
              </h2>
              <p className="mt-3 text-muted-foreground">
                {copy.statsSub}
              </p>
            </div>
            <div className="space-y-5">
              {copy.stats.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{s.label}</span>
                    <span className="font-semibold text-primary">{s.pct}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="mt-20">
          <h2 className="text-center text-2xl sm:text-3xl font-semibold tracking-tight">
            What sets the {node.title} apart
          </h2>
          <p className="mt-3 text-center text-muted-foreground max-w-2xl mx-auto">
            {copy.compareSub}
          </p>
          <div className="mt-8 overflow-hidden rounded-2xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-4 text-left font-medium"></th>
                  <th className="px-4 py-4 text-center font-semibold text-primary">
                    {node.title}
                  </th>
                  <th className="px-4 py-4 text-center font-medium text-muted-foreground">
                    Others
                  </th>
                </tr>
              </thead>
              <tbody>
                {copy.compareRows.map((row, i) => (
                  <tr key={row} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-4 py-3.5 font-medium">{row}</td>
                    <td className="px-4 py-3.5 text-center">
                      <Check className="mx-auto h-5 w-5 text-primary" />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <X className="mx-auto h-5 w-5 text-muted-foreground/50" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 text-center">
            <Button size="lg" onClick={handleBuyNow} disabled={isLoading || !selectedVariant?.availableForSale}>
              Try the {copy.ctaShort}
            </Button>
          </div>
        </section>

        {/* Reviews */}
        <section className="mt-20">
          <h2 className="text-center text-2xl sm:text-3xl font-semibold tracking-tight">
            {copy.reviewsTitle}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Real photos shared by Sticksy customers.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {copy.reviews.map((r) => (
              <div key={r.name} className="overflow-hidden rounded-2xl border bg-card">
                <img
                  src={r.img}
                  alt={`${r.name} review photo`}
                  loading="lazy"
                  width={800}
                  height={800}
                  className="h-64 w-full object-cover"
                />
                <div className="p-5">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-2 font-semibold">{r.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                  <p className="mt-3 text-xs font-medium">
                    {r.name} <span className="text-muted-foreground">· {r.location}</span>
                  </p>
                </div>
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
            {copy.faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* You may also like */}
        {!isStandalone && related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-center text-2xl sm:text-3xl font-semibold tracking-tight">
              You may also like
            </h2>
            <div className="mt-8 grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.node.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      {!isStandalone && <Footer />}
    </div>
  );
}
