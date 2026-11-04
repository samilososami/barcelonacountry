import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { COOKIE_CONSENT_KEY, createCookieConsent, parseCookieConsent, type CookieConsent } from "../../shared/cookie-consent.mjs";
import type { NewsLanguage } from "../newsletters/copy";
import "./cookie-consent.css";

type CookieCopy = {
  title: string; intro: string; accept: string; reject: string; configure: string; preferences: string;
  close: string; necessary: string; necessaryText: string; always: string; maps: string; mapsText: string;
  save: string; revoke: string; privacy: string; policy: string; storage: string; details: string;
};

const copy: Record<NewsLanguage, CookieCopy> = {
  es: {
    title: "Cookies", intro: "Guardamos tus preferencias. Google Maps solo se carga si lo autorizas y puede utilizar cookies de Google.",
    accept: "Aceptar opcionales", reject: "Rechazar opcionales", configure: "Configurar", preferences: "Preferencias de cookies",
    close: "Cerrar sin cambiar", necessary: "Almacenamiento necesario", necessaryText: "Recuerda tu elección de privacidad durante 180 días y el idioma elegido. El acceso al panel de administración utiliza almacenamiento del navegador para mantener la sesión. No se utiliza para publicidad.", always: "Siempre activo",
    maps: "Google Maps", mapsText: "Permite cargar el mapa interactivo de Google. Google recibe tu dirección IP y puede utilizar cookies conforme a sus políticas. Puedes retirar este permiso cuando quieras; el mapa se dejará de cargar.",
    save: "Guardar preferencias", revoke: "Retirar permisos opcionales", privacy: "Política de privacidad", policy: "Política de cookies", storage: "El navegador no permite guardar tu elección. Se aplicará en esta página, pero tendrás que elegir de nuevo al recargar.", details: "No incorporamos herramientas de analítica ni publicidad. La única opción de terceros de este panel es Google Maps. Rechazarlo no impide utilizar el resto de la web."
  },
  ca: {
    title: "Galetes", intro: "Desem les teves preferències. Google Maps només es carrega si ho autoritzes i pot utilitzar galetes de Google.",
    accept: "Accepta les opcionals", reject: "Rebutja les opcionals", configure: "Configura", preferences: "Preferències de galetes",
    close: "Tanca sense canviar", necessary: "Emmagatzematge necessari", necessaryText: "Recorda la teva elecció de privacitat durant 180 dies i l'idioma triat. L'accés al panell d'administració utilitza emmagatzematge del navegador per mantenir la sessió. No es fa servir per a publicitat.", always: "Sempre actiu",
    maps: "Google Maps", mapsText: "Permet carregar el mapa interactiu de Google. Google rep la teva adreça IP i pot fer servir galetes segons les seves polítiques. Pots retirar el permís quan vulguis; el mapa es deixarà de carregar.",
    save: "Desa les preferències", revoke: "Retira els permisos opcionals", privacy: "Política de privacitat", policy: "Política de galetes", storage: "El navegador no permet desar la teva elecció. S'aplicarà en aquesta pàgina, però hauràs de tornar a triar quan la recarreguis.", details: "No incorporem eines d'analítica ni publicitat. L'única opció de tercers d'aquest panell és Google Maps. Rebutjar-la no impedeix utilitzar la resta de la web."
  },
  en: {
    title: "Cookies", intro: "We save your preferences. Google Maps only loads with your permission and may use Google cookies.",
    accept: "Accept optional", reject: "Reject optional", configure: "Configure", preferences: "Cookie preferences",
    close: "Close without changes", necessary: "Necessary storage", necessaryText: "Remembers your privacy choice for 180 days and your chosen language. The administration panel uses browser storage to keep administrators signed in. It is not used for advertising.", always: "Always active",
    maps: "Google Maps", mapsText: "Allows Google's interactive map to load. Google receives your IP address and may use cookies under its policies. You can withdraw permission at any time; the map will stop loading.",
    save: "Save preferences", revoke: "Withdraw optional permissions", privacy: "Privacy policy", policy: "Cookie policy", storage: "Your browser cannot save this choice. It applies on this page, but you will need to choose again after reloading.", details: "We do not embed analytics or advertising tools. Google Maps is the only third-party option in this panel. Rejecting it does not prevent you from using the rest of the website."
  },
  fr: {
    title: "Cookies", intro: "Nous mémorisons vos préférences. Google Maps ne se charge qu'avec votre accord et peut utiliser des cookies Google.",
    accept: "Accepter les facultatifs", reject: "Refuser les facultatifs", configure: "Configurer", preferences: "Préférences des cookies",
    close: "Fermer sans modifier", necessary: "Stockage nécessaire", necessaryText: "Mémorise votre choix de confidentialité pendant 180 jours et la langue choisie. L'accès au panneau d'administration utilise le stockage du navigateur pour maintenir la connexion. Il n'est pas utilisé à des fins publicitaires.", always: "Toujours actif",
    maps: "Google Maps", mapsText: "Permet de charger la carte interactive de Google. Google reçoit votre adresse IP et peut utiliser des cookies conformément à ses politiques. Vous pouvez retirer votre autorisation à tout moment ; la carte ne sera plus chargée.",
    save: "Enregistrer les préférences", revoke: "Retirer les autorisations facultatives", privacy: "Politique de confidentialité", policy: "Politique de cookies", storage: "Votre navigateur ne peut pas enregistrer ce choix. Il s'applique sur cette page, mais vous devrez choisir à nouveau après son rechargement.", details: "Nous n'intégrons pas d'outils d'analyse ni de publicité. Google Maps est la seule option tierce de ce panneau. Le refuser n'empêche pas d'utiliser le reste du site."
  },
  it: {
    title: "Cookie", intro: "Salviamo le tue preferenze. Google Maps si carica solo con il tuo consenso e può utilizzare cookie di Google.",
    accept: "Accetta gli opzionali", reject: "Rifiuta gli opzionali", configure: "Configura", preferences: "Preferenze dei cookie",
    close: "Chiudi senza modifiche", necessary: "Archiviazione necessaria", necessaryText: "Ricorda la tua scelta sulla privacy per 180 giorni e la lingua scelta. Il pannello di amministrazione utilizza l'archiviazione del browser per mantenere l'accesso. Non viene usata per la pubblicità.", always: "Sempre attiva",
    maps: "Google Maps", mapsText: "Consente di caricare la mappa interattiva di Google. Google riceve il tuo indirizzo IP e può utilizzare cookie secondo le proprie politiche. Puoi revocare il permesso in qualsiasi momento; la mappa non verrà più caricata.",
    save: "Salva preferenze", revoke: "Revoca i permessi opzionali", privacy: "Informativa sulla privacy", policy: "Informativa sui cookie", storage: "Il browser non può salvare questa scelta. Verrà applicata in questa pagina, ma dovrai scegliere di nuovo dopo averla ricaricata.", details: "Non integriamo strumenti di analisi o pubblicità. Google Maps è l'unica opzione di terze parti in questo pannello. Rifiutarla non impedisce di utilizzare il resto del sito."
  },
  de: {
    title: "Cookies", intro: "Wir speichern deine Einstellungen. Google Maps wird nur mit deiner Zustimmung geladen und kann Google-Cookies verwenden.",
    accept: "Optionale akzeptieren", reject: "Optionale ablehnen", configure: "Einstellen", preferences: "Cookie-Einstellungen",
    close: "Ohne Änderungen schließen", necessary: "Notwendiger Speicher", necessaryText: "Speichert deine Datenschutzentscheidung für 180 Tage und deine Sprachauswahl. Der Verwaltungsbereich nutzt den Browserspeicher, um die Anmeldung aufrechtzuerhalten. Dieser wird nicht für Werbung verwendet.", always: "Immer aktiv",
    maps: "Google Maps", mapsText: "Erlaubt das Laden der interaktiven Google-Karte. Google erhält deine IP-Adresse und kann nach seinen Richtlinien Cookies verwenden. Du kannst die Erlaubnis jederzeit widerrufen; die Karte wird dann nicht mehr geladen.",
    save: "Einstellungen speichern", revoke: "Optionale Erlaubnisse widerrufen", privacy: "Datenschutzerklärung", policy: "Cookie-Richtlinie", storage: "Dein Browser kann diese Wahl nicht speichern. Sie gilt auf dieser Seite, muss aber nach dem Neuladen erneut getroffen werden.", details: "Wir binden keine Analyse- oder Werbewerkzeuge ein. Google Maps ist die einzige Drittanbieteroption in diesem Bereich. Ohne Zustimmung kannst du die übrige Website weiterhin nutzen."
  }
};

