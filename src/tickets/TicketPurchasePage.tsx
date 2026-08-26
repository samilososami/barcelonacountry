import { useEffect, useMemo, useState, type FormEvent } from "react";
import { preload } from "react-dom";
import { countryFlag, phoneCountries } from "../lib/phoneCountries";
import TicketAnimation from "./animation/TicketAnimation";
import "./tickets.css";

type TicketLanguage = "de" | "es" | "ca" | "fr" | "en" | "it";
type TicketStep = "details" | "animation";

type TicketCopy = {
  languageName: string;
  back: string;
  pageTitle: string;
  eventDate: string;
  quantityTitle: string;
  attendeeTitle: string;
  quantityLabel: string;
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  phone: string;
  prefix: string;
  simulationTitle: string;
  simulationBody: string;
  confirmPurchase: string;
  summary: string;
  generalTicket: string;
  unitPrice: string;
  total: string;
  returnHome: string;
};

const PRICE_PER_TICKET = 15;
const TICKET_ANIMATION_ASSETS = [
  "barcelona-country-stamp.png",
  "curtains.png",
  "printer-table-v2.png",
  "printer.png",
  "stage.png",
  "stamp-tool-perspective.png"
];

const ticketLanguages: { key: TicketLanguage; label: string; icon: string }[] = [
  { key: "de", label: "Deutsch", icon: "🇩🇪" },
  { key: "es", label: "Español", icon: "🇪🇸" },
  { key: "ca", label: "Català", icon: "CAT" },
  { key: "fr", label: "Français", icon: "🇫🇷" },
  { key: "en", label: "English", icon: "🇬🇧" },
  { key: "it", label: "Italiano", icon: "🇮🇹" }
];

const ticketCopies: Record<TicketLanguage, TicketCopy> = {
  es: {
    languageName: "Español", back: "Volver al festival", pageTitle: "Compra tus entradas", eventDate: "19–21 noviembre 2027",
    quantityTitle: "¿Cuántas entradas quieres?", attendeeTitle: "Datos del asistente", quantityLabel: "Entradas",
    name: "Nombre completo", namePlaceholder: "Ej. Juan Pérez", email: "Correo electrónico", emailPlaceholder: "ejemplo@correo.com",
    phone: "Teléfono", prefix: "Prefijo", simulationTitle: "Simulación — no se realizará ningún cargo",
    simulationBody: "Esta demostración no procesa pagos ni guarda los datos introducidos.", confirmPurchase: "Validar compra simulada",
    summary: "Resumen del pedido", generalTicket: "Entrada general", unitPrice: "por entrada", total: "Total", returnHome: "Volver al festival"
  },
  ca: {
    languageName: "Català", back: "Tornar al festival", pageTitle: "Compra les teves entrades", eventDate: "19–21 novembre 2027",
    quantityTitle: "Quantes entrades vols?", attendeeTitle: "Dades de l'assistent", quantityLabel: "Entrades",
    name: "Nom complet", namePlaceholder: "Ex. Joan Pérez", email: "Correu electrònic", emailPlaceholder: "exemple@correu.com",
    phone: "Telèfon", prefix: "Prefix", simulationTitle: "Simulació — no es farà cap càrrec",
    simulationBody: "Aquesta demostració no processa pagaments ni desa les dades introduïdes.", confirmPurchase: "Validar compra simulada",
    summary: "Resum de la comanda", generalTicket: "Entrada general", unitPrice: "per entrada", total: "Total", returnHome: "Tornar al festival"
  },
  en: {
    languageName: "English", back: "Back to the festival", pageTitle: "Buy your tickets", eventDate: "November 19–21, 2027",
    quantityTitle: "How many tickets would you like?", attendeeTitle: "Attendee details", quantityLabel: "Tickets",
    name: "Full name", namePlaceholder: "e.g. Jane Smith", email: "Email address", emailPlaceholder: "name@example.com",
    phone: "Phone", prefix: "Prefix", simulationTitle: "Simulation — no charge will be made",
    simulationBody: "This demo does not process payments or store the information entered.", confirmPurchase: "Confirm simulated purchase",
    summary: "Order summary", generalTicket: "General admission", unitPrice: "per ticket", total: "Total", returnHome: "Back to the festival"
  },
  fr: {
    languageName: "Français", back: "Retour au festival", pageTitle: "Achetez vos billets", eventDate: "19–21 novembre 2027",
    quantityTitle: "Combien de billets souhaitez-vous ?", attendeeTitle: "Coordonnées du participant", quantityLabel: "Billets",
    name: "Nom complet", namePlaceholder: "Ex. Jean Dupont", email: "Adresse e-mail", emailPlaceholder: "exemple@courriel.com",
    phone: "Téléphone", prefix: "Indicatif", simulationTitle: "Simulation — aucun débit ne sera effectué",
    simulationBody: "Cette démonstration ne traite aucun paiement et ne conserve aucune donnée saisie.", confirmPurchase: "Valider l'achat simulé",
    summary: "Récapitulatif", generalTicket: "Entrée générale", unitPrice: "par billet", total: "Total", returnHome: "Retour au festival"
  },
  it: {
    languageName: "Italiano", back: "Torna al festival", pageTitle: "Acquista i tuoi biglietti", eventDate: "19–21 novembre 2027",
    quantityTitle: "Quanti biglietti vuoi?", attendeeTitle: "Dati del partecipante", quantityLabel: "Biglietti",
    name: "Nome completo", namePlaceholder: "Es. Mario Rossi", email: "E-mail", emailPlaceholder: "esempio@email.com",
    phone: "Telefono", prefix: "Prefisso", simulationTitle: "Simulazione — non verrà effettuato alcun addebito",
    simulationBody: "Questa demo non elabora pagamenti e non salva i dati inseriti.", confirmPurchase: "Conferma acquisto simulato",
    summary: "Riepilogo dell'ordine", generalTicket: "Ingresso generale", unitPrice: "per biglietto", total: "Totale", returnHome: "Torna al festival"
  },
  de: {
    languageName: "Deutsch", back: "Zurück zum Festival", pageTitle: "Tickets kaufen", eventDate: "19.–21. November 2027",
    quantityTitle: "Wie viele Tickets möchtest du?", attendeeTitle: "Teilnehmerdaten", quantityLabel: "Tickets",
    name: "Vollständiger Name", namePlaceholder: "z. B. Max Mustermann", email: "E-Mail-Adresse", emailPlaceholder: "name@beispiel.de",
    phone: "Telefon", prefix: "Vorwahl", simulationTitle: "Simulation — es erfolgt keine Abbuchung",
    simulationBody: "Diese Demo verarbeitet keine Zahlungen und speichert keine eingegebenen Daten.", confirmPurchase: "Simulierten Kauf bestätigen",
    summary: "Bestellübersicht", generalTicket: "Allgemeiner Eintritt", unitPrice: "pro Ticket", total: "Gesamt", returnHome: "Zurück zum Festival"
  }
};

