import { StrictMode, useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type LanguageKey = "de" | "es" | "ca" | "fr" | "en" | "it";

type Artist = {
  name: string;
  role: string;
  body: string;
  image: string;
  instagram: string;
  x: number;
  y: number;
  imageFit?: "cover" | "stretch" | "montse" | "jonathan";
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

type PhoneCountry = {
  name: string;
  dial: string;
  iso: string;
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

const languageOptions: { key: LanguageKey; label: string }[] = [
  { key: "de", label: "Aleman" },
  { key: "es", label: "Español" },
  { key: "ca", label: "Catalan" },
  { key: "fr", label: "Francés" },
  { key: "en", label: "Inglés" },
  { key: "it", label: "Italiano" }
];

const nextStopLabels: Record<LanguageKey, string> = {
  de: "Nächster Halt",
  es: "Siguiente parada",
  ca: "Seguent parada",
  fr: "Prochain arrêt",
  en: "Next stop",
  it: "Prossima fermata"
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
  "/assets/find-shopping.jpg",
  "/assets/find-food.jpg",
  "/assets/find-food.jpg"
];

const findTabIcons = ["🎸", "🛍️", "🍗", "🤠"];

const findCopies: Record<LanguageKey, FindCopy> = {
  de: {
    kicker: "WAS DICH ERWARTET",
    title: "Country non stop",
    cards: [
      {
        title: "Musik, Tanz und Legenden",
        icon: "US",
        items: [
          "Das Kreativlabor der Legenden.",
          "Ununterbrochener Tanz während des gesamten Events.",
          "Eltern teilen ihre Leidenschaft mit ihren Kindern.",
          "Der Soundpuls des Festivals.",
          "Country non stop!"
        ]
      },
      {
        title: "Western Markt",
        icon: "SHOP",
        items: [
          "Das große kommerzielle Schaufenster.",
          "Mit den legendären Harley-Davidson-Motorrädern.",
          "Totales Eintauchen in die Kultur.",
          "Country-High-Fashion-Laufsteg."
        ]
      },
      {
        title: "Food Trucks",
        icon: "BBQ",
        items: ["Authentischer Western-Geschmack."]
      },
      {
        title: "Weltrekord",
        icon: "REC",
        items: ["Der Versuch eines Weltrekords."]
      }
    ]
  },
  es: {
    kicker: "QUE ENCONTRARÁS",
    title: "DETALLES DEL FESTIVAL",
    cards: [
      {
        title: "CATALAN STYLE & MÚSICA",
        icon: "music",
        items: [
          {
            heading: "ZONA DE COREÓGRAFOS Y WORKSHOPS:",
            body: "El laboratorio de creatividad de las leyendas."
          },
          {
            heading: "LINE DANCE HALLS:",
            body: "Baile ininterrumpido durante todo el evento."
          },
          {
            heading: "WORKSHOP INFANTIL",
            body: "Padres compartiendo su pasión con sus hijos."
          },
          {
            heading: "ESCENARIOS DE MÚSICA EN DIRECTO:",
            body: "El pulso sonoro del festival."
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
            heading: "ÁREA WESTERN LIFESTYLE & SHOPPING:",
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
            heading: "WESTERN FASHION SHOW:",
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
            body: "BBQ, ribs, pulled pork, bourbon i cerveses artesanes."
          },
          {
            heading: "FOOD TRUCKS AMERICANS",
            body: "Del pretzel de Nova York al chili de Texas."
          }
        ]
      },
      {
        title: "COMUNIDAD Y AMIGOS",
        icon: "cowboy",
        items: [
          {
            heading: "THE SEA OF COWBOY HATS:",
            body: "L'intent de record mundial: un mar de barrets omplint Barcelona."
          },
          {
            heading: "TROBADA DE COLLES COUNTRY",
            body: "Clubs de tota Europa units sota el mateix sol."
          }
        ]
      }
    ]
  },
  ca: {
    kicker: "QUÈ HI TROBARÀS",
    title: "Country non stop",
    cards: [
      {
        title: "Música, ball i llegendes",
        icon: "US",
        items: [
          "El laboratori de creativitat de les llegendes.",
          "Ball ininterromput durant tot l'esdeveniment.",
          "Pares compartint la passió amb els seus fills.",
          "El pols sonor del festival.",
          "Country non stop!"
        ]
      },
      {
        title: "Market western",
        icon: "SHOP",
        items: [
          "El gran aparador comercial.",
          "Incloses les mítiques motos Harley Davidson.",
          "Immersió total en la cultura.",
          "Passarel·la de moda d'alta costura country."
        ]
      },
      {
        title: "Food trucks",
        icon: "BBQ",
        items: ["Sabor western autèntic."]
      },
      {
        title: "Rècord mundial",
        icon: "REC",
        items: ["L'intent de rècord mundial."]
      }
    ]
  },
  fr: {
    kicker: "CE QUE VOUS TROUVEREZ",
    title: "Country non stop",
    cards: [
      {
        title: "Musique, danse et légendes",
        icon: "US",
        items: [
          "Le laboratoire créatif des légendes.",
          "Danse non-stop pendant tout l'événement.",
          "Des parents partageant leur passion avec leurs enfants.",
          "Le pouls sonore du festival.",
          "Country non stop!"
        ]
      },
      {
        title: "Marché western",
        icon: "SHOP",
        items: [
          "La grande vitrine commerciale.",
          "Avec les mythiques motos Harley Davidson.",
          "Immersion totale dans la culture.",
          "Défilé de mode haute couture country."
        ]
      },
      {
        title: "Food trucks",
        icon: "BBQ",
        items: ["Saveur western authentique."]
      },
      {
        title: "Record mondial",
        icon: "REC",
        items: ["La tentative de record mondial."]
      }
    ]
  },
  en: {
    kicker: "WHAT YOU'LL FIND",
    title: "Country non stop",
    cards: [
      {
        title: "Music, dance and legends",
        icon: "US",
        items: [
          "The creative lab of the legends.",
          "Non-stop dancing throughout the whole event.",
          "Parents sharing their passion with their children.",
          "The sound pulse of the festival.",
          "Country non stop!"
        ]
      },
      {
        title: "Western market",
        icon: "SHOP",
        items: [
          "The big commercial showcase.",
          "Including the legendary Harley Davidson motorcycles.",
          "Full immersion in the culture.",
          "A high-fashion country runway."
        ]
      },
      {
        title: "Food trucks",
        icon: "BBQ",
        items: ["Authentic western flavor."]
      },
      {
        title: "World record",
        icon: "REC",
        items: ["The world record attempt."]
      }
    ]
  },
  it: {
    kicker: "COSA TROVERAI",
    title: "Country non stop",
    cards: [
      {
        title: "Musica, ballo e leggende",
        icon: "US",
        items: [
          "Il laboratorio creativo delle leggende.",
          "Ballo ininterrotto durante tutto l'evento.",
          "Genitori che condividono la passione con i figli.",
          "Il battito sonoro del festival.",
          "Country non stop!"
        ]
      },
      {
        title: "Market western",
        icon: "SHOP",
        items: [
          "La grande vetrina commerciale.",
          "Incluse le mitiche moto Harley Davidson.",
          "Immersione totale nella cultura.",
          "Passerella di alta moda country."
        ]
      },
      {
        title: "Food truck",
        icon: "BBQ",
        items: ["Autentico sapore western."]
      },
      {
        title: "Record mondiale",
        icon: "REC",
        items: ["Il tentativo di record mondiale."]
      }
    ]
  }
};

const copies: Record<LanguageKey, Copy> = {
  de: {
    languageName: "Deutsch",
    nav: ["START", "FESTIVAL", "KÜNSTLER", "PROGRAMM", "ORT", "KONTAKT"],
    heroKicker: "BARCELONA - NOVIEMBRE 27",
    heroCopy:
      "Das internationale Country-Event kommt nach Barcelona. Drei Tage Line Dance, Live-Musik und amerikanischer Spirit.",
    cta: "Informiert bleiben",
    triad: ["TANZ", "MUSIK", "AMERIKA"],
    festivalTitle: "Das Festival",
    festivalCopy:
      "Barcelona Country vereint drei Tage lang das Beste aus internationalem Line Dance, Live-Musik, Western-Markt und Foodtrucks mit echter amerikanischer Barbecue-Küche. Ein Event für Tänzer, Familien und Country-Fans, die den amerikanischen Spirit in Barcelona erleben möchten.",
    days: "Tage",
    internationalArtists: "INTERNATIONALE\nKÜNSTLER",
    expectedDancers: "ERWARTETE TÄNZER",
    artistsTitle: "Internationale Künstler",
    artists: [
      {
        name: "Pol F. Ryan",
        role: "Internationaler Choreograf",
        body:
          "Referenz des katalanischen Line Dance. Sohn des Musikers Greg Ryan, Autor zahlreicher Choreografien auf Tanzflächen in ganz Europa. Sein Stil verbindet amerikanische Energie mit mediterranem Charakter."
      },
      {
        name: "Algaly Fofana",
        role: "Choreograf & Trainer",
        body:
          "Eine der frischesten jungen Stimmen des europäischen Line Dance. Er arbeitet regelmäßig mit Pol F. Ryan zusammen und brachte seinen Stil mit viralen Choreografien nach Belgien, Spanien und Italien."
      },
      {
        name: "David Villellas",
        role: "Tänzer & Choreograf",
        body:
          "Eine echte Legende der katalanischen Country-Szene. Mehr als 20 Jahre auf der Bühne, internationale Festivalshows und sogar eine eigene Stiefelkollektion."
      },
      {
        name: "Montse Moscardó",
        role: "Choreografin & Trainerin",
        body:
          "Ein unverzichtbarer Name im Catalan Country Style. Detailreiche Choreografien, getanzt beim Festival Big Ben in Mollerussa und im Barn d'en Greg."
      },
      {
        name: "Jonathan Jones",
        role: "Folk-Country-Singer-Songwriter",
        body:
          "Singer-Songwriter aus Kingston, Ontario. Akustische Fingerstyle-Gitarre und ehrliche Texte über Liebe, Verlust und Widerstandskraft. Europa-Debüt in Barcelona."
      }
    ],
    locationKicker: "STANDORT",
    inBarcelona: "IN BARCELONA!",
    mapTitle: "Karte mit dem Zentrum von Barcelona",
    date: "BARCELONA - 27. NOV",
    contactTitle: "BLEIB INFORMIERT",
    formName: "Name",
    formPhone: "Telefonnummer",
    formEmail: "E-Mail",
    footer: "© 2026 Barcelona Country Festival · Alle Rechte vorbehalten · Yeehaw!"
  },
  es: {
    languageName: "Español",
    nav: ["INICIO", "FESTIVAL", "ARTISTAS", "PROGRAMA", "UBICACIÓN", "CONTACTO"],
    heroKicker: "BARCELONA - NOVIEMBRE 27",
    heroCopy:
      "El evento internacional de country llega a Barcelona. Tres días de line dance, música en directo y espíritu americano.",
    cta: "Mantente informado",
    triad: ["BAILE", "MÚSICA", "AMÉRICA"],
    festivalTitle: "El Festival",
    festivalCopy:
      "Barcelona Country reúne durante tres días a lo mejor del line dance internacional, música en directo, mercadillo western y food trucks con auténtica barbacoa americana. Un evento pensado para bailarines, familias y amantes del country que buscan vivir el auténtico espíritu americano sin salir de Barcelona.",
    days: "Días",
    internationalArtists: "ARTISTAS\nINTERNACIONALES",
    expectedDancers: "BAILARINES ESPERADOS",
    artistsTitle: "Artistas internacionales",
    artists: [
      {
        name: "Pol F. Ryan",
        role: "Coreógrafo internacional",
        body:
          "Referente del line dance catalán. Hijo del músico Greg Ryan, ha firmado decenas de coreografías que se bailan en pistas de toda Europa. Su estilo mezcla energía americana con sabor mediterráneo."
      },
      {
        name: "Algaly Fofana",
        role: "Coreógrafo & instructor",
        body:
          "Una de las voces jóvenes más frescas del line dance europeo. Colabora habitualmente con Pol F. Ryan y ha llevado su estilo a Bélgica, España e Italia con coreografías virales."
      },
      {
        name: "David Villellas",
        role: "Bailarín & coreógrafo",
        body:
          "Auténtica leyenda del country catalán. Más de 20 años sobre las tablas, sus shows han conquistado festivales internacionales y hasta tiene su propia colección de botas."
      },
      {
        name: "Montse Moscardó",
        role: "Coreógrafa & instructora",
        body:
          "Nombre imprescindible del circuito Catalan Country Style. Coreografías cuidadas al detalle que se han bailado en el Festival Big Ben de Mollerussa y en El Barn d'en Greg."
      },
      {
        name: "Jonathan Jones",
        role: "Cantautor folk-country",
        body:
          "Singer-songwriter de Kingston (Ontario). Guitarra acústica en fingerstyle y letras honestas sobre amor, pérdida y resiliencia. Debut europeo en Barcelona."
      }
    ],
    locationKicker: "UBICACIÓN",
    inBarcelona: "EN BARCELONA!",
    mapTitle: "Mapa del centro de Barcelona",
    date: "BARCELONA - 27 NOV",
    contactTitle: "MANTENTE INFORMADO",
    formName: "Nombre",
    formPhone: "Número de teléf.",
    formEmail: "Correo electrónico",
    footer: "© 2026 Barcelona Country Festival · Todos los derechos reservados · Yeehaw!"
  },
  ca: {
    languageName: "Català",
    nav: ["INICI", "FESTIVAL", "ARTISTES", "PROGRAMA", "UBICACIÓ", "CONTACTE"],
    heroKicker: "BARCELONA - NOVIEMBRE 27",
    heroCopy:
      "L'esdeveniment internacional de country arriba a Barcelona. Tres dies de line dance, música en directe i esperit americà.",
    cta: "Manten-te informat",
    triad: ["BALL", "MÚSICA", "AMÈRICA"],
    festivalTitle: "El Festival",
    festivalCopy:
      "Barcelona Country reuneix durant tres dies el millor del line dance internacional, música en directe, mercat western i food trucks amb autèntica barbacoa americana. Un esdeveniment per a ballarins, famílies i amants del country que volen viure l'esperit americà sense sortir de Barcelona.",
    days: "Dies",
    internationalArtists: "ARTISTES\nINTERNACIONALS",
    expectedDancers: "BALLARINS ESPERATS",
    artistsTitle: "Artistes internacionals",
    artists: [
      {
        name: "Pol F. Ryan",
        role: "Coreògraf internacional",
        body:
          "Referent del line dance català. Fill del músic Greg Ryan, ha signat desenes de coreografies que es ballen arreu d'Europa. El seu estil barreja energia americana amb sabor mediterrani."
      },
      {
        name: "Algaly Fofana",
        role: "Coreògraf & instructor",
        body:
          "Una de les veus joves més fresques del line dance europeu. Col·labora habitualment amb Pol F. Ryan i ha portat el seu estil a Bèlgica, Espanya i Itàlia amb coreografies virals."
      },
      {
        name: "David Villellas",
        role: "Ballarí & coreògraf",
        body:
          "Autèntica llegenda del country català. Més de 20 anys sobre els escenaris, els seus shows han conquerit festivals internacionals i fins i tot té la seva pròpia col·lecció de botes."
      },
      {
        name: "Montse Moscardó",
        role: "Coreògrafa & instructora",
        body:
          "Nom imprescindible del circuit Catalan Country Style. Coreografies cuidades al detall que s'han ballat al Festival Big Ben de Mollerussa i a El Barn d'en Greg."
      },
      {
        name: "Jonathan Jones",
        role: "Cantautor folk-country",
        body:
          "Singer-songwriter de Kingston (Ontario). Guitarra acústica en fingerstyle i lletres honestes sobre amor, pèrdua i resiliència. Debut europeu a Barcelona."
      }
    ],
    locationKicker: "UBICACIÓ",
    inBarcelona: "A BARCELONA!",
    mapTitle: "Mapa del centre de Barcelona",
    date: "BARCELONA - 27 NOV",
    contactTitle: "MANTEN-TE INFORMAT",
    formName: "Nom",
    formPhone: "Número de telèf.",
    formEmail: "Correu electrònic",
    footer: "© 2026 Barcelona Country Festival · Tots els drets reservats · Yeehaw!"
  },
  fr: {
    languageName: "Français",
    nav: ["ACCUEIL", "FESTIVAL", "ARTISTES", "PROGRAMME", "LIEU", "CONTACT"],
    heroKicker: "BARCELONA - NOVIEMBRE 27",
    heroCopy:
      "L'événement country international arrive à Barcelone. Trois jours de line dance, de musique live et d'esprit américain.",
    cta: "Restez informé",
    triad: ["DANSE", "MUSIQUE", "AMÉRIQUE"],
    festivalTitle: "Le Festival",
    festivalCopy:
      "Barcelona Country réunit pendant trois jours le meilleur du line dance international, de la musique live, un marché western et des food trucks avec un authentique barbecue américain. Un événement pour danseurs, familles et amoureux du country.",
    days: "Jours",
    internationalArtists: "ARTISTES\nINTERNATIONAUX",
    expectedDancers: "DANSEURS ATTENDUS",
    artistsTitle: "Artistes internationaux",
    artists: [
      {
        name: "Pol F. Ryan",
        role: "Chorégraphe international",
        body:
          "Référence du line dance catalan. Fils du musicien Greg Ryan, il a signé des dizaines de chorégraphies dansées partout en Europe. Son style mêle énergie américaine et saveur méditerranéenne."
      },
      {
        name: "Algaly Fofana",
        role: "Chorégraphe & instructeur",
        body:
          "L'une des jeunes voix les plus fraîches du line dance européen. Il collabore régulièrement avec Pol F. Ryan et a porté son style en Belgique, en Espagne et en Italie."
      },
      {
        name: "David Villellas",
        role: "Danseur & chorégraphe",
        body:
          "Véritable légende du country catalan. Plus de 20 ans sur scène, des shows dans des festivals internationaux et même sa propre collection de bottes."
      },
      {
        name: "Montse Moscardó",
        role: "Chorégraphe & instructrice",
        body:
          "Un nom incontournable du Catalan Country Style. Des chorégraphies travaillées au détail, dansées au Festival Big Ben de Mollerussa et à El Barn d'en Greg."
      },
      {
        name: "Jonathan Jones",
        role: "Auteur-compositeur folk-country",
        body:
          "Singer-songwriter de Kingston, Ontario. Guitare acoustique fingerstyle et textes sincères sur l'amour, la perte et la résilience. Début européen à Barcelone."
      }
    ],
    locationKicker: "LIEU",
    inBarcelona: "À BARCELONE!",
    mapTitle: "Carte du centre de Barcelone",
    date: "BARCELONE - 27 NOV",
    contactTitle: "RESTEZ INFORMÉ",
    formName: "Nom",
    formPhone: "Téléphone",
    formEmail: "E-mail",
    footer: "© 2026 Barcelona Country Festival · Tous droits réservés · Yeehaw!"
  },
  en: {
    languageName: "English",
    nav: ["HOME", "FESTIVAL", "ARTISTS", "PROGRAM", "LOCATION", "CONTACT"],
    heroKicker: "BARCELONA - NOVIEMBRE 27",
    heroCopy:
      "The international country event arrives in Barcelona. Three days of line dance, live music and American spirit.",
    cta: "Stay informed",
    triad: ["DANCE", "MUSIC", "AMERICA"],
    festivalTitle: "The Festival",
    festivalCopy:
      "Barcelona Country brings together three days of international line dance, live music, a western market and food trucks with authentic American barbecue. An event for dancers, families and country lovers looking for the real American spirit in Barcelona.",
    days: "Days",
    internationalArtists: "INTERNATIONAL\nARTISTS",
    expectedDancers: "EXPECTED DANCERS",
    artistsTitle: "International Artists",
    artists: [
      {
        name: "Pol F. Ryan",
        role: "International choreographer",
        body:
          "A reference in Catalan line dance. Son of musician Greg Ryan, he has created dozens of choreographies danced across Europe. His style mixes American energy with Mediterranean character."
      },
      {
        name: "Algaly Fofana",
        role: "Choreographer & instructor",
        body:
          "One of the freshest young voices in European line dance. He regularly collaborates with Pol F. Ryan and has taken his style to Belgium, Spain and Italy with viral choreographies."
      },
      {
        name: "David Villellas",
        role: "Dancer & choreographer",
        body:
          "A true legend of Catalan country. More than 20 years on stage, international festival shows and even his own boot collection."
      },
      {
        name: "Montse Moscardó",
        role: "Choreographer & instructor",
        body:
          "An essential name in the Catalan Country Style scene. Carefully crafted choreographies danced at Festival Big Ben in Mollerussa and at El Barn d'en Greg."
      },
      {
        name: "Jonathan Jones",
        role: "Folk-country singer-songwriter",
        body:
          "Singer-songwriter from Kingston, Ontario. Acoustic fingerstyle guitar and honest lyrics about love, loss and resilience. European debut in Barcelona."
      }
    ],
    locationKicker: "LOCATION",
    inBarcelona: "IN BARCELONA!",
    mapTitle: "Map of central Barcelona",
    date: "BARCELONA - 27 NOV",
    contactTitle: "STAY INFORMED",
    formName: "Name",
    formPhone: "Phone number",
    formEmail: "Email",
    footer: "© 2026 Barcelona Country Festival · All rights reserved · Yeehaw!"
  },
  it: {
    languageName: "Italiano",
    nav: ["HOME", "FESTIVAL", "ARTISTI", "PROGRAMMA", "LUOGO", "CONTATTO"],
    heroKicker: "BARCELONA - NOVIEMBRE 27",
    heroCopy:
      "L'evento country internazionale arriva a Barcellona. Tre giorni di line dance, musica dal vivo e spirito americano.",
    cta: "Resta informato",
    triad: ["BALLO", "MUSICA", "AMERICA"],
    festivalTitle: "Il Festival",
    festivalCopy:
      "Barcelona Country riunisce per tre giorni il meglio del line dance internazionale, musica dal vivo, mercato western e food truck con autentico barbecue americano. Un evento per ballerini, famiglie e amanti del country.",
    days: "Giorni",
    internationalArtists: "ARTISTI\nINTERNAZIONALI",
    expectedDancers: "BALLERINI ATTESI",
    artistsTitle: "Artisti internazionali",
    artists: [
      {
        name: "Pol F. Ryan",
        role: "Coreografo internazionale",
        body:
          "Punto di riferimento del line dance catalano. Figlio del musicista Greg Ryan, ha firmato decine di coreografie ballate in tutta Europa. Il suo stile unisce energia americana e sapore mediterraneo."
      },
      {
        name: "Algaly Fofana",
        role: "Coreografo & istruttore",
        body:
          "Una delle voci giovani più fresche del line dance europeo. Collabora spesso con Pol F. Ryan e ha portato il suo stile in Belgio, Spagna e Italia con coreografie virali."
      },
      {
        name: "David Villellas",
        role: "Ballerino & coreografo",
        body:
          "Autentica leggenda del country catalano. Oltre 20 anni sul palco, show in festival internazionali e persino una propria collezione di stivali."
      },
      {
        name: "Montse Moscardó",
        role: "Coreografa & istruttrice",
        body:
          "Nome imprescindibile del Catalan Country Style. Coreografie curate nei dettagli, ballate al Festival Big Ben di Mollerussa e a El Barn d'en Greg."
      },
      {
        name: "Jonathan Jones",
        role: "Cantautore folk-country",
        body:
          "Singer-songwriter di Kingston, Ontario. Chitarra acustica fingerstyle e testi sinceri su amore, perdita e resilienza. Debutto europeo a Barcellona."
      }
    ],
    locationKicker: "LUOGO",
    inBarcelona: "A BARCELLONA!",
    mapTitle: "Mappa del centro di Barcellona",
    date: "BARCELLONA - 27 NOV",
    contactTitle: "RESTA INFORMATO",
    formName: "Nome",
    formPhone: "Telefono",
    formEmail: "Email",
    footer: "© 2026 Barcelona Country Festival · Tutti i diritti riservati · Yeehaw!"
  }
};

const artistLayouts: Omit<Artist, "name" | "role" | "body">[] = [
  {
    image: "/assets/artist-pol.png",
    instagram: "https://www.instagram.com/polfryann/",
    x: -31,
    y: 1920
  },
  {
    image: "/assets/artist-algaly.png",
    instagram: "https://www.instagram.com/algalyfofana/",
    x: 239.25,
    y: 1920,
    imageFit: "stretch"
  },
  {
    image: "/assets/artist-david.png",
    instagram: "https://www.instagram.com/david.villellas/",
    x: 509.5,
    y: 1920
  },
  {
    image: "/assets/artist-montse.png",
    instagram: "https://www.instagram.com/montse.moscardo/",
    x: 779.75,
    y: 1920,
    imageFit: "montse"
  },
  {
    image: "/assets/artist-jonathan.png",
    instagram: "https://www.instagram.com/jonathan_jones_music/",
    x: 1050,
    y: 1920,
    imageFit: "jonathan"
  }
];

const artistCardMetrics = {
  width: 262,
  photoInset: 5,
  nameTop: 300,
  roleTop: 358,
  bodyTop: 424,
  bodyWidth: 224
};

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

const createArtists = (copy: Copy): Artist[] =>
  artistLayouts.map((layout, index) => ({
    ...layout,
    ...copy.artists[index]
  }));

const createMapsSrc = (language: LanguageKey) =>
  `https://www.google.com/maps?q=41.3874,2.1686&z=13&hl=${language}&output=embed`;

const phoneCountries: PhoneCountry[] = [
  { name: "España", dial: "+34", iso: "ES" },
  { name: "Alemania", dial: "+49", iso: "DE" },
  { name: "Andorra", dial: "+376", iso: "AD" },
  { name: "Argentina", dial: "+54", iso: "AR" },
  { name: "Bélgica", dial: "+32", iso: "BE" },
  { name: "Brasil", dial: "+55", iso: "BR" },
  { name: "Canadá", dial: "+1", iso: "CA" },
  { name: "Chile", dial: "+56", iso: "CL" },
  { name: "Colombia", dial: "+57", iso: "CO" },
  { name: "Estados Unidos", dial: "+1", iso: "US" },
  { name: "Francia", dial: "+33", iso: "FR" },
  { name: "Irlanda", dial: "+353", iso: "IE" },
  { name: "Italia", dial: "+39", iso: "IT" },
  { name: "México", dial: "+52", iso: "MX" },
  { name: "Países Bajos", dial: "+31", iso: "NL" },
  { name: "Portugal", dial: "+351", iso: "PT" },
  { name: "Reino Unido", dial: "+44", iso: "GB" },
  { name: "Suiza", dial: "+41", iso: "CH" },
  { name: "Uruguay", dial: "+598", iso: "UY" }
];

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
  const target = document.querySelector<HTMLElement>(scrollTargetSelectors[targetId]) ?? document.getElementById(targetId);
  if (!target) {
    return;
  }

  cancelAnimationFrame(scrollAnimationFrame);

  const start = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const targetTop = Math.min(maxScroll, Math.max(0, target.getBoundingClientRect().top + window.scrollY));
  const distance = targetTop - start;
  const duration = Math.min(1500, Math.max(760, Math.abs(distance) * 0.42));
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

function PhonePrefixSelect() {
  const [selectedCountry, setSelectedCountry] = useState(phoneCountries[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const normalizedFilter = filter.trim().toLowerCase();
  const filteredCountries = phoneCountries.filter((country) => {
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
    setSelectedCountry(country);
    setFilter("");
    setIsOpen(false);
  };

  return (
    <div className="abs phone-wrap" ref={wrapRef}>
      <button
        className="phone-prefix"
        type="button"
        aria-label="Seleccionar prefijo telefónico"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {selectedCountry.dial}
      </button>
      <input type="hidden" name="phonePrefix" value={selectedCountry.dial} />
      <input className="input input-phone" id="phone" name="phone" type="tel" autoComplete="tel" />
      {isOpen && (
        <div className="prefix-menu">
          <input
            className="prefix-search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="País o prefijo"
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
            {!filteredCountries.length && <p className="prefix-empty">Sin resultados</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function ArtistCard({ artist }: { artist: Artist }) {
  const imageX = artist.x + artistCardMetrics.photoInset;
  const imageY = artist.y + artistCardMetrics.photoInset;
  const bodyLeft = (artistCardMetrics.width - artistCardMetrics.bodyWidth) / 2;

  return (
    <article className="artist-card abs" style={revealStyle({ left: artist.x, top: artist.y }, 80)} data-scrolljs>
      <a
        className="artist-photo artist-photo-link abs"
        style={{ left: artistCardMetrics.photoInset, top: artistCardMetrics.photoInset }}
        href={artist.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Instagram de ${artist.name}`}
      >
        <img className={`artist-image ${artist.imageFit ?? "cover"}`} src={artist.image} alt="" />
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
      <span className="sr-only">
        Foto ubicada en {Math.round(imageX)}, {Math.round(imageY)}
      </span>
    </article>
  );
}

const getFindItemParts = (item: FindItem) => (typeof item === "string" ? { heading: "", body: item } : item);

const getFindIconAsset = (icon: string) => findIconAssets[icon] ?? findIconAssets.music;

const getFindStops = (card: FindCard) =>
  card.items.map((item, index) => {
    const itemParts = getFindItemParts(item);

    return {
      heading: itemParts.heading || (index === 0 ? card.title : `Parada ${String(index + 1).padStart(2, "0")}`),
      body: itemParts.body
    };
  });

function FindSection({ copy, language }: { copy: FindCopy; language: LanguageKey }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [copy]);

  const goToNextStop = () => {
    setActiveIndex((index) => (index + 1) % copy.cards.length);
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
      <div className="abs find-tabs" aria-label="Paradas del festival" data-scrolljs style={revealStyle({}, 155)}>
        {copy.cards.map((card, index) => (
          <button
            key={`${card.title}-${index}`}
            className={`find-tab ${index === activeIndex ? "is-active" : ""}`}
            type="button"
            aria-current={index === activeIndex}
            onClick={() => setActiveIndex(index)}
          >
            <span aria-hidden="true">{findTabIcons[index] ?? "★"}</span>
            {card.title.split("&")[0].replace("COUNTRY", "").trim()}
            <small>{String(index + 1).padStart(2, "0")}</small>
          </button>
        ))}
      </div>
      <div className="abs find-carousel" aria-label={copy.kicker} data-scrolljs style={revealStyle({}, 190)}>
        <div className="find-track" style={{ transform: `translate3d(${-activeIndex * 1138}px, 0, 0)` }}>
          {copy.cards.map((card, cardIndex) => {
            const stops = getFindStops(card);
            const cardIcon = getFindIconAsset(card.icon);

            return (
              <article className="find-slide" key={`${card.title}-${cardIndex}`}>
                <div className="find-slide-image-wrap">
                  <img className="find-slide-image" src={findVisuals[cardIndex] ?? findVisuals[0]} alt="" />
                  <span className="find-slide-badge">
                    <img src={cardIcon} alt="" />
                  </span>
                </div>
                <div className="find-slide-copy">
                  <h3>{card.title}</h3>
                  <p className="find-quote">«{cardIndex === 0 ? "Where boots meet beat." : "Dress the part. Live the myth."}»</p>
                  <div className="find-red-dots" aria-hidden="true" />
                  <ol className="find-stop-list">
                    {stops.map((stop, index) => (
                      <li key={`${card.title}-${stop.heading}`}>
                        <span className="find-stop-number">{String(index + 1).padStart(2, "0")}</span>
                        <span className="find-stop-copy">
                          <strong>{stop.heading}</strong>
                          <span>{stop.body}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                  <div className="find-slide-footer">
                    <span>{cardIndex + 1} / {copy.cards.length}</span>
                    <button className="find-next" type="button" onClick={goToNextStop}>
                      {nextStopLabels[language]} <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              </article>
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
  const copy = copies[language];
  const findCopy = findCopies[language];
  const artists = createArtists(copy);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleLanguageChange = (nextLanguage: LanguageKey) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem("barcelona-country-language", nextLanguage);
    window.location.reload();
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
            <nav className="abs nav" aria-label="Principal">
              {copy.nav.map((item, index) => (
                <button
                  key={item}
                  className="nav-link"
                  type="button"
                  data-text-node="nav-item"
                  onClick={() => scrollToTarget(navTargets[index])}
                >
                  {item}
                </button>
              ))}
            </nav>
            <div className="abs language-picker">
              <button
                className="language-trigger"
                type="button"
                aria-label="Cambiar idioma"
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
              <strong data-text-node="stat-value">5+</strong>
              <span data-text-node="stat-label">{copy.internationalArtists}</span>
            </div>
            <div className="abs stat stat-three" data-scrolljs style={revealStyle({}, 220)}>
              <strong data-text-node="stat-value">1000</strong>
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
            {artists.map((artist) => (
              <ArtistCard key={artist.name} artist={artist} />
            ))}
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
            <div className="abs map-placeholder" aria-label={copy.mapTitle} data-scrolljs style={revealStyle({}, 220)}>
              <GoogleMap language={language} title={copy.mapTitle} />
            </div>
            <div id="program" className="abs date-banner" data-scrolljs style={revealStyle({}, 120)}>
              <img className="date-wood" src="/assets/wood-banner.png" alt="" />
            </div>
            <img className="abs date-star date-star-left" src="/assets/star-button.png" alt="" data-scrolljs style={revealStyle({}, 180)} />
            <img className="abs date-star date-star-right" src="/assets/star-button.png" alt="" data-scrolljs style={revealStyle({}, 180)} />
            <p className="abs western rustler text-date" data-text-node="location-date" data-scrolljs style={revealStyle({}, 240)}>
              {copy.date}
            </p>
          </section>

          <section id="contact" className="contact" aria-labelledby="contact-title">
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
              aria-label="Formulario de información"
              onSubmit={handleSubmit}
              data-scrolljs
              style={revealStyle({}, 100)}
            >
              <label className="abs label label-name" htmlFor="name" data-text-node="form-label">
                {copy.formName}
              </label>
              <input className="abs input input-name" id="name" name="name" type="text" autoComplete="name" />

              <label className="abs label label-phone" htmlFor="phone" data-text-node="form-label">
                {copy.formPhone}
              </label>
              <PhonePrefixSelect />

              <label className="abs label label-email" htmlFor="email" data-text-node="form-label">
                {copy.formEmail}
              </label>
              <input className="abs input input-email" id="email" name="email" type="email" autoComplete="email" />
              <button className="abs cta bottom-cta" type="submit">
                <span className="cta-type" data-text-node="contact-cta">
                  {copy.cta}
                </span>
                <img className="cta-star" src="/assets/star-button.png" alt="" />
              </button>
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
