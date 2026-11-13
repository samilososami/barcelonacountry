import { StrictMode, Suspense, lazy, useEffect, useRef, useState, type CSSProperties, type FormEvent, type UIEvent } from "react";
import { createRoot } from "react-dom/client";
import { countryFlag, phoneCountries, type PhoneCountry } from "./lib/phoneCountries";
import { newsCopy } from "./newsletters/copy";
import { ArrowIcon } from "./components/ArrowIcon";
import { CookieConsentProvider, CookiePreferencesButton, useCookieConsent } from "./privacy/CookieConsent";
import { registrationCopy } from "./privacy/registration-copy";
import "./styles.css";
import "./modern.css";
import "./cinematic.css";
import { assetPath, sitePath, currentSitePath, siteCopy } from "./lib/site";
import { useFestivalMotion } from "./useFestivalMotion";
import { FestivalCountdown } from "./components/FestivalCountdown";
import { ContactDialog } from "./components/ContactDialog";
import { ArtistGalleryDialog } from "./components/ArtistGalleryDialog";
import { refinementCopy } from "./lib/refinement-copy";
import { useArtistCarousel } from "./useArtistCarousel";

const AdminPortal = lazy(() => import("./admin/AdminPortal").then((module) => ({ default: module.AdminPortal })));
const TicketPurchasePage = lazy(() => import("./tickets/TicketPurchasePage").then((module) => ({ default: module.TicketPurchasePage })));
const NewsPage = lazy(() => import("./newsletters/NewsPage").then((module) => ({ default: module.NewsPage })));
const LegalPage = lazy(() => import("./newsletters/LegalPage").then((module) => ({ default: module.LegalPage })));

type LanguageKey = "de" | "es" | "ca" | "fr" | "en" | "it";

type Artist = {
  name: string;
  role: string;
  body?: string;
  image?: string;
  instagram?: string;
  x: number;
  y: number;
  imageFit?: "cover" | "stretch" | "montse" | "jonathan" | "steve" | "johnny" | "sofia";
};

type Copy = {
  languageName: string;
  nav: string[];
  heroKicker: string;
  heroCopy: string;
  cta: string;
  triad: string[];
  festivalTitle: string;
  festivalCopy: string;
  days: string;
  internationalArtists: string;
  expectedDancers: string;
  artistsTitle: string;
  artists: Pick<Artist, "name" | "role" | "body">[];
  locationKicker: string;
  inBarcelona: string;
  mapTitle: string;
  date: string;
  contactTitle: string;
  formName: string;
  formPhone: string;
  formEmail: string;
  formDanceLocation: string;
  footer: string;
};

type FestivalDate = {
  city: string;
  days: string;
  month: string;
  year: string;
};

type RevealStyle = CSSProperties & {
  "--scrolljs-delay"?: string;
};

type FindItem =
  | string
  | {
      heading: string;
      body: string;
    };

type FindCard = {
  title: string;
  icon: string;
  items: FindItem[];
};

type FindCopy = {
  kicker: string;
  title: string;
  cards: FindCard[];
};

const navTargets = ["home", "festival", "artists", "program", "location", "contact"];
const scrollTargetSelectors: Record<string, string> = {
  home: ".frame",
  festival: ".festival",
  artists: ".artist-card",
  program: ".date-banner",
  location: ".location-panel",
  contact: ".text-mantente"
};

const mobileSectionSelectors = ["#home", "#festival", "#artists", "#find", "#location", "#contact"];

const findIconAssets: Record<string, string> = {
  music: "/assets/find-icon-music.png",
  US: "/assets/find-icon-music.png",
  shopping: "/assets/find-icon-shopping.png",
  SHOP: "/assets/find-icon-shopping.png",
  food: "/assets/find-icon-food.png",
  BBQ: "/assets/find-icon-food.png",
  cowboy: "/assets/find-icon-cowboy.png",
  REC: "/assets/find-icon-cowboy.png"
};

const languageOptions: { key: LanguageKey; label: string; icon: string }[] = [
  { key: "de", label: "Deutsch", icon: "🇩🇪" },
  { key: "es", label: "Español", icon: "🇪🇸" },
  { key: "ca", label: "Català", icon: "CAT" },
  { key: "fr", label: "Français", icon: "🇫🇷" },
  { key: "en", label: "English", icon: "🇬🇧" },
  { key: "it", label: "Italiano", icon: "🇮🇹" }
];

const nextStopLabels: Record<LanguageKey, string> = {
  de: "Nächster Halt",
  es: "Siguiente parada",
  ca: "Següent parada",
  fr: "Prochain arrêt",
  en: "Next stop",
  it: "Prossima fermata"
};

const previousStopLabels: Record<LanguageKey, string> = {
  de: "Vorheriger Halt",
  es: "Parada anterior",
  ca: "Parada anterior",
  fr: "Arrêt précédent",
  en: "Previous stop",
  it: "Fermata precedente"
};

const findQuoteLabels: Record<LanguageKey, [string, string]> = {
  de: ["Wo Stiefel auf Rhythmus treffen.", "Trag den Look. Lebe den Mythos."],
  es: ["Donde las botas encuentran el ritmo.", "Viste el estilo. Vive el mito."],
  ca: ["On les botes troben el ritme.", "Vesteix l'estil. Viu el mite."],
  fr: ["Là où les bottes rencontrent le rythme.", "Adoptez le style. Vivez le mythe."],
  en: ["Where boots meet the beat.", "Dress the part. Live the myth."],
  it: ["Dove gli stivali incontrano il ritmo.", "Indossa lo stile. Vivi il mito."]
};

const interfaceLabels: Record<LanguageKey, { changeLanguage: string; festivalStops: string; phonePrefix: string; phoneSearch: string; noResults: string; form: string; stop: string; menu: string; closeMenu: string }> = {
  de: { changeLanguage: "Sprache ändern", festivalStops: "Festivalstationen", phonePrefix: "Telefonvorwahl auswählen", phoneSearch: "Land oder Vorwahl", noResults: "Keine Ergebnisse", form: "Informationsformular", stop: "Halt", menu: "Menü öffnen", closeMenu: "Menü schließen" },
  es: { changeLanguage: "Cambiar idioma", festivalStops: "Paradas del festival", phonePrefix: "Seleccionar prefijo telefónico", phoneSearch: "País o prefijo", noResults: "Sin resultados", form: "Formulario de información", stop: "Parada", menu: "Abrir menú", closeMenu: "Cerrar menú" },
  ca: { changeLanguage: "Canviar d'idioma", festivalStops: "Parades del festival", phonePrefix: "Selecciona el prefix telefònic", phoneSearch: "País o prefix", noResults: "Cap resultat", form: "Formulari d'informació", stop: "Parada", menu: "Obre el menú", closeMenu: "Tanca el menú" },
  fr: { changeLanguage: "Changer de langue", festivalStops: "Étapes du festival", phonePrefix: "Choisir l'indicatif téléphonique", phoneSearch: "Pays ou indicatif", noResults: "Aucun résultat", form: "Formulaire d'information", stop: "Étape", menu: "Ouvrir le menu", closeMenu: "Fermer le menu" },
  en: { changeLanguage: "Change language", festivalStops: "Festival stops", phonePrefix: "Select phone prefix", phoneSearch: "Country or prefix", noResults: "No results", form: "Information form", stop: "Stop", menu: "Open menu", closeMenu: "Close menu" },
  it: { changeLanguage: "Cambia lingua", festivalStops: "Tappe del festival", phonePrefix: "Seleziona il prefisso telefonico", phoneSearch: "Paese o prefisso", noResults: "Nessun risultato", form: "Modulo informazioni", stop: "Tappa", menu: "Apri il menu", closeMenu: "Chiudi il menu" }
};

const formFeedbackLabels: Record<LanguageKey, { submitting: string; success: string; duplicate: string; error: string }> = {
  de: { submitting: "Wird gespeichert…", success: "Danke! Deine Daten wurden gespeichert.", duplicate: "Diese E-Mail ist bereits registriert.", error: "Die Daten konnten nicht gespeichert werden. Bitte versuche es erneut." },
  es: { submitting: "Guardando…", success: "¡Gracias! Tus datos se han guardado correctamente.", duplicate: "Este correo ya está registrado.", error: "No hemos podido guardar tus datos. Inténtalo de nuevo." },
  ca: { submitting: "Desant…", success: "Gràcies! Les teves dades s'han desat correctament.", duplicate: "Aquest correu ja està registrat.", error: "No hem pogut desar les dades. Torna-ho a provar." },
  fr: { submitting: "Enregistrement…", success: "Merci ! Vos données ont bien été enregistrées.", duplicate: "Cet e-mail est déjà enregistré.", error: "Impossible d'enregistrer vos données. Réessayez." },
  en: { submitting: "Saving…", success: "Thank you! Your details have been saved.", duplicate: "This email is already registered.", error: "We could not save your details. Please try again." },
  it: { submitting: "Salvataggio…", success: "Grazie! I tuoi dati sono stati salvati.", duplicate: "Questa e-mail è già registrata.", error: "Non è stato possibile salvare i dati. Riprova." }
};

const ticketCtaCopies: Record<LanguageKey, { date: string; title: string; body: string; action: string }> = {
  de: { date: "22.–24. OKTOBER 2027 · FIRA CORNELLÀ", title: "Sichere dir jetzt deine Tickets", body: "Erlebe drei Tage Tanz, Live-Musik und Westernkultur. Allgemeiner Eintritt ab 15 €.", action: "Jetzt kaufen" },
  es: { date: "22–24 OCTUBRE 2027 · FIRA CORNELLÀ", title: "Compra ya tus entradas", body: "Vive tres días de baile, música en directo y cultura western. Entrada general desde 15 €.", action: "Comprar ahora" },
  ca: { date: "22–24 OCTUBRE 2027 · FIRA CORNELLÀ", title: "Compra ja les teves entrades", body: "Viu tres dies de ball, música en directe i cultura western. Entrada general des de 15 €.", action: "Comprar ara" },
  fr: { date: "22–24 OCTOBRE 2027 · FIRA CORNELLÀ", title: "Achetez vos billets", body: "Vivez trois jours de danse, de musique live et de culture western. Entrée générale à partir de 15 €.", action: "Acheter maintenant" },
  en: { date: "OCTOBER 22–24, 2027 · FIRA CORNELLÀ", title: "Buy your tickets now", body: "Experience three days of dancing, live music and western culture. General admission from €15.", action: "Buy now" },
  it: { date: "22–24 OTTOBRE 2027 · FIRA CORNELLÀ", title: "Acquista ora i tuoi biglietti", body: "Vivi tre giorni di ballo, musica dal vivo e cultura western. Ingresso generale da 15 €.", action: "Acquista ora" }
};

const festivalDates: Record<LanguageKey, FestivalDate> = {
  de: { city: "Fira Cornellà", days: "22-23-24", month: "Okt", year: "2027" },
  es: { city: "Fira Cornellà", days: "22-23-24", month: "Oct", year: "2027" },
  ca: { city: "Fira Cornellà", days: "22-23-24", month: "Oct", year: "2027" },
  fr: { city: "Fira Cornellà", days: "22-23-24", month: "Oct", year: "2027" },
  en: { city: "Fira Cornellà", days: "22-23-24", month: "Oct", year: "2027" },
  it: { city: "Fira Cornellà", days: "22-23-24", month: "Ott", year: "2027" }
};

const mysteryArtistCopies: Record<LanguageKey, { eyebrow: string; title: string; card: string }> = {
  de: { eyebrow: "Demnächst", title: "Und weitere Künstler, die es zu entdecken gilt", card: "Noch zu entdecken" },
  es: { eyebrow: "Próximamente", title: "Y más artistas por descubrir", card: "Por descubrir" },
  ca: { eyebrow: "Properament", title: "I més artistes per descobrir", card: "Per descobrir" },
  fr: { eyebrow: "Prochainement", title: "Et encore plus d’artistes à découvrir", card: "À découvrir" },
  en: { eyebrow: "Coming soon", title: "And more artists to discover", card: "To be revealed" },
  it: { eyebrow: "Prossimamente", title: "E altri artisti da scoprire", card: "Da scoprire" }
};

const choreographerInstructorLabels: Record<LanguageKey, string> = {
  de: "Choreografin & Trainerin",
  es: "Coreógrafa & instructora",
  ca: "Coreògrafa & instructora",
  fr: "Chorégraphe & instructrice",
  en: "Choreographer & instructor",
  it: "Coreografa & istruttrice"
};

const davidPrestorRoleLabels: Record<LanguageKey, string> = {
  de: "Internationaler Choreograf",
  es: "Coreógrafo internacional",
  ca: "Coreògraf internacional",
  fr: "Chorégraphe international",
  en: "International choreographer",
  it: "Coreografo internazionale"
};

const eduRoldosRoleLabels: Record<LanguageKey, string> = {
  de: "Choreograf",
  es: "Coreógrafo",
  ca: "Coreògraf",
  fr: "Chorégraphe",
  en: "Choreographer",
  it: "Coreografo"
};

const SHOW_TICKET_SALES = false;

const festivalStatValues = { artists: "+17", dancers: "+3000" };

const lineupIntroLabels: Record<LanguageKey, string> = {
  de: "Europas führende Namen im Country Line Dance, vereint in Barcelona.",
  es: "Los grandes referentes del Country Line Dance europeo, reunidos en Barcelona.",
  ca: "Els grans referents del Country Line Dance europeu, reunits a Barcelona.",
  fr: "Les grandes références européennes du Country Line Dance, réunies à Barcelone.",
  en: "Europe’s leading Country Line Dance names, together in Barcelona.",
  it: "I grandi protagonisti europei del Country Line Dance, riuniti a Barcellona."
};

const sponsorInvitationLabels: Record<LanguageKey, string> = {
  de: "Du möchtest das Festival unterstützen?",
  es: "¿Quieres patrocinar el festival?",
  ca: "Vols patrocinar el festival?",
  fr: "Vous souhaitez devenir partenaire du festival ?",
  en: "Want to sponsor the festival?",
  it: "Vuoi sponsorizzare il festival?"
};

const findIntroLabels: Record<LanguageKey, string> = {
  de: "Wähle einen Halt auf dem Weg. Jede Kategorie öffnet eine Tür zum echten Western-Spirit.",
  es: "Elige una parada del camino. Cada categoría abre una puerta al verdadero espíritu western.",
  ca: "Tria una parada del camí. Cada categoria és una porta al veritable esperit western.",
  fr: "Choisissez une étape du chemin. Chaque catégorie ouvre une porte vers le véritable esprit western.",
  en: "Choose a stop on the trail. Each category opens a door to the real western spirit.",
  it: "Scegli una tappa del percorso. Ogni categoria apre una porta al vero spirito western."
};

const findVisuals = [
  "/assets/find-catalan.jpg",
  "/assets/backgrounds/artists-dance.jpg",
  "/assets/find-food.jpg",
  "/assets/find-community.webp"
];

