// HTML email templates for Barcelona Country: newsletter issues (and the welcome issue), the
// contact auto-reply and the internal contact notice. Table layout + inline styles, because that is
// what Gmail, Outlook and Apple Mail all honour. Web fonts load where supported (Apple Mail, iOS)
// and fall back to Georgia / Helvetica elsewhere.
import { contentEmailHtml, contentPlainText } from '../shared/newsletter-content.mjs';

export const SITE = 'https://www.barcelonacountry.com';
export const CONTACT_EMAIL = 'info@barcelonacountry.com';
export const PRIVACY_EMAIL = 'privacidad@barcelonacountry.com';
const INSTAGRAM = 'https://www.instagram.com/barcelonacountryfest/';

export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LANGS = ['es', 'ca', 'en', 'fr', 'it', 'de'];
export const pickLang = (lang) => (LANGS.includes(lang) ? lang : 'es');

// The festival palette, as on the web: night ink, paper, festival red.
const C = { night: '#0b0a09', ink: '#10100f', ink2: '#171716', paper: '#f2f1eb', paper2: '#e4e2da', red: '#c40000', accent: '#ff5b55', text: '#2a2723', muted: '#5f5a52', line: '#d9d6cc', cream: '#f2f1eb', dim: '#8f8b83' };
const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const SANS = "'Manrope', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const ART = `${SITE}/assets/email`; // masthead, ribbon, stamp, neon sign-off… rendered from the site's own fonts
const SEE_YOU = { es: 'Nos vemos en la pista.', ca: 'Ens veiem a la pista.', en: 'See you on the dance floor.', fr: 'On se voit sur la piste.', it: 'Ci vediamo in pista.', de: 'Wir sehen uns auf der Tanzfläche.' };

