// HTML email templates for Barcelona Country: newsletter issues (and the welcome issue), the
// contact auto-reply and the internal contact notice. Table layout + inline styles, because that is
// what Gmail, Outlook and Apple Mail all honour. Web fonts load where supported (Apple Mail, iOS)
// and fall back to Georgia / Helvetica elsewhere.
import { contentEmailHtml, contentPlainText } from '../shared/newsletter-content.mjs';

export const SITE = 'https://www.barcelonacountry.com';
export const CONTACT_EMAIL = 'info@barcelonacountry.com';
export const PRIVACY_EMAIL = 'privacidad@barcelonacountry.com';
const LOGO = `${SITE}/assets/email-logo.png`;
const STAR = `${SITE}/assets/email-star.png`;
const INSTAGRAM = 'https://www.instagram.com/barcelonacountryfest/';

export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LANGS = ['es', 'ca', 'en', 'fr', 'it', 'de'];
export const pickLang = (lang) => (LANGS.includes(lang) ? lang : 'es');

const C = { night: '#12100d', ink: '#241a12', paper: '#f4ede1', paper2: '#ebe1cf', red: '#c40000', muted: '#6f6153', line: '#d8cbb5', cream: '#f2ead8', gold: '#c9a25a' };
const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const SANS = "'Manrope', 'Helvetica Neue', Helvetica, Arial, sans-serif";

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

const button = (href, label) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0 6px"><tr><td bgcolor="${C.red}" style="background:${C.red};border-radius:2px"><a href="${escapeHtml(href)}" style="display:inline-block;padding:15px 28px;font:700 13px/1 ${SANS};letter-spacing:.16em;text-transform:uppercase;color:#ffffff;text-decoration:none">${escapeHtml(label)} &rarr;</a></td></tr></table>`;