const findCopies: Record<LanguageKey, FindCopy> = {
  de: {
    kicker: "WAS DICH ERWARTET",
    title: "DETAILS DES FESTIVALS",
    cards: [
      {
        title: "CATALAN STYLE & MUSIK",
        icon: "US",
        items: [
          { heading: "BEREICH FÜR CHOREOGRAFEN UND WORKSHOWS:", body: "Das Kreativlabor der Legenden." },
          { heading: "LINE-DANCE-HALLEN:", body: "Ununterbrochener Tanz während des gesamten Events." },
          { heading: "KINDER-WORKSHOP:", body: "Eltern teilen ihre Leidenschaft mit ihren Kindern." },
          { heading: "VERLOSUNG GROSSER REISEN:", body: "Reise mit deinen Lieblingschoreografen." },
          { heading: "GROSSE ABENDKONZERTE:", body: "Country nonstop!" }
        ]
      },
      {
        title: "SHOPPING & LIFESTYLE",
        icon: "SHOP",
        items: [
          { heading: "WESTERN-LIFESTYLE- UND SHOPPING-BEREICH:", body: "Das große kommerzielle Schaufenster." },
          { heading: "AUSSTELLUNG AMERIKANISCHER FAHRZEUGE:", body: "Mit den legendären Harley-Davidson-Motorrädern." },
          { heading: "ERLEBNIS- UND SHOWBEREICH:", body: "Vollständiges Eintauchen in die Kultur." },
          { heading: "WESTERN-MODESCHAU:", body: "Ein Laufsteg für exklusive Country-Mode." }
        ]
      },
      {
        title: "COUNTRY-GENUSS",
        icon: "BBQ",
        items: [
          { heading: "COUNTRY-GASTRONOMIE:", body: "Barbecue, Rippchen, Pulled Pork, Bourbon und handwerklich gebraute Biere." },
          { heading: "AMERIKANISCHE FOODTRUCKS:", body: "Vom New Yorker Pretzel bis zum Texas-Chili." }
        ]
      },
      {
        title: "COMMUNITY & FREUNDE",
        icon: "REC",
        items: [
          { heading: "BIG DANCE BARCELONA:", body: "Ein Aufruf zu einem gemeinsamen Massentanz im Herzen des Festivals und dazu, eine offene, eng verbundene Country-Community weiter wachsen zu lassen." },
          { heading: "TREFFEN DER COUNTRY-GRUPPEN:", body: "Clubs aus ganz Europa vereint unter derselben Sonne." },
        ]
      }
    ]
  },
  es: {
    kicker: "QUÉ ENCONTRARÁS",
    title: "DETALLES DEL FESTIVAL",
    cards: [
      {
        title: "CATALAN STYLE & MÚSICA",
        icon: "music",
        items: [
          {
            heading: "ZONA DE COREÓGRAFOS Y WORKSHOWS:",
            body: "El laboratorio de creatividad de las leyendas."
          },
          {
            heading: "SALAS DE LINE DANCE:",
            body: "Baile ininterrumpido durante todo el evento."
          },
          {
            heading: "TALLER INFANTIL:",
            body: "Padres compartiendo su pasión con sus hijos."
          },
          {
            heading: "SORTEOS DE GRANDES VIAJES:",
            body: "Viaja con tus coreógrafos preferidos."
          },
          {
            heading: "GRANDES CONCIERTOS NOCTURNOS:",
            body: "Country non stop!"
          }
        ]
      },
      {
        title: "SHOPPING & LIFESTYLE",
        icon: "shopping",
        items: [
          {
            heading: "ÁREA DE ESTILO DE VIDA Y COMPRAS WESTERN:",
            body: "El gran escaparate comercial."
          },
          {
            heading: "EXPOSICIÓN VEHÍCULOS AMERICANOS:",
            body: "Incluidas las míticas motos Harley Davidson."
          },
          {
            heading: "ZONA DE EXPERIENCIAS Y EXHIBICIONES:",
            body: "Inmersión total en la cultura."
          },
          {
            heading: "DESFILE DE MODA WESTERN:",
            body: "Pasarela de moda de alta costura country."
          }
        ]
      },
      {
        title: "BOCADOS COUNTRY",
        icon: "food",
        items: [
          {
            heading: "ESPACIOS GASTRONÓMICOS COUNTRY:",
            body: "Barbacoa, costillas, cerdo desmenuzado, bourbon y cervezas artesanas."
          },
          {
            heading: "FOOD TRUCKS AMERICANOS:",
            body: "Del pretzel de Nueva York al chili de Texas."
          }
        ]
      },
      {
        title: "COMUNIDAD Y AMIGOS",
        icon: "cowboy",
        items: [
          {
            heading: "BIG DANCE BARCELONA:",
            body: "Una convocatoria para compartir un baile multitudinario en el corazón del festival y seguir haciendo crecer una comunidad country abierta, cercana y unida."
          },
          {
            heading: "ENCUENTRO DE GRUPOS COUNTRY:",
            body: "Clubs de toda Europa unidos bajo el mismo sol."
          }
        ]
      }
    ]
  },
  ca: {
    kicker: "QUÈ HI TROBARÀS",
    title: "DETALLS DEL FESTIVAL",
    cards: [
      {
        title: "CATALAN STYLE I MÚSICA",
        icon: "US",
        items: [
          { heading: "ZONA DE COREÒGRAFS I WORKSHOWS:", body: "El laboratori de creativitat de les llegendes." },
          { heading: "SALES DE LINE DANCE:", body: "Ball ininterromput durant tot l'esdeveniment." },
          { heading: "TALLER INFANTIL:", body: "Pares compartint la passió amb els seus fills." },
          { heading: "SORTEIGS DE GRANS VIATGES:", body: "Viatja amb els teus coreògrafs preferits." },
          { heading: "GRANS CONCERTS NOCTURNS:", body: "Country nonstop!" }
        ]
      },
      {
        title: "COMPRES I ESTIL DE VIDA",
        icon: "SHOP",
        items: [
          { heading: "ÀREA D'ESTIL DE VIDA I COMPRES WESTERN:", body: "El gran aparador comercial." },
          { heading: "EXPOSICIÓ DE VEHICLES AMERICANS:", body: "Incloses les mítiques motos Harley-Davidson." },
          { heading: "ZONA D'EXPERIÈNCIES I EXHIBICIONS:", body: "Immersió total en la cultura." },
          { heading: "DESFILADA DE MODA WESTERN:", body: "Passarel·la de moda d'alta costura country." }
        ]
      },
      {
        title: "SABORS COUNTRY",
        icon: "BBQ",
        items: [
          { heading: "ESPAIS GASTRONÒMICS COUNTRY:", body: "Barbacoa, costelles, porc esfilagarsat, bourbon i cerveses artesanes." },
          { heading: "FOOD TRUCKS AMERICANS:", body: "Del pretzel de Nova York al xili de Texas." }
        ]
      },
      {
        title: "COMUNITAT I AMICS",
        icon: "REC",
        items: [
          { heading: "BIG DANCE BARCELONA:", body: "Una convocatòria per compartir un ball multitudinari al cor del festival i continuar fent créixer una comunitat country oberta, propera i unida." },
          { heading: "TROBADA DE COLLES COUNTRY:", body: "Clubs de tot Europa units sota el mateix sol." },
        ]
      }
    ]
  },
  fr: {
    kicker: "CE QUE VOUS TROUVEREZ",
    title: "DÉTAILS DU FESTIVAL",
    cards: [
      {
        title: "STYLE CATALAN & MUSIQUE",
        icon: "US",
        items: [
          { heading: "ESPACE CHORÉGRAPHES ET WORKSHOWS :", body: "Le laboratoire créatif des légendes." },
          { heading: "SALLES DE LINE DANCE :", body: "Danse sans interruption pendant tout l'événement." },
          { heading: "ATELIER POUR ENFANTS :", body: "Des parents partageant leur passion avec leurs enfants." },
          { heading: "TIRAGES AU SORT DE GRANDS VOYAGES :", body: "Voyagez avec vos chorégraphes préférés." },
          { heading: "GRANDS CONCERTS NOCTURNES :", body: "Country non-stop !" }
        ]
      },
      {
        title: "SHOPPING & ART DE VIVRE",
        icon: "SHOP",
        items: [
          { heading: "ESPACE ART DE VIVRE ET SHOPPING WESTERN :", body: "La grande vitrine commerciale." },
          { heading: "EXPOSITION DE VÉHICULES AMÉRICAINS :", body: "Avec les mythiques motos Harley-Davidson." },
          { heading: "ZONE D'EXPÉRIENCES ET D'EXHIBITIONS :", body: "Immersion totale dans la culture." },
          { heading: "DÉFILÉ DE MODE WESTERN :", body: "Un défilé de haute couture country." }
        ]
      },
      {
        title: "SAVEURS COUNTRY",
        icon: "BBQ",
        items: [
          { heading: "ESPACES GASTRONOMIQUES COUNTRY :", body: "Barbecue, travers de porc, porc effiloché, bourbon et bières artisanales." },
          { heading: "FOOD TRUCKS AMÉRICAINS :", body: "Du pretzel new-yorkais au chili texan." }
        ]
      },
      {
        title: "COMMUNAUTÉ ET AMIS",
        icon: "REC",
        items: [
          { heading: "BIG DANCE BARCELONA :", body: "Un appel à partager une danse collective au cœur du festival et à continuer de faire grandir une communauté country ouverte, proche et unie." },
          { heading: "RENCONTRE DES GROUPES COUNTRY :", body: "Des clubs de toute l'Europe réunis sous le même soleil." },
        ]
      }
    ]
  },
  en: {
    kicker: "WHAT YOU'LL FIND",
    title: "FESTIVAL DETAILS",
    cards: [
      {
        title: "CATALAN STYLE & MUSIC",
        icon: "US",
        items: [
          { heading: "CHOREOGRAPHERS AND WORKSHOWS AREA:", body: "The legends' creative laboratory." },
          { heading: "LINE DANCE HALLS:", body: "Non-stop dancing throughout the event." },
          { heading: "KIDS' WORKSHOP:", body: "Parents sharing their passion with their children." },
          { heading: "MAJOR TRAVEL GIVEAWAYS:", body: "Travel with your favorite choreographers." },
          { heading: "MAJOR NIGHTTIME CONCERTS:", body: "Country nonstop!" }
        ]
      },
      {
        title: "SHOPPING & LIFESTYLE",
        icon: "SHOP",
        items: [
          { heading: "WESTERN LIFESTYLE AND SHOPPING AREA:", body: "The festival's major retail showcase." },
          { heading: "AMERICAN VEHICLE EXHIBITION:", body: "Including the legendary Harley-Davidson motorcycles." },
          { heading: "EXPERIENCE AND EXHIBITION AREA:", body: "A full immersion in the culture." },
          { heading: "WESTERN FASHION SHOW:", body: "A high-fashion country runway." }
        ]
      },
      {
        title: "COUNTRY BITES",
        icon: "BBQ",
        items: [
          { heading: "COUNTRY FOOD AREA:", body: "BBQ, ribs, pulled pork, bourbon and craft beers." },
          { heading: "AMERICAN FOOD TRUCKS:", body: "From New York pretzels to Texas chili." }
        ]
      },
      {
        title: "COMMUNITY & FRIENDS",
        icon: "REC",
        items: [
          { heading: "BIG DANCE BARCELONA:", body: "A call to share a mass dance at the heart of the festival and keep growing an open, close-knit country community." },
          { heading: "COUNTRY CLUB GATHERING:", body: "Clubs from across Europe united under the same sun." },
        ]
      }
    ]
  },
  it: {
    kicker: "COSA TROVERAI",
    title: "DETTAGLI DEL FESTIVAL",
    cards: [
      {
        title: "CATALAN STYLE & MUSICA",
        icon: "US",
        items: [
          { heading: "AREA COREOGRAFI E WORKSHOW:", body: "Il laboratorio creativo delle leggende." },
          { heading: "SALE LINE DANCE:", body: "Ballo ininterrotto durante tutto l'evento." },
          { heading: "WORKSHOP PER BAMBINI:", body: "Genitori che condividono la passione con i figli." },
          { heading: "ESTRAZIONE DI GRANDI VIAGGI:", body: "Viaggia con i tuoi coreografi preferiti." },
          { heading: "GRANDI CONCERTI SERALI:", body: "Country nonstop!" }
        ]
      },
      {
        title: "SHOPPING & LIFESTYLE",
        icon: "SHOP",
        items: [
          { heading: "AREA WESTERN LIFESTYLE E SHOPPING:", body: "La grande vetrina commerciale." },
          { heading: "ESPOSIZIONE DI VEICOLI AMERICANI:", body: "Incluse le mitiche moto Harley-Davidson." },
          { heading: "AREA ESPERIENZE ED ESIBIZIONI:", body: "Immersione totale nella cultura." },
          { heading: "SFILATA DI MODA WESTERN:", body: "Una passerella di alta moda country." }
        ]
      },
      {
        title: "SAPORI COUNTRY",
        icon: "BBQ",
        items: [
          { heading: "SPAZI GASTRONOMICI COUNTRY:", body: "Barbecue, costine, pulled pork, bourbon e birre artigianali." },
          { heading: "FOOD TRUCK AMERICANI:", body: "Dal pretzel di New York al chili del Texas." }
        ]
      },
      {
        title: "COMUNITÀ E AMICI",
        icon: "REC",
        items: [
          { heading: "BIG DANCE BARCELONA:", body: "Un invito a condividere un ballo collettivo nel cuore del festival e a far crescere una comunità country aperta, vicina e unita." },
          { heading: "RADUNO DEI GRUPPI COUNTRY:", body: "Club da tutta Europa uniti sotto lo stesso sole." },
        ]
      }
    ]
  }
};