const copy = {
  es: { dates: '22–24 OCTUBRE 2027 · FIRA CORNELLÀ', news: 'Barcelona Country News', issue: 'Nº', read: 'Leer en la web', blog: 'Ver todos los números', unsub: 'Darme de baja', privacy: 'Privacidad', why: 'Recibes este correo porque te suscribiste a la newsletter de Barcelona Country Festival.', welcome: (n) => `¡Bienvenido/a, ${n}! Gracias por unirte a la familia. Aquí tienes nuestro último número.`, hi: (n) => `Hola, ${n}:`,
    replySubject: 'Hemos recibido tu mensaje · Barcelona Country Festival', replyKicker: 'Mensaje recibido', replyTitle: '¡Gracias por escribirnos!', replyBody: 'Hemos recibido tu mensaje y nos pondremos en contacto contigo lo antes posible. Normalmente respondemos en uno o dos días laborables.', replyCopy: 'Esto es lo que nos has enviado:', replyMore: 'Mientras tanto, descubre el cartel, el programa y todo lo que se cuece para octubre de 2027.', visit: 'Visitar la web', replyWhy: 'Has recibido este correo porque has escrito a Barcelona Country Festival desde nuestra web.', sign: 'El equipo de Barcelona Country Festival' },
  ca: { dates: '22–24 OCTUBRE 2027 · FIRA CORNELLÀ', news: 'Barcelona Country News', issue: 'Núm.', read: 'Llegeix-lo al web', blog: 'Tots els números', unsub: 'Donar-me de baixa', privacy: 'Privacitat', why: 'Reps aquest correu perquè et vas subscriure a la newsletter de Barcelona Country Festival.', welcome: (n) => `Benvingut/da, ${n}! Gràcies per unir-te a la família. Aquí tens el nostre darrer número.`, hi: (n) => `Hola, ${n}:`,
    replySubject: 'Hem rebut el teu missatge · Barcelona Country Festival', replyKicker: 'Missatge rebut', replyTitle: 'Gràcies per escriure’ns!', replyBody: 'Hem rebut el teu missatge i ens posarem en contacte amb tu tan aviat com puguem. Normalment responem en un o dos dies laborables.', replyCopy: 'Això és el que ens has enviat:', replyMore: 'Mentrestant, descobreix el cartell, el programa i tot el que preparem per a l’octubre de 2027.', visit: 'Visita el web', replyWhy: 'Has rebut aquest correu perquè has escrit a Barcelona Country Festival des del nostre web.', sign: 'L’equip de Barcelona Country Festival' },
  en: { dates: '22–24 OCTOBER 2027 · FIRA CORNELLÀ', news: 'Barcelona Country News', issue: 'No.', read: 'Read it online', blog: 'All issues', unsub: 'Unsubscribe', privacy: 'Privacy', why: 'You are receiving this email because you subscribed to the Barcelona Country Festival newsletter.', welcome: (n) => `Welcome, ${n}! Thanks for joining the family. Here is our latest issue.`, hi: (n) => `Hi ${n},`,
    replySubject: 'We got your message · Barcelona Country Festival', replyKicker: 'Message received', replyTitle: 'Thanks for writing to us!', replyBody: 'We have received your message and will get back to you as soon as possible. We usually reply within one or two working days.', replyCopy: 'This is what you sent us:', replyMore: 'In the meantime, discover the line-up, the programme and everything we are preparing for October 2027.', visit: 'Visit the website', replyWhy: 'You received this email because you wrote to Barcelona Country Festival through our website.', sign: 'The Barcelona Country Festival team' },
  fr: { dates: '22–24 OCTOBRE 2027 · FIRA CORNELLÀ', news: 'Barcelona Country News', issue: 'N°', read: 'Lire en ligne', blog: 'Tous les numéros', unsub: 'Se désinscrire', privacy: 'Confidentialité', why: 'Vous recevez cet e-mail parce que vous vous êtes inscrit·e à la newsletter de Barcelona Country Festival.', welcome: (n) => `Bienvenue, ${n} ! Merci de rejoindre la famille. Voici notre dernier numéro.`, hi: (n) => `Bonjour ${n},`,
    replySubject: 'Nous avons reçu votre message · Barcelona Country Festival', replyKicker: 'Message reçu', replyTitle: 'Merci de nous avoir écrit !', replyBody: 'Nous avons bien reçu votre message et nous vous répondrons dès que possible, en général sous un ou deux jours ouvrables.', replyCopy: 'Voici ce que vous nous avez envoyé :', replyMore: 'En attendant, découvrez la programmation et tout ce que nous préparons pour octobre 2027.', visit: 'Visiter le site', replyWhy: 'Vous avez reçu cet e-mail parce que vous avez écrit à Barcelona Country Festival depuis notre site.', sign: 'L’équipe de Barcelona Country Festival' },
  it: { dates: '22–24 OTTOBRE 2027 · FIRA CORNELLÀ', news: 'Barcelona Country News', issue: 'N.', read: 'Leggi online', blog: 'Tutti i numeri', unsub: 'Annulla iscrizione', privacy: 'Privacy', why: 'Ricevi questa email perché ti sei iscritto/a alla newsletter di Barcelona Country Festival.', welcome: (n) => `Benvenuto/a, ${n}! Grazie di far parte della famiglia. Ecco il nostro ultimo numero.`, hi: (n) => `Ciao ${n},`,
    replySubject: 'Abbiamo ricevuto il tuo messaggio · Barcelona Country Festival', replyKicker: 'Messaggio ricevuto', replyTitle: 'Grazie per averci scritto!', replyBody: 'Abbiamo ricevuto il tuo messaggio e ti risponderemo il prima possibile, di solito entro uno o due giorni lavorativi.', replyCopy: 'Ecco cosa ci hai inviato:', replyMore: 'Nel frattempo scopri il cartellone, il programma e tutto ciò che prepariamo per ottobre 2027.', visit: 'Visita il sito', replyWhy: 'Hai ricevuto questa email perché hai scritto a Barcelona Country Festival dal nostro sito.', sign: 'Il team di Barcelona Country Festival' },
  de: { dates: '22.–24. OKTOBER 2027 · FIRA CORNELLÀ', news: 'Barcelona Country News', issue: 'Nr.', read: 'Online lesen', blog: 'Alle Ausgaben', unsub: 'Abmelden', privacy: 'Datenschutz', why: 'Du erhältst diese E-Mail, weil du den Newsletter von Barcelona Country Festival abonniert hast.', welcome: (n) => `Willkommen, ${n}! Schön, dass du dabei bist. Hier ist unsere neueste Ausgabe.`, hi: (n) => `Hallo ${n},`,
    replySubject: 'Wir haben deine Nachricht erhalten · Barcelona Country Festival', replyKicker: 'Nachricht erhalten', replyTitle: 'Danke für deine Nachricht!', replyBody: 'Wir haben deine Nachricht erhalten und melden uns so schnell wie möglich, meist innerhalb von ein bis zwei Werktagen.', replyCopy: 'Das hast du uns geschickt:', replyMore: 'Entdecke inzwischen das Line-up, das Programm und alles, was wir für Oktober 2027 vorbereiten.', visit: 'Zur Website', replyWhy: 'Du hast diese E-Mail erhalten, weil du Barcelona Country Festival über unsere Website geschrieben hast.', sign: 'Das Team von Barcelona Country Festival' },
};
export const emailCopy = copy;

