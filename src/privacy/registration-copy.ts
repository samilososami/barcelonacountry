import type { NewsLanguage } from "../newsletters/copy";

type RegistrationCopy = {
  intro: string; privacyBefore: string; privacyAfter: string; newsletter: string;
  optionalHelp: string; submit: string; registered: string; information: string;
  mapTitle: string; mapDescription: string; mapAction: string; spanishDocument: string;
};

export const registrationCopy: Record<NewsLanguage, RegistrationCopy> = {
  es: {
    intro: "Regístrate como persona interesada en Barcelona Country Fest. Si también quieres recibir Barcelona Country News, con novedades, artistas, actividades y promociones, marca la casilla opcional de abajo.",
    privacyBefore: "He leído la", privacyAfter: "y consiento el tratamiento de mis datos para gestionar mi registro como persona interesada.",
    newsletter: "Quiero recibir Barcelona Country News y comunicaciones informativas y promocionales del festival por correo electrónico (opcional).",
    optionalHelp: "Puedes registrarte sin marcar esta casilla. Si te suscribes, podrás darte de baja en cualquier momento.",
    submit: "Enviar registro", registered: "¡Gracias! Tu registro como persona interesada ha quedado guardado. No te has suscrito a la newsletter.",
    information: "Responsable: Events Mayaan SL. Utilizaremos tus datos para gestionar tu registro y, solo si lo eliges, enviarte la newsletter. Puedes ejercer tus derechos en privacidad@barcelonacountry.com.",
    mapTitle: "Encuéntranos en Fira Cornellà", mapDescription: "El mapa de Google está desactivado. Para mostrarlo, autoriza Google Maps en las preferencias de cookies. Google recibirá datos de conexión y podrá usar cookies.", mapAction: "Configurar Google Maps",
    spanishDocument: "El texto legal facilitado por la organización está disponible en español."
  },
  ca: {
    intro: "Registra't com a persona interessada en Barcelona Country Fest. Si també vols rebre Barcelona Country News, amb novetats, artistes, activitats i promocions, marca la casella opcional de sota.",
    privacyBefore: "He llegit la", privacyAfter: "i consento el tractament de les meves dades per gestionar el meu registre com a persona interessada.",
    newsletter: "Vull rebre Barcelona Country News i comunicacions informatives i promocionals del festival per correu electrònic (opcional).",
    optionalHelp: "Pots registrar-te sense marcar aquesta casella. Si t'hi subscrius, podràs donar-te'n de baixa en qualsevol moment.",
    submit: "Enviar registre", registered: "Gràcies! Hem desat el teu registre com a persona interessada. No t'has subscrit a la newsletter.",
    information: "Responsable: Events Mayaan SL. Utilitzarem les teves dades per gestionar el registre i, només si ho tries, enviar-te la newsletter. Pots exercir els teus drets a privacidad@barcelonacountry.com.",
    mapTitle: "Ens trobaràs a Fira Cornellà", mapDescription: "El mapa de Google està desactivat. Per mostrar-lo, autoritza Google Maps a les preferències de galetes. Google rebrà dades de connexió i podrà utilitzar galetes.", mapAction: "Configurar Google Maps",
    spanishDocument: "El text legal facilitat per l'organització està disponible en castellà."
  },
  en: {
    intro: "Register your interest in Barcelona Country Fest. To also receive Barcelona Country News, with news, artists, activities and promotions, tick the optional box below.",
    privacyBefore: "I have read the", privacyAfter: "and consent to my data being processed to register my interest.",
    newsletter: "I would like to receive Barcelona Country News and festival information and promotions by email (optional).",
    optionalHelp: "You can register without ticking this box. If you subscribe, you can unsubscribe at any time.",
    submit: "Register my interest", registered: "Thank you! Your interest has been registered. You have not subscribed to the newsletter.",
    information: "Data controller: Events Mayaan SL. We use your details to register your interest and, only if you opt in, send the newsletter. You can exercise your rights at privacidad@barcelonacountry.com.",
    mapTitle: "Find us at Fira Cornellà", mapDescription: "The Google map is disabled. To display it, allow Google Maps in cookie preferences. Google will receive connection data and may use cookies.", mapAction: "Configure Google Maps",
    spanishDocument: "The legal text supplied by the organisers is available in Spanish."
  },
  fr: {
    intro: "Enregistrez votre intérêt pour Barcelona Country Fest. Pour recevoir également Barcelona Country News, ses actualités, artistes, activités et promotions, cochez la case facultative ci-dessous.",
    privacyBefore: "J'ai lu la", privacyAfter: "et je consens au traitement de mes données pour enregistrer mon intérêt.",
    newsletter: "Je souhaite recevoir Barcelona Country News et les informations et promotions du festival par e-mail (facultatif).",
    optionalHelp: "Vous pouvez vous enregistrer sans cocher cette case. Si vous vous abonnez, vous pourrez vous désabonner à tout moment.",
    submit: "Enregistrer mon intérêt", registered: "Merci ! Votre intérêt a été enregistré. Vous n'êtes pas abonné à la newsletter.",
    information: "Responsable du traitement : Events Mayaan SL. Vos données servent à enregistrer votre intérêt et, uniquement si vous le choisissez, à envoyer la newsletter. Exercez vos droits à privacidad@barcelonacountry.com.",
    mapTitle: "Retrouvez-nous à Fira Cornellà", mapDescription: "La carte Google est désactivée. Pour l'afficher, autorisez Google Maps dans les préférences de cookies. Google recevra des données de connexion et pourra utiliser des cookies.", mapAction: "Configurer Google Maps",
    spanishDocument: "Le texte juridique fourni par l'organisation est disponible en espagnol."
  },
  it: {
    intro: "Registrati come persona interessata a Barcelona Country Fest. Se vuoi ricevere anche Barcelona Country News, con novità, artisti, attività e promozioni, seleziona la casella facoltativa qui sotto.",
    privacyBefore: "Ho letto l'", privacyAfter: "e acconsento al trattamento dei miei dati per registrare il mio interesse.",
    newsletter: "Desidero ricevere Barcelona Country News e le comunicazioni informative e promozionali del festival via e-mail (facoltativo).",
    optionalHelp: "Puoi registrarti senza selezionare questa casella. Se ti iscrivi alla newsletter, potrai annullare l'iscrizione in qualsiasi momento.",
    submit: "Registrare il mio interesse", registered: "Grazie! Il tuo interesse è stato registrato. Non sei iscritto alla newsletter.",
    information: "Titolare del trattamento: Events Mayaan SL. Utilizziamo i dati per registrare il tuo interesse e, solo se lo scegli, inviarti la newsletter. Puoi esercitare i tuoi diritti scrivendo a privacidad@barcelonacountry.com.",
    mapTitle: "Ci trovi a Fira Cornellà", mapDescription: "La mappa Google è disattivata. Per visualizzarla, autorizza Google Maps nelle preferenze dei cookie. Google riceverà dati di connessione e potrà utilizzare cookie.", mapAction: "Configurare Google Maps",
    spanishDocument: "Il testo legale fornito dall'organizzazione è disponibile in spagnolo."
  },
  de: {
    intro: "Registriere dein Interesse am Barcelona Country Fest. Wenn du auch Barcelona Country News mit Neuigkeiten, Künstlern, Aktivitäten und Angeboten erhalten möchtest, aktiviere das optionale Kästchen unten.",
    privacyBefore: "Ich habe die", privacyAfter: "gelesen und willige in die Verarbeitung meiner Daten zur Registrierung meines Interesses ein.",
    newsletter: "Ich möchte Barcelona Country News sowie Informationen und Angebote zum Festival per E-Mail erhalten (optional).",
    optionalHelp: "Du kannst dich registrieren, ohne dieses Kästchen zu aktivieren. Ein Newsletter-Abonnement kannst du jederzeit kündigen.",
    submit: "Interesse registrieren", registered: "Danke! Dein Interesse wurde registriert. Du hast den Newsletter nicht abonniert.",
    information: "Verantwortlicher: Events Mayaan SL. Wir verarbeiten deine Daten zur Registrierung deines Interesses und nur mit deiner Einwilligung für den Newsletter. Deine Rechte kannst du unter privacidad@barcelonacountry.com ausüben.",
    mapTitle: "Du findest uns in Fira Cornellà", mapDescription: "Die Google-Karte ist deaktiviert. Erlaube Google Maps in den Cookie-Einstellungen, um sie anzuzeigen. Google erhält Verbindungsdaten und kann Cookies verwenden.", mapAction: "Google Maps konfigurieren",
    spanishDocument: "Der von den Veranstaltern bereitgestellte Rechtstext ist auf Spanisch verfügbar."
  }
};