const copies: Record<LanguageKey, Copy> = {
  de: {
    languageName: "Deutsch",
    nav: ["START", "FESTIVAL", "KÜNSTLER", "PROGRAMM", "ORT", "KONTAKT"],
    heroKicker: "FIRA CORNELLÀ · 22.–24. OKTOBER 2027",
    heroCopy:
      "Das internationale Country-Event kommt nach Barcelona. Drei Tage Line Dance, Live-Musik und amerikanischer Spirit.",
    cta: "Informiert bleiben",
    triad: ["TANZ", "MUSIK", "AMERIKA"],
    festivalTitle: "Das Festival",
    festivalCopy:
      "Barcelona Country Festival vereint drei Tage lang das Beste aus internationalem Line Dance, Live-Musik, hochwertigen Western-Produkten und Foodtrucks mit echter amerikanischer Barbecue-Küche. Ein Event für Tänzer, Familien und Country-Fans, die den amerikanischen Spirit in Barcelona erleben möchten.",
    days: "Tage",
    internationalArtists: "INTERNATIONALE\nKÜNSTLER",
    expectedDancers: "TÄNZER",
    artistsTitle: "Internationale Künstler",
    artists: [
      {
        name: "Pol F. Ryan",
        role: "Internationaler Choreograf",
        body:
          "Internationales Aushängeschild des Catalan Style Line Dance und weltweit gefragter Star. Seine europaweit getanzten Choreografien verbinden amerikanische Energie mit mediterranem Flair. Ein Wirbelsturm auf der Tanzfläche."
      },
      {
        name: "Algaly Fofana",
        role: "Choreograf & Trainer",
        body:
          "Eine der spannendsten jungen Persönlichkeiten des europäischen Line Dance. Bei den wichtigsten Events gefragt, hat er seinen Stil mit viralen Choreografien nach Belgien, Spanien und Italien gebracht."
      },
      {
        name: "David Villellas",
        role: "Choreograf & Trainer",
        body:
          "Eine Legende des Catalan Country Style und Wegbereiter dieses Stils in Europa. Seit über 20 Jahren erobern seine Choreografien internationale Festivals. Seine unverwechselbare Präsenz gehört zu jedem großen Event."
      },
      {
        name: "Montse Moscardó",
        role: "Choreografin & Trainerin",
        body:
          "Ein unverzichtbarer Name im Catalan Country Style. Ihre detailreichen, energiegeladenen Choreografien werden bei Hunderten von Events in ganz Europa getanzt."
      },
      {
        name: "Jonathan Jones",
        role: "Folk-Country-Singer-Songwriter",
        body:
          "Ein DJ und eine echte Legende in Europa. Mit seiner Musikauswahl, seiner Ausstrahlung und seinem Humor bringt er jede Tanzfläche zum Kochen. Für uns unverzichtbar."
      }
    ],
    locationKicker: "STANDORT",
    inBarcelona: "FIRA CORNELLÀ!",
    mapTitle: "Karte der Fira de Cornellà",
    date: "FIRA CORNELLÀ · 22.–24. OKT. 2027",
    contactTitle: "BLEIB INFORMIERT",
    formName: "Name",
    formPhone: "Telefonnummer",
    formEmail: "E-Mail",
    formDanceLocation: "Wo tanzt du normalerweise?",
    footer: "© 2027 Barcelona Country Festival · Alle Rechte vorbehalten · Yeehaw!"
  },
  es: {
    languageName: "Español",
    nav: ["INICIO", "FESTIVAL", "ARTISTAS", "PROGRAMA", "UBICACIÓN", "CONTACTO"],
    heroKicker: "FIRA CORNELLÀ · 22–24 DE OCTUBRE DE 2027",
    heroCopy:
      "El evento internacional de country llega a Barcelona. Tres días de line dance, música en directo y espíritu americano.",
    cta: "Mantente informado",
    triad: ["BAILE", "MÚSICA", "AMÉRICA"],
    festivalTitle: "El Festival",
    festivalCopy:
      "Barcelona Country Festival reúne durante tres días a lo mejor del line dance internacional, música en directo, productos western y food trucks con auténtica barbacoa americana. Un evento pensado para bailarines, familias y amantes del country que buscan vivir el auténtico espíritu americano sin salir de Barcelona.",
    days: "Días",
    internationalArtists: "ARTISTAS\nINTERNACIONALES",
    expectedDancers: "BAILARINES",
    artistsTitle: "Artistas internacionales",
    artists: [
      {
        name: "Pol F. Ryan",
        role: "Coreógrafo internacional",
        body:
          "Referente internacional del Line Dance Catalán Style. Es una figura cotizadísima en el mundo country, con actuaciones en todo el mundo. Ha creado decenas de coreografías que se bailan en pistas de toda Europa. Su estilo mezcla energía americana con sabor mediterráneo. Auténtico huracán en la pista."
      },
      {
        name: "Algaly Fofana",
        role: "Coreógrafo & instructor",
        body:
          "Una de las figuras jóvenes más frescas del Line Dance europeo. Su presencia es necesaria en los eventos más importantes y ha llevado su estilo a Bélgica, España e Italia con coreografías virales."
      },
      {
        name: "David Villellas",
        role: "Coreógrafo & Instructor",
        body:
          "Auténtica leyenda del Country Catalán Style. Él ha sido el iniciador de este estilo en Europa. Más de 20 años sobre las tablas, sus coreografías han conquistado festivales internacionales. Un evento importante requiere su presencia y su estilo inconfundible."
      },
      {
        name: "Montse Moscardó",
        role: "Coreógrafa & instructora",
        body:
          "Nombre imprescindible del circuito Catalán Country Style. Coreografías cuidadas al detalle, llenas de energía, que se bailan en centenares de eventos en toda Europa."
      },
      {
        name: "Jonathan Jones",
        role: "Cantautor folk-country / Singer-songwriter",
        body:
          "Un DJ, auténtica leyenda en Europa, domina la pista con los temas que te propone bailar, vuelve loca la pista con su simpatía y presencia. Imprescindible para nosotros."
      }
    ],
    locationKicker: "UBICACIÓN",
    inBarcelona: "FIRA CORNELLÀ!",
    mapTitle: "Mapa de Fira de Cornellà",
    date: "FIRA CORNELLÀ · 22–24 OCT 2027",
    contactTitle: "MANTENTE INFORMADO",
    formName: "Nombre",
    formPhone: "Número de teléfono",
    formEmail: "Correo electrónico",
    formDanceLocation: "¿Dónde sueles bailar?",
    footer: "© 2027 Barcelona Country Festival · Todos los derechos reservados · Yeehaw!"
  },
  ca: {
    languageName: "Català",
    nav: ["INICI", "FESTIVAL", "ARTISTES", "PROGRAMA", "UBICACIÓ", "CONTACTE"],
    heroKicker: "FIRA CORNELLÀ · 22–24 D'OCTUBRE DE 2027",
    heroCopy:
      "L'esdeveniment internacional de country arriba a Barcelona. Tres dies de line dance, música en directe i esperit americà.",
    cta: "Manten-te informat",
    triad: ["BALL", "MÚSICA", "AMÈRICA"],
    festivalTitle: "El Festival",
    festivalCopy:
      "Barcelona Country Festival reuneix durant tres dies el millor del line dance internacional, música en directe, productes western i food trucks amb autèntica barbacoa americana. Un esdeveniment per a ballarins, famílies i amants del country que volen viure l'esperit americà sense sortir de Barcelona.",
    days: "Dies",
    internationalArtists: "ARTISTES\nINTERNACIONALS",
    expectedDancers: "BALLARINS",
    artistsTitle: "Artistes internacionals",
    artists: [
      {
        name: "Pol F. Ryan",
        role: "Coreògraf internacional",
        body:
          "Referent internacional del Line Dance Catalan Style i figura molt cotitzada arreu del món. Les seves coreografies es ballen per tota Europa i combinen energia americana amb sabor mediterrani. Un autèntic huracà a la pista."
      },
      {
        name: "Algaly Fofana",
        role: "Coreògraf & instructor",
        body:
          "Una de les figures joves més fresques del Line Dance europeu. La seva presència és necessària als esdeveniments més importants i ha portat el seu estil a Bèlgica, Espanya i Itàlia amb coreografies virals."
      },
      {
        name: "David Villellas",
        role: "Coreògraf & instructor",
        body:
          "Autèntica llegenda del Country Catalan Style i iniciador d'aquest estil a Europa. Més de 20 anys sobre els escenaris i coreografies que han conquerit festivals internacionals. La seva presència és imprescindible."
      },
      {
        name: "Montse Moscardó",
        role: "Coreògrafa & instructora",
        body:
          "Nom imprescindible del circuit Catalan Country Style. Coreografies cuidades al detall, plenes d'energia, que es ballen en centenars d'esdeveniments arreu d'Europa."
      },
      {
        name: "Jonathan Jones",
        role: "Cantautor folk-country",
        body:
          "Un DJ, autèntica llegenda a Europa, que domina la pista amb els temes que proposa. La seva simpatia i presència fan embogir el públic. Imprescindible per a nosaltres."
      }
    ],
    locationKicker: "UBICACIÓ",
    inBarcelona: "FIRA CORNELLÀ!",
    mapTitle: "Mapa de Fira de Cornellà",
    date: "FIRA CORNELLÀ · 22–24 OCT 2027",
    contactTitle: "MANTEN-TE INFORMAT",
    formName: "Nom",
    formPhone: "Número de telèfon",
    formEmail: "Correu electrònic",
    formDanceLocation: "On acostumes a ballar?",
    footer: "© 2027 Barcelona Country Festival · Tots els drets reservats · Yeehaw!"
  },
  fr: {
    languageName: "Français",
    nav: ["ACCUEIL", "FESTIVAL", "ARTISTES", "PROGRAMME", "LIEU", "CONTACT"],
    heroKicker: "FIRA CORNELLÀ · 22–24 OCTOBRE 2027",
    heroCopy:
      "L'événement country international arrive à Barcelone. Trois jours de line dance, de musique live et d'esprit américain.",
    cta: "Restez informé",
    triad: ["DANSE", "MUSIQUE", "AMÉRIQUE"],
    festivalTitle: "Le Festival",
    festivalCopy:
      "Barcelona Country Festival réunit pendant trois jours le meilleur du line dance international, de la musique live, des produits western et des food trucks avec un authentique barbecue américain. Un événement pour les danseurs, les familles et les amoureux du country qui souhaitent vivre le véritable esprit américain sans quitter Barcelone.",
    days: "Jours",
    internationalArtists: "ARTISTES\nINTERNATIONAUX",
    expectedDancers: "DANSEURS",
    artistsTitle: "Artistes internationaux",
    artists: [
      {
        name: "Pol F. Ryan",
        role: "Chorégraphe international",
        body:
          "Référence internationale du Line Dance Catalan Style et artiste très demandé dans le monde entier. Ses chorégraphies dansées partout en Europe mêlent énergie américaine et saveur méditerranéenne. Un véritable ouragan sur la piste."
      },
      {
        name: "Algaly Fofana",
        role: "Chorégraphe & instructeur",
        body:
          "L'une des jeunes figures les plus prometteuses du Line Dance européen. Présent dans les plus grands événements, il a porté son style en Belgique, en Espagne et en Italie grâce à des chorégraphies virales."
      },
      {
        name: "David Villellas",
        role: "Chorégraphe & instructeur",
        body:
          "Véritable légende du Country Catalan Style et initiateur de ce style en Europe. Plus de 20 ans sur scène et des chorégraphies qui ont conquis les festivals internationaux. Sa présence est incontournable."
      },
      {
        name: "Montse Moscardó",
        role: "Chorégraphe & instructrice",
        body:
          "Un nom incontournable du Catalan Country Style. Ses chorégraphies soignées, pleines d'énergie, sont dansées lors de centaines d'événements partout en Europe."
      },
      {
        name: "Jonathan Jones",
        role: "Auteur-compositeur folk-country",
        body:
          "DJ et véritable légende en Europe, il domine la piste avec ses sélections. Sa sympathie et sa présence font vibrer le public. Indispensable pour nous."
      }
    ],
    locationKicker: "LIEU",
    inBarcelona: "FIRA CORNELLÀ!",
    mapTitle: "Carte de la Fira de Cornellà",
    date: "FIRA CORNELLÀ · 22–24 OCT. 2027",
    contactTitle: "RESTEZ INFORMÉ",
    formName: "Nom",
    formPhone: "Téléphone",
    formEmail: "E-mail",
    formDanceLocation: "Où dansez-vous habituellement ?",
    footer: "© 2027 Barcelona Country Festival · Tous droits réservés · Yeehaw!"
  },
  en: {
    languageName: "English",
    nav: ["HOME", "FESTIVAL", "ARTISTS", "PROGRAM", "LOCATION", "CONTACT"],
    heroKicker: "FIRA CORNELLÀ · OCTOBER 22–24, 2027",
    heroCopy:
      "The international country event arrives in Barcelona. Three days of line dance, live music and American spirit.",
    cta: "Stay informed",
    triad: ["DANCE", "MUSIC", "AMERICA"],
    festivalTitle: "The Festival",
    festivalCopy:
      "Barcelona Country Festival brings together three days of international line dance, live music, quality western products and food trucks with authentic American barbecue. An event for dancers, families and country lovers looking for the real American spirit in Barcelona.",
    days: "Days",
    internationalArtists: "INTERNATIONAL\nARTISTS",
    expectedDancers: "DANCERS",
    artistsTitle: "International Artists",
    artists: [
      {
        name: "Pol F. Ryan",
        role: "International choreographer",
        body:
          "An international Catalan Style Line Dance icon and a highly sought-after performer worldwide. His choreographies are danced across Europe, blending American energy with Mediterranean flavor. A true force on the dance floor."
      },
      {
        name: "Algaly Fofana",
        role: "Choreographer & instructor",
        body:
          "One of the freshest young figures in European Line Dance. A must at the biggest events, he has taken his style to Belgium, Spain and Italy through viral choreographies."
      },
      {
        name: "David Villellas",
        role: "Choreographer & instructor",
        body:
          "A true Catalan Country Style legend and the pioneer of this style in Europe. After more than 20 years on stage, his choreographies have conquered international festivals. Every major event needs his unmistakable presence."
      },
      {
        name: "Montse Moscardó",
        role: "Choreographer & instructor",
        body:
          "An essential name in the Catalan Country Style scene. Her precise, energetic choreographies are danced at hundreds of events throughout Europe."
      },
      {
        name: "Jonathan Jones",
        role: "Folk-country singer-songwriter",
        body:
          "A DJ and true European legend who commands the floor with every track he selects. His humor and stage presence drive the crowd wild. Essential to us."
      }
    ],
    locationKicker: "LOCATION",
    inBarcelona: "FIRA CORNELLÀ!",
    mapTitle: "Map of Fira de Cornellà",
    date: "FIRA CORNELLÀ · OCT 22–24, 2027",
    contactTitle: "STAY INFORMED",
    formName: "Name",
    formPhone: "Phone number",
    formEmail: "Email",
    formDanceLocation: "Where do you usually dance?",
    footer: "© 2027 Barcelona Country Festival · All rights reserved · Yeehaw!"
  },
  it: {
    languageName: "Italiano",
    nav: ["HOME", "FESTIVAL", "ARTISTI", "PROGRAMMA", "LUOGO", "CONTATTO"],
    heroKicker: "FIRA CORNELLÀ · 22–24 OTTOBRE 2027",
    heroCopy:
      "L'evento country internazionale arriva a Barcellona. Tre giorni di line dance, musica dal vivo e spirito americano.",
    cta: "Resta informato",
    triad: ["BALLO", "MUSICA", "AMERICA"],
    festivalTitle: "Il Festival",
    festivalCopy:
      "Barcelona Country Festival riunisce per tre giorni il meglio del line dance internazionale, musica dal vivo, prodotti western e food truck con autentico barbecue americano. Un evento pensato per ballerini, famiglie e amanti del country che desiderano vivere l'autentico spirito americano senza lasciare Barcellona.",
    days: "Giorni",
    internationalArtists: "ARTISTI\nINTERNAZIONALI",
    expectedDancers: "BALLERINI",
    artistsTitle: "Artisti internazionali",
    artists: [
      {
        name: "Pol F. Ryan",
        role: "Coreografo internazionale",
        body:
          "Riferimento internazionale del Line Dance Catalan Style. È una figura richiestissima nel mondo country, con esibizioni in tutto il mondo. Ha creato decine di coreografie che si ballano sulle piste di tutta Europa. Il suo stile unisce energia americana e sapore mediterraneo. Un autentico uragano in pista."
      },
      {
        name: "Algaly Fofana",
        role: "Coreografo & istruttore",
        body:
          "Una delle figure giovani più fresche del Line Dance europeo. Presenza necessaria negli eventi più importanti, ha portato il suo stile in Belgio, Spagna e Italia con coreografie virali."
      },
      {
        name: "David Villellas",
        role: "Coreografo & istruttore",
        body:
          "Autentica leggenda del Country Catalan Style e iniziatore di questo stile in Europa. Oltre 20 anni sul palco e coreografie che hanno conquistato festival internazionali. La sua presenza è imprescindibile."
      },
      {
        name: "Montse Moscardó",
        role: "Coreografa & istruttrice",
        body:
          "Nome imprescindibile del Catalan Country Style. Le sue coreografie curate, piene di energia, si ballano in centinaia di eventi in tutta Europa."
      },
      {
        name: "Jonathan Jones",
        role: "Cantautore folk-country",
        body:
          "Un DJ e un'autentica leggenda in Europa, domina la pista con i brani che propone. La sua simpatia e presenza fanno impazzire il pubblico. Per noi è imprescindibile."
      }
    ],
    locationKicker: "LUOGO",
    inBarcelona: "FIRA CORNELLÀ!",
    mapTitle: "Mappa della Fira de Cornellà",
    date: "FIRA CORNELLÀ · 22–24 OTT 2027",
    contactTitle: "RESTA INFORMATO",
    formName: "Nome",
    formPhone: "Telefono",
    formEmail: "Email",
    formDanceLocation: "Dove balli di solito?",
    footer: "© 2027 Barcelona Country Festival · Tutti i diritti riservati · Yeehaw!"
  }
};