type ConsentContext = { mapsAllowed: boolean; openPreferences: () => void; language: NewsLanguage };
const Context = createContext<ConsentContext | null>(null);

function readChoice(): { consent: CookieConsent | null; unavailable: boolean } {
  if (typeof window === "undefined") return { consent: null, unavailable: false };
  try { return { consent: parseCookieConsent(window.localStorage.getItem(COOKIE_CONSENT_KEY)), unavailable: false }; }
  catch { return { consent: null, unavailable: true }; }
}

export function CookieConsentProvider({ language, children }: { language: NewsLanguage; children: ReactNode }) {
  const [initial] = useState(readChoice);
  const [consent, setConsent] = useState(initial.consent);
  const [storageUnavailable, setStorageUnavailable] = useState(initial.unavailable);
  const [isOpen, setIsOpen] = useState(false);
  const [draftMaps, setDraftMaps] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const focusReturnRef = useRef<HTMLElement | null>(null);
  const t = copy[language];

  const openPreferences = useCallback(() => {
    focusReturnRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDraftMaps(consent?.maps === true);
    setIsOpen(true);
  }, [consent]);

  const closePreferences = useCallback(() => setIsOpen(false), []);

  const save = useCallback((maps: boolean) => {
    const choice = createCookieConsent(maps);
    // Update in-memory consent even if the user has disabled persistent storage.
    setConsent(choice);
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(choice));
      setStorageUnavailable(false);
    } catch { setStorageUnavailable(true); }
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) {
      dialog.close();
      if (focusReturnRef.current?.isConnected) focusReturnRef.current.focus({ preventScroll: true });
    }
  }, [isOpen]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== COOKIE_CONSENT_KEY && event.key !== null) return;
      const choice = parseCookieConsent(event.newValue);
      setConsent(choice);
      setDraftMaps(choice?.maps === true);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!consent) return;
    let timer: ReturnType<typeof setTimeout>;
    const expire = () => {
      const remaining = consent.expiresAt - Date.now();
      if (remaining <= 0) { setConsent(null); setDraftMaps(false); return; }
      // Recheck at least daily; avoid setTimeout's signed 32-bit limit.
      clearTimeout(timer);
      timer = setTimeout(expire, Math.min(remaining, 24 * 60 * 60 * 1000));
    };
    expire();
    document.addEventListener("visibilitychange", expire);
    return () => { clearTimeout(timer); document.removeEventListener("visibilitychange", expire); };
  }, [consent]);

  const value = useMemo(() => ({ mapsAllowed: consent?.maps === true, openPreferences, language }), [consent, openPreferences, language]);

  return <Context.Provider value={value}>
    {children}
    {!consent && <section className="bcf-cookie-banner" aria-label={t.preferences}>
      <div className="bcf-cookie-banner-copy"><h2>{t.title}</h2><p>{t.intro}</p></div>
      <div className="bcf-cookie-actions">
        <button type="button" onClick={() => save(false)}>{t.reject}</button>
        <button type="button" onClick={() => save(true)}>{t.accept}</button>
      </div>
      <div className="bcf-cookie-banner-footer"><button type="button" className="bcf-cookie-configure" onClick={openPreferences}>{t.configure}</button><a href="/cookies">{t.policy}</a></div>
    </section>}
    {storageUnavailable && consent && <div className="bcf-cookie-storage-notice" role="status">{t.storage} <button type="button" onClick={openPreferences}>{t.configure}</button></div>}
    <dialog ref={dialogRef} className="bcf-cookie-dialog" aria-labelledby="bcf-cookie-title" aria-describedby="bcf-cookie-details" onCancel={(event) => { event.preventDefault(); closePreferences(); }} onClose={closePreferences}>
      <header className="bcf-cookie-dialog-header"><h2 id="bcf-cookie-title">{t.preferences}</h2><button type="button" className="bcf-cookie-close" onClick={closePreferences} aria-label={t.close}><span aria-hidden="true">×</span></button></header>
      <p id="bcf-cookie-details">{t.details}</p>
      <section className="bcf-cookie-category"><div className="bcf-cookie-category-title"><h3>{t.necessary}</h3><span>{t.always}</span></div><p>{t.necessaryText}</p></section>
      <section className="bcf-cookie-category"><label className="bcf-cookie-maps-label"><span>{t.maps}</span><input type="checkbox" checked={draftMaps} onChange={event => setDraftMaps(event.target.checked)} aria-describedby="bcf-cookie-maps-description" /></label><p id="bcf-cookie-maps-description">{t.mapsText}</p><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google · {t.privacy}</a></section>
      {storageUnavailable && <p className="bcf-cookie-storage-inline" role="status">{t.storage}</p>}
      <div className="bcf-cookie-dialog-actions"><button type="button" onClick={() => save(false)}>{consent?.maps ? t.revoke : t.reject}</button><button type="button" onClick={() => save(draftMaps)}>{t.save}</button></div>
      <nav className="bcf-cookie-policy-links" aria-label={t.preferences}><a href="/cookies">{t.policy}</a><a href="/privacidad">{t.privacy}</a></nav>
    </dialog>
  </Context.Provider>;
}

export function useCookieConsent() {
  const value = useContext(Context);
  if (!value) throw new Error("CookieConsentProvider is required");
  return value;
}

export function CookiePreferencesButton({ language }: { language?: NewsLanguage }) {
  const consent = useCookieConsent();
  return <button type="button" className="bcf-cookie-preferences-link" onClick={consent.openPreferences}>{copy[language ?? consent.language].preferences}</button>;
}
