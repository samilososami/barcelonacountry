import { useEffect, useRef, useState } from 'react';
import type { NewsLanguage } from '../newsletters/copy';
import { refinementCopy } from '../lib/refinement-copy';

// Countdown to the calendar date in Barcelona, not an unconfirmed opening time.
export const FESTIVAL_DATE = Date.parse('2027-10-22T00:00:00+02:00');
export function FestivalCountdown({ language }: { language: NewsLanguage }) {
  const [now, setNow] = useState(Date.now);
  const root = useRef<HTMLDivElement>(null);
  const copy = refinementCopy[language];
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let visible = true;
    const sync = () => {
      clearInterval(timer);
      if (!visible || document.hidden) return;
      setNow(Date.now());
      if (Date.now() < FESTIVAL_DATE) timer = setInterval(() => {
        const time = Date.now(); setNow(time);
        if (time >= FESTIVAL_DATE) clearInterval(timer);
      }, 1000);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    if (root.current) observer.observe(root.current);
    document.addEventListener('visibilitychange', sync); sync();
    return () => { clearInterval(timer); observer.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, []);
  const seconds = Math.max(0, Math.floor((FESTIVAL_DATE - now) / 1000));
  const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
  return <div ref={root} className="c-countdown" role="timer" aria-live="off" aria-label={`${copy.countdown} ${values.map((n, i) => `${n} ${copy.units[i]}`).join(', ')}`}>
    {seconds === 0 && <p>{copy.started}</p>}
    <div className="c-countdown-digits" aria-hidden="true">{values.map((value, index) => <div className="c-countdown-unit" key={index}>
      <span className="c-countdown-window"><span className="c-countdown-number" key={value}><strong>{String(value).padStart(2, '0')}</strong></span><i className="c-countdown-seam" /></span><small>{copy.units[index]}</small>
    </div>)}</div>
  </div>;
}
