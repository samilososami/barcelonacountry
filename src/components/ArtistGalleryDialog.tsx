import { useEffect, useRef, useState } from 'react';
import type { NewsLanguage } from '../newsletters/copy';
import { ArrowIcon } from './ArrowIcon';

const galleryDialogCopy: Record<NewsLanguage, {
  close: string;
  previous: string;
  next: string;
  photo: string;
}> = {
  es: { close: 'Cerrar galería', previous: 'Foto anterior', next: 'Foto siguiente', photo: 'Foto' },
  ca: { close: 'Tanca la galeria', previous: 'Foto anterior', next: 'Foto següent', photo: 'Foto' },
  en: { close: 'Close gallery', previous: 'Previous photo', next: 'Next photo', photo: 'Photo' },
  fr: { close: 'Fermer la galerie', previous: 'Photo précédente', next: 'Photo suivante', photo: 'Photo' },
  it: { close: 'Chiudi la galleria', previous: 'Foto precedente', next: 'Foto successiva', photo: 'Foto' },
  de: { close: 'Galerie schließen', previous: 'Vorheriges Foto', next: 'Nächstes Foto', photo: 'Foto' }
};

export function ArtistGalleryDialog({ artistName, images, language, onClose }: {
  artistName: string;
  images: string[];
  language: NewsLanguage;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const copy = galleryDialogCopy[language];
  const hasSeveralImages = images.length > 1;

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      element.close();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!hasSeveralImages) return;
      if (event.key === 'ArrowLeft') setActiveIndex(index => (index - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight') setActiveIndex(index => (index + 1) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasSeveralImages, images.length]);

  const move = (direction: -1 | 1) => {
    setActiveIndex(index => (index + direction + images.length) % images.length);
  };

  return <dialog
    ref={dialog}
    className="c-artist-gallery-dialog"
    aria-labelledby="c-artist-gallery-title"
    data-lenis-prevent
    onCancel={onClose}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}
  >
    <div className="c-artist-gallery-shell">
      <header className="c-artist-gallery-header">
        <div>
          <p>Barcelona Country Festival</p>
          <h2 id="c-artist-gallery-title">{artistName}</h2>
        </div>
        <p className="c-artist-gallery-count" aria-live="polite">
          <span>{String(activeIndex + 1).padStart(2, '0')}</span>
          <i>/</i>
          <span>{String(images.length).padStart(2, '0')}</span>
        </p>
        <button type="button" className="c-artist-gallery-close" onClick={onClose} aria-label={copy.close} autoFocus>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
        </button>
      </header>

      <div className="c-artist-gallery-stage">
        <figure>
          <img
            key={images[activeIndex]}
            src={images[activeIndex]}
            alt={`${artistName} · ${copy.photo} ${activeIndex + 1}`}
            decoding="async"
          />
        </figure>
        {hasSeveralImages ? <>
          <button type="button" className="c-artist-gallery-arrow is-previous" onClick={() => move(-1)} aria-label={copy.previous}>
            <ArrowIcon direction="left" />
          </button>
          <button type="button" className="c-artist-gallery-arrow is-next" onClick={() => move(1)} aria-label={copy.next}>
            <ArrowIcon />
          </button>
        </> : null}
      </div>

      {hasSeveralImages ? <div className="c-artist-gallery-thumbnails" aria-label={`${artistName} · ${images.length}`}>
        {images.map((image, index) => <button
          type="button"
          key={image}
          className={index === activeIndex ? 'is-active' : ''}
          aria-label={`${copy.photo} ${index + 1}`}
          aria-pressed={index === activeIndex}
          onClick={() => setActiveIndex(index)}
        >
          <img src={image} alt="" loading="lazy" decoding="async" />
          <span>{String(index + 1).padStart(2, '0')}</span>
        </button>)}
      </div> : null}
    </div>
  </dialog>;
}
