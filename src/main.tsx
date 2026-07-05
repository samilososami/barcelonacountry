import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Artist = {
  name: string;
  role: string;
  body: string;
  image: string;
  x: number;
  y: number;
  imageFit?: "cover" | "bottom" | "montse" | "jonathan";
};

const artists: Artist[] = [
  {
    name: "Pol F. Ryan",
    role: "Coreógrafo internacional",
    body:
      "Referente del line dance catalán. Hijo del músico Greg Ryan, ha firmado decenas de coreografías que se bailan en pistas de toda Europa. Su estilo mezcla energía americana con sabor mediterráneo.",
    image: "/assets/artist-pol.png",
    x: 54.69,
    y: 2022.84
  },
  {
    name: "Algaly Fofana",
    role: "Coreógrafo & instructor",
    body:
      "Una de las voces jóvenes más frescas del line dance europeo. Colabora habitualmente con Pol F. Ryan y ha llevado su estilo a Bélgica, España e Italia con coreografías virales.",
    image: "/assets/artist-algaly.png",
    x: 456.23,
    y: 2022.84,
    imageFit: "bottom"
  },
  {
    name: "David Villellas",
    role: "Bailarín & coreógrafo",
    body:
      "Auténtica leyenda del country catalán. Más de 20 años sobre las tablas, sus shows han conquistado festivales internacionales y hasta tiene su propia colección de botas.",
    image: "/assets/artist-david.png",
    x: 857.77,
    y: 2022.84
  },
  {
    name: "Montse Moscardó",
    role: "Coreógrafa & instructora",
    body:
      "Nombre imprescindible del circuito Catalan Country Style. Coreografías cuidadas al detalle que se han bailado en el Festival Big Ben de Mollerussa y en El Barn d’en Greg.",
    image: "/assets/artist-montse.png",
    x: 59.82,
    y: 2833.5,
    imageFit: "montse"
  },
  {
    name: "Jonathan Jones",
    role: "Cantautor folk-country",
    body:
      "Singer-songwriter de Kingston (Ontario). Guitarra acústica en fingerstyle y letras honestas sobre amor, pérdida y resiliencia. Debut europeo en Barcelona.",
    image: "/assets/artist-jonathan.png",
    x: 461.36,
    y: 2833.5,
    imageFit: "jonathan"
  }
];

