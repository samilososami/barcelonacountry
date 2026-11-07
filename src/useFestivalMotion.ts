import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);
type DeviceNavigator = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

export function useFestivalMotion(language: string) {
  const scope = useRef<HTMLDivElement>(null);
  const smoothScroll = useRef<Lenis | null>(null);
  useGSAP(() => {
    const root = scope.current;
    if (!root) return;
    const media = gsap.matchMedia();
    media.add({ reduced: "(prefers-reduced-motion: reduce)", desktop: "(min-width: 761px) and (pointer: fine)", all: "all" }, context => {
      const { reduced, desktop } = context.conditions!;
      const device = navigator as DeviceNavigator;
      const constrained = device.connection?.saveData || (device.hardwareConcurrency > 0 && device.hardwareConcurrency <= 4) || (device.deviceMemory !== undefined && device.deviceMemory <= 4);
      let full = Boolean(desktop && !reduced && !constrained);
      root.dataset.motion = reduced ? "reduced" : full ? "full" : "light";
      if (reduced) return;

      // Entrance is finite. Content is visible by default if JS/motion is unavailable.
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (full) {
        intro.fromTo(".c-hero-curtain", { scaleX: 1 }, { scaleX: 0, duration: 1.25, ease: "power3.inOut", stagger: .06 }, 0)
          .fromTo(".c-hero-photo", { scale: 1.12 }, { scale: 1, duration: 1.9, ease: "power2.out" }, 0)
          .fromTo(".c-hero-light", { xPercent: -20, opacity: 0 }, { xPercent: 15, opacity: 1, duration: 1.8 }, .3)
          .to(".c-hero-light", { opacity: 0, duration: .7 }, 2);
      }
      intro.from(".c-title-line > *", { yPercent: full ? 115 : 20, opacity: 0, rotation: full ? 2 : 0, duration: full ? 1.25 : .7, stagger: .13 }, full ? .4 : 0)
        .from(".c-hero-eyebrow, .c-hero-date, .c-hero-actions", { y: 16, opacity: 0, duration: .7, stagger: .08 }, full ? 1 : .25);

      gsap.utils.toArray<HTMLElement>("[data-reveal]", root).forEach(element => {
        gsap.from(element, { y: full ? 36 : 14, opacity: 0, duration: full ? .85 : .5, scrollTrigger: { trigger: element, start: "top 94%", once: true } });
      });
      gsap.from(".c-stats > div", { y: full ? 35 : 12, opacity: 0, duration: .7, stagger: .12, scrollTrigger: { trigger: ".c-stats", start: "top 92%", once: true } });

      let lenis: Lenis | null = null;
      const tick = (time: number) => lenis?.raf(time * 1000);
      const depth = gsap.context(() => {
        if (!full) return;
        lenis = new Lenis({ duration: 1, smoothWheel: true, anchors: true });
        smoothScroll.current = lenis;
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(tick);
        gsap.to(".c-hero-photo", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".c-hero", start: "top top", end: "bottom top", scrub: true } });
        gsap.to(".c-hero-content", { yPercent: 14, opacity: .1, ease: "none", scrollTrigger: { trigger: ".c-hero", start: "35% top", end: "bottom top", scrub: true } });
        gsap.utils.toArray<HTMLElement>(".c-parallax", root).forEach(element => {
          gsap.fromTo(element, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: element.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
        });
      }, root);
      const stopDepth = () => {
        full = false;
        depth.revert();
        gsap.ticker.remove(tick);
        lenis?.destroy(); lenis = null; smoothScroll.current = null;
        root.dataset.motion = "light";
      };
      // A bounded real-frame sample also catches older machines with missing hardware hints.
      // No permanent performance loop, fingerprint, storage or telemetry.
      let frame = 0, last = 0, samples = 0, elapsed = 0;
      const sample = (now: number) => {
        if (!full || document.hidden) { frame = 0; last = 0; return; }
        if (last) { const dt = now - last; elapsed += Math.min(dt, 100); samples++; }
        last = now;
        if (samples < 90) frame = requestAnimationFrame(sample);
        else { frame = 0; if (elapsed / samples > 28) stopDepth(); }
      };
      if (full) frame = requestAnimationFrame(sample);
      const onVisibility = () => {
        if (document.hidden) { lenis?.stop(); intro.pause(); cancelAnimationFrame(frame); frame = 0; last = 0; }
        else { lenis?.start(); intro.resume(); if (full && samples < 90) frame = requestAnimationFrame(sample); }
      };
      document.addEventListener("visibilitychange", onVisibility);

      let refreshFrame = 0, active = true;
      const update = () => { cancelAnimationFrame(refreshFrame); refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh()); };
      const images = Array.from(root.querySelectorAll("img"));
      images.forEach(img => { if (!img.complete) img.addEventListener("load", update, { once: true }); });
      root.addEventListener("toggle", update, true);
      document.fonts.ready.then(() => { if (active) update(); });
      return () => {
        active = false;
        cancelAnimationFrame(frame); cancelAnimationFrame(refreshFrame);
        document.removeEventListener("visibilitychange", onVisibility);
        images.forEach(img => img.removeEventListener("load", update));
        root.removeEventListener("toggle", update, true);
        depth.revert();
        gsap.ticker.remove(tick);
        lenis?.destroy(); smoothScroll.current = null;
      };
    });
    return () => media.revert();
  }, { scope, dependencies: [language], revertOnUpdate: true });
  const scrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    if (smoothScroll.current) smoothScroll.current.scrollTo(target);
    else target.scrollIntoView({ behavior: "instant", block: "start" });
  };
  return { scope, scrollTo };
}
