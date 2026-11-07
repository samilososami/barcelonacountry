/** This branch is a standalone, non-transactional design preview. */
export const SITE_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export function sitePath(path: string) { return `${SITE_BASE}${path.startsWith("/") ? path : `/${path}`}`; }
export const assetPath = sitePath;
export function currentSitePath() {
  const path = window.location.pathname;
  return (path.toLowerCase().startsWith(`${SITE_BASE.toLowerCase()}/`) || path.toLowerCase() === SITE_BASE.toLowerCase() ? path.slice(SITE_BASE.length) : path).replace(/\/$/, "") || "/";
}
export const previewCopy = {
  es: { sponsors: "Patrocinadores", note: "Formulario de prueba · No se envían datos.", done: "Prueba completada. No se ha enviado ninguna suscripción.", bio: "Biografía", previous: "Artistas anteriores", next: "Más artistas", map: "Ver ubicación" },
  ca: { sponsors: "Patrocinadors", note: "Formulari de prova · No s'envien dades.", done: "Prova completada. No s'ha enviat cap subscripció.", bio: "Biografia", previous: "Artistes anteriors", next: "Més artistes", map: "Veure ubicació" },
  en: { sponsors: "Sponsors", note: "Preview form · No data is sent.", done: "Preview complete. No subscription has been sent.", bio: "Biography", previous: "Previous artists", next: "More artists", map: "View location" },
  fr: { sponsors: "Partenaires", note: "Formulaire de démonstration · Aucune donnée envoyée.", done: "Démonstration terminée. Aucun abonnement n'a été envoyé.", bio: "Biographie", previous: "Artistes précédents", next: "Autres artistes", map: "Voir le lieu" },
  it: { sponsors: "Sponsor", note: "Modulo di prova · Nessun dato viene inviato.", done: "Prova completata. Nessuna iscrizione è stata inviata.", bio: "Biografia", previous: "Artisti precedenti", next: "Altri artisti", map: "Vedi il luogo" },
  de: { sponsors: "Sponsoren", note: "Testformular · Es werden keine Daten gesendet.", done: "Test abgeschlossen. Es wurde keine Anmeldung gesendet.", bio: "Biografie", previous: "Vorherige Künstler", next: "Weitere Künstler", map: "Standort ansehen" }
};
