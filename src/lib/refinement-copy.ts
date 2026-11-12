import type { NewsLanguage } from '../newsletters/copy';

export const refinementCopy: Record<NewsLanguage, {
  gallery: string; soon: string; pause: string; play: string; contact: string; contactTitle: string; message: string; send: string; close: string;
  preview: string; pending: string; newsletter: string; directions: string;
  countdown: string; units: [string, string, string, string]; started: string;
  storyBefore: string; storyAfter: string;
}> = {
  es: {
    gallery: 'Galería', soon: 'Próximamente', pause: 'Pausar', play: 'Reanudar',
    contact: 'Contacto', contactTitle: 'Hablemos.', message: 'Coméntanos o pregúntanos lo que quieras.', send: 'Enviar', close: 'Cerrar contacto',
    preview: 'Formulario de prueba. El envío de consultas todavía no está habilitado.', pending: 'El formulario está listo. Todavía no se ha enviado tu mensaje.', newsletter: 'Newsletter', directions: 'Cómo llegar',
    countdown: 'Nos vemos en', units: ['Días', 'Horas', 'Minutos', 'Segundos'], started: 'Ha llegado el día.',
    storyBefore: 'La canción que te hace salir a bailar. Una coreografía que por fin compartes con su creador. Ese último baile que siempre acaba en otro. Eso te espera en ',
    storyAfter: ': tres días de workshows para aprender nuevas coreografías, música en directo y encuentros alrededor de la pista. Ven con tus amigos, descubre el ambiente western y haz una pausa entre food trucks y barbacoa americana. Luego, vuelve a bailar.'
  },
  ca: {
    gallery: 'Galeria', soon: 'Properament', pause: 'Pausa', play: 'Reprèn',
    contact: 'Contacte', contactTitle: 'Parlem.', message: 'Comenta’ns o pregunta’ns el que vulguis.', send: 'Enviar', close: 'Tanca el contacte',
    preview: 'Formulari de prova. L’enviament de consultes encara no està habilitat.', pending: 'El formulari està a punt. Encara no s’ha enviat el teu missatge.', newsletter: 'Newsletter', directions: 'Com arribar-hi',
    countdown: 'Ens veiem en', units: ['Dies', 'Hores', 'Minuts', 'Segons'], started: 'Ha arribat el dia.',
    storyBefore: 'La cançó que et fa sortir a ballar. Una coreografia que finalment comparteixes amb el seu creador. Aquell últim ball que sempre acaba en un altre. Això t’espera a ',
    storyAfter: ': tres dies de workshows per aprendre noves coreografies, música en directe i trobades al voltant de la pista. Vine amb els amics, descobreix l’ambient western i fes una pausa entre food trucks i barbacoa americana. Després, torna a ballar.'
  },
  en: {
    gallery: 'Gallery', soon: 'Coming soon', pause: 'Pause', play: 'Resume',
    contact: 'Contact', contactTitle: 'Let’s talk.', message: 'Tell us what’s on your mind or ask us a question.', send: 'Send', close: 'Close contact',
    preview: 'Preview form. Enquiries cannot be sent yet.', pending: 'The form is ready. Your message has not been sent yet.', newsletter: 'Newsletter', directions: 'Get directions',
    countdown: 'See you in', units: ['Days', 'Hours', 'Minutes', 'Seconds'], started: 'The day is here.',
    storyBefore: 'The song that gets you on the dance floor. A choreography you finally share with its creator. That last dance that always turns into one more. That’s what awaits you at ',
    storyAfter: ': three days of dance workshows where you can learn new choreographies, live music and meeting people around the dance floor. Bring your friends, discover the western atmosphere and take a break with food trucks and American barbecue. Then, get back to dancing.'
  },
  fr: {
    gallery: 'Galerie', soon: 'Bientôt', pause: 'Pause', play: 'Reprendre',
    contact: 'Contact', contactTitle: 'Parlons-en.', message: 'Dites-nous ce que vous souhaitez ou posez-nous une question.', send: 'Envoyer', close: 'Fermer le contact',
    preview: 'Formulaire de démonstration. L’envoi de demandes n’est pas encore activé.', pending: 'Le formulaire est prêt. Votre message n’a pas encore été envoyé.', newsletter: 'Newsletter', directions: 'Itinéraire',
    countdown: 'Rendez-vous dans', units: ['Jours', 'Heures', 'Minutes', 'Secondes'], started: 'Le jour est arrivé.',
    storyBefore: 'La chanson qui vous fait entrer sur la piste. Une chorégraphie que vous partagez enfin avec son créateur. Cette dernière danse qui en appelle toujours une autre. Voilà ce qui vous attend au ',
    storyAfter: ' : trois jours de workshows pour apprendre de nouvelles chorégraphies, de musique live et de rencontres autour de la piste. Venez avec vos amis, découvrez l’ambiance western et faites une pause entre food trucks et barbecue américain. Puis, retournez danser.'
  },
  it: {
    gallery: 'Galleria', soon: 'Prossimamente', pause: 'Pausa', play: 'Riprendi',
    contact: 'Contatti', contactTitle: 'Parliamone.', message: 'Scrivici quello che vuoi o facci una domanda.', send: 'Invia', close: 'Chiudi contatti',
    preview: 'Modulo di prova. L’invio delle richieste non è ancora attivo.', pending: 'Il modulo è pronto. Il tuo messaggio non è ancora stato inviato.', newsletter: 'Newsletter', directions: 'Come arrivare',
    countdown: 'Ci vediamo tra', units: ['Giorni', 'Ore', 'Minuti', 'Secondi'], started: 'Il giorno è arrivato.',
    storyBefore: 'La canzone che ti fa scendere in pista. Una coreografia che finalmente condividi con il suo creatore. Quell’ultimo ballo che diventa sempre un altro ancora. È ciò che ti aspetta al ',
    storyAfter: ': tre giorni di workshow per imparare nuove coreografie, musica dal vivo e incontri intorno alla pista. Vieni con gli amici, scopri l’atmosfera western e fai una pausa tra food truck e barbecue americano. Poi, torna a ballare.'
  },
  de: {
    gallery: 'Galerie', soon: 'Demnächst', pause: 'Pause', play: 'Fortsetzen',
    contact: 'Kontakt', contactTitle: 'Schreib uns.', message: 'Sag uns, was dich beschäftigt, oder stell uns eine Frage.', send: 'Senden', close: 'Kontakt schließen',
    preview: 'Testformular. Anfragen können noch nicht gesendet werden.', pending: 'Das Formular ist bereit. Deine Nachricht wurde noch nicht gesendet.', newsletter: 'Newsletter', directions: 'Anfahrt',
    countdown: 'Wir sehen uns in', units: ['Tagen', 'Stunden', 'Minuten', 'Sekunden'], started: 'Der Tag ist da.',
    storyBefore: 'Der Song, der dich auf die Tanzfläche zieht. Eine Choreografie, die du endlich mit ihrem Schöpfer tanzt. Dieser letzte Tanz, auf den immer noch einer folgt. Das erwartet dich beim ',
    storyAfter: ': drei Tage mit Workshows, in denen neue Choreografien vermittelt werden, Livemusik und Begegnungen rund um die Tanzfläche. Komm mit Freunden, entdecke die Western-Atmosphäre und gönn dir eine Pause mit Foodtrucks und amerikanischem Barbecue. Danach geht es zurück zum Tanzen.'
  }
};
