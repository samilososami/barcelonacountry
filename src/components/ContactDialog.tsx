import { useEffect, useRef, type FormEvent } from 'react';
import type { NewsLanguage } from '../newsletters/copy';
import { refinementCopy } from '../lib/refinement-copy';
import { ArrowIcon } from './ArrowIcon';

export function ContactDialog({ open, onClose, language, nameLabel, emailLabel }: {
  open: boolean; onClose: () => void; language: NewsLanguage; nameLabel: string; emailLabel: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const copy = refinementCopy[language];
  useEffect(() => {
    if (!open) { dialog.current?.close(); return; }
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.showModal();
    return () => { document.body.style.overflow = overflow; dialog.current?.close(); };
  }, [open]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }
  return <dialog ref={dialog} className="c-contact-dialog" aria-labelledby="c-inquiry-title" data-lenis-prevent onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="c-inquiry">
      <button type="button" className="c-dialog-close" onClick={onClose} aria-label={copy.close}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg></button>
      <div className="c-inquiry-heading"><p className="c-kicker">Barcelona Country Festival</p><h2 id="c-inquiry-title">{copy.contactTitle}</h2><p>{copy.message}</p></div>
      <form className="c-form" onSubmit={submit}>
        <label htmlFor="inquiry-name">{nameLabel}<input id="inquiry-name" name="name" autoComplete="name" required maxLength={160} /></label>
        <label htmlFor="inquiry-email">{emailLabel}<input id="inquiry-email" name="email" type="email" autoComplete="email" required maxLength={320} /></label>
        <label htmlFor="inquiry-message">{copy.message}<textarea id="inquiry-message" name="message" rows={4} required maxLength={5000} /></label>
        <button type="submit" className="c-submit"><span>{copy.send}</span><ArrowIcon /></button>
      </form>
    </div>
  </dialog>;
}
