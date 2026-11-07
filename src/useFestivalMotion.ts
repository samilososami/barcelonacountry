import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function useFestivalMotion(language: string) {
  const scope = useRef<HTMLDivElement>(null);
  const smoothScroll = useRef<Lenis | null>(null);
  useGSAP(() => {
    const root = scope.current;
    if (!root) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({ duration: 1.05, smoothWheel: true, anchors: true });
      smoothScroll.current = lenis;
      const tick = (time: number) => lenis.raf(time * 1000);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro.from(".c-hero-title > span", { yPercent: 110, opacity: 0, duration: 1.25, stagger: .16 })
        .from(".c-hero-date, .c-hero-actions", { y: 16, opacity: 0, duration: .8, stagger: .1 }, "-=.7");
      gsap.to(".c-hero-photo", { yPercent: 16, scale: 1.06, ease: "none", scrollTrigger: { trigger: ".c-hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".c-hero-content", { yPercent: 18, opacity: .12, ease: "none", scrollTrigger: { trigger: ".c-hero", start: "35% top", end: "bottom top", scrub: true } });
      gsap.utils.toArray<HTMLElement>("[data-reveal]", root).forEach(element => {
        gsap.from(element, { y: 42, opacity: 0, duration: .95, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 92%", once: true } });
      });
      gsap.utils.toArray<HTMLElement>(".c-parallax", root).forEach(element => {
        gsap.fromTo(element, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: element.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });
      const update = () => ScrollTrigger.refresh();
      const images = Array.from(root.querySelectorAll("img"));
      images.forEach(img => img.addEventListener("load", update, { once: true }));
      // Native disclosures change height. Refresh only after a layout change, not every frame.
      root.addEventListener("toggle", update, true);
      let active = true;
      document.fonts.ready.then(() => { if (active) update(); });
      return () => {
        active = false;
        images.forEach(img => img.removeEventListener("load", update));
        root.removeEventListener("toggle", update, true);
        gsap.ticker.remove(tick);
        lenis.destroy();
        smoothScroll.current = null;
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
