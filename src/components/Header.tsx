import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Menu, Search } from "lucide-react";
import { CartDrawer } from "./CartDrawer";
import { COLLECTIONS } from "@/lib/collections";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/search", search: { q } as never });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <div className="flex items-center gap-1">
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
            <SheetContent side="left" className="w-72">
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

        <form onSubmit={onSubmit} className="relative w-full max-w-[180px] sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            aria-label="Search products"
            className="pl-9"
          />
        </form>
      </div>
    </header>
  );
}
