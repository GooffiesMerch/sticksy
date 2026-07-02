import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { COLLECTIONS } from "@/lib/collections";
import { hostedAssetUrl } from "@/lib/deployment";
import logo from "@/assets/sticksy-logo.png.asset.json";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="space-y-3">
          <img
            src={hostedAssetUrl(logo.url)}
            alt="Sticksy"
            width={180}
            height={80}
            loading="lazy"
            className="h-12 w-auto max-w-[160px] object-contain sm:h-14 sm:max-w-[180px] md:h-16"
          />
          <p className="text-sm text-muted-foreground">
            Premium AC stickers & custom skins. Transform your room, one wall unit at a time.
          </p>
        </div>



        <div>
          <h4 className="mb-3 text-sm font-semibold">Collections</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {COLLECTIONS.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/collections/$slug"
                  params={{ slug: c.slug }}
                  className="hover:text-foreground"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">All products</Link></li>
            <li><a href="#how-to" className="hover:text-foreground">How to apply</a></li>
            <li><a href="#reviews" className="hover:text-foreground">Reviews</a></li>
            <li><a href="#custom" className="hover:text-foreground">Custom sticker</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4" /> hello@sticksy.shop</li>
            <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4" /> +92 335 5812911</li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4" /> Lahore, Pakistan</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Sticksy. All rights reserved.
      </div>
    </footer>
  );
}