function getInitialTicketLanguage(): TicketLanguage {
  const stored = window.localStorage.getItem("barcelona-country-language");
  return ticketLanguages.some((language) => language.key === stored) ? stored as TicketLanguage : "es";
}

function createReference() {
  return `BCF27-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function TicketIcon({ name }: { name: "arrow" | "calendar" | "lock" | "ticket" }) {
  const paths = {
    arrow: <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
    calendar: <><path d="M6 2v4M18 2v4M3 9h18" /><rect x="3" y="4" width="18" height="18" rx="2" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    ticket: <><path d="M2 9a3 3 0 0 0 0 6v4h20v-4a3 3 0 0 0 0-6V5H2Z" /><path d="M13 5v2M13 11v2M13 17v2" /></>
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24">{paths[name]}</svg>;
}

export function TicketPurchasePage() {
  TICKET_ANIMATION_ASSETS.forEach((file) => preload(`/ticket-animation/${file}`, { as: "image" }));
  const [language, setLanguage] = useState<TicketLanguage>(getInitialTicketLanguage);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [quantity, setQuantity] = useState(2);
  const [step, setStep] = useState<TicketStep>("details");
  const [buyer, setBuyer] = useState({ name: "", email: "", phone: "", prefix: "+34" });
  const [animationComplete, setAnimationComplete] = useState(false);
  const [reference] = useState(createReference);
  const copy = ticketCopies[language];
  const activeLanguage = ticketLanguages.find((item) => item.key === language) ?? ticketLanguages[1];
  const total = quantity * PRICE_PER_TICKET;
  const currency = useMemo(() => new Intl.NumberFormat(language, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }), [language]);
  const regionNames = useMemo(() => new Intl.DisplayNames([language], { type: "region" }), [language]);
  const ticketData = useMemo(() => ({
    attendeeName: buyer.name,
    quantity,
    unitPrice: PRICE_PER_TICKET,
    reference,
    eventDate: copy.eventDate.toLocaleUpperCase(language),
    currency: "€"
  }), [buyer.name, copy.eventDate, language, quantity, reference]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = `${copy.pageTitle} · Barcelona Country Fest`;
  }, [copy.pageTitle, language]);

  useEffect(() => {
    if (step !== "animation") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [step]);

  const changeLanguage = (nextLanguage: TicketLanguage) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem("barcelona-country-language", nextLanguage);
    setLanguageOpen(false);
  };

  const updateBuyer = (field: keyof typeof buyer, value: string) => setBuyer((current) => ({ ...current, [field]: value }));

  const handlePurchase = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAnimationComplete(false);
    setStep("animation");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  if (step === "animation") {
    return (
      <div className="ticket-page ticket-animation-page">
        <TicketAnimation
          ticket={ticketData}
          assetBase="/ticket-animation"
          onComplete={() => setAnimationComplete(true)}
        />
        {animationComplete && <a className="ticket-action ticket-animation-return" href="/">{copy.returnHome}<span>→</span></a>}
      </div>
    );
  }

  return (
    <div className="ticket-page">
      <div className="ticket-page-background" aria-hidden="true" />
      <header className="ticket-header">
        <a className="ticket-header-logo" href="/" aria-label="Barcelona Country Fest"><img src="/assets/logo-primary.png" alt="Barcelona Country" /></a>
        <a className="ticket-back" href="/"><TicketIcon name="arrow" />{copy.back}</a>
        <div className="ticket-language">
          <button type="button" aria-expanded={languageOpen} aria-controls="ticket-language-menu" onClick={() => setLanguageOpen((open) => !open)}>
            <span aria-hidden="true">{activeLanguage.icon}</span><span>{language.toUpperCase()}</span><b aria-hidden="true">⌄</b>
          </button>
          {languageOpen && <div id="ticket-language-menu" role="menu">
            {ticketLanguages.map((item) => <button key={item.key} type="button" role="menuitem" className={item.key === language ? "is-active" : ""} onClick={() => changeLanguage(item.key)}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}
          </div>}
        </div>
      </header>

      <main className="ticket-main is-details">
        <div className="ticket-heading">
          <p><TicketIcon name="calendar" />{copy.eventDate}</p>
          <h1>{copy.pageTitle}</h1>
        </div>
        <div className="ticket-checkout-grid">
          <form className="ticket-form-panel" onSubmit={handlePurchase}>
            <section className="ticket-form-section">
              <div className="ticket-section-number">01</div>
              <div className="ticket-form-content">
                <h2>{copy.quantityTitle}</h2>
                <div className="ticket-quantity-row">
                  <div className="ticket-stepper" aria-label={copy.quantityLabel}>
                    <button type="button" aria-label={`− ${copy.quantityLabel}`} disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
                    <output aria-live="polite">{quantity}</output>
                    <button type="button" aria-label={`+ ${copy.quantityLabel}`} disabled={quantity >= 10} onClick={() => setQuantity((value) => Math.min(10, value + 1))}>+</button>
                  </div>
                  <span>{currency.format(PRICE_PER_TICKET)} {copy.unitPrice}</span>
                </div>
              </div>
            </section>
            <section className="ticket-form-section">
              <div className="ticket-section-number">02</div>
              <div className="ticket-form-content">
                <h2>{copy.attendeeTitle}</h2>
                <div className="ticket-fields">
                  <label>{copy.name}<input required autoComplete="name" value={buyer.name} placeholder={copy.namePlaceholder} onChange={(event) => updateBuyer("name", event.target.value)} /></label>
                  <label>{copy.email}<input required type="email" autoComplete="email" value={buyer.email} placeholder={copy.emailPlaceholder} onChange={(event) => updateBuyer("email", event.target.value)} /></label>
                  <label className="ticket-phone-field">{copy.phone}<span><select aria-label={copy.prefix} value={buyer.prefix} onChange={(event) => updateBuyer("prefix", event.target.value)}>{phoneCountries.map((country) => <option key={`${country.iso}-${country.dial}`} value={country.dial}>{countryFlag(country.iso)} {regionNames.of(country.iso) ?? country.name} ({country.dial})</option>)}</select><input required type="tel" autoComplete="tel-national" value={buyer.phone} onChange={(event) => updateBuyer("phone", event.target.value)} /></span></label>
                </div>
              </div>
            </section>
            <div className="ticket-demo-notice"><span>i</span><div><strong>{copy.simulationTitle}</strong><p>{copy.simulationBody}</p></div></div>
            <button className="ticket-action" type="submit">{copy.confirmPurchase}<span>→</span></button>
          </form>
          <OrderSummary copy={copy} quantity={quantity} total={total} currency={currency} />
        </div>
      </main>
    </div>
  );
}

function OrderSummary({ copy, quantity, total, currency }: { copy: TicketCopy; quantity: number; total: number; currency: Intl.NumberFormat }) {
  return <aside className="ticket-order-summary">
    <h2>{copy.summary}</h2>
    <div className="ticket-order-line"><TicketIcon name="ticket" /><div><strong>{copy.generalTicket}</strong><span>{copy.eventDate}</span><p>{quantity} × {currency.format(PRICE_PER_TICKET)}</p></div><b>{currency.format(total)}</b></div>
    <div className="ticket-order-total"><span>{copy.total}</span><strong>{currency.format(total)}</strong></div>
    <div className="ticket-order-trust"><TicketIcon name="lock" /><span>{copy.simulationTitle}</span></div>
  </aside>;
}
