import { Link } from "@tanstack/react-router";
import { CartDrawer } from "./CartDrawer";
import { COLLECTIONS } from "@/lib/collections";
import logo from "@/assets/sticksy-logo.png.asset.json";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center" aria-label="Sticksy home">
          <img src={logo.url} alt="Sticksy" width={140} height={48} className="h-10 w-auto object-contain" />
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            Shop
          </Link>
          {COLLECTIONS.map((c) => (
            <Link
              key={c.slug}
              to="/collections/$slug"
              params={{ slug: c.slug }}
              className="text-muted-foreground hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
          <a href="#contact" className="text-muted-foreground hover:text-foreground">
            Contact
          </a>
        </nav>
        <CartDrawer />
      </div>
    </header>
  );
}
