export type NewsLanguage = "es" | "ca" | "en" | "fr" | "it" | "de";

type NewsCopy = {
  title: string; introBefore: string; introAfter: string; subscribe: string;
  authorization: string; authorizationText: string; privacy: string; legal: string; cookies: string;
  pending: string; back: string; archive: string; archiveIntro: string; empty: string;
  emptyBody: string; read: string; issue: string; loading: string; error: string; retry: string;
  success: string; duplicate: string; sent: string; unsubscribe: string; unsubscribed: string;
};

export const newsCopy: Record<NewsLanguage, NewsCopy> = {
  es: {
    title: "¡No te pierdas nada!", introBefore: "Suscríbete para recibir en tu correo electrónico nuestra publicación",
    introAfter: "y descubre lo que tenemos preparado para ti: novedades, promociones, artistas, actividades, entradas y todo lo relacionado con",
    subscribe: "Suscribirme", authorization: "Autorización:",
    authorizationText: "Al suscribirte, aceptas recibir por correo electrónico nuestra publicación Barcelona Country News, con novedades sobre el mundo country y Barcelona Country Fest. Puedes darte de baja en cualquier momento. Consulta cómo tratamos tus datos en nuestra",
    privacy: "Política de Privacidad", legal: "Aviso legal", cookies: "Política de cookies",
    pending: "La organización está preparando este documento. Estará disponible próximamente.", back: "Volver al festival",
    archive: "El blog del festival", archiveIntro: "Todas las ediciones de nuestra publicación, en un solo lugar.",
    empty: "Nuestro primer número está en camino.", emptyBody: "Artistas, novedades y todo lo que nos acerca a Barcelona Country Festival. Suscríbete para recibir Barcelona Country News en tu correo.",
    read: "Leer este número", issue: "Número", loading: "Cargando publicaciones…", error: "No hemos podido cargar las publicaciones.", retry: "Volver a intentar",
    success: "¡Gracias! Tu suscripción a Barcelona Country News ha quedado registrada.", duplicate: "Este correo ya está registrado. Si necesitas actualizar tus datos, contacta con la organización.",
    sent: "Te hemos enviado el primer número. Revisa tu correo.", unsubscribe: "Dar de baja mi suscripción", unsubscribed: "Tu baja se ha registrado. Ya no recibirás Barcelona Country News."
  },
  ca: {
    title: "No et perdis res!", introBefore: "Subscriu-te per rebre al teu correu electrònic la nostra publicació", introAfter: "i descobreix què tenim preparat per a tu: novetats, promocions, artistes, activitats, entrades i tot allò relacionat amb",
    subscribe: "Subscriu-m'hi", authorization: "Autorització:", authorizationText: "En subscriure't, acceptes rebre per correu electrònic la nostra publicació Barcelona Country News, amb novetats sobre el món country i Barcelona Country Fest. Pots donar-te de baixa en qualsevol moment. Consulta com tractem les teves dades a la nostra",
    privacy: "Política de Privacitat", legal: "Avís legal", cookies: "Política de galetes", pending: "L'organització està preparant aquest document. Estarà disponible properament.", back: "Torna al festival",
    archive: "El blog del festival", archiveIntro: "Totes les edicions de la nostra publicació, en un sol lloc.", empty: "El nostre primer número està en camí.", emptyBody: "Artistes, novetats i tot allò que ens apropa a Barcelona Country Festival. Subscriu-te per rebre Barcelona Country News al correu.",
    read: "Llegeix aquest número", issue: "Número", loading: "Carregant publicacions…", error: "No hem pogut carregar les publicacions.", retry: "Torna-ho a provar", success: "Gràcies! La teva subscripció a Barcelona Country News ha quedat registrada.", duplicate: "Aquest correu ja està registrat. Per actualitzar les teves dades, contacta amb l'organització.", sent: "T'hem enviat el primer número. Revisa el correu.", unsubscribe: "Dona'm de baixa", unsubscribed: "Hem registrat la teva baixa. Ja no rebràs Barcelona Country News."
  },
  en: {
    title: "Don't miss a thing!", introBefore: "Subscribe to receive our publication by email,", introAfter: "and discover what we have in store for you: news, promotions, artists, activities, tickets and everything related to",
    subscribe: "Subscribe", authorization: "Consent:", authorizationText: "By subscribing, you agree to receive our publication Barcelona Country News by email, with news about the country scene and Barcelona Country Fest. You can unsubscribe at any time. Find out how we handle your data in our",
    privacy: "Privacy Policy", legal: "Legal notice", cookies: "Cookie Policy", pending: "The organisers are preparing this document. It will be available soon.", back: "Back to the festival",
    archive: "The festival blog", archiveIntro: "Every issue of our publication, in one place.", empty: "Our first issue is on its way.", emptyBody: "Artists, news and everything bringing us closer to Barcelona Country Festival. Subscribe to receive Barcelona Country News by email.",
    read: "Read this issue", issue: "Issue", loading: "Loading publications…", error: "We couldn't load the publications.", retry: "Try again", success: "Thank you! Your Barcelona Country News subscription has been registered.", duplicate: "This email is already registered. Contact the organisers to update your details.", sent: "We've sent you the first issue. Check your inbox.", unsubscribe: "Unsubscribe", unsubscribed: "You have been unsubscribed from Barcelona Country News."
  },
  fr: {
    title: "Ne manquez rien !", introBefore: "Inscrivez-vous pour recevoir par e-mail notre publication", introAfter: "et découvrez ce que nous vous préparons : nouveautés, promotions, artistes, activités, billets et tout ce qui concerne",
    subscribe: "M'inscrire", authorization: "Autorisation :", authorizationText: "En vous inscrivant, vous acceptez de recevoir par e-mail notre publication Barcelona Country News, avec des nouvelles du monde country et de Barcelona Country Fest. Vous pouvez vous désinscrire à tout moment. Découvrez comment nous traitons vos données dans notre",
    privacy: "Politique de confidentialité", legal: "Mentions légales", cookies: "Politique relative aux cookies", pending: "L'organisation prépare ce document. Il sera bientôt disponible.", back: "Retour au festival",
    archive: "Le blog du festival", archiveIntro: "Tous les numéros de notre publication, au même endroit.", empty: "Notre premier numéro arrive bientôt.", emptyBody: "Artistes, nouveautés et tout ce qui nous rapproche de Barcelona Country Festival. Inscrivez-vous pour recevoir Barcelona Country News par e-mail.",
    read: "Lire ce numéro", issue: "Numéro", loading: "Chargement des publications…", error: "Impossible de charger les publications.", retry: "Réessayer", success: "Merci ! Votre inscription à Barcelona Country News est enregistrée.", duplicate: "Cet e-mail est déjà enregistré. Contactez l'organisation pour modifier vos coordonnées.", sent: "Le premier numéro a été envoyé. Consultez votre messagerie.", unsubscribe: "Me désinscrire", unsubscribed: "Votre désinscription de Barcelona Country News est enregistrée."
  },
  it: {
    title: "Non perderti nulla!", introBefore: "Iscriviti per ricevere via e-mail la nostra pubblicazione", introAfter: "e scopri ciò che abbiamo preparato per te: novità, promozioni, artisti, attività, biglietti e tutto ciò che riguarda",
    subscribe: "Iscrivimi", authorization: "Autorizzazione:", authorizationText: "Iscrivendoti, accetti di ricevere via e-mail la nostra pubblicazione Barcelona Country News, con novità sul mondo country e su Barcelona Country Fest. Puoi annullare l'iscrizione in qualsiasi momento. Scopri come trattiamo i tuoi dati nella nostra",
    privacy: "Informativa sulla privacy", legal: "Note legali", cookies: "Informativa sui cookie", pending: "L'organizzazione sta preparando questo documento. Sarà disponibile a breve.", back: "Torna al festival",
    archive: "Il blog del festival", archiveIntro: "Tutti i numeri della nostra pubblicazione, in un unico posto.", empty: "Il nostro primo numero è in arrivo.", emptyBody: "Artisti, novità e tutto ciò che ci avvicina a Barcelona Country Festival. Iscriviti per ricevere Barcelona Country News via e-mail.",
    read: "Leggi questo numero", issue: "Numero", loading: "Caricamento delle pubblicazioni…", error: "Impossibile caricare le pubblicazioni.", retry: "Riprova", success: "Grazie! La tua iscrizione a Barcelona Country News è stata registrata.", duplicate: "Questa e-mail è già registrata. Contatta l'organizzazione per aggiornare i tuoi dati.", sent: "Ti abbiamo inviato il primo numero. Controlla la posta.", unsubscribe: "Annulla la mia iscrizione", unsubscribed: "La tua iscrizione a Barcelona Country News è stata annullata."
  },
  de: {
    title: "Verpasse nichts!", introBefore: "Abonniere unsere Publikation per E-Mail,", introAfter: "und entdecke, was wir für dich vorbereitet haben: Neuigkeiten, Angebote, Künstler, Aktivitäten, Tickets und alles rund um",
    subscribe: "Abonnieren", authorization: "Einwilligung:", authorizationText: "Mit dem Abonnement stimmst du zu, unsere Publikation Barcelona Country News mit Neuigkeiten aus der Country-Welt und vom Barcelona Country Fest per E-Mail zu erhalten. Du kannst dich jederzeit abmelden. Wie wir deine Daten verarbeiten, erfährst du in unserer",
    privacy: "Datenschutzerklärung", legal: "Rechtliche Hinweise", cookies: "Cookie-Richtlinie", pending: "Das Veranstaltungsteam bereitet dieses Dokument vor. Es wird bald verfügbar sein.", back: "Zurück zum Festival",
    archive: "Der Festival-Blog", archiveIntro: "Alle Ausgaben unserer Publikation an einem Ort.", empty: "Unsere erste Ausgabe ist unterwegs.", emptyBody: "Künstler, Neuigkeiten und alles, was uns dem Barcelona Country Festival näherbringt. Abonniere Barcelona Country News per E-Mail.",
    read: "Diese Ausgabe lesen", issue: "Ausgabe", loading: "Publikationen werden geladen…", error: "Die Publikationen konnten nicht geladen werden.", retry: "Erneut versuchen", success: "Danke! Dein Abonnement von Barcelona Country News wurde registriert.", duplicate: "Diese E-Mail ist bereits registriert. Kontaktiere das Veranstaltungsteam, um deine Daten zu ändern.", sent: "Wir haben dir die erste Ausgabe geschickt. Prüfe dein Postfach.", unsubscribe: "Abonnement kündigen", unsubscribed: "Du wurdest von Barcelona Country News abgemeldet."
  }
};
