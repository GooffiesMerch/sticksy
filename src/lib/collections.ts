import colCars from "@/assets/col-cars.png";
import colFootball from "@/assets/col-football.png";
import colAnime from "@/assets/col-anime.png";
import colMarvel from "@/assets/col-marvel.png";

export interface CollectionDef {
  slug: string;
  name: string;
  tagline: string;
  logo: string;
  /** Keywords matched against product title (case insensitive). */
  keywords: string[];
}

export const COLLECTIONS: CollectionDef[] = [
  {
    slug: "cars",
    name: "Cars",
    tagline: "Supercars, race liveries & speed.",
    logo: colCars,
    keywords: ["car", "porsche", "ferrari", "lambo", "gtr", "bmw", "audi"],
  },
  {
    slug: "football",
    name: "Football",
    tagline: "For the matchday loyalists.",
    logo: colFootball,
    keywords: ["football", "soccer", "messi", "ronaldo", "fifa", "barcelona", "madrid"],
  },
  {
    slug: "anime",
    name: "Anime",
    tagline: "Manga, anime & otaku icons.",
    logo: colAnime,
    keywords: [
      "anime",
      "manga",
      "naruto",
      "one piece",
      "dragon ball",
      "dbz",
      "goku",
      "doraemon",
      "doremon",
      "pikachu",
      "kirby",
      "hello kitty",
      "attack on titan",
      "jujutsu",
      "sukuna",
      "courage",
    ],
  },
  {
    slug: "marvel",
    name: "Marvel & Heroes",
    tagline: "Heroes, villains & legends.",
    logo: colMarvel,
    keywords: ["marvel", "batman", "batwoman", "joker", "spider", "iron", "hulk", "thor", "avenger"],
  },
];

export function getCollection(slug: string) {
  return COLLECTIONS.find((c) => c.slug === slug) ?? null;
}

export function matchesCollection(title: string, c: CollectionDef) {
  const t = title.toLowerCase();
  return c.keywords.some((k) => t.includes(k));
}
