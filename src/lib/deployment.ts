const LOVABLE_PUBLIC_ORIGIN = (
  import.meta.env.VITE_LOVABLE_PUBLIC_ORIGIN || "https://sticksy.lovable.app"
).replace(/\/$/, "");

export function hostedAssetUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/__l5e/")) return `${LOVABLE_PUBLIC_ORIGIN}${path}`;
  return path;
}

export function chatApiUrl() {
  if (typeof window === "undefined") return "/api/chat";
  if (window.location.hostname.endsWith("lovable.app")) return "/api/chat";
  return `${LOVABLE_PUBLIC_ORIGIN}/api/chat`;
}