"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./ticket-animation.css";

type SceneStep = "curtain" | "printing" | "cutting" | "stamping" | "lifting" | "final";

export type TicketData = {
  /** Nombre que se imprime en el campo ASISTENTE. */
  attendeeName: string;
  /** Número de entradas que se imprime en el ticket. Mínimo: 1. */
  quantity: number;
  /** Precio de una entrada. Por defecto: 15. */
  unitPrice?: number;
  /** Referencia personalizada. Si se omite, se genera una automáticamente. */
  reference?: string;
  /** Texto de fecha que se muestra bajo el logotipo. */
  eventDate?: string;
  /** Símbolo o código de moneda. Por defecto: €. */
  currency?: string;
};

export type TicketAnimationProps = {
  ticket: TicketData;
  /** Carpeta pública en la que copies la carpeta assets incluida. */
  assetBase?: string;
  /** Arranca automáticamente desde el telón cerrado. Por defecto: true. */
  autoStart?: boolean;
  /** Incrementa este número para reiniciar la animación. */
  playKey?: number;
  /** Muestra el botón para saltar la secuencia. Por defecto: false. */
  showSkip?: boolean;
  /** Se llama cuando el ticket ya está en vista cenital. */
  onComplete?: () => void;
};

function createReference(name: string, quantity: number) {
  const seed = `${name.toUpperCase()}-${quantity}-BCF27`;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  return `BCF27-${hash.toString(36).toUpperCase().padStart(5, "0").slice(0, 5)}`;
}

function formatMoney(amount: number, currency: string) {
  return `${amount.toLocaleString("es-ES")} ${currency}`;
}

export default function TicketAnimation({
  ticket,
  assetBase = "/ticket-animation",
  autoStart = true,
  playKey = 0,
  showSkip = false,
  onComplete,
}: TicketAnimationProps) {
  const [sceneStep, setSceneStep] = useState<SceneStep>("curtain");
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [stamped, setStamped] = useState(false);
  const timers = useRef<number[]>([]);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const quantity = Math.max(1, Math.trunc(Number(ticket.quantity) || 1));
  const unitPrice = Number.isFinite(ticket.unitPrice) ? Number(ticket.unitPrice) : 15;
  const currency = ticket.currency || "€";
  const attendeeName = ticket.attendeeName.trim() || "INVITADO";
  const reference = useMemo(
    () => ticket.reference?.trim() || createReference(attendeeName, quantity),
    [ticket.reference, attendeeName, quantity],
  );
  const total = quantity * unitPrice;
  const asset = (file: string) => `${assetBase.replace(/\/+$/, "")}/${file}`;

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    timers.current.push(window.setTimeout(callback, delay));
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setSceneStep("curtain");
    setCurtainsOpen(false);
    setStamped(false);

    schedule(() => setCurtainsOpen(true), 180);
    schedule(() => setSceneStep("printing"), 1750);
    schedule(() => setSceneStep("cutting"), 6750);
    schedule(() => setSceneStep("stamping"), 7450);
    schedule(() => setStamped(true), 8640);
    schedule(() => setSceneStep("lifting"), 9800);
    schedule(() => {
      setSceneStep("final");
      onCompleteRef.current?.();
    }, 11350);
  }, [clearTimers, schedule]);

  useEffect(() => {
    if (autoStart || playKey > 0) start();
    return clearTimers;
  }, [autoStart, clearTimers, playKey, start]);

  const skip = () => {
    clearTimers();
    setCurtainsOpen(true);
    setStamped(true);
    setSceneStep("final");
    onCompleteRef.current?.();
  };

  const status: Record<SceneStep, string> = {
    curtain: "Abriendo el escenario",
    printing: "Imprimiendo tus entradas",
    cutting: "Recortando tu entrada",
    stamping: "Validando tu pase",
    lifting: "Preparando tu entrada",
    final: "Tu entrada está lista",
  };

  return (
    <section className={`bct-animation bct-scene-${sceneStep} ${curtainsOpen ? "bct-curtains-open" : ""}`} aria-live="polite">
      <div className="bct-venue" style={{ backgroundImage: `url("${asset("stage.png")}")` }} aria-hidden="true" />
      <div className="bct-stage-vignette" aria-hidden="true" />

      <div className="bct-heading">
        <p>{status[sceneStep]}</p>
        <div className="bct-progress"><span /></div>
      </div>

      <div className="bct-curtains" aria-hidden="true">
        <div className="bct-curtain bct-curtain-left" style={{ backgroundImage: `url("${asset("curtains.png")}")` }} />
        <div className="bct-curtain bct-curtain-right" style={{ backgroundImage: `url("${asset("curtains.png")}")` }} />
        <div className="bct-curtain-shadow" />
      </div>

      <img className="bct-printer-table" src={asset("printer-table-v2.png")} alt="" aria-hidden="true" draggable={false} />
      <div className="bct-machine" aria-hidden="true">
        <div className="bct-machine-shadow" />
        <img className="bct-printer" src={asset("printer.png")} alt="" draggable={false} />
      </div>

      <div className="bct-ticket-stage">
        <article className="bct-ticket">
          <div className="bct-ticket-stock" aria-hidden="true" />
          <header className="bct-ticket-logo"><span>BARCELONA</span><span>COUNTRY</span><strong>FEST</strong><i>★</i></header>
          <p className="bct-ticket-date">{ticket.eventDate || "19—21 NOVIEMBRE 2027"}</p>
          <div className="bct-ticket-field"><small>ASISTENTE</small><b>{attendeeName}</b></div>
          <div className="bct-ticket-field"><small>ENTRADAS</small><b>{quantity} {quantity === 1 ? "ENTRADA" : "ENTRADAS"}</b></div>
          <div className="bct-ticket-field bct-ticket-total"><small>TOTAL</small><b>{formatMoney(total, currency)}</b></div>
          <div className="bct-ticket-field bct-ticket-ref"><small>REFERENCIA</small><b>{reference}</b></div>
          <p className="bct-ticket-note">ACCESO PERSONAL · CONSERVA ESTE TICKET</p>
          <img className={`bct-ticket-stamp ${stamped ? "bct-visible" : ""}`} src={asset("barcelona-country-stamp.png")} alt="Sello Barcelona Country" draggable={false} />
        </article>
      </div>

      <img className="bct-stamp-tool" src={asset("stamp-tool-perspective.png")} alt="" aria-hidden="true" draggable={false} />

      {showSkip && sceneStep !== "final" && <button className="bct-skip" type="button" onClick={skip}>SALTAR ANIMACIÓN ↗</button>}
    </section>
  );
}
