import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { countryFlag, phoneCountries } from "../lib/phoneCountries";
import "./tickets.css";

type TicketLanguage = "de" | "es" | "ca" | "fr" | "en" | "it";
type TicketStep = "details" | "payment" | "processing" | "printing" | "complete";

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
  continuePayment: string;
  summary: string;
  generalTicket: string;
  unitPrice: string;
  total: string;
  paymentTitle: string;
  paymentBody: string;
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  paySimulation: string;
  editOrder: string;
  processing: string;
  processingBody: string;
  printing: string;
  printingBody: string;
  complete: string;
  completeBody: string;
  attendee: string;
  tickets: string;
  reference: string;
  demoTicket: string;
  returnHome: string;
};

const PRICE_PER_TICKET = 15;

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
    simulationBody: "Esta demostración no procesa pagos ni guarda los datos introducidos.", continuePayment: "Continuar al pago",
    summary: "Resumen del pedido", generalTicket: "Entrada general", unitPrice: "por entrada", total: "Total",
    paymentTitle: "Pago simulado", paymentBody: "Completa esta pantalla de demostración. No introduzcas datos bancarios reales.",
    cardName: "Titular de la tarjeta", cardNumber: "Número de tarjeta ficticio", expiry: "Caducidad", cvc: "CVC",
    paySimulation: "Simular pago", editOrder: "Editar pedido", processing: "Procesando la simulación…",
    processingBody: "Estamos preparando tu pedido de demostración.", printing: "Imprimiendo tus entradas…",
    printingBody: "La taquilla está preparando tu recibo.", complete: "¡Todo listo!",
    completeBody: "Tu entrada de demostración ya está impresa.", attendee: "Asistente", tickets: "Entradas",
    reference: "Referencia", demoTicket: "Entrada de demostración · Sin validez de acceso", returnHome: "Volver al festival"
  },
  ca: {
    languageName: "Català", back: "Tornar al festival", pageTitle: "Compra les teves entrades", eventDate: "19–21 novembre 2027",
    quantityTitle: "Quantes entrades vols?", attendeeTitle: "Dades de l'assistent", quantityLabel: "Entrades",
    name: "Nom complet", namePlaceholder: "Ex. Joan Pérez", email: "Correu electrònic", emailPlaceholder: "exemple@correu.com",
    phone: "Telèfon", prefix: "Prefix", simulationTitle: "Simulació — no es farà cap càrrec",
    simulationBody: "Aquesta demostració no processa pagaments ni desa les dades introduïdes.", continuePayment: "Continuar al pagament",
    summary: "Resum de la comanda", generalTicket: "Entrada general", unitPrice: "per entrada", total: "Total",
    paymentTitle: "Pagament simulat", paymentBody: "Completa aquesta pantalla de demostració. No introdueixis dades bancàries reals.",
    cardName: "Titular de la targeta", cardNumber: "Número de targeta fictici", expiry: "Caducitat", cvc: "CVC",
    paySimulation: "Simular pagament", editOrder: "Editar comanda", processing: "Processant la simulació…",
    processingBody: "Estem preparant la teva comanda de demostració.", printing: "Imprimint les teves entrades…",
    printingBody: "La taquilla està preparant el teu rebut.", complete: "Tot a punt!",
    completeBody: "La teva entrada de demostració ja està impresa.", attendee: "Assistent", tickets: "Entrades",
    reference: "Referència", demoTicket: "Entrada de demostració · Sense validesa d'accés", returnHome: "Tornar al festival"
  },
  en: {
    languageName: "English", back: "Back to the festival", pageTitle: "Buy your tickets", eventDate: "November 19–21, 2027",
    quantityTitle: "How many tickets would you like?", attendeeTitle: "Attendee details", quantityLabel: "Tickets",
    name: "Full name", namePlaceholder: "e.g. Jane Smith", email: "Email address", emailPlaceholder: "name@example.com",
    phone: "Phone", prefix: "Prefix", simulationTitle: "Simulation — no charge will be made",
    simulationBody: "This demo does not process payments or store the information entered.", continuePayment: "Continue to payment",
    summary: "Order summary", generalTicket: "General admission", unitPrice: "per ticket", total: "Total",
    paymentTitle: "Simulated payment", paymentBody: "Complete this demonstration screen. Do not enter real banking details.",
    cardName: "Name on card", cardNumber: "Fictitious card number", expiry: "Expiry", cvc: "CVC",
    paySimulation: "Simulate payment", editOrder: "Edit order", processing: "Processing the simulation…",
    processingBody: "We are preparing your demonstration order.", printing: "Printing your tickets…",
    printingBody: "The box office is preparing your receipt.", complete: "All set!",
    completeBody: "Your demonstration ticket has been printed.", attendee: "Attendee", tickets: "Tickets",
    reference: "Reference", demoTicket: "Demonstration ticket · Not valid for admission", returnHome: "Back to the festival"
  },
  fr: {
    languageName: "Français", back: "Retour au festival", pageTitle: "Achetez vos billets", eventDate: "19–21 novembre 2027",
    quantityTitle: "Combien de billets souhaitez-vous ?", attendeeTitle: "Coordonnées du participant", quantityLabel: "Billets",
    name: "Nom complet", namePlaceholder: "Ex. Jean Dupont", email: "Adresse e-mail", emailPlaceholder: "exemple@courriel.com",
    phone: "Téléphone", prefix: "Indicatif", simulationTitle: "Simulation — aucun débit ne sera effectué",
    simulationBody: "Cette démonstration ne traite aucun paiement et ne conserve aucune donnée saisie.", continuePayment: "Continuer vers le paiement",
    summary: "Récapitulatif", generalTicket: "Entrée générale", unitPrice: "par billet", total: "Total",
    paymentTitle: "Paiement simulé", paymentBody: "Complétez cet écran de démonstration. Ne saisissez aucune donnée bancaire réelle.",
    cardName: "Titulaire de la carte", cardNumber: "Numéro de carte fictif", expiry: "Expiration", cvc: "CVC",
    paySimulation: "Simuler le paiement", editOrder: "Modifier la commande", processing: "Traitement de la simulation…",
    processingBody: "Nous préparons votre commande de démonstration.", printing: "Impression de vos billets…",
    printingBody: "La billetterie prépare votre reçu.", complete: "Tout est prêt !",
    completeBody: "Votre billet de démonstration est imprimé.", attendee: "Participant", tickets: "Billets",
    reference: "Référence", demoTicket: "Billet de démonstration · Non valable pour l'accès", returnHome: "Retour au festival"
  },
  it: {
    languageName: "Italiano", back: "Torna al festival", pageTitle: "Acquista i tuoi biglietti", eventDate: "19–21 novembre 2027",
    quantityTitle: "Quanti biglietti vuoi?", attendeeTitle: "Dati del partecipante", quantityLabel: "Biglietti",
    name: "Nome completo", namePlaceholder: "Es. Mario Rossi", email: "E-mail", emailPlaceholder: "esempio@email.com",
    phone: "Telefono", prefix: "Prefisso", simulationTitle: "Simulazione — non verrà effettuato alcun addebito",
    simulationBody: "Questa demo non elabora pagamenti e non salva i dati inseriti.", continuePayment: "Continua al pagamento",
    summary: "Riepilogo dell'ordine", generalTicket: "Ingresso generale", unitPrice: "per biglietto", total: "Totale",
    paymentTitle: "Pagamento simulato", paymentBody: "Completa questa schermata dimostrativa. Non inserire dati bancari reali.",
    cardName: "Titolare della carta", cardNumber: "Numero di carta fittizio", expiry: "Scadenza", cvc: "CVC",
    paySimulation: "Simula pagamento", editOrder: "Modifica ordine", processing: "Elaborazione della simulazione…",
    processingBody: "Stiamo preparando il tuo ordine dimostrativo.", printing: "Stampa dei biglietti…",
    printingBody: "La biglietteria sta preparando la ricevuta.", complete: "Tutto pronto!",
    completeBody: "Il tuo biglietto dimostrativo è stato stampato.", attendee: "Partecipante", tickets: "Biglietti",
    reference: "Riferimento", demoTicket: "Biglietto dimostrativo · Non valido per l'accesso", returnHome: "Torna al festival"
  },
  de: {
    languageName: "Deutsch", back: "Zurück zum Festival", pageTitle: "Tickets kaufen", eventDate: "19.–21. November 2027",
    quantityTitle: "Wie viele Tickets möchtest du?", attendeeTitle: "Teilnehmerdaten", quantityLabel: "Tickets",
    name: "Vollständiger Name", namePlaceholder: "z. B. Max Mustermann", email: "E-Mail-Adresse", emailPlaceholder: "name@beispiel.de",
    phone: "Telefon", prefix: "Vorwahl", simulationTitle: "Simulation — es erfolgt keine Abbuchung",
    simulationBody: "Diese Demo verarbeitet keine Zahlungen und speichert keine eingegebenen Daten.", continuePayment: "Weiter zur Zahlung",
    summary: "Bestellübersicht", generalTicket: "Allgemeiner Eintritt", unitPrice: "pro Ticket", total: "Gesamt",
    paymentTitle: "Simulierte Zahlung", paymentBody: "Fülle diese Demoseite aus. Gib keine echten Bankdaten ein.",
    cardName: "Karteninhaber", cardNumber: "Fiktive Kartennummer", expiry: "Gültig bis", cvc: "CVC",
    paySimulation: "Zahlung simulieren", editOrder: "Bestellung ändern", processing: "Simulation wird verarbeitet…",
    processingBody: "Wir bereiten deine Demobestellung vor.", printing: "Tickets werden gedruckt…",
    printingBody: "Die Kasse erstellt deinen Beleg.", complete: "Alles bereit!",
    completeBody: "Dein Demoticket wurde gedruckt.", attendee: "Teilnehmer", tickets: "Tickets",
    reference: "Referenz", demoTicket: "Demoticket · Nicht als Eintrittskarte gültig", returnHome: "Zurück zum Festival"
  }
};

