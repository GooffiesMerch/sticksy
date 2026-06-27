import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Upload, Sparkles, ShoppingCart, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { fetchProductByHandle } from "@/lib/shopify";
import acMockup from "@/assets/ac-blank-mockup.jpg";

export function CustomStickerSection() {
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Max 8MB image please");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleAdd = async () => {
    setBusy(true);
    try {
      const product = await fetchProductByHandle("custom-ac-sticker");
      const variant = product?.node.variants.edges[0]?.node;
      if (!product || !variant) {
        toast.error("Custom sticker product not available right now");
        return;
      }
      await addItem({
        product,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions ?? [],
      });
      toast.success("Custom sticker added — we'll email you for the artwork");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="custom" className="bg-gradient-to-b from-background to-muted/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Make it yours
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Custom AC Stickers
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Choose a ready-made design, upload your own artwork, or preview it on your AC before
            ordering.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Step 1 */}
          <div className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Simple Custom AC Sticker</h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">
              Pick from our pre-made custom layouts. Fast turnaround, premium vinyl finish.
            </p>
            <Button asChild className="mt-6">
              <Link to="/product/$handle" params={{ handle: "custom-ac-sticker" }}>
                Browse custom
              </Link>
            </Button>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Upload className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Upload Your Sticker</h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">
              Send us your artwork (PNG / JPG up to 8MB). We'll print it on durable AC-grade vinyl.
            </p>
            <label className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
              <ImagePlus className="h-4 w-4" />
              {preview ? "Replace image" : "Choose image"}
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
            </label>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold">Preview & Add to Cart</h3>
            <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-lg bg-white">
              <img src={acMockup} alt="AC mockup" className="absolute inset-0 h-full w-full object-cover" />
              {preview ? (
                <img
                  src={preview}
                  alt="Your sticker on AC"
                  className="absolute object-cover"
                  style={{ left: "25%", top: "29%", width: "50%", height: "33%" }}
                />
              ) : (
                <p className="absolute inset-x-0 bottom-3 px-4 text-center text-xs text-muted-foreground">
                  Upload artwork to preview it on the AC.
                </p>
              )}
            </div>
            <Button className="mt-6" onClick={handleAdd} disabled={!preview || busy}>
              {busy ? "Adding..." : "Add to cart"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