const additionalArtistCopies: Record<LanguageKey, Pick<Artist, "name" | "role" | "body">[]> = {
  de: [
    {
      name: "Steve Frapolli",
      role: "Internationaler Country-DJ",
      body: "Italienischer DJ und unverzichtbare Größe bei den großen europäischen Country-Festivals. Jahrzehntelange Erfahrung, Philosoph und Intellektueller der Countrymusik sowie Autor mehrerer Bücher über Musik. Mit präziser Musikauswahl und unerschöpflicher Energie hält er die Tanzfläche in Bewegung."
    },
    {
      name: "Johnny",
      role: "Line-Dance-Coach & Choreograf",
      body: "Gianmarco Rossato verbindet italienische Wurzeln mit internationaler Erfahrung. Seit 2013 entwickelt er Choreografien mit Musikalität, Struktur und einer besonderen Verbindung zu denen, die die Tanzfläche füllen."
    },
    {
      name: "Sofía Balzano",
      role: "Choreografin & Trainerin",
      body: "Eine junge Stimme der europäischen Line-Dance-Szene. Ihre Choreografien verbinden Persönlichkeit, Energie und einen modernen Blick auf den Country Style."
    }
  ],
  es: [
    {
      name: "Steve Frapolli",
      role: "DJ country internacional",
      body: "DJ italiano y figura necesaria en los grandes festivales country europeos. Décadas de experiencia, filósofo e intelectual de la música country, autor de varios libros sobre música. Dispone de una selección musical precisa y una energía inagotable para mantener la pista vibrando."
    },
    {
      name: "Johnny",
      role: "Entrenador y coreógrafo de Line Dance",
      body: "Gianmarco Rossato une ADN italiano y alma internacional. Desde 2013 crea coreografías con musicalidad, estructura y una conexión especial con quienes llenan la pista."
    },
    {
      name: "Sofía Balzano",
      role: "Coreógrafa & instructora",
      body: "Una de las jóvenes figuras de la nueva generación del Line Dance europeo. Sus coreografías combinan personalidad, energía y una mirada actual al Country Style."
    }
  ],
  ca: [
    {
      name: "Steve Frapolli",
      role: "DJ country internacional",
      body: "DJ italià i figura imprescindible als grans festivals country europeus. Dècades d'experiència, filòsof i intel·lectual de la música country, autor de diversos llibres sobre música. Disposa d'una selecció musical precisa i una energia inesgotable per mantenir la pista vibrant."
    },
    {
      name: "Johnny",
      role: "Entrenador i coreògraf de Line Dance",
      body: "Gianmarco Rossato uneix ADN italià i ànima internacional. Des del 2013 crea coreografies amb musicalitat, estructura i una connexió especial amb les persones que omplen la pista."
    },
    {
      name: "Sofía Balzano",
      role: "Coreògrafa & instructora",
      body: "Una de les joves figures de la nova generació del Line Dance europeu. Les seves coreografies combinen personalitat, energia i una mirada actual al Country Style."
    }
  ],
  fr: [
    {
      name: "Steve Frapolli",
      role: "DJ country international",
      body: "DJ italien et figure incontournable des grands festivals country européens. Des décennies d'expérience, philosophe et intellectuel de la musique country, auteur de plusieurs livres sur la musique. Il dispose d'une sélection musicale précise et d'une énergie inépuisable pour faire vibrer la piste."
    },
    {
      name: "Johnny",
      role: "Coach et chorégraphe de Line Dance",
      body: "Gianmarco Rossato unit ses racines italiennes à une âme internationale. Depuis 2013, il crée des chorégraphies avec musicalité, structure et un lien particulier avec celles et ceux qui remplissent la piste."
    },
    {
      name: "Sofía Balzano",
      role: "Chorégraphe & instructrice",
      body: "Une jeune figure de la nouvelle génération du Line Dance européen. Ses chorégraphies mêlent personnalité, énergie et vision actuelle du Country Style."
    }
  ],
  en: [
    {
      name: "Steve Frapolli",
      role: "International country DJ",
      body: "An Italian DJ and an essential figure at major European country festivals. Decades of experience, a philosopher and intellectual of country music, and the author of several books on music. He brings a precise music selection and tireless energy to keep the dance floor buzzing."
    },
    {
      name: "Johnny",
      role: "Line Dance Coach & Choreographer",
      body: "Gianmarco Rossato combines Italian DNA with an international soul. Since 2013, he has created dances built on musicality, structure and a special connection with the people who fill the dance floor."
    },
    {
      name: "Sofía Balzano",
      role: "Choreographer & instructor",
      body: "A young figure in the new generation of European Line Dance. Her choreographies bring together personality, energy and a contemporary take on Country Style."
    }
  ],
  it: [
    {
      name: "Steve Frapolli",
      role: "DJ country internazionale",
      body: "DJ italiano e figura imprescindibile nei grandi festival country europei. Decenni di esperienza, filosofo e intellettuale della musica country, autore di vari libri sulla musica. Dispone di una selezione musicale precisa e di un'energia inesauribile per mantenere la pista vibrante."
    },
    {
      name: "Johnny",
      role: "Coach e coreografo di Line Dance",
      body: "Gianmarco Rossato unisce DNA italiano e anima internazionale. Dal 2013 crea coreografie con musicalità, struttura e un legame speciale con chi riempie la pista."
    },
    {
      name: "Sofía Balzano",
      role: "Coreografa & istruttrice",
      body: "Una giovane figura della nuova generazione del Line Dance europeo. Le sue coreografie uniscono personalità, energia e uno sguardo contemporaneo al Country Style."
    }
  ]
};

const announcedArtistCopies: Record<LanguageKey, Pick<Artist, "name" | "role" | "body">[]> = {
  de: [
    {
      name: "Laura Jones",
      role: "Choreografin & Trainerin",
      body: "Laura Jones ist eine europaweit bekannte Persönlichkeit in der Country-Welt, Trainerin und Choreografin. In der internationalen Szene ist sie für ihre mitreißenden und leicht zugänglichen Choreografien bekannt. Seit zwei Jahrzehnten veranstaltet sie gemeinsam mit ihrem Mann Jonatan das große Event Western Experience in den Niederlanden, ein Pflichttermin auf der Country Tour."
    },
    {
      name: "Silvia Denise",
      role: "Choreografin & Trainerin",
      body: "Silvia Denise ist eine einflussreiche italienische Country-Line-Dance-Trainerin und Choreografin, die in der internationalen Szene für ihre dynamischen Kreationen und ihren leidenschaftlichen Unterricht bekannt ist. Ihr Stil verbindet Tänzerinnen und Tänzer aller Niveaus bei Festivals und Events. Sie ist eine herausragende Förderin des Voghera Country Festival und des Bologna Country Festival."
    },
    {
      name: "Virginie Barjaud",
      role: "Choreografin & Trainerin",
      body: "Virginie Barjaud ist eine bekannte französische Choreografin mit einer starken Verbindung zum Catalan Style. Als Gründerin der Truppe WANTED gibt sie Workshops in ganz Europa und vermittelt ihre Begeisterung und Leidenschaft für die Westernkultur mit beliebten Kreationen wie Backroad."
    },
    {
      name: "Silvia Calsina",
      role: choreographerInstructorLabels.de,
      body: "Silvia Calsina ist eine herausragende Country-Line-Dance-Choreografin und -Trainerin und eine wichtige Referenz für die Verbreitung und Förderung des Country-Tanzes. Bekannt für ihre Technik und ihr Charisma, gibt sie internationale Workshops und zeichnet für beliebte Choreografien verantwortlich, die überall dort die Tanzflächen beleben, wo sie auftritt."
    },
    {
      name: "Neus Lloveras",
      role: choreographerInstructorLabels.de,
      body: "Neus Lloveras ist eine Schlüsselfigur des Country Line Dance und eine der Pionierinnen des Catalan Style. Als Trainerin und Choreografin zeichnet sie sich durch Energie, technische Präzision und dynamische Choreografien aus, die die authentische Westernkultur auf Tanzflächen und internationalen Festivals voranbringen."
    },
    { name: "Edu Roldos", role: eduRoldosRoleLabels.de },
    { name: "DJ Lu", role: "DJ" },
    { name: "Antoine", role: "DJ" }
  ],
  es: [
    {
      name: "Laura Jones",
      role: "Coreógrafa & instructora",
      body: "Laura Jones es una figura europea reconocida en todo el mundo Country, instructora y coreógrafa de. Reconocida en la escena internacional por sus contagiosas y accesibles coreografías. Promueve desde hace dos décadas, junto con su marido Jonatan, el gran evento Western Experience, en Países Bajos, visita obligada en el Country Tour."
    },
    {
      name: "Silvia Denise",
      role: "Coreógrafa & instructora",
      body: "Silvia Denise es una influyente instructora y coreógrafa italiana de Country Line Dance, destacada en la comunidad internacional por sus dinámicas creaciones y su apasionada enseñanza. Su estilo conecta a bailarines de todos los niveles en festivales y eventos. Brillante promotora del gran Voghera Country Festival y del Bologna Country Festival."
    },
    {
      name: "Virginie Barjaud",
      role: "Coreógrafa & instructora",
      body: "Virginie Barjaud es una famosa coreógrafa francesa, muy vinculada al Catalan Style. Fundadora de la troupe WANTED, imparte talleres por toda Europa transmitiendo su entusiasmo y pasión por la cultura western con creaciones populares como Backroad."
    },
    {
      name: "Silvia Calsina",
      role: choreographerInstructorLabels.es,
      body: "Silvia Calsina es una destacada coreógrafa e instructora de Country Line Dance, referente clave en la difusión y promoción del baile country. Reconocida por su técnica y carisma, imparte talleres internacionales y firma populares coreografías que animan las pistas de baile donde actúa."
    },
    {
      name: "Neus Lloveras",
      role: choreographerInstructorLabels.es,
      body: "Neus Lloveras es una referente fundamental del Country Line Dance y una de las pioneras del Catalan Style. Como instructora y coreógrafa, destaca por su energía, precisión técnica y por crear dinámicas coreografías que impulsan la auténtica cultura western en pistas y festivales internacionales."
    },
    { name: "Edu Roldos", role: eduRoldosRoleLabels.es },
    { name: "DJ Lu", role: "DJ" },
    { name: "Antoine", role: "DJ" }
  ],
  ca: [
    {
      name: "Laura Jones",
      role: "Coreògrafa & instructora",
      body: "Laura Jones és una figura europea reconeguda arreu del món country, instructora i coreògrafa. És reconeguda en l'escena internacional per les seves coreografies contagioses i accessibles. Des de fa dues dècades promou, juntament amb el seu marit Jonatan, el gran esdeveniment Western Experience, als Països Baixos, una cita obligada del Country Tour."
    },
    {
      name: "Silvia Denise",
      role: "Coreògrafa & instructora",
      body: "Silvia Denise és una influent instructora i coreògrafa italiana de Country Line Dance, destacada en la comunitat internacional per les seves creacions dinàmiques i el seu ensenyament apassionat. El seu estil connecta ballarins de tots els nivells en festivals i esdeveniments. És una gran promotora del Voghera Country Festival i del Bologna Country Festival."
    },
    {
      name: "Virginie Barjaud",
      role: "Coreògrafa & instructora",
      body: "Virginie Barjaud és una famosa coreògrafa francesa, molt vinculada al Catalan Style. Fundadora de la troupe WANTED, imparteix tallers arreu d’Europa transmetent el seu entusiasme i passió per la cultura western amb creacions populars com Backroad."
    },
    {
      name: "Silvia Calsina",
      role: choreographerInstructorLabels.ca,
      body: "Silvia Calsina és una destacada coreògrafa i instructora de Country Line Dance, referent clau en la difusió i promoció del ball country. Reconeguda per la seva tècnica i carisma, imparteix tallers internacionals i signa coreografies populars que animen les pistes de ball allà on actua."
    },
    {
      name: "Neus Lloveras",
      role: choreographerInstructorLabels.ca,
      body: "Neus Lloveras és una referent fonamental del Country Line Dance i una de les pioneres del Catalan Style. Com a instructora i coreògrafa, destaca per la seva energia, precisió tècnica i per crear coreografies dinàmiques que impulsen l’autèntica cultura western en pistes i festivals internacionals."
    },
    { name: "Edu Roldos", role: eduRoldosRoleLabels.ca },
    { name: "DJ Lu", role: "DJ" },
    { name: "Antoine", role: "DJ" }
  ],
  fr: [
    {
      name: "Laura Jones",
      role: "Chorégraphe & instructrice",
      body: "Laura Jones est une figure européenne reconnue dans le monde de la country, instructrice et chorégraphe. Elle est reconnue sur la scène internationale pour ses chorégraphies contagieuses et accessibles. Depuis deux décennies, elle organise avec son mari Jonatan le grand événement Western Experience, aux Pays-Bas, un rendez-vous incontournable du Country Tour."
    },
    {
      name: "Silvia Denise",
      role: "Chorégraphe & instructrice",
      body: "Silvia Denise est une influente instructrice et chorégraphe italienne de Country Line Dance, reconnue dans la communauté internationale pour ses créations dynamiques et son enseignement passionné. Son style rassemble des danseurs de tous niveaux lors de festivals et d’événements. Elle est une brillante promotrice du Voghera Country Festival et du Bologna Country Festival."
    },
    {
      name: "Virginie Barjaud",
      role: "Chorégraphe & instructrice",
      body: "Virginie Barjaud est une célèbre chorégraphe française, très liée au Catalan Style. Fondatrice de la troupe WANTED, elle anime des ateliers dans toute l’Europe en transmettant son enthousiasme et sa passion pour la culture western à travers des créations populaires comme Backroad."
    },
    {
      name: "Silvia Calsina",
      role: choreographerInstructorLabels.fr,
      body: "Silvia Calsina est une chorégraphe et instructrice de Country Line Dance reconnue, référence majeure dans la diffusion et la promotion de la danse country. Appréciée pour sa technique et son charisme, elle anime des ateliers internationaux et signe des chorégraphies populaires qui font vivre les pistes partout où elle se produit."
    },
    {
      name: "Neus Lloveras",
      role: choreographerInstructorLabels.fr,
      body: "Neus Lloveras est une référence fondamentale du Country Line Dance et l’une des pionnières du Catalan Style. Instructrice et chorégraphe, elle se distingue par son énergie, sa précision technique et ses chorégraphies dynamiques qui font rayonner l’authentique culture western sur les pistes et dans les festivals internationaux."
    },
    { name: "Edu Roldos", role: eduRoldosRoleLabels.fr },
    { name: "DJ Lu", role: "DJ" },
    { name: "Antoine", role: "DJ" }
  ],
  en: [
    {
      name: "Laura Jones",
      role: "Choreographer & instructor",
      body: "Laura Jones is a European figure recognised throughout the country world, an instructor and choreographer. She is known on the international scene for her infectious, accessible choreographies. For two decades, together with her husband Jonatan, she has promoted the major Western Experience event in the Netherlands, an essential stop on the Country Tour."
    },
    {
      name: "Silvia Denise",
      role: "Choreographer & instructor",
      body: "Silvia Denise is an influential Italian Country Line Dance instructor and choreographer, recognised across the international community for her dynamic creations and passionate teaching. Her style connects dancers of every level at festivals and events. She is a leading promoter of the Voghera Country Festival and the Bologna Country Festival."
    },
    {
      name: "Virginie Barjaud",
      role: "Choreographer & instructor",
      body: "Virginie Barjaud is a renowned French choreographer with strong ties to Catalan Style. Founder of the WANTED troupe, she teaches workshops across Europe, sharing her enthusiasm and passion for western culture through popular creations such as Backroad."
    },
    {
      name: "Silvia Calsina",
      role: choreographerInstructorLabels.en,
      body: "Silvia Calsina is a leading Country Line Dance choreographer and instructor, and a key figure in promoting and sharing country dance. Known for her technique and charisma, she teaches international workshops and creates popular choreographies that bring every dance floor she visits to life."
    },
    {
      name: "Neus Lloveras",
      role: choreographerInstructorLabels.en,
      body: "Neus Lloveras is a major figure in Country Line Dance and one of the pioneers of Catalan Style. As an instructor and choreographer, she stands out for her energy, technical precision and dynamic choreographies that advance authentic western culture on dance floors and at international festivals."
    },
    { name: "Edu Roldos", role: eduRoldosRoleLabels.en },
    { name: "DJ Lu", role: "DJ" },
    { name: "Antoine", role: "DJ" }
  ],
  it: [
    {
      name: "Laura Jones",
      role: "Coreografa & istruttrice",
      body: "Laura Jones è una figura europea riconosciuta nel mondo country, istruttrice e coreografa. È conosciuta sulla scena internazionale per le sue coreografie coinvolgenti e accessibili. Da due decenni promuove, insieme al marito Jonatan, il grande evento Western Experience nei Paesi Bassi, una tappa imperdibile del Country Tour."
    },
    {
      name: "Silvia Denise",
      role: "Coreografa & istruttrice",
      body: "Silvia Denise è un’influente istruttrice e coreografa italiana di Country Line Dance, apprezzata nella comunità internazionale per le sue creazioni dinamiche e il suo insegnamento appassionato. Il suo stile unisce ballerini di ogni livello in festival ed eventi. È una brillante promotrice del Voghera Country Festival e del Bologna Country Festival."
    },
    {
      name: "Virginie Barjaud",
      role: "Coreografa & istruttrice",
      body: "Virginie Barjaud è una celebre coreografa francese, molto legata al Catalan Style. Fondatrice della troupe WANTED, tiene workshop in tutta Europa trasmettendo entusiasmo e passione per la cultura western con creazioni popolari come Backroad."
    },
    {
      name: "Silvia Calsina",
      role: choreographerInstructorLabels.it,
      body: "Silvia Calsina è una rinomata coreografa e istruttrice di Country Line Dance, punto di riferimento nella diffusione e promozione del ballo country. Conosciuta per tecnica e carisma, tiene workshop internazionali e firma coreografie popolari che animano le piste ovunque si esibisca."
    },
    {
      name: "Neus Lloveras",
      role: choreographerInstructorLabels.it,
      body: "Neus Lloveras è un riferimento fondamentale del Country Line Dance e una delle pioniere del Catalan Style. Come istruttrice e coreografa si distingue per energia, precisione tecnica e coreografie dinamiche che valorizzano l’autentica cultura western sulle piste e nei festival internazionali."
    },
    { name: "Edu Roldos", role: eduRoldosRoleLabels.it },
    { name: "DJ Lu", role: "DJ" },
    { name: "Antoine", role: "DJ" }
  ]
};