function getInitialTicketLanguage(): TicketLanguage {
  const stored = window.localStorage.getItem("barcelona-country-language");
  return ticketLanguages.some((language) => language.key === stored) ? stored as TicketLanguage : "es";
}

function createReference() {
  return `BCF27-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function playStampSound(context: AudioContext) {
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(115, now);
  oscillator.frequency.exponentialRampToValueAtTime(46, now + .12);
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(.22, now + .008);
  gain.gain.exponentialRampToValueAtTime(.0001, now + .18);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + .2);
}

function playPrinterSound(onStamp: () => void) {
  const context = new AudioContext();
  const duration = 4.4;
  const frameCount = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    const time = index / context.sampleRate;
    const feedPulse = Math.sin(time * Math.PI * 2 * 38) > .72 ? 1 : .08;
    const motor = Math.sin(time * Math.PI * 2 * 92) * .22;
    channel[index] = (Math.random() * 2 - 1) * feedPulse * .12 + motor * .09;
  }

  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  gain.gain.setValueAtTime(.0001, context.currentTime);
  gain.gain.linearRampToValueAtTime(.55, context.currentTime + .08);
  gain.gain.setValueAtTime(.55, context.currentTime + duration - .15);
  gain.gain.linearRampToValueAtTime(.0001, context.currentTime + duration);
  source.connect(gain).connect(context.destination);
  source.start();

  const stampTimer = window.setTimeout(() => {
    playStampSound(context);
    onStamp();
  }, 4850);
  const closeTimer = window.setTimeout(() => void context.close(), 5600);

  return () => {
    window.clearTimeout(stampTimer);
    window.clearTimeout(closeTimer);
    try { source.stop(); } catch { /* Audio may already have finished. */ }
    void context.close();
  };
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
  const [language, setLanguage] = useState<TicketLanguage>(getInitialTicketLanguage);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [quantity, setQuantity] = useState(2);
  const [step, setStep] = useState<TicketStep>("details");
  const [buyer, setBuyer] = useState({ name: "", email: "", phone: "", prefix: "+34" });
  const [stampVisible, setStampVisible] = useState(false);
  const [reference] = useState(createReference);
  const timersRef = useRef<number[]>([]);
  const stopAudioRef = useRef<null | (() => void)>(null);
  const copy = ticketCopies[language];
  const activeLanguage = ticketLanguages.find((item) => item.key === language) ?? ticketLanguages[1];
  const total = quantity * PRICE_PER_TICKET;
  const currency = useMemo(() => new Intl.NumberFormat(language, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }), [language]);
  const regionNames = useMemo(() => new Intl.DisplayNames([language], { type: "region" }), [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = `${copy.pageTitle} · Barcelona Country Fest`;
  }, [copy.pageTitle, language]);

  useEffect(() => () => {
    timersRef.current.forEach(window.clearTimeout);
    stopAudioRef.current?.();
  }, []);

  const changeLanguage = (nextLanguage: TicketLanguage) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem("barcelona-country-language", nextLanguage);
    setLanguageOpen(false);
  };

  const updateBuyer = (field: keyof typeof buyer, value: string) => setBuyer((current) => ({ ...current, [field]: value }));

  const handleDetails = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: "auto" });
    setStep("processing");
    setStampVisible(false);
    if (reducedMotion) {
      timersRef.current.push(window.setTimeout(() => setStampVisible(true), 240));
    } else {
      try {
        stopAudioRef.current = playPrinterSound(() => setStampVisible(true));
      } catch {
        timersRef.current.push(window.setTimeout(() => setStampVisible(true), 4850));
      }
    }
    timersRef.current.push(window.setTimeout(() => setStep("printing"), reducedMotion ? 80 : 1050));
    timersRef.current.push(window.setTimeout(() => setStep("complete"), reducedMotion ? 300 : 5150));
  };

  const isReceiptStage = step === "processing" || step === "printing" || step === "complete";

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

      <main className={`ticket-main is-${step}`}>
        {!isReceiptStage ? <>
          <div className="ticket-heading">
            <p><TicketIcon name="calendar" />{copy.eventDate}</p>
            <h1>{step === "payment" ? copy.paymentTitle : copy.pageTitle}</h1>
            {step === "payment" && <span>{copy.paymentBody}</span>}
          </div>
          <div className="ticket-checkout-grid">
            {step === "details" ? (
              <form className="ticket-form-panel" onSubmit={handleDetails}>
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
                <button className="ticket-action" type="submit">{copy.continuePayment}<span>→</span></button>
              </form>
            ) : (
              <form className="ticket-form-panel ticket-payment-panel" onSubmit={handlePayment} autoComplete="off">
                <div className="ticket-payment-card" aria-hidden="true"><img src="/assets/logo-star.png" alt="" /><span>BCF · DEMO</span><strong>•••• •••• •••• 2027</strong><small>{buyer.name || copy.cardName}</small></div>
                <div className="ticket-fields">
                  <label>{copy.cardName}<input required value={buyer.name} onChange={(event) => updateBuyer("name", event.target.value)} /></label>
                  <label>{copy.cardNumber}<input required inputMode="numeric" minLength={12} maxLength={19} placeholder="4242 4242 4242 4242" /></label>
                  <label>{copy.expiry}<input required inputMode="numeric" maxLength={5} placeholder="11/27" /></label>
                  <label>{copy.cvc}<input required inputMode="numeric" minLength={3} maxLength={4} placeholder="000" /></label>
                </div>
                <div className="ticket-demo-notice"><TicketIcon name="lock" /><div><strong>{copy.simulationTitle}</strong><p>{copy.simulationBody}</p></div></div>
                <div className="ticket-payment-actions"><button type="button" className="ticket-secondary" onClick={() => setStep("details")}>{copy.editOrder}</button><button className="ticket-action" type="submit">{copy.paySimulation}<span>→</span></button></div>
              </form>
            )}
            <OrderSummary copy={copy} quantity={quantity} total={total} currency={currency} />
          </div>
        </> : (
          <section className="ticket-receipt-stage" aria-live="polite">
            <div className="ticket-receipt-heading">
              <p>{step === "complete" ? copy.completeBody : step === "printing" ? copy.printingBody : copy.processingBody}</p>
              <h1>{step === "complete" ? copy.complete : step === "printing" ? copy.printing : copy.processing}</h1>
            </div>
            <div className={`receipt-printer ${step === "printing" || step === "complete" ? "is-printing" : ""} ${step === "complete" ? "is-complete" : ""}`}>
              <div className="receipt-printer-top"><i /><i /><img src="/assets/logo-star.png" alt="" /><i /><i /></div>
              <div className="receipt-printer-front"><div className="receipt-slot"><span /></div></div>
              <div className="receipt-paper-wrap">
                <article className="receipt-paper">
                  <div className="receipt-brand" aria-label="Barcelona Country Fest"><strong>Barcelona Country</strong><span>Fest</span></div>
                  <p className="receipt-date">{copy.eventDate}</p>
                  <div className="receipt-row"><span>{copy.attendee}</span><strong>{buyer.name}</strong></div>
                  <div className="receipt-row"><span>{copy.tickets}</span><strong>{quantity} × {currency.format(PRICE_PER_TICKET)}</strong></div>
                  <div className="receipt-row receipt-total"><span>{copy.total}</span><strong>{currency.format(total)}</strong></div>
                  <div className="receipt-row"><span>{copy.reference}</span><strong>{reference}</strong></div>
                  <p className="receipt-demo">{copy.demoTicket}</p>
                  <img className={`receipt-stamp ${stampVisible ? "is-visible" : ""}`} src="/assets/ticket-stamp.png" alt="Barcelona Country" />
                </article>
              </div>
              <div className={`receipt-stamper ${stampVisible ? "has-stamped" : ""}`} aria-hidden="true"><span /><b /></div>
            </div>
            {step === "complete" && <a className="ticket-action ticket-return" href="/">{copy.returnHome}<span>→</span></a>}
          </section>
        )}
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
