import { useEffect, useRef, useState, type RefObject } from 'react';

/** A single timer, active only while the rail is visible and unattended. */
export function useArtistCarousel(rail: RefObject<HTMLDivElement | null>) {
  const [paused, setPaused] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const direction = useRef(1);
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    let visible = false, hovered = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      clearTimeout(timer);
      if (paused || document.hidden || !visible || hovered || element.querySelector('details[open]') || element.contains(document.activeElement)) return;
      timer = setTimeout(() => {
        const first = element.children[0] as HTMLElement;
        const second = element.children[1] as HTMLElement;
        if (!first || !second) return;
        const max = element.scrollWidth - element.clientWidth;
        if (max <= 1) return;
        if (element.scrollLeft >= max - 2) direction.current = -1;
        if (element.scrollLeft <= 2) direction.current = 1;
        element.scrollBy({ left: direction.current * (second.offsetLeft - first.offsetLeft), behavior: reduced.matches ? 'instant' : 'smooth' });
        sync();
      }, 4000);
    };
    const enter = (event: PointerEvent) => { if (event.pointerType === 'mouse') { hovered = true; sync(); } };
    const leave = () => { hovered = false; sync(); };
    const interact = () => setPaused(true);
    const preference = () => { if (reduced.matches) setPaused(true); sync(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio >= .3; sync(); }, { threshold: .3, rootMargin: '-120px 0px 0px' });
    observer.observe(element);
    element.addEventListener('pointerenter', enter);
    element.addEventListener('pointerleave', leave);
    element.addEventListener('pointerdown', interact);
    element.addEventListener('focusin', interact);
    element.addEventListener('focusout', sync);
    element.addEventListener('toggle', sync, true);
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', preference);
    return () => {
      clearTimeout(timer); observer.disconnect();
      element.removeEventListener('pointerenter', enter); element.removeEventListener('pointerleave', leave);
      element.removeEventListener('pointerdown', interact); element.removeEventListener('focusin', interact);
      element.removeEventListener('focusout', sync); element.removeEventListener('toggle', sync, true);
      document.removeEventListener('visibilitychange', sync); reduced.removeEventListener('change', preference);
    };
  }, [rail, paused]);
  const slide = (direction: number) => {
    setPaused(true);
    const element = rail.current;
    if (!element) return;
    const first = element.children[0] as HTMLElement, second = element.children[1] as HTMLElement;
    if (!first || !second) return;
    element.scrollBy({ left: direction * (second.offsetLeft - first.offsetLeft), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  return { paused, toggle: () => setPaused(value => !value), slide };
}