const artistLayouts: Omit<Artist, "name" | "role" | "body">[] = [
  {
    image: "/assets/artist-pol.png",
    instagram: "https://www.instagram.com/polfryann/",
    x: 6,
    y: 1930
  },
  {
    image: "/assets/artist-algaly-new.webp",
    instagram: "https://www.instagram.com/algalyfofana/",
    x: 326,
    y: 1930,
    imageFit: "stretch"
  },
  {
    image: "/assets/artist-david.png",
    instagram: "https://www.instagram.com/david.villellas/",
    x: 646,
    y: 1930
  },
  {
    image: "/assets/artist-montse.png",
    instagram: "https://www.instagram.com/montse.moscardo/",
    x: 966,
    y: 1930,
    imageFit: "montse"
  },
  {
    image: "/assets/artist-david-prestor.jpg",
    x: 6,
    y: 2640
  },
  {
    image: "/assets/artist-jonathan-closeup.webp",
    instagram: "https://www.instagram.com/jonathan_jones_music/",
    x: 6,
    y: 2640,
    imageFit: "jonathan"
  },
  {
    image: "/assets/artist-steve.jpg",
    instagram: "https://www.instagram.com/steve_frapolli/",
    x: 326,
    y: 2640,
    imageFit: "steve"
  },
  {
    image: "/assets/artist-johnny.jpg",
    instagram: "https://www.instagram.com/learnwithjohnny/",
    x: 646,
    y: 2640,
    imageFit: "johnny"
  },
  {
    image: "/assets/artist-sofia.jpg",
    instagram: "https://www.instagram.com/sofiabalzanoo_/",
    x: 966,
    y: 2640,
    imageFit: "sofia"
  }
];

const artistCardMetrics = {
  width: 308,
  photoInset: 5,
  nameTop: 322,
  roleTop: 367,
  bodyTop: 420,
  bodyWidth: 278
};

const artistDisplayOrder = [
  "Pol F. Ryan",
  "Algaly Fofana",
  "David Villellas",
  "Sofía Balzano",
  "Montse Moscardó",
  "Johnny",
  "David Prestor",
  "Laura Jones",
  "Silvia Denise",
  "Virginie Barjaud",
  "Silvia Calsina",
  "Neus Lloveras",
  "Edu Roldos",
  "Jonathan Jones",
  "Steve Frapolli",
  "DJ Lu",
  "Antoine"
] as const;

const getInitialLanguage = (): LanguageKey => {
  try {
    const stored = window.localStorage.getItem("barcelona-country-language") ?? window.localStorage.getItem("bcf-preview-language");
    if (stored && stored in copies) {
      return stored as LanguageKey;
    }
  } catch {
    return "es";
  }

  return "es";
};

const announcedArtistImages: Readonly<Record<string, string>> = {
  "Laura Jones": "/assets/artist-laura-jones.jpg",
  "Silvia Denise": "/assets/artist-silvia-denise.jpg",
  "Virginie Barjaud": "/assets/artist-virginie-barjaud.jpg",
  "Silvia Calsina": "/assets/artist-silvia-calsina.jpg",
  "Neus Lloveras": "/assets/artist-neus-lloveras.jpg",
  "Edu Roldos": "/assets/artist-edu-roldos.webp",
  "DJ Lu": "/assets/artist-dj-lu.jpg",
  "Antoine": "/assets/artist-antoine.jpg"
};

const artistGalleryImages: Readonly<Record<string, readonly string[]>> = {
  "Pol F. Ryan": ["/assets/artist-pol.png"],
  "Algaly Fofana": [
    "/assets/artist-algaly-new.webp",
    "/assets/artists/algaly-fofana/01.webp",
    "/assets/artists/algaly-fofana/02.webp",
    "/assets/artists/algaly-fofana/03.webp",
    "/assets/artists/algaly-fofana/04.webp"
  ],
  "David Villellas": ["/assets/artist-david.png"],
  "Sofía Balzano": ["/assets/artist-sofia.jpg"],
  "Montse Moscardó": ["/assets/artist-montse.png"],
  "Laura Jones": [
    "/assets/artist-laura-jones.jpg",
    "/assets/artists/laura-jones/01.webp",
    "/assets/artists/laura-jones/02.webp",
    "/assets/artists/laura-jones/03.webp",
    "/assets/artists/laura-jones/04.webp"
  ],
  "Silvia Denise": ["/assets/artist-silvia-denise.jpg"],
  "Virginie Barjaud": [
    "/assets/artist-virginie-barjaud.jpg",
    "/assets/artists/virginie-barjaud/01.webp",
    "/assets/artists/virginie-barjaud/02.webp",
    "/assets/artists/virginie-barjaud/03.webp",
    "/assets/artists/virginie-barjaud/04.webp"
  ],
  "Silvia Calsina": [
    "/assets/artist-silvia-calsina.jpg",
    "/assets/artists/silvia-calsina/01.webp",
    "/assets/artists/silvia-calsina/02.webp",
    "/assets/artists/silvia-calsina/03.webp",
    "/assets/artists/silvia-calsina/04.webp"
  ],
  "Neus Lloveras": [
    "/assets/artist-neus-lloveras.jpg",
    "/assets/artists/neus-lloveras/01.webp",
    "/assets/artists/neus-lloveras/02.webp",
    "/assets/artists/neus-lloveras/03.webp",
    "/assets/artists/neus-lloveras/04.webp"
  ],
  "Johnny": [
    "/assets/artist-johnny-portrait-original.jpg",
    "/assets/artists/johnny/01.webp",
    "/assets/artists/johnny/02.webp",
    "/assets/artists/johnny/03.webp",
    "/assets/artists/johnny/04.webp"
  ],
  "David Prestor": [
    "/assets/artist-david-prestor.jpg",
    "/assets/artists/david-prestor/01.webp",
    "/assets/artists/david-prestor/02.webp",
    "/assets/artists/david-prestor/03.webp",
    "/assets/artists/david-prestor/04.webp",
    "/assets/artists/david-prestor/05.webp",
    "/assets/artists/david-prestor/06.webp",
    "/assets/artists/david-prestor/07.webp",
    "/assets/artists/david-prestor/08.webp",
    "/assets/artists/david-prestor/09.webp"
  ],
  "Edu Roldos": ["/assets/artist-edu-roldos.webp"],
  "Jonathan Jones": [
    "/assets/artist-jonathan-closeup.webp",
    "/assets/artists/jonathan-jones/01.webp",
    "/assets/artists/jonathan-jones/02.webp",
    "/assets/artists/jonathan-jones/03.webp",
    "/assets/artists/jonathan-jones/04.webp"
  ],
  "Steve Frapolli": [
    "/assets/artist-steve.jpg",
    "/assets/artists/steve-frapolli/01.webp",
    "/assets/artists/steve-frapolli/02.webp",
    "/assets/artists/steve-frapolli/03.webp",
    "/assets/artists/steve-frapolli/04.webp"
  ],
  "DJ Lu": [
    "/assets/artist-dj-lu.jpg",
    "/assets/artists/dj-lu/01.webp",
    "/assets/artists/dj-lu/02.webp",
    "/assets/artists/dj-lu/03.webp",
    "/assets/artists/dj-lu/04.webp"
  ],
  "Antoine": [
    "/assets/artist-antoine.jpg",
    "/assets/artists/antoine/01.webp",
    "/assets/artists/antoine/02.webp",
    "/assets/artists/antoine/03.webp",
    "/assets/artists/antoine/04.webp"
  ]
};

const createArtists = (copy: Copy, language: LanguageKey): Artist[] => {
  const artistCopy: Pick<Artist, "name" | "role" | "body">[] = [
    ...copy.artists.slice(0, 4),
    {
      name: "David Prestor",
      role: davidPrestorRoleLabels[language],
      body: {
        de: "David Prestor ist ein anerkannter Country-Line-Dance-Choreograf slowenischer Herkunft. Er zeichnet sich durch seine Vielseitigkeit aus und entwickelt Choreografien von Einsteiger- bis zu fortgeschrittenen und dynamischen Niveaus. Zu seinen in der Szene beliebten Titeln gehören On The Road Again und Pay Me My Money Down.",
        es: "David Prestor es un reconocido coreógrafo de Country Line Dance de origen esloveno. Destaca por su versatilidad para crear coreografías que abarcan desde niveles de iniciación hasta avanzados y dinámicos, entre las que se encuentran títulos populares de la escena como On The Road Again o Pay Me My Money Down.",
        ca: "David Prestor és un reconegut coreògraf de Country Line Dance d'origen eslovè. Destaca per la seva versatilitat a l'hora de crear coreografies que van des de nivells d'iniciació fins a avançats i dinàmics, entre les quals hi ha títols populars de l'escena com On The Road Again o Pay Me My Money Down.",
        fr: "David Prestor est un chorégraphe reconnu de Country Line Dance d'origine slovène. Il se distingue par sa polyvalence et crée des chorégraphies allant des niveaux débutants aux niveaux avancés et dynamiques, parmi lesquelles figurent des titres populaires de la scène comme On The Road Again ou Pay Me My Money Down.",
        en: "David Prestor is a renowned Slovenian Country Line Dance choreographer. He stands out for his versatility, creating choreographies that range from beginner level to advanced and dynamic dances, including popular titles on the scene such as On The Road Again and Pay Me My Money Down.",
        it: "David Prestor è un rinomato coreografo sloveno di Country Line Dance. Si distingue per la versatilità con cui crea coreografie che spaziano dai livelli principianti a quelli avanzati e dinamici, tra cui titoli popolari della scena come On The Road Again e Pay Me My Money Down."
      }[language]
    },
    ...copy.artists.slice(4),
    ...additionalArtistCopies[language]
  ];

  const currentArtists = artistCopy.map((artist, index) => ({ ...artistLayouts[index], ...artist }));
  const announcedArtists: Artist[] = announcedArtistCopies[language].map(artist => ({
    ...artist,
    x: 0,
    y: 0,
    image: announcedArtistImages[artist.name]
  }));
  const artistsByName = new Map([...currentArtists, ...announcedArtists].map(artist => [artist.name, artist]));

  return artistDisplayOrder.map(name => artistsByName.get(name)).filter((artist): artist is Artist => Boolean(artist));
};

const createMapsSrc = (language: LanguageKey) =>
  `https://www.google.com/maps?q=Fira+de+Cornell%C3%A0&z=16&hl=${language}&output=embed`;

function useFigmaScale() {
  useEffect(() => {
    const update = () => {
      const scale = Math.min(1, window.innerWidth / 1280);
      const edgeBleed = scale === 1 ? Math.max(0, (window.innerWidth - 1280) / 2) : 0;
      document.documentElement.style.setProperty("--figma-scale", String(scale));
      document.documentElement.style.setProperty("--edge-bleed", `${edgeBleed}px`);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
}

function useScrollJsReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-scrolljs]"));
    if (!nodes.length) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const revealVisibleNodes = () => {
      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
          node.classList.add("is-visible");
        } else if (rect.top > window.innerHeight) {
          node.classList.remove("is-visible");
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else if (entry.boundingClientRect.top > window.innerHeight) {
            entry.target.classList.remove("is-visible");
          } else if (entry.boundingClientRect.top < 0) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -12% 0px"
      }
    );

    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        node.classList.add("is-visible");
      }
      observer.observe(node);
    });

    revealVisibleNodes();
    window.addEventListener("scroll", revealVisibleNodes, { passive: true });
    window.addEventListener("resize", revealVisibleNodes);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", revealVisibleNodes);
      window.removeEventListener("resize", revealVisibleNodes);
    };
  }, []);
}

const revealStyle = (style: CSSProperties = {}, delay = 0): RevealStyle => ({
  ...style,
  "--scrolljs-delay": `${delay}ms`
});

let scrollAnimationFrame = 0;

const easeInOutCubic = (progress: number) =>
  progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

function scrollToTarget(targetId: string) {
  const isMobile = window.matchMedia("(max-width: 640px)").matches;
  const mobileSelector = targetId === "artists" ? ".artists" : targetId === "program" ? "#find" : undefined;
  const selector = isMobile && mobileSelector ? mobileSelector : scrollTargetSelectors[targetId];
  const target = document.querySelector<HTMLElement>(selector) ?? document.getElementById(targetId);
  if (!target) {
    return;
  }

  cancelAnimationFrame(scrollAnimationFrame);

  const start = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const targetTop = Math.min(maxScroll, Math.max(0, target.getBoundingClientRect().top + window.scrollY));
  const distance = targetTop - start;
  const duration = isMobile
    ? Math.min(900, Math.max(420, Math.abs(distance) * 0.24))
    : Math.min(1500, Math.max(760, Math.abs(distance) * 0.42));
  const startTime = performance.now();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, targetTop);
    return;
  }

  const step = (now: number) => {
    const progress = Math.min(1, (now - startTime) / duration);
    window.scrollTo(0, start + distance * easeInOutCubic(progress));

    if (progress < 1) {
      scrollAnimationFrame = requestAnimationFrame(step);
    }
  };

  scrollAnimationFrame = requestAnimationFrame(step);
}