const button = (href, label) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 8px"><tr><td bgcolor="${C.red}" style="background:${C.red};border-radius:999px;box-shadow:0 12px 26px -14px rgba(196,0,0,.9)"><a href="${escapeHtml(href)}" style="display:inline-block;padding:16px 30px;font:700 12px/1 ${SANS};letter-spacing:.2em;text-transform:uppercase;color:#ffffff;text-decoration:none">${escapeHtml(label)} &nbsp;&#8599;</a></td></tr></table>`;
const img = (src, w, h, alt = '', style = '') => `<img src="${src}" width="${w}"${h ? ` height="${h}"` : ''} alt="${escapeHtml(alt)}" style="display:block;border:0;outline:none;${style}">`;
const kickerLine = (text, color = C.red) => `<p style="margin:0 0 14px;font:700 10.5px/1.4 ${SANS};letter-spacing:.3em;text-transform:uppercase;color:${color}"><span style="font-size:10px">&#9733;</span>&nbsp;&nbsp;${text}</p>`;
const yeehaw = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:34px 0 0"><tr><td align="center">${img(`${ART}/yee.jpg`, 220, 95, 'Yeehaw!', 'margin:0 auto;width:220px;height:auto')}</td></tr></table>`;

// The ticket that closes every festival email: red stub with the star and the barcode, dark main part.
function ticket(lang) {
  const l = pickLang(lang);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:8px;overflow:hidden">
    <tr>
      <td class="stub" width="128" align="center" valign="middle" bgcolor="#a60000" style="width:128px;background:#a60000;background-image:linear-gradient(180deg,#d00505,#650000);border-right:2px dashed rgba(255,255,255,.4);padding:22px 10px">
        ${img(`${ART}/isotype.png`, 44, 44, '', 'margin:0 auto 12px')}
        <p style="margin:0 0 12px;font:800 13px/1.35 ${SANS};letter-spacing:.18em;color:#ffffff">22·23·24<br>OCT 2027</p>
        ${img(`${ART}/barcode.png`, 74, 21, '', 'margin:0 auto')}
      </td>
      <td bgcolor="${C.ink2}" valign="middle" style="background:${C.ink2};padding:24px 26px">
        <p style="margin:0 0 8px;font:700 10px/1.4 ${SANS};letter-spacing:.3em;text-transform:uppercase;color:${C.accent}">&#9733;&nbsp; Barcelona Country Festival</p>
        <p style="margin:0 0 6px;font:500 27px/1.1 ${SERIF};color:${C.cream}">${escapeHtml(SEE_YOU[l])}</p>
        <p style="margin:0 0 14px;font:400 13px/1.5 ${SANS};color:${C.dim}">Fira Cornellà · Barcelona</p>
        <p style="margin:0;font:600 12px/1.6 ${SANS}"><a href="${SITE}" style="color:${C.cream};text-decoration:none">barcelonacountry.com</a> <span style="color:${C.dim}">&nbsp;·&nbsp;</span> <a href="${INSTAGRAM}" style="color:${C.cream};text-decoration:none">Instagram</a></p>
      </td>
    </tr>
  </table>`;
}

// The frame every email shares: a dark header (masthead or logo), the red festival ribbon, paper pages,
// the ticket and a quiet footer. Table layout and inline styles for Gmail, Outlook and Apple Mail.
export function layout({ lang = 'es', preheader = '', header = '', body = '', footer = '', withTicket = true }) {
  const l = pickLang(lang);
  return `<!doctype html>
<html lang="${l}" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">
<title>Barcelona Country Festival</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  body { margin:0; padding:0; background:${C.night}; }
  a { color:${C.red}; }
  @media (max-width:620px) {
    .wrap { width:100% !important; }
    .pad { padding-left:24px !important; padding-right:24px !important; }
    .title { font-size:36px !important; }
    .stub { width:92px !important; }
    .hide-sm { display:none !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.night}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.night}">${escapeHtml(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.night}" style="background:${C.night}">
<tr><td align="center" style="padding:24px 10px 44px">
  <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px">
    ${header}
    <tr><td bgcolor="${C.paper}" style="background:${C.paper};line-height:0;font-size:0">${img(`${ART}/ribbon.jpg`, 600, 70, '', 'width:100%;height:auto')}</td></tr>
    <tr><td bgcolor="${C.paper}" class="pad" style="background:${C.paper};padding:22px 48px 44px;font:400 16px/1.75 ${SANS};color:${C.text}">${body}</td></tr>
    ${withTicket ? `<tr><td bgcolor="${C.paper}" class="pad" style="background:${C.paper};padding:0 24px 24px;border-radius:0 0 8px 8px">${ticket(l)}</td></tr>` : `<tr><td bgcolor="${C.paper}" height="8" style="background:${C.paper};border-radius:0 0 8px 8px;font-size:0;line-height:0">&nbsp;</td></tr>`}
    <tr><td align="center" class="pad" style="padding:28px 44px 0;font:400 12px/1.7 ${SANS};color:${C.dim}">
      <p style="margin:0 0 10px"><a href="${SITE}" style="color:${C.cream};text-decoration:none;font-weight:700">barcelonacountry.com</a> &nbsp;·&nbsp; <a href="${INSTAGRAM}" style="color:${C.cream};text-decoration:none">Instagram</a> &nbsp;·&nbsp; <a href="mailto:${CONTACT_EMAIL}" style="color:${C.cream};text-decoration:none">${CONTACT_EMAIL}</a></p>
      ${footer}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

const logoHeader = `<tr><td bgcolor="${C.ink}" style="background:${C.ink};line-height:0;font-size:0;border-radius:8px 8px 0 0;overflow:hidden"><a href="${SITE}">${img(`${ART}/head.jpg`, 600, 200, 'Barcelona Country Festival · 22·23·24 Oct 2027 · Fira Cornellà', 'width:100%;height:auto;border-radius:8px 8px 0 0')}</a></td></tr>`;

// A newsletter issue. welcome=true adds the greeting for a brand-new subscriber (the auto email on signup).
export function issueEmail({ issue, name = '', lang = 'es', unsubscribeUrl, welcome = false }) {
  const l = pickLang(lang); const t = copy[l];
  const number = String(issue.issue_number).padStart(2, '0');
  const issueUrl = `${SITE}/newsletters/${encodeURIComponent(issue.slug)}`;
  const when = new Intl.DateTimeFormat(l, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' }).format(new Date(issue.published_at ?? issue.created_at ?? Date.now()));
  const first = String(name).trim().split(/\s+/)[0] || '';
  const greeting = first ? (welcome ? t.welcome(escapeHtml(first)) : t.hi(escapeHtml(first))) : '';
  const header = `
    <tr><td bgcolor="${C.ink}" style="background:${C.ink};line-height:0;font-size:0;border-radius:8px 8px 0 0"><a href="${SITE}/newsletters">${img(`${ART}/mast.jpg`, 600, 250, 'Barcelona Country News', 'width:100%;height:auto;border-radius:8px 8px 0 0')}</a></td></tr>
    <tr><td bgcolor="${C.ink}" class="pad" style="background:${C.ink};padding:0 36px 20px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="font:700 10.5px/1.4 ${SANS};letter-spacing:.26em;text-transform:uppercase;color:${C.dim}"><span style="color:${C.cream}">${escapeHtml(t.issue)} ${number}</span> &nbsp;<span style="color:${C.accent}">&#9733;</span>&nbsp; ${escapeHtml(when)}</td>
        <td align="right" class="hide-sm" style="font:700 10.5px/1.4 ${SANS};letter-spacing:.26em;text-transform:uppercase"><a href="${issueUrl}" style="color:${C.accent};text-decoration:none">${escapeHtml(t.read)} &#8599;</a></td>
      </tr></table>
    </td></tr>`;
  const body = `
    ${greeting ? `<p style="margin:0 0 24px;font:italic 500 21px/1.45 ${SERIF};color:${C.muted}">${greeting}</p>` : ''}
    <h1 class="title" style="margin:0 0 16px;font:500 44px/1.02 ${SERIF};color:${C.ink};letter-spacing:-.01em">${escapeHtml(issue.title)}</h1>
    ${issue.excerpt ? `<p style="margin:0 0 30px;font:italic 500 21px/1.42 ${SERIF};color:${C.muted}">${escapeHtml(issue.excerpt)}</p>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 30px"><tr><td width="56" height="3" bgcolor="${C.red}" style="background:${C.red};font-size:0;line-height:0">&nbsp;</td><td height="3" style="border-bottom:1px solid ${C.line};font-size:0;line-height:0">&nbsp;</td></tr></table>
    <div style="font:400 16px/1.75 ${SANS};color:${C.text}">${contentEmailHtml(issue.content, { assets: ART })}</div>
    ${button(issueUrl, t.read)}
    <p style="margin:16px 0 0;font:600 12px/1.6 ${SANS};letter-spacing:.14em;text-transform:uppercase"><a href="${SITE}/newsletters" style="color:${C.red};text-decoration:none">${escapeHtml(t.blog)} &rarr;</a></p>
    ${yeehaw}`;
  const footer = `<p style="margin:0 0 8px">${escapeHtml(t.why)}</p>
      <p style="margin:0"><a href="${escapeHtml(unsubscribeUrl)}" style="color:${C.cream}">${escapeHtml(t.unsub)}</a> &nbsp;·&nbsp; <a href="${SITE}/#/privacidad" style="color:${C.cream}">${escapeHtml(t.privacy)}</a></p>
      <p style="margin:12px 0 0;font-size:11px;letter-spacing:.2em;text-transform:uppercase">${escapeHtml(t.dates)}</p>`;
  const subject = welcome ? `${t.news} · ${t.issue} ${number} · ${issue.title}` : `${issue.title} · ${t.news} ${t.issue} ${number}`;
  const text = [greeting.replace(/&#39;/g, "'"), issue.title, issue.excerpt, contentPlainText(issue.content), `${t.read}: ${issueUrl}`, `${t.blog}: ${SITE}/newsletters`, '—', t.why, `${t.unsub}: ${unsubscribeUrl}`, `Barcelona Country Festival · ${t.dates} · ${CONTACT_EMAIL}`].filter(Boolean).join('\n\n');
  return { subject, html: layout({ lang: l, preheader: issue.excerpt || issue.title, header, body, footer }), text };
}

// Auto-reply to whoever writes through the contact form. Fixed text only: echoing the visitor's name or
// message would let anyone use the form to send their own words to any address from our domain.
export function contactReplyEmail({ lang = 'es' } = {}) {
  const l = pickLang(lang); const t = copy[l];
  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="bottom">${kickerLine(escapeHtml(t.replyKicker))}<h1 class="title" style="margin:0;font:500 44px/1.02 ${SERIF};color:${C.ink};letter-spacing:-.01em">${escapeHtml(t.replyTitle)}</h1></td>
      <td width="120" valign="top" align="right" class="hide-sm" style="padding-left:12px">${img(`${ART}/stamp.png`, 120, 120, '', 'width:120px;height:120px')}</td>
    </tr></table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 28px"><tr><td width="56" height="3" bgcolor="${C.red}" style="background:${C.red};font-size:0;line-height:0">&nbsp;</td><td height="3" style="border-bottom:1px solid ${C.line};font-size:0;line-height:0">&nbsp;</td></tr></table>
    <p style="margin:0 0 22px;font:400 17px/1.7 ${SANS};color:${C.text}">${escapeHtml(t.replyBody)}</p>
    <p style="margin:0;font:italic 500 21px/1.42 ${SERIF};color:${C.muted}">${escapeHtml(t.replyMore)}</p>
    ${button(SITE, t.visit)}
    <p style="margin:30px 0 0;padding-top:20px;border-top:1px solid ${C.line};font:italic 500 20px/1.4 ${SERIF};color:${C.ink}">${escapeHtml(t.sign)}</p>
    <p style="margin:4px 0 0;font:600 12px/1.6 ${SANS}"><a href="mailto:${CONTACT_EMAIL}" style="color:${C.red};text-decoration:none">${CONTACT_EMAIL}</a></p>
    ${yeehaw}`;
  const footer = `<p style="margin:0 0 8px">${escapeHtml(t.replyWhy)}</p><p style="margin:0"><a href="${SITE}/#/privacidad" style="color:${C.cream}">${escapeHtml(t.privacy)}</a></p>`;
  const text = [t.replyTitle, t.replyBody, t.replyMore, SITE, t.sign, CONTACT_EMAIL, '—', t.replyWhy].join('\n\n');
  return { subject: t.replySubject, html: layout({ lang: l, preheader: t.replyBody, header: logoHeader, body, footer }), text };
}

// Internal notice to info@ with the message; Reply-To is the sender, so answering goes straight to them.
export function contactNoticeEmail({ name, email, message, lang = 'es', receivedAt = new Date() }) {
  const when = new Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Madrid' }).format(receivedAt);
  const row = (k, v) => `<tr><td style="padding:12px 0;border-bottom:1px solid ${C.line};font:700 10.5px/1.4 ${SANS};letter-spacing:.2em;text-transform:uppercase;color:${C.muted};width:104px;vertical-align:top">${k}</td><td style="padding:12px 0;border-bottom:1px solid ${C.line};font:400 15px/1.5 ${SANS};color:${C.ink}">${v}</td></tr>`;
  const body = `
    ${kickerLine('Formulario de contacto · barcelonacountry.com')}
    <h1 class="title" style="margin:0 0 24px;font:500 40px/1.04 ${SERIF};color:${C.ink}">Nuevo mensaje de ${escapeHtml(String(name).slice(0, 80))}</h1>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;border-top:1px solid ${C.line}">
      ${row('Nombre', escapeHtml(name))}${row('Email', `<a href="mailto:${escapeHtml(email)}" style="color:${C.red}">${escapeHtml(email)}</a>`)}${row('Idioma', escapeHtml(pickLang(lang).toUpperCase()))}${row('Recibido', escapeHtml(when))}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#ffffff" style="background:#ffffff;border:1px solid ${C.line};border-radius:6px;padding:22px 24px">
      <p style="margin:0 0 10px;font:700 10.5px/1.4 ${SANS};letter-spacing:.24em;text-transform:uppercase;color:${C.red}">Mensaje</p>
      <p style="margin:0;font:400 16px/1.7 ${SANS};color:${C.ink};white-space:pre-line">${escapeHtml(message)}</p>
    </td></tr></table>
    ${button(`mailto:${email}`, 'Responder')}
    <p style="margin:14px 0 0;font:400 13px/1.6 ${SANS};color:${C.muted}">También puedes responder directamente a este correo: la respuesta irá a ${escapeHtml(email)}.</p>`;
  return {
    subject: `Contacto web · ${String(name).slice(0, 80)}`,
    html: layout({ lang: 'es', preheader: String(message).slice(0, 120), header: logoHeader, body, footer: '', withTicket: false }),
    text: `Nuevo mensaje de contacto\n\nNombre: ${name}\nEmail: ${email}\nIdioma: ${pickLang(lang)}\nRecibido: ${when}\n\n${message}`,
  };
}
