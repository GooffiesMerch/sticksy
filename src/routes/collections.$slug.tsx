import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts } from "@/lib/shopify";
import { getCollection, matchesCollection } from "@/lib/collections";

const productsQueryOptions = queryOptions({
  queryKey: ["products"],
  queryFn: () => fetchProducts(100),
});

export const Route = createFileRoute("/collections/$slug")({
  head: ({ params }) => {
    const c = getCollection(params.slug);
    const title = c ? `${c.name} AC Stickers — Sticksy` : "Collection — Sticksy";
    const description = c
      ? `Shop our ${c.name} AC sticker collection at Sticksy — ${c.tagline} Premium vinyl, easy to apply, shipped worldwide.`
      : "Shop AC stickers by collection at Sticksy — premium vinyl, easy to apply, shipped worldwide.";
    const url = `https://sticksy.lovable.app/collections/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: c
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                name: `${c.name} AC Stickers`,
                description,
                url,
              }),
            },
          ]
        : [],
    };
  },
  loader: async ({ context, params }) => {
    if (!getCollection(params.slug)) throw notFound();
    await context.queryClient.ensureQueryData(productsQueryOptions);
  },
  component: CollectionPage,
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const c = getCollection(slug)!;
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const filtered = products.filter((p) => matchesCollection(p.node.title, c));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Back to shop</Link>
        </Button>

        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-muted">
            <img src={c.logo} alt={c.name} className="h-20 w-20 object-contain" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{c.name}</h1>
          <p className="max-w-xl text-muted-foreground">{c.tagline}</p>
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "design" : "designs"}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed py-20 text-center">
            <p className="font-medium">No designs in this collection yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Check back soon — new drops weekly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => <ProductCard key={p.node.id} product={p} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
