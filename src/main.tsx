import { StrictMode, Suspense, lazy, useEffect, useRef, useState, type CSSProperties, type FormEvent, type UIEvent } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./lib/supabase";
import { countryFlag, phoneCountries, type PhoneCountry } from "./lib/phoneCountries";
import "./styles.css";
import "./modern.css";

const AdminPortal = lazy(() => import("./admin/AdminPortal").then((module) => ({ default: module.AdminPortal })));

type LanguageKey = "de" | "es" | "ca" | "fr" | "en" | "it";

type Artist = {
  name: string;
  role: string;
  body: string;
  image: string;
  instagram: string;
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
  footer: string;
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

const festivalStatValues = { artists: "+12", dancers: "+3000" };

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
  "/assets/find-shopping.jpg",
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
          { heading: "BEREICH FÜR CHOREOGRAFEN UND WORKSHOPS:", body: "Das Kreativlabor der Legenden." },
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
          { heading: "BIG DANCE BARCELONA:", body: "Ein Aufruf, im Herzen des Festivals einen gemeinsamen Massentanz zu teilen." },
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
            heading: "ZONA DE COREÓGRAFOS Y TALLERES:",
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
            body: "Una convocatoria para compartir un baile multitudinario en el corazón del festival."
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
          { heading: "ZONA DE COREÒGRAFS I TALLERS:", body: "El laboratori de creativitat de les llegendes." },
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
          { heading: "BIG DANCE BARCELONA:", body: "Una convocatòria per compartir un ball multitudinari al cor del festival." },
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
          { heading: "ESPACE CHORÉGRAPHES ET ATELIERS :", body: "Le laboratoire créatif des légendes." },
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
          { heading: "BIG DANCE BARCELONA :", body: "Un appel à partager une danse de masse au cœur du festival." },
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
          { heading: "CHOREOGRAPHERS AND WORKSHOPS AREA:", body: "The legends' creative laboratory." },
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
          { heading: "BIG DANCE BARCELONA:", body: "A call to share a mass dance at the heart of the festival." },
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
          { heading: "AREA COREOGRAFI E WORKSHOP:", body: "Il laboratorio creativo delle leggende." },
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
          { heading: "BIG DANCE BARCELONA:", body: "Un invito a condividere un ballo di massa nel cuore del festival." },
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
    heroKicker: "BARCELONA · 19.–21. NOVEMBER 2027",
    heroCopy:
      "Das internationale Country-Event kommt nach Barcelona. Drei Tage Line Dance, Live-Musik und amerikanischer Spirit.",
    cta: "Informiert bleiben",
    triad: ["TANZ", "MUSIK", "AMERIKA"],
    festivalTitle: "Das Festival",
    festivalCopy:
      "Barcelona Country vereint drei Tage lang das Beste aus internationalem Line Dance, Live-Musik, hochwertigen Western-Produkten und Foodtrucks mit echter amerikanischer Barbecue-Küche. Ein Event für Tänzer, Familien und Country-Fans, die den amerikanischen Spirit in Barcelona erleben möchten.",
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
        role: "Tänzer & Choreograf",
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
    inBarcelona: "IN BARCELONA!",
    mapTitle: "Karte mit dem Zentrum von Barcelona",
    date: "BARCELONA · 19.–21. NOV. 2027",
    contactTitle: "BLEIB INFORMIERT",
    formName: "Name",
    formPhone: "Telefonnummer",
    formEmail: "E-Mail",
    footer: "© 2027 Barcelona Country Festival · Alle Rechte vorbehalten · Yeehaw!"
  },
  es: {
    languageName: "Español",
    nav: ["INICIO", "FESTIVAL", "ARTISTAS", "PROGRAMA", "UBICACIÓN", "CONTACTO"],
    heroKicker: "BARCELONA · 19–21 DE NOVIEMBRE DE 2027",
    heroCopy:
      "El evento internacional de country llega a Barcelona. Tres días de line dance, música en directo y espíritu americano.",
    cta: "Mantente informado",
    triad: ["BAILE", "MÚSICA", "AMÉRICA"],
    festivalTitle: "El Festival",
    festivalCopy:
      "Barcelona Country reúne durante tres días a lo mejor del line dance internacional, música en directo, productos western y food trucks con auténtica barbacoa americana. Un evento pensado para bailarines, familias y amantes del country que buscan vivir el auténtico espíritu americano sin salir de Barcelona.",
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
        role: "Bailarín & coreógrafo",
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
    inBarcelona: "EN BARCELONA!",
    mapTitle: "Mapa del centro de Barcelona",
    date: "BARCELONA · 19–21 NOV 2027",
    contactTitle: "MANTENTE INFORMADO",
    formName: "Nombre",
    formPhone: "Número de teléf.",
    formEmail: "Correo electrónico",
    footer: "© 2027 Barcelona Country Festival · Todos los derechos reservados · Yeehaw!"
  },
  ca: {
    languageName: "Català",
    nav: ["INICI", "FESTIVAL", "ARTISTES", "PROGRAMA", "UBICACIÓ", "CONTACTE"],
    heroKicker: "BARCELONA · 19–21 DE NOVEMBRE DE 2027",
    heroCopy:
      "L'esdeveniment internacional de country arriba a Barcelona. Tres dies de line dance, música en directe i esperit americà.",
    cta: "Manten-te informat",
    triad: ["BALL", "MÚSICA", "AMÈRICA"],
    festivalTitle: "El Festival",
    festivalCopy:
      "Barcelona Country reuneix durant tres dies el millor del line dance internacional, música en directe, productes western i food trucks amb autèntica barbacoa americana. Un esdeveniment per a ballarins, famílies i amants del country que volen viure l'esperit americà sense sortir de Barcelona.",
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
        role: "Ballarí & coreògraf",
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
    inBarcelona: "A BARCELONA!",
    mapTitle: "Mapa del centre de Barcelona",
    date: "BARCELONA · 19–21 NOV 2027",
    contactTitle: "MANTEN-TE INFORMAT",
    formName: "Nom",
    formPhone: "Número de telèf.",
    formEmail: "Correu electrònic",
    footer: "© 2027 Barcelona Country Festival · Tots els drets reservats · Yeehaw!"
  },
  fr: {
    languageName: "Français",
    nav: ["ACCUEIL", "FESTIVAL", "ARTISTES", "PROGRAMME", "LIEU", "CONTACT"],
    heroKicker: "BARCELONE · 19–21 NOVEMBRE 2027",
    heroCopy:
      "L'événement country international arrive à Barcelone. Trois jours de line dance, de musique live et d'esprit américain.",
    cta: "Restez informé",
    triad: ["DANSE", "MUSIQUE", "AMÉRIQUE"],
    festivalTitle: "Le Festival",
    festivalCopy:
      "Barcelona Country réunit pendant trois jours le meilleur du line dance international, de la musique live, des produits western et des food trucks avec un authentique barbecue américain. Un événement pour les danseurs, les familles et les amoureux du country qui souhaitent vivre le véritable esprit américain sans quitter Barcelone.",
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
        role: "Danseur & chorégraphe",
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
    inBarcelona: "À BARCELONE!",
    mapTitle: "Carte du centre de Barcelone",
    date: "BARCELONE · 19–21 NOV. 2027",
    contactTitle: "RESTEZ INFORMÉ",
    formName: "Nom",
    formPhone: "Téléphone",
    formEmail: "E-mail",
    footer: "© 2027 Barcelona Country Festival · Tous droits réservés · Yeehaw!"
  },
  en: {
    languageName: "English",
    nav: ["HOME", "FESTIVAL", "ARTISTS", "PROGRAM", "LOCATION", "CONTACT"],
    heroKicker: "BARCELONA · NOVEMBER 19–21, 2027",
    heroCopy:
      "The international country event arrives in Barcelona. Three days of line dance, live music and American spirit.",
    cta: "Stay informed",
    triad: ["DANCE", "MUSIC", "AMERICA"],
    festivalTitle: "The Festival",
    festivalCopy:
      "Barcelona Country brings together three days of international line dance, live music, quality western products and food trucks with authentic American barbecue. An event for dancers, families and country lovers looking for the real American spirit in Barcelona.",
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
        role: "Dancer & choreographer",
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
    inBarcelona: "IN BARCELONA!",
    mapTitle: "Map of central Barcelona",
    date: "BARCELONA · NOV 19–21, 2027",
    contactTitle: "STAY INFORMED",
    formName: "Name",
    formPhone: "Phone number",
    formEmail: "Email",
    footer: "© 2027 Barcelona Country Festival · All rights reserved · Yeehaw!"
  },
  it: {
    languageName: "Italiano",
    nav: ["HOME", "FESTIVAL", "ARTISTI", "PROGRAMMA", "LUOGO", "CONTATTO"],
    heroKicker: "BARCELLONA · 19–21 NOVEMBRE 2027",
    heroCopy:
      "L'evento country internazionale arriva a Barcellona. Tre giorni di line dance, musica dal vivo e spirito americano.",
    cta: "Resta informato",
    triad: ["BALLO", "MUSICA", "AMERICA"],
    festivalTitle: "Il Festival",
    festivalCopy:
      "Barcelona Country riunisce per tre giorni il meglio del line dance internazionale, musica dal vivo, prodotti western e food truck con autentico barbecue americano. Un evento pensato per ballerini, famiglie e amanti del country che desiderano vivere l'autentico spirito americano senza lasciare Barcellona.",
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
        role: "Ballerino & coreografo",
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
    inBarcelona: "A BARCELLONA!",
    mapTitle: "Mappa del centro di Barcellona",
    date: "BARCELLONA · 19–21 NOV 2027",
    contactTitle: "RESTA INFORMATO",
    formName: "Nome",
    formPhone: "Telefono",
    formEmail: "Email",
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
      role: "Choreografin & Tänzerin",
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
      role: "Coreógrafa & bailarina",
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
      role: "Coreògrafa & ballarina",
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
      role: "Chorégraphe & danseuse",
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
      role: "Choreographer & dancer",
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
      role: "Coreografa & ballerina",
      body: "Una giovane figura della nuova generazione del Line Dance europeo. Le sue coreografie uniscono personalità, energia e uno sguardo contemporaneo al Country Style."
    }
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

