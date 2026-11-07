/** This branch is a standalone, non-transactional design preview. */
export const SITE_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export function sitePath(path: string) { return `${SITE_BASE}${path.startsWith("/") ? path : `/${path}`}`; }
export const assetPath = sitePath;
export function currentSitePath() {
  const path = window.location.pathname;
  return (path.startsWith(`${SITE_BASE}/`) || path === SITE_BASE ? path.slice(SITE_BASE.length) : path).replace(/\/$/, "") || "/";
}
export const previewCopy = {
  es: { note: "Formulario de prueba · No se envían datos.", done: "Prueba completada. No se ha enviado ninguna suscripción.", bio: "Biografía", previous: "Artistas anteriores", next: "Más artistas", map: "Ver ubicación" },
  ca: { note: "Formulari de prova · No s'envien dades.", done: "Prova completada. No s'ha enviat cap subscripció.", bio: "Biografia", previous: "Artistes anteriors", next: "Més artistes", map: "Veure ubicació" },
  en: { note: "Preview form · No data is sent.", done: "Preview complete. No subscription has been sent.", bio: "Biography", previous: "Previous artists", next: "More artists", map: "View location" },
  fr: { note: "Formulaire de démonstration · Aucune donnée envoyée.", done: "Démonstration terminée. Aucun abonnement n'a été envoyé.", bio: "Biographie", previous: "Artistes précédents", next: "Autres artistes", map: "Voir le lieu" },
  it: { note: "Modulo di prova · Nessun dato viene inviato.", done: "Prova completata. Nessuna iscrizione è stata inviata.", bio: "Biografia", previous: "Artisti precedenti", next: "Altri artisti", map: "Vedi il luogo" },
  de: { note: "Testformular · Es werden keine Daten gesendet.", done: "Test abgeschlossen. Es wurde keine Anmeldung gesendet.", bio: "Biografie", previous: "Vorherige Künstler", next: "Weitere Künstler", map: "Standort ansehen" }
};
