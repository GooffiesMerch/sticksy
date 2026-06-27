import { Link } from "@tanstack/react-router";
import { CartDrawer } from "./CartDrawer";
import { COLLECTIONS } from "@/lib/collections";
import logo from "@/assets/sticksy-logo.png.asset.json";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto grid h-14 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:h-16 sm:px-6 md:flex md:justify-between md:gap-4">
        <Link to="/" className="flex min-w-0 items-center" aria-label="Sticksy home">
          <img
            src={logo.url}
            alt="Sticksy"
            width={140}
            height={48}
            className="h-8 w-auto max-w-[140px] object-contain sm:h-10 sm:max-w-none"
          />
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