// The frame every email shares: dark header with the logo and the red rule, paper body, date band, footer.
export function layout({ lang = 'es', preheader = '', kicker = '', body = '', footer = '' }) {
  const t = copy[pickLang(lang)];
  return `<!doctype html>
<html lang="${pickLang(lang)}" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">
<title>Barcelona Country Festival</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  body { margin:0; padding:0; background:${C.night}; }
  a { color:${C.red}; }
  @media (max-width:620px) { .wrap { width:100% !important; } .pad { padding-left:24px !important; padding-right:24px !important; } .title { font-size:34px !important; } }
</style>
</head>
<body style="margin:0;padding:0;background:${C.night}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.night}">${escapeHtml(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.night}" style="background:${C.night}">
<tr><td align="center" style="padding:28px 12px 40px">
  <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px">
    <tr><td align="center" bgcolor="#0c0a08" style="background:#0c0a08;padding:34px 24px 26px;border-bottom:4px solid ${C.red}">
      <a href="${SITE}" style="text-decoration:none"><img src="${LOGO}" width="230" alt="Barcelona Country Festival" style="display:block;width:230px;max-width:70%;height:auto;border:0;margin:0 auto"></a>
    </td></tr>
    ${kicker ? `<tr><td bgcolor="${C.paper2}" class="pad" style="background:${C.paper2};padding:14px 44px;border-bottom:1px solid ${C.line};font:700 11px/1.4 ${SANS};letter-spacing:.22em;text-transform:uppercase;color:${C.red}">${kicker}</td></tr>` : ''}
    <tr><td bgcolor="${C.paper}" class="pad" style="background:${C.paper};padding:40px 44px 44px;font:400 16px/1.7 ${SANS};color:${C.ink}">${body}</td></tr>
    <tr><td bgcolor="${C.red}" align="center" style="background:${C.red};padding:16px 20px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="padding-right:12px"><img src="${STAR}" width="22" height="22" alt="" style="display:block;border:0"></td>
        <td style="font:700 12px/1.3 ${SANS};letter-spacing:.2em;color:#ffffff">${escapeHtml(t.dates)}</td>
      </tr></table>
    </td></tr>
    <tr><td align="center" class="pad" style="padding:30px 44px 0;font:400 12px/1.7 ${SANS};color:#a5998a">
      <p style="margin:0 0 10px"><a href="${SITE}" style="color:${C.cream};text-decoration:none;font-weight:700">barcelonacountry.com</a> &nbsp;·&nbsp; <a href="${INSTAGRAM}" style="color:${C.cream};text-decoration:none">Instagram</a> &nbsp;·&nbsp; <a href="mailto:${CONTACT_EMAIL}" style="color:${C.cream};text-decoration:none">${CONTACT_EMAIL}</a></p>
      ${footer}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

// A newsletter issue. welcome=true adds the greeting for a brand-new subscriber (the auto email on signup).
export function issueEmail({ issue, name = '', lang = 'es', unsubscribeUrl, welcome = false }) {
  const l = pickLang(lang); const t = copy[l];
  const number = String(issue.issue_number).padStart(2, '0');
  const issueUrl = `${SITE}/newsletters/${encodeURIComponent(issue.slug)}`;
  const first = String(name).trim().split(/\s+/)[0] || '';
  const greeting = first ? (welcome ? t.welcome(escapeHtml(first)) : t.hi(escapeHtml(first))) : '';
  const body = `
    ${greeting ? `<p style="margin:0 0 26px;font:italic 500 21px/1.45 ${SERIF};color:${C.muted}">${greeting}</p>` : ''}
    <h1 class="title" style="margin:0 0 14px;font:600 40px/1.08 ${SERIF};color:${C.ink};letter-spacing:-.01em">${escapeHtml(issue.title)}</h1>
    ${issue.excerpt ? `<p style="margin:0 0 28px;font:italic 500 21px/1.5 ${SERIF};color:${C.muted}">${escapeHtml(issue.excerpt)}</p>` : ''}
    <table role="presentation" width="64" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px"><tr><td height="3" bgcolor="${C.red}" style="background:${C.red};font-size:0;line-height:0">&nbsp;</td></tr></table>
    <div style="font:400 16px/1.75 ${SANS};color:${C.ink}">${contentEmailHtml(issue.content)}</div>
    ${button(issueUrl, t.read)}
    <p style="margin:18px 0 0;font:400 14px/1.6 ${SANS}"><a href="${SITE}/newsletters" style="color:${C.red}">${escapeHtml(t.blog)}</a></p>`;
  const footer = `<p style="margin:0 0 8px">${escapeHtml(t.why)}</p>
      <p style="margin:0"><a href="${escapeHtml(unsubscribeUrl)}" style="color:#d9cdbb">${escapeHtml(t.unsub)}</a> &nbsp;·&nbsp; <a href="${SITE}/#/privacidad" style="color:#d9cdbb">${escapeHtml(t.privacy)}</a></p>`;
  const subject = welcome ? `${t.news} · ${t.issue} ${number} · ${issue.title}` : `${issue.title} · ${t.news} ${t.issue} ${number}`;
  const text = [greeting.replace(/&#39;/g, "'"), issue.title, issue.excerpt, contentPlainText(issue.content), `${t.read}: ${issueUrl}`, `${t.blog}: ${SITE}/newsletters`, '—', t.why, `${t.unsub}: ${unsubscribeUrl}`, `Barcelona Country Festival · ${t.dates} · ${CONTACT_EMAIL}`].filter(Boolean).join('\n\n');
  return { subject, html: layout({ lang: l, preheader: issue.excerpt || issue.title, kicker: `${escapeHtml(t.news)} &nbsp;·&nbsp; ${escapeHtml(t.issue)} ${number}`, body, footer }), text };
}

// Auto-reply to whoever writes through the contact form. Fixed text only: echoing the visitor's name or
// message would let anyone use the form to send their own words to any address from our domain.
export function contactReplyEmail({ lang = 'es' } = {}) {
  const l = pickLang(lang); const t = copy[l];
  const body = `
    <h1 class="title" style="margin:0 0 18px;font:600 40px/1.08 ${SERIF};color:${C.ink}">${escapeHtml(t.replyTitle)}</h1>
    <p style="margin:0 0 26px">${escapeHtml(t.replyBody)}</p>
    <p style="margin:0">${escapeHtml(t.replyMore)}</p>
    ${button(SITE, t.visit)}
    <p style="margin:26px 0 0;font:italic 500 19px/1.4 ${SERIF};color:${C.muted}">${escapeHtml(t.sign)}</p>`;
  const footer = `<p style="margin:0 0 8px">${escapeHtml(t.replyWhy)}</p><p style="margin:0"><a href="${SITE}/#/privacidad" style="color:#d9cdbb">${escapeHtml(t.privacy)}</a></p>`;
  const text = [t.replyTitle, t.replyBody, t.replyMore, SITE, t.sign, '—', t.replyWhy].join('\n\n');
  return { subject: t.replySubject, html: layout({ lang: l, preheader: t.replyBody, kicker: escapeHtml(t.replyKicker), body, footer }), text };
}

// Internal notice to info@ with the message; Reply-To is the sender, so answering goes straight to them.
export function contactNoticeEmail({ name, email, message, lang = 'es', receivedAt = new Date() }) {
  const when = new Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Madrid' }).format(receivedAt);
  const row = (k, v) => `<tr><td style="padding:10px 0;border-bottom:1px solid ${C.line};font:700 11px/1.4 ${SANS};letter-spacing:.16em;text-transform:uppercase;color:${C.muted};width:110px;vertical-align:top">${k}</td><td style="padding:10px 0;border-bottom:1px solid ${C.line};font:400 15px/1.5 ${SANS};color:${C.ink}">${v}</td></tr>`;
  const body = `
    <h1 class="title" style="margin:0 0 22px;font:600 34px/1.1 ${SERIF};color:${C.ink}">Nuevo mensaje de contacto</h1>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px">
      ${row('Nombre', escapeHtml(name))}${row('Email', `<a href="mailto:${escapeHtml(email)}" style="color:${C.red}">${escapeHtml(email)}</a>`)}${row('Idioma', escapeHtml(pickLang(lang).toUpperCase()))}${row('Recibido', escapeHtml(when))}
    </table>
    <p style="margin:0;padding:20px 22px;background:${C.paper2};border-left:3px solid ${C.red};font:400 16px/1.65 ${SANS};white-space:pre-line">${escapeHtml(message)}</p>
    <p style="margin:22px 0 0;font:400 13px/1.6 ${SANS};color:${C.muted}">Responde a este correo y la respuesta irá directamente a ${escapeHtml(email)}.</p>`;
  return {
    subject: `Contacto web · ${String(name).slice(0, 80)}`,
    html: layout({ lang: 'es', preheader: String(message).slice(0, 120), kicker: 'Formulario de contacto · barcelonacountry.com', body, footer: '' }),
    text: `Nuevo mensaje de contacto\n\nNombre: ${name}\nEmail: ${email}\nIdioma: ${pickLang(lang)}\nRecibido: ${when}\n\n${message}`,
  };
}