const artistDisplayOrder = [0, 1, 2, 3, 6, 7, 4, 5] as const;

const getInitialLanguage = (): LanguageKey => {
  try {
    const stored = window.localStorage.getItem("barcelona-country-language");
    if (stored && stored in copies) {
      return stored as LanguageKey;
    }
  } catch {
    return "es";
  }

  return "es";
};

const createArtists = (copy: Copy, language: LanguageKey): Artist[] => {
  const artistCopy = [...copy.artists, ...additionalArtistCopies[language]];

  return artistDisplayOrder.map((artistIndex, positionIndex) => ({
    ...artistLayouts[artistIndex],
    x: artistLayouts[positionIndex].x,
    y: artistLayouts[positionIndex].y,
    ...artistCopy[artistIndex]
  }));
};

const createMapsSrc = (language: LanguageKey) =>
  `https://www.google.com/maps?q=41.3874,2.1686&z=13&hl=${language}&output=embed`;

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
      <a
        className="artist-photo artist-photo-link abs"
        style={{ left: artistCardMetrics.photoInset, top: artistCardMetrics.photoInset }}
        href={artist.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Instagram: ${artist.name}`}
      >
        <img className={`artist-image ${artist.imageFit ?? "cover"}`} src={artist.image} alt={artist.name} />
      </a>
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
      <p
        className="artist-body abs"
        style={{ left: bodyLeft, top: artistCardMetrics.bodyTop }}
        data-text-node="artist-body"
      >
        {artist.body}
      </p>
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
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const fullName = String(data.get("name") ?? "").trim();
    const prefix = String(data.get("phonePrefix") ?? "").trim();
    const countryIso = String(data.get("countryIso") ?? "").trim().toUpperCase();
    const phoneNumber = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim().toLowerCase();

    setIsFormSubmitting(true);
    setFormFeedback(null);

    const { error } = await supabase.from("registrations").insert({
      full_name: fullName,
      phone: `${prefix} ${phoneNumber}`.trim(),
      country_iso: countryIso || null,
      email
    });

    if (error) {
      setFormFeedback({
        type: "error",
        message: error.code === "23505" ? formFeedbackLabels[language].duplicate : formFeedbackLabels[language].error
      });
      setIsFormSubmitting(false);
      return;
    }

    form.reset();
    setFormFeedback({ type: "success", message: formFeedbackLabels[language].success });
    setIsFormSubmitting(false);
  };

  const handleLanguageChange = (nextLanguage: LanguageKey) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem("barcelona-country-language", nextLanguage);
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
            <form
              className="abs contact-form"
              aria-label={interfaceLabels[language].form}
              onSubmit={handleSubmit}
              data-scrolljs
              style={revealStyle({}, 100)}
            >
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
              <button className="abs cta bottom-cta" type="submit" disabled={isFormSubmitting}>
                <span className="cta-type" data-text-node="contact-cta">
                  {isFormSubmitting ? formFeedbackLabels[language].submitting : copy.cta}
                </span>
                <img className="cta-star" src="/assets/star-button.png" alt="" />
              </button>
              {formFeedback && (
                <p className={`contact-form-status is-${formFeedback.type}`} role="status">
                  {formFeedback.message}
                </p>
              )}
            </form>
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
    </div>
  );
}

function ModernPhonePrefixSelect({ language }: { language: LanguageKey }) {
  const regionNames = new Intl.DisplayNames([language], { type: "region" });
  const localizedCountries = phoneCountries.map((country) => ({
    ...country,
    name: regionNames.of(country.iso) ?? country.name
  }));
  const [selectedIso, setSelectedIso] = useState(phoneCountries[0].iso);
  const selectedCountry = localizedCountries.find((country) => country.iso === selectedIso) ?? localizedCountries[0];

  return (
    <div className="modern-phone-field">
      <label htmlFor="phone-prefix">{interfaceLabels[language].phonePrefix}</label>
      <div className="modern-phone-row">
        <select id="phone-prefix" value={selectedIso} onChange={(event) => setSelectedIso(event.target.value)}>
          {localizedCountries.map((country) => (
            <option key={`${country.iso}-${country.dial}`} value={country.iso}>
              {countryFlag(country.iso)} {country.name} ({country.dial})
            </option>
          ))}
        </select>
        <input type="hidden" name="phonePrefix" value={selectedCountry.dial} />
        <input type="hidden" name="countryIso" value={selectedCountry.iso} />
        <label className="sr-only" htmlFor="phone">{interfaceLabels[language].phonePrefix}</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" required maxLength={32} />
      </div>
    </div>
  );
}

function ModernFindSection({ copy, language }: { copy: FindCopy; language: LanguageKey }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCard = copy.cards[activeIndex];
  const stops = getFindStops(activeCard, language);

  useEffect(() => setActiveIndex(0), [copy]);

  return (
    <section id="program" className="modern-experience modern-section" aria-labelledby="modern-experience-title">
      <div className="modern-section-heading">
        <p>{copy.kicker}</p>
        <h2 id="modern-experience-title">{copy.title}</h2>
        <span>{findIntroLabels[language]}</span>
      </div>
      <div className="modern-experience-layout">
        <div className="modern-experience-tabs" role="tablist" aria-label={interfaceLabels[language].festivalStops}>
          {copy.cards.map((card, index) => (
            <button
              key={`${card.title}-${index}`}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              className={activeIndex === index ? "is-active" : ""}
              onClick={() => setActiveIndex(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {card.title}
            </button>
          ))}
        </div>
        <article className="modern-experience-card" aria-live="polite">
          <div className="modern-experience-image">
            <img src={findVisuals[activeIndex] ?? findVisuals[0]} alt="" />
            <img className="modern-experience-icon" src={getFindIconAsset(activeCard.icon)} alt="" />
          </div>
          <div className="modern-experience-copy">
            <p className="modern-eyebrow">{String(activeIndex + 1).padStart(2, "0")} / {String(copy.cards.length).padStart(2, "0")}</p>
            <h3>{activeCard.title}</h3>
            <p className="modern-quote">«{activeIndex === 0 ? findQuoteLabels[language][0] : findQuoteLabels[language][1]}»</p>
            <ul>
              {stops.map((stop, index) => (
                <li key={`${stop.heading}-${index}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><strong>{stop.heading}</strong><p>{stop.body}</p></div>
                </li>
              ))}
            </ul>
            <div className="modern-card-controls">
              <button type="button" disabled={activeIndex === 0} onClick={() => setActiveIndex((index) => index - 1)}>← {previousStopLabels[language]}</button>
              <button type="button" onClick={() => setActiveIndex((index) => (index + 1) % copy.cards.length)}>{nextStopLabels[language]} →</button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function ModernApp() {
  const [language, setLanguage] = useState<LanguageKey>(getInitialLanguage);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const copy = copies[language];
  const activeLanguage = languageOptions.find((option) => option.key === language) ?? languageOptions[1];
  const artists = createArtists(copy, language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = (nextLanguage: LanguageKey) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem("barcelona-country-language", nextLanguage);
    setIsLanguageMenuOpen(false);
  };

  const moveTo = (targetId: string) => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsNavigationOpen(false);
    setIsLanguageMenuOpen(false);
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

    setIsFormSubmitting(true);
    setFormFeedback(null);
    const { error } = await supabase.from("registrations").insert({
      full_name: fullName,
      phone: `${prefix} ${phoneNumber}`.trim(),
      country_iso: countryIso || null,
      email
    });

    if (error) {
      setFormFeedback({ type: "error", message: error.code === "23505" ? formFeedbackLabels[language].duplicate : formFeedbackLabels[language].error });
    } else {
      form.reset();
      setFormFeedback({ type: "success", message: formFeedbackLabels[language].success });
    }
    setIsFormSubmitting(false);
  };

  return (
    <div className="modern-page">
      <header className="modern-nav-wrap">
        <nav className="modern-nav" aria-label="Principal">
          <button className="modern-brand" type="button" onClick={() => moveTo("home")} aria-label="Barcelona Country Fest">
            <img src="/assets/logo-primary.png" alt="Barcelona Country" />
          </button>
          <div id="modern-navigation-links" className={`modern-nav-links ${isNavigationOpen ? "is-open" : ""}`}>
            {copy.nav.map((item, index) => (
              <button type="button" key={item} onClick={() => moveTo(navTargets[index])}>
                <span>{item}</span>
              </button>
            ))}
          </div>
          <div className="modern-language">
            <button
              className="modern-language-trigger"
              type="button"
              aria-label={interfaceLabels[language].changeLanguage}
              aria-expanded={isLanguageMenuOpen}
              aria-controls="modern-language-options"
              onClick={() => setIsLanguageMenuOpen((isOpen) => !isOpen)}
            >
              <span className="modern-language-icon" aria-hidden="true">{activeLanguage.icon}</span>
              <span className="modern-language-code">{language.toUpperCase()}</span>
              <svg aria-hidden="true" viewBox="0 0 16 16"><path d="m3 6 5 5 5-5" /></svg>
            </button>
            {isLanguageMenuOpen && (
              <div id="modern-language-options" className="modern-language-menu" role="menu">
                {languageOptions.map((option) => (
                  <button
                    type="button"
                    role="menuitem"
                    className={option.key === language ? "is-active" : ""}
                    key={option.key}
                    onClick={() => changeLanguage(option.key)}
                  >
                    <span aria-hidden="true">{option.icon}</span><span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className={`modern-menu-toggle ${isNavigationOpen ? "is-open" : ""}`}
            type="button"
            aria-controls="modern-navigation-links"
            aria-expanded={isNavigationOpen}
            aria-label={isNavigationOpen ? interfaceLabels[language].closeMenu : interfaceLabels[language].menu}
            onClick={() => setIsNavigationOpen((isOpen) => !isOpen)}
          >
            <span className="modern-menu-toggle-lines" aria-hidden="true"><i /><i /></span>
            <span className="modern-menu-toggle-label" aria-hidden="true">Menu</span>
          </button>
        </nav>
      </header>

      <main>
        <section id="home" className="modern-hero" aria-labelledby="modern-hero-title">
          <img className="modern-hero-image" src="/assets/header-fest.png" alt="" />
          <div className="modern-hero-shade" />
          <div className="modern-hero-grid" aria-hidden="true" />
          <div className="modern-hero-content">
            <p className="modern-eyebrow">{copy.heroKicker}</p>
            <h1 id="modern-hero-title"><span>Barcelona</span>Country <em>Fest</em></h1>
            <p className="modern-hero-copy">{copy.heroCopy}</p>
            <div className="modern-hero-actions">
              <button className="modern-primary-button" type="button" onClick={() => moveTo("contact")}>{copy.cta}<span>↘</span></button>
              <button className="modern-text-button" type="button" onClick={() => moveTo("festival")}>{copy.nav[1]} <span>↓</span></button>
            </div>
          </div>
          <div className="modern-hero-meta">
            <span>{copy.date}</span>
            <span>{copy.triad.join(" · ")}</span>
          </div>
        </section>

        <section id="festival" className="modern-festival modern-section" aria-labelledby="modern-festival-title">
          <div className="modern-section-heading modern-festival-heading">
            <h2 id="modern-festival-title">{copy.festivalTitle}</h2>
          </div>
          <p className="modern-festival-copy">{copy.festivalCopy}</p>
          <div className="modern-stats">
            {[
              ["3", copy.days],
              [festivalStatValues.artists, copy.internationalArtists],
              [festivalStatValues.dancers, copy.expectedDancers]
            ].map(([value, label], index) => (
              <div key={label}><strong>{value}</strong><span>{label}</span></div>
            ))}
          </div>
        </section>

        <section id="artists" className="modern-artists modern-section" aria-labelledby="modern-artists-title">
          <div className="modern-section-heading"><p>LINE UP</p><h2 id="modern-artists-title">{copy.artistsTitle}</h2></div>
          <div className="modern-artists-grid">
            {artists.map((artist, index) => (
              <article className="modern-artist-card" key={artist.name}>
                <a href={artist.instagram} target="_blank" rel="noopener noreferrer" aria-label={`Instagram: ${artist.name}`}>
                  <img className={`modern-artist-image artist-${artist.name.toLowerCase().replaceAll(" ", "-").replaceAll(".", "")}`} src={artist.image} alt={artist.name} />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </a>
                <div><p>{artist.role}</p><h3>{artist.name}</h3><p>{artist.body}</p></div>
              </article>
            ))}
          </div>
        </section>

        <ModernFindSection copy={findCopies[language]} language={language} />

        <section id="location" className="modern-location modern-section" aria-labelledby="modern-location-title">
          <div className="modern-location-intro">
            <p className="modern-eyebrow">{copy.locationKicker}</p>
            <h2 id="modern-location-title">Yeehaw!<br /><span>{copy.inBarcelona}</span></h2>
            <div className="modern-date-lockup"><img src="/assets/star-button.png" alt="" /><strong>{copy.date}</strong></div>
          </div>
          <div className="modern-map-wrap"><GoogleMap language={language} title={copy.mapTitle} /></div>
        </section>

        <section id="contact" className="modern-contact" aria-labelledby="modern-contact-title">
          <div className="modern-contact-copy"><p>{copy.heroKicker}</p><h2 id="modern-contact-title">{copy.contactTitle}</h2><span>{copy.triad.join(" · ")}</span></div>
          <form className="modern-contact-form" aria-label={interfaceLabels[language].form} onSubmit={handleSubmit}>
            <label htmlFor="name">{copy.formName}<input id="name" name="name" type="text" autoComplete="name" required maxLength={160} /></label>
            <ModernPhonePrefixSelect language={language} />
            <label htmlFor="email">{copy.formEmail}<input id="email" name="email" type="email" autoComplete="email" required maxLength={320} /></label>
            <button className="modern-primary-button" type="submit" disabled={isFormSubmitting}>{isFormSubmitting ? formFeedbackLabels[language].submitting : copy.cta}<span>↗</span></button>
            {formFeedback && <p className={`modern-form-status is-${formFeedback.type}`} role="status">{formFeedback.message}</p>}
          </form>
        </section>
      </main>
      <footer className="modern-footer">
        <span>Barcelona Country Fest</span><span>{copy.footer}</span><span>BCF / 2027</span>
        <details className="modern-photo-credits">
          <summary>⌘ Créditos fotográficos</summary>
          <ul>
            <li><a href="https://commons.wikimedia.org/wiki/File:BUCKLE_N_BOOTS_performing_live_at_The_British_Country_Music_Festival_2025.jpg" target="_blank" rel="noreferrer">BeeMusicUK · CC BY-SA 4.0</a></li>
            <li><a href="https://commons.wikimedia.org/wiki/File:Ballymore_Country_Music_Festival_2014.jpg" target="_blank" rel="noreferrer">Lizheen · CC BY-SA 4.0</a></li>
            <li><a href="https://commons.wikimedia.org/wiki/File:Main_Stage_at_Harvest_Country_Music_Festival_2017_at_Westport_House.jpg" target="_blank" rel="noreferrer">Bambography · CC BY-SA 4.0</a></li>
            <li><a href="https://commons.wikimedia.org/wiki/File:Crowds_going_to_George_Strait_Country_Music_Festival_in_Tampa_Florida.jpg" target="_blank" rel="noreferrer">ckramer · CC BY 2.0</a></li>
            <li><a href="https://commons.wikimedia.org/wiki/File:Country_Music_Festival_1,_Mirande,_Gers,_France.jpg" target="_blank" rel="noreferrer">Jamiecat · CC BY 2.0</a></li>
            <li><a href="https://commons.wikimedia.org/wiki/File:George_Strait_Country_Music_Festival_in_Tampa_Florida.jpg" target="_blank" rel="noreferrer">ckramer · CC BY 2.0</a></li>
          </ul>
        </details>
      </footer>
    </div>
  );
}

const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
const isAdminRoute = ["/login", "/dashboard", "/dashbord"].includes(currentPath);
const isBackupRoute = currentPath === "/backup";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isAdminRoute ? (
      <Suspense fallback={<div className="admin-route-fallback" aria-label="Cargando panel"><span /><span /><span /></div>}>
        <AdminPortal />
      </Suspense>
    ) : isBackupRoute ? <App /> : <ModernApp />}
  </StrictMode>
);
