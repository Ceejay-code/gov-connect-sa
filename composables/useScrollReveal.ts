import { onBeforeUnmount, onMounted, type Ref } from "vue";

/**
 * Animates elements marked with `data-reveal` as they enter the viewport.
 */
export function useScrollReveal(containerRef: Ref<HTMLElement | null>) {
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    const root = containerRef.value;
    if (!root || typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (targets.length === 0) return;

    const viewportBottom = window.innerHeight * 0.92;
    for (const el of targets) {
      const rect = el.getBoundingClientRect();
      if (rect.top > viewportBottom) {
        el.classList.add("reveal-pending");
      }
    }

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.remove("reveal-pending");
          el.classList.add("reveal-visible");
          observer?.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -36px 0px" },
    );

    for (const el of targets) {
      if (el.classList.contains("reveal-pending")) {
        observer.observe(el);
      }
    }
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
  });
}
