import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Search } from "lucide-react";
import { CartDrawer } from "./CartDrawer";
import { COLLECTIONS } from "@/lib/collections";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { hostedAssetUrl } from "@/lib/deployment";
import logo from "@/assets/sticksy-logo.png.asset.json";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center" aria-label="Sticksy home">
          <img
            src={hostedAssetUrl(logo.url)}
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

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild aria-label="Search">
            <Link to="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <CartDrawer />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1 text-base">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 hover:bg-muted"
                >
                  Shop
                </Link>
                <Link
                  to="/search"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 hover:bg-muted"
                >
                  Search
                </Link>
                {COLLECTIONS.map((c) => (
                  <Link
                    key={c.slug}
                    to="/collections/$slug"
                    params={{ slug: c.slug }}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 hover:bg-muted"
                  >
                    {c.name}
                  </Link>
                ))}
                <a
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 hover:bg-muted"
                >
                  Contact
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