function useFigmaScale() {
  useEffect(() => {
    const update = () => {
      const scale = Math.min(window.innerWidth / 1280, 1);
      document.documentElement.style.setProperty("--figma-scale", String(scale));
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
}

function DecorativeType({
  className,
  src,
  alt = ""
}: {
  className: string;
  src: string;
  alt?: string;
}) {
  return <img className={`abs type ${className}`} src={src} alt={alt} aria-hidden={alt ? undefined : true} />;
}

function ArtistCard({ artist }: { artist: Artist }) {
  const imageX = artist.x + 5.13;
  const imageY = artist.y + 6.5;
  const centerX = artist.x + 183.77;

  return (
    <article className="artist-card abs" style={{ left: artist.x, top: artist.y }}>
      <div className="artist-photo abs" style={{ left: 5.13, top: 6.5 }}>
        <img className={`artist-image ${artist.imageFit ?? "cover"}`} src={artist.image} alt="" />
      </div>
      <h3 className="artist-name abs" style={{ left: 0, top: 395.4, width: 367.54 }}>
        {artist.name}
      </h3>
      <p className="artist-role abs" style={{ left: 0, top: 436.49, width: 367.54 }}>
        {artist.role}
      </p>
      <p className="artist-body abs" style={{ left: centerX - artist.x - 141.16, top: 496.81 }}>
        {artist.body}
      </p>
      <span className="sr-only">
        Foto ubicada en {Math.round(imageX)}, {Math.round(imageY)}
      </span>
    </article>
  );
}

function App() {
  useFigmaScale();

  return (
    <div className="page">
      <div className="stage" aria-label="Barcelona Country Festival">
        <main className="frame">
          <h1 className="sr-only">Barcelona Country Festival</h1>

          <section className="hero" aria-labelledby="hero-title">
            <div className="top-line top-line-one" />
            <div className="top-line top-line-two" />
            <img className="abs nav-star nav-star-left" src="/assets/nav-star.svg" alt="" />
            <img className="abs nav-star nav-star-right" src="/assets/nav-star.svg" alt="" />
            <nav className="abs nav" aria-label="Principal">
              {["HOME", "FESTIVAL", "ARTISTAS", "PROGRAMA", "LOCATION", "CONTACT"].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </nav>

            <div className="abs hero-image">
              <img src="/assets/hero-bg.png" alt="" />
              <div className="hero-scrim" />
            </div>

            <DecorativeType className="hero-barcelona" src="/assets/type-barcelona.png" />
            <DecorativeType className="hero-country" src="/assets/type-country.png" />

            <p className="abs hero-kicker">BARCELONA · SPAIN</p>
            <p className="abs hero-copy">
              L’esdeveniment internacional de country arriba a Barcelona. Tres dies de line dance, música en
              directe i esperit americà al cor de la Ciutat Comtal.
            </p>
            <div className="abs cta hero-cta" aria-hidden="true">
              <img className="cta-type" src="/assets/type-cta.png" alt="" />
              <img className="cta-star" src="/assets/star-button.png" alt="" />
            </div>

            <div className="abs triad" aria-label="Dance music America">
              <span>DANCE</span>
              <img src="/assets/dot.png" alt="" />
              <span>MUSIC</span>
              <img src="/assets/dot.png" alt="" />
              <span>AMERICA</span>
            </div>
          </section>

          <section className="festival" aria-labelledby="festival-title">
            <img className="abs dotted dotted-top" src="/assets/line-blue.svg" alt="" />
            <h2 id="festival-title" className="abs festival-title">
              The Festival
            </h2>
            <p className="abs festival-copy">
              El Barcelona Country reúne durante tres días a lo mejor del line dance internacional, música en
              directo, mercadillo western y food trucks con auténtica barbacoa americana. Un evento pensado para
              bailarines, familias y amantes del country que buscan vivir el auténtico espíritu americano sin salir
              de Barcelona.
            </p>
            <div className="abs stat stat-one">
              <strong>3</strong>
              <span>Días</span>
            </div>
            <div className="abs stat stat-two">
              <strong>5+</strong>
              <span>
                ARTISTAS
                <br />
                INTERNACIONALES
              </span>
            </div>
            <div className="abs stat stat-three">
              <strong>1000</strong>
              <span>BAILARINES ESPERADOS</span>
            </div>
            <img className="abs dotted dotted-bottom" src="/assets/line-blue.svg" alt="" />
            <div className="abs red-band" />
          </section>

          <section className="artists" aria-labelledby="artists-title">
            <h2 id="artists-title" className="sr-only">
              Artistas
            </h2>
            {artists.map((artist) => (
              <ArtistCard key={artist.name} artist={artist} />
            ))}
          </section>

          <section className="location" aria-labelledby="location-title">
            <div className="abs location-panel" />
            <p className="abs location-kicker">UBICACIÓN</p>
            <DecorativeType className="type-yeehaw" src="/assets/type-yeehaw.png" alt="Yeehaw!" />
            <DecorativeType className="type-en-barcelona" src="/assets/type-en-barcelona.png" alt="¡en Barcelona!" />
            <div className="abs map-placeholder" aria-label="Mapa de ubicación en Barcelona" />
            <div className="abs date-banner">
              <img className="date-wood" src="/assets/wood-banner.png" alt="" />
            </div>
            <img className="abs date-star date-star-left" src="/assets/star-button.png" alt="" />
            <img className="abs date-star date-star-right" src="/assets/star-button.png" alt="" />
            <DecorativeType className="type-date" src="/assets/type-date.png" alt="Barcelona - 27 nov" />
          </section>

          <section className="contact" aria-labelledby="contact-title">
            <DecorativeType className="type-mantente" src="/assets/type-mantente.png" alt="Mantente informado" />
            <form className="abs contact-form" aria-label="Formulario de información">
              <label className="abs label label-name" htmlFor="name">
                Nombre
              </label>
              <div className="abs input input-name" id="name" />

              <label className="abs label label-phone" htmlFor="phone">
                Número de teléf.
              </label>
              <div className="abs input input-phone" id="phone">
                <span className="phone-prefix">+34</span>
              </div>

              <label className="abs label label-email" htmlFor="email">
                Correo electrónico
              </label>
              <div className="abs input input-email" id="email" />
            </form>
            <div className="abs cta bottom-cta" aria-hidden="true">
              <img className="cta-type" src="/assets/type-cta-bottom.png" alt="" />
              <img className="cta-star" src="/assets/star-button.png" alt="" />
            </div>
          </section>

          <footer className="abs footer">
            <img className="abs footer-line" src="/assets/line-full.svg" alt="" />
            <DecorativeType className="footer-barcelona" src="/assets/type-footer-barcelona.png" alt="Barcelona" />
            <DecorativeType className="footer-country" src="/assets/type-footer-country.png" alt="country" />
            <p className="abs footer-copy">© 2026 Barcelona Country Festival · All rights reserved · Yeehaw!</p>
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