function GoogleMap({ language, title }: { language: LanguageKey; title: string }) {
  const { mapsAllowed, openPreferences } = useCookieConsent();
  const text = registrationCopy[language];
  if (!mapsAllowed) return <section className="map-consent-placeholder" aria-label={title}>
    <p className="map-consent-eyebrow">Fira Cornellà · Barcelona</p>
    <h3>{text.mapTitle}</h3>
    <p>{text.mapDescription}</p>
    <button type="button" onClick={openPreferences}>{text.mapAction}</button>
  </section>;
  return (
    <iframe
      className="google-map-embed"
      src={createMapsSrc(language)}
      title={title}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}

function PhonePrefixSelect({ language }: { language: LanguageKey }) {
  const regionNames = new Intl.DisplayNames([language], { type: "region" });
  const localizedCountries = phoneCountries.map((country) => ({
    ...country,
    name: regionNames.of(country.iso) ?? country.name
  }));
  const [selectedIso, setSelectedIso] = useState(phoneCountries[0].iso);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const labels = interfaceLabels[language];
  const selectedCountry = localizedCountries.find((country) => country.iso === selectedIso) ?? localizedCountries[0];
  const normalizedFilter = filter.trim().toLowerCase();
  const filteredCountries = localizedCountries.filter((country) => {
    const haystack = `${country.name} ${country.dial} ${country.iso}`.toLowerCase();
    return haystack.includes(normalizedFilter);
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [isOpen]);

  const selectCountry = (country: PhoneCountry) => {
    setSelectedIso(country.iso);
    setFilter("");
    setIsOpen(false);
  };

  return (
    <div className="abs phone-wrap" ref={wrapRef}>
      <button
        className="phone-prefix"
        type="button"
        aria-label={labels.phonePrefix}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {selectedCountry.dial}
      </button>
      <input type="hidden" name="phonePrefix" value={selectedCountry.dial} />
      <input type="hidden" name="countryIso" value={selectedCountry.iso} />
      <input className="input input-phone" id="phone" name="phone" type="tel" autoComplete="tel" required maxLength={32} />
      {isOpen && (
        <div className="prefix-menu">
          <input
            className="prefix-search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder={labels.phoneSearch}
            autoFocus
          />
          <div className="prefix-options">
            {filteredCountries.map((country) => (
              <button
                className="prefix-option"
                type="button"
                key={`${country.iso}-${country.dial}`}
                onClick={() => selectCountry(country)}
              >
                <span>{country.dial}</span>
                <strong>{country.name}</strong>
              </button>
            ))}
            {!filteredCountries.length && <p className="prefix-empty">{labels.noResults}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function ArtistCard({ artist }: { artist: Artist }) {
  const bodyLeft = (artistCardMetrics.width - artistCardMetrics.bodyWidth) / 2;

  return (
    <article className="artist-card abs" style={revealStyle({ left: artist.x, top: artist.y }, 80)} data-scrolljs>
      {artist.instagram ? <a
          className="artist-photo artist-photo-link abs"
          style={{ left: artistCardMetrics.photoInset, top: artistCardMetrics.photoInset }}
          href={artist.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Instagram: ${artist.name}`}
        >
          <img className={`artist-image ${artist.imageFit ?? "cover"}`} src={artist.image} alt={artist.name} />
        </a> : <figure className="artist-photo abs" style={{ left: artistCardMetrics.photoInset, top: artistCardMetrics.photoInset }}>
          <img className={`artist-image ${artist.imageFit ?? "cover"}`} src={artist.image} alt={artist.name} />
        </figure>}
      <h3
        className="artist-name abs"
        style={{ left: 0, top: artistCardMetrics.nameTop, width: artistCardMetrics.width }}
        data-text-node="artist-name"
      >
        {artist.name}
      </h3>
      <p
        className="artist-role abs"
        style={{ left: 0, top: artistCardMetrics.roleTop, width: artistCardMetrics.width }}
        data-text-node="artist-role"
      >
        {artist.role}
      </p>
      {artist.body && <p
        className="artist-body abs"
        style={{ left: bodyLeft, top: artistCardMetrics.bodyTop }}
        data-text-node="artist-body"
      >
        {artist.body}
      </p>}
    </article>
  );
}

const getFindItemParts = (item: FindItem) => (typeof item === "string" ? { heading: "", body: item } : item);

const getFindIconAsset = (icon: string) => findIconAssets[icon] ?? findIconAssets.music;

const getFindStops = (card: FindCard, language: LanguageKey) =>
  card.items.map((item, index) => {
    const itemParts = getFindItemParts(item);

    return {
      heading: itemParts.heading || (index === 0 ? card.title : `${interfaceLabels[language].stop} ${String(index + 1).padStart(2, "0")}`),
      body: itemParts.body
    };
  });

function FindSection({ copy, language }: { copy: FindCopy; language: LanguageKey }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveIndex(0);
    carouselRef.current?.scrollTo({ left: 0 });
  }, [copy]);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 640px)").matches) {
      return;
    }

    const tabs = tabsRef.current;
    const activeTab = tabs?.querySelector<HTMLElement>(`[data-tab-index="${activeIndex}"]`);
    if (!tabs || !activeTab) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      tabs.scrollTo({
        left: activeTab.offsetLeft - (tabs.clientWidth - activeTab.offsetWidth) / 2,
        behavior: "smooth"
      });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [activeIndex]);

  const selectSlide = (index: number) => {
    const nextIndex = Math.max(0, Math.min(copy.cards.length - 1, index));
    setActiveIndex(nextIndex);

    if (window.matchMedia("(max-width: 640px)").matches) {
      const carousel = carouselRef.current;
      carousel?.scrollTo({
        left: nextIndex * carousel.clientWidth,
        behavior: "smooth"
      });
    }
  };

  const handleCarouselScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(max-width: 640px)").matches) {
      return;
    }

    const carousel = event.currentTarget;
    const nextIndex = Math.max(0, Math.min(copy.cards.length - 1, Math.round(carousel.scrollLeft / carousel.clientWidth)));
    setActiveIndex((currentIndex) => currentIndex === nextIndex ? currentIndex : nextIndex);
  };

  const titleParts = copy.title.split(" ");
  const titleAccent = titleParts.length > 1 ? titleParts.pop() : "";
  const titleLead = titleParts.join(" ");

  return (
    <section id="find" className="find-section" aria-labelledby="find-title">
      <p className="abs find-kicker" data-text-node="find-kicker" data-scrolljs style={revealStyle({}, 0)}>
        {copy.kicker}
      </p>
      <h2
        id="find-title"
        className="abs western rio find-title"
        data-text-node="find-title"
        data-scrolljs
        style={revealStyle({}, 80)}
      >
        <span>{titleLead}</span> <span className="find-title-accent">{titleAccent}</span>
      </h2>
      <div className="abs find-heading-dots" aria-hidden="true" />
      <p className="abs find-intro" data-scrolljs style={revealStyle({}, 130)}>
        {findIntroLabels[language]}
      </p>
      <div ref={tabsRef} className="abs find-tabs" aria-label={interfaceLabels[language].festivalStops} data-scrolljs style={revealStyle({}, 155)}>
        {copy.cards.map((card, index) => (
          <button
            key={`${card.title}-${index}`}
            className={`find-tab ${index === activeIndex ? "is-active" : ""}`}
            data-tab-index={index}
            type="button"
            aria-current={index === activeIndex}
            onClick={() => selectSlide(index)}
          >
            <span aria-hidden="true">
              <img src={getFindIconAsset(card.icon)} alt="" />
            </span>
            {card.title.split("&")[0].replace(/\bCOUNTRY\b[- ]?/i, "").trim()}
            <small>{String(index + 1).padStart(2, "0")}</small>
          </button>
        ))}
      </div>
      <div
        ref={carouselRef}
        className="abs find-carousel"
        aria-label={copy.kicker}
        data-scrolljs
        style={revealStyle({}, 190)}
        onScroll={handleCarouselScroll}
      >
        <div className="find-track" style={{ "--find-active-index": activeIndex } as CSSProperties}>
          {copy.cards.map((card, cardIndex) => {
            const stops = getFindStops(card, language);
            const stopOffset = copy.cards
              .slice(0, cardIndex)
              .reduce((total, previousCard) => total + previousCard.items.length, 0);

            return (
              <div
                className="find-slide-shell"
                key={`${card.title}-${cardIndex}`}
                aria-hidden={cardIndex !== activeIndex}
              >
                <article className="find-slide">
                  <div className="find-slide-image-wrap">
                    <img className="find-slide-image" src={findVisuals[cardIndex] ?? findVisuals[0]} alt="" />
                    <span className="find-slide-badge" aria-hidden="true">
                      <img src={getFindIconAsset(card.icon)} alt="" />
                    </span>
                  </div>
                  <div className="find-slide-copy">
                    <h3>{card.title}</h3>
                    <p className="find-quote">«{cardIndex === 0 ? findQuoteLabels[language][0] : findQuoteLabels[language][1]}»</p>
                    <div className="find-red-dots" aria-hidden="true" />
                    <ol className="find-stop-list">
                      {stops.map((stop, stopIndex) => (
                        <li key={`${card.title}-${stop.heading}`}>
                          <span className="find-stop-number">{String(stopOffset + stopIndex + 1).padStart(2, "0")}</span>
                          <span className="find-stop-copy">
                            <strong>{stop.heading}</strong>
                            <span>{stop.body}</span>
                          </span>
                        </li>
                      ))}
                    </ol>
                    <div className="find-slide-footer">
                      <span>{cardIndex + 1} / {copy.cards.length}</span>
                      <span className="find-slide-actions">
                        {cardIndex > 0 && (
                          <button
                            className="find-prev"
                            type="button"
                            tabIndex={cardIndex === activeIndex ? 0 : -1}
                            onClick={() => selectSlide(cardIndex - 1)}
                          >
                            <span aria-hidden="true">←</span> {previousStopLabels[language]}
                          </button>
                        )}
                        <button
                          className="find-next"
                          type="button"
                          tabIndex={cardIndex === activeIndex ? 0 : -1}
                          onClick={() => selectSlide((cardIndex + 1) % copy.cards.length)}
                        >
                          {nextStopLabels[language]} <span aria-hidden="true">→</span>
                        </button>
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function App() {
  useFigmaScale();
  useScrollJsReveal();
  const [language, setLanguage] = useState<LanguageKey>(getInitialLanguage);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeNavIndex, setActiveNavIndex] = useState(0);
  const languagePickerRef = useRef<HTMLDivElement | null>(null);
  const copy = copies[language];
  const findCopy = findCopies[language];
  const artists = createArtists(copy, language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    let animationFrame = 0;

    const updateActiveSection = () => {
      animationFrame = 0;
      if (!mediaQuery.matches) {
        setIsMobileNavOpen(false);
        return;
      }

      const marker = window.innerHeight * 0.38;
      let nextIndex = 0;

      mobileSectionSelectors.forEach((selector, index) => {
        const section = document.querySelector<HTMLElement>(selector);
        if (section && section.getBoundingClientRect().top <= marker) {
          nextIndex = index;
        }
      });

      setActiveNavIndex(nextIndex);
    };

    const queueUpdate = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateActiveSection);
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);

    return () => {
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    if (!isMobileNavOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("mobile-nav-open");
    setIsLanguageOpen(false);

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("mobile-nav-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    if (!isLanguageOpen) {
      return;
    }

    const closeLanguageMenu = (event: PointerEvent) => {
      if (!languagePickerRef.current?.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    };
    const closeLanguageMenuOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeLanguageMenu);
    window.addEventListener("keydown", closeLanguageMenuOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeLanguageMenu);
      window.removeEventListener("keydown", closeLanguageMenuOnEscape);
    };
  }, [isLanguageOpen]);

  const handleMobileNavigation = (targetId: string) => {
    setIsMobileNavOpen(false);
    scrollToTarget(targetId);
  };

  const handleLanguageChange = (nextLanguage: LanguageKey) => {
    setLanguage(nextLanguage);
    try { window.localStorage.setItem("barcelona-country-language", nextLanguage); } catch { /* Keep the choice for this visit when browser storage is unavailable. */ }
    setIsLanguageOpen(false);
  };

  return (
    <div className="page">
      <div className="stage" aria-label="Barcelona Country Festival">
        <main className="frame">
          <h1 className="sr-only">Barcelona Country Festival</h1>

          <section id="home" className="hero" aria-labelledby="hero-title">
            <div className="top-line top-line-two" />
            <img className="abs nav-star nav-star-left" src="/assets/nav-star.svg" alt="" />
            <img className="abs nav-star nav-star-right" src="/assets/nav-star.svg" alt="" />
            <button
              className={`mobile-menu-trigger ${isMobileNavOpen ? "is-open" : ""}`}
              type="button"
              aria-label={isMobileNavOpen ? interfaceLabels[language].closeMenu : interfaceLabels[language].menu}
              aria-expanded={isMobileNavOpen}
              aria-controls="primary-navigation"
              onClick={() => setIsMobileNavOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
            <span
              className={`mobile-current-section ${isMobileNavOpen ? "is-menu-open" : ""}`}
              data-section-index={String(activeNavIndex + 1).padStart(2, "0")}
              aria-live="polite"
            >
              {copy.nav[activeNavIndex]}
            </span>
            <nav id="primary-navigation" className={`abs nav ${isMobileNavOpen ? "is-mobile-open" : ""}`} aria-label="Principal">
              {copy.nav.map((item, index) => (
                <button
                  key={item}
                  className={`nav-link ${index === activeNavIndex ? "is-current" : ""}`}
                  type="button"
                  data-text-node="nav-item"
                  data-nav-index={String(index + 1).padStart(2, "0")}
                  aria-current={index === activeNavIndex ? "page" : undefined}
                  onClick={() => {
                    if (window.matchMedia("(max-width: 640px)").matches) {
                      handleMobileNavigation(navTargets[index]);
                      return;
                    }

                    scrollToTarget(navTargets[index]);
                  }}
                >
                  {item}
                </button>
              ))}
            </nav>
            <div className="abs language-picker" ref={languagePickerRef}>
              <button
                className="language-trigger"
                type="button"
                aria-label={interfaceLabels[language].changeLanguage}
                aria-expanded={isLanguageOpen}
                onClick={() => setIsLanguageOpen((open) => !open)}
              >
                <svg className="globe-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18" />
                  <path d="M12 3c2.55 2.55 4 5.78 4 9s-1.45 6.45-4 9c-2.55-2.55-4-5.78-4-9s1.45-6.45 4-9Z" />
                </svg>
                <span className="sr-only">{copy.languageName}</span>
              </button>
              {isLanguageOpen && (
                <div className="language-menu" role="menu">
                  {languageOptions.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      role="menuitem"
                      className={option.key === language ? "active" : ""}
                      onClick={() => handleLanguageChange(option.key)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="abs hero-image">
              <img src="/assets/hero-bg.png" alt="" />
              <div className="hero-scrim" />
            </div>

            <p
              id="hero-title"
              className="abs western rio hero-barcelona"
              data-text-node="hero-barcelona"
              data-scrolljs
              style={revealStyle({}, 0)}
            >
              BARCELONA
            </p>
            <p
              className="abs western rio hero-country"
              data-text-node="hero-country"
              data-scrolljs
              style={revealStyle({}, 80)}
            >
              country
            </p>

            <p className="abs hero-kicker" data-text-node="hero-kicker" data-scrolljs style={revealStyle({}, 150)}>
              {copy.heroKicker}
            </p>
            <p className="abs hero-copy" data-text-node="hero-copy" data-scrolljs style={revealStyle({}, 220)}>
              {copy.heroCopy}
            </p>
            <div className="abs cta hero-cta" data-scrolljs style={revealStyle({}, 300)}>
              <span className="cta-type" data-text-node="hero-cta">
                {copy.cta}
              </span>
              <img className="cta-star" src="/assets/star-button.png" alt="" />
            </div>

            <div className="abs triad" aria-label="Dance music America">
              <span className="triad-word triad-dance" data-text-node="triad-dance" data-scrolljs style={revealStyle({}, 0)}>
                {copy.triad[0]}
              </span>
              <span className="triad-dot triad-dot-one" aria-hidden="true" />
              <span className="triad-word triad-music" data-text-node="triad-music" data-scrolljs style={revealStyle({}, 60)}>
                {copy.triad[1]}
              </span>
              <span className="triad-dot triad-dot-two" aria-hidden="true" />
              <span
                className="triad-word triad-america"
                data-text-node="triad-america"
                data-scrolljs
                style={revealStyle({}, 120)}
              >
                {copy.triad[2]}
              </span>
            </div>
          </section>

          <section id="festival" className="festival" aria-labelledby="festival-title">
            <img className="abs dotted dotted-top" src="/assets/line-blue.svg" alt="" data-scrolljs style={revealStyle({}, 0)} />
            <h2
              id="festival-title"
              className="abs festival-title"
              data-text-node="festival-title"
              data-scrolljs
              style={revealStyle({}, 80)}
            >
              {copy.festivalTitle}
            </h2>
            <p className="abs festival-copy" data-text-node="festival-copy" data-scrolljs style={revealStyle({}, 140)}>
              {copy.festivalCopy}
            </p>
            <div className="abs stat stat-one" data-scrolljs style={revealStyle({}, 80)}>
              <strong data-text-node="stat-value">3</strong>
              <span data-text-node="stat-label">{copy.days}</span>
            </div>
            <div className="abs stat stat-two" data-scrolljs style={revealStyle({}, 150)}>
              <strong data-text-node="stat-value">{festivalStatValues.artists}</strong>
              <span data-text-node="stat-label">{copy.internationalArtists}</span>
            </div>
            <div className="abs stat stat-three" data-scrolljs style={revealStyle({}, 220)}>
              <strong data-text-node="stat-value">{festivalStatValues.dancers}</strong>
              <span data-text-node="stat-label">{copy.expectedDancers}</span>
            </div>
            <img className="abs dotted dotted-bottom" src="/assets/line-blue.svg" alt="" />
            <div className="abs red-band" />
          </section>

          <section id="artists" className="artists" aria-labelledby="artists-title">
            <div className="abs artists-background" aria-hidden="true" />
            <h2
              id="artists-title"
              className="abs artists-heading"
              data-text-node="artists-title"
              data-scrolljs
              style={revealStyle({}, 0)}
            >
              {copy.artistsTitle}
            </h2>
            <div className="artists-track">
              {artists.map((artist) => (
                <ArtistCard key={artist.name} artist={artist} />
              ))}
            </div>
          </section>

          <FindSection copy={findCopy} language={language} />

          <section id="location" className="location" aria-labelledby="location-title">
            <div className="abs location-panel" />
            <p className="abs location-kicker" data-text-node="location-kicker" data-scrolljs style={revealStyle({}, 0)}>
              {copy.locationKicker}
            </p>
            <p className="abs western rio text-yeehaw" data-text-node="location-yeehaw" data-scrolljs style={revealStyle({}, 80)}>
              Yeehaw!
            </p>
            <p
              className="abs western rustler text-en-barcelona"
              data-text-node="location-en-barcelona"
              data-scrolljs
              style={revealStyle({}, 150)}
            >
              {copy.inBarcelona}
            </p>
            <div className="abs location-visual-group" data-scrolljs style={revealStyle({}, 180)}>
              <div className="abs map-placeholder" aria-label={copy.mapTitle}>
                <GoogleMap language={language} title={copy.mapTitle} />
              </div>
              <div id="program" className="abs date-banner">
                <img className="date-wood" src="/assets/wood-banner.png" alt="" />
              </div>
              <img className="abs date-star date-star-left" src="/assets/star-button.png" alt="" />
              <img className="abs date-star date-star-right" src="/assets/star-button.png" alt="" />
              <p className="abs western rustler text-date" data-text-node="location-date">
                {copy.date}
              </p>
            </div>
          </section>

          <section id="contact" className="contact" aria-labelledby="contact-title">
            <div className="abs contact-pattern" aria-hidden="true" />
            <h2
              id="contact-title"
              className="abs western rustler text-mantente"
              data-text-node="contact-title"
              data-scrolljs
              style={revealStyle({}, 0)}
            >
              {copy.contactTitle}
            </h2>
            <div
              className="abs contact-form"
              aria-label={interfaceLabels[language].form}
              data-scrolljs
              style={revealStyle({}, 100)}
            >
              <fieldset disabled className="archive-form-fields">
              <label className="abs label label-name" htmlFor="name" data-text-node="form-label">
                {copy.formName}
              </label>
              <input className="abs input input-name" id="name" name="name" type="text" autoComplete="name" required maxLength={160} />

              <label className="abs label label-phone" htmlFor="phone" data-text-node="form-label">
                {copy.formPhone}
              </label>
              <PhonePrefixSelect language={language} />

              <label className="abs label label-email" htmlFor="email" data-text-node="form-label">
                {copy.formEmail}
              </label>
              <input className="abs input input-email" id="email" name="email" type="email" autoComplete="email" required maxLength={320} />
              </fieldset>
              <a className="abs cta bottom-cta" href="/#contact">
                <span className="cta-type" data-text-node="contact-cta">
                  {newsCopy[language].back}
                </span>
                <img className="cta-star" src="/assets/star-button.png" alt="" />
              </a>
              <p className="contact-form-status archive-form-notice">{({ es: "Formulario de archivo. Regístrate en la web actual.", ca: "Formulari d'arxiu. Registra't al web actual.", en: "Archived form. Register on the current website.", fr: "Formulaire archivé. Inscrivez-vous sur le site actuel.", it: "Modulo archiviato. Registrati sul sito attuale.", de: "Archiviertes Formular. Registriere dich auf der aktuellen Website." })[language]}</p>
            </div>
          </section>

          <footer className="abs footer" data-scrolljs style={revealStyle({}, 0)}>
            <img className="abs footer-line" src="/assets/line-full.svg" alt="" />
            <p className="abs western rio footer-barcelona" data-text-node="footer-barcelona">
              BARCELONA
            </p>
            <p className="abs western rio footer-country" data-text-node="footer-country">
              country
            </p>
            <p className="abs footer-copy" data-text-node="footer-copy">
              {copy.footer}
            </p>
          </footer>
        </main>
      </div>
      <footer className="archive-privacy-links"><a href="/privacidad">{newsCopy[language].privacy}</a><a href="/aviso-legal">{newsCopy[language].legal}</a><a href="/cookies">{newsCopy[language].cookies}</a><CookiePreferencesButton language={language} /></footer>
    </div>
  );
}

function ModernPhonePrefixSelect({ language }: { language: LanguageKey }) {
  const prefixLabels = { es: "Prefijo telefónico", ca: "Prefix telefònic", en: "Phone prefix", fr: "Indicatif téléphonique", it: "Prefisso telefonico", de: "Telefonvorwahl" };
  const regionNames = new Intl.DisplayNames([language], { type: "region" });
  const localizedCountries = phoneCountries.map((country) => ({
    ...country,
    name: regionNames.of(country.iso) ?? country.name
  }));
  const [selectedIso, setSelectedIso] = useState(phoneCountries[0].iso);
  const selectedCountry = localizedCountries.find((country) => country.iso === selectedIso) ?? localizedCountries[0];

  return (
    <div className="modern-phone-field">
      <div className="modern-phone-row">
        <label htmlFor="phone-prefix"><span>{prefixLabels[language]}</span>
        <select id="phone-prefix" value={selectedIso} onChange={(event) => setSelectedIso(event.target.value)}>
          {localizedCountries.map((country) => (
            <option key={`${country.iso}-${country.dial}`} value={country.iso}>
              {countryFlag(country.iso)} {country.name} ({country.dial})
            </option>
          ))}
        </select>
        </label>
        <input type="hidden" name="phonePrefix" value={selectedCountry.dial} />
        <input type="hidden" name="countryIso" value={selectedCountry.iso} />
        <label htmlFor="phone"><span>{copies[language].formPhone}</span>
        <input id="phone" name="phone" type="tel" autoComplete="tel" required maxLength={32} />
        </label>
      </div>
    </div>
  );
}

function FestivalDatePoster({ date, variant = "default" }: { date: FestivalDate; variant?: "hero" | "default" }) {
  return (
    <div className={`modern-date-poster modern-date-poster--${variant}`} aria-label={`${date.city}, ${date.days} ${date.month} ${date.year}`}>
      <span className="modern-date-poster-city">{date.city}</span>
      <strong>{date.days}</strong>
      <span className="modern-date-poster-month">{date.month}</span>
      <span className="modern-date-poster-year">{date.year}</span>
    </div>
  );
}

function ModernFindSection({ copy, language }: { copy: FindCopy; language: LanguageKey }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCard = copy.cards[activeIndex];
  const stops = getFindStops(activeCard, language);
  return <section id="program" className="c-experiences c-section" aria-labelledby="c-experiences-title">
    <div className="c-section-head" data-reveal><div><h2 id="c-experiences-title">{copy.title.toLocaleLowerCase(language)}</h2></div></div>
    <div className="c-tabs" role="tablist" aria-label={interfaceLabels[language].festivalStops}>
      {copy.cards.map((card, index) => <button key={card.title} id={`experience-tab-${index}`} type="button" role="tab" aria-controls="c-experience-panel" aria-selected={index === activeIndex}
        onPointerEnter={event => { if (event.pointerType === "mouse") setActiveIndex(index); }} onFocus={() => setActiveIndex(index)} onClick={() => setActiveIndex(index)}>
        <small>{String(index + 1).padStart(2, "0")}</small><span>{card.title.toLocaleLowerCase(language)}</span>
      </button>)}
    </div>
    <article id="c-experience-panel" className="c-experience-panel" role="tabpanel" aria-labelledby={`experience-tab-${activeIndex}`}>
      <div className="c-experience-photo"><img key={activeIndex} src={assetPath(findVisuals[activeIndex])} alt="" loading="lazy" /></div>
      <div className="c-experience-copy" key={`${activeIndex}-${language}`}>

        <div className="c-stops">{stops.map((stop, index) => <details key={stop.heading} open={index === 0}>
          <summary><small>{String(index + 1).padStart(2, "0")}</small><span>{stop.heading.replace(/:$/, "").toLocaleLowerCase(language)}</span><i aria-hidden="true" /></summary>
          <p>{stop.body}</p>
        </details>)}</div>
        <div className="c-chapter-controls"><button type="button" disabled={activeIndex === 0} onClick={() => setActiveIndex(i => i - 1)}><ArrowIcon direction="left" />{previousStopLabels[language]}</button><button type="button" onClick={() => setActiveIndex(i => (i + 1) % copy.cards.length)}>{nextStopLabels[language]}<ArrowIcon /></button></div>
      </div>
    </article>
  </section>;
}

function ModernApp() {
  const [language, setLanguage] = useState<LanguageKey>(getInitialLanguage);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [activeGalleryArtist, setActiveGalleryArtist] = useState<string | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [railState, setRailState] = useState({ first: 1, start: true, end: false });
  const railIndicator = useRef<HTMLSpanElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const carousel = useArtistCarousel(rail);
  const { scope, scrollTo } = useFestivalMotion(language);
  const copy = copies[language];
  const date = festivalDates[language];
  const newsletter = newsCopy[language];
  const registration = registrationCopy[language];
  const ui = siteCopy[language];
  const refinement = refinementCopy[language];
  const mystery = mysteryArtistCopies[language];
  const artists = createArtists(copy, language);
  const artistCardTotal = artists.length;
  const activeGalleryImages = activeGalleryArtist
    ? artistGalleryImages[activeGalleryArtist].map(image => assetPath(image))
    : [];
  const sentenceEnd = copy.heroCopy.indexOf(". ");

  useEffect(() => { document.documentElement.lang = language; }, [language]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setIsNavigationOpen(false); setIsLanguageMenuOpen(false); } };
    window.addEventListener("keydown", escape);
    return () => { window.removeEventListener("keydown", escape); };
  }, []);
  const moveTo = (target: string) => {
    scrollTo(target);
    setIsNavigationOpen(false); setIsLanguageMenuOpen(false);
  };
  const openContact = () => { setIsContactOpen(true); setIsNavigationOpen(false); setIsLanguageMenuOpen(false); };
  const changeLanguage = (next: LanguageKey) => {
    setLanguage(next); setFormFeedback(null); setIsLanguageMenuOpen(false);
    try { localStorage.setItem("barcelona-country-language", next); } catch { /* Session choice remains available. */ }
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const fullName = String(data.get("name") ?? "").trim();
    const prefix = String(data.get("phonePrefix") ?? "").trim();
    const countryIso = String(data.get("countryIso") ?? "").trim().toUpperCase();
    const phoneNumber = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const danceLocation = String(data.get("danceLocation") ?? "").trim();

    if (isFormSubmitting) return;
    setIsFormSubmitting(true);
    setFormFeedback(null);
    try {
      const response = await fetch(sitePath("/api/newsletter"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "subscribe",
          full_name: fullName,
          phone: `${prefix} ${phoneNumber}`.trim(),
          country_iso: countryIso,
          email,
          dance_location: danceLocation,
          locale: language,
          consent: true,
          privacy_accepted: data.get("privacyAccepted") === "on",
          website: data.get("website")
        })
      });
      const result = await response.json();
      if (!response.ok) {
        setFormFeedback({ type: "error", message: result.error === "duplicate" ? newsletter.duplicate : formFeedbackLabels[language].error });
        return;
      }
      form.reset();
      setFormFeedback({ type: "success", message: `${newsletter.success}${result.welcome_email === "sent" ? ` ${newsletter.sent}` : ""}` });
    } catch {
      setFormFeedback({ type: "error", message: formFeedbackLabels[language].error });
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return <CookieConsentProvider language={language}><div ref={scope} className="cinematic">
    <a className="c-skip" href="#festival">{copy.festivalTitle}</a>
    <header className="c-header is-scrolled">
      <nav className="c-nav" aria-label="Principal">
        <div id="c-navigation" className={`c-nav-links ${isNavigationOpen ? "is-open" : ""}`}>
          <div className="c-nav-group c-nav-left">{copy.nav.slice(1, 4).map((item, index) => <button type="button" key={item} onClick={() => moveTo(navTargets[index + 1])}>{item.toLocaleLowerCase(language)}</button>)}</div>
          <div className="c-nav-group c-nav-right"><button type="button" onClick={() => moveTo("location")}>{copy.nav[4].toLocaleLowerCase(language)}</button><a className="c-blog-link" href={sitePath("/blog")}>Blog</a><button type="button" onClick={openContact}>{refinement.contact}</button></div>
        </div>
        <a className="c-logo" href="#home" aria-label="Barcelona Country Festival"><img src={assetPath("/assets/brand-logo-nav.png")} alt="Barcelona Country Festival" width="1536" height="1024" /></a>
        <div className="c-language">
          <button className="c-language-trigger" type="button" aria-label={interfaceLabels[language].changeLanguage} aria-expanded={isLanguageMenuOpen} aria-controls="c-language-options" onClick={() => { setIsLanguageMenuOpen(!isLanguageMenuOpen); setIsNavigationOpen(false); }}>
            {language.toUpperCase()}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 6 5 5 5-5" /></svg>
          </button>
          {isLanguageMenuOpen && <div className="c-language-menu" id="c-language-options">{languageOptions.map(option => <button type="button" key={option.key} aria-pressed={option.key === language} onClick={() => changeLanguage(option.key)}><span aria-hidden="true">{option.icon}</span>{option.label}</button>)}</div>}
        </div>
        <button className={`c-menu-toggle ${isNavigationOpen ? "is-open" : ""}`} type="button" aria-label={isNavigationOpen ? interfaceLabels[language].closeMenu : interfaceLabels[language].menu} aria-controls="c-navigation" aria-expanded={isNavigationOpen} onClick={() => { setIsNavigationOpen(!isNavigationOpen); setIsLanguageMenuOpen(false); }}><span /><span /></button>
      </nav>
    </header>
    <main>
      <section id="home" className="c-hero" aria-labelledby="c-hero-title">
        <img className="c-hero-photo" src={assetPath("/assets/hero-festival-1672.webp")} srcSet={`${assetPath("/assets/hero-festival-840.webp")} 840w, ${assetPath("/assets/hero-festival-1672.webp")} 1672w`} sizes="(max-aspect-ratio: 16/9) 192svh, 100vw" width="1672" height="941" alt="" fetchPriority="high" />
        <div className="c-hero-shade" />
        <div className="c-mobile-reveal" aria-hidden="true"><img src={assetPath("/assets/brand-isotype.png")} alt="" width="110" height="110" /></div>
        <div className="c-hero-light" aria-hidden="true" />
        <div className="c-hero-curtain c-hero-curtain-left" aria-hidden="true" /><div className="c-hero-curtain c-hero-curtain-right" aria-hidden="true" />
        <div className="c-hero-content">

          <h1 className="c-hero-title" id="c-hero-title"><span className="c-title-line c-title-city"><span>Barcelona</span></span><span className="c-title-line c-title-festival"><span>Country Festival</span></span></h1>
          <p className="c-hero-date"><strong>{date.days}</strong><span>{date.month} {date.year}</span><i /><span>{date.city}</span></p>
          <FestivalCountdown language={language} />
        </div>
        <div className="c-hero-actions"><div className="c-hero-buttons"><button type="button" className="c-primary-action" onClick={() => moveTo("newsletter")}><span>{copy.cta}</span><i><ArrowIcon direction="up-right" /></i></button><button type="button" className="c-secondary-action" onClick={openContact}><span>{refinement.contact}</span><ArrowIcon direction="up-right" /></button></div><button className="c-scroll-cue" type="button" aria-label={copy.festivalTitle} onClick={() => moveTo("festival")}><i><ArrowIcon direction="down" /></i></button></div>
      </section>

      <section id="festival" className="c-festival c-section" aria-labelledby="c-festival-title">

        <p className="c-intro-line" data-reveal>{sentenceEnd > -1 ? copy.heroCopy.slice(0, sentenceEnd + 1) : ""}</p>
        <h2 className="c-statement" id="c-festival-title" data-reveal>{sentenceEnd > -1 ? copy.heroCopy.slice(sentenceEnd + 2) : copy.heroCopy}</h2>
        <div className="c-festival-story"><p data-reveal>{refinement.storyBefore}<strong>Barcelona Country Festival</strong>{refinement.storyAfter}</p><figure><img className="c-parallax" src={assetPath("/assets/backgrounds/festival-live.jpg")} alt="" loading="lazy" /></figure></div>
        <div className="c-stats" data-reveal>
          <div><strong>3</strong><span>{copy.days.toLocaleLowerCase(language)}</span></div>
          <div><strong>{festivalStatValues.artists}</strong><span>{copy.internationalArtists.toLocaleLowerCase(language)}</span></div>
          <div className="c-stat-dancers"><strong>{festivalStatValues.dancers}</strong><span>{copy.expectedDancers.toLocaleLowerCase(language)}</span></div>
        </div>
      </section>

      <section id="artists" className="c-artists c-section" aria-labelledby="c-artists-title">
        <div className="c-section-head" data-reveal><div><h2 id="c-artists-title">{copy.artistsTitle.split(" ")[0]} <em>{copy.artistsTitle.split(" ").slice(1).join(" ")}</em></h2></div></div>
        <p className="c-lineup-intro" data-reveal>{lineupIntroLabels[language]}</p>
        <div className="c-carousel-stage">
        <button className="c-rail-edge c-rail-prev" type="button" disabled={railState.start} aria-label={ui.previous} onClick={() => carousel.slide(-1)}><ArrowIcon direction="left" /></button>
        <button className="c-rail-edge c-rail-next" type="button" disabled={railState.end} aria-label={ui.next} onClick={() => carousel.slide(1)}><ArrowIcon /></button>
        <div ref={rail} className="c-artists-rail" data-autoplay={carousel.paused ? "paused" : "playing"} tabIndex={0} aria-label={copy.artistsTitle} onScroll={event => {
          const element = event.currentTarget;
          const maximum = Math.max(1, element.scrollWidth - element.clientWidth);
          const progress = element.scrollLeft / maximum;
          if (railIndicator.current) railIndicator.current.style.transform = `translateX(${progress * 300}%)`;
          const first = element.children[0] as HTMLElement, second = element.children[1] as HTMLElement;
          const next = { first: Math.floor((element.scrollLeft + 1) / (second.offsetLeft - first.offsetLeft)) + 1, start: element.scrollLeft < 2, end: maximum - element.scrollLeft < 2 };
          setRailState(previous => previous.first === next.first && previous.start === next.start && previous.end === next.end ? previous : next);
        }}>
          {artists.map((artist, index) => {
            const imageClass = `c-artist-image artist-${artist.name.toLowerCase().replaceAll(" ", "-").replaceAll(".", "")}`;
            const image = artist.imageFit === "johnny" ? "/assets/artist-johnny-portrait-original.jpg" : artist.image;
            const portrait = <>{image
              ? <img className={imageClass} src={assetPath(image)} alt={artist.name} loading="lazy" />
              : <div className="c-portrait-placeholder" aria-hidden="true"><img className="c-placeholder-mark" src={assetPath("/assets/brand-isotype.png")} alt="" /></div>}
              <span>{String(index + 1).padStart(2, "0")}</span>
              {artist.instagram && <ArrowIcon direction="up-right" />}</>;

            return <article className={`c-artist ${image ? "" : "is-photo-pending"}`} key={artist.name}>
              {artist.instagram
                ? <a className="c-portrait" href={artist.instagram} target="_blank" rel="noopener noreferrer" aria-label={`Instagram: ${artist.name}`}>{portrait}</a>
                : <figure className="c-portrait">{portrait}</figure>}
              <div className="c-artist-heading"><div><p className="c-artist-role">{artist.role}</p><h3>{artist.name}</h3></div><button type="button" className="c-artist-gallery-button" aria-label={`${refinement.gallery}: ${artist.name}`} onClick={() => setActiveGalleryArtist(artist.name)}><img src={assetPath("/assets/gallery-icon.png")} alt="" width="28" height="28" /></button></div>
              {artist.body && <details className="c-biography"><summary>{ui.bio}<ArrowIcon direction="down" /></summary><p>{artist.body}</p></details>}
            </article>;
          })}
        </div>
        </div>
        <div className="c-carousel-footer"><span className="c-rail-count">{String(railState.first).padStart(2, "0")} <i>/ {artistCardTotal}</i></span><div className="c-rail-progress" aria-hidden="true"><span ref={railIndicator} /></div><button type="button" className="c-autoplay" onClick={carousel.toggle} aria-pressed={!carousel.paused}><i className={carousel.paused ? "is-paused" : "is-playing"} aria-hidden="true" />{carousel.paused ? refinement.play : refinement.pause}</button></div>
        <p className="c-more-artists">{mystery.title}<img src={assetPath("/assets/brand-isotype.png")} alt="" /></p>
      </section>

      <ModernFindSection key={language} copy={findCopies[language]} language={language} />

      <section id="location" className="c-location" aria-labelledby="c-location-title">
        <div className="c-location-panorama"><img className="c-parallax" src={assetPath("/assets/backgrounds/fira-cornella.jpg")} alt="Fira Cornellà" loading="lazy" /><div className="c-location-shade" /><div className="c-location-copy" data-reveal><h2 id="c-location-title">{date.days}<span>{date.month} {date.year}</span></h2><p className="c-location-name">{date.city}</p></div></div>
        <div className="c-venue"><div className="c-venue-info"><h3>Fira Cornellà</h3><p>Cornellà de Llobregat<br />Barcelona</p><a className="c-directions" href="https://www.google.com/maps/search/?api=1&query=Fira+Cornell%C3%A0" target="_blank" rel="noopener noreferrer"><span>{refinement.directions}</span><ArrowIcon direction="up-right" /></a></div><div className="c-map"><GoogleMap language={language} title={copy.mapTitle} /></div></div>
      </section>

      <section id="newsletter" className="c-contact c-section" aria-labelledby="c-newsletter-title">
        <div className="c-contact-copy" data-reveal><p className="c-kicker">{refinement.newsletter}</p><h2 id="c-newsletter-title">{newsletter.title}</h2><p className="c-contact-intro">{newsletter.introBefore} <strong>Barcelona Country News</strong>, {newsletter.introAfter} <b>Barcelona Country Festival.</b></p></div>
        <form className="c-form" aria-label={interfaceLabels[language].form} onSubmit={handleSubmit}>
          <label htmlFor="name">{copy.formName}<input id="name" name="name" type="text" autoComplete="name" required maxLength={160} /></label>
          <ModernPhonePrefixSelect language={language} />
          <label htmlFor="email">{copy.formEmail}<input id="email" name="email" type="email" autoComplete="email" required maxLength={320} /></label>
          <label htmlFor="dance-location">{copy.formDanceLocation}<input id="dance-location" name="danceLocation" type="text" required maxLength={180} /></label>
          <div className="subscription-honeypot" aria-hidden="true"><label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label></div>
          <label className="c-consent" htmlFor="privacy-accepted"><input id="privacy-accepted" name="privacyAccepted" type="checkbox" required /><span>{registration.privacyBefore} <a href={sitePath("/privacidad")} target="_blank" rel="noopener noreferrer">{newsletter.privacy}</a> {registration.privacyAfter}</span></label>
          <button className="c-submit" type="submit" disabled={isFormSubmitting} aria-describedby="subscription-authorization"><span>{isFormSubmitting ? formFeedbackLabels[language].submitting : newsletter.subscribe}</span><ArrowIcon /></button>
          <p id="subscription-authorization" className="c-authorization"><b>{newsletter.authorization}</b> {newsletter.authorizationText} <a href={sitePath("/privacidad")} target="_blank" rel="noopener noreferrer">{newsletter.privacy}</a>.</p>
          {formFeedback && <p className={`c-form-feedback is-${formFeedback.type}`} role="status">{formFeedback.message}</p>}
        </form>
      </section>
      <section id="sponsors" className="c-sponsors c-section" aria-labelledby="c-sponsors-title">
        <div className="c-sponsor-heading" data-reveal><h2 id="c-sponsors-title">{ui.sponsors}</h2><button className="c-sponsor-invite" type="button" onClick={openContact}><span>{sponsorInvitationLabels[language]}</span><ArrowIcon direction="up-right" /></button></div>
        <a className="c-sponsor-brand" href="https://wowmycity.com/" target="_blank" rel="noopener noreferrer" aria-label="Wow My City" data-reveal>
          <img src={assetPath("/assets/sponsors/wowmycity-white.svg")} width="320" height="86" alt="Wow My City" loading="lazy" /><ArrowIcon direction="up-right" />
        </a>
      </section>
    </main>
    <footer className="c-footer"><a className="c-footer-logo" href="#home"><img src={assetPath("/assets/brand-logo-nav.png")} alt="Barcelona Country Festival" /></a><div className="c-footer-main"><p>© 2027 <strong>Barcelona Country Festival</strong></p><nav aria-label={newsletter.legal}><a href={sitePath("/blog")}>Blog</a><a href="#newsletter">{refinement.newsletter}</a><a href={sitePath("/privacidad")}>{newsletter.privacy}</a><a href={sitePath("/aviso-legal")}>{newsletter.legal}</a><a href={sitePath("/cookies")}>{newsletter.cookies}</a><CookiePreferencesButton /></nav></div>
      <details className="c-credits"><summary>Créditos fotográficos</summary><ul>
        <li><a href="https://commons.wikimedia.org/wiki/File:BUCKLE_N_BOOTS_performing_live_at_The_British_Country_Music_Festival_2025.jpg" target="_blank" rel="noreferrer">BeeMusicUK · CC BY-SA 4.0</a></li>
        <li><a href="https://commons.wikimedia.org/wiki/File:Ballymore_Country_Music_Festival_2014.jpg" target="_blank" rel="noreferrer">Lizheen · CC BY-SA 4.0</a></li>
        <li><a href="https://commons.wikimedia.org/wiki/File:Main_Stage_at_Harvest_Country_Music_Festival_2017_at_Westport_House.jpg" target="_blank" rel="noreferrer">Bambography · CC BY-SA 4.0</a></li>
        <li><a href="https://commons.wikimedia.org/wiki/File:Crowds_going_to_George_Strait_Country_Music_Festival_in_Tampa_Florida.jpg" target="_blank" rel="noreferrer">ckramer · CC BY 2.0</a></li>
        <li><a href="https://commons.wikimedia.org/wiki/File:Country_Music_Festival_1,_Mirande,_Gers,_France.jpg" target="_blank" rel="noreferrer">Jamiecat · CC BY 2.0</a></li>
        <li><a href="https://commons.wikimedia.org/wiki/File:George_Strait_Country_Music_Festival_in_Tampa_Florida.jpg" target="_blank" rel="noreferrer">ckramer · CC BY 2.0</a></li>
        <li><a href="https://commons.wikimedia.org/wiki/File:Cornell%C3%A1_de_Llobregat_-_Fira_de_Cornell%C3%A1_1.jpg" target="_blank" rel="noreferrer">Zarateman · CC0 · Fira de Cornellà</a></li>
      </ul></details>
    </footer>
    <ContactDialog open={isContactOpen} onClose={() => setIsContactOpen(false)} language={language} nameLabel={copy.formName} emailLabel={copy.formEmail} />
    {activeGalleryArtist ? <ArtistGalleryDialog artistName={activeGalleryArtist} images={activeGalleryImages} language={language} onClose={() => setActiveGalleryArtist(null)} /> : null}
  </div></CookieConsentProvider>;
}


const currentPath = currentSitePath();
const isAdminRoute = ["/login", "/dashboard", "/dashbord", "/admin/newsletters"].includes(currentPath);
const isNewsRoute = currentPath === "/blog" || currentPath === "/newsletters" || currentPath.startsWith("/newsletters/");
const isLegalRoute = ["/privacidad", "/aviso-legal", "/cookies", "/baja"].includes(currentPath);
const isTicketRoute = ["/entradas", "/tickets", "/buy"].includes(currentPath);

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    {isAdminRoute ? <Suspense fallback={<div className="admin-route-fallback" aria-label="Cargando panel"><span /><span /><span /></div>}><AdminPortal /></Suspense>
      : isTicketRoute ? <CookieConsentProvider language={getInitialLanguage()}><Suspense fallback={<div className="admin-route-fallback" aria-label="Cargando entradas"><span /><span /><span /></div>}><TicketPurchasePage /></Suspense></CookieConsentProvider>
      : isNewsRoute || isLegalRoute ? <CookieConsentProvider language={getInitialLanguage()}><Suspense fallback={<div className="admin-route-fallback" aria-label="Cargando"><span /><span /><span /></div>}>{isNewsRoute ? <NewsPage language={getInitialLanguage()} /> : <LegalPage language={getInitialLanguage()} />}</Suspense></CookieConsentProvider> : <ModernApp />}
  </StrictMode>
);
if (import.meta.hot) import.meta.hot.dispose(() => root.unmount());
