import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { CartDrawer } from "./CartDrawer";
import { Button } from "@/components/ui/button";
import { hostedAssetUrl } from "@/lib/deployment";
import logo from "@/assets/sticksy-logo.png.asset.json";

export function MinimalHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <CartDrawer />
        <Button variant="ghost" size="icon" asChild aria-label="Search">
          <Link to="/search">
            <Search className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
