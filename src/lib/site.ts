/** Paths shared by the root production site and the isolated /BCN preview. */
export const SITE_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export function sitePath(path: string) { return `${SITE_BASE}${path.startsWith("/") ? path : `/${path}`}`; }
export const assetPath = sitePath;
export function currentSitePath() {
  const path = window.location.pathname;
  return (path.toLowerCase().startsWith(`${SITE_BASE.toLowerCase()}/`) || path.toLowerCase() === SITE_BASE.toLowerCase() ? path.slice(SITE_BASE.length) : path).replace(/\/$/, "") || "/";
}
export const siteCopy = {
  es: { sponsors: "Patrocinadores", bio: "Biografía", previous: "Artistas anteriores", next: "Más artistas", map: "Ver ubicación" },
  ca: { sponsors: "Patrocinadors", bio: "Biografia", previous: "Artistes anteriors", next: "Més artistes", map: "Veure ubicació" },
  en: { sponsors: "Sponsors", bio: "Biography", previous: "Previous artists", next: "More artists", map: "View location" },
  fr: { sponsors: "Partenaires", bio: "Biographie", previous: "Artistes précédents", next: "Autres artistes", map: "Voir le lieu" },
  it: { sponsors: "Sponsor", bio: "Biografia", previous: "Artisti precedenti", next: "Altri artisti", map: "Vedi il luogo" },
  de: { sponsors: "Sponsoren", bio: "Biografie", previous: "Vorherige Künstler", next: "Weitere Künstler", map: "Standort ansehen" }
};
