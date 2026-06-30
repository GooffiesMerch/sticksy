import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts } from "@/lib/shopify";
import { z } from "zod";

const searchSchema = z.object({ q: z.string().optional().default("") });

const productsQueryOptions = queryOptions({
  queryKey: ["products"],
  queryFn: () => fetchProducts(100),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Search — Sticksy" },
      { name: "description", content: "Search AC stickers at Sticksy." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(productsQueryOptions);
  },
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [term, setTerm] = useState(q ?? "");
  const { data: products } = useSuspenseQuery(productsQueryOptions);

  const needle = (q ?? "").trim().toLowerCase();
  const filtered = needle
    ? products.filter((p) => p.node.title.toLowerCase().includes(needle))
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Back to shop</Link>
        </Button>

        <h1 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl">Search</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ search: { q: term.trim() } });
          }}
          className="mb-10 flex gap-2"
        >
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search stickers, e.g. Pikachu, Porsche, Marvel..."
              className="pl-9"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        {!needle ? (
          <p className="text-muted-foreground">Type a search term to find stickers.</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed py-20 text-center">
            <p className="font-medium">No results for "{q}"</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different keyword.</p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "result" : "results"} for "{q}"
            </p>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => <ProductCard key={p.node.id} product={p} />)}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
