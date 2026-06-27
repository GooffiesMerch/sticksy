import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowRight, Star, Sparkles, Truck, ShieldCheck, Send, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CustomStickerSection } from "@/components/CustomStickerSection";
import { fetchProducts } from "@/lib/shopify";
import { COLLECTIONS } from "@/lib/collections";
import { toast } from "sonner";

import heroImg from "@/assets/hero-porsche.webp.asset.json";
import howto1 from "@/assets/howto-1.jpg";
import howto2 from "@/assets/howto-2.jpg";
import applied1 from "@/assets/applied-1.jpg";
import tutorialVideo from "@/assets/tutorial-apply.mp4.asset.json";
import review1 from "@/assets/review-1.jpg";
import review2 from "@/assets/review-2.jpg";
import review3 from "@/assets/review-3.jpg";

const productsQueryOptions = queryOptions({
  queryKey: ["products"],
  queryFn: () => fetchProducts(100),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sticksy — Premium AC Stickers & Custom Skins" },
      {
        name: "description",
        content:
          "Transform your air conditioner with premium vinyl stickers. Anime, cars, Marvel, football & custom designs. Easy to apply.",
      },
      { property: "og:title", content: "Sticksy — Premium AC Stickers" },
      {
        property: "og:description",
        content: "Premium AC stickers & custom skins. Easy to apply, made to last.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions),
  component: Index,
});

function Index() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const [showAll, setShowAll] = useState(false);
  const visible = useMemo(() => (showAll ? products : products.slice(0, 8)), [products, showAll]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> New designs every week
            </span>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Give your AC a <span className="text-primary">personality.</span>
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Premium vinyl stickers crafted for split & window ACs. Anime, supercars, heroes — or
              your own artwork.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href="#products">Shop now <ArrowRight className="ml-1 h-4 w-4" /></a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#custom">Custom sticker</a>
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Free shipping over Rs. 2500</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> 30-day replacement</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-2xl" />
            <img
              src={heroImg.url}
              alt="Air conditioner with custom anime sticker in a modern living room"
              width={1600}
              height={1024}
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">Catalog</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              Best-selling stickers
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {products.length} designs available
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed py-20 text-center">
            <p className="font-medium">No products yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a product to populate the storefront.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {visible.map((p) => (
                <ProductCard key={p.node.id} product={p} />
              ))}
            </div>
            {products.length > 8 && (
              <div className="mt-10 flex justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowAll((v) => !v)}
                >
                  {showAll ? "Show less" : "Explore more"}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* HOW TO APPLY */}
      <section id="how-to" className="bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              How it works
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Apply in minutes
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <img src={howto1} alt="Peel off the backing" loading="lazy" className="aspect-square w-full rounded-2xl object-cover" />
              <h3 className="text-lg font-semibold">1. Peel & align</h3>
              <p className="text-sm text-muted-foreground">
                Clean the AC surface, peel the backing, and align the sticker with the corners.
              </p>
            </div>
            <div className="space-y-3">
              <img src={howto2} alt="Smooth with a squeegee" loading="lazy" className="aspect-square w-full rounded-2xl object-cover" />
              <h3 className="text-lg font-semibold">2. Smooth & stick</h3>
              <p className="text-sm text-muted-foreground">
                Use the included squeegee to push out bubbles from the centre outwards.
              </p>
            </div>
            <div className="space-y-3">
              <img src={applied1} alt="Floral sticker applied on AC" loading="lazy" className="aspect-square w-full rounded-2xl object-cover" />
              <h3 className="text-lg font-semibold">3. Enjoy your new vibe</h3>
              <p className="text-sm text-muted-foreground">
                That's it — instant upgrade to any boring white AC unit.
              </p>
            </div>
          </div>
          <div className="mt-12 flex justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="default">
                  <PlayCircle className="mr-2 h-5 w-5" /> See tutorial
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>How to apply your AC sticker</DialogTitle>
                </DialogHeader>
                <div className="overflow-hidden rounded-lg bg-black">
                  <video
                    src={tutorialVideo.url}
                    controls
                    autoPlay
                    playsInline
                    className="aspect-video w-full"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Shop by theme
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Collections</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.slug}
              to="/collections/$slug"
              params={{ slug: c.slug }}
              className="group flex flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-muted">
                <img src={c.logo} alt={c.name} className="h-24 w-24 object-contain" loading="lazy" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.tagline}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100">
                Explore <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              Happy homes
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Loved across South Asia
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                img: review1,
                name: "The Khan Family",
                city: "Karachi",
                text: "Whole family loves the floral design. Our living room AC finally looks like part of the décor.",
              },
              {
                img: review2,
                name: "Ayesha R.",
                city: "Lahore",
                text: "Got the anime sticker for my bedroom AC. Quality is amazing and it was so easy to apply!",
              },
              {
                img: review3,
                name: "Rohit M.",
                city: "Delhi",
                text: "Ordered a Ferrari sticker, fits perfectly on my 1.5 ton AC. Friends keep asking where I got it.",
              },
            ].map((r) => (
              <div key={r.name} className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
                <img src={r.img} alt={r.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-3 flex-1 text-sm text-foreground">“{r.text}”</p>
                  <div className="mt-4 text-sm">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-muted-foreground">{r.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOM */}
      <CustomStickerSection />

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Get in touch</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Talk to us</h2>
          <p className="mt-3 text-muted-foreground">
            Questions about a design, sizing, or bulk orders? Send a note.
          </p>
        </div>
        <form
          className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Thanks — we'll get back to you within 24 hours.");
            (e.target as HTMLFormElement).reset();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input required name="name" placeholder="Your name" />
            <Input required type="email" name="email" placeholder="Email address" />
          </div>
          <Input name="subject" placeholder="Subject" />
          <Textarea required name="message" placeholder="Your message" rows={5} />
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Send message <Send className="ml-1 h-4 w-4" />
          </Button>
        </form>
      </section>

      <Footer />
    </div>
  );
}
