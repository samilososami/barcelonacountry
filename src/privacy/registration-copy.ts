import type { NewsLanguage } from "../newsletters/copy";

type RegistrationCopy = {
  privacyBefore: string; privacyAfter: string;
  mapTitle: string; mapDescription: string; mapAction: string; spanishDocument: string;
};

export const registrationCopy: Record<NewsLanguage, RegistrationCopy> = {
  es: {
    privacyBefore: "He leído la", privacyAfter: "y consiento el tratamiento de mis datos para gestionar mi suscripción a Barcelona Country News.",
    mapTitle: "Encuéntranos en Fira Cornellà", mapDescription: "El mapa de Google está desactivado. Para mostrarlo, autoriza Google Maps en las preferencias de cookies. Google recibirá datos de conexión y podrá usar cookies.", mapAction: "Configurar Google Maps",
    spanishDocument: "El texto legal facilitado por la organización está disponible en español."
  },
  ca: {
    privacyBefore: "He llegit la", privacyAfter: "i consento el tractament de les meves dades per gestionar la meva subscripció a Barcelona Country News.",
    mapTitle: "Ens trobaràs a Fira Cornellà", mapDescription: "El mapa de Google està desactivat. Per mostrar-lo, autoritza Google Maps a les preferències de galetes. Google rebrà dades de connexió i podrà utilitzar galetes.", mapAction: "Configurar Google Maps",
    spanishDocument: "El text legal facilitat per l'organització està disponible en castellà."
  },
  en: {
    privacyBefore: "I have read the", privacyAfter: "and consent to my data being processed to manage my subscription to Barcelona Country News.",
    mapTitle: "Find us at Fira Cornellà", mapDescription: "The Google map is disabled. To display it, allow Google Maps in cookie preferences. Google will receive connection data and may use cookies.", mapAction: "Configure Google Maps",
    spanishDocument: "The legal text supplied by the organisers is available in Spanish."
  },
  fr: {
    privacyBefore: "J'ai lu la", privacyAfter: "et je consens au traitement de mes données pour gérer mon abonnement à Barcelona Country News.",
    mapTitle: "Retrouvez-nous à Fira Cornellà", mapDescription: "La carte Google est désactivée. Pour l'afficher, autorisez Google Maps dans les préférences de cookies. Google recevra des données de connexion et pourra utiliser des cookies.", mapAction: "Configurer Google Maps",
    spanishDocument: "Le texte juridique fourni par l'organisation est disponible en espagnol."
  },
  it: {
    privacyBefore: "Ho letto l'", privacyAfter: "e acconsento al trattamento dei miei dati per gestire la mia iscrizione a Barcelona Country News.",
    mapTitle: "Ci trovi a Fira Cornellà", mapDescription: "La mappa Google è disattivata. Per visualizzarla, autorizza Google Maps nelle preferenze dei cookie. Google riceverà dati di connessione e potrà utilizzare cookie.", mapAction: "Configurare Google Maps",
    spanishDocument: "Il testo legale fornito dall'organizzazione è disponibile in spagnolo."
  },
  de: {
    privacyBefore: "Ich habe die", privacyAfter: "gelesen und willige in die Verarbeitung meiner Daten zur Verwaltung meines Abonnements von Barcelona Country News ein.",
    mapTitle: "Du findest uns in Fira Cornellà", mapDescription: "Die Google-Karte ist deaktiviert. Erlaube Google Maps in den Cookie-Einstellungen, um sie anzuzeigen. Google erhält Verbindungsdaten und kann Cookies verwenden.", mapAction: "Google Maps konfigurieren",
    spanishDocument: "Der von den Veranstaltern bereitgestellte Rechtstext ist auf Spanisch verfügbar."
  }
};
